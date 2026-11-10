import json, re, time
from playwright.sync_api import sync_playwright
BASE='http://localhost:4173/s/demo'
class Job:
    """mock of generate + generation/<id>"""
    def __init__(s): s.state='running'; s.result='bride'; s.n=0; s.offline=False; s.net_fail=False; s.gen_status=200
def install(page, job, dress_files=None):
    def gen(route):
        route.fulfill(status=200, content_type='application/json', body=json.dumps({'id':'job1','state':'running'}))
    def poll(route):
        job.n+=1
        if job.net_fail: route.abort('failed'); return
        if job.state=='success': body={'state':'success','result_id':'resultx'}
        else: body={'state':job.state}
        route.fulfill(status=200, content_type='application/json', body=json.dumps(body))
    def pub(route):
        r=route.fetch(); d=r.json(); d['generation']=True; d['reference']=True; d['otp']=False
        route.fulfill(response=r, body=json.dumps(d))
    page.route('**/api/s/demo/public', pub)
    page.route('**/api/s/demo/generate', gen)
    page.route('**/api/s/demo/generation/job1', poll)
    page.route('**/api/s/demo/media/resultx', lambda r: r.fulfill(path='tests/e2e/out/result.jpg', content_type='image/jpeg'))
    for k,f in (dress_files or {}).items():
        page.route('**/api/s/demo/media/'+k, (lambda f: (lambda r,_q=None: r.fulfill(path=f, content_type='image/jpeg')))(f))
def upload_bride(page):
    page.goto(BASE); page.wait_for_selector('#pick',state='attached')
    page.set_input_files('#pick','tests/e2e/out/bride.jpg')
    page.wait_for_function('state.original')
def choose_catalog(page, i=2):
    page.evaluate("(i)=>{state.style=i;state.reference=null;state.refTitle='';go(3)}", i)
def choose_ref(page, mid):
    page.evaluate("(m)=>{state.reference=m;state.refTitle='';state.style=null;go(3)}", mid)
