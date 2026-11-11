// AI support agent for free-text messages to the platform bot (Telegram + Bale).
// Gemini answers as a polite support person; anything uncertain or commercial goes to a human: a row in
// support_escalations plus a short note to the owner chat. Secrets: GEMINI_API_KEY (required), GEMINI_MODEL (optional).
// The key is only ever sent as a request header; it is never logged or stored. Nothing here throws into the webhook.
import {Problem,limited,uid,digits} from './domain.js';
import {notifyOwner,setSetting} from './alerts.js';
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

const schema=lower=>{const T=x=>lower?x.toLowerCase():x;return {type:T('OBJECT'),properties:{reply:{type:T('STRING')},escalate:{type:T('BOOLEAN')},reason:{type:T('STRING')},collect_contact:{type:T('BOOLEAN')},name:{type:T('STRING')}},required:['reply','escalate','reason','collect_contact']}};
const JSON_HINT='\n\nخروجی را فقط به صورت یک شیء JSON معتبر بده، بدون هیچ متن دیگر و بدون بلاک کد، با کلیدهای reply (رشته)، escalate (بولی)، reason (رشته)، collect_contact (بولی) و name (رشته).';
const bad=(msg,status)=>Object.assign(new Error(msg),{status});
// One generateContent call. A 400 (schema rejected) is retried with the other type casing, then without responseSchema
// (JSON mime type + an instruction in the prompt). Returns {reply,escalate,reason,collect_contact,name} or throws a key-free Error with .status.
async function gemini(env,system,contents,ms){
 const model=encodeURIComponent(String(env.GEMINI_MODEL||GEMINI_MODEL)),t0=Date.now();
 for(const mode of ['upper','lower','none']){
  const left=ms-(Date.now()-t0);if(left<1500)throw bad('gemini timeout',0);
  const cfg={temperature:LIM.temperature,maxOutputTokens:LIM.maxOutTokens,responseMimeType:'application/json'};
  if(mode!=='none')cfg.responseSchema=schema(mode==='lower');
  const res=await fetch(GEMINI_URL+model+':generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},signal:AbortSignal.timeout(left),
   body:JSON.stringify({systemInstruction:{parts:[{text:mode==='none'?system+JSON_HINT:system}]},contents,generationConfig:cfg})});
  if(res.status===400&&mode!=='none')continue;
  if(!res.ok)throw bad('gemini http '+res.status,res.status);
  const d=await res.json().catch(()=>({}));
  if(d.promptFeedback?.blockReason)throw bad('gemini blocked',-1);
  const raw=(d.candidates?.[0]?.content?.parts||[]).map(x=>x.text||'').join('').replace(/^\s*```(?:json)?|```\s*$/g,'');
  const o=parse(raw,null);
  if(!o||typeof o.reply!=='string'||!o.reply.trim())throw bad('gemini bad output',-2);
  return {reply:o.reply,escalate:o.escalate===true,reason:cut(o.reason,200),collect_contact:o.collect_contact===true,name:cut(o.name,60)};
 }
 throw bad('gemini http 400',400);
}
// Last failure (status codes and short reasons only, never keys or user text) for later reading from D1: app_settings.support_last_error
const noteError=(db,reason,status)=>setSetting(db,'support_last_error',JSON.stringify({at:new Date().toISOString(),reason,status:status??null})).catch(()=>{});
async function askModel(env,system,contents,notify){
 const t0=Date.now();let last;
 for(let i=0;i<2;i++){
  const left=LIM.budget-(Date.now()-t0);if(left<2000)break;
  try{await notify?.();const r=await gemini(env,system,contents,Math.min(LIM.timeout,left));await setSetting(env.DB,'support_last_ok',new Date().toISOString()).catch(()=>{});return r}
  catch(e){last=e;console.error('support ai',String(e?.message||e).slice(0,60));if(e?.status===401||e?.status===403||e?.status===404)break}
 }
 await noteError(env.DB,String(last?.message||'failed').slice(0,60),last?.status);
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
export async function supportMessage(ctx,m,textIn,role=''){
 try{
  const {env,db,p,chat}=ctx,now=Date.now();
  if(role&&m.contact)return false; // linked chats keep their own contact handling
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
  const job=respond(ctx,text,hist,now,role).catch(e=>console.error('support',String(e?.message||e).slice(0,80)));
  if(ctx.hasExec)ctx.wait(job);else await job;
  return true;
 }catch(e){console.error('support',String(e?.message||e).slice(0,80));return false}
}
const ROLE={manager:'مدیر مزون (وارد شده و وصل به مزون)',owner:'مالک پلتفرم آینه (صاحب پروژه) که ربات را تست می‌کند',staff:'مزون‌دار عضو تیم یک مزون (وصل‌شده)'};
async function respond(ctx,text,hist,now,role=''){
 const {env,db,p,chat}=ctx,typing=()=>call(env,p,'sendChatAction',{chat_id:chat,action:'typing'}).catch(()=>{});
 await typing();
 const phone=await knownPhone(db,p,chat);
 const system=SUPPORT_PROMPT.replaceAll('{{SITE}}',String(env.APP_ORIGIN||ctx.origin||'').replace(/\/+$/,''))+
  '\n\n# وضعیت این گفتگو\nپلتفرم: '+(p==='bale'?'بله':'تلگرام')+'\nنام نمایشی کاربر: '+(ctx.name||'نامشخص')+'\nشمارهٔ تماس: '+(phone?'قبلاً داده شده؛ دوباره نخواه':'هنوز نداریم')+(role?'\n\n# زمینهٔ کاربر\nنقش: '+ROLE[role]+(ctx.salon?.name?'\nمزون: «'+ctx.salon.name+'»':'')+'\nاین کاربر از قبل به یک مزون وصل است؛ مثل پشتیبان یک مزون‌دار جواب بده (بخش «مدیر وصل‌شده»). شمارهٔ تماسش را برای ارجاع از او نخواه مگر واقعاً لازم باشد؛ فقط اگر وضعیت بالا می‌گوید شماره نداریم و ارجاع لازم است بخواه.':''); 
 const contents=[...hist.turns.map(t=>({role:t.r==='user'?'user':'model',parts:[{text:t.t}]})),{role:'user',parts:[{text}]}];
 let out=null;
 if(env.GEMINI_API_KEY){try{out=await askModel(env,system,contents,typing)}catch{out=null}}
 else await noteError(db,'no GEMINI_API_KEY',null);
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
