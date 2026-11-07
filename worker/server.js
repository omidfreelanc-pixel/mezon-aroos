import {Problem,must,phone,text,safeLink,transferPrompt,uid,token,hash,digits,limited} from './domain.js';
import {styles} from './legacy.js';
import {identity,issueCookie,clearCookie,same,passwordLoginEnabled} from './auth.js';
import {bucketFor,putImage} from './storage.js';
import {botReady,deliverLead,deliverPending,newLinkCode,setWebhook,inboxes,followLinks,PLATFORMS,platformReady,baleSecret,staffInvite,notifyConflict,expireStates} from './telegram.js';
import {LINE_KEYS,lineStyles,cleanOptions,linePrompt,optionText,LINE_LABEL} from './lines.js';
import {ownerLink,alertUnanswered,maybeDigest,setupStatus,digest,notifyOwner,setting} from './alerts.js';
import {attribute,ownerFor,createStaff,transfer,report,team as teamOf,liveStaff,SPECIALTIES} from './referral.js';
import {stats} from './stats.js';
import {smsReady,inviteReady,sendOtp} from './sms.js';
import {createTrial,trialOf,trialLive,trialPublic,spendTrialImage} from './trial.js';
export {putImage};

const J=(v,s=200,h={})=>new Response(JSON.stringify(v),{status:s,headers:{'Content-Type':'application/json;charset=utf-8','Cache-Control':'no-store',...h}});
const parse=s=>{try{return JSON.parse(s||'{}')}catch{return {}}};
const one=(db,sql,...args)=>db.prepare(sql).bind(...args).first();
const run=(db,sql,...args)=>db.prepare(sql).bind(...args).run();
const all=async(db,sql,...args)=>(await db.prepare(sql).bind(...args).all()).results;
const cookie=t=>'ayneh='+t+'; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800';
const PROFILE_TEXT=['bio','address','hours','manager'],PROFILE_LINKS=['map','instagram','website','telegram'],PROFILE_IMAGES=['logo','cover','portrait'];
const botInfo=env=>({token:botReady(env),secret:!!env.TELEGRAM_WEBHOOK_SECRET,username:PLATFORMS.telegram.user(env),telegram:{ready:platformReady(env,'telegram'),username:PLATFORMS.telegram.user(env)},bale:{ready:platformReady(env,'bale'),username:PLATFORMS.bale.user(env),secret:!!baleSecret(env)}});
// The salon's own work is tryable on customers by default; an owner may switch it off.
const refOn=cfg=>cfg.reference_verified!==false;
// Output shape follows the customer's photo (a hand or an eye close-up is rarely 3:4).
const RATIOS=['1:1','2:3','3:2','3:4','4:3','4:5','5:4','9:16','16:9'];
// Each person gets a few images per service (trial and demo pages have their own budgets) (hairstyle, hair colour, nails, lashes) on a salon page,
// so a test day cannot run up the image bill. A person is this session, this browser id and, once
// verified, this mobile. Failed images do not count; the 360 view counts as a hairstyle image.
// Images a salon page may make per day across all its customers (owner setting; 0 = no cap).
export const DAILY_LIMIT=0;
const dailyLimit=cfg=>Number.isInteger(cfg?.daily_limit)?cfg.daily_limit:DAILY_LIMIT;
// The 360 view: the front is her own result photo; only her left profile, the back of her head and
// her right profile are made, three large tiles in one row, so no face is redrawn from the front.
export const VIEWS_PROMPT='Hair consultation turnaround of the SAME woman as photo 1. Exactly 3 equal tiles side by side in one row, no gaps, borders, labels or numbers: tile 1 = exact side profile with her nose pointing to the LEFT edge of the image, tile 2 = the BACK of her head (180 degrees) showing the whole hairstyle from behind, tile 3 = exact side profile with her nose pointing to the RIGHT edge of the image. The two profiles face opposite directions, like a turntable. Each tile: head and shoulders, the same scale and framing, the same plain light background and soft even light. HAIR: in every tile the haircut, length, layers, parting, volume, texture, styling and hair COLOUR, roots and highlights are exactly as in photo 1, seen from that side. FACE: in the profiles keep her real nose, lips, chin, jawline, ear and skin tone from photo 1, natural and unretouched; never beautify, slim or change her face; same clothing neckline as photo 1. Photorealistic, high detail. No text, watermark or collage frame.';
export const QUOTA_PER_LINE=1000 /* TEMP: limits off while testing; the plan is 8 */;
async function quotaUsed(db,salon,s,visitor){
 const rows=await all(db,"SELECT line,COUNT(*) n FROM generations WHERE salon_id=? AND state<>'fail' AND (session_id=? OR (?<>'' AND visitor=?) OR (? IS NOT NULL AND session_id IN (SELECT id FROM sessions WHERE salon_id=? AND verified_phone=?))) GROUP BY line",salon.id,s.id,visitor,visitor,s.verified_phone||null,salon.id,s.verified_phone||null);
 const used={dress:0};for(const r of rows)used[LINE_KEYS.includes(r.line)?r.line:'dress']+=Number(r.n);
 return used;
}
const quotaLeft=used=>Object.fromEntries(LINE_KEYS.map(k=>[k,Math.max(0,QUOTA_PER_LINE-used[k])]));
async function spendQuota(db,salon,s,visitor,line){
 const left=quotaLeft(await quotaUsed(db,salon,s,visitor));
 if(left[line]>0)return;
 const others=LINE_KEYS.filter(k=>k!==line&&left[k]>0).map(k=>'«'+LINE_LABEL[k]+'»');
 throw new Problem(429,'سهم امتحان «'+LINE_LABEL[line]+'» برای شما تمام شد ('+QUOTA_PER_LINE.toLocaleString('fa-IR')+' تصویر). '+(others.length?'هنوز می‌توانی '+others.join('، ')+' را امتحان کنی، یا همین نتیجه‌ها را برای مزون بفرستی.':'سهم امتحان همهٔ بخش‌ها تمام شده؛ می‌توانی همین نتیجه‌ها را برای مزون بفرستی تا با تو تماس بگیرند.'));
}
// The project's own team: verified mobiles listed in app_settings 'unlimited_phones' (a JSON list,
// kept in the database, never in the code) have no image limits at all.
async function unlimited(db,s){if(!s?.verified_phone)return false;try{const list=JSON.parse(await setting(db,'unlimited_phones')||'[]');return Array.isArray(list)&&list.includes(s.verified_phone)}catch{return false}}
const visitorOf=b=>/^[a-f0-9]{16,32}$/.test(String(b?.v||''))?String(b.v):'';
const refLink=(env,origin,salon,t)=>(env.APP_ORIGIN||origin)+'/s/'+salon.slug+'?r='+t.ref_code;
async function teamView(db,env,salon,origin){return (await teamOf(db,salon.id)).map(t=>({id:t.id,name:t.name,specialty:t.specialty,telegram:!!t.telegram_chat_id,bale:!!t.bale_chat_id,invite_pending:!!t.invite_hash&&t.invite_expires>Date.now(),ref:refLink(env,origin,salon,t)}))}
// Anonymous usage events for the dashboard. The visitor id is random and made by the browser.
export const TRACK_KINDS=['view','tour_start','tour_done','tour_skip','about','photo','look','color','generate','result','gen_fail','view360','send_open','sent','follow','rating','demo','share_open','share','line','color_on_hair','save'];
export async function logEvent(db,salonId,kind,visitor='',meta=''){await run(db,'INSERT INTO events_log(id,salon_id,visitor,kind,meta,created_at) VALUES(?,?,?,?,?,?)',uid(),salonId,/^[a-f0-9]{16,32}$/.test(visitor)?visitor:'',kind,String(meta||'').slice(0,80),Date.now())}
function publicSalon(s){return {id:s.id,slug:s.slug,name:s.name,profile:parse(s.profile)};}

// The salon panel is gone; only the project owner manages salons.
export async function owner(req,env){const who=await identity(req,env);must(who,'برای ورود، رمز مدیر را وارد کنید',401);must(who.via==='password'||(env.OWNER_EMAIL&&who.email===env.OWNER_EMAIL),'فقط مدیر آینه به این بخش دسترسی دارد',403);return who;}
export async function session(req,db,salon){const t=(req.headers.get('cookie')||'').match(/(?:^|; )ayneh=([a-f0-9]{64})(?:;|$)/)?.[1];must(t,'جلسه پیدا نشد؛ صفحه را تازه کنید',401);const s=await one(db,'SELECT * FROM sessions WHERE token_hash=? AND salon_id=? AND expires_at>?',await hash(t),salon.id,Date.now());must(s,'جلسه منقضی شده؛ صفحه را تازه کنید',401);return s;}
async function newSession(db,salon){const raw=token(),s={id:uid(),salon_id:salon.id,customer_id:null,token_hash:await hash(raw),expires_at:Date.now()+7*86400000,created_at:Date.now()};await run(db,'INSERT INTO sessions(id,salon_id,customer_id,token_hash,expires_at,created_at) VALUES(?,?,?,?,?,?)',...Object.values(s));return {s,raw};}
const clientIp=req=>req.headers.get('cf-connecting-ip')||(req.headers.get('x-forwarded-for')||'').split(',')[0].trim()||req.headers.get('x-real-ip')||'unknown';
// A customer may only use their own uploads, or published portfolio items the salon marked for try-on.
async function ownMedia(db,s,id){const m=await one(db,'SELECT * FROM media WHERE id=? AND salon_id=?',id,s.salon_id);must(m,'عکس یافت نشد');if(m.session_id!==s.id)must(await one(db,"SELECT 1 FROM portfolio WHERE salon_id=? AND published=1 AND try_on=1 AND EXISTS(SELECT 1 FROM json_each(images) WHERE value=?)",s.salon_id,id),'عکس متعلق به این جلسه نیست',403);return m;}

// Retention: customer photos, simulations and submissions are kept (the owner asked for permanent
// records: referrals and customer ownership depend on them). Only expired technical rows go.
async function cleanup(env){const now=Date.now();
 await run(env.DB,'DELETE FROM sessions WHERE expires_at<? AND id NOT IN(SELECT session_id FROM requests) AND id NOT IN(SELECT session_id FROM leads) AND id NOT IN(SELECT session_id FROM generations) AND id NOT IN(SELECT session_id FROM media WHERE session_id IS NOT NULL)',now);
 await run(env.DB,'DELETE FROM limits WHERE expires_at<?',now);
 await run(env.DB,'DELETE FROM otps WHERE expires_at<?',now);
 await run(env.DB,'DELETE FROM events_log WHERE created_at<?',now-400*86400000);
 await run(env.DB,'DELETE FROM bot_seen WHERE created_at<?',now-3*86400000);
 await run(env.DB,'DELETE FROM activity WHERE created_at<?',now-400*86400000);
 return {media:0,leads:0};
}
export async function tick(env,origin){if(!env.DB)return {ready:false};const delivered=await deliverPending(env,origin);
 const expired=await expireStates(env).catch(e=>{console.error('expire',e?.message);return 0});
 const unanswered=await alertUnanswered(env).catch(e=>{console.error('unanswered',e?.message);return 0});
 const digestSent=await maybeDigest(env).catch(e=>{console.error('digest',e?.message);return false});
 const cleaned=await cleanup(env);return {ready:true,delivered,expired,unanswered,digest:digestSent,...cleaned};}

async function provider(env,path,body){must(env.KIE_API_KEY,'تولید واقعی هنوز متصل نشده است',503);const res=await fetch('https://api.kie.ai'+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+env.KIE_API_KEY,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const d=await res.json();must(res.ok&&d.code===200,'سرویس تصویر درخواست را نپذیرفت',502);return d.data;}
// Image model per salon: 'pro' (Nano Banana Pro, best quality, default) or 'fast' (Nano Banana 2.1).
// A definite rejection of the chosen model (e.g. not enabled on the account) falls back to the
// previous model; network failures are not retried so a paid task is never created twice.
export const IMAGE_MODELS={pro:'nano-banana-pro',fast:'nano-banana-2-1'};
const FALLBACK_MODEL='nano-banana-2';
async function createImageTask(env,cfg,input){const model=IMAGE_MODELS[cfg.image_model]||IMAGE_MODELS.pro;try{return {...await provider(env,'/api/v1/jobs/createTask',{model,input}),model}}catch(e){if(!(e instanceof Problem)||e.status!==502||model===FALLBACK_MODEL)throw e;return {...await provider(env,'/api/v1/jobs/createTask',{model:FALLBACK_MODEL,input}),model:FALLBACK_MODEL}}}
async function uploadProvider(env,m){const object=await bucketFor(env).get(m.object_key);must(object,'عکس در دسترس نیست',410);const bytes=new Uint8Array(await object.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.slice(i,i+8192));const res=await fetch('https://kieai.redpandaai.co/api/file-base64-upload',{method:'POST',headers:{Authorization:'Bearer '+env.KIE_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({base64Data:'data:'+m.mime+';base64,'+btoa(binary),uploadPath:'ayneh',fileName:uid()+'.jpg'})});const d=await res.json();must(d.success&&d.data?.downloadUrl,'ارسال عکس انجام نشد',502);return d.data.downloadUrl;}

export async function api(req,env){const u=new URL(req.url),path=u.pathname;must(env.DB,'پایگاه داده هنوز آماده نیست',503);const db=env.DB;
 if(req.method!=='GET'){must(req.headers.get('origin')===u.origin,'مبدأ درخواست مجاز نیست',403);must(Number(req.headers.get('content-length')||0)<12000000,'حجم درخواست زیاد است',413);}
 if(path==='/api/inquiry'&&req.method==='POST'){
  await limited(db,'inquiry:'+clientIp(req),5,'درخواست‌های زیادی فرستاده‌ای؛ کمی بعد دوباره امتحان کن');
  const b=await req.json().catch(()=>({}));
  if(String(b.website||'').trim())return J({ok:true});// honeypot: bots fill it, people never see it
  must(b.consent===true,'برای ارسال، تأیید تماس لازم است');
  const name=text(String(b.name||''),60),salon=text(String(b.salon||''),80),city=text(String(b.city||''),40),note=text(String(b.note||''),300),chosen=text(String(b.chosen||''),90);
  must(name.length>=2,'نام را بنویس');must(salon.length>=2,'نام مزون را بنویس');
  const tel=phone(b.phone),id=uid();
  await run(db,'INSERT INTO inquiries(id,name,salon,city,phone,note,chosen,created_at) VALUES(?,?,?,?,?,?,?,?)',id,name,salon,city,tel,note,chosen,Date.now());
  await notifyOwner(env,{kind:'inquiry',level:'good',text:'درخواست معرفی آینه از «'+salon+'»'+(city?' ('+city+')':'')+' ثبت شد',detail:'👤 '+name+'\n📞 '+tel+(chosen?'\n✨ انتخاب در آینه: '+chosen:'')+(note?'\n📝 '+note:'')});
  return J({ok:true});
 }
 if(path==='/api/trial'&&req.method==='POST'){
  await limited(db,'trial:'+clientIp(req),12,'از این شبکه چند صفحهٔ آزمایشی ساخته شده؛ فردا دوباره امتحان کنید');
  const b=await req.json().catch(()=>({}));
  if(String(b.website||'').trim())return J({ok:true,path:'/'});// honeypot
  return J(await createTrial(db,env,u.origin,b));
 }
 if(path==='/api/me'){const who=await identity(req,env);const isOwner=!!who&&(who.via==='password'||(!!env.OWNER_EMAIL&&who.email===env.OWNER_EMAIL));return J({user:!!who,owner:isOwner,email:who?.email||'',passwordLogin:passwordLoginEnabled(env)});}
 if(path==='/api/login'&&req.method==='POST'){must(passwordLoginEnabled(env),'ورود با رمز روی این میزبان فعال نیست',503);await limited(db,'login:'+clientIp(req),20);const b=await req.json();const given=await hash(String(b?.password||''));const expected=env.OWNER_PASSWORD_HASH?String(env.OWNER_PASSWORD_HASH).toLowerCase():await hash(String(env.OWNER_PASSWORD));must(same(given,expected),'رمز عبور نادرست است',401);return J({ok:true},200,{'Set-Cookie':await issueCookie(env,env.OWNER_ID||'owner',env.OWNER_EMAIL||'',u.protocol==='https:')});}
 if(path==='/api/logout'&&req.method==='POST')return J({ok:true},200,{'Set-Cookie':clearCookie(u.protocol==='https:')});
 if(path==='/api/owner'&&req.method==='GET'){await owner(req,env);const rows=await all(db,"SELECT id,slug,name,profile,telegram_chat_id IS NOT NULL AS telegram,bale_chat_id IS NOT NULL AS bale,(SELECT count(*) FROM portfolio p WHERE p.salon_id=salons.id AND p.published=1) AS portfolio,(SELECT count(*) FROM leads l WHERE l.salon_id=salons.id) AS leads,(SELECT count(*) FROM team t WHERE t.salon_id=salons.id AND t.active=1) AS team,(SELECT count(*) FROM team t WHERE t.salon_id=salons.id AND t.active=1 AND (t.telegram_chat_id IS NOT NULL OR t.bale_chat_id IS NOT NULL)) AS team_linked,(SELECT count(*) FROM leads l WHERE l.salon_id=salons.id AND l.waiting=1) AS waiting,(SELECT count(*) FROM leads l WHERE l.salon_id=salons.id AND l.status='sent' AND l.salon_status='new' AND l.created_at<"+(Date.now()-86400000)+") AS overdue FROM salons ORDER BY created_at DESC");
  return J({salons:rows.map(r=>{const st=setupStatus(r);const {profile,...rest}=r;return {...rest,setup:{filled:st.filled.length,total:st.total,missing:st.missing}}}),alerts:{chats:(await all(db,'SELECT platform FROM owner_chats')).map(x=>x.platform)},activity:await all(db,'SELECT a.kind,a.level,a.text,a.created_at FROM activity a ORDER BY a.created_at DESC LIMIT 60'),bot:botInfo(env),image:!!env.KIE_API_KEY,sms:{otp:smsReady(env),invite:inviteReady(env)}});}
 if(path==='/api/owner/stats'&&req.method==='GET'){await owner(req,env);const days=[7,30,90].includes(Number(u.searchParams.get('days')))?Number(u.searchParams.get('days')):30;const slug=u.searchParams.get('salon')||'';let sid=null;if(slug){const x=await one(db,'SELECT id FROM salons WHERE slug=?',slug);must(x,'مزون پیدا نشد',404);sid=x.id}return J(await stats(db,{days,salonId:sid,styles}));}
 if(path==='/api/owner/referrals'&&req.method==='GET'){await owner(req,env);const slug=u.searchParams.get('salon')||'';let sid=null;if(slug){const x=await one(db,'SELECT id FROM salons WHERE slug=?',slug);must(x,'مزون پیدا نشد',404);sid=x.id}return J(await report(db,{salonId:sid}));}
 if(path==='/api/owner/alerts-link'&&req.method==='POST'){await owner(req,env);return J({links:await ownerLink(db,env)});}
 if(path==='/api/owner/alerts-unlink'&&req.method==='POST'){await owner(req,env);await run(db,'DELETE FROM owner_chats');return J({ok:true});}
 if(path==='/api/owner/digest'&&req.method==='GET'){await owner(req,env);return J({text:await digest(env)});}
 if(path==='/api/owner/webhook'&&req.method==='POST'){await owner(req,env);return J(await setWebhook(env,env.APP_ORIGIN||u.origin));}
 if(path==='/api/salons'&&req.method==='POST'){const who=await owner(req,env);const b=await req.json(),id=uid();
  // Capitals, spaces and underscores are normalised ("Aliadli Salon" → "aliadli-salon").
  b.slug=String(b.slug||'').trim().toLowerCase().replace(/[\s_]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
  must(/^[a-z][a-z0-9-]{2,45}$/.test(b.slug),'نشانی صفحه فقط حروف انگلیسی، عدد و خط تیره (-) دارد، با حرف شروع می‌شود و حداقل ۳ حرف است؛ مثل aliadli-salon');
  must(!await one(db,'SELECT 1 FROM salons WHERE slug=?',b.slug),'این نشانی را مزون دیگری گرفته؛ یک نشانی دیگر بنویسید');must(text(b.name||'',100).length>=2,'نام مزون را بنویسید');await run(db,'INSERT INTO salons(id,slug,owner_id,name,created_at,settings) VALUES(?,?,?,?,?,?)',id,b.slug,who.user||'owner',text(b.name,100),Date.now(),JSON.stringify({generation_enabled:true,reference_verified:true}));return J({id,slug:b.slug});}
 const match=path.match(/^\/api\/s\/([a-z0-9-]+)(?:\/(.*))?$/);must(match,'مسیر پیدا نشد',404);let salon=await one(db,'SELECT * FROM salons WHERE slug=?',match[1]);
 // The public demo salon behind the landing page is created on first visit; owner_id 'system' marks it.
 if(!salon&&match[1]==='demo'){await run(db,'INSERT OR IGNORE INTO salons(id,slug,owner_id,name,profile,settings,created_at) VALUES(?,?,?,?,?,?,?)',uid(),'demo','system','آینه (نسخهٔ نمونه)','{}',JSON.stringify({generation_enabled:true,reference_verified:false,demo:true}),Date.now());salon=await one(db,'SELECT * FROM salons WHERE slug=?','demo')}
 must(salon,'مزون پیدا نشد',404);const route=match[2]||'',cfg=parse(salon.settings),trial=cfg.trial?await trialOf(db,salon.id):null,demo=false;
 if(trial&&!trialLive(trial)&&route!=='public'&&!route.startsWith('owner'))throw new Problem(410,'مهلت ۱۰ ساعتهٔ صفحهٔ آزمایشی تمام شده است؛ برای ادامه با ما تماس بگیرید');
 const readOnly=route==='public'||route==='owner'||route==='requests'||route.startsWith('media/')||route.startsWith('generation/');
 must(route==='session'?['GET','POST'].includes(req.method):req.method===(readOnly?'GET':'POST'),'متد مجاز نیست',405);
 if(route==='public')return J({salon:publicSalon(salon),portfolio:await all(db,'SELECT id,title,category,description,stylist,staff_id AS maker,line,images,try_on,1 AS published FROM portfolio WHERE salon_id=? AND published=1 AND permission=1 ORDER BY created_at DESC',salon.id),generation:!!env.KIE_API_KEY&&!!cfg.generation_enabled&&(!demo||smsReady(env)),reference:refOn(cfg),telegram:inboxes(env,salon).length>0||!!await one(db,'SELECT 1 FROM team WHERE salon_id=? AND active=1',salon.id),follow:Object.keys(followLinks(env,'x')),otp:smsReady(env),notice:'خروجی شبیه‌سازی پیشنهادی است و تضمین اجرا نیست.',trial:trialPublic(trial),demo});
 if(route==='session'&&req.method==='POST'){await limited(db,'session:'+salon.id+':'+clientIp(req),30);const {raw}=await newSession(db,salon);return J({ok:true},200,{'Set-Cookie':cookie(raw)});}
 if(route.startsWith('owner')){
  await owner(req,env);const r=route.slice(6),b=req.method==='GET'?{}:await req.json();
  if(!r&&req.method==='GET')return J({salon:{...publicSalon(salon),settings:{...cfg,reference_verified:refOn(cfg)},telegram:!!salon.telegram_chat_id,bale:!!salon.bale_chat_id,link_pending:!!salon.telegram_code_hash&&salon.telegram_code_expires>Date.now()},portfolio:await all(db,'SELECT id,title,category,images,created_at,line,stylist FROM portfolio WHERE salon_id=? AND published=1 ORDER BY created_at DESC',salon.id),leads:await all(db,'SELECT l.id,l.name,l.look,l.status,l.salon_status,l.attempts,l.last_error,l.created_at,l.waiting,t.name AS staff FROM leads l LEFT JOIN team t ON t.id=l.staff_id WHERE l.salon_id=? ORDER BY l.created_at DESC LIMIT 50',salon.id),team:await teamView(db,env,salon,u.origin),specialties:SPECIALTIES,setup:(st=>({filled:st.filled.length,total:st.total,missing:st.missing}))(setupStatus(salon)),bot:botInfo(env),image:!!env.KIE_API_KEY});
  if(r==='profile'){const p={...parse(salon.profile),...(b.profile||{})};for(const k of PROFILE_LINKS)p[k]=safeLink(p[k]||'');for(const k of PROFILE_TEXT)p[k]=text(p[k]||'',1000);p.phone=digits(p.phone||'').replace(/[\s()-]/g,'');must(!p.phone||/^\+?\d{5,15}$/.test(p.phone),'شمارهٔ تماس مزون معتبر نیست');for(const k of PROFILE_IMAGES)if(p[k])must(await one(db,"SELECT 1 FROM media WHERE id=? AND salon_id=? AND kind='brand'",p[k],salon.id),'عکس برند معتبر نیست');await run(db,'UPDATE salons SET name=?,profile=? WHERE id=?',text(b.name||salon.name,100),JSON.stringify(p),salon.id);return J({ok:true});}
  if(r==='settings'){const lim=Number(b.daily_limit);const s={...cfg,generation_enabled:!!b.generation_enabled,reference_verified:!!b.reference_verified,image_model:b.image_model==='fast'?'fast':'pro',daily_limit:b.daily_limit===undefined?dailyLimit(cfg):(Number.isInteger(lim)&&lim>=0&&lim<=100000?lim:DAILY_LIMIT)};await run(db,'UPDATE salons SET settings=? WHERE id=?',JSON.stringify(s),salon.id);return J({ok:true});}
  if(r==='telegram-link')return J(await newLinkCode(db,salon,env));
  if(r==='telegram-unlink'){const col=b.platform==='bale'?'bale_chat_id':b.platform==='telegram'?'telegram_chat_id':null;if(col)await run(db,'UPDATE salons SET '+col+'=NULL WHERE id=?',salon.id);else await run(db,'UPDATE salons SET telegram_chat_id=NULL,bale_chat_id=NULL,telegram_code_hash=NULL,telegram_code_expires=NULL WHERE id=?',salon.id);return J({ok:true});}
  if(r==='team'){const t=await createStaff(db,salon,b.name,b.specialty);return J({member:t,links:await staffInvite(db,env,t),ref:refLink(env,u.origin,salon,t)});}
  if(r==='team/link'){const t=await one(db,'SELECT * FROM team WHERE id=? AND salon_id=? AND active=1',String(b.id||''),salon.id);must(t,'نیرو پیدا نشد',404);return J({links:await staffInvite(db,env,t),ref:refLink(env,u.origin,salon,t)});}
  if(r==='team/remove'){const ids=await transfer(db,salon.id,String(b.id||''),b.to?String(b.to):null);for(const id of ids){const l=await one(db,'SELECT * FROM leads WHERE id=?',id);if(l)await deliverLead(env,l)}return J({ok:true,moved:ids.length});}
  // Portfolio added from the owner console (same row the bot makes): a photo uploaded with
  // upload?kind=portfolio, its title and its service line. Published and usable for try-on.
  if(r==='portfolio/add'){
   const media=String(b.media_id||''),line=LINE_KEYS.includes(b.line)?b.line:'dress';
   must(await one(db,"SELECT 1 FROM media WHERE id=? AND salon_id=? AND kind='portfolio'",media,salon.id),'عکس نمونه‌کار معتبر نیست');
   must(!await one(db,'SELECT 1 FROM portfolio WHERE salon_id=? AND EXISTS(SELECT 1 FROM json_each(images) WHERE value=?)',salon.id,media),'این عکس قبلاً اضافه شده');
   const title=text(String(b.title||'').slice(0,150),150)||'نمونه‌کار',id=uid();
   await run(db,'INSERT INTO portfolio(id,salon_id,title,category,description,stylist,images,published,try_on,permission,created_at,staff_id,media_group,line,look) VALUES(?,?,?,?,?,?,?,1,1,1,?,NULL,NULL,?,?)',id,salon.id,title,text(String(b.category||'').slice(0,60),60),text(String(b.description||'').slice(0,500),500),text(String(b.stylist||'').slice(0,80),80),JSON.stringify([media]),Date.now(),line,text(String(b.look||'').slice(0,600),600));
   return J({id});
  }
  if(r==='portfolio/look'){await run(db,'UPDATE portfolio SET look=? WHERE id=? AND salon_id=?',text(String(b.look||'').slice(0,600),600),String(b.id||''),salon.id);return J({ok:true});}
  if(r==='portfolio/line'){must(LINE_KEYS.includes(b.line),'خدمت معتبر نیست');await run(db,'UPDATE portfolio SET line=? WHERE id=? AND salon_id=?',b.line,b.id,salon.id);return J({ok:true});}
  if(r==='portfolio/delete'){await run(db,'DELETE FROM portfolio WHERE id=? AND salon_id=?',b.id,salon.id);return J({ok:true});}
  if(r==='leads/retry'){await run(db,"UPDATE leads SET status='retry',attempts=0 WHERE id=? AND salon_id=? AND status='failed'",b.id,salon.id);const l=await one(db,'SELECT * FROM leads WHERE id=? AND salon_id=?',b.id,salon.id);must(l,'درخواست یافت نشد',404);return J({delivered:await deliverLead(env,l)});}
  throw new Problem(404,'مسیر مدیریت یافت نشد');
 }
 if(route==='upload'&&req.method==='POST'){const kind=u.searchParams.get('kind')||'original';let s=null;if(kind==='brand'||kind==='portfolio')await owner(req,env);else{must(['original','reference'].includes(kind));s=await session(req,db,salon);await limited(db,'upload:'+s.id,30);}const bytes=new Uint8Array(await req.arrayBuffer());return J({id:await putImage(env,salon,s,bytes,kind)});}
 if(route.startsWith('media/')){const id=route.slice(6),m=await one(db,'SELECT * FROM media WHERE id=? AND salon_id=?',id,salon.id);must(m,'عکس یافت نشد',404);const profile=parse(salon.profile);let visible=m.kind==='brand'&&PROFILE_IMAGES.some(k=>profile[k]===id);if(!visible)visible=!!await one(db,'SELECT 1 FROM portfolio WHERE salon_id=? AND published=1 AND permission=1 AND EXISTS(SELECT 1 FROM json_each(images) WHERE value=?)',salon.id,id);if(!visible){let isOwner=false;try{await owner(req,env);isOwner=true}catch{}if(!isOwner){const s=await session(req,db,salon);await ownMedia(db,s,id);}}const object=await bucketFor(env).get(m.object_key);must(object,'عکس در دسترس نیست',410);return new Response(object.body,{headers:{'Content-Type':m.mime,'Cache-Control':visible?'public,max-age=300':'private,no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'"}});}
 if(route==='ref'&&req.method==='POST'){const b=await req.json().catch(()=>({}));await limited(db,'ref:'+salon.id+':'+clientIp(req),3000);return J(await attribute(db,salon,String(b.v||''),String(b.r||'')));}
 if(route==='track'&&req.method==='POST'){const b=await req.json().catch(()=>({}));must(TRACK_KINDS.includes(b.kind)&&b.kind!=='sent','رویداد معتبر نیست');await limited(db,'track:'+salon.id+':'+clientIp(req),800);await logEvent(db,salon.id,b.kind,String(b.v||''),typeof b.meta==='string'||typeof b.meta==='number'?String(b.meta):'');return J({ok:true});}
 const s=await session(req,db,salon);
 if(route==='session')return J({ok:true,verified:!!s.verified_phone,name:s.verified_name||'',phone:s.verified_phone||'',quota:trial||demo||await unlimited(db,s)?null:{per:QUOTA_PER_LINE,left:quotaLeft(await quotaUsed(db,salon,s,/^[a-f0-9]{16,32}$/.test(u.searchParams.get('v')||'')?u.searchParams.get('v'):''))}});
 // Mobile verification: a one-time code texted by Melipayamak. Only the hash of the code is stored.
 if(route==='otp/send'){
  must(smsReady(env),'تأیید شماره هنوز فعال نشده است',503);
  const b=await req.json(),first=text(String(b.first_name||''),40),last=text(String(b.last_name||''),60);
  must(first.length>=2&&last.length>=2,'نام و نام خانوادگی را کامل بنویس');
  const number=phone(b.phone),now=Date.now();
  const prev=await one(db,'SELECT created_at FROM otps WHERE session_id=? ORDER BY created_at DESC LIMIT 1',s.id);
  must(!prev||now-prev.created_at>=60000,'برای گرفتن دوبارهٔ کد یک دقیقه صبر کن',429);
  await limited(db,'otp-session:'+s.id,5,'چند بار کد گرفتی؛ فردا دوباره امتحان کن');
  await limited(db,'otp-phone:'+number,5,'برای این شماره امروز چند بار کد فرستاده شده؛ فردا دوباره امتحان کن');
  await limited(db,'otp-ip:'+clientIp(req),20,'سقف درخواست کد برای امروز پر شده است');
  await limited(db,'otp-salon:'+salon.id,300,'سقف ارسال کد برای امروز پر شده است');
  const code=await sendOtp(env,number),id=uid();
  await run(db,'DELETE FROM otps WHERE session_id=?',s.id);
  await run(db,'INSERT INTO otps(id,session_id,phone,first_name,last_name,code_hash,expires_at,created_at) VALUES(?,?,?,?,?,?,?,?)',id,s.id,number,first,last,await hash(id+':'+code),now+10*60000,now);
  return J({ok:true,expires_in:600,resend_in:60});
 }
 if(route==='otp/verify'){
  const b=await req.json(),given=digits(String(b.code||'')).replace(/\s/g,'');
  must(/^\d{3,12}$/.test(given),'کد را درست وارد کن');
  const o=await one(db,'SELECT * FROM otps WHERE session_id=? ORDER BY created_at DESC LIMIT 1',s.id);
  must(o,'اول کد تأیید بگیر');
  must(o.expires_at>Date.now(),'کد منقضی شده؛ کد تازه بگیر',410);
  const spent=await run(db,'UPDATE otps SET attempts=attempts+1 WHERE id=? AND attempts<5',o.id);
  must(spent.meta.changes,'تعداد تلاش‌ها تمام شد؛ کد تازه بگیر',429);
  must(same(await hash(o.id+':'+given),o.code_hash),'کد درست نیست');
  const name=o.first_name+' '+o.last_name;
  await run(db,'UPDATE sessions SET verified_phone=?,verified_name=? WHERE id=?',o.phone,name,s.id);
  await run(db,'DELETE FROM otps WHERE session_id=?',s.id);
  return J({ok:true,name,phone:o.phone});
 }
 if(route==='requests'){const rows=await all(db,'SELECT id,look,salon_status,handled_at,created_at,follow_chat IS NOT NULL AS followed FROM leads WHERE session_id=? ORDER BY created_at DESC LIMIT 5',s.id);const prof=parse(salon.profile);return J({requests:rows,phone:prof.phone||''});}
 if(route==='leads'&&req.method==='POST'){
  const b=await req.json();must(b.data_consent===true,'رضایت ارسال عکس برای مزون لازم است');must(/^[a-f0-9-]{36}$/.test(b.idem),'شناسه درخواست معتبر نیست');
  must(!smsReady(env)||s.verified_phone,'اول شمارهٔ موبایلت را تأیید کن',403);
  const old=await one(db,'SELECT id,status FROM leads WHERE session_id=? AND idem=?',s.id,b.idem);if(old)return J({id:old.id,delivered:old.status==='sent'});
  const cut=(v,n)=>String(v??'').slice(0,n);const name=s.verified_name||text(cut(b.name,100),100);must(name.length>=2,'نام را وارد کنید');const number=s.verified_phone||phone(b.phone);
  const visitorIn=/^[a-f0-9]{16,32}$/.test(String(b.v||''))?String(b.v):'';
  const hasTeam=!!await one(db,'SELECT 1 FROM team WHERE salon_id=? AND active=1',salon.id);
  must(inboxes(env,salon).length||hasTeam,'این مزون هنوز ارسال آنلاین را فعال نکرده؛ مستقیم با مزون تماس بگیرید',503);
  let handle=text(String(b.telegram||''),40).replace(/^@/,'').replace(/^https?:\/\/t\.me\//,'');if(handle)must(/^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(handle),'آیدی تلگرام معتبر نیست');
  const original=await ownMedia(db,s,b.original_id);must(original.kind==='original','عکس خودتان لازم است');
  if(b.reference_id)await ownMedia(db,s,b.reference_id);
  if(b.preview_id){const p=await ownMedia(db,s,b.preview_id);must(p.kind==='simulation','نتیجهٔ معتبر انتخاب کنید');must(await one(db,"SELECT 1 FROM generations WHERE result_id=? AND original_id=? AND COALESCE(reference_id,'')=? AND salon_id=?",b.preview_id,b.original_id,b.reference_id||'',salon.id),'نتیجه باید با عکس و مدل انتخابی مطابقت داشته باشد');}
  await limited(db,'lead:'+s.id,10);await limited(db,'lead-ip:'+salon.id+':'+clientIp(req),20);
  const id=uid(),visitor=visitorIn;
  // The server decides who owns the request (referral tree and mobile lock); the client cannot.
  const own=await ownerFor(db,env,salon,visitor,number);
  // The follow token lets this customer (and only her) link a bot chat for status updates.
  const follow=Array.from(crypto.getRandomValues(new Uint8Array(12)),x=>x.toString(16).padStart(2,'0')).join('');
  await run(db,'INSERT INTO leads(id,salon_id,session_id,name,phone,telegram,original_id,reference_id,preview_id,look,color,note,idem,created_at,follow_hash,visitor,staff_id,line) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',id,salon.id,s.id,name,number,handle,b.original_id,b.reference_id||null,b.preview_id||null,text(cut(b.look,150),150),text(cut(b.color,120),120),text(cut(b.note,1000),1000),b.idem,Date.now(),await hash(follow),visitor,own.staff,LINE_KEYS.includes(b.line)?b.line:'hair');
  if(visitor)await run(db,'UPDATE ref_visitors SET name=? WHERE salon_id=? AND visitor=?',name,salon.id,visitor);
  await logEvent(db,salon.id,'sent',visitor,b.preview_id?'sim':'plain');
  const delivered=await deliverLead(env,await one(db,'SELECT * FROM leads WHERE id=?',id));
  if(own.conflict)await notifyConflict(env,await one(db,'SELECT * FROM leads WHERE id=?',id),own.conflict).catch(e=>console.error('conflict notice',e?.message));
  const waiting=!!(await one(db,'SELECT waiting FROM leads WHERE id=?',id))?.waiting;
  return J({id,delivered,waiting,follow:followLinks(env,follow)});
 }
 if(route==='views'&&req.method==='POST'){
  const b=await req.json();must(!demo,'نمای ۳۶۰ در نسخهٔ نمونه نیست');must(env.KIE_API_KEY&&cfg.generation_enabled,'تولید فعال نیست',503);must(/^[a-f0-9-]{36}$/.test(b.idem));const existing=await one(db,'SELECT id,state FROM generations WHERE session_id=? AND idem=?',s.id,b.idem);if(existing)return J(existing);const base=await one(db,"SELECT * FROM generations WHERE id=? AND session_id=? AND salon_id=? AND state='success'",b.parent,s.id,salon.id);must(base?.result_id,'عکس پایه معتبر نیست');must((base.line||'hair')==='hair','نمای ۳۶۰ فقط برای مو است');const m=await ownMedia(db,s,base.result_id),id=uid(),now=Date.now();const visitor=visitorOf(b),free=await unlimited(db,s);if(!trial&&!free)await spendQuota(db,salon,s,visitor,'hair');if(dailyLimit(cfg)>0&&!free)await limited(db,'views:'+salon.id,Math.min(20,dailyLimit(cfg)));await spendTrialImage(db,trial);await run(db,"INSERT INTO generations(id,salon_id,session_id,idem,kind,state,original_id,created_at,updated_at,visitor) VALUES(?,?,?,?,'views','creating',?,?,?,?)",id,salon.id,s.id,b.idem,base.original_id,now,now,visitor);
  try{const img=await uploadProvider(env,m);const task=await createImageTask(env,cfg,{prompt:VIEWS_PROMPT,image_input:[img],aspect_ratio:'16:9',resolution:'2K',output_format:'jpg'});await run(db,"UPDATE generations SET state='waiting',task_id=? WHERE id=?",task.taskId,id);return J({id,state:'waiting'});}catch{await run(db,"UPDATE generations SET state='unknown' WHERE id=?",id);throw new Problem(502,'ارسال نامشخص؛ بدون بازتولید خودکار');}
 }
 if(route==='generate'&&req.method==='POST'){
  const b=await req.json();const line=LINE_KEYS.includes(b.line)?b.line:'dress';
  must(!smsReady(env)||s.verified_phone,'اول شمارهٔ موبایلت را تأیید کن',403);must(!demo||smsReady(env),'ساخت تصویر در نسخهٔ نمونه هنوز فعال نشده است',503);
  must(b.image_consent===true,'رضایت ارسال عکس برای پردازش لازم است');
  must(cfg.generation_enabled&&env.KIE_API_KEY,'تولید واقعی این مزون هنوز فعال نشده است',503);
  must(/^[a-f0-9-]{36}$/.test(b.idem));
  const old=await one(db,'SELECT * FROM generations WHERE session_id=? AND idem=?',s.id,b.idem);if(old)return J({id:old.id,state:old.state});
  const original=await ownMedia(db,s,b.original_id);must(original.kind==='original','عکس چهره لازم است');
  const color=text(String(b.color||'').slice(0,120),120),opts=cleanOptions(line,b.opts),ratio=RATIOS.includes(b.ratio)?b.ratio:'2:3';
  let reference=null;
  // A salon work with a written look is tried on from the text alone: one photo, hers.
  let look='';
  if(b.reference_id){
   look=(await one(db,"SELECT look FROM portfolio WHERE salon_id=? AND published=1 AND line=? AND look<>'' AND EXISTS(SELECT 1 FROM json_each(images) WHERE value=?)",salon.id,line,b.reference_id))?.look||'';
   if(!look){must(refOn(cfg),'انتقال عکس مرجع برای این مزون خاموش است',503);reference=await ownMedia(db,s,b.reference_id);}
  }
  else if(line==='color'&&!Number.isInteger(b.style))must(color.length>=2,'یک رنگ انتخاب کن یا اسمش را بنویس');
  else must(Number.isInteger(b.style)&&(line==='hair'?styles:lineStyles(line))[b.style],'مدل معتبر انتخاب کنید');
  // Hair colour can be tried on her new hairstyle: a hair result of this session made from the same photo.
  let base=original,baseId=null;
  if(line==='color'&&b.base_id){
   must(await one(db,"SELECT 1 FROM generations WHERE result_id=? AND original_id=? AND session_id=? AND salon_id=? AND state='success' AND line='hair'",b.base_id,b.original_id,s.id,salon.id),'مدل موی انتخابی معتبر نیست');
   base=await ownMedia(db,s,b.base_id);baseId=b.base_id;
  }
  const visitor=visitorOf(b),free=await unlimited(db,s);if(!trial&&!demo&&!free)await spendQuota(db,salon,s,visitor,line);
  if(dailyLimit(cfg)>0&&!free)await limited(db,'generation:'+salon.id+':'+new Date().toISOString().slice(0,10),dailyLimit(cfg));if(demo&&!free)await limited(db,'demo:'+s.verified_phone,3,'امروز ۳ تصویر نمونه ساخته‌اید؛ فردا دوباره امتحان کنید یا صفحهٔ آزمایشی مزون خودتان را بسازید');if(!free)await spendTrialImage(db,trial);
  const id=uid(),now=Date.now();
  // Hairstyle copies only the cut from a reference photo; colour only the colour.
  const mode=look?'salon':line==='hair'?(reference?'style':'catalog'):(reference?'reference':(line==='color'&&!Number.isInteger(b.style)?'text':'catalog'));
  await run(db,'INSERT INTO generations(id,salon_id,session_id,idem,state,original_id,reference_id,style,transfer,color,created_at,updated_at,line,opts,base_id,visitor) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',id,salon.id,s.id,b.idem,'creating',b.original_id,b.reference_id||null,reference?null:(Number.isInteger(b.style)?b.style:null),mode,color,now,now,line,JSON.stringify(opts),baseId,visitor);
  try{
   const images=[await uploadProvider(env,base)];if(reference)images.push(await uploadProvider(env,reference));
   const prompt=look?(line==='hair'?transferPrompt('catalog',look,''):line==='color'?linePrompt('color','catalog',look,{},''):linePrompt(line,line==='nails'?'salon':'catalog',look,opts,color))
    :line==='hair'?transferPrompt(reference?'style':'catalog',styles[b.style]?.[1]||'','')
    :line==='color'?linePrompt('color',mode,mode==='catalog'?lineStyles('color')[b.style][3]:'',{},color)
    :linePrompt(line,reference?'reference':'catalog',reference?'':lineStyles(line)[b.style][3],opts,color);
   const job=await createImageTask(env,cfg,{prompt,image_input:images,aspect_ratio:ratio,resolution:'2K',output_format:'jpg'});
   await run(db,"UPDATE generations SET state='waiting',task_id=? WHERE id=?",job.taskId,id);return J({id,state:'waiting'});
  }catch{await run(db,"UPDATE generations SET state='unknown' WHERE id=?",id);throw new Problem(502,'وضعیت ارسال نامشخص است؛ برای جلوگیری از هزینه تکراری، درخواست تازه خودکار ساخته نمی‌شود');}
 }
 if(route.startsWith('generation/')){const id=route.slice(11),g=await one(db,'SELECT * FROM generations WHERE id=? AND salon_id=? AND session_id=?',id,salon.id,s.id);must(g,'درخواست تولید یافت نشد',404);if(g.result_id)return J({state:'success',result_id:g.result_id});if(!g.task_id)return J({state:g.state});const d=await provider(env,'/api/v1/jobs/recordInfo?taskId='+encodeURIComponent(g.task_id));if(d.state==='success'){const link=parse(d.resultJson).resultUrls?.[0];must(link&&new URL(link).protocol==='https:','خروجی سرویس معتبر نیست',502);const res=await fetch(link,{signal:AbortSignal.timeout(20000)});must(res.ok,'دریافت خروجی ممکن نشد',502);must(Number(res.headers.get('content-length')||0)<=12*1024*1024,'خروجی بیش از حد بزرگ است',502);const bytes=new Uint8Array(await res.arrayBuffer());const media=await putImage(env,salon,s,bytes,'simulation');const win=await run(db,"UPDATE generations SET state='success',result_id=?,updated_at=? WHERE id=? AND result_id IS NULL",media,Date.now(),g.id);if(!win.meta.changes){await bucketFor(env).delete(salon.id+'/'+media);await run(db,'DELETE FROM media WHERE id=?',media);}const done=await one(db,'SELECT result_id FROM generations WHERE id=?',g.id);return J({state:'success',result_id:done.result_id});}await run(db,'UPDATE generations SET state=?,updated_at=? WHERE id=?',d.state,Date.now(),g.id);return J({state:d.state});}
 throw new Problem(404,'مسیر یافت نشد');
}
export function errorResponse(e){if(String(e.message).includes('UNIQUE constraint'))return J({error:'این مورد قبلاً ثبت شده است؛ صفحه را تازه کنید'},409);return J({error:e instanceof Problem?e.message:'خطای داخلی؛ درخواست تازه تکراری ارسال نکنید'},e.status||500);}
