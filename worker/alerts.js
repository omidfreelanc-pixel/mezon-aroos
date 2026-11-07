// The project owner's view of the bots: an activity log (shown in /admin), instant alerts to the
// owner's own bot chat, and a nightly digest at 21:00 Tehran time (also on demand with /report).
// Alerts: setup and team changes, stuck requests (waiting for an unlinked manager or member, or
// failed delivery), requests unanswered for 24 hours, and bot errors. No customer mobiles or photos.
import {hash} from './domain.js';
import {call,PLATFORMS,platformReady} from './telegram.js';

const one=(db,sql,...a)=>db.prepare(sql).bind(...a).first();
const run=(db,sql,...a)=>db.prepare(sql).bind(...a).run();
const all=async(db,sql,...a)=>(await db.prepare(sql).bind(...a).all()).results;
const parse=s=>{try{return JSON.parse(s||'{}')}catch{return {}}};
const fa=n=>Number(n).toLocaleString('fa-IR');
const DAY=86400000,SHIFT=12600000;
const tehranDay=t=>new Date(t+SHIFT).toISOString().slice(0,10);
const tehranHour=t=>Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Tehran',hour:'2-digit',hour12:false}).format(t))%24;

export async function setting(db,key){return (await one(db,'SELECT value FROM app_settings WHERE key=?',key))?.value??null}
export async function setSetting(db,key,value){await run(db,'INSERT INTO app_settings(key,value,updated_at) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at',key,String(value),Date.now())}

// What a salon page still needs. Shown in /admin, in the digest and when the wizard ends.
export const PROFILE_FIELDS=[['name','اسم'],['logo','لوگو'],['cover','کاور'],['bio','معرفی'],['address','آدرس'],['map','لوکیشن'],['hours','ساعت کاری'],['phone','تلفن'],['instagram','اینستاگرام'],['manager','اسم مدیر'],['portrait','عکس مدیر']];
export function setupStatus(salon){
 const p=parse(salon.profile),filled=[],missing=[];
 for(const [k,label] of PROFILE_FIELDS)((k==='name'?salon.name:p[k])?filled:missing).push(label);
 return {filled,missing,total:PROFILE_FIELDS.length};
}

// One-time link the owner opens in the bot to receive alerts there.
export async function ownerLink(db,env){
 const raw=Array.from(crypto.getRandomValues(new Uint8Array(12)),x=>x.toString(16).padStart(2,'0')).join('');
 await setSetting(db,'owner_code',JSON.stringify({h:await hash(raw),e:Date.now()+DAY}));
 const links={};for(const P of Object.values(PLATFORMS)){const u=P.user(env);if(P.token(env)&&u)links[P.name]=P.link(u,'o_'+raw)}
 return links;
}
export async function linkOwner(db,p,chat,raw){
 const c=parse(await setting(db,'owner_code'));
 if(!c.h||c.e<Date.now()||c.h!==await hash(raw))return false;
 await run(db,'INSERT OR IGNORE INTO owner_chats(platform,chat_id,created_at) VALUES(?,?,?)',p,String(chat),Date.now());
 await setSetting(db,'owner_code','{}');
 return true;
}
export const isOwnerChat=async(db,p,chat)=>!!await one(db,'SELECT 1 FROM owner_chats WHERE platform=? AND chat_id=?',p,String(chat));

const ICON={info:'ℹ️',warn:'⚠️',error:'❌',good:'✅'};
// Records an event and sends it to the owner's chats. The same text for the same salon is sent at
// most once every 6 hours, so a repeating problem does not flood the chat.
// detail (e.g. a prospect's phone) goes to the owner's chats only; it is never written to the activity log.
export async function notifyOwner(env,{salon=null,kind='info',level='info',text,detail=''}){
 const db=env?.DB;if(!db||!text)return;
 try{
  const sid=salon?.id||null,line=(salon?.name?'«'+salon.name+'» ':'')+text;
  const recent=await one(db,'SELECT 1 FROM activity WHERE kind=? AND COALESCE(salon_id,\'\')=? AND text=? AND created_at>?',kind,sid||'',line,Date.now()-6*3600000);
  if(recent&&level!=='good'&&level!=='info')return;
  await run(db,'INSERT INTO activity(id,salon_id,kind,level,text,created_at) VALUES(?,?,?,?,?,?)',crypto.randomUUID(),sid,kind,level,line,Date.now());
  if(recent)return;
  for(const c of await all(db,'SELECT platform,chat_id FROM owner_chats')){
   if(!platformReady(env,c.platform))continue;
   try{await call(env,c.platform,'sendMessage',{chat_id:c.chat_id,text:(ICON[level]||'•')+' '+line+(detail?'\n'+detail:'')})}catch(e){console.error('owner alert',e?.message)}
  }
 }catch(e){console.error('notifyOwner',e?.message)}
}

// Requests nobody acted on for 24 hours (sent to the owner once each).
export async function alertUnanswered(env,now=Date.now()){
 const db=env.DB;let n=0;
 const rows=await all(db,"SELECT l.id,l.salon_id,l.staff_id,l.created_at,t.name AS member FROM leads l LEFT JOIN team t ON t.id=l.staff_id WHERE l.status='sent' AND l.salon_status='new' AND l.owner_alerted=0 AND l.created_at<? LIMIT 50",now-DAY);
 for(const r of rows){
  const claim=await run(db,'UPDATE leads SET owner_alerted=1 WHERE id=? AND owner_alerted=0',r.id);if(!claim.meta.changes)continue;
  const salon=await one(db,'SELECT id,name FROM salons WHERE id=?',r.salon_id);
  await notifyOwner(env,{salon,kind:'noanswer',level:'warn',text:(r.member?'مزون‌دار «'+r.member+'»':'مدیر مزون')+' بیش از ۲۴ ساعت است به یک درخواست جواب نداده.'});n++;
 }
 return n;
}

// Nightly digest: per salon today's visitors and requests, what is unanswered, members, setup.
export async function digest(env,now=Date.now()){
 const db=env.DB,day=tehranDay(now),start=Date.parse(day+'T00:00:00Z')-SHIFT;
 const salons=await all(db,'SELECT * FROM salons ORDER BY created_at');
 const lines=['📊 گزارش امروز آینه — '+new Intl.DateTimeFormat('fa-IR-u-ca-persian',{dateStyle:'full',timeZone:'Asia/Tehran'}).format(now),''];
 let tv=0,tl=0;
 for(const s of salons){
  const visitors=Number((await one(db,"SELECT COUNT(DISTINCT visitor) n FROM events_log WHERE salon_id=? AND kind='view' AND visitor<>'' AND created_at>=?",s.id,start))?.n||0);
  const today=await all(db,'SELECT salon_status,staff_id FROM leads WHERE salon_id=? AND created_at>=?',s.id,start);
  const open=Number((await one(db,"SELECT COUNT(*) n FROM leads WHERE salon_id=? AND status='sent' AND salon_status='new' AND created_at<?",s.id,now-DAY))?.n||0);
  const waiting=Number((await one(db,'SELECT COUNT(*) n FROM leads WHERE salon_id=? AND waiting=1',s.id))?.n||0);
  const failed=Number((await one(db,"SELECT COUNT(*) n FROM leads WHERE salon_id=? AND status='failed'",s.id))?.n||0);
  tv+=visitors;tl+=today.length;
  const st=setupStatus(s),manager=!!(s.telegram_chat_id||s.bale_chat_id);
  lines.push('🏠 '+s.name+': '+fa(visitors)+' بازدیدکننده، '+fa(today.length)+' درخواست'+(today.length?' ('+fa(today.filter(l=>l.salon_status!=='new').length)+' جواب گرفت)':''));
  const warn=[];
  if(!manager)warn.push('مدیر ربات را وصل نکرده');
  if(open)warn.push(fa(open)+' درخواست بیش از ۲۴ ساعت بی‌جواب');
  if(waiting)warn.push(fa(waiting)+' درخواست منتظر وصل شدن');
  if(failed)warn.push(fa(failed)+' ارسال ناموفق');
  if(st.missing.length)warn.push('صفحه '+fa(st.filled.length)+' از '+fa(st.total)+' (مانده: '+st.missing.join('، ')+')');
  if(warn.length)lines.push('   ⚠️ '+warn.join(' · '));
  const team=await all(db,'SELECT id,name,telegram_chat_id,bale_chat_id FROM team WHERE salon_id=? AND active=1 ORDER BY created_at',s.id);
  for(const t of team){
   const mine=today.filter(l=>l.staff_id===t.id).length;
   const late=Number((await one(db,"SELECT COUNT(*) n FROM leads WHERE staff_id=? AND status='sent' AND salon_status='new' AND created_at<?",t.id,now-DAY))?.n||0);
   const brought=Number((await one(db,'SELECT COUNT(*) n FROM ref_visitors WHERE staff_id=? AND created_at>=?',t.id,start))?.n||0);
   lines.push('   • '+t.name+': '+fa(mine)+' درخواست، '+fa(brought)+' نفر تازه با لینکش'+(late?'، '+fa(late)+' بی‌جواب':'')+(t.telegram_chat_id||t.bale_chat_id?'':'، ربات را وصل نکرده'));
  }
 }
 if(!salons.length)lines.push('هنوز مزونی ساخته نشده.');
 lines.splice(1,0,'جمع: '+fa(tv)+' بازدیدکننده، '+fa(tl)+' درخواست');
 return lines.join('\n');
}
export async function sendDigest(env,chats,now=Date.now()){
 const text=await digest(env,now);
 // Telegram allows 4096 characters per message: many salons are split at line breaks.
 const parts=[];let cur='';for(const line of text.split('\n')){if((cur+'\n'+line).length>3800){parts.push(cur);cur=line}else cur=cur?cur+'\n'+line:line}if(cur)parts.push(cur);
 for(const c of chats){if(!platformReady(env,c.platform))continue;for(const part of parts){try{await call(env,c.platform,'sendMessage',{chat_id:c.chat_id,text:part})}catch(e){console.error('digest',e?.message)}}}
 return text;
}
export async function maybeDigest(env,now=Date.now()){
 const db=env.DB;if(tehranHour(now)<21)return false;
 const day=tehranDay(now);if(await setting(db,'digest_day')===day)return false;
 await setSetting(db,'digest_day',day);
 const chats=await all(db,'SELECT platform,chat_id FROM owner_chats');if(!chats.length)return false;
 await sendDigest(env,chats,now);return true;
}
