export class Problem extends Error {constructor(status,message){super(message);this.status=status;}}
export function must(test,message='درخواست معتبر نیست',status=400){if(!test)throw new Problem(status,message);}
export const digits=s=>String(s??'').replace(/[۰-۹]/g,x=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(x)).replace(/[٠-٩]/g,x=>'٠١٢٣٤٥٦٧٨٩'.indexOf(x));
export function phone(s){let n=digits(s).replace(/[\s()-]/g,'').replace(/^0098/,'+98');if(/^09\d{9}$/.test(n))n='+98'+n.slice(1);if(/^9\d{9}$/.test(n))n='+98'+n;must(/^\+989\d{9}$/.test(n),'شماره موبایل ایران معتبر نیست');return n;}
export function text(s,max=500){must(typeof s==='string'&&s.length<=max,'متن بیش از حد مجاز است');return s.trim();}
export function safeLink(s){if(!s)return '';try{const u=new URL(s);must(['https:','http:'].includes(u.protocol),'لینک معتبر نیست');return u.href;}catch{throw new Problem(400,'لینک معتبر نیست');}}
export const uid=()=>crypto.randomUUID();
export const token=()=>{let a=crypto.getRandomValues(new Uint8Array(32));return Array.from(a,x=>x.toString(16).padStart(2,'0')).join('');};
export const hash=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),x=>x.toString(16).padStart(2,'0')).join('');
export const formatTime=ms=>new Intl.DateTimeFormat('fa-IR',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Tehran'}).format(ms);
// Rolling 24-hour counter kept in D1 `limits`; throws 429 once `key` has been hit more than `max` times.
export async function limited(db,key,max,message='سقف استفادهٔ روزانه پر شده است'){const n=Date.now(),k=await hash(key);await db.prepare('INSERT INTO limits(key,count,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires_at<? THEN 1 ELSE count+1 END,expires_at=CASE WHEN expires_at<? THEN excluded.expires_at ELSE expires_at END').bind(k,n+86400000,n,n).run();const row=await db.prepare('SELECT count FROM limits WHERE key=?').bind(k).first();must(row.count<=max,message,429);}
