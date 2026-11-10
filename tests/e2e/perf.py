import sys, json, statistics; sys.path.insert(0,'tests/e2e')
exec(open('tests/e2e/states.py').read().split("with sync_playwright")[0])
INIT="""
Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});
window.__f=[];window.__lt=[];window.__rec=false;
(function loop(t){if(window.__rec){window.__f.push(t);if(!window.__tff&&window.PMC&&PMC.mode!=='build')window.__tff=t}requestAnimationFrame(loop)})(0);
try{new PerformanceObserver(function(l){l.getEntries().forEach(function(e){if(window.__rec)window.__lt.push([e.startTime,e.duration])})}).observe({type:'longtask',buffered:false})}catch(e){}
"""
def metrics(cdp):
    m=cdp.send('Performance.getMetrics')['metrics']; return {x['name']:x['value'] for x in m}
CSS=sys.argv[2] if len(sys.argv)>2 and not sys.argv[2].startswith('js:') else ''
JSV=sys.argv[2][3:] if len(sys.argv)>2 and sys.argv[2].startswith('js:') else ''
def run(p,rate,label,dress_idx=2,pre=2.0,total_build=14.0,w=390,h=844):
    b=p.chromium.launch(args=['--enable-precise-memory-info']); ctx=b.new_context(viewport={'width':w,'height':h},device_scale_factor=2,bypass_csp=True); pg=ctx.new_page(); ctx.add_init_script(INIT+("document.addEventListener('DOMContentLoaded',function(){var s=document.createElement('style');s.textContent="+json.dumps(CSS)+";document.head.append(s)})" if CSS else '')+("window.addEventListener('load',function(){var o=pmPose;pmPose=function(S,p,t,x){"+JSV+";return o(S,p,t,x)}})" if JSV else ''))
    job=Job(); install(pg,job); upload_bride(pg); choose_catalog(pg,dress_idx)
    cdp=ctx.new_cdp_session(pg); cdp.send('Performance.enable')
    if rate>1: cdp.send('Emulation.setCPUThrottlingRate',{'rate':rate})
    pg.click('[data-act=generate]'); pg.wait_for_timeout(int(pre*1000))
    pg.evaluate("document.querySelector('.pm').scrollIntoView({block:'center'})")
    m0=metrics(cdp); pg.evaluate("window.__rec=true;window.__t0=performance.now()")
    pg.wait_for_timeout(int(total_build*1000))
    job.state='success'; pg.wait_for_function("state.result",timeout=40000)
    pg.evaluate("window.__rec=false;window.__t1=performance.now()")
    m1=metrics(cdp)
    r=pg.evaluate("()=>({f:window.__f,lt:window.__lt,t0:window.__t0,t1:window.__t1,tff:window.__tff})")
    d=[r['f'][i+1]-r['f'][i] for i in range(len(r['f'])-1)]
    d.sort(); n=len(d); dur=(r['t1']-r['t0'])/1000
    slow=[round((r['f'][i+1]-r['t0'])/1000,2) for i in range(len(r['f'])-1) if r['f'][i+1]-r['f'][i]>45]
    print('slow frames at(s):',slow, 'success at ~',total_build)
    def st(fr):
        dd=sorted(fr[i+1]-fr[i] for i in range(len(fr)-1)); n2=len(dd)
        return {'frames':n2+1,'secs':round((fr[-1]-fr[0])/1000,1),'fps':round((n2+1)/((fr[-1]-fr[0])/1000),1),'med':round(dd[n2//2],1),'p95':round(dd[int(n2*.95)],1),'max':round(dd[-1],1),'>33ms':sum(1 for x in dd if x>33.5),'>50ms':sum(1 for x in dd if x>50)}
    bf=[t for t in r['f'] if t<r['tff']]; cf=[t for t in r['f'] if t>=r['tff']]
    print('longtasks rel t0:',[(round((a-r['t0'])/1000,2),round(d)) for a,d in r['lt']],'tff rel:',round((r['tff']-r['t0'])/1000,2)); print('BUILD',st(bf)); print('CLIMAX+handoff',st(cf))
    out={'label':label,'secs':round(dur,1),'frames':n+1,'fps':round((n+1)/dur,1),'med_ms':round(statistics.median(d),1),'p95_ms':round(d[int(n*.95)],1),'p99_ms':round(d[int(n*.99)],1),'max_ms':round(d[-1],1),
         'frames>33ms':sum(1 for x in d if x>33.5),'frames>50ms':sum(1 for x in d if x>50),'longtasks>50ms':len(r['lt']),'longtask_max':round(max([x[1] for x in r['lt']] or [0]),1),
         'script_s':round(m1['ScriptDuration']-m0['ScriptDuration'],3),'layout_s':round(m1['LayoutDuration']-m0['LayoutDuration'],3),'style_s':round(m1['RecalcStyleDuration']-m0['RecalcStyleDuration'],3),'task_s':round(m1['TaskDuration']-m0['TaskDuration'],3),'layoutcount':int(m1['LayoutCount']-m0['LayoutCount']),'stylecount':int(m1['RecalcStyleCount']-m0['RecalcStyleCount'])}
    print(json.dumps(out,ensure_ascii=False)); b.close(); return out
with sync_playwright() as p:
    label=sys.argv[1] if len(sys.argv)>1 else 'new'
    for rate in ((1,) if (CSS or JSV) else (1,4)):
        run(p,rate,f'{label} cpu x{rate}')
