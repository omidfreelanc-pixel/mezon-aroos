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
export const LIM={turns:10,ttl:86400000,maxIn:800,perHour:20,maxOutTokens:768,timeout:20000,budget:27000,maxReply:1200,temperature:0.4};
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
const modelOf=env=>String(env.GEMINI_MODEL||GEMINI_MODEL);
// Thinking control per model family (Gemini docs): 2.5 flash takes thinkingBudget 0; 3.x takes thinkingLevel.
// 'minimal' exists only on some 3.x models (3.6-flash, flash-lite, 3-flash-preview); 3.8-flash and unknown/alias ids get 'low'.
export function thinkingFor(model){
 if(/2\.5-flash/.test(model))return {thinkingBudget:0};
 if(/gemini-3\.6-flash|gemini-3(\.\d)?-flash-(lite|preview)/.test(model)&&!/image/.test(model))return {thinkingLevel:'minimal'};
 if(/gemini-3|gemini-4|-latest/.test(model))return {thinkingLevel:'low'};
 return null;
}
const redact=(env,s)=>String(s||'').split(env.GEMINI_API_KEY||'\u0000').join('[key]').replace(/AIza[0-9A-Za-z_-]{10,}/g,'[key]').replace(/\s+/g,' ').trim().slice(0,200);
const bad=(msg,status,extra={})=>Object.assign(new Error(msg),{status,...extra});
const genBody=(system,contents,{schemaMode='none',think=null,tokens=LIM.maxOutTokens,mime=true}={})=>{
 const cfg={temperature:LIM.temperature,maxOutputTokens:tokens};
 if(mime)cfg.responseMimeType='application/json';
 if(think)cfg.thinkingConfig=think;
 if(schemaMode!=='none')cfg.responseSchema=schema(schemaMode==='lower');
 const text=schemaMode==='none'&&mime?system+JSON_HINT:system;
 return {...(text?{systemInstruction:{parts:[{text}]}}:{}),contents,generationConfig:cfg};
};
// One HTTP call. Never throws for HTTP errors: returns {status,ms,text}; a timeout/network error gives status 0 and err.
async function post(env,model,body,ms){
 const t=Date.now();
 try{
  const res=await fetch(GEMINI_URL+encodeURIComponent(model)+':generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},signal:AbortSignal.timeout(ms),body:JSON.stringify(body)});
  return {status:res.status,ms:Date.now()-t,text:await res.text().catch(()=>'')};
 }catch(e){return {status:0,ms:Date.now()-t,err:e?.name==='TimeoutError'||/timeout|abort/i.test(e?.message||'')?'timeout':'network'}}
}
const readOut=text=>{
 const d=parse(text,{});
 if(d.promptFeedback?.blockReason)return {err:'blocked'};
 const raw=(d.candidates?.[0]?.content?.parts||[]).map(x=>x.text||'').join('').replace(/^\s*```(?:json)?|```\s*$/g,'');
 const o=parse(raw,null);
 if(!o||typeof o.reply!=='string'||!o.reply.trim())return {err:'bad output'};
 return {out:{reply:o.reply,escalate:o.escalate===true,reason:cut(o.reason,200),collect_contact:o.collect_contact===true,name:cut(o.name,60)}};
};
// Tries thinking settings in order (e.g. minimal -> low -> none) while the answer is a 400, within one deadline.
async function chain(env,model,body0,ms,{schemaMode='none',system,contents,tokens,mime=true}){
 const th=thinkingFor(model),thinks=[th,th?.thinkingLevel==='minimal'?{thinkingLevel:'low'}:null,null].filter((x,i,a)=>a.findIndex(y=>JSON.stringify(y)===JSON.stringify(x))===i);
 const t0=Date.now();let r;
 for(const think of thinks){
  const left=ms-(Date.now()-t0);if(left<1500)return {...(r||{status:0,err:'timeout'}),ms:Date.now()-t0};
  r=await post(env,model,genBody(system,contents,{schemaMode,think,tokens,mime}),left);r.think=think;
  if(r.status!==400)break;
 }
 return {...r,ms:Date.now()-t0};
}
// Production call. Default: plain JSON mode (JSON mime type + an instruction), the most tolerant; a 400 falls back to
// responseSchema. Throws a key-free Error carrying {status,ms,model,snippet}.
async function gemini(env,system,contents,ms,model=modelOf(env)){
 const t0=Date.now();let r;
 for(const schemaMode of ['none','upper','lower']){
  const left=ms-(Date.now()-t0);if(left<1500)throw bad('timeout',0,{ms:Date.now()-t0,model,snippet:''});
  r=await chain(env,model,null,left,{schemaMode,system,contents});
  if(r.status===400)continue;
  if(r.status===0)throw bad(r.err,0,{ms:Date.now()-t0,model,snippet:''});
  if(r.status<200||r.status>=300)throw bad('http '+r.status,r.status,{ms:Date.now()-t0,model,snippet:redact(env,r.text)});
  const o=readOut(r.text);
  if(o.err)throw bad(o.err,-1,{ms:Date.now()-t0,model,snippet:o.err==='bad output'?redact(env,r.text).slice(0,120):''});
  return {...o.out,_ms:Date.now()-t0};
 }
 throw bad('http 400',400,{ms:Date.now()-t0,model,snippet:redact(env,r?.text)});
}
// Last failure / success for later reading from D1 (app_settings.support_last_error / support_last_ok). Never keys or user text.
const noteError=(db,e,model)=>setSetting(db,'support_last_error',JSON.stringify({at:new Date().toISOString(),model:e?.model||model,ms:e?.ms??null,status:e?.status??null,reason:String(e?.message||e||'failed').slice(0,60),snippet:e?.snippet||''})).catch(()=>{});
// Walks a model chain (env model first, then fallbacks) and moves on only for overload-type failures: 429, 5xx or a timeout.
// Each model gets a shorter deadline so a stuck/overloaded model cannot eat the whole budget.
export const FALLBACK_MODELS=['gemini-3.6-flash','gemini-3.7-flash','gemini-3.5-flash-lite'];
export const modelChain=env=>[...new Set([modelOf(env),...FALLBACK_MODELS])];
async function askModel(env,system,contents,notify){
 const t0=Date.now();let last,lastModel=modelOf(env);const chainM=modelChain(env);
 for(let i=0;i<chainM.length;i++){
  const model=chainM[i],left=LIM.budget-(Date.now()-t0);if(left<2500)break;
  const per=i===chainM.length-1?left:Math.min(LIM.timeout-8000>6000?LIM.timeout-8000:9000,left);
  lastModel=model;
  try{await notify?.();const r=await gemini(env,system,contents,per,model);await setSetting(env.DB,'support_last_ok',JSON.stringify({at:new Date().toISOString(),model,ms:r._ms})).catch(()=>{});return r}
  catch(e){last=e;console.error('support ai',model,String(e?.message||e).slice(0,40),e?.status);if(!(e?.status===429||e?.status>=500||e?.status===0||e?.status===404))break}
 }
 await noteError(env.DB,last,lastModel);
 throw last||new Error('gemini failed');
}

/* ---------- diagnostics: /aicheck (owner chat) and POST /api/internal/ai-check ---------- */
async function listFlash(env,max){
 const t=Date.now();
 try{
  const res=await fetch(GEMINI_URL.replace(/models\/$/,'models')+'?pageSize=200',{headers:{'x-goog-api-key':env.GEMINI_API_KEY},signal:AbortSignal.timeout(10000)});
  const d=await res.json().catch(()=>({}));
  return {status:res.status,ms:Date.now()-t,names:(d.models||[]).map(x=>String(x.name||'').replace(/^models\//,'')).filter(n=>n.includes('flash')).slice(0,max),error_snippet:res.ok?'':redact(env,JSON.stringify(d))};
 }catch(e){return {status:0,ms:Date.now()-t,names:[],error_snippet:e?.name==='TimeoutError'?'timeout':'network'}}
}
// One probe: label, model, prompt, mode ('plain'|'schema'), per-probe deadline. Never throws.
async function probe(env,{model,system,user,schemaMode='none',tokens=64,ms=12000,mime=true}){
 const contents=[{role:'user',parts:[{text:user}]}];
 const r=await chain(env,model,null,ms,{schemaMode,system,contents,tokens,mime});
 const body=parse(r.text,{}),got=(body.candidates?.[0]?.content?.parts||[]).map(x=>x.text||'').join('');
 const ok=r.status>=200&&r.status<300&&!!got;
 return {model,mode:(schemaMode==='none'?'plain':'schema')+(r.think?'/'+(r.think.thinkingLevel||'b'+r.think.thinkingBudget):''),status:r.status||null,ms:r.ms,ok,error_snippet:ok?'':String(r.err||redact(env,r.text)||'empty').slice(0,120)};
}
// Runs all probes in parallel (each has its own deadline), so the whole report fits well inside the 25 s guard.
export async function aiProbes(env){
 const model=modelOf(env);
 if(!env.GEMINI_API_KEY)return {model,rows:[],models:{status:null,ms:0,names:[]},error:'GEMINI_API_KEY missing'};
 const tiny='فقط بگو سلام',full=SUPPORT_PROMPT.replaceAll('{{SITE}}',String(env.APP_ORIGIN||'').replace(/\/+$/,''));
 const models=await listFlash(env,20),has=n=>models.names.includes(n);
 const jobs=[
  probe(env,{model,system:'',user:tiny,tokens:64,ms:12000,mime:false}),
  probe(env,{model,system:full,user:'سلام',tokens:LIM.maxOutTokens,ms:12000}),
  probe(env,{model,system:full,user:'سلام',tokens:LIM.maxOutTokens,ms:12000,schemaMode:'upper'}),
  ...['gemini-flash-latest','gemini-flash-lite-latest'].filter(has).map(m=>probe(env,{model:m,system:'',user:tiny,tokens:64,ms:10000,mime:false}))];
 const labels=['tiny','full-prompt plain','full-prompt schema','tiny alias','tiny alias'];
 const rows=(await Promise.all(jobs)).map((r,i)=>({label:labels[i],...r}));
 return {model,rows,models};
}
export function formatProbes(d){
 if(d.error)return 'آزمایش AI: '+d.error;
 const l=[ 'مدل فعلی: '+d.model,'', 'مدل‌های flash این کلید ('+d.models.status+', '+d.models.ms+'ms):',(d.models.names.join('\n')||d.models.error_snippet||'—'),'','نتیجهٔ آزمایش‌ها (مدل | حالت | وضعیت | ms | خطا):'];
 for(const r of d.rows)l.push(r.label+' | '+r.model+' | '+r.mode+' | '+(r.status??'timeout')+' | '+r.ms+'ms | '+(r.ok?'ok':r.error_snippet));
 return l.join('\n').slice(0,3800);
}
// /aicheck from the owner chat: probes run in the background (waitUntil) and the report arrives as a message.
export async function aiCheckCommand(ctx){
 const job=(async()=>{
  await ctx.say('در حال آزمایش اتصال به Gemini… (حدود ۱۵ ثانیه)').catch(()=>{});
  let text;try{text=formatProbes(await Promise.race([aiProbes(ctx.env),new Promise(r=>setTimeout(()=>r({error:'زمان آزمایش از ۲۵ ثانیه گذشت',rows:[],models:{names:[]}}),25000))]))}catch(e){text='آزمایش ناموفق بود: '+String(e?.message||e).slice(0,100)}
  await ctx.say(text).catch(()=>{});
 })();
 if(ctx.hasExec)ctx.wait(job);else await job;
}
// POST /api/internal/ai-check (JOB_TOKEN): trivial JSON-schema and plain calls plus the flash model names.
export async function aiCheck(env){
 const model=modelOf(env);
 if(!env.GEMINI_API_KEY)return {model,status:null,ms:0,ok:false,error_snippet:'GEMINI_API_KEY missing'};
 const system='فقط یک JSON با کلید reply بده که مقدارش ok باشد. escalate و collect_contact را false و reason را خالی بگذار.';
 const one=async schemaMode=>{const r=await probe(env,{model,system,user:'پاسخ بده: ok',schemaMode,tokens:128,ms:LIM.timeout});return {status:r.status,ms:r.ms,ok:r.ok,error_snippet:r.error_snippet}};
 const [schemaRes,plain,models]=await Promise.all([one('upper'),one('none'),listFlash(env,15)]);
 return {model,thinking:thinkingFor(model),...schemaRes,plain,models};
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
 else await noteError(db,{message:'no GEMINI_API_KEY'},modelOf(env));
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
