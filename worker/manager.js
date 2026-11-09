// Salon manager accounts: username + password chosen at registration, a signed cookie per salon subdomain,
// and the salon's own subdomain (<label>.<main domain>), assigned when the project owner approves the account.
import {must,Problem,limited,uid,hash,digits} from './domain.js';
import {smsReady,sendOtp} from './sms.js';
import {same} from './auth.js';

const enc=new TextEncoder();
const hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
const b64u=b=>btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const one=(db,sql,...a)=>db.prepare(sql).bind(...a).first();
const run=(db,sql,...a)=>db.prepare(sql).bind(...a).run();
export const RESERVED=['www','api','admin','app','m','mail','manager','static','assets','cdn','ftp','smtp','ns1','ns2','test','demo-admin'];
export const USERNAME=/^[a-z0-9][a-z0-9._-]{2,29}$/,SUBLABEL=/^[a-z][a-z0-9-]{2,29}[a-z0-9]$/;

export async function pwHash(password,salt){
 const key=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);
 return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:enc.encode(salt),iterations:100000},key,256));
}
export const cleanUser=u=>String(u||'').trim().toLowerCase();
export function checkCreds(user,password){
 must(USERNAME.test(user),'نام کاربری فقط حروف انگلیسی کوچک، عدد، نقطه، خط تیره و زیرخط دارد و ۳ تا ۳۰ کاراکتر است');
 must(typeof password==='string'&&password.length>=8&&password.length<=100,'رمز عبور حداقل ۸ کاراکتر باشد');
}
export async function setManager(db,salonId,user,password){
 user=cleanUser(user);checkCreds(user,password);
 const salt=hex(crypto.getRandomValues(new Uint8Array(16)));
 await run(db,'UPDATE salons SET mgr_user=?,mgr_salt=?,mgr_hash=? WHERE id=?',user,salt,await pwHash(password,salt),salonId);
}
export const subLabel=s=>String(s||'').trim().toLowerCase().replace(/[\s_]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
export async function checkSub(db,label,salonId){
 must(SUBLABEL.test(label)&&!RESERVED.includes(label),'زیردامنه فقط حروف انگلیسی کوچک، عدد و خط تیره دارد، با حرف شروع می‌شود و ۴ تا ۳۱ کاراکتر است');
 const x=await one(db,'SELECT id FROM salons WHERE subdomain=? AND id<>?',label,salonId||'');must(!x,'این زیردامنه را مزون دیگری گرفته است',409);
}
// Approves the account and gives it its subdomain. The wildcard DNS record and worker route (*.domain) make it live at once.
export async function approveSalon(db,salon,label){
 label=subLabel(label||salon.subdomain||salon.desired_sub||(/^t-/.test(salon.slug)?'':salon.slug));
 must(label,'برای این مزون یک زیردامنهٔ انگلیسی وارد کنید',400);
 await checkSub(db,label,salon.id);
 // An approved salon is a full account: the 10-hour / 5-image trial strip and limits end here; the page colour stays.
 let cfg={};try{cfg=JSON.parse(salon.settings||'{}')}catch{}
 if(cfg.trial){const t=await db.prepare('SELECT brand FROM trials WHERE salon_id=?').bind(salon.id).first();delete cfg.trial;if(t?.brand)cfg.brand=t.brand}
 await run(db,'UPDATE salons SET approved=1,subdomain=?,settings=? WHERE id=?',label,JSON.stringify(cfg),salon.id);
 return label;
}

// Which salon subdomain a request is for ('' on the main domain). Only direct children of the main domain count.
export function subOf(u,env){
 try{const base=new URL(env.APP_ORIGIN||'').hostname;if(!base)return '';const h=u.hostname;
  if(!h.endsWith('.'+base))return '';const l=h.slice(0,-base.length-1);return SUBLABEL.test(l)&&!RESERVED.includes(l)?l:'';}catch{return ''}
}

// ---- signed cookie, bound to one salon ----
async function mac(secret,data){const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return b64u(await crypto.subtle.sign('HMAC',key,enc.encode(data)))}
export async function mgrCookie(env,slug,secure,ver=''){const exp=Date.now()+7*86400000,body=slug+'|'+exp+'|'+ver;return 'ayneh_mgr='+body+'|'+await mac(env.SESSION_SECRET,'mgr:'+body)+'; HttpOnly'+(secure?'; Secure':'')+'; SameSite=Lax; Path=/; Max-Age=604800'}
export const clearMgrCookie=secure=>'ayneh_mgr=; HttpOnly'+(secure?'; Secure':'')+'; SameSite=Lax; Path=/; Max-Age=0';
export async function mgrSlug(req,env,salon){
 if(!env?.SESSION_SECRET)return '';
 const raw=(req.headers.get('cookie')||'').match(/(?:^|; )ayneh_mgr=([^;]+)/)?.[1];if(!raw)return '';
 const p=raw.split('|');if(p.length!==4||!Number.isFinite(Number(p[1]))||Number(p[1])<Date.now())return '';
 if(salon&&p[2]!==String(salon.mgr_hash||'').slice(0,12))return '';
 return same(p[3],await mac(env.SESSION_SECRET,'mgr:'+p[0]+'|'+p[1]+'|'+p[2]))?p[0]:'';
}
export async function managerLogin(req,env,db,salon,ip,secure){
 if(!env.SESSION_SECRET)throw new Problem('ورود هنوز پیکربندی نشده است.',503);
 await limited(db,'mgrlogin:'+salon.id+':'+ip,12,'تلاش‌های ورود زیاد شد؛ کمی بعد دوباره امتحان کنید');
 const b=await req.json().catch(()=>({})),user=cleanUser(b.username),pw=String(b.password||'');
 must(salon.approved&&salon.mgr_user&&salon.mgr_hash,'پنل مدیریت این مزون هنوز فعال نشده است',403);
 const given=await pwHash(pw,salon.mgr_salt);
 must(user===salon.mgr_user&&same(given,salon.mgr_hash),'نام کاربری یا رمز عبور نادرست است',401);
 return mgrCookie(env,salon.slug,secure,String(salon.mgr_hash||'').slice(0,12));
}

// ---- password change and reset ----
const newSalt=()=>hex(crypto.getRandomValues(new Uint8Array(16)));
async function storePassword(db,salon,password){
 checkCreds(salon.mgr_user,password);const salt=newSalt(),h=await pwHash(password,salt);
 await run(db,'UPDATE salons SET mgr_salt=?,mgr_hash=? WHERE id=?',salt,h,salon.id);
 return {...salon,mgr_salt:salt,mgr_hash:h};
}
// Signed-in manager changes the password: the current one is required. Old cookies die (they carry a hash prefix),
// the answer carries a fresh cookie. Returns the Set-Cookie value.
export async function changePassword(req,env,db,salon,secure){
 must(await mgrSlug(req,env,salon)===salon.slug,'برای تغییر رمز، اول وارد پنل شوید',401);
 await limited(db,'mgrpw:'+salon.id,10,'تلاش‌های تغییر رمز زیاد شد؛ فردا دوباره امتحان کنید');
 const b=await req.json().catch(()=>({})),cur=String(b.current||''),next=String(b.password||'');
 must(same(await pwHash(cur,salon.mgr_salt),salon.mgr_hash),'رمز فعلی درست نیست',401);
 must(next!==cur,'رمز تازه باید با رمز فعلی فرق داشته باشد');
 const s2=await storePassword(db,salon,next);
 return mgrCookie(env,s2.slug,secure,String(s2.mgr_hash).slice(0,12));
}
const maskPhone=p=>{const n='0'+String(p).replace(/^\+98/,'');return n.slice(0,4)+'•••'+n.slice(-4)};
// Forgot password: a one-time code is texted to the mobile the salon registered with.
export async function forgotPassword(env,db,salon,ip){
 must(salon.mgr_user&&salon.mgr_hash,'برای این مزون حساب مدیر ساخته نشده است',404);
 must(smsReady(env),'بازیابی رمز با پیامک هنوز فعال نشده است؛ با تیم مزون آینه تماس بگیرید',503);
 const t=await one(db,'SELECT phone FROM trials WHERE salon_id=?',salon.id);
 must(t?.phone,'شمارهٔ ثبت‌نام این مزون پیدا نشد؛ با تیم مزون آینه تماس بگیرید',404);
 const key='mgrreset:'+salon.id,prev=await one(db,'SELECT created_at FROM otps WHERE session_id=? ORDER BY created_at DESC LIMIT 1',key);
 must(!prev||Date.now()-prev.created_at>=60000,'برای گرفتن دوبارهٔ کد یک دقیقه صبر کنید',429);
 await limited(db,'mgrforgot:'+salon.id,3,'امروز چند بار کد بازیابی گرفته شده؛ فردا دوباره امتحان کنید');
 await limited(db,'mgrforgot-ip:'+ip,10,'از این شبکه چند بار کد بازیابی خواسته شده؛ فردا دوباره امتحان کنید');
 const code=await sendOtp(env,t.phone),id=uid(),now=Date.now();
 await run(db,'DELETE FROM otps WHERE session_id=?',key);
 await run(db,'INSERT INTO otps(id,session_id,phone,first_name,last_name,code_hash,expires_at,created_at) VALUES(?,?,?,?,?,?,?,?)',id,key,t.phone,'','',await hash(id+':'+code),now+10*60000,now);
 return {ok:true,phone_hint:maskPhone(t.phone),expires_in:600,resend_in:60};
}
// Reset with the texted code and a new password. Returns a Set-Cookie value for an approved salon, else ''.
export async function resetPassword(req,env,db,salon,ip,secure){
 await limited(db,'mgrreset-ip:'+ip,20,'تلاش‌ها زیاد شد؛ فردا دوباره امتحان کنید');
 const b=await req.json().catch(()=>({})),given=digits(String(b.code||'')).replace(/\s/g,''),key='mgrreset:'+salon.id;
 must(/^\d{3,12}$/.test(given),'کد پیامک‌شده را درست وارد کنید');
 const o=await one(db,'SELECT * FROM otps WHERE session_id=? ORDER BY created_at DESC LIMIT 1',key);
 must(o,'اول کد بازیابی بگیرید');must(o.expires_at>Date.now(),'کد منقضی شده؛ کد تازه بگیرید',410);
 const spent=await run(db,'UPDATE otps SET attempts=attempts+1 WHERE id=? AND attempts<5',o.id);
 must(spent.meta.changes,'تعداد تلاش‌ها تمام شد؛ کد تازه بگیرید',429);
 must(same(await hash(o.id+':'+given),o.code_hash),'کد درست نیست');
 const s2=await storePassword(db,salon,String(b.password||''));
 await run(db,'DELETE FROM otps WHERE session_id=?',key);
 return salon.approved?await mgrCookie(env,s2.slug,secure,String(s2.mgr_hash).slice(0,12)):'';
}
