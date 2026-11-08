// Image credit per salon page, owner approval, and the salon manager's private panel (/m/<token>).
// No online payment: the manager asks for a recharge, the project owner confirms it from the admin panel.
import {must,Problem,uid,text,limited} from './domain.js';
import {notifyOwner} from './alerts.js';
import {approveSalon} from './manager.js';

export const DEFAULT_CREDITS=100,PACKS=[100,300,1000];
const one=(db,sql,...a)=>db.prepare(sql).bind(...a).first();
const all=async(db,sql,...a)=>(await db.prepare(sql).bind(...a).all()).results||[];
const run=(db,sql,...a)=>db.prepare(sql).bind(...a).run();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const newToken=()=>Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('');
export const TOKEN=/^[a-f0-9]{32}$/;

export async function creditsOf(db,salon){
 const used=Number((await one(db,"SELECT COUNT(*) n FROM generations WHERE salon_id=? AND state<>'fail'",salon.id))?.n||0);
 const limit=Number.isInteger(salon.credit_limit)?salon.credit_limit:DEFAULT_CREDITS;
 return {used,limit,left:Math.max(0,limit-used),approved:!!salon.approved};
}

// Called before any paid image/video request. Unapproved salons and salons with no credit left cannot generate.
export async function creditGate(db,env,salon){
 must(salon.approved,'ساخت تصویر برای این مزون هنوز فعال نشده است؛ بعد از تأیید حساب مزون فعال می‌شود',403);
 const c=await creditsOf(db,salon);
 if(c.left>0)return c;
 try{await limited(db,'cap:'+salon.id,1);await notifyOwner(env,{kind:'credit',level:'warn',text:'اعتبار تصویر «'+salon.name+'» تمام شد',detail:'/s/'+salon.slug+' · '+c.used+' از '+c.limit})}catch{}
 throw new Problem(402,'ظرفیت ساخت تصویر این مزون تمام شده است؛ مزون‌دار باید پنل خود را شارژ کند');
}

export async function ensureToken(db,salon){
 if(salon.manage_token)return salon.manage_token;
 const t=newToken();await run(db,'UPDATE salons SET manage_token=? WHERE id=? AND manage_token IS NULL',t,salon.id);
 return (await one(db,'SELECT manage_token FROM salons WHERE id=?',salon.id)).manage_token;
}

// ---- project owner (admin) side ----
export async function adminAccounts(db,origin){
 const salons=await all(db,"SELECT * FROM salons WHERE slug<>'demo' ORDER BY created_at DESC");
 const out=[];
 for(const s of salons){const c=await creditsOf(db,s),t=await ensureToken(db,s);out.push({slug:s.slug,name:s.name,approved:c.approved,used:c.used,limit:c.limit,left:c.left,panel:origin+'/m/'+t,trial:s.owner_id==='trial',subdomain:s.subdomain||'',desired:s.desired_sub||'',manager:s.mgr_user||'',host:s.subdomain?s.subdomain+'.'+new URL(origin).hostname:''})}
 const reqs=await all(db,"SELECT r.id,r.amount,r.note,r.created_at,s.slug,s.name FROM credit_requests r JOIN salons s ON s.id=r.salon_id WHERE r.status='pending' ORDER BY r.created_at");
 return {accounts:out,requests:reqs,packs:PACKS};
}
export async function adminSetAccount(db,b){
 const s=await one(db,'SELECT * FROM salons WHERE slug=?',String(b.slug||''));must(s,'مزون پیدا نشد',404);
 let subdomain=s.subdomain||null;
 if(b.approved===true)subdomain=await approveSalon(db,s,b.subdomain);
 else if(b.approved===false)await run(db,'UPDATE salons SET approved=0 WHERE id=?',s.id);
 if(b.add!==undefined){const n=Number(b.add);must(Number.isInteger(n)&&n>=-10000&&n<=100000&&n!==0,'مقدار اعتبار معتبر نیست');await run(db,'UPDATE salons SET credit_limit=MAX(0,credit_limit+?) WHERE id=?',n,s.id)}
 return {...await creditsOf(db,await one(db,'SELECT * FROM salons WHERE id=?',s.id)),subdomain};
}
export async function adminHandleRequest(db,b){
 const r=await one(db,"SELECT * FROM credit_requests WHERE id=? AND status='pending'",String(b.id||''));must(r,'درخواست پیدا نشد یا قبلاً رسیدگی شده',404);
 const ok=b.action==='approve';
 await db.batch([db.prepare('UPDATE credit_requests SET status=?,handled_at=? WHERE id=?').bind(ok?'approved':'rejected',Date.now(),r.id),...(ok?[db.prepare('UPDATE salons SET credit_limit=credit_limit+? WHERE id=?').bind(r.amount,r.salon_id)]:[])]);
 return {ok:true,status:ok?'approved':'rejected'};
}

// ---- salon manager side: /api/m/<token> ----
export async function panelApi(req,env,u){
 const m=u.pathname.match(/^\/api\/m\/([a-f0-9]{32})(?:\/(.*))?$/);must(m,'پیدا نشد',404);
 const db=env.DB,salon=await one(db,'SELECT * FROM salons WHERE manage_token=?',m[1]);must(salon,'پنل پیدا نشد',404);
 const route=m[2]||'',J=(d,c=200)=>new Response(JSON.stringify(d),{status:c,headers:{'Content-Type':'application/json;charset=utf-8','Cache-Control':'no-store'}});
 if(route===''&&req.method==='GET')return J(await creditStatus(db,salon));
 if(route==='recharge'&&req.method==='POST')return J(await requestRecharge(db,env,salon,await req.json().catch(()=>({}))));
 must(false,'پیدا نشد',404);
}
export async function creditStatus(db,salon){
 const c=await creditsOf(db,salon);
 const reqs=await all(db,'SELECT id,amount,note,status,created_at FROM credit_requests WHERE salon_id=? ORDER BY created_at DESC LIMIT 12',salon.id);
 return {salon:{name:salon.name,slug:salon.slug},...c,packs:PACKS,requests:reqs};
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

export async function panelPage(env,token,notFound,headers){
 const s=TOKEN.test(token)&&env.DB?await one(env.DB,'SELECT name,slug FROM salons WHERE manage_token=?',token):null;
 if(!s)return new Response(notFound,{status:404,headers});
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
<div class="top"><small>پنل مزون‌دار</small><h1>__NAME__</h1></div>
<main>
<section class="card"><div class="gauge"><div class="ring" id="ring" style="--p:0"><div><span id="left">–</span><small>تصویر مانده</small></div></div><div><span class="chip wait" id="st">در حال بارگذاری…</span><p class="muted" id="use" style="margin:8px 0 0"></p></div></div><div class="msg bad" id="warn" hidden></div></section>
<section class="card"><h2>شارژ پنل</h2><p class="muted">بستهٔ تصاویر را انتخاب کن و درخواست بده؛ هزینه و روش پرداخت را مدیر مزون آینه همراه تأیید اعلام می‌کند و بعد از تأیید، اعتبار به‌طور خودکار اضافه می‌شود.</p>
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
 var w=$("warn");if(!d.approved){w.hidden=false;w.className="msg wait";w.textContent="حساب شما هنوز تأیید نشده. صفحهٔ مزون و همهٔ بخش‌ها کار می‌کند، اما ساخت تصویر بعد از تأیید مدیر فعال می‌شود."}else if(d.left<=0){w.hidden=false;w.className="msg bad";w.textContent="اعتبار تصویر تمام شده؛ تا شارژ مشتری‌ها نمی‌توانند تصویر بسازند."}else w.hidden=true;
 var p=$("packs");if(!p.children.length){d.packs.forEach(function(n){var b=document.createElement("button");b.type="button";b.className="pack";b.innerHTML="<b>"+fa(n)+"</b>تصویر";b.onclick=function(){sel=n;[].forEach.call(p.children,function(c){c.classList.remove("sel")});b.classList.add("sel")};p.append(b)})}
 var r=$("reqs");if(d.requests.length){r.textContent="";d.requests.forEach(function(x){var e=document.createElement("div");e.className="row";var s=x.status==="approved"?"تأیید و اضافه شد":x.status==="rejected"?"رد شد":"در انتظار";e.innerHTML="<span></span><b></b>";e.firstChild.textContent=fa(x.amount)+" تصویر · "+new Date(x.created_at).toLocaleDateString("fa-IR");e.lastChild.textContent=s;r.append(e)})}
}
function load(){fetch("/api/m/"+T).then(function(r){return r.json()}).then(show).catch(function(){$("st").textContent="خطا در بارگذاری"})}
$("go").onclick=function(){var e=$("err"),o=$("ok");e.hidden=o.hidden=true;if(!sel){e.hidden=false;e.textContent="اول یک بسته را انتخاب کن.";return}this.disabled=true;var b=this;
 fetch("/api/m/"+T+"/recharge",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({amount:sel,note:$("note").value})}).then(function(r){return r.json().then(function(d){if(!r.ok)throw new Error(d.error||"خطا");return d})}).then(function(d){o.hidden=false;o.textContent="درخواست ثبت شد؛ بعد از تأیید مدیر، اعتبار اضافه می‌شود.";$("note").value="";show(d)}).catch(function(x){e.hidden=false;e.textContent=x.message}).then(function(){b.disabled=false})};
load();
</script></body></html>`;
