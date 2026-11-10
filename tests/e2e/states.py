import sys, json, re; sys.path.insert(0,'tests/e2e')
from h import *
RES=[]
def ok(name,cond,extra=''):
    RES.append((name,bool(cond))); print(('PASS' if cond else 'FAIL'),name,extra)
BAD=re.compile(r'برگش|بازگرد|پول|اعتبار|سهم|هزینه')
def new(p, w=390, h=844):
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':w,'height':h}, device_scale_factor=1, bypass_csp=True); pg=ctx.new_page()
    ctx.add_init_script('window.__raf=0;(function(){var o=window.requestAnimationFrame;window.requestAnimationFrame=function(cb){window.__raf++;return o.call(window,cb)}})()')
    logs=[]
    pg.on('console',lambda m:logs.append((m.type,m.text)) if m.type in('error','warning') else None)
    pg.on('pageerror',lambda e:logs.append(('pageerror',str(e)+' '+str(getattr(e,'stack',''))[:600])))
    return b,ctx,pg,logs
def real_errs(logs): return [l for l in logs if '401' not in l[1]]
def start(pg,job,reqs=None):
    install(pg,job)
    if reqs is not None:
        pg.on('request',lambda r: reqs.append((r.method,r.url,r.post_data)) if '/api/s/demo/generat' in r.url else None)
    upload_bride(pg); choose_catalog(pg,2); pg.click('[data-act=generate]'); pg.wait_for_timeout(600)
with sync_playwright() as p:
    # ---- A: fail then retry
    b,ctx,pg,logs=new(p); job=Job(); reqs=[]; start(pg,job,reqs)
    job.state='fail'; pg.wait_for_selector('.pm__calm',timeout=15000)
    txt=pg.inner_text('.pm__calm')
    ok('A fail: calm message shown',('این بار' in txt),txt.replace('\n',' | '))
    ok('A fail: neutral copy (no refund/credit words)',not BAD.search(pg.evaluate("document.querySelector('.flow, #flow, main').innerText")),'')
    ok('A fail: PMC stopped, no rAF',pg.evaluate("PMC.mode==='stopped'&&!PMC.raf"))
    lbl=pg.inner_text('[data-act=retry]'); ok('A fail: retry label',lbl.strip()=='تلاش دوباره',lbl)
    gens=[r for r in reqs if r[0]=='POST' and r[1].endswith('/generate')]
    idem1=json.loads(gens[0][2])['idem']
    job.state='running'; pg.click('[data-act=retry]'); pg.wait_for_timeout(1200)
    gens=[r for r in reqs if r[0]=='POST' and r[1].endswith('/generate')]
    ok('A retry: second generate with NEW idem',len(gens)==2 and json.loads(gens[1][2])['idem']!=idem1)
    ok('A retry: scene running again',pg.evaluate("!!document.querySelector('.pm.is-run')&&PMC.mode==='build'"))
    job.state='success'; pg.wait_for_function("state.result",timeout=20000); ok('A retry: reaches result',True)
    ok('A: no console errors',not real_errs(logs),str(real_errs(logs))); b.close()
    # ---- B: unknown -> recheck only
    b,ctx,pg,logs=new(p); job=Job(); reqs=[]; start(pg,job,reqs)
    job.state='unknown'; pg.wait_for_selector('.pm__calm',timeout=15000)
    ok('B unknown: label recheck',pg.inner_text('[data-act=retry]').strip()=='بررسی دوباره')
    ok('B unknown: neutral copy',not BAD.search(pg.inner_text('.pm__calm')),pg.inner_text('.pm__calm').replace('\n',' | '))
    job.state='running'; n0=len([r for r in reqs if r[1].endswith('/generate')])
    pg.click('[data-act=retry]'); pg.wait_for_timeout(1500)
    n1=len([r for r in reqs if r[0]=='POST' and r[1].endswith('/generate')])
    ok('B recheck: no new generate request',n1==1,str(n1))
    ok('B recheck: scene in hold state',pg.evaluate("PMC.hold===true&&!!document.querySelector('.pm.is-hold')"))
    job.state='success'; pg.wait_for_function("state.result",timeout=20000); ok('B recheck: reaches result',True)
    ok('B: no console errors',not real_errs(logs),str(real_errs(logs))); b.close()
    # ---- C: slow >90s hold
    b,ctx,pg,logs=new(p); job=Job(); start(pg,job)
    pg.evaluate("()=>{state.genT0=Date.now()-95000;PMC.t0=state.genT0}"); pg.wait_for_timeout(2500)
    note=pg.inner_text('.pm__note'); ok('C slow: hold note after 90s',('کمی بیشتر' in note),note)
    ok('C slow: still animating, not an error',pg.evaluate("PMC.mode==='build'&&PMC.hold&&!!PMC.raf&&!!document.querySelector('.pm.is-hold')&&!state.error"))
    ok('C slow: shimmer animation running',pg.evaluate("getComputedStyle(document.querySelector('.pm__hold i')).animationName==='pmhold'"))
    pg.evaluate("()=>{state.genT0=Date.now()-365000;PMC.t0=state.genT0}"); pg.wait_for_selector('.pm__calm',timeout=15000)
    ok('C timeout: calm recheck state after 6 min',pg.inner_text('[data-act=retry]').strip()=='بررسی دوباره' and not BAD.search(pg.inner_text('.pm__calm')),pg.inner_text('.pm__calm').replace('\n',' | '))
    ok('C: no console errors',not real_errs(logs),str(real_errs(logs))); b.close()
    # ---- D: offline mid-job
    b,ctx,pg,logs=new(p); job=Job(); start(pg,job)
    ctx.set_offline(True); pg.wait_for_function("GM.phase==='offline'",timeout=15000)
    pg.wait_for_timeout(500)
    ok('D offline: note shown, rAF asleep',pg.evaluate("PMC.off===true&&!PMC.raf")and 'قطع' in pg.inner_text('.pm__note'),pg.inner_text('.pm__note'))
    ok('D offline: no error screen / still busy',pg.evaluate("state.busy===true&&!state.error"))
    ctx.set_offline(False); pg.wait_for_function("GM.phase!=='offline'",timeout=15000); pg.wait_for_timeout(400)
    ok('D online: resumed, rAF running',pg.evaluate("PMC.off===false&&!!PMC.raf&&!document.querySelector('.pm__note').textContent.includes('قطع')"))
    job.state='success'; pg.wait_for_function("state.result",timeout=20000); ok('D resumes to result',True)
    ok('D: no console errors',not real_errs(logs),str(real_errs(logs))); b.close()
    # ---- E: online but API failing -> lost -> recheck
    b,ctx,pg,logs=new(p); job=Job(); start(pg,job)
    job.net_fail=True; pg.wait_for_selector('.pm__calm',timeout=60000)
    ok('E lost: after repeated failures, calm recheck',pg.inner_text('[data-act=retry]').strip()=='بررسی دوباره' and not BAD.search(pg.inner_text('.pm__calm')),pg.inner_text('.pm__calm').replace('\n',' | '))
    job.net_fail=False; job.state='success'; pg.click('[data-act=retry]'); pg.wait_for_function("state.result",timeout=20000); ok('E recheck reaches result',True)
    b.close()
print('TOTAL',sum(1 for r in RES if r[1]),'/',len(RES))
