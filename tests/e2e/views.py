import sys, json; sys.path.insert(0,'tests/e2e')
exec(open('tests/e2e/states.py').read().split("with sync_playwright")[0])
def views_mock(pg, mode):
    st={'mode':mode,'n':0}
    pg.route('**/api/s/demo/views', lambda r: r.fulfill(status=200,content_type='application/json',body=json.dumps({'id':'v1','ids':['v1','v2','v3']})))
    def g(route):
        st['n']+=1
        u=route.request.url; vid=u.split('/')[-1]
        if st['mode']=='running': body={'state':'running'}
        elif st['mode']=='fail': body={'state':'fail'}
        else: body={'state':'success','result_id':'vres'+vid[1]}
        route.fulfill(status=200,content_type='application/json',body=json.dumps(body))
    for v in ('v1','v2','v3'): pg.route('**/api/s/demo/generation/'+v, g)
    for i in '123': pg.route('**/api/s/demo/media/vres'+i, lambda r: r.fulfill(path='tests/e2e/out/result.jpg',content_type='image/jpeg'))
    return st
with sync_playwright() as p:
    for w,h in ((360,740),(390,844),(430,932)):
        b,ctx,pg,logs=new(p,w,h); job=Job(); start(pg,job)
        job.state='success'; pg.wait_for_function("state.result",timeout=25000); pg.wait_for_timeout(800)
        st=views_mock(pg,'running')
        pg.click('text=زوایای دیگر'); pg.wait_for_selector('.spin__loading .pm',timeout=5000); pg.wait_for_timeout(3500)
        pg.screenshot(path=f'tests/e2e/out/views_wait_{w}.png')
        ok(f'views wait {w}: scene running in dialog',pg.evaluate("!!document.querySelector('.spin__loading .pm.is-run')"))
        ok(f'views wait {w}: tip + bar visible within panel',pg.evaluate("()=>{const t=document.querySelector('.spin__tip').getBoundingClientRect(),p=document.querySelector('.spin-panel').getBoundingClientRect();return t.bottom<=innerHeight+2&&t.top>=0}"))
        # ready -> zoom button vs controls
        st['mode']='success'; pg.wait_for_selector('.spin.is-ready',timeout=20000); pg.wait_for_timeout(900)
        r=pg.evaluate("""()=>{const R=e=>e.getBoundingClientRect();const z=document.querySelector('.spin-panel .zoomx');const zr=R(z);const hit=(a,b)=>!(a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom);const o={};for(const s of ['.spin__angle','.spin__controls','.spin__thumbs','.spin__play','.result-actions','.spin__note']){const e=document.querySelector('.spin-panel '+s);if(e&&e.offsetParent)o[s]=hit(zr,R(e))}const sp=R(document.querySelector('.spin'));return {o,inside:zr.left>=sp.left+4&&zr.right<=sp.right-4&&zr.top>=sp.top+4&&zr.bottom<=sp.bottom-4,z:[zr.left,zr.top,zr.right,zr.bottom],sp:[sp.left,sp.top,sp.right,sp.bottom]}}""")
        ok(f'views ready {w}: zoom btn inside, no overlap',r['inside'] and not any(r['o'].values()),json.dumps(r))
        pg.screenshot(path=f'tests/e2e/out/views_ready_{w}.png')
        # close sheet -> loops stop, no leak
        pg.click('.sheet__x'); pg.wait_for_timeout(500)
        a=pg.evaluate("window.__raf"); pg.wait_for_timeout(800); c=pg.evaluate("window.__raf")
        ok(f'views close {w}: no rAF after sheet closed',c==a,f'{a}->{c}')
        ok(f'views {w}: no console errors',not real_errs(logs),str(real_errs(logs))[:400]); b.close()
    # failure state
    b,ctx,pg,logs=new(p); job=Job(); start(pg,job); job.state='success'; pg.wait_for_function("state.result",timeout=25000)
    st=views_mock(pg,'fail'); pg.click('text=زوایای دیگر'); pg.wait_for_timeout(6000)
    tip=pg.inner_text('.spin__tip'); ok('views fail: calm tip, scene at rest',('ممکن نشد' in tip) and pg.evaluate("!document.querySelector('.spin__loading .pm.is-run')"),tip)
    pg.screenshot(path='tests/e2e/out/views_fail.png')
    ok('views fail: no console errors',not real_errs(logs),str(real_errs(logs))[:400]); b.close()
print('TOTAL',sum(1 for r in RES if r[1]),'/',len(RES))
