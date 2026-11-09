// Image credit per salon page, owner approval, and the salon manager's private panel (/m/<token>).
// No online payment: the manager asks for a recharge, the project owner confirms it from the admin panel.
import {must,Problem,uid,text,limited} from './domain.js';
import {notifyOwner,notifySalon,setting,setSetting} from './alerts.js';
import {approveSalon} from './manager.js';
import {notifyActivation,panelUrl} from './activate.js';
import {csvResponse} from './csv.js';

export const DEFAULT_CREDITS=100,PACKS=[100,300,1000];
const one=(db,sql,...a)=>db.prepare(sql).bind(...a).first();
const all=async(db,sql,...a)=>(await db.prepare(sql).bind(...a).all()).results||[];
const run=(db,sql,...a)=>db.prepare(sql).bind(...a).run();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const newToken=()=>Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('');
export const TOKEN=/^[a-f0-9]{32}$/;
const parse=s=>{try{return JSON.parse(s||'{}')}catch{return {}}};
export const NO_IMAGE_MSG='الان امکان ساخت تصویر نیست؛ درخواستت را برای مزون بفرست';

// Credit weights per kind of image request. PLACEHOLDER values pending the real KIE cost per call
// (a 360 clip is two video runs, so it is guessed at 3 photos). The platform owner can change them
// without a deploy: POST /api/owner/credit-weights.
export const CREDIT_KINDS=['single','views','spin'];
export const DEFAULT_WEIGHTS={single:1,views:1,spin:3};
export async function weightsOf(db){
 const o=parse(await setting(db,'credit_weights')),w={...DEFAULT_WEIGHTS};
 for(const k of CREDIT_KINDS)if(Number.isInteger(o[k])&&o[k]>=0&&o[k]<=50)w[k]=o[k];
 return w;
}
export async function setWeights(db,b){
 const w=await weightsOf(db);
 for(const k of CREDIT_KINDS)if(b[k]!==undefined){must(Number.isInteger(b[k])&&b[k]>=0&&b[k]<=50,'وزن اعتبار باید عدد صحیح بین ۰ تا ۵۰ باشد');w[k]=b[k]}
 await setSetting(db,'credit_weights',JSON.stringify(w));return w;
}


// used/left are in credits: every non-failed, non-refunded request counts its kind's weight.
function fold(salon,rows,W){
 const by_kind=Object.fromEntries(CREDIT_KINDS.map(k=>[k,{count:0,weight:W[k],credits:0}]));let used=0;
 for(const r of rows){const k=CREDIT_KINDS.includes(r.kind)?r.kind:'single',n=Number(r.n);by_kind[k].count+=n;by_kind[k].credits+=n*W[k];used+=n*W[k]}
 const limit=Number.isInteger(salon.credit_limit)?salon.credit_limit:DEFAULT_CREDITS;
 return {used,limit,left:Math.max(0,limit-used),approved:!!salon.approved,by_kind,weights:W};
}
export async function creditsOf(db,salon,W=null){
 W=W||await weightsOf(db);
 return fold(salon,await all(db,"SELECT kind,COUNT(*) n FROM generations WHERE salon_id=? AND state<>'fail' AND refunded=0 GROUP BY kind",salon.id),W);
}

// Every change of a salon's credit limit (grants, adjustments, refunds) is written here.
export async function ledger(db,salonId,amount,method,ref='',by=''){
 const lim=Number((await one(db,'SELECT credit_limit l FROM salons WHERE id=?',salonId))?.l||0);
 await run(db,'INSERT INTO credit_ledger(id,salon_id,amount,method,ref,by_who,limit_after,created_at) VALUES(?,?,?,?,?,?,?,?)',uid(),salonId,amount,method,String(ref).slice(0,200),String(by).slice(0,100),lim,Date.now());
}

// Called before any paid image/video request; `kind` is single|views|spin. A trial salon that is not approved yet
// works as a sandbox: its own small budget (trials.images_limit) is enforced by spendTrialImage. Anything else
// unapproved, or a salon with no credit left, cannot generate; the bride sees a neutral message and is told to send
// her request to the salon instead. Returns {weight} (the credits this request costs).
export async function creditGate(db,env,salon,kind='single',visitor=''){
 const W=await weightsOf(db),w=W[kind]??1;
 if(!salon.approved){
  must(parse(salon.settings).trial,NO_IMAGE_MSG,403);
  return {sandbox:true,weight:w};
 }
 const c=await creditsOf(db,salon,W);
 if(c.left>=w)return {...c,weight:w};
 await run(db,'INSERT INTO events_log(id,salon_id,visitor,kind,meta,created_at) VALUES(?,?,?,?,?,?)',uid(),salon.id,/^[a-f0-9]{16,32}$/.test(visitor)?visitor:'','no_credit',kind,Date.now()).catch(()=>{});
 try{await limited(db,'cap:'+salon.id,1);await notifyOwner(env,{kind:'credit',level:'warn',text:'اعتبار تصویر «'+salon.name+'» تمام شد',detail:'/s/'+salon.slug+' · '+c.used+' از '+c.limit})}catch{}
 throw new Problem(402,NO_IMAGE_MSG);
}

// After a request has taken credit: tells the salon manager once at 20% and once at 5% left.
export async function lowCreditCheck(env,db,salonRow,origin=''){
 try{
  const salon=await one(db,'SELECT * FROM salons WHERE id=?',salonRow.id);if(!salon?.approved)return null;
  const c=await creditsOf(db,salon);if(!c.limit)return null;
  const level=c.left*100<=c.limit*5?5:c.left*100<=c.limit*20?20:0;if(!level)return null;
  const claim=await run(db,level===5?'UPDATE salons SET alert5=1,alert20=1 WHERE id=? AND alert5=0':'UPDATE salons SET alert20=1 WHERE id=? AND alert20=0',salon.id);
  if(!claim.meta.changes)return null;
  const link=panelUrl(env,origin,salon);
  const msg='«'+salon.name+'»: '+(level===5?'فقط '+c.left+' اعتبار تصویر مانده (کمتر از ۵٪)؛ به‌زودی ساخت تصویر برای عروس‌ها متوقف می‌شود. همین حالا شارژ را درخواست بدهید.':'اعتبار ساخت تصویر به ۲۰٪ رسید ('+c.left+' از '+c.limit+' مانده). برای جلوگیری از توقف، شارژ را درخواست بدهید.')+'\nپنل مدیر مزون: '+link;
  const sent=await notifySalon(env,salon,msg);
  if(level===5)await notifyOwner(env,{salon,kind:'credit',level:'warn',text:'اعتبار تصویر کمتر از ۵٪ شد ('+c.left+' از '+c.limit+')'});
  return {level,...sent};
 }catch(e){console.error('low credit',e?.message);return null}
}
// After credit is added the flags re-arm for every threshold the salon is now above.
async function rearm(db,salonId){
 const s=await one(db,'SELECT * FROM salons WHERE id=?',salonId),c=await creditsOf(db,s);
 await run(db,'UPDATE salons SET alert20=CASE WHEN ? THEN alert20 ELSE 0 END,alert5=CASE WHEN ? THEN alert5 ELSE 0 END WHERE id=?',c.left*100<=c.limit*20?1:0,c.left*100<=c.limit*5?1:0,salonId);
}

export async function ensureToken(db,salon){
 if(salon.manage_token)return salon.manage_token;
 const t=newToken();await run(db,'UPDATE salons SET manage_token=? WHERE id=? AND manage_token IS NULL',t,salon.id);
 return (await one(db,'SELECT manage_token FROM salons WHERE id=?',salon.id)).manage_token;
}
// A leaked /m/<token> link is replaced by a fresh one; the old link stops working at once.
export async function rotateToken(db,salon){
 const t=newToken();await run(db,'UPDATE salons SET manage_token=? WHERE id=?',t,salon.id);return t;
}

// ---- project owner (admin) side ----
// One pass, no per-salon queries: salons joined with their trial, usage per kind in a single grouped query.
// params: q (name/slug/manager/phone), filter (pending|approved|trial|low|exhausted|nobot), sort (new|name|left|used), limit, offset.
export async function adminAccounts(db,origin,params={}){
 const g=k=>typeof params.get==='function'?params.get(k):params[k];
 const W=await weightsOf(db);
 let salons=await all(db,"SELECT s.*,t.phone AS t_phone FROM salons s LEFT JOIN trials t ON t.salon_id=s.id WHERE s.slug<>'demo' ORDER BY s.created_at DESC");
 const usage=new Map();
 for(const r of await all(db,"SELECT salon_id,kind,COUNT(*) n FROM generations WHERE state<>'fail' AND refunded=0 GROUP BY salon_id,kind")){(usage.get(r.salon_id)||usage.set(r.salon_id,[]).get(r.salon_id)).push(r)}
 for(const s of salons.filter(x=>!x.manage_token))s.manage_token=await ensureToken(db,s);
 const host=new URL(origin).hostname;
 let out=salons.map(s=>{const c=fold(s,usage.get(s.id)||[],W);return {slug:s.slug,name:s.name,approved:c.approved,used:c.used,limit:c.limit,left:c.left,by_kind:c.by_kind,panel:origin+'/m/'+s.manage_token,trial:s.owner_id==='trial',subdomain:s.subdomain||'',desired:s.desired_sub||'',manager:s.mgr_user||'',host:s.subdomain?s.subdomain+'.'+host:'',phone:s.t_phone||'',bot:!!(s.telegram_chat_id||s.bale_chat_id),created_at:s.created_at}});
 const q=String(g('q')||'').trim().toLowerCase(),f=String(g('filter')||'');
 if(q)out=out.filter(a=>[a.name,a.slug,a.manager,a.phone,a.subdomain].some(x=>String(x).toLowerCase().includes(q)));
 const F={pending:a=>!a.approved,approved:a=>a.approved,trial:a=>a.trial,low:a=>a.approved&&a.limit>0&&a.left*100<=a.limit*20,exhausted:a=>a.approved&&a.left<=0,nobot:a=>!a.bot};
 if(F[f])out=out.filter(F[f]);
 const sort=String(g('sort')||'new');
 if(sort==='name')out.sort((a,b)=>a.name.localeCompare(b.name,'fa'));else if(sort==='left')out.sort((a,b)=>a.left-b.left);else if(sort==='used')out.sort((a,b)=>b.used-a.used);
 const total=out.length,limit=Math.min(500,Math.max(1,Number(g('limit'))||200)),offset=Math.max(0,Number(g('offset'))||0);
 const reqs=await all(db,"SELECT r.id,r.amount,r.note,r.created_at,s.slug,s.name FROM credit_requests r JOIN salons s ON s.id=r.salon_id WHERE r.status='pending' ORDER BY r.created_at");
 return {accounts:out.slice(offset,offset+limit),total,requests:reqs,packs:PACKS,weights:W};
}
export async function adminSetAccount(db,b,env,origin,by='owner'){
 let s=await one(db,'SELECT * FROM salons WHERE slug=?',String(b.slug||''));must(s,'مزون پیدا نشد',404);
 const was=!!s.approved;let subdomain=s.subdomain||null,notified=null;
 if(b.approved===true){subdomain=await approveSalon(db,s,b.subdomain);
  if(!was){s=await one(db,'SELECT * FROM salons WHERE id=?',s.id);notified=await notifyActivation(db,env,origin,s).catch(e=>({bot:[],sms:false,errors:[String(e.message||e)]}))}}
 else if(b.approved===false)await run(db,'UPDATE salons SET approved=0 WHERE id=?',s.id);
 if(b.add!==undefined){const n=Number(b.add);must(Number.isInteger(n)&&n>=-10000&&n<=100000&&n!==0,'مقدار اعتبار معتبر نیست');
  const before=Number((await one(db,'SELECT credit_limit l FROM salons WHERE id=?',s.id)).l),after=Math.max(0,before+n);
  await run(db,'UPDATE salons SET credit_limit=? WHERE id=?',after,s.id);await ledger(db,s.id,after-before,'admin',String(b.note||'').slice(0,150),by);await rearm(db,s.id)}
 return {...await creditsOf(db,await one(db,'SELECT * FROM salons WHERE id=?',s.id)),subdomain,notified};
}
export async function adminHandleRequest(db,b,by='owner'){
 const r=await one(db,"SELECT * FROM credit_requests WHERE id=? AND status='pending'",String(b.id||''));must(r,'درخواست پیدا نشد یا قبلاً رسیدگی شده',404);
 const ok=b.action==='approve';
 await db.batch([db.prepare('UPDATE credit_requests SET status=?,handled_at=? WHERE id=?').bind(ok?'approved':'rejected',Date.now(),r.id),...(ok?[db.prepare('UPDATE salons SET credit_limit=credit_limit+? WHERE id=?').bind(r.amount,r.salon_id)]:[])]);
 if(ok){await ledger(db,r.salon_id,r.amount,'recharge',r.id,by);await rearm(db,r.salon_id)}
 return {ok:true,status:ok?'approved':'rejected'};
}

// Credit ledger for the platform owner: filters method, salon (slug), q (ref/by/salon name), from/to (ms), limit/offset. csv=true -> CSV file.
export async function adminLedger(db,params,csv=false){
 const g=k=>params.get(k)||'';
 const where=[],args=[];
 if(g('salon')){where.push('s.slug=?');args.push(g('salon'))}
 if(g('method')){where.push('l.method=?');args.push(g('method'))}
 if(Number(g('from'))){where.push('l.created_at>=?');args.push(Number(g('from')))}
 if(Number(g('to'))){where.push('l.created_at<?');args.push(Number(g('to')))}
 if(g('q')){where.push("(l.ref LIKE ? OR l.by_who LIKE ? OR s.name LIKE ?)");const like='%'+g('q').replace(/[%_]/g,'')+'%';args.push(like,like,like)}
 const W=where.length?' WHERE '+where.join(' AND '):'';
 const limit=csv?20000:Math.min(500,Math.max(1,Number(g('limit'))||100)),offset=csv?0:Math.max(0,Number(g('offset'))||0);
 const rows=await all(db,'SELECT l.id,l.created_at,l.amount,l.method,l.ref,l.by_who AS by,l.limit_after,s.slug,s.name FROM credit_ledger l JOIN salons s ON s.id=l.salon_id'+W+' ORDER BY l.created_at DESC,l.rowid DESC LIMIT ? OFFSET ?',...args,limit,offset);
 if(!csv){const total=Number((await one(db,'SELECT COUNT(*) n FROM credit_ledger l JOIN salons s ON s.id=l.salon_id'+W,...args)).n);return {entries:rows,total}}
 return csvResponse([['تاریخ','مزون','نشانی','مقدار','روش','مرجع','توسط','سقف بعد از تغییر']].concat(rows.map(r=>[new Date(r.created_at).toISOString().slice(0,19).replace('T',' '),r.name,r.slug,r.amount,r.method,r.ref,r.by,r.limit_after])),'credit-ledger.csv');
}

// ---- salon manager side: /api/m/<token> ----
export async function panelApi(req,env,u){
 const m=u.pathname.match(/^\/api\/m\/([a-f0-9]{32})(?:\/(.*))?$/);must(m,'پیدا نشد',404);
 const db=env.DB,salon=await one(db,'SELECT * FROM salons WHERE manage_token=?',m[1]);must(salon,'پنل پیدا نشد',404);
 const route=m[2]||'',J=(d,c=200)=>new Response(JSON.stringify(d),{status:c,headers:{'Content-Type':'application/json;charset=utf-8','Cache-Control':'no-store'}});
 if(route===''&&req.method==='GET')return J(await creditStatus(db,salon));
 if(route==='bot'&&req.method==='GET')return J({linked:!!(salon.telegram_chat_id||salon.bale_chat_id)});
 if(route==='recharge'&&req.method==='POST')return J(await requestRecharge(db,env,salon,await req.json().catch(()=>({}))));
 must(false,'پیدا نشد',404);
}
export async function creditStatus(db,salon){
 const c=await creditsOf(db,salon);
 const reqs=await all(db,'SELECT id,amount,note,status,created_at FROM credit_requests WHERE salon_id=? ORDER BY created_at DESC LIMIT 12',salon.id);
 const t=!salon.approved&&parse(salon.settings).trial?await one(db,'SELECT images_limit,images_used,started_at,expires_at FROM trials WHERE salon_id=?',salon.id):null;
 return {salon:{name:salon.name,slug:salon.slug},...c,packs:PACKS,requests:reqs,sandbox:t?{images_left:Math.max(0,t.images_limit-t.images_used),images_limit:t.images_limit,started:!!t.started_at,expires_at:t.started_at?t.expires_at:null}:null};
}
export async function requestRecharge(db,env,salon,b){
 await limited(db,'recharge:'+salon.id,10,'درخواست‌های امروز زیاد شده؛ فردا دوباره امتحان کنید');
 const amount=Number(b.amount);must(PACKS.includes(amount),'بستهٔ شارژ معتبر نیست');
 must(Number((await one(db,"SELECT COUNT(*) n FROM credit_requests WHERE salon_id=? AND status='pending'",salon.id)).n)<3,'چند درخواست در انتظار دارید؛ تا رسیدگی صبر کنید',429);
 const id=uid(),note=text(String(b.note||''),300);
 await run(db,'INSERT INTO credit_requests(id,salon_id,amount,note,created_at) VALUES(?,?,?,?,?)',id,salon.id,amount,note,Date.now());
 await notifyOwner(env,{kind:'credit',level:'info',text:'درخواست شارژ «'+salon.name+'»: '+amount+' تصویر',detail:'/s/'+salon.slug+(note?'\n📝 '+note:'')});
 return {ok:true,...await creditStatus(db,salon)};
}

export async function panelPage(env,token,notFound,headers,u=null){
 const s=TOKEN.test(token)&&env.DB?await one(env.DB,'SELECT * FROM salons WHERE manage_token=?',token):null;
 if(!s)return new Response(notFound,{status:404,headers});
 // An approved salon with a manager account manages everything at its own /manager; the token page stays for
 // salons without one (and with ?panel=1, which the manager page uses for the recharge-only view).
 if(s.approved&&s.mgr_user&&s.subdomain&&!(u&&u.searchParams.get('panel')==='1')){
  const to=panelUrl(env,u?.origin||'',s);
  if(/^https?:\/\//.test(to)&&!to.includes('/m/'))return new Response(null,{status:302,headers:{Location:to,'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
 }
 const html=PANEL.split('__NAME__').join(esc(s.name)).split('__SLUG__').join(esc(s.slug)).split('__TOKEN__').join(token);
 return new Response(html,{headers:{...headers,'Content-Security-Policy':"default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",'Referrer-Policy':'no-referrer'}});
}
const PANEL=String.raw`<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><meta name="theme-color" content="#0c6b6b"><title>پنل مزون | __NAME__</title>
<style>
@font-face{font-family:"Estedad";font-weight:100 900;font-display:swap;src:url(/fonts/estedad-arabic.woff2) format("woff2");unicode-range:U+0600-06FF,U+0750-077F,U+08A0-08FF,U+200C-200D,U+FB50-FDFF,U+FE70-FEFF}
@font-face{font-family:"Vazirmatn";font-weight:100 900;font-display:swap;src:url(/fonts/vazirmatn-arabic.woff2) format("woff2");unicode-range:U+0600-06FF,U+0750-077F,U+08A0-08FF,U+200C-200D,U+FB50-FDFF,U+FE70-FEFF}
*{box-sizing:border-box}body{margin:0;font:16px/1.8 "Vazirmatn",system-ui,Tahoma,sans-serif;background:linear-gradient(180deg,#e8edeb,#fafbfa 38%);color:#23170f;min-height:100vh;padding-bottom:40px}
.top{background:linear-gradient(135deg,#0c6b6b,#074c4d);color:#fff;padding:26px 20px 70px;text-align:center;border-radius:0 0 34px 34px}.top small{opacity:.85;display:block}.top h1{font:800 22px/1.5 "Estedad","Vazirmatn",sans-serif;margin:2px 0 0}
main{max-width:520px;margin:-46px auto 0;padding:0 16px}.card{background:#fff;border-radius:24px;padding:20px;box-shadow:0 18px 40px -22px rgba(7,76,77,.45);margin-bottom:14px}
h2{font:700 17px/1.6 "Estedad","Vazirmatn",sans-serif;margin:0 0 10px}.muted{color:#6a756f;font-size:14px}
.gauge{display:flex;align-items:center;gap:18px}.ring{flex:none;width:112px;height:112px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#0c6b6b calc(var(--p)*1%),#e3eae7 0)}.ring>div{width:86px;height:86px;border-radius:50%;background:#fff;display:grid;place-items:center;text-align:center;line-height:1.3;font-weight:800;font-size:22px}.ring small{display:block;font-weight:500;font-size:12px;color:#6a756f}
.chip{display:inline-block;border-radius:999px;padding:3px 12px;font-size:13px;font-weight:700}.on{background:#e4f5e8;color:#1d5a2c}.wait{background:#fff3d6;color:#6b4a00}.low{background:#fde8e8;color:#8a1c1c}
.packs{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:10px 0}.pack{border:2px solid #d6dfdb;border-radius:16px;padding:12px 4px;text-align:center;cursor:pointer;background:#fff;font:inherit;color:inherit}.pack b{display:block;font-size:22px}.pack.sel{border-color:#0c6b6b;background:#eef7f6}
textarea{width:100%;border:2px solid #d6dfdb;border-radius:14px;padding:10px 12px;font:inherit;min-height:70px;resize:vertical}.btn{display:block;width:100%;border:0;border-radius:16px;padding:15px;font:700 17px "Vazirmatn",sans-serif;background:linear-gradient(135deg,#0c6b6b,#074c4d);color:#fff;margin-top:12px;cursor:pointer}.btn[disabled]{opacity:.5}
.msg{border-radius:14px;padding:10px 14px;margin:10px 0;font-size:15px}.bad{background:#fde8e8;color:#8a1c1c}.good{background:#e4f5e8;color:#1d5a2c}.row{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-top:1px solid #edf1ef;font-size:15px}.row:first-of-type{border-top:0}
a{color:#0c6b6b;font-weight:700}
</style></head><body>
<div class="top"><small>پنل مدیر مزون</small><h1>__NAME__</h1></div>
<main>
<section class="card"><div class="gauge"><div class="ring" id="ring" style="--p:0"><div><span id="left">–</span><small>تصویر مانده</small></div></div><div><span class="chip wait" id="st">در حال بارگذاری…</span><p class="muted" id="use" style="margin:8px 0 0"></p></div></div><div class="msg bad" id="warn" hidden></div></section>
<section class="card"><h2>شارژ پنل</h2><p class="muted">بستهٔ تصاویر را انتخاب کن و درخواست بده؛ هزینه و روش پرداخت را تیم مزون آینه همراه تأیید اعلام می‌کند و بعد از تأیید، اعتبار به‌طور خودکار اضافه می‌شود.</p>
<div class="packs" id="packs"></div><textarea id="note" maxlength="300" placeholder="توضیح یا شمارهٔ پیگیری پرداخت (اختیاری)"></textarea><button class="btn" id="go" type="button">ثبت درخواست شارژ</button><div class="msg good" id="ok" hidden></div><div class="msg bad" id="err" hidden></div></section>
<section class="card"><h2>درخواست‌های شارژ</h2><div id="reqs" class="muted">هنوز درخواستی ثبت نشده.</div></section>
<p class="muted" style="text-align:center"><a href="/s/__SLUG__">صفحهٔ مشتری مزون</a></p>
</main>
<script>
var T="__TOKEN__",sel=0,fa=function(n){return Number(n).toLocaleString("fa-IR")},$=function(i){return document.getElementById(i)};
function show(d){
 $("left").textContent=fa(d.left);$("ring").style.setProperty("--p",d.limit?Math.min(100,Math.round(d.used/d.limit*100)):100);
 var st=$("st");st.textContent=!d.approved?"در انتظار تأیید":d.left>0?"فعال":"اعتبار تمام شده";st.className="chip "+(!d.approved?"wait":d.left>0?"on":"low");
 $("use").textContent=fa(d.used)+" تصویر از "+fa(d.limit)+" مصرف شده";
 var w=$("warn");if(!d.approved){w.hidden=false;w.className="msg wait";w.textContent="حساب شما هنوز تأیید نشده. صفحهٔ مزون و همهٔ بخش‌ها کار می‌کند، اما ساخت تصویر بعد از تأیید تیم مزون آینه فعال می‌شود."}else if(d.left<=0){w.hidden=false;w.className="msg bad";w.textContent="اعتبار تصویر تمام شده؛ تا شارژ، عروس‌ها نمی‌توانند تصویر بسازند و فقط می‌توانند درخواستشان را برای مزون بفرستند."}else w.hidden=true;
 var p=$("packs");if(!p.children.length){d.packs.forEach(function(n){var b=document.createElement("button");b.type="button";b.className="pack";b.innerHTML="<b>"+fa(n)+"</b>تصویر";b.onclick=function(){sel=n;[].forEach.call(p.children,function(c){c.classList.remove("sel")});b.classList.add("sel")};p.append(b)})}
 var r=$("reqs");if(d.requests.length){r.textContent="";d.requests.forEach(function(x){var e=document.createElement("div");e.className="row";var s=x.status==="approved"?"تأیید و اضافه شد":x.status==="rejected"?"رد شد":"در انتظار";e.innerHTML="<span></span><b></b>";e.firstChild.textContent=fa(x.amount)+" تصویر · "+new Date(x.created_at).toLocaleDateString("fa-IR");e.lastChild.textContent=s;r.append(e)})}
}
function load(){fetch("/api/m/"+T).then(function(r){return r.json()}).then(show).catch(function(){$("st").textContent="خطا در بارگذاری"})}
$("go").onclick=function(){var e=$("err"),o=$("ok");e.hidden=o.hidden=true;if(!sel){e.hidden=false;e.textContent="اول یک بسته را انتخاب کن.";return}this.disabled=true;var b=this;
 fetch("/api/m/"+T+"/recharge",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({amount:sel,note:$("note").value})}).then(function(r){return r.json().then(function(d){if(!r.ok)throw new Error(d.error||"خطا");return d})}).then(function(d){o.hidden=false;o.textContent="درخواست ثبت شد؛ بعد از تأیید تیم مزون آینه، اعتبار اضافه می‌شود.";$("note").value="";show(d)}).catch(function(x){e.hidden=false;e.textContent=x.message}).then(function(){b.disabled=false})};
load();
</script></body></html>`;
