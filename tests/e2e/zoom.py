import sys, json; sys.path.insert(0,'tests/e2e')
exec(open('tests/e2e/states.py').read().split("with sync_playwright")[0])
JS="""()=>{
 const R=e=>{const r=e.getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom}};
 const z=document.querySelector('.zoomx'); if(!z) return {err:'no zoomx'};
 const zr=R(z), out={zoom:zr};
 const glass=document.querySelector('.compare'); out.glass=R(glass);
 const hit=(a,b)=>!(a.r<=b.l||a.l>=b.r||a.b<=b.t||a.t>=b.b);
 const others={};
 for(const sel of ['.compare__tag--before','.compare__tag--after','.compare__grip','.compare__hint','.result-actions','.sealfoot','.spin__angle','.spin__controls','.spin__row','.spin__thumbs']){
   const e=document.querySelector(sel); if(e&&e.offsetParent!==null&&e.getBoundingClientRect().width>0) others[sel]=hit(zr,R(e));
 }
 out.overlaps=others;
 out.insideGlass=zr.l>=out.glass.l+4&&zr.r<=out.glass.r-4&&zr.t>=out.glass.t+4&&zr.b<=out.glass.b-4;
 out.hscroll=document.documentElement.scrollWidth>innerWidth;
 // is the button's whole box on the glass (not on the gold frame)? sample centre
 out.size=[zr.r-zr.l,zr.b-zr.t];
 return out;}"""
with sync_playwright() as p:
    for w,h in ((360,740),(390,844),(430,932),(1280,800)):
        b,ctx,pg,logs=new(p,w,h); job=Job(); start(pg,job)
        job.state='success'; pg.wait_for_function("state.result",timeout=25000); pg.wait_for_timeout(1200)
        pg.evaluate("document.querySelector('.compare').scrollIntoView({block:'center'})"); pg.wait_for_timeout(300)
        r=pg.evaluate(JS); print(w,json.dumps(r))
        pg.screenshot(path=f'tests/e2e/out/zoom_{w}.png')
        b.close()
