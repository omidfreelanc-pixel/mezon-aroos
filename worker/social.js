// A finished try-on as a post: a public page with a like button and comments, a ready text for the
// bride to forward, and her "may we post this on the boutique's social media?" answer.
// - generations.share_token makes /p/<token> (no sign-in; the token is unguessable).
// - A comment or a like is told to the bride through the bot she came from ("Maryam said ...").
// - social_consent (0 not asked, 1 yes, 2 no) keeps the salon's right to reuse the picture.
import {Problem,must,uid,token,text,limited} from './domain.js';
import {call,platformReady,PLATFORMS,inboxes} from './telegram.js';
import {baseCSS} from './design.js';
import {portfolioIndex,dressKeyOf,dressName} from './dresses.js';
import {bucketFor} from './storage.js';

const one=(db,sql,...a)=>db.prepare(sql).bind(...a).first();
const run=(db,sql,...a)=>db.prepare(sql).bind(...a).run();
const all=async(db,sql,...a)=>(await db.prepare(sql).bind(...a).all()).results;
const J=(v,s=200,h={})=>new Response(JSON.stringify(v),{status:s,headers:{'Content-Type':'application/json;charset=utf-8','Cache-Control':'no-store',...h}});
const attr=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const TOKEN=/^[a-f0-9]{32}$/;
const clientIp=req=>req.headers.get('cf-connecting-ip')||(req.headers.get('x-forwarded-for')||'').split(',')[0].trim()||'unknown';

export async function shareTokenOf(db,g){
 if(g.share_token)return g.share_token;
 await run(db,'UPDATE generations SET share_token=? WHERE id=? AND share_token IS NULL',token().slice(0,32),g.id);
 return (await one(db,'SELECT share_token FROM generations WHERE id=?',g.id)).share_token;
}
export async function dressNameOf(db,g){const index=await portfolioIndex(db,g.salon_id),k=dressKeyOf(g,index);return k?dressName(k,index):''}
// The text she forwards: first person, the boutique's name, the dress and the link.
export const postText=({name,salon,dress,url})=>'💍 من'+(name?' ('+name+')':'')+' لباس عروسم را در «'+salon+'» امتحان کردم'+(dress?'؛ مدل «'+dress+'»':'')+'.\nبه نظرت چطوره؟ نظرت را همین‌جا برایم بنویس 👇\n'+url;
const origin0=(env,req)=>env.APP_ORIGIN||new URL(req.url).origin;

async function tellBride(env,g,msg){
 const s=await one(env.DB,'SELECT bot_platform,bot_chat FROM sessions WHERE id=?',g.session_id);
 if(!s?.bot_chat||!s.bot_platform||!platformReady(env,s.bot_platform))return;
 try{await call(env,s.bot_platform,'sendMessage',{chat_id:s.bot_chat,text:msg})}catch(e){console.error('tell bride',e?.message)}
}
// Photo to a chat by public address; if the messenger cannot fetch it, by upload.
async function sendPhoto(env,p,chat,url,mediaKey,caption,extra={}){
 try{return await call(env,p,'sendPhoto',{chat_id:chat,photo:url,caption,...extra})}catch(e){
  const o=await bucketFor(env).get(mediaKey);if(!o)throw e;
  const f=new FormData();f.set('chat_id',chat);f.set('caption',caption);if(extra.reply_markup)f.set('reply_markup',JSON.stringify(extra.reply_markup));
  f.set('photo',new Blob([await new Response(o.body).arrayBuffer()],{type:'image/jpeg'}),'photo.jpg');
  return call(env,p,'sendPhoto',f);
 }
}
async function resultKey(db,g){const m=await one(db,'SELECT object_key FROM media WHERE id=?',g.result_id);return m?.object_key}

// Called once a result exists for a session that came through the bot: the ready post and the question.
export async function sendResultToBot(env,origin,salon,s,g){
 const db=env.DB;
 if(!s?.bot_chat||!s.bot_platform||!platformReady(env,s.bot_platform)||g.notified||!g.result_id)return;
 const won=await run(db,'UPDATE generations SET notified=1 WHERE id=? AND notified=0',g.id);if(!won.meta.changes)return;
 const t=await shareTokenOf(db,g),url=origin+'/p/'+t,dress=await dressNameOf(db,g);
 const caption=postText({name:s.bot_name,salon:salon.name,dress,url});
 await sendPhoto(env,s.bot_platform,s.bot_chat,origin+'/api/p/'+t+'/image',await resultKey(db,g),caption);
 await call(env,s.bot_platform,'sendMessage',{chat_id:s.bot_chat,text:'👆 این پست مخصوص خودته؛ هر جا و برای هر کس خواستی فوروارد کن. نظر دوستانت همین‌جا برایت می‌آید.\n\n🌸 به نظر ما تصویر شما بسیار زیبا و دیدنی است. افتخار می‌دهید این تصویر در سوشال مزون «'+salon.name+'» هم منتشر شود؟',reply_markup:{inline_keyboard:[[{text:'✅ بله، افتخار می‌دهم',callback_data:'sc:1:'+g.id},{text:'نه، ممنون',callback_data:'sc:0:'+g.id}]]}});
}
// "Send it to me": the bride entered her mobile number on the welcome screen; if she shared the same number with the bot,
// her picture goes to that chat with her details. Otherwise the page tells her to open the bot and share her number.
export async function sendToMe(env,origin,salon,s,g){
 const db=env.DB;must(g?.result_id&&g.state==='success','اول نتیجه را بساز');must(s.cust_phone,'اول شمارهٔ موبایلت را وارد کن');
 const bc=await one(db,'SELECT platform,chat_id FROM bot_customers WHERE salon_id=? AND phone=? ORDER BY created_at DESC LIMIT 1',salon.id,s.cust_phone);
 if(!bc||!platformReady(env,bc.platform))return {sent:false,linked:false};
 await limited(db,'sendme:'+g.id,6,'چند بار پشت‌سرهم فرستادی؛ کمی بعد دوباره امتحان کن');
 const t=await shareTokenOf(db,g),url=origin+'/p/'+t,dress=await dressNameOf(db,g);
 await sendPhoto(env,bc.platform,bc.chat_id,origin+'/api/p/'+t+'/image',await resultKey(db,g),postText({name:s.cust_name,salon:salon.name,dress,url}));
 const d=new Date().toLocaleString('fa-IR',{timeZone:'Asia/Tehran'});
 await call(env,bc.platform,'sendMessage',{chat_id:bc.chat_id,text:'📋 مشخصات این تصویر\n👤 نام: '+(s.cust_name||'—')+'\n📞 موبایل: '+s.cust_phone+'\n🏠 مزون: '+salon.name+'\n👗 لباس: '+(dress||'—')+'\n🕒 '+d+'\n🔗 '+url});
 return {sent:true,linked:true,platform:bc.platform};
}
// Her answer to the social-media question (from the page or from the bot). Tells the boutique on a yes.
export async function setConsent(env,origin,salon,g,yes){
 const db=env.DB;must(g?.result_id,'اول نتیجه را بساز');
 const first=g.social_consent===0||(yes&&g.social_consent!==1);
 await run(db,'UPDATE generations SET social_consent=?,social_at=? WHERE id=?',yes?1:2,Date.now(),g.id);
 if(!yes||!first)return;
 const t=await shareTokenOf(db,g),dress=await dressNameOf(db,g),key=await resultKey(db,g);
 const s=await one(db,'SELECT bot_name FROM sessions WHERE id=?',g.session_id);
 const who=g.owner_name||s?.bot_name||'یک عروس';
 const cap='📣 '+who+' اجازهٔ انتشار این تصویر را در سوشال «'+salon.name+'» داد'+(dress?' (مدل «'+dress+'»)':'')+'.\nهمین عکس در پنل مزون، بخش «تصاویر مجاز برای سوشال» هم ذخیره شد.';
 for(const p of inboxes(env,salon)){try{await sendPhoto(env,p,salon[PLATFORMS[p].col],origin+'/api/p/'+t+'/image',key,cap)}catch(e){console.error('consent notice',e?.message)}}
}
export async function reactionsOf(db,g){
 const likes=(await one(db,"SELECT count(*) n FROM reactions WHERE generation_id=? AND kind='like'",g.id)).n;
 const comments=await all(db,"SELECT name,body,created_at FROM reactions WHERE generation_id=? AND kind='comment' ORDER BY created_at DESC LIMIT 50",g.id);
 return {likes:Number(likes),comments};
}

/* ---------- public post: /api/p/<token>/... and /p/<token> ---------- */
export async function publicApi(req,env,u){
 const m=u.pathname.match(/^\/api\/p\/([a-f0-9]{32})(?:\/(.*))?$/);must(m,'پیدا نشد',404);
 const db=env.DB,g=await one(db,"SELECT * FROM generations WHERE share_token=? AND state='success'",m[1]);must(g?.result_id,'این پست پیدا نشد',404);
 const route=m[2]||'',salon=await one(db,'SELECT id,slug,name FROM salons WHERE id=?',g.salon_id);
 if(route==='image'&&req.method==='GET'){
  const key=await resultKey(db,g),o=key&&await bucketFor(env).get(key);must(o,'عکس در دسترس نیست',410);
  return new Response(o.body,{headers:{'Content-Type':'image/jpeg','Cache-Control':'public,max-age=3600','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'"}});
 }
 if(route===''&&req.method==='GET')return J({salon:{slug:salon.slug,name:salon.name},name:g.owner_name||'',...await reactionsOf(db,g)});
 must(req.method==='POST','متد مجاز نیست',405);
 const b=await req.json().catch(()=>({}));
 if(String(b.website||'').trim())return J({ok:true});
 if(route==='like'){
  await limited(db,'like-ip:'+clientIp(req),60);
  const v=String(b.v||'');must(/^[a-f0-9]{16,32}$/.test(v),'درخواست معتبر نیست');
  const r=await run(db,"INSERT OR IGNORE INTO reactions(id,generation_id,kind,name,body,visitor,created_at) VALUES(?,?,'like','','',?,?)",uid(),g.id,v,Date.now());
  const n=Number((await one(db,"SELECT count(*) n FROM reactions WHERE generation_id=? AND kind='like'",g.id)).n);
  if(r.meta.changes&&(n<=3||n%5===0))await tellBride(env,g,'❤️ '+(n===1?'یک نفر':fa(n)+' نفر')+' لباس عروست را پسندیدند.');
  return J({ok:true,likes:n});
 }
 if(route==='comment'){
  await limited(db,'comment-ip:'+clientIp(req),20,'نظرهای زیادی فرستاده‌ای؛ کمی بعد دوباره امتحان کن');
  const name=text(String(b.name||''),40).replace(/\s+/g,' '),body=text(String(b.body||''),400);
  must(name.length>=2,'اسمت را بنویس');must(body.length>=2,'نظرت را بنویس');
  await run(db,"INSERT INTO reactions(id,generation_id,kind,name,body,visitor,created_at) VALUES(?,?,'comment',?,?,?,?)",uid(),g.id,name,body,'',Date.now());
  await tellBride(env,g,'💬 نظر '+name+' دربارهٔ لباس عروست:\n«'+body+'»');
  return J({ok:true,...await reactionsOf(db,g)});
 }
 throw new Problem(404,'پیدا نشد');
}
const fa=n=>Number(n).toLocaleString('fa-IR');

export async function postPage(u,env){
 const t=u.pathname.split('/')[2];if(!TOKEN.test(t)||!env.DB)return null;
 const g=await one(env.DB,"SELECT * FROM generations WHERE share_token=? AND state='success'",t);if(!g?.result_id)return null;
 const salon=await one(env.DB,'SELECT slug,name FROM salons WHERE id=?',g.salon_id);if(!salon)return null;
 const origin=env.APP_ORIGIN||u.origin,dress=await dressNameOf(env.DB,g),who=g.owner_name||(await one(env.DB,'SELECT bot_name FROM sessions WHERE id=?',g.session_id))?.bot_name||'';
 const title=(who?who+' در ':'')+'«'+salon.name+'» لباس عروس امتحان کرد',img=origin+'/api/p/'+t+'/image';
 const css=baseCSS+'.wrap{max-width:460px;margin:0 auto;padding:20px 16px 40px;display:grid;gap:14px}.brand{font-size:13px;color:var(--muted);text-align:center}.brand b{color:var(--ink)}'+
  '.pic{width:100%;border-radius:20px;display:block;background:#e8edeb;aspect-ratio:2/3;object-fit:cover}h1{font-family:var(--display);font-size:20px;margin:0;line-height:1.7}.sub{color:var(--muted);font-size:13.5px;margin:0;line-height:1.9}'+
  '.row{display:flex;gap:10px;align-items:center}.like{border:1px solid var(--line-2);background:var(--surface,#fff);border-radius:999px;padding:10px 18px;font:inherit;font-weight:800;cursor:pointer}.like.on{background:#fde8ee;border-color:#e9a6b8}'+
  '.card{background:var(--surface,#fff);border:1px solid var(--line-2);border-radius:18px;padding:14px;display:grid;gap:10px}input,textarea{font:inherit;border:1px solid var(--line-2);border-radius:12px;padding:11px 12px;background:#fff;width:100%;box-sizing:border-box}textarea{min-height:84px;resize:vertical}'+
  '.c{border-top:1px dashed var(--line-2);padding-top:10px;font-size:14px;line-height:1.9;overflow-wrap:anywhere}.c b{display:block;font-size:12.5px;color:var(--muted)}.go{display:block;text-align:center;text-decoration:none}.msg{font-size:13px;color:var(--muted);min-height:18px}';
 return '<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><meta name="theme-color" content="#e8edeb"><link rel="icon" href="/favicon.svg" type="image/svg+xml">'+
  '<title>'+attr(title)+'</title><meta property="og:title" content="'+attr(title)+'"><meta property="og:description" content="نظرت دربارهٔ این لباس چیه؟"><meta property="og:image" content="'+attr(img)+'"><meta property="og:type" content="website"><meta name="twitter:card" content="summary_large_image"><style>'+css+'</style></head><body><main class="wrap">'+
  '<div class="brand">«'+attr(salon.name)+'» · <b>مزون آینه</b></div>'+
  '<img class="pic" src="/api/p/'+t+'/image" alt="'+attr(title)+'">'+
  '<div><h1>'+attr(who?who+' این لباس را امتحان کرد':'یک عروس این لباس را امتحان کرد')+'</h1><p class="sub">'+(dress?'مدل «'+attr(dress)+'» · ':'')+'نظرت چیه؟</p></div>'+
  '<div class="row"><button class="like" id="like" type="button">❤️ <span id="n">0</span></button></div>'+
  '<form class="card" id="f"><input name="name" placeholder="اسم شما" maxlength="40" autocomplete="given-name" required><textarea name="body" placeholder="نظرت را دربارهٔ این لباس بنویس…" maxlength="400" required></textarea><input name="website" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true"><button class="btn" type="submit">ارسال نظر</button><div class="msg" id="m" role="status"></div></form>'+
  '<div id="list"></div>'+
  '<a class="btn btn--soft go" href="/s/'+attr(salon.slug)+'">خودت هم لباس عروس را روی عکس خودت امتحان کن</a>'+
  '</main><script>(function(){var T='+JSON.stringify(t)+',B="/api/p/"+T,$=function(i){return document.getElementById(i)};'+
  'var V;try{V=localStorage.getItem("v");if(!V){V=Array.from(crypto.getRandomValues(new Uint8Array(12)),function(x){return("0"+x.toString(16)).slice(-2)}).join("");localStorage.setItem("v",V)}}catch(e){V=Array.from(crypto.getRandomValues(new Uint8Array(12)),function(x){return("0"+x.toString(16)).slice(-2)}).join("")}'+
  'function show(d){$("n").textContent=d.likes.toLocaleString("fa-IR");var l=$("list");l.replaceChildren();(d.comments||[]).forEach(function(c){var e=document.createElement("div");e.className="c";var b=document.createElement("b");b.textContent=c.name;var t=document.createElement("span");t.textContent=c.body;e.append(b,t);l.append(e)})}'+
  'function post(p,b){return fetch(B+"/"+p,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)}).then(function(r){return r.json().then(function(d){if(!r.ok)throw new Error(d.error||"انجام نشد");return d})})}'+
  'fetch(B).then(function(r){return r.json()}).then(show);'+
  '$("like").onclick=function(){post("like",{v:V}).then(function(d){$("n").textContent=d.likes.toLocaleString("fa-IR");$("like").classList.add("on")}).catch(function(e){$("m").textContent=e.message})};'+
  '$("f").onsubmit=function(e){e.preventDefault();var f=e.target;$("m").textContent="";post("comment",{name:f.name.value,body:f.body.value,website:f.website.value}).then(function(d){show(d);f.body.value="";$("m").textContent="نظرت برای عروس فرستاده شد، ممنون 💛"}).catch(function(x){$("m").textContent=x.message})};'+
  '})()</script></body></html>';
}
