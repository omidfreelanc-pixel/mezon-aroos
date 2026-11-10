import sys, json; sys.path.insert(0,'tests/e2e')
exec(open('tests/e2e/states.py').read().split("with sync_playwright")[0])
from PIL import Image
import io, os
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/final2'
D={'ivory':'tests/e2e/out/dress_ivory.jpg','blush':'tests/e2e/out/dress_blush.jpg','emerald':'tests/e2e/out/dress_emerald.jpg'}
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=1,bypass_csp=True); pg=ctx.new_page()
    ctx.add_init_script("Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8})")
    logs=[]; pg.on('console',lambda m:logs.append(m.text) if m.type=='error' and '401' not in m.text else None); pg.on('pageerror',lambda e:logs.append(str(e)))
    job=Job(); install(pg,job,D); upload_bride(pg)
    for k in D:
        pg.evaluate("()=>{state.result=null;state.busy=false;state.error='';state.gen=null;state.idem=null;if(state.quota&&state.quota.left)state.quota.left.dress=99}")
        job.state='running'; choose_ref(pg,k); pg.click('[data-act=generate]'); pg.wait_for_timeout(300)
        pg.evaluate("document.querySelector('.pm').scrollIntoView({block:'center'})")
        frames=[]
        def snap(label=None):
            im=Image.open(io.BytesIO(pg.locator('.pm').screenshot())).convert('RGB'); frames.append(im)
            if label: im.save(f'{OUT}/{k}_{label}.png')
        for i,(t,lab) in enumerate([(2.0,'1_early'),(6.0,'2_mid'),(10.0,'3_late')]):
            pg.wait_for_timeout(int(t*1000) if i==0 else int(4000)); snap(lab)
        pg.evaluate("()=>{state.genT0=Date.now()-60000;PMC.t0=state.genT0}"); pg.wait_for_timeout(1500); snap('4_hold')
        job.state='success'; pg.wait_for_function("PMC&&PMC.mode==='climax'",timeout=15000)
        n=0
        while n<16:
            try: snap('5_climax' if n==5 else None)
            except Exception: break
            n+=1
        pg.wait_for_function("state.result",timeout=15000); pg.wait_for_timeout(500)
        pg.evaluate("document.querySelector('.compare').scrollIntoView({block:'center'})"); pg.wait_for_timeout(300)
        pg.screenshot(path=f'{OUT}/{k}_6_result.png')
        # gif of the whole run (frames captured at irregular intervals; resample)
        w=frames[0].width//2; fr=[f.resize((w,int(f.height*w/f.width))) for f in frames]
        fr[0].save(f'{OUT}/{k}_scene.gif',save_all=True,append_images=fr[1:],duration=450,loop=0)
        if k!=list(D)[-1]: pg.evaluate("()=>{go(2)}")
    print('console errors:',logs)
    b.close()
# comparison sheet: 3 dresses x stages
rows=[]
for k in D:
    ims=[Image.open(f'{OUT}/{k}_{s}.png').convert('RGB') for s in ('1_early','2_mid','3_late','4_hold','5_climax')]
    ims=[i.resize((i.width*2//3,i.height*2//3)) for i in ims]; rows.append(ims)
W=sum(i.width for i in rows[0]); Hh=sum(max(i.height for i in r) for r in rows)
sheet=Image.new('RGB',(W,Hh),'white'); y=0
for r in rows:
    x=0
    for i in r: sheet.paste(i,(x,y)); x+=i.width
    y+=max(i.height for i in r)
sheet.save(f'{OUT}/compare_3_dresses.png'); print(sheet.size)
