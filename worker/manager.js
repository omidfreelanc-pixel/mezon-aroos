// Salon manager accounts: username + password chosen at registration, a signed cookie per salon subdomain,
// and the salon's own subdomain (<label>.<main domain>), assigned when the project owner approves the account.
import {must,Problem,limited} from './domain.js';
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
