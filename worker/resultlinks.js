// Kiosk support: a QR code carries the bride's result to her own phone, and "finish" wipes her photos.
// The link is an unguessable token for ONE result photo and expires on its own (default 24 hours).
import {must,Problem} from './domain.js';
import {bucketFor} from './storage.js';

const HOUR=3600000;
const hex=n=>[...crypto.getRandomValues(new Uint8Array(n))].map(b=>b.toString(16).padStart(2,'0')).join('');
const one=(db,sql,...a)=>db.prepare(sql).bind(...a).first();
const run=(db,sql,...a)=>db.prepare(sql).bind(...a).run();
const all=async(db,sql,...a)=>(await db.prepare(sql).bind(...a).all()).results;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export async function createResultLink(env,db,salon,session,generationId,origin,hours=24){
 const g=await one(db,"SELECT result_id FROM generations WHERE id=? AND salon_id=? AND session_id=? AND state='success'",generationId,salon.id,session.id);
 must(g?.result_id,'نتیجهٔ آماده‌ای برای این لینک نیست',404);
 const token=hex(24),now=Date.now();
 await run(db,'INSERT INTO result_links(token,salon_id,session_id,media_id,created_at,expires_at) VALUES(?,?,?,?,?,?)',token,salon.id,session.id,g.result_id,now,now+Math.max(1,Math.min(72,hours))*HOUR);
 return {token,url:origin+'/r/'+token,expires_at:now+hours*HOUR};
}

async function liveLink(db,token){
 if(!/^[a-f0-9]{48}$/.test(token))return null;
 const l=await one(db,'SELECT l.*,s.name AS salon_name FROM result_links l JOIN salons s ON s.id=l.salon_id WHERE l.token=? AND l.expires_at>?',token,Date.now());
 return l||null;
}

const headers={'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex'};

export async function resultImage(env,token){
 const l=await liveLink(env.DB,token);if(!l)return null;
 const m=await one(env.DB,'SELECT object_key,mime FROM media WHERE id=? AND salon_id=?',l.media_id,l.salon_id);if(!m)return null;
 const o=await bucketFor(env).get(m.object_key);if(!o)return null;
 return new Response(o.body,{headers:{...headers,'Content-Type':m.mime,'Content-Security-Policy':"default-src 'none'"}});
}

export async function resultPage(env,token,notFound){
 const l=await liveLink(env.DB,token);
 if(!l)return new Response(notFound,{status:404,headers:{...headers,'Content-Type':'text/html;charset=utf-8'}});
 const html='<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>لباس عروس من | '+esc(l.salon_name)+'</title>'+
  '<style>body{margin:0;background:#f6f4f1;color:#2a2420;font-family:Tahoma,system-ui,sans-serif;text-align:center;padding:18px 16px 30px}img{max-width:100%;max-height:78vh;border-radius:18px;box-shadow:0 10px 30px rgba(0,0,0,.18)}h1{font-size:18px;margin:6px 0 14px}p{font-size:13px;color:#6b625a;line-height:1.9}a.b{display:inline-block;margin:14px 0 6px;padding:12px 26px;border-radius:999px;background:#2a2420;color:#fff;text-decoration:none;font-size:15px}</style></head><body>'+
  '<h1>'+esc(l.salon_name)+'</h1><img src="/r/'+token+'/img" alt="لباس عروس روی عکس شما"><br><a class="b" href="/r/'+token+'/img" download="lebas-aroos.jpg">ذخیره عکس</a>'+
  '<p>این لینک شخصی است و بعد از '+Math.max(1,Math.round((l.expires_at-l.created_at)/HOUR))+' ساعت خودش بسته می‌شود.</p></body></html>';
 return new Response(html,{headers:{...headers,'Content-Type':'text/html;charset=utf-8','Content-Security-Policy':"default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"}});
}

// "Finish" on the kiosk: delete this visitor's photos and results. Photos that became a request
// (a lead the boutique is working on) stay, exactly as in the retention job.
export async function eraseSession(env,db,salon,session){
 const rows=await all(db,"SELECT m.id,m.object_key FROM media m WHERE m.salon_id=? AND m.session_id=? AND m.kind IN('original','reference','simulation') AND NOT EXISTS(SELECT 1 FROM leads l WHERE l.original_id=m.id OR l.reference_id=m.id OR l.preview_id=m.id)",salon.id,session.id);
 let n=0;
 for(const m of rows){try{await bucketFor(env).delete(m.object_key)}catch(e){console.error('erase object',e?.message);continue}await run(db,'DELETE FROM media WHERE id=?',m.id);n++}
 await run(db,'DELETE FROM result_links WHERE session_id=?',session.id);
 return n;
}
