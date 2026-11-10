# Deterministic key frames and a GIF per dress: the scene's clock is frozen (PMC.rest) and stepped by hand.
#   python3 tests/e2e/make_fixtures.py && python3 -I tests/e2e/final.py /tmp/final3
import sys, json, io, os; sys.path.insert(0,'tests/e2e')
exec(open('tests/e2e/states.py').read().split("with sync_playwright")[0])
from PIL import Image
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/final3'; os.makedirs(OUT,exist_ok=True)
D={'ivory-lace':'tests/e2e/out/dress_ivory.jpg','blush-satin':'tests/e2e/out/dress_blush.jpg','champagne-lace':'tests/e2e/out/dress_champagne.jpg','emerald-satin':'tests/e2e/out/dress_emerald.jpg'}
P0=.82
def sm(a,b,x):
    x=max(0,min(1,(x-a)/(b-a))); return x*x*(3-2*x)
def build_p(x): return .8*(1-(1-x)**1.7)
SET="""(a)=>{PMC.mode=a.mode;PMC.p=a.p;PMC.t=a.t;PMC.ct=a.ct||0;PMC.hold=!!a.hold;PMC.rest('')}"""
def grab(pg):
    pg.wait_for_timeout(60)
    pg.evaluate("document.querySelector('.pm__lines').querySelectorAll('span').forEach(s=>s.style.transition='none')")
    r=pg.evaluate("()=>{var b=document.querySelector('.pm__cap').getBoundingClientRect(),m=document.querySelector('.pm__stack').getBoundingClientRect();return {x:0,y:Math.max(0,m.top-14),width:innerWidth,height:b.bottom-m.top+24,sw:document.documentElement.scrollWidth,sx:scrollX}}")
    if r['sw']>r['width'] or r['sx']: print('OVERFLOW',r,pg.evaluate("""()=>{var o=[];document.querySelectorAll('*').forEach(e=>{var r=e.getBoundingClientRect();if(r.right>400||r.left<-5)o.push(e.tagName+'.'+e.className+' '+Math.round(r.right))});return o.slice(0,14)}"""))
    return Image.open(io.BytesIO(pg.screenshot(clip={k:r[k] for k in('x','y','width','height')}))).convert('RGB')
def build(pg,x): pg.evaluate(SET,{'mode':'build','p':build_p(x),'t':x*42,'hold':x>=1}); return grab(pg)
def climax(pg,ct): pg.evaluate(SET,{'mode':'climax','p':P0+(1-P0)*sm(.95,2.0,ct),'t':42+ct,'ct':ct}); return grab(pg)
with sync_playwright() as p:
    b=p.chromium.launch(); logs=[]
    for k,f in D.items():
        ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=1,bypass_csp=True); pg=ctx.new_page()
        ctx.add_init_script("Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8})")
        pg.on('console',lambda m:logs.append(m.text) if m.type=='error' and '401' not in m.text else None); pg.on('pageerror',lambda e:logs.append(str(e)))
        job=Job(); install(pg,job,{k:f}); upload_bride(pg); choose_ref(pg,k); pg.click('[data-act=generate]'); pg.wait_for_selector('.pm.is-run')
        pg.evaluate("document.querySelector('.pm').scrollIntoView({block:'center'})"); pg.wait_for_timeout(1200)  # palette, soft copy
        print(k,'accent',pg.evaluate("()=>getComputedStyle(document.querySelector('.pm')).getPropertyValue('--glw')+' | '+getComputedStyle(document.querySelector('.pm')).getPropertyValue('--dot')"))
        keys={}
        keys['0']=build(pg,0)
        for lab,x in (('25',.25),('50',.5),('75',.75),('90',.9)): keys[lab]=build(pg,x)
        gif=[build(pg,i/29) for i in range(30)]
        # the real finish, then freeze the clock in the climax
        job.state='success'; pg.wait_for_function("PMC&&(PMC.mode==='ff'||PMC.mode==='climax')",timeout=20000)
        pg.wait_for_function("PMC.url&&PMC.S.res.complete&&PMC.S.res.naturalWidth&&PMC.S.rsoft.src",timeout=10000)
        gf=[]
        for i in range(46):
            ct=i*.06; fr=climax(pg,ct); gf.append(fr)
            if abs(ct-.18)<.031: keys['glimpse']=fr
            if abs(ct-1.08)<.031: keys['flash']=fr
            if abs(ct-1.62)<.031: keys['lift']=fr
        keys['reveal']=climax(pg,2.7)
        for lab,im in keys.items(): im.save(f'{OUT}/{k}_{lab}.png')
        order=['0','25','50','75','90','glimpse','flash','lift','reveal']; w=300
        ims=[keys[o].resize((w,int(keys[o].height*w/keys[o].width))) for o in order]
        sheet=Image.new('RGB',(w*len(ims),ims[0].height),'white')
        for i,im in enumerate(ims): sheet.paste(im,(i*w,0))
        sheet.save(f'{OUT}/{k}_sheet.png')
        gw=280; seq=[g.resize((gw,int(g.height*gw/g.width))) for g in gif+gf]
        seq[0].save(f'{OUT}/{k}.gif',save_all=True,append_images=seq[1:],duration=[150]*len(gif)+[70]*len(gf),loop=0,optimize=True)
        ctx.close()
    print('console errors:',logs); b.close()
