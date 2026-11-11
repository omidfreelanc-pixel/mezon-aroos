// AI support agent for free-text messages to the platform bot (Telegram + Bale).
// Gemini answers as a polite support person; anything uncertain or commercial goes to a human: a row in
// support_escalations plus a short note to the owner chat. Secrets: GEMINI_API_KEY (required), GEMINI_MODEL (optional).
// The key is only ever sent as a request header; it is never logged or stored. Nothing here throws into the webhook.
import {Problem,limited,uid,digits} from './domain.js';
import {notifyOwner} from './alerts.js';
import {call} from './telegram.js';
import {normalizeMobile} from './onboarding.js';
import {SUPPORT_PROMPT,PROMPT_MARKER} from './ai-support-prompt.js';

export const GEMINI_MODEL='gemini-3.6-flash'; // override with env GEMINI_MODEL
export const GEMINI_URL='https://generativelanguage.googleapis.com/v1beta/models/';
export const LIM={turns:10,ttl:86400000,maxIn:800,perHour:20,maxOutTokens:1024,timeout:15000,budget:27000,maxReply:1200,temperature:0.4};
export const TEXT={
 fallback:'در حال حاضر نمی‌توانم پاسخ دقیقی بدهم، اما پیام شما را برای همکار کارشناس ما ثبت کردم و پیگیری می‌کنند.',
 askContact:'لطفاً نام و شمارهٔ موبایلتان را بفرستید (با دکمهٔ «ارسال شمارهٔ من» یا تایپ) تا با شما تماس بگیرند.',
 thanks:'ممنون، شمارهٔ شما ثبت شد. همکار کارشناس ما به‌زودی با شما تماس می‌گیرد.',
 rate:'پیام‌های شما در این یک ساعت زیاد شد. لطفاً کمی بعد دوباره بنویسید، یا با /start منوی ربات را باز کنید.',
 leak:'در این مورد نمی‌توانم کمکی کنم. اگر دربارهٔ آینه سؤالی دارید، بفرمایید.',
 share:'ارسال شمارهٔ من'
};
const one=(db,sql,...a)=>db.prepare(sql).bind(...a).first();
const run=(db,sql,...a)=>db.prepare(sql).bind(...a).run();
const parse=(s,d)=>{try{return JSON.parse(s)}catch{return d}};
const cut=(s,n)=>String(s??'').replace(/\s+/g,' ').trim().slice(0,n);
export const contactKb=()=>({keyboard:[[{text:TEXT.share,request_contact:true}]],resize_keyboard:true,one_time_keyboard:true});

const schema={type:'OBJECT',properties:{reply:{type:'STRING'},escalate:{type:'BOOLEAN'},reason:{type:'STRING'},collect_contact:{type:'BOOLEAN'},name:{type:'STRING'}},required:['reply','escalate','reason','collect_contact']};

// One generateContent call with a deadline; returns {reply,escalate,reason,collect_contact,name} or throws a key-free Error.
async function gemini(env,system,contents,ms){
 const model=encodeURIComponent(String(env.GEMINI_MODEL||GEMINI_MODEL));
 const res=await fetch(GEMINI_URL+model+':generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},signal:AbortSignal.timeout(ms),
  body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents,generationConfig:{temperature:LIM.temperature,maxOutputTokens:LIM.maxOutTokens,responseMimeType:'application/json',responseSchema:schema}})});
 if(!res.ok)throw new Error('gemini http '+res.status);
 const d=await res.json().catch(()=>({}));
 if(d.promptFeedback?.blockReason)throw new Error('gemini blocked');
 const raw=(d.candidates?.[0]?.content?.parts||[]).map(x=>x.text||'').join('');
 const o=parse(raw,null);
 if(!o||typeof o.reply!=='string'||!o.reply.trim())throw new Error('gemini bad output');
 return {reply:o.reply,escalate:o.escalate===true,reason:cut(o.reason,200),collect_contact:o.collect_contact===true,name:cut(o.name,60)};
}
async function askModel(env,system,contents,notify){
 const t0=Date.now();let last;
 for(let i=0;i<2;i++){
  const left=LIM.budget-(Date.now()-t0);if(left<2000)break;
  try{await notify?.();return await gemini(env,system,contents,Math.min(LIM.timeout,left))}
  catch(e){last=e;console.error('support ai',String(e?.message||e).slice(0,80))}
 }
 throw last||new Error('gemini failed');
}
// Never show the prompt or a key, whatever the model produced; plain text only.
export function cleanReply(s){
 let t=String(s||'').replace(/[*#`]+/g,'').replace(/<[^>]*>/g,'').trim();
 if(t.includes(PROMPT_MARKER)||/AIza[0-9A-Za-z_-]{20,}/.test(t)||t.includes('systemInstruction'))return TEXT.leak;
 return t.slice(0,LIM.maxReply);
}
export const mobileIn=t=>{const m=digits(String(t||'')).replace(/[\s()-]/g,'').match(/(?:\+98|0098|98|0)?9\d{9}/);return m?normalizeMobile(m[0]):''};

/* ---------- state ---------- */
async function loadHist(db,p,chat,now){
 const r=await one(db,'SELECT * FROM support_hist WHERE platform=? AND chat_id=?',p,chat);
 if(!r||now-r.updated_at>LIM.ttl)return {turns:[],awaiting:false};
 const turns=parse(r.turns,[]);return {turns:Array.isArray(turns)?turns.slice(-LIM.turns):[],awaiting:!!r.awaiting_contact};
}
const saveHist=(db,p,chat,turns,awaiting,now)=>run(db,'INSERT INTO support_hist(platform,chat_id,turns,awaiting_contact,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(platform,chat_id) DO UPDATE SET turns=excluded.turns,awaiting_contact=excluded.awaiting_contact,updated_at=excluded.updated_at',p,chat,JSON.stringify(turns.slice(-LIM.turns)),awaiting?1:0,now);
const knownPhone=async(db,p,chat)=>(await one(db,"SELECT phone FROM support_escalations WHERE platform=? AND chat_id=? AND phone<>'' ORDER BY updated_at DESC LIMIT 1",p,chat))?.phone||'';
const summary=turns=>turns.slice(-6).map(t=>(t.r==='user'?'کاربر: ':'پشتیبان: ')+cut(t.t,160)).join('\n').slice(0,700);
const tag=(p,chat)=>p+' …'+String(chat).slice(-4);

async function escalate(ctx,turns,reason,name){
 const {env,db,p,chat}=ctx,now=Date.now();
 const ex=await one(db,"SELECT * FROM support_escalations WHERE platform=? AND chat_id=? AND status='new' AND created_at>? ORDER BY created_at DESC LIMIT 1",p,chat,now-86400000);
 const phone=ex?.phone||await knownPhone(db,p,chat),nm=name||ex?.name||ctx.name||'';
 if(ex){await run(db,'UPDATE support_escalations SET last_messages=?,reason=?,name=?,phone=?,updated_at=? WHERE id=?',summary(turns),reason||ex.reason,nm,phone,now,ex.id);return}
 await run(db,'INSERT INTO support_escalations(id,platform,chat_id,name,phone,last_messages,reason,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)',uid(),p,chat,nm,phone,summary(turns),reason,'new',now,now);
 await notifyOwner(env,{kind:'support',level:'info',text:'مشتری نیاز به کارشناس دارد ('+tag(p,chat)+'): '+(reason||'بدون دلیل'),detail:'نام: '+(nm||'—')+'\nشماره: '+(phone||'هنوز نگرفته‌ایم')+'\n'+summary(turns)});
}
async function saveContact(ctx,phone,turns,name){
 const {env,db,p,chat}=ctx,now=Date.now();
 let ex=await one(db,"SELECT * FROM support_escalations WHERE platform=? AND chat_id=? AND status='new' ORDER BY created_at DESC LIMIT 1",p,chat);
 if(ex)await run(db,'UPDATE support_escalations SET phone=?,name=CASE WHEN name=\'\' THEN ? ELSE name END,updated_at=? WHERE id=?',phone,name,now,ex.id);
 else await run(db,'INSERT INTO support_escalations(id,platform,chat_id,name,phone,last_messages,reason,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)',uid(),p,chat,name,phone,summary(turns),'شمارهٔ تماس از مشتری',  'new',now,now);
 await notifyOwner(env,{kind:'support',level:'info',text:'شمارهٔ تماس مشتری پشتیبانی رسید ('+tag(p,chat)+')',detail:'نام: '+(name||ex?.name||ctx.name||'—')+'\nشماره: '+phone+'\nموضوع: '+(ex?.reason||'—')});
}

/* ---------- entry point; true = handled ---------- */
export async function supportMessage(ctx,m,textIn){
 try{
  const {env,db,p,chat}=ctx,now=Date.now();
  const contact=m.contact?.phone_number?normalizeMobile(m.contact.phone_number):'';
  const text=cut(textIn,LIM.maxIn);
  if(!contact&&(!text||text.startsWith('/')))return false;
  const hist=await loadHist(db,p,chat,now);
  if(contact||(hist.awaiting&&mobileIn(text))){
   const phone=contact||mobileIn(text);
   const turns=[...hist.turns,{r:'user',t:contact?'(شمارهٔ تماس فرستاده شد)':text}];
   await saveContact(ctx,phone,turns,cut(m.contact?.first_name,60));
   await saveHist(db,p,chat,[...turns,{r:'model',t:TEXT.thanks}],false,now);
   await ctx.say(TEXT.thanks,{reply_markup:{remove_keyboard:true}});return true;
  }
  if(!text)return false;
  try{await limited(db,'aisup:'+p+':'+chat+':'+Math.floor(now/3600000),LIM.perHour,TEXT.rate)}
  catch(e){if(e instanceof Problem&&e.status===429){await ctx.say(TEXT.rate);return true}throw e}
  const job=respond(ctx,text,hist,now).catch(e=>console.error('support',String(e?.message||e).slice(0,80)));
  if(ctx.hasExec)ctx.wait(job);else await job;
  return true;
 }catch(e){console.error('support',String(e?.message||e).slice(0,80));return false}
}
async function respond(ctx,text,hist,now){
 const {env,db,p,chat}=ctx,typing=()=>call(env,p,'sendChatAction',{chat_id:chat,action:'typing'}).catch(()=>{});
 await typing();
 const phone=await knownPhone(db,p,chat);
 const system=SUPPORT_PROMPT.replaceAll('{{SITE}}',String(env.APP_ORIGIN||ctx.origin||'').replace(/\/+$/,''))+
  '\n\n# وضعیت این گفتگو\nپلتفرم: '+(p==='bale'?'بله':'تلگرام')+'\nنام نمایشی کاربر: '+(ctx.name||'نامشخص')+'\nشمارهٔ تماس: '+(phone?'قبلاً داده شده؛ دوباره نخواه':'هنوز نداریم');
 const contents=[...hist.turns.map(t=>({role:t.r==='user'?'user':'model',parts:[{text:t.t}]})),{role:'user',parts:[{text}]}];
 let out=null;
 if(env.GEMINI_API_KEY){try{out=await askModel(env,system,contents,typing)}catch{out=null}}
 let reply,esc,reason,want,name='';
 if(out){reply=cleanReply(out.reply);esc=out.escalate;reason=out.reason;want=out.collect_contact;name=out.name}
 else{reply=TEXT.fallback;esc=true;reason='پاسخ خودکار در دسترس نبود';want=true}
 const turns=[...hist.turns,{r:'user',t:text},{r:'model',t:reply}];
 if(esc)await escalate(ctx,turns,reason,name).catch(e=>console.error('support esc',String(e?.message||e).slice(0,80)));
 const ask=want&&!phone;
 await saveHist(db,p,chat,turns,ask,Date.now());
 await ctx.say(ask&&!out?reply+'\n\n'+TEXT.askContact:reply,ask?{reply_markup:contactKb()}:{});
}
export async function supportCleanup(db){await run(db,'DELETE FROM support_hist WHERE updated_at<?',Date.now()-2*LIM.ttl)}
