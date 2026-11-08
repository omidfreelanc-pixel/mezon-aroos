// In-store phone -> kiosk photo pairing. The kiosk (a shared touch screen) shows a QR code; the bride opens it on her own phone,
// takes or picks her full-length photo, and it lands in THE KIOSK'S session only. No account, no app, nothing stays on her phone.
import {must,Problem,limited} from './domain.js';
import {putImage,imageType} from './storage.js';

const MIN=60000;
const hex=n=>[...crypto.getRandomValues(new Uint8Array(n))].map(b=>b.toString(16).padStart(2,'0')).join('');
const one=(db,sql,...a)=>db.prepare(sql).bind(...a).first();
const run=(db,sql,...a)=>db.prepare(sql).bind(...a).run();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const PAIR_CODE=/^[a-f0-9]{12}$/;

// The same photo rules run on the kiosk (camera or gallery) and on the phone page, so a bride gets identical guidance everywhere.
// Hard problems stop the photo; soft ones warn and let her keep it.
export const PHOTO_CHECK_JS=String.raw`
function checkPhoto(img){
 var w=img.naturalWidth||img.width,h=img.naturalHeight||img.height,hard=[],soft=[];
 if(Math.min(w,h)<480||Math.max(w,h)<800)hard.push('عکس خیلی کوچک است. با دوربین خود گوشی بگیر یا عکس اصلی را بفرست، نه نسخهٔ فشرده‌شده.');
 if(w>h*0.95)hard.push('عکس افقی است. گوشی را عمودی بگیر تا از سر تا کفش در قاب جا شوی.');
 else if(h/w<1.3)soft.push('قاب برای عکس تمام‌قد کوتاه است؛ کمی عقب‌تر بایست یا گوشی را عمودی‌تر بگیر.');
 try{
  var cw=72,ch=Math.max(8,Math.round(72*h/w)),c=document.createElement('canvas');c.width=cw;c.height=ch;var x=c.getContext('2d');x.drawImage(img,0,0,cw,ch);
  var d=x.getImageData(0,0,cw,ch).data,n=cw*ch,g=new Array(n),sum=0,i;
  for(i=0;i<n;i++){g[i]=0.299*d[i*4]+0.587*d[i*4+1]+0.114*d[i*4+2];sum+=g[i]}
  var mean=sum/n,v=0,edge=0;for(i=0;i<n;i++){v+=(g[i]-mean)*(g[i]-mean);if(i%cw)edge+=Math.abs(g[i]-g[i-1])}
  var sd=Math.sqrt(v/n);edge/=n;
  if(mean<55)soft.push('عکس تاریک است. جایی با نور بیشتر بایست و پشت به پنجره یا چراغ نباش.');
  else if(mean>215)soft.push('عکس خیلی روشن است و جزئیات از بین رفته. از نور مستقیم دور شو.');
  else if(sd<22)soft.push('عکس بی‌جزئیات یا مات است. کمی نور بیشتر و دوربین ثابت‌تر.');
  if(edge<2.2)soft.push('عکس کمی تار به نظر می‌رسد. گوشی را ثابت نگه دار یا تایمر بگذار.');
 }catch(e){}
 return {hard:hard,soft:soft,w:w,h:h};
}
`;

export async function createPairing(db,salon,session,origin){
 await run(db,'DELETE FROM pairings WHERE session_id=?',session.id);
 const code=hex(6),now=Date.now();
 await run(db,'INSERT INTO pairings(code,salon_id,session_id,created_at,expires_at) VALUES(?,?,?,?,?)',code,salon.id,session.id,now,now+15*MIN);
 return {code,url:origin+'/u/'+code,expires_at:now+15*MIN};
}

// The kiosk asks if a photo has arrived. A photo is reported once per arrival.
export async function pairStatus(db,salon,session,seen){
 const p=await one(db,'SELECT media_id,received_at,expires_at FROM pairings WHERE session_id=? AND salon_id=? ORDER BY created_at DESC LIMIT 1',session.id,salon.id);
 if(!p)return {state:'none'};
 if(p.media_id&&p.media_id!==seen)return {state:'received',media_id:p.media_id};
 return {state:p.expires_at>Date.now()?'waiting':'expired'};
}

async function livePairing(db,code){
 if(!PAIR_CODE.test(code))return null;
 return await one(db,'SELECT p.*,s.name AS salon_name,s.slug AS salon_slug,s.profile AS salon_profile,(SELECT cust_name FROM sessions WHERE id=p.session_id) AS cust_name FROM pairings p JOIN salons s ON s.id=p.salon_id WHERE p.code=? AND p.expires_at>?',code,Date.now());
}

const headers={'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex','Content-Type':'text/html;charset=utf-8'};
const CSP="default-src 'none'; img-src 'self' blob: data:; font-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'none'";

export async function pairUpload(env,req,code){
 const p=await livePairing(env.DB,code);
 if(!p)return new Response(JSON.stringify({error:'این لینک بسته شده؛ روی صفحهٔ مزون دوباره «ارسال از گوشی» را بزن'}),{status:404,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
 try{
  await limited(env.DB,'pairup:'+code,8,'چند عکس پشت‌سرهم فرستادی؛ روی صفحهٔ مزون دوباره کد بگیر');
  const len=Number(req.headers.get('content-length')||0);must(len<=12*1024*1024,'حجم عکس زیاد است');
  const bytes=new Uint8Array(await req.arrayBuffer());must(bytes.length>100,'فایل عکس نیست');must(['image/jpeg','image/png','image/webp'].includes(imageType(bytes)),'فقط JPG، PNG یا WebP');
  const salon={id:p.salon_id};
  const id=await putImage(env,salon,{id:p.session_id},bytes,'original');
  await run(env.DB,'UPDATE pairings SET media_id=?,received_at=? WHERE code=?',id,Date.now(),code);
  return new Response(JSON.stringify({ok:true}),{headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
 }catch(e){const s=e instanceof Problem?e.status:500;return new Response(JSON.stringify({error:e instanceof Problem?e.message:'خطای داخلی'}),{status:s||500,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}})}
}

export async function pairPage(env,code,notFound){
 const p=await livePairing(env.DB,code);
 if(!p)return new Response(notFound,{status:404,headers:{...headers,'Content-Security-Policy':CSP}});
 let logo='';try{const id=JSON.parse(p.salon_profile||'{}').logo;if(/^[a-f0-9-]{36}$/.test(id||''))logo='<img class="logo" src="/api/s/'+esc(p.salon_slug)+'/media/'+id+'" alt="">'}catch{}
 const who=String(p.cust_name||'').trim(),first=who.split(' ')[0];
 const html=PAGE.split('__LOGO__').join(logo).split('__WHO__').join(esc(who||p.salon_name)).split('__FIRST__، ').join(first?esc(first)+'، ':'').split('__NAME__').join(esc(p.salon_name)).replace('/*__CHECK__*/',()=>PHOTO_CHECK_JS).replace('__CODE__',code);
 return new Response(html,{headers:{...headers,'Content-Security-Policy':CSP}});
}

const PAGE=String.raw`<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><meta name="theme-color" content="#0c6b6b"><title>عکس تمام‌قد برای __WHO__</title>
<style>
@font-face{font-family:"Estedad";font-weight:100 900;font-display:swap;src:url(/fonts/estedad-arabic.woff2) format("woff2");unicode-range:U+0600-06FF,U+0750-077F,U+08A0-08FF,U+200C-200D,U+FB50-FDFF,U+FE70-FEFF}
@font-face{font-family:"Vazirmatn";font-weight:100 900;font-display:swap;src:url(/fonts/vazirmatn-arabic.woff2) format("woff2");unicode-range:U+0600-06FF,U+0750-077F,U+08A0-08FF,U+200C-200D,U+FB50-FDFF,U+FE70-FEFF}
*{box-sizing:border-box}
body{margin:0;font:16px/1.8 "Vazirmatn",system-ui,Tahoma,sans-serif;background:linear-gradient(180deg,#e8edeb,#fafbfa 38%);color:#23170f;min-height:100vh;padding:0 0 40px}
.top{background:linear-gradient(135deg,#0c6b6b,#074c4d);color:#fff;padding:26px 20px 64px;text-align:center;border-radius:0 0 34px 34px}
.logo{width:68px;height:68px;border-radius:50%;object-fit:cover;border:3px solid #d9b878;background:#fff;display:block;margin:0 auto 10px}
.top small{opacity:.85;display:block}.top h1{font:800 22px/1.5 "Estedad","Vazirmatn",sans-serif;margin:2px 0 0}
main{max-width:460px;margin:-40px auto 0;padding:0 16px}
.card{background:#fff;border-radius:24px;padding:18px;box-shadow:0 18px 40px -22px rgba(7,76,77,.45);margin-bottom:14px}
.guide{display:flex;gap:16px;align-items:center}
.arch{flex:none;width:96px;aspect-ratio:.5;border-radius:999px 999px 14px 14px;background:linear-gradient(180deg,#d3e9e6,#f2f5f4);border:2px solid #0c6b6b;position:relative;overflow:hidden}
.arch svg{position:absolute;inset:8% 12% 3%;width:76%;height:89%}.arch .sil{fill:#0c6b6b;fill-opacity:.16;stroke:#0c6b6b;stroke-width:3;stroke-linejoin:round}
.tips{list-style:none;margin:0;padding:0;font-size:15px}.tips li{display:flex;gap:8px;align-items:flex-start;padding:3px 0}.tips li::before{content:"";flex:none;width:18px;height:18px;margin-top:5px;border-radius:50%;background:#0c6b6b url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12.5l4.5 4.5L19 7.5'/%3E%3C/svg%3E") center/70% no-repeat}
.btn{display:block;width:100%;border:0;border-radius:16px;padding:16px;font-weight:700;font-size:17px;line-height:1.3;font-family:inherit;margin:10px 0 0;cursor:pointer}
.p{background:linear-gradient(135deg,#0c6b6b,#074c4d);color:#fff;box-shadow:0 12px 24px -14px #074c4d}.g{background:#fff;color:#074c4d;border:2px solid #0c6b6b}.btn[disabled]{opacity:.5}
.prev{display:none;margin:14px 0 4px;text-align:center}.prev img{max-width:62%;max-height:48vh;border-radius:18px;border:3px solid #fff;box-shadow:0 14px 30px -14px #0006}
.msg{border-radius:14px;padding:10px 14px;margin:8px 0;font-size:15px}.bad{background:#fde8e8;color:#8a1c1c}.warn{background:#fff3d6;color:#6b4a00}.ok{background:#e4f5e8;color:#1d5a2c;font-size:18px;text-align:center;padding:26px}
small{color:#5f6763}
</style></head><body>
<div class="top">__LOGO__<small>__NAME__</small><h1>__FIRST__، عکس تمام‌قدت را بفرست</h1></div>
<main>
<div class="card"><div class="guide"><div class="arch"><svg viewBox="0 0 200 440" aria-hidden="true"><ellipse class="sil" cx="100" cy="40" rx="19" ry="23"/><path class="sil" d="M92 62 L92 74 C78 78 62 84 58 100 C55 118 66 150 76 176 C70 220 52 330 30 428 L170 428 C148 330 130 220 124 176 C134 150 145 118 142 100 C138 84 122 78 108 74 L108 62 Z"/></svg></div>
<ul class="tips"><li>ایستاده و روبه‌رو، از سر تا کفش در قاب</li><li>دست‌ها کنار بدن</li><li>نور روشن، نه پشت‌به‌پنجره</li><li>گوشی عمودی؛ بهتر است کسی عکس را بگیرد</li></ul></div>
<p style="margin:12px 2px 0;font-size:14px;color:#5f6763">عکس مستقیم به صفحهٔ مزون می‌رود و جای دیگری ذخیره نمی‌شود.</p></div>
<div id="done" class="msg ok" style="display:none">عکس رسید ✅<br>به صفحهٔ مزون نگاه کن؛ می‌توانی این صفحه را ببندی.</div>
<div id="ui" class="card">
<input id="cam" type="file" accept="image/*" capture="environment" hidden><input id="gal" type="file" accept="image/jpeg,image/png,image/webp" hidden>
<button class="btn p" id="bcam" type="button" style="margin-top:0">گرفتن عکس با دوربین</button><button class="btn g" id="bgal" type="button">انتخاب از گالری</button>
<div class="prev" id="prev"><img id="pimg" alt=""></div><div id="issues"></div>
<button class="btn p" id="send" type="button" style="display:none">ارسال به صفحهٔ مزون</button>
</div></main>
<script>
/*__CHECK__*/
(function(){
var $=function(i){return document.getElementById(i)},blob=null;
function say(list,cls){var b=$('issues');b.innerHTML='';list.forEach(function(t){var d=document.createElement('div');d.className='msg '+cls;d.textContent=t;b.appendChild(d)})}
function pick(f){
 if(!f)return;blob=null;$('send').style.display='none';$('prev').style.display='none';say([],'');
 var url=URL.createObjectURL(f),img=new Image();
 img.onerror=function(){say(['این فایل عکس نیست؛ JPG یا PNG انتخاب کن.'],'bad')};
 img.onload=function(){
  var r=checkPhoto(img),m=1600,s=Math.min(1,m/Math.max(img.naturalWidth,img.naturalHeight)),c=document.createElement('canvas');
  c.width=Math.round(img.naturalWidth*s);c.height=Math.round(img.naturalHeight*s);c.getContext('2d').drawImage(img,0,0,c.width,c.height);
  $('pimg').src=url;$('prev').style.display='block';
  say(r.hard.map(function(t){return '⛔ '+t}).concat(r.soft.map(function(t){return '⚠️ '+t})),r.hard.length?'bad':'warn');
  if(r.hard.length)return;
  c.toBlob(function(b){blob=b;$('send').style.display='block';$('send').textContent=r.soft.length?'با همین عکس ادامه بده':'ارسال به صفحهٔ مزون'},'image/jpeg',.9);
 };img.src=url;
}
$('bcam').onclick=function(){$('cam').click()};$('bgal').onclick=function(){$('gal').click()};
$('cam').onchange=function(){pick(this.files[0]);this.value=''};$('gal').onchange=function(){pick(this.files[0]);this.value=''};
$('send').onclick=function(){
 if(!blob)return;var b=$('send');b.disabled=true;b.textContent='در حال ارسال…';
 fetch('/u/__CODE__/photo',{method:'POST',headers:{'Content-Type':'application/octet-stream'},body:blob}).then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.error||'ارسال نشد');return j})}).then(function(){$('ui').style.display='none';$('done').style.display='block'}).catch(function(e){b.disabled=false;b.textContent='دوباره بفرست';say([e.message||'ارسال نشد'],'bad')});
};
})();
</script></body></html>`;
