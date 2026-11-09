import {Problem,must,phone,text,safeLink,uid,token,hash,digits,limited} from './domain.js';
import {identity,issueCookie,clearCookie,same,passwordLoginEnabled} from './auth.js';
import {bucketFor,putImage,putVideo,maxUpload} from './storage.js';
import {precheck,PHOTO_RULES} from './precheck.js';
import {mobilesIn,customerLinks,applyLeadStatus,botReady,deliverLead,deliverPending,newLinkCode,setWebhook,inboxes,followLinks,PLATFORMS,platformReady,baleSecret,staffInvite,notifyConflict,expireStates} from './telegram.js';
import {createPairing,pairStatus} from './pairing.js';
import {BACKGROUNDS,bgOf} from './backgrounds.js';
import {creditGate,creditsOf,adminAccounts,adminSetAccount,adminHandleRequest,panelApi,newToken,creditStatus,requestRecharge,weightsOf,setWeights,lowCreditCheck,ledger,rotateToken,adminLedger,NO_IMAGE_MSG} from './credits.js';
import {mgrSlug,managerLogin,mgrCookie,clearMgrCookie,setManager,changePassword,forgotPassword,resetPassword} from './manager.js';
import {LINE_KEYS,lineStyles,linePrompt,LINE_LABEL} from './lines.js';
import {ownerLink,alertUnanswered,maybeDigest,setupStatus,digest,notifyOwner,notifySalon,setting} from './alerts.js';
import {attribute,ownerFor,createStaff,transfer,report,team as teamOf,liveStaff,SPECIALTIES} from './referral.js';
import {stats} from './stats.js';
import {LEAD_STATUSES,STATUS_FA,BRIDE_STATUS_FA,REACTION_REASONS,deleteLead,cleanDressKey,dressKeyOf,dressName,portfolioIndex,purgePhotos,retentionDays} from './dresses.js';
import {smsReady,inviteReady,sendOtp,sendInvite} from './sms.js';
import {createResultLink,eraseSession} from './resultlinks.js';
import {createTrial,trialOf,trialLive,trialPublic,spendTrialImage,refundTrialImage} from './trial.js';
import {publicApi,shareTokenOf,postText,dressNameOf,sendResultToBot,sendToMe,setConsent,reactionsOf} from './social.js';
export {putImage};

const J=(v,s=200,h={})=>new Response(JSON.stringify(v),{status:s,headers:{'Content-Type':'application/json;charset=utf-8','Cache-Control':'no-store',...h}});
const parse=s=>{try{return JSON.parse(s||'{}')}catch{return {}}};
const one=(db,sql,...args)=>db.prepare(sql).bind(...args).first();
const run=(db,sql,...args)=>db.prepare(sql).bind(...args).run();
const all=async(db,sql,...args)=>(await db.prepare(sql).bind(...args).all()).results;
const cookie=t=>'ayneh='+t+'; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800';
const PROFILE_TEXT=['bio','address','hours','manager'],PROFILE_LINKS=['map','instagram','website','telegram'],PROFILE_IMAGES=['logo','cover','portrait'];
const botInfo=env=>({token:botReady(env),secret:!!env.TELEGRAM_WEBHOOK_SECRET,username:PLATFORMS.telegram.user(env),telegram:{ready:platformReady(env,'telegram'),username:PLATFORMS.telegram.user(env)},bale:{ready:platformReady(env,'bale'),username:PLATFORMS.bale.user(env),secret:!!baleSecret(env)}});
// The boutique's own dresses is tryable on customers by default; an owner may switch it off.
const refOn=cfg=>cfg.reference_verified!==false;
// In a boutique only the owner's own dresses are shown; the sample catalog and customer-uploaded dress photos are opt-in.
const catalogOn=cfg=>cfg.catalog===true,ownDressOn=cfg=>cfg.allow_own_dress===true;
// All photos (up to 4 angles: front first) of the owner's published dress that contains this media id.
async function dressAngles(db,salon,line,id){const row=await one(db,"SELECT images,look FROM portfolio WHERE salon_id=? AND published=1 AND try_on=1 AND permission=1 AND line=? AND EXISTS(SELECT 1 FROM json_each(images) WHERE value=?)",salon.id,line,id);if(!row)return{media:[],look:''};let ids=[];try{ids=JSON.parse(row.images)}catch{}const media=[];for(const i of ids.slice(0,4)){const m=await one(db,'SELECT * FROM media WHERE id=? AND salon_id=?',i,salon.id);if(m)media.push(m);}return{media,look:row.look||''};}
// Output shape follows the customer's photo (a full-length photo is rarely 3:4).
export const CONSENT_VERSION='2026-11';
const RATIOS=['1:1','2:3','3:2','3:4','4:3','4:5','5:4','9:16','16:9'];
// Each person gets a few dress images on a boutique page (trial and demo pages have their own budgets),
// so a test day cannot run up the image bill. A person is this session, this browser id and, once
// verified, this mobile. Failed images do not count; the three-angle view counts as a dress image.
// Images a salon page may make per day across all its customers (owner setting; 0 = no cap).
export const DAILY_LIMIT=0;
const dailyLimit=cfg=>Number.isInteger(cfg?.daily_limit)?cfg.daily_limit:DAILY_LIMIT;
// The three-angle view: one generated row of three equal tiles (front 3/4, side profile, back) of the
// same bride in the same dress, made from her result photo.
// 360-degree turntable clip made from the finished try-on photo (image-to-video). The bride stays still and the
// camera circles her once, so every angle (side, back, train) is shown in one smooth rotation.
export const BACK_PROMPT='Photo 1 is a bride wearing a wedding dress, seen from the front. Create a photo of the SAME woman wearing the SAME dress seen exactly from BEHIND (camera directly behind her, 180 degrees from photo 1): same pose, same distance, full body from head to the floor including the whole hem and train, same body shape and size, same hair seen from behind, same background and lighting. Image 1 = the bride seen from the front. If more images are given (Image 2 and later), they show the same dress from other angles (side, back, detail): copy the real back, buttons, lace and train design exactly from them. If no back photo is given, the back is only an estimate: continue the front design calmly and simply, and never invent lace, beading, buttons, bows or other details that are not visible in the given photos. Natural anatomy, five fingers on each hand, no extra people, no cropped feet. Photorealistic, no text, no watermark.';
const SPIN_BASE=' always showing her FULL body from head to the floor including the hem and train. The bride stands completely still in a relaxed pose; the camera moves, not her. She is the SAME woman with the SAME body, hair and wedding dress in every frame; the dress keeps its exact design, fabric, lace, volume and colour all the way round. Plain, evenly lit, unchanged background and floor. No zoom, no cuts, no text, no watermark, no extra people.';
export const SPIN_A_PROMPT='Smooth, steady half-turn orbit: the camera starts at the front view (the first image) and moves around the standing bride, passing her LEFT side, at constant speed and constant distance to end exactly at the back view (the last image),'+SPIN_BASE;
export const SPIN_B_PROMPT='Smooth, steady half-turn orbit that continues the same rotation direction as before: the camera starts at the back view (the first image) and keeps moving around the standing bride, passing her RIGHT side, at constant speed and constant distance to end exactly at the front view (the last image),'+SPIN_BASE;
const SMILE=' In the last second she gives a soft natural smile toward the camera and blinks once; her face, hair and body stay exactly the same.';
// Two anchored half-turns (front->back, back->front) make one seamless full turn without the model inventing the back of the dress.
export const spinVideoInput=(cfg,first,last,part)=>({model:cfg.spin_model||'kling-3.0/video',input:{prompt:part==='b'?SPIN_B_PROMPT+(cfg.spin_expression===false?'':SMILE):SPIN_A_PROMPT,image_urls:[first,last],mode:cfg.spin_mode==='pro'?'pro':'std',sound:false,duration:'4',multi_shots:false}});
export const VIEWS_PROMPT='Wedding-dress turnaround of the SAME bride as photo 1, wearing the SAME dress. Exactly 3 equal tiles side by side in one row, no gaps, borders, labels or numbers: tile 1 = front 3/4 view (turned about 45 degrees), tile 2 = exact side profile with her nose pointing to the LEFT edge of the tile, tile 3 = back view showing the back of the dress and the train. Each tile: the whole figure from head to floor, the same scale and framing, the same plain light background and soft even light. DRESS: in every tile the dress design, neckline, sleeves, bodice, waist, skirt shape and volume, length, train, fabric, lace, beading and colour are exactly as in photo 1, seen from that side; the back view shows the real back, closure and train of this same dress. BRIDE: her face, skin tone, hair and hairstyle, headscarf if she wears one, and her body size and proportions stay exactly as in photo 1; never beautify, slim or change her face or body. Photorealistic, high detail. No text, watermark or collage frame.';
// Tries per bride per line: the salon's own setting (1 to 20), 4 by default.
export const QUOTA_PER_LINE=4,QUOTA_MIN=1,QUOTA_MAX=20;
export const quotaPer=cfg=>{const n=Number(cfg?.quota_per_line);return Number.isInteger(n)&&n>=QUOTA_MIN&&n<=QUOTA_MAX?n:QUOTA_PER_LINE};
async function quotaUsed(db,salon,s,visitor){
 const rows=await all(db,"SELECT line,COUNT(*) n FROM generations WHERE salon_id=? AND state<>'fail' AND refunded=0 AND (session_id=? OR (?<>'' AND visitor=?) OR (? IS NOT NULL AND session_id IN (SELECT id FROM sessions WHERE salon_id=? AND verified_phone=?))) GROUP BY line",salon.id,s.id,visitor,visitor,s.verified_phone||null,salon.id,s.verified_phone||null);
 const used={dress:0};for(const r of rows)used[LINE_KEYS.includes(r.line)?r.line:'dress']+=Number(r.n);
 return used;
}
const quotaLeft=(used,per=QUOTA_PER_LINE)=>Object.fromEntries(LINE_KEYS.map(k=>[k,Math.max(0,per-used[k])]));
async function spendQuota(db,salon,s,visitor,line,env=null){
 const per=quotaPer(parse(salon.settings)),left=quotaLeft(await quotaUsed(db,salon,s,visitor),per);
 if(left[line]>0)return;
 if(env)await capSignal(env,db,salon,s,visitor,line,per);
 const others=LINE_KEYS.filter(k=>k!==line&&left[k]>0).map(k=>'«'+LINE_LABEL[k]+'»');
 throw new Problem(429,'سهم امتحان «'+LINE_LABEL[line]+'» برای شما تمام شد ('+per.toLocaleString('fa-IR')+' تصویر). '+(others.length?'هنوز می‌توانی '+others.join('، ')+' را امتحان کنی، یا همین نتیجه‌ها را برای مزون بفرستی.':'سهم امتحان همهٔ بخش‌ها تمام شده؛ می‌توانی همین نتیجه‌ها را برای مزون بفرستی تا با تو تماس بگیرند.'));
}
// A bride who used her whole quota is a warm lead: the salon manager hears about her once per bride and line.
async function capSignal(env,db,salon,s,visitor,line,per){
 try{
  const used=await quotaUsed(db,salon,s,visitor);if(used[line]<per)return;
  await limited(db,'capnote:'+s.id+':'+line,1);
  const nm=s.verified_name||s.cust_name||'',ph=s.verified_phone?'0'+String(s.verified_phone).replace(/^\+98/,''):(s.cust_phone||''),who=[nm,ph].filter(Boolean).join(' · ');
  await logEvent(db,salon.id,'cap_hit',visitor,line);
  await notifySalon(env,salon,'💍 یک عروس همهٔ '+per.toLocaleString('fa-IR')+' امتحان خودش را در «'+salon.name+'» انجام داد'+(who?': '+who:'')+'. احتمالاً جدی است؛ اگر درخواست نفرستاد، می‌توانید با او تماس بگیرید.');
 }catch{}
}
// After a request took credit: low-credit alerts and the per-bride cap signal. Never blocks the request.
async function afterCharge(env,db,salon,s,visitor,line,origin,skipQuota){
 await lowCreditCheck(env,db,salon,origin);
 if(!skipQuota)await capSignal(env,db,salon,s,visitor,line,quotaPer(parse(salon.settings)));
}
// The project's own team: verified mobiles listed in app_settings 'unlimited_phones' (a JSON list,
// kept in the database, never in the code) have no image limits at all.
async function unlimited(db,s){if(!s?.verified_phone)return false;try{const list=JSON.parse(await setting(db,'unlimited_phones')||'[]');return Array.isArray(list)&&list.includes(s.verified_phone)}catch{return false}}
const visitorOf=b=>/^[a-f0-9]{16,32}$/.test(String(b?.v||''))?String(b.v):'';
const refLink=(env,origin,salon,t)=>(env.APP_ORIGIN||origin)+'/s/'+salon.slug+'?r='+t.ref_code;
async function teamView(db,env,salon,origin){return (await teamOf(db,salon.id)).map(t=>({id:t.id,name:t.name,specialty:t.specialty,telegram:!!t.telegram_chat_id,bale:!!t.bale_chat_id,invite_pending:!!t.invite_hash&&t.invite_expires>Date.now(),ref:refLink(env,origin,salon,t)}))}
// Anonymous usage events for the dashboard. The visitor id is random and made by the browser.
export const TRAFFIC_SOURCES=['qr','ig','wa','tg','link','kiosk'];
export const TRACK_KINDS=['view','tour_start','tour_done','tour_skip','about','photo','look','generate','result','gen_fail','view360','send_open','sent','follow','rating','demo','share_open','share','save','save_look','share_post','kiosk'];
export async function logEvent(db,salonId,kind,visitor='',meta='',src=''){await run(db,'INSERT INTO events_log(id,salon_id,visitor,kind,meta,created_at,src) VALUES(?,?,?,?,?,?,?)',uid(),salonId,/^[a-f0-9]{16,32}$/.test(visitor)?visitor:'',kind,String(meta||'').slice(0,80),Date.now(),TRAFFIC_SOURCES.includes(src)?src:'')}
function publicSalon(s){return {id:s.id,slug:s.slug,name:s.name,profile:parse(s.profile)};}

// The salon panel is gone; only the project owner manages salons.
// The project owner, or the manager of exactly this salon (signed cookie bound to its slug).
export async function ownerOr(req,env,salon){try{return await owner(req,env)}catch(e){if(salon&&salon.approved&&await mgrSlug(req,env,salon)===salon.slug)return {user:'manager:'+salon.slug,email:'',via:'manager'};throw e}}
export async function owner(req,env){const who=await identity(req,env);must(who,'برای ورود، رمز تیم مزون آینه را وارد کنید',401);must(who.via==='password'||(env.OWNER_EMAIL&&who.email===env.OWNER_EMAIL),'فقط تیم مزون آینه به این بخش دسترسی دارد',403);return who;}
export async function session(req,db,salon){const t=(req.headers.get('cookie')||'').match(/(?:^|; )ayneh=([a-f0-9]{64})(?:;|$)/)?.[1];must(t,'جلسه پیدا نشد؛ صفحه را تازه کنید',401);const s=await one(db,'SELECT * FROM sessions WHERE token_hash=? AND salon_id=? AND expires_at>?',await hash(t),salon.id,Date.now());must(s,'جلسه منقضی شده؛ صفحه را تازه کنید',401);return s;}
export async function newSession(db,salon,bot=null){const raw=token(),s={id:uid(),salon_id:salon.id,customer_id:null,token_hash:await hash(raw),expires_at:Date.now()+7*86400000,created_at:Date.now()};await run(db,'INSERT INTO sessions(id,salon_id,customer_id,token_hash,expires_at,created_at,bot_platform,bot_chat,bot_name) VALUES(?,?,?,?,?,?,?,?,?)',...Object.values(s),bot?.platform||null,bot?.chat||null,bot?.name||'');return {s:{...s,bot_platform:bot?.platform||null,bot_chat:bot?.chat||null,bot_name:bot?.name||''},raw};}
const clientIp=req=>req.headers.get('cf-connecting-ip')||(req.headers.get('x-forwarded-for')||'').split(',')[0].trim()||req.headers.get('x-real-ip')||'unknown';
// A customer may only use their own uploads, or published portfolio items the salon marked for try-on.
async function ownMedia(db,s,id){const m=await one(db,'SELECT * FROM media WHERE id=? AND salon_id=?',id,s.salon_id);must(m,'عکس یافت نشد');if(m.session_id!==s.id)must(await one(db,"SELECT 1 FROM portfolio WHERE salon_id=? AND published=1 AND try_on=1 AND EXISTS(SELECT 1 FROM json_each(images) WHERE value=?)",s.salon_id,id),'عکس متعلق به این جلسه نیست',403);return m;}

// Retention: submissions (leads) are kept for good, and so are their photos until the request is closed
// plus N days. Photos and results that never became a request are deleted after N days by purgePhotos
// (a boutique setting, default 30). Here only expired technical rows go.
// A generation the provider never finished must not hold a credit or quota forever: state 'fail' refunds both.
export async function failStale(db,now=Date.now()){
 const a=await run(db,"UPDATE generations SET state='fail',updated_at=? WHERE state='waiting' AND result_id IS NULL AND COALESCE(updated_at,created_at)<? AND ((kind='spin' AND COALESCE(updated_at,created_at)<?) OR (kind<>'spin' AND COALESCE(updated_at,created_at)<?))",now,now-10*60000,now-20*60000,now-10*60000);
 const b=await run(db,"UPDATE generations SET state='fail',updated_at=? WHERE state IN('creating','unknown') AND task_id IS NULL AND result_id IS NULL AND created_at<?",now,now-15*60000);
 return (a.meta?.changes||0)+(b.meta?.changes||0);
}
// Personal data goes after 30 days unless a lead is still open; submitted leads themselves are kept (see above).
export async function purgePii(db,now=Date.now()){
 const cut=now-30*86400000;
 const a=await run(db,"UPDATE sessions SET cust_name='',cust_phone='',verified_phone=NULL,verified_name=NULL WHERE created_at<? AND (cust_name<>'' OR cust_phone<>'' OR verified_phone IS NOT NULL OR verified_name IS NOT NULL) AND NOT EXISTS(SELECT 1 FROM leads l WHERE l.session_id=sessions.id AND l.closed_at IS NULL)",cut);
 const b=await run(db,'DELETE FROM invites WHERE created_at<?',cut);
 return (a.meta?.changes||0)+(b.meta?.changes||0);
}
async function cleanup(env){const now=Date.now();
 await run(env.DB,'DELETE FROM sessions WHERE expires_at<? AND id NOT IN(SELECT session_id FROM requests) AND id NOT IN(SELECT session_id FROM leads) AND id NOT IN(SELECT session_id FROM generations) AND id NOT IN(SELECT session_id FROM media WHERE session_id IS NOT NULL)',now);
 await run(env.DB,'DELETE FROM pairings WHERE expires_at<?',now-3600000);
 await run(env.DB,'DELETE FROM limits WHERE expires_at<?',now);
 await run(env.DB,'DELETE FROM otps WHERE expires_at<?',now);
 await run(env.DB,'DELETE FROM events_log WHERE created_at<?',now-400*86400000);
 await run(env.DB,'DELETE FROM bot_seen WHERE created_at<?',now-3*86400000);
 await run(env.DB,'DELETE FROM activity WHERE created_at<?',now-400*86400000);
 const stale=await failStale(env.DB,now);
 const pii=await purgePii(env.DB,now);
 return {leads:0,stale,pii};
}

// Moves one generation forward: asks the provider and, on success, stores the picture. Used by the
// page's polling and by the scheduled job (a bride who started from the bot may never open the page).
async function settle(env,db,salon,s,g){
 if(g.result_id)return {state:'success',result_id:g.result_id,part2:g.kind==='spin'?parse(g.opts).b:undefined};if(!g.task_id||g.state==='fail')return {state:g.state};
 if(g.kind==='spin'){const o=parse(g.opts);
  const fail=async()=>{await run(db,"UPDATE generations SET state='fail',updated_at=? WHERE id=?",Date.now(),g.id);return {state:'fail'}};
  const getOut=async d=>{const link=parse(d.resultJson).resultUrls?.[0];must(link&&new URL(link).protocol==='https:','خروجی سرویس معتبر نیست',502);const res=await fetch(link,{signal:AbortSignal.timeout(25000)});must(res.ok,'دریافت خروجی ممکن نشد',502);must(Number(res.headers.get('content-length')||0)<=24*1024*1024,'خروجی بیش از حد بزرگ است',502);return new Uint8Array(await res.arrayBuffer())};
  const mediaUp=async id=>uploadProvider(env,await one(db,'SELECT * FROM media WHERE id=?',id));
  const next=async(stage,patch,make)=>{const claim=await run(db,"UPDATE generations SET opts=?,updated_at=? WHERE id=? AND opts LIKE ?",JSON.stringify({...o,...patch,stage}),Date.now(),g.id,'%"stage":"'+o.stage+'"%');if(!claim.meta.changes)return {state:'waiting'};try{const task=await provider(env,'/api/v1/jobs/createTask',await make());await run(db,"UPDATE generations SET task_id=?,state='waiting' WHERE id=?",task.taskId,g.id)}catch(e){return await fail()}return {state:'waiting'}};
  if(o.stage==='back'||o.stage==='a'||o.stage==='b'){
   const d=await provider(env,'/api/v1/jobs/recordInfo?taskId='+encodeURIComponent(g.task_id));
   if(d.state==='fail')return await fail();
   if(d.state!=='success')return {state:'waiting'};
   const cfg=parse(salon.settings);
   if(o.stage==='back'){const backId=await putImage(env,salon,s,await getOut(d),'simulation');return await next('a',{back:backId},async()=>spinVideoInput(cfg,await mediaUp(o.front),await mediaUp(backId),'a'))}
   if(o.stage==='a'){const aId=await putVideo(env,salon,s,await getOut(d));return await next('b',{a:aId},async()=>spinVideoInput(cfg,await mediaUp(o.back),await mediaUp(o.front),'b'))}
   const bId=await putVideo(env,salon,s,await getOut(d));
   const win=await run(db,"UPDATE generations SET state='success',result_id=?,opts=?,updated_at=? WHERE id=? AND result_id IS NULL",o.a,JSON.stringify({...o,b:bId,stage:'done'}),Date.now(),g.id);
   if(!win.meta.changes){await bucketFor(env).delete(salon.id+'/'+bId);await run(db,'DELETE FROM media WHERE id=?',bId)}
   return {state:'success',result_id:o.a,part2:bId};
  }
 }
 const d=await provider(env,'/api/v1/jobs/recordInfo?taskId='+encodeURIComponent(g.task_id));
 if(d.state==='success'){const link=parse(d.resultJson).resultUrls?.[0];must(link&&new URL(link).protocol==='https:','خروجی سرویس معتبر نیست',502);const res=await fetch(link,{signal:AbortSignal.timeout(20000)});must(res.ok,'دریافت خروجی ممکن نشد',502);must(Number(res.headers.get('content-length')||0)<=(g.kind==='spin'?24:12)*1024*1024,'خروجی بیش از حد بزرگ است',502);const bytes=new Uint8Array(await res.arrayBuffer());const media=g.kind==='spin'?await putVideo(env,salon,s,bytes):await putImage(env,salon,s,bytes,'simulation');const win=await run(db,"UPDATE generations SET state='success',result_id=?,updated_at=? WHERE id=? AND result_id IS NULL",media,Date.now(),g.id);if(!win.meta.changes){await bucketFor(env).delete(salon.id+'/'+media);await run(db,'DELETE FROM media WHERE id=?',media);}const done=await one(db,'SELECT result_id FROM generations WHERE id=?',g.id);return {state:'success',result_id:done.result_id};}
 await run(db,'UPDATE generations SET state=?,updated_at=? WHERE id=?',d.state,Date.now(),g.id);return {state:d.state};
}
// Brides who came through the bot are told when their picture is ready, page open or not.
async function settleBots(env,origin){
 let n=0;
 for(const g of await all(env.DB,"SELECT g.* FROM generations g JOIN sessions s ON s.id=g.session_id WHERE s.bot_chat IS NOT NULL AND g.notified=0 AND g.state NOT IN('success','fail','unknown') AND g.task_id IS NOT NULL AND g.kind='single' AND g.created_at>? ORDER BY g.created_at LIMIT 10",Date.now()-3600000)){
  try{const salon=await one(env.DB,'SELECT * FROM salons WHERE id=?',g.salon_id),s=await one(env.DB,'SELECT * FROM sessions WHERE id=?',g.session_id);const r=await settle(env,env.DB,salon,s,g);if(r.state==='success'){await sendResultToBot(env,origin,salon,s,{...g,result_id:r.result_id});n++}}catch(e){console.error('settle bot',e?.message)}
 }
 return n;
}
export async function tick(env,origin){if(!env.DB)return {ready:false};const delivered=await deliverPending(env,origin);
 const expired=await expireStates(env).catch(e=>{console.error('expire',e?.message);return 0});
 const unanswered=await alertUnanswered(env).catch(e=>{console.error('unanswered',e?.message);return 0});
 const digestSent=await maybeDigest(env).catch(e=>{console.error('digest',e?.message);return false});
 const purged=await purgePhotos(env).catch(e=>{console.error('purge',e?.message);return 0});
 const botDone=await settleBots(env,env.APP_ORIGIN||origin).catch(e=>{console.error('bots',e?.message);return 0});
 const cleaned=await cleanup(env);return {ready:true,delivered,expired,unanswered,digest:digestSent,purged,botDone,...cleaned};}

async function provider(env,path,body){must(env.KIE_API_KEY,'ساخت تصویر برای این مزون هنوز فعال نشده است',503);const res=await fetch('https://api.kie.ai'+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+env.KIE_API_KEY,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(30000)});const d=await res.json();must(res.ok&&d.code===200,'سرویس تصویر درخواست را نپذیرفت',502);return d.data;}
// Image model per salon: 'pro' (Nano Banana Pro, best quality, default) or 'fast' (Nano Banana 2.1).
// A definite rejection of the chosen model (e.g. not enabled on the account) falls back to the
// previous model; network failures are not retried so a paid task is never created twice.
export const IMAGE_MODELS={pro:'nano-banana-pro',fast:'nano-banana-2-1'};
const FALLBACK_MODEL='nano-banana-2';
async function createImageTask(env,cfg,input){const model=IMAGE_MODELS[cfg.image_model]||IMAGE_MODELS.pro;try{return {...await provider(env,'/api/v1/jobs/createTask',{model,input}),model}}catch(e){if(!(e instanceof Problem)||e.status!==502||model===FALLBACK_MODEL)throw e;return {...await provider(env,'/api/v1/jobs/createTask',{model:FALLBACK_MODEL,input}),model:FALLBACK_MODEL}}}
async function uploadProvider(env,m){const object=await bucketFor(env).get(m.object_key);must(object,'عکس در دسترس نیست',410);const bytes=new Uint8Array(await object.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.slice(i,i+8192));const res=await fetch('https://kieai.redpandaai.co/api/file-base64-upload',{method:'POST',headers:{Authorization:'Bearer '+env.KIE_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({base64Data:'data:'+m.mime+';base64,'+btoa(binary),uploadPath:'ayneh',fileName:uid()+'.jpg'})});const d=await res.json();must(d.success&&d.data?.downloadUrl,'ارسال عکس انجام نشد',502);return d.data.downloadUrl;}

export async function api(req,env){const u=new URL(req.url),path=u.pathname;must(env.DB,'پایگاه داده هنوز آماده نیست',503);const db=env.DB;
 if(req.method!=='GET'){must(req.headers.get('origin')===u.origin,'درخواست از این نشانی مجاز نیست',403);must(Number(req.headers.get('content-length')||0)<12000000,'حجم درخواست زیاد است',413);}
 if(path==='/api/inquiry'&&req.method==='POST'){
  await limited(db,'inquiry:'+clientIp(req),5,'درخواست‌های زیادی فرستاده‌ای؛ کمی بعد دوباره امتحان کن');
  const b=await req.json().catch(()=>({}));
  if(String(b.website||'').trim())return J({ok:true});// honeypot: bots fill it, people never see it
  must(b.consent===true,'برای ارسال، تأیید تماس لازم است');
  const name=text(String(b.name||''),60),salon=text(String(b.salon||''),80),city=text(String(b.city||''),40),note=text(String(b.note||''),300),chosen=text(String(b.chosen||''),90);
  must(name.length>=2,'نام را بنویس');must(salon.length>=2,'نام مزون را بنویس');
  const tel=phone(b.phone),id=uid();
  await run(db,'INSERT INTO inquiries(id,name,salon,city,phone,note,chosen,created_at) VALUES(?,?,?,?,?,?,?,?)',id,name,salon,city,tel,note,chosen,Date.now());
  await notifyOwner(env,{kind:'inquiry',level:'good',text:'درخواست معرفی مزون آینه از «'+salon+'»'+(city?' ('+city+')':'')+' ثبت شد',detail:'👤 '+name+'\n📞 '+tel+(chosen?'\n✨ انتخاب در مزون آینه: '+chosen:'')+(note?'\n📝 '+note:'')});
  return J({ok:true});
 }
 if(path==='/api/trial'&&req.method==='POST'){
  await limited(db,'trial:'+clientIp(req),12,'از این شبکه چند صفحهٔ آزمایشی ساخته شده؛ فردا دوباره امتحان کنید');
  const b=await req.json().catch(()=>({}));
  if(String(b.website||'').trim())return J({ok:true,path:'/'});// honeypot
  return J(await createTrial(db,env,u.origin,b));
 }
 if(path==='/api/me'){const who=await identity(req,env);const isOwner=!!who&&(who.via==='password'||(!!env.OWNER_EMAIL&&who.email===env.OWNER_EMAIL));const mgr=isOwner?'':await mgrSlug(req,env);return J({user:!!who,owner:isOwner,manager:mgr,email:who?.email||'',passwordLogin:passwordLoginEnabled(env)});}
 if(path==='/api/login'&&req.method==='POST'){must(passwordLoginEnabled(env),'ورود با رمز روی این میزبان فعال نیست',503);await limited(db,'login:'+clientIp(req),20);const b=await req.json();const given=await hash(String(b?.password||''));const expected=env.OWNER_PASSWORD_HASH?String(env.OWNER_PASSWORD_HASH).toLowerCase():await hash(String(env.OWNER_PASSWORD));must(same(given,expected),'رمز عبور نادرست است',401);return J({ok:true},200,{'Set-Cookie':await issueCookie(env,env.OWNER_ID||'owner',env.OWNER_EMAIL||'',u.protocol==='https:')});}
 if(path==='/api/logout'&&req.method==='POST')return J({ok:true},200,{'Set-Cookie':clearCookie(u.protocol==='https:')});
 if(path==='/api/owner'&&req.method==='GET'){await owner(req,env);const rows=await all(db,"SELECT id,slug,name,profile,telegram_chat_id IS NOT NULL AS telegram,bale_chat_id IS NOT NULL AS bale,(SELECT count(*) FROM portfolio p WHERE p.salon_id=salons.id AND p.published=1) AS portfolio,(SELECT count(*) FROM leads l WHERE l.salon_id=salons.id) AS leads,(SELECT count(*) FROM team t WHERE t.salon_id=salons.id AND t.active=1) AS team,(SELECT count(*) FROM team t WHERE t.salon_id=salons.id AND t.active=1 AND (t.telegram_chat_id IS NOT NULL OR t.bale_chat_id IS NOT NULL)) AS team_linked,(SELECT count(*) FROM leads l WHERE l.salon_id=salons.id AND l.waiting=1) AS waiting,(SELECT count(*) FROM leads l WHERE l.salon_id=salons.id AND l.status='sent' AND l.salon_status='new' AND l.created_at<"+(Date.now()-86400000)+") AS overdue FROM salons ORDER BY created_at DESC");
  return J({salons:rows.map(r=>{const st=setupStatus(r);const {profile,...rest}=r;return {...rest,setup:{filled:st.filled.length,total:st.total,missing:st.missing}}}),alerts:{chats:(await all(db,'SELECT platform FROM owner_chats')).map(x=>x.platform)},activity:await all(db,'SELECT a.kind,a.level,a.text,a.created_at FROM activity a ORDER BY a.created_at DESC LIMIT 60'),bot:botInfo(env),image:!!env.KIE_API_KEY,sms:{otp:smsReady(env),invite:inviteReady(env)}});}
 if(path==='/api/owner/stats'&&req.method==='GET'){{const sl=u.searchParams.get('salon')||'';const m=sl?await one(db,'SELECT * FROM salons WHERE slug=?',sl):null;await ownerOr(req,env,m)}const days=[7,30,90].includes(Number(u.searchParams.get('days')))?Number(u.searchParams.get('days')):30;const slug=u.searchParams.get('salon')||'';let sid=null;if(slug){const x=await one(db,'SELECT id FROM salons WHERE slug=?',slug);must(x,'مزون پیدا نشد',404);sid=x.id}return J(await stats(db,{days,salonId:sid}));}
 if(path==='/api/owner/referrals'&&req.method==='GET'){{const sl=u.searchParams.get('salon')||'';const m=sl?await one(db,'SELECT * FROM salons WHERE slug=?',sl):null;await ownerOr(req,env,m)}const slug=u.searchParams.get('salon')||'';let sid=null;if(slug){const x=await one(db,'SELECT id FROM salons WHERE slug=?',slug);must(x,'مزون پیدا نشد',404);sid=x.id}return J(await report(db,{salonId:sid}));}
 if(path==='/api/owner/alerts-link'&&req.method==='POST'){await owner(req,env);return J({links:await ownerLink(db,env)});}
 if(path==='/api/owner/alerts-unlink'&&req.method==='POST'){await owner(req,env);await run(db,'DELETE FROM owner_chats');return J({ok:true});}
 if(path==='/api/owner/digest'&&req.method==='GET'){await owner(req,env);return J({text:await digest(env)});}
 if(path==='/api/owner/webhook'&&req.method==='POST'){await owner(req,env);return J(await setWebhook(env,env.APP_ORIGIN||u.origin));}
 if(path==='/api/owner/accounts'&&req.method==='GET'){await owner(req,env);return J(await adminAccounts(db,env.APP_ORIGIN||u.origin,u.searchParams));}
 if(path==='/api/owner/ledger'&&req.method==='GET'){await owner(req,env);return J(await adminLedger(db,u.searchParams));}
 if(path==='/api/owner/ledger.csv'&&req.method==='GET'){await owner(req,env);return await adminLedger(db,u.searchParams,true);}
 if(path==='/api/owner/credit-weights'){await owner(req,env);if(req.method==='GET')return J({weights:await weightsOf(db),placeholder:true});return J({weights:await setWeights(db,await req.json().catch(()=>({})))});}
 if(path==='/api/owner/rotate-token'&&req.method==='POST'){await owner(req,env);const b=await req.json().catch(()=>({}));const sl=await one(db,'SELECT * FROM salons WHERE slug=?',String(b.slug||''));must(sl,'مزون پیدا نشد',404);return J({ok:true,panel:(env.APP_ORIGIN||u.origin)+'/m/'+await rotateToken(db,sl)});}
 if(path==='/api/owner/account'&&req.method==='POST'){const who=await owner(req,env);return J(await adminSetAccount(db,await req.json().catch(()=>({})),env,u.origin,who.email||who.user||'owner'));}
 if(path==='/api/owner/manager'&&req.method==='POST'){await owner(req,env);const b=await req.json().catch(()=>({}));const sl=await one(db,'SELECT id FROM salons WHERE slug=?',String(b.slug||''));must(sl,'مزون پیدا نشد',404);await setManager(db,sl.id,b.username,b.password);return J({ok:true});}
 if(path==='/api/owner/recharge'&&req.method==='POST'){const who=await owner(req,env);return J(await adminHandleRequest(db,await req.json().catch(()=>({})),who.email||who.user||'owner'));}
 if(path.startsWith('/api/m/'))return await panelApi(req,env,u);
 if(path==='/api/salons'&&req.method==='POST'){const who=await owner(req,env);const b=await req.json(),id=uid();
  // Capitals, spaces and underscores are normalised ("Aliadli Salon" → "aliadli-salon").
  b.slug=String(b.slug||'').trim().toLowerCase().replace(/[\s_]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
  must(/^[a-z][a-z0-9-]{2,45}$/.test(b.slug),'نشانی صفحه فقط حروف انگلیسی، عدد و خط تیره (-) دارد، با حرف شروع می‌شود و حداقل ۳ حرف است؛ مثل aliadli-salon');
  must(!await one(db,'SELECT 1 FROM salons WHERE slug=?',b.slug),'این نشانی را مزون دیگری گرفته؛ یک نشانی دیگر بنویسید');must(text(b.name||'',100).length>=2,'نام مزون را بنویسید');await run(db,'INSERT INTO salons(id,slug,owner_id,name,created_at,settings,approved,manage_token) VALUES(?,?,?,?,?,?,1,?)',id,b.slug,who.user||'owner',text(b.name,100),Date.now(),JSON.stringify({generation_enabled:true,reference_verified:true}),newToken());await ledger(db,id,100,'opening','create',who.email||who.user||'owner');return J({id,slug:b.slug});}
 if(path.startsWith('/api/p/'))return await publicApi(req,env,u);
 const match=path.match(/^\/api\/s\/([a-z0-9-]+)(?:\/(.*))?$/);must(match,'مسیر پیدا نشد',404);let salon=await one(db,'SELECT * FROM salons WHERE slug=?',match[1]);
 // The public demo salon behind the landing page is created on first visit; owner_id 'system' marks it.
 if(!salon&&match[1]==='demo'){await run(db,'INSERT OR IGNORE INTO salons(id,slug,owner_id,name,profile,settings,created_at) VALUES(?,?,?,?,?,?,?)',uid(),'demo','system','مزون آینه (نسخهٔ نمونه)','{}',JSON.stringify({generation_enabled:true,reference_verified:false,demo:true}),Date.now());salon=await one(db,'SELECT * FROM salons WHERE slug=?','demo')}
 must(salon,'مزون پیدا نشد',404);const route=match[2]||'',cfg=parse(salon.settings),trial=cfg.trial?await trialOf(db,salon.id):null,demo=false;
 if(trial&&!trialLive(trial)&&route!=='public'&&!route.startsWith('owner')&&!route.startsWith('manager'))throw new Problem(410,'این صفحه فعلاً در دسترس نیست؛ بعداً دوباره سر بزنید');
 const readOnly=route==='public'||route==='owner'||route==='owner/credits'||route==='owner/leads'||route==='owner/leads.csv'||route==='owner/social'||route==='requests'||route==='pair/check'||route.startsWith('reactions/')||route.startsWith('media/')||route.startsWith('generation/');
 must(route==='session'?['GET','POST'].includes(req.method):req.method===(readOnly?'GET':'POST'),'متد مجاز نیست',405);
 if(route==='public')return J({salon:publicSalon(salon),brand:cfg.brand||'',backgrounds:BACKGROUNDS,photo_ttl:Number.isInteger(cfg.retention_minutes)&&cfg.retention_minutes>=10?cfg.retention_minutes:0,portfolio:await all(db,'SELECT id,title,category,description,stylist,staff_id AS maker,line,images,try_on,mode,price,stock,1 AS published FROM portfolio WHERE salon_id=? AND published=1 AND permission=1 ORDER BY created_at DESC',salon.id),generation:!!env.KIE_API_KEY&&!!cfg.generation_enabled&&(!demo||smsReady(env)),reference:refOn(cfg),catalog:catalogOn(cfg),own_dress:ownDressOn(cfg),telegram:inboxes(env,salon).length>0||!!await one(db,'SELECT 1 FROM team WHERE salon_id=? AND active=1',salon.id),follow:Object.keys(followLinks(env,'x')),bot:customerLinks(env,salon.slug),otp:smsReady(env),notice:'این تصویر فقط شبیه‌سازی است؛ لباس واقعی ممکن است کمی فرق داشته باشد.',trial:trialPublic(trial),demo,retention_days:retentionDays(cfg),sandbox:!salon.approved&&!!cfg.trial,quota_per:quotaPer(cfg),reaction_reasons:REACTION_REASONS,no_image_message:NO_IMAGE_MSG});
 if(route==='session'&&req.method==='POST'){await limited(db,'session:'+salon.id+':'+clientIp(req),30);const {raw}=await newSession(db,salon);return J({ok:true},200,{'Set-Cookie':cookie(raw)});}
 if(route==='session/claim'&&req.method==='POST'){const b=await req.json().catch(()=>({})),t=String(b.t||'');must(/^[a-f0-9]{64}$/.test(t),'لینک معتبر نیست');await limited(db,'claim:'+clientIp(req),30);const sx=await one(db,'SELECT id FROM sessions WHERE token_hash=? AND salon_id=? AND expires_at>?',await hash(t),salon.id,Date.now());must(sx,'این لینک منقضی شده؛ دوباره عکس را برای ربات بفرست',410);return J({ok:true},200,{'Set-Cookie':cookie(t)});}
 if(route==='manager/login'&&req.method==='POST'){const ck=await managerLogin(req,env,db,salon,clientIp(req),u.protocol==='https:');return J({ok:true},200,{'Set-Cookie':ck});}
 if(route==='manager/logout'&&req.method==='POST')return J({ok:true},200,{'Set-Cookie':clearMgrCookie(u.protocol==='https:')});
 if(route==='manager/password'&&req.method==='POST')return J({ok:true},200,{'Set-Cookie':await changePassword(req,env,db,salon,u.protocol==='https:')});
 if(route==='manager/forgot'&&req.method==='POST')return J(await forgotPassword(env,db,salon,clientIp(req)));
 if(route==='manager/reset'&&req.method==='POST'){const ck=await resetPassword(req,env,db,salon,clientIp(req),u.protocol==='https:');return J({ok:true,login:!!ck},200,ck?{'Set-Cookie':ck}:{});}
 if(route==='manager/rotate-token'&&req.method==='POST'){await ownerOr(req,env,salon);const t=await rotateToken(db,salon);return J({ok:true,panel:(env.APP_ORIGIN||u.origin)+'/m/'+t});}
 if(route.startsWith('owner')){
  await ownerOr(req,env,salon);const r=route.slice(6),b=req.method==='GET'?{}:await req.json();
  if(!r&&req.method==='GET')return J({sms_invite:inviteReady(env),salon:{...publicSalon(salon),settings:{...cfg,reference_verified:refOn(cfg),quota_per_line:quotaPer(cfg)},telegram:!!salon.telegram_chat_id,bale:!!salon.bale_chat_id,link_pending:!!salon.telegram_code_hash&&salon.telegram_code_expires>Date.now()},portfolio:await all(db,'SELECT id,title,category,images,created_at,line,stylist,mode,price,stock FROM portfolio WHERE salon_id=? AND published=1 ORDER BY created_at DESC',salon.id),leads:await all(db,'SELECT l.id,l.name,l.look,l.status,l.salon_status,l.attempts,l.last_error,l.created_at,l.waiting,t.name AS staff FROM leads l LEFT JOIN team t ON t.id=l.staff_id WHERE l.salon_id=? ORDER BY l.created_at DESC LIMIT 50',salon.id),team:await teamView(db,env,salon,u.origin),specialties:SPECIALTIES,setup:(st=>({filled:st.filled.length,total:st.total,missing:st.missing}))(setupStatus(salon)),bot:botInfo(env),image:!!env.KIE_API_KEY});
  if(r==='credits'&&req.method==='GET')return J(await creditStatus(db,salon));
  if(r==='recharge'&&req.method==='POST')return J(await requestRecharge(db,env,salon,b));
  if(r==='profile'){const keep=new Set([...PROFILE_LINKS,...PROFILE_TEXT,...PROFILE_IMAGES,'phone']),old=parse(salon.profile),inc=b.profile||{},p={...old};for(const k of Object.keys(inc))if(keep.has(k)||k in old)p[k]=inc[k];for(const k of PROFILE_LINKS)p[k]=safeLink(p[k]||'');for(const k of PROFILE_TEXT)p[k]=text(p[k]||'',1000);p.phone=digits(p.phone||'').replace(/[\s()-]/g,'');must(!p.phone||/^\+?\d{5,15}$/.test(p.phone),'شمارهٔ تماس مزون معتبر نیست');for(const k of PROFILE_IMAGES)if(p[k])must(await one(db,"SELECT 1 FROM media WHERE id=? AND salon_id=? AND kind='brand'",p[k],salon.id),'عکس برند معتبر نیست');await run(db,'UPDATE salons SET name=?,profile=? WHERE id=?',text(b.name||salon.name,100),JSON.stringify(p),salon.id);return J({ok:true});}
  if(r==='settings'){const lim=Number(b.daily_limit);const s={...cfg,generation_enabled:b.generation_enabled===undefined?!!cfg.generation_enabled:!!b.generation_enabled,reference_verified:b.reference_verified===undefined?!!cfg.reference_verified:!!b.reference_verified,catalog:b.catalog===undefined?catalogOn(cfg):b.catalog===true,allow_own_dress:b.allow_own_dress===undefined?ownDressOn(cfg):b.allow_own_dress===true,image_model:b.image_model===undefined?(cfg.image_model==='fast'?'fast':'pro'):(b.image_model==='fast'?'fast':'pro'),quota_per_line:b.quota_per_line===undefined?quotaPer(cfg):(must(Number.isInteger(b.quota_per_line)&&b.quota_per_line>=QUOTA_MIN&&b.quota_per_line<=QUOTA_MAX,'سهم امتحان هر عروس باید عددی بین ۱ تا ۲۰ باشد'),b.quota_per_line),daily_limit:b.daily_limit===undefined?dailyLimit(cfg):(Number.isInteger(lim)&&lim>=0&&lim<=100000?lim:DAILY_LIMIT),retention_minutes:b.retention_minutes===undefined?cfg.retention_minutes:(Number.isInteger(Number(b.retention_minutes))&&Number(b.retention_minutes)>=10&&Number(b.retention_minutes)<=1440?Number(b.retention_minutes):undefined),retention_days:b.retention_days===undefined?retentionDays(cfg):(Number.isInteger(Number(b.retention_days))&&Number(b.retention_days)>=0&&Number(b.retention_days)<=3650?Number(b.retention_days):retentionDays(cfg))};await run(db,'UPDATE salons SET settings=? WHERE id=?',JSON.stringify(s),salon.id);return J({ok:true});}
  if(r==='telegram-link')return J(await newLinkCode(db,salon,env));
  if(r==='invite'&&req.method==='POST'){
   must(inviteReady(env),'ارسال پیامک هنوز فعال نشده است؛ از تیم مزون آینه بخواهید فعالش کند.',503);
   const nums=mobilesIn(String(b.numbers||''));must(nums.length,'یک تا پنج شمارهٔ موبایل معتبر بنویسید (با فاصله یا ویرگول جدا کنید)');
   const results=[];
   for(const n of nums){const local=n.replace(/^\+98/,'0');
    try{
     if(await one(db,"SELECT 1 FROM invites WHERE salon_id=? AND phone=? AND status='sent' AND created_at>?",salon.id,n,Date.now()-3600000)){results.push({phone:local,ok:false,msg:'همین الان برایش پیامک رفته بود'});continue}
     await limited(db,'invite:'+salon.id,30,'سقف ۳۰ پیامک در روز برای این مزون پر شده است');
     await limited(db,'invite-phone:'+n,3,'برای این شماره امروز چند پیامک رفته است');
     const sent=await sendInvite(env,n,[salon.name,salon.slug]);
     await run(db,'INSERT INTO invites(id,salon_id,phone,rec_id,status,created_at) VALUES(?,?,?,?,?,?)',uid(),salon.id,n,sent.recId,'sent',Date.now());
     results.push({phone:local,ok:true});
    }catch(e){results.push({phone:local,ok:false,msg:e.message||'ارسال نشد'})}
   }
   return J({results});
  }
  if(r==='telegram-unlink'){const col=b.platform==='bale'?'bale_chat_id':b.platform==='telegram'?'telegram_chat_id':null;if(col)await run(db,'UPDATE salons SET '+col+'=NULL WHERE id=?',salon.id);else await run(db,'UPDATE salons SET telegram_chat_id=NULL,bale_chat_id=NULL,telegram_code_hash=NULL,telegram_code_expires=NULL WHERE id=?',salon.id);return J({ok:true});}
  if(r==='team'){const t=await createStaff(db,salon,b.name,b.specialty);return J({member:t,links:await staffInvite(db,env,t),ref:refLink(env,u.origin,salon,t)});}
  if(r==='team/link'){const t=await one(db,'SELECT * FROM team WHERE id=? AND salon_id=? AND active=1',String(b.id||''),salon.id);must(t,'نیرو پیدا نشد',404);return J({links:await staffInvite(db,env,t),ref:refLink(env,u.origin,salon,t)});}
  if(r==='team/remove'){const ids=await transfer(db,salon.id,String(b.id||''),b.to?String(b.to):null);for(const id of ids){const l=await one(db,'SELECT * FROM leads WHERE id=?',id);if(l)await deliverLead(env,l)}return J({ok:true,moved:ids.length});}
  // Portfolio added from the owner console (same row the bot makes): a photo uploaded with
  // upload?kind=portfolio, its title. Published and usable for try-on.
  if(r==='portfolio/add'){
   // One dress = up to 4 real photos from different angles (front, side, back, detail); they all reach the model and the video.
   const ids=[...new Set((Array.isArray(b.media_ids)?b.media_ids:[b.media_id]).map(x=>String(x||'')).filter(Boolean))].slice(0,4),media=ids[0],line=LINE_KEYS.includes(b.line)?b.line:'dress';
   must(ids.length,'عکس نمونه‌کار معتبر نیست');
   for(const m of ids){
    must(await one(db,"SELECT 1 FROM media WHERE id=? AND salon_id=? AND kind='portfolio'",m,salon.id),'عکس نمونه‌کار معتبر نیست');
    must(!await one(db,'SELECT 1 FROM portfolio WHERE salon_id=? AND EXISTS(SELECT 1 FROM json_each(images) WHERE value=?)',salon.id,m),'این عکس قبلاً اضافه شده');}
   const title=text(String(b.title||'').slice(0,150),150)||'نمونه‌کار',id=uid();
   await run(db,'INSERT INTO portfolio(id,salon_id,title,category,description,stylist,images,published,try_on,permission,created_at,staff_id,media_group,line,look) VALUES(?,?,?,?,?,?,?,1,1,1,?,NULL,NULL,?,?)',id,salon.id,title,text(String(b.category||'').slice(0,60),60),text(String(b.description||'').slice(0,500),500),text(String(b.stylist||'').slice(0,80),80),JSON.stringify(ids),Date.now(),line,text(String(b.look||'').slice(0,600),600));
   return J({id});
  }
  if(r==='portfolio/look'){await run(db,'UPDATE portfolio SET look=? WHERE id=? AND salon_id=?',text(String(b.look||'').slice(0,600),600),String(b.id||''),salon.id);return J({ok:true});}
  if(r==='portfolio/info'){const mode=['sale','rent','both'].includes(b.mode)?b.mode:'',stock=['available','ask'].includes(b.stock)?b.stock:'';await run(db,'UPDATE portfolio SET mode=?,price=?,stock=? WHERE id=? AND salon_id=?',mode,text(String(b.price||'').slice(0,60),60),stock,String(b.id||''),salon.id);return J({ok:true});}
  if(r==='portfolio/delete'){await run(db,'DELETE FROM portfolio WHERE id=? AND salon_id=?',b.id,salon.id);return J({ok:true});}
  if(r==='social'){const index=await portfolioIndex(db,salon.id),rows=await all(db,"SELECT g.id,g.result_id,g.owner_name,g.social_at,g.style,g.reference_id,s.bot_name FROM generations g JOIN sessions s ON s.id=g.session_id WHERE g.salon_id=? AND g.social_consent=1 AND g.result_id IS NOT NULL ORDER BY g.social_at DESC LIMIT 200",salon.id);return J({items:rows.map(x=>{const k=dressKeyOf(x,index);return {id:x.id,media:x.result_id,name:x.owner_name||x.bot_name||'',at:x.social_at,dress:k?dressName(k,index):''}})});}
  if(r==='leads'||r==='leads.csv'){
   const st=u.searchParams.get('status')||'',csv=r==='leads.csv';
   must(!st||st==='all'||LEAD_STATUSES.includes(st),'وضعیت معتبر نیست');
   const rows=await all(db,"SELECT l.id,l.name,l.phone,l.look,l.dress_key,l.intent,l.visit_note,l.note,l.status,l.salon_status,l.created_at,l.waiting,l.last_error,t.name AS staff FROM leads l LEFT JOIN team t ON t.id=l.staff_id WHERE l.salon_id=?"+(st&&st!=='all'?" AND l.salon_status=?":'')+" ORDER BY l.created_at DESC LIMIT "+(csv?5000:200),...(st&&st!=='all'?[salon.id,st]:[salon.id]));
   const counts=Object.fromEntries((await all(db,'SELECT salon_status s,COUNT(*) n FROM leads WHERE salon_id=? GROUP BY salon_status',salon.id)).map(x=>[x.s,Number(x.n)]));
   if(!csv)return J({leads:rows,counts,statuses:STATUS_FA});
   // A cell that starts with = + - @ would run as a formula in a spreadsheet, so it gets a leading apostrophe.
   const cell=v=>{let x=String(v??'').replace(/\r?\n/g,' ');if(/^[=+\-@\t]/.test(x))x="'"+x;return '"'+x.replace(/"/g,'""')+'"'};
   const head=['تاریخ','نام','موبایل','لباس','نوع','وضعیت','روز/ساعت دلخواه','توضیح','نیرو'];
   const lines=[head.map(cell).join(',')].concat(rows.map(l=>[new Date(l.created_at).toISOString().slice(0,16).replace('T',' '),l.name,'0'+String(l.phone).replace(/^\+98/,''),l.look,l.intent==='want'?'می‌خواهم':'ارسال',STATUS_FA[l.salon_status]||l.salon_status,l.visit_note,l.note,l.staff||''].map(cell).join(',')));
   return new Response('\ufeff'+lines.join('\r\n'),{headers:{'Content-Type':'text/csv;charset=utf-8','Content-Disposition':'attachment; filename="leads-'+salon.slug+'.csv"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  }
  if(r==='leads/status'){
   must(LEAD_STATUSES.includes(b.status),'وضعیت معتبر نیست');
   const l=await one(db,'SELECT * FROM leads WHERE id=? AND salon_id=?',String(b.id||''),salon.id);must(l,'درخواست یافت نشد',404);
   await applyLeadStatus(env,salon,l,b.status,env.APP_ORIGIN||u.origin);return J({ok:true,status:b.status});
  }
  if(r==='leads/delete'){const res=await deleteLead(env,db,salon.id,String(b.id||''));must(res,'درخواست یافت نشد',404);return J({ok:true,...res});}
  if(r==='leads/retry'){await run(db,"UPDATE leads SET status='retry',attempts=0 WHERE id=? AND salon_id=? AND status='failed'",b.id,salon.id);const l=await one(db,'SELECT * FROM leads WHERE id=? AND salon_id=?',b.id,salon.id);must(l,'درخواست یافت نشد',404);return J({delivered:await deliverLead(env,l)});}
  throw new Problem(404,'مسیر مدیریت یافت نشد');
 }
 if(route==='upload'&&req.method==='POST'){const kind=u.searchParams.get('kind')||'original';let s=null;if(kind==='brand'||kind==='portfolio')await ownerOr(req,env,salon);else{must(['original','reference'].includes(kind));s=await session(req,db,salon);await limited(db,'upload:'+s.id,30);}const cl=Number(req.headers.get('content-length')||0);must(!cl||cl<=maxUpload(env)+1024,'حجم عکس بیش از حد مجاز است ('+Math.round(maxUpload(env)/1024/1024*10)/10+' مگابایت)؛ عکس را کوچک‌تر کن',413);
  const bytes=new Uint8Array(await req.arrayBuffer());let check={};
  if(s){if(kind==='original')must(Number((await one(db,"SELECT COUNT(*) n FROM media WHERE session_id=? AND kind='original'",s.id)).n)<PHOTO_RULES.maxPerSession,'تعداد عکس‌های این نشست زیاد شده؛ صفحه را تازه کن و دوباره امتحان کن',429);check=precheck(bytes,kind)}
  return J({id:await putImage(env,salon,s,bytes,kind),width:check.width??null,height:check.height??null,warnings:check.warnings||[]});}
 if(route.startsWith('media/')){const id=route.slice(6),m=await one(db,'SELECT * FROM media WHERE id=? AND salon_id=?',id,salon.id);must(m,'عکس یافت نشد',404);const profile=parse(salon.profile);let visible=m.kind==='brand'&&PROFILE_IMAGES.some(k=>profile[k]===id);if(!visible)visible=!!await one(db,'SELECT 1 FROM portfolio WHERE salon_id=? AND published=1 AND permission=1 AND EXISTS(SELECT 1 FROM json_each(images) WHERE value=?)',salon.id,id);if(!visible){let isOwner=false;try{await owner(req,env);isOwner=true}catch{}if(!isOwner){const s=await session(req,db,salon);await ownMedia(db,s,id);}}const object=await bucketFor(env).get(m.object_key);must(object,'عکس در دسترس نیست',410);const base={'Content-Type':m.mime,'Cache-Control':visible?'public,max-age=300':'private,no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'"};
if(m.mime==='video/mp4'){const buf=new Uint8Array(await object.arrayBuffer()),size=buf.length,rg=/^bytes=(\d*)-(\d*)$/.exec(req.headers.get('Range')||'');base['Accept-Ranges']='bytes';if(rg){let st=rg[1]===''?Math.max(size-Number(rg[2]),0):Number(rg[1]),en=rg[1]===''||rg[2]===''?size-1:Math.min(Number(rg[2]),size-1);if(st>en||st>=size)return new Response(null,{status:416,headers:{...base,'Content-Range':'bytes */'+size}});return new Response(buf.slice(st,en+1),{status:206,headers:{...base,'Content-Range':'bytes '+st+'-'+en+'/'+size,'Content-Length':String(en-st+1)}});}return new Response(buf,{headers:{...base,'Content-Length':String(size)}});}
return new Response(object.body,{headers:base});}
 if(route==='ref'&&req.method==='POST'){const b=await req.json().catch(()=>({}));await limited(db,'ref:'+salon.id+':'+clientIp(req),3000);return J(await attribute(db,salon,String(b.v||''),String(b.r||'')));}
 if(route==='track'&&req.method==='POST'){const b=await req.json().catch(()=>({}));must(TRACK_KINDS.includes(b.kind)&&b.kind!=='sent','رویداد معتبر نیست');await limited(db,'track:'+salon.id+':'+clientIp(req),800);const meta=typeof b.meta==='string'||typeof b.meta==='number'?String(b.meta):'';await logEvent(db,salon.id,b.kind,String(b.v||''),b.kind==='save_look'?cleanDressKey(meta):meta,b.kind==='view'?String(u.searchParams.get('src')||b.src||'').toLowerCase():'');return J({ok:true});}
 const s=await session(req,db,salon);
 const ownGen=async id=>{must(/^[a-f0-9-]{36}$/.test(String(id||'')),'درخواست معتبر نیست');const g=await one(db,"SELECT * FROM generations WHERE id=? AND salon_id=? AND session_id=? AND state='success' AND kind='single'",String(id),salon.id,s.id);must(g?.result_id,'اول نتیجه را بساز',404);return g};
 if(route==='share'){const b=await req.json(),g=await ownGen(b.gen),nm=text(String(b.name||''),40);if(nm.length>=2)await run(db,'UPDATE generations SET owner_name=? WHERE id=?',nm,g.id);const t=await shareTokenOf(db,g),url=(env.APP_ORIGIN||u.origin)+'/p/'+t;return J({url,token:t,text:postText({name:nm.length>=2?nm:(g.owner_name||s.bot_name),salon:salon.name,dress:await dressNameOf(db,g),url})});}
 if(route==='social'){const b=await req.json(),g=await ownGen(b.gen);await setConsent(env,env.APP_ORIGIN||u.origin,salon,g,b.consent===true);return J({ok:true,consent:b.consent===true?1:2});}
 if(route.startsWith('reactions/')){const g=await ownGen(route.slice(10));return J({...await reactionsOf(db,g),consent:g.social_consent,token:g.share_token||''});}
 if(route==='session')return J({ok:true,cname:s.cust_name||'',cphone:s.cust_phone||'',bot:!!s.bot_chat,original:s.bot_chat?(await one(db,"SELECT id FROM media WHERE session_id=? AND kind='original' ORDER BY created_at DESC LIMIT 1",s.id))?.id||'':'',verified:!!s.verified_phone,name:s.verified_name||'',phone:s.verified_phone||'',quota:trial||demo||await unlimited(db,s)?null:{per:quotaPer(cfg),left:quotaLeft(await quotaUsed(db,salon,s,/^[a-f0-9]{16,32}$/.test(u.searchParams.get('v')||'')?u.searchParams.get('v'):''),quotaPer(cfg))}});
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
 if(route==='requests'){const rows=(await all(db,'SELECT id,look,salon_status,handled_at,created_at,follow_chat IS NOT NULL AS followed FROM leads WHERE session_id=? ORDER BY created_at DESC LIMIT 5',s.id)).map(r=>({...r,status_text:BRIDE_STATUS_FA[r.salon_status]||BRIDE_STATUS_FA.new}));const prof=parse(salon.profile);return J({requests:rows,phone:prof.phone||''});}
 if(route==='leads'&&req.method==='POST'){
  const b=await req.json();must(b.data_consent===true,'رضایت ارسال عکس برای مزون لازم است');must(/^[a-f0-9-]{36}$/.test(b.idem),'شناسه درخواست معتبر نیست');
  must(!smsReady(env)||s.verified_phone,'اول شمارهٔ موبایلت را تأیید کن',403);
  const old=await one(db,'SELECT id,status FROM leads WHERE session_id=? AND idem=?',s.id,b.idem);if(old)return J({id:old.id,delivered:old.status==='sent'});
  const cut=(v,n)=>String(v??'').slice(0,n);const name=s.verified_name||text(cut(b.name,100),100);must(name.length>=2,'نام را وارد کنید');const number=s.verified_phone||phone(b.phone);
  const visitorIn=/^[a-f0-9]{16,32}$/.test(String(b.v||''))?String(b.v):'';
  const hasTeam=!!await one(db,'SELECT 1 FROM team WHERE salon_id=? AND active=1',salon.id);
  must(inboxes(env,salon).length||hasTeam,'این مزون هنوز ارسال آنلاین را فعال نکرده؛ مستقیم با مزون تماس بگیرید',503);
  let handle=text(String(b.telegram||''),40).replace(/^@/,'').replace(/^https?:\/\/t\.me\//,'');if(handle)must(/^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(handle),'آیدی تلگرام معتبر نیست');
  // «این لباس را می‌خواهم»: the same request, tied to the dress of a result. Which dress is decided here
  // from the generation that made the result, never from what the browser says.
  const want=b.intent==='want';let dressKey='',wantLook='',gen=null;
  if(want){
   must(b.preview_id,'اول نتیجهٔ لباس را بساز');
   gen=await one(db,"SELECT * FROM generations WHERE result_id=? AND salon_id=? AND session_id=? AND state='success'",String(b.preview_id),salon.id,s.id);must(gen,'نتیجه پیدا نشد؛ دوباره امتحان کن');
   b.original_id=gen.original_id;b.reference_id=gen.reference_id||undefined;
   const index=await portfolioIndex(db,salon.id);dressKey=dressKeyOf(gen,index);wantLook=dressKey?dressName(dressKey,index):text(cut(b.look,150),150);
  }
  const original=await ownMedia(db,s,b.original_id);must(original.kind==='original','عکس خودتان لازم است');
  if(b.reference_id&&!want)await ownMedia(db,s,b.reference_id);
  if(b.preview_id&&want)must((await ownMedia(db,s,b.preview_id)).kind==='simulation','نتیجهٔ معتبر انتخاب کنید');
  else if(b.preview_id){const p=await ownMedia(db,s,b.preview_id);must(p.kind==='simulation','نتیجهٔ معتبر انتخاب کنید');must(await one(db,"SELECT 1 FROM generations WHERE result_id=? AND original_id=? AND COALESCE(reference_id,'')=? AND salon_id=?",b.preview_id,b.original_id,b.reference_id||'',salon.id),'نتیجه باید با عکس و مدل انتخابی مطابقت داشته باشد');}
  await limited(db,'lead:'+s.id,10);await limited(db,'lead-ip:'+salon.id+':'+clientIp(req),20);
  if(want){
   await limited(db,'want:'+salon.id+':'+number,6,'برای این شماره امروز چند درخواست ثبت شده؛ مزون با تو تماس می‌گیرد');
   // The same bride asking for the same dress again while the first is still open is not sent twice.
   const dup=dressKey?await one(db,"SELECT id,status FROM leads WHERE salon_id=? AND phone=? AND dress_key=? AND intent='want' AND salon_status IN('new','called') AND created_at>?",salon.id,number,dressKey,Date.now()-7*86400000):null;
   if(dup)return J({id:dup.id,delivered:dup.status==='sent',duplicate:true});
  }
  const visitNote=text(cut(b.visit_note,120),120);
  const id=uid(),visitor=visitorIn;
  // The server decides who owns the request (referral tree and mobile lock); the client cannot.
  const own=await ownerFor(db,env,salon,visitor,number);
  // The follow token lets this customer (and only her) link a bot chat for status updates.
  const follow=Array.from(crypto.getRandomValues(new Uint8Array(12)),x=>x.toString(16).padStart(2,'0')).join('');
  await run(db,'INSERT INTO leads(id,salon_id,session_id,name,phone,telegram,original_id,reference_id,preview_id,look,color,note,idem,created_at,follow_hash,visitor,staff_id,line,intent,dress_key,visit_note) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',id,salon.id,s.id,name,number,handle,b.original_id,b.reference_id||null,b.preview_id||null,want?wantLook:text(cut(b.look,150),150),'',text(cut(b.note,want?500:1000),want?500:1000),b.idem,Date.now(),await hash(follow),visitor,own.staff,LINE_KEYS.includes(b.line)?b.line:'dress',want?'want':'',dressKey,visitNote);
  if(visitor)await run(db,'UPDATE ref_visitors SET name=? WHERE salon_id=? AND visitor=?',name,salon.id,visitor);
  await logEvent(db,salon.id,'sent',visitor,want?'want':b.preview_id?'sim':'plain');
  const delivered=await deliverLead(env,await one(db,'SELECT * FROM leads WHERE id=?',id));
  if(own.conflict)await notifyConflict(env,await one(db,'SELECT * FROM leads WHERE id=?',id),own.conflict).catch(e=>console.error('conflict notice',e?.message));
  const waiting=!!(await one(db,'SELECT waiting FROM leads WHERE id=?',id))?.waiting;
  return J({id,delivered,waiting,follow:followLinks(env,follow)});
 }
 if(route==='result-link'&&req.method==='POST'){const b=await req.json().catch(()=>({}));must(/^[a-f0-9-]{36}$/.test(String(b.gen||'')));await limited(db,'rlink:'+s.id,40);return J(await createResultLink(env,db,salon,s,b.gen,env.APP_ORIGIN||new URL(req.url).origin));}
 if(route==='session/profile'&&req.method==='POST'){
  const b=await req.json(),nm=text(String(b.name||'').replace(/\s+/g,' ').trim(),60);let ph=digits(String(b.phone||'')).replace(/\D/g,'');
  if(/^989\d{9}$/.test(ph))ph='0'+ph.slice(2);else if(/^9\d{9}$/.test(ph))ph='0'+ph;
  must(nm.length>=2,'نام و نام خانوادگی را بنویس');must(/^09\d{9}$/.test(ph),'شمارهٔ موبایل درست نیست؛ مثل ۰۹۱۲۳۴۵۶۷۸۹');
  await run(db,'UPDATE sessions SET cust_name=?,cust_phone=? WHERE id=?',nm,ph,s.id);return J({ok:true,name:nm,phone:ph});
 }
 if(route==='reaction'&&req.method==='POST'){const b=await req.json(),g=await ownGen(b.gen),r=b.r==='up'?'up':b.r==='down'?'down':'';
  await run(db,'UPDATE generations SET reaction=? WHERE id=?',r,g.id);
  // «Bad result»: the reason is kept for evals, and the credit and the bride's quota come back once per generation.
  // A session gets at most 3 refunds so a thumbs-down cannot become unlimited free tries.
  let refunded=false;
  if(r){const reason=REACTION_REASONS[b.reason]?b.reason:r==='down'?'other':'',note=text(String(b.note||'').slice(0,200),200);
   if(r==='down'){
    const done=Number((await one(db,'SELECT COUNT(*) n FROM generations WHERE session_id=? AND refunded=1',s.id)).n);
    if(done<3){const claim=await run(db,'UPDATE generations SET refunded=1 WHERE id=? AND refunded=0',g.id);
     if(claim.meta.changes){refunded=true;const W=await weightsOf(db);await ledger(db,salon.id,W.single,'refund',g.id,'bride');if(trial)await refundTrialImage(db,salon.id,1)}}
   }
   await run(db,"INSERT INTO reaction_log(id,generation_id,salon_id,reaction,reason,note,refunded,line,model,reference_id,style,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(generation_id) DO UPDATE SET reaction=excluded.reaction,reason=CASE WHEN ? THEN excluded.reason ELSE reason END,note=CASE WHEN excluded.note<>'' THEN excluded.note ELSE note END",uid(),g.id,salon.id,r,reason,note,refunded?1:0,g.line||'dress',g.model||'',g.reference_id||null,Number.isInteger(g.style)?g.style:null,Date.now(),REACTION_REASONS[b.reason]?1:0);
   if(refunded)await run(db,'UPDATE reaction_log SET refunded=1 WHERE generation_id=?',g.id);
  }
  return J({ok:true,refunded:refunded||g.refunded===1});}
 if(route==='send-bot'&&req.method==='POST'){const b=await req.json(),g=await ownGen(b.gen);return J(await sendToMe(env,env.APP_ORIGIN||u.origin,salon,s,g));}
 if(route==='pair'&&req.method==='POST'){await limited(db,'pair:'+s.id,30);return J(await createPairing(db,salon,s,env.APP_ORIGIN||u.origin));}
 if(route==='pair/check')return J(await pairStatus(db,salon,s,u.searchParams.get('seen')||''));
 if(route==='erase'&&req.method==='POST'){await limited(db,'erase:'+s.id,40);return J({ok:true,deleted:await eraseSession(env,db,salon,s)});}
 if(route==='views'&&req.method==='POST'){await limited(db,'gen-ip:'+salon.id+':'+clientIp(req),15,'امروز چند تصویر از این شبکه ساخته شده؛ فردا دوباره امتحان کنید');await limited(db,'gen-salon:'+salon.id,400,'سقف ساخت تصویر امروز این مزون پر شده است؛ فردا دوباره امتحان کنید');
  const b=await req.json();must(!demo,'نمای سه‌زاویه در نسخهٔ نمونه نیست');must(env.KIE_API_KEY&&cfg.generation_enabled,'ساخت تصویر برای این مزون هنوز فعال نشده',503);must(/^[a-f0-9-]{36}$/.test(b.idem));const existing=await one(db,'SELECT id,state FROM generations WHERE session_id=? AND idem=?',s.id,b.idem);if(existing)return J(existing);const base=await one(db,"SELECT * FROM generations WHERE id=? AND session_id=? AND salon_id=? AND state='success'",b.parent,s.id,salon.id);must(base?.result_id,'عکس پایه معتبر نیست');must((base.line||'dress')==='dress','نمای سه‌زاویه فقط برای لباس عروس است');const m=await ownMedia(db,s,base.result_id),id=uid(),now=Date.now();const visitor=visitorOf(b),free=await unlimited(db,s);const gate=free?{weight:0}:await creditGate(db,env,salon,'views',visitor);if(!trial&&!free)await spendQuota(db,salon,s,visitor,'dress',env);if(dailyLimit(cfg)>0&&!free)await limited(db,'views:'+salon.id,Math.min(20,dailyLimit(cfg)));await spendTrialImage(db,trial,gate.weight);await run(db,"INSERT INTO generations(id,salon_id,session_id,idem,kind,state,original_id,created_at,updated_at,visitor) VALUES(?,?,?,?,'views','creating',?,?,?,?)",id,salon.id,s.id,b.idem,base.original_id,now,now,visitor);if(!free)await afterCharge(env,db,salon,s,visitor,'dress',env.APP_ORIGIN||u.origin,!!trial);
  try{const img=await uploadProvider(env,m);const ang=base.reference_id?(await dressAngles(db,salon,'dress',base.reference_id)).media.slice(1):[];const extra=[];for(const x of ang)extra.push(await uploadProvider(env,x));const task=await createImageTask(env,cfg,{prompt:VIEWS_PROMPT+(extra.length?' Photos 2 to '+(extra.length+1)+' show the same dress from other angles (side, back, detail): copy the real side and back design from them for the side and back tiles.':''),image_input:[img,...extra],aspect_ratio:'16:9',resolution:'2K',output_format:'jpg'});await run(db,"UPDATE generations SET state='waiting',task_id=?,model=? WHERE id=?",task.taskId,String(task.model||''),id);return J({id,state:'waiting'});}catch{await run(db,"UPDATE generations SET state='unknown' WHERE id=?",id);throw new Problem(502,'ساخت تصویر با خطا روبه‌رو شد؛ لطفاً دوباره امتحان کنید');}
 }
 if(route==='spin'&&req.method==='POST'){await limited(db,'gen-ip:'+salon.id+':'+clientIp(req),15,'امروز چند تصویر از این شبکه ساخته شده؛ فردا دوباره امتحان کنید');await limited(db,'gen-salon:'+salon.id,400,'سقف ساخت تصویر امروز این مزون پر شده است؛ فردا دوباره امتحان کنید');
  const b=await req.json();must(!demo,'چرخش ۳۶۰ در نسخهٔ نمونه نیست');must(env.KIE_API_KEY&&cfg.generation_enabled,'ساخت تصویر برای این مزون هنوز فعال نشده',503);must(/^[a-f0-9-]{36}$/.test(b.idem));
  const existing=await one(db,'SELECT id,state FROM generations WHERE session_id=? AND idem=?',s.id,b.idem);if(existing)return J(existing);
  const base=await one(db,"SELECT * FROM generations WHERE id=? AND session_id=? AND salon_id=? AND state='success'",b.parent,s.id,salon.id);must(base?.result_id,'عکس پایه معتبر نیست');must((base.line||'dress')==='dress','چرخش ۳۶۰ فقط برای لباس عروس است');
  const m=await ownMedia(db,s,base.result_id),id=uid(),now=Date.now();const visitor=visitorOf(b),free=await unlimited(db,s);
  await limited(db,'spin:'+s.id,6);
  const gate=free?{weight:0}:await creditGate(db,env,salon,'spin',visitor);
  if(!trial&&!free)await spendQuota(db,salon,s,visitor,'dress',env);
  await spendTrialImage(db,trial,gate.weight);
  await run(db,"INSERT INTO generations(id,salon_id,session_id,idem,kind,state,original_id,created_at,updated_at,visitor) VALUES(?,?,?,?,'spin','creating',?,?,?,?)",id,salon.id,s.id,b.idem,base.original_id,now,now,visitor);
  if(!free)await afterCharge(env,db,salon,s,visitor,'dress',env.APP_ORIGIN||u.origin,!!trial);
  try{const img=await uploadProvider(env,m);const ang=base.reference_id?(await dressAngles(db,salon,'dress',base.reference_id)).media.slice(1):[];const extra=[];for(const x of ang)extra.push(await uploadProvider(env,x));const task=await createImageTask(env,cfg,{prompt:BACK_PROMPT,image_input:[img,...extra],aspect_ratio:RATIOS.includes(parse(base.opts).ratio)?parse(base.opts).ratio:'3:4',resolution:'2K',output_format:'jpg'});await run(db,"UPDATE generations SET state='waiting',task_id=?,opts=? WHERE id=?",task.taskId,JSON.stringify({stage:'back',front:base.result_id}),id);return J({id,state:'waiting'});}catch{await run(db,"UPDATE generations SET state='unknown' WHERE id=?",id);throw new Problem(502,'ساخت تصویر با خطا روبه‌رو شد؛ لطفاً دوباره امتحان کنید');}
 }
 if(route==='generate'&&req.method==='POST'){await limited(db,'gen-ip:'+salon.id+':'+clientIp(req),15,'امروز چند تصویر از این شبکه ساخته شده؛ فردا دوباره امتحان کنید');await limited(db,'gen-salon:'+salon.id,400,'سقف ساخت تصویر امروز این مزون پر شده است؛ فردا دوباره امتحان کنید');
  const b=await req.json();const line=LINE_KEYS.includes(b.line)?b.line:'dress';
  must(!smsReady(env)||s.verified_phone,'اول شمارهٔ موبایلت را تأیید کن',403);must(!demo||smsReady(env),'ساخت تصویر در نسخهٔ نمونه هنوز فعال نشده است',503);
  must(b.image_consent===true,'رضایت ارسال عکس برای پردازش لازم است');await run(db,"UPDATE sessions SET consent_at=COALESCE(consent_at,?),consent_version=? WHERE id=?",Date.now(),CONSENT_VERSION,s.id);
  must(cfg.generation_enabled&&env.KIE_API_KEY,'تولید واقعی این مزون هنوز فعال نشده است',503);
  must(/^[a-f0-9-]{36}$/.test(b.idem));
  const old=await one(db,'SELECT * FROM generations WHERE session_id=? AND idem=?',s.id,b.idem);if(old)return J({id:old.id,state:old.state});
  const original=await ownMedia(db,s,b.original_id);must(original.kind==='original','عکس چهره لازم است');
  const ratio=typeof b.ratio==='string'&&RATIOS.includes(b.ratio)?b.ratio:'2:3';
  let reference=null,angles=[],note='';
  if(b.reference_id){
   const d=await dressAngles(db,salon,line,b.reference_id);
   if(d.media.length){angles=d.media;reference=d.media[0];note=d.look;}
   else{must(ownDressOn(cfg),'در این مزون فقط لباس‌های خود مزون امتحان می‌شود',403);must(refOn(cfg),'انتقال عکس مرجع برای این مزون خاموش است',503);reference=await ownMedia(db,s,b.reference_id);angles=[reference];}
  }
  else{must(catalogOn(cfg),'در این مزون فقط لباس‌های خود مزون امتحان می‌شود',403);must(Number.isInteger(b.style)&&lineStyles(line)[b.style],'لباس معتبر انتخاب کنید');}
  const visitor=visitorOf(b),free=await unlimited(db,s);const gate=free?{weight:0}:await creditGate(db,env,salon,'single',visitor);if(!trial&&!demo&&!free)await spendQuota(db,salon,s,visitor,line,env);
  if(dailyLimit(cfg)>0&&!free)await limited(db,'generation:'+salon.id+':'+new Date().toISOString().slice(0,10),dailyLimit(cfg));if(demo&&!free)await limited(db,'demo:'+s.verified_phone,3,'امروز ۳ تصویر نمونه ساخته‌اید؛ فردا دوباره امتحان کنید یا صفحهٔ آزمایشی مزون خودتان را بسازید');if(!free)await spendTrialImage(db,trial,gate.weight);
  const id=uid(),now=Date.now();
  const mode=reference?'reference':'catalog';
  await run(db,'INSERT INTO generations(id,salon_id,session_id,idem,state,original_id,reference_id,style,transfer,color,created_at,updated_at,line,opts,base_id,visitor) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',id,salon.id,s.id,b.idem,'creating',b.original_id,b.reference_id||null,reference?null:(Number.isInteger(b.style)?b.style:null),mode,'',now,now,line,JSON.stringify({makeup:b.makeup===true,ratio,bg:bgOf(b.bg)?.id||''}),null,visitor);
  if(!free)await afterCharge(env,db,salon,s,visitor,line,env.APP_ORIGIN||u.origin,!!trial||demo);
  let sent=false;try{
   const images=[await uploadProvider(env,original)];for(const a of angles)images.push(await uploadProvider(env,a));
   const venue=bgOf(b.bg);if(venue)images.push((env.APP_ORIGIN||u.origin)+'/bg/'+venue.id+'.jpg');
   const gopts={makeup:b.makeup===true,angles:angles.length,note,bg:venue?images.length:0};const prompt=linePrompt(line,reference?'reference':'catalog',reference?'':lineStyles(line)[b.style][3],gopts);
   sent=true;const job=await createImageTask(env,cfg,{prompt,image_input:images,aspect_ratio:ratio,resolution:'2K',output_format:'jpg'});
   await run(db,"UPDATE generations SET state='waiting',task_id=?,model=? WHERE id=?",job.taskId,String(job.model||''),id);return J({id,state:'waiting'});
  }catch(e){console.error('generate failed',e&&e.message);await run(db,"UPDATE generations SET state=? WHERE id=?",sent?'unknown':'fail',id);throw new Problem(502,'وضعیت ارسال نامشخص است؛ برای جلوگیری از هزینه تکراری، درخواست تازه خودکار ساخته نمی‌شود');}
 }
 if(route.startsWith('generation/')){const id=route.slice(11),g=await one(db,'SELECT * FROM generations WHERE id=? AND salon_id=? AND session_id=?',id,salon.id,s.id);must(g,'درخواست تولید یافت نشد',404);const r=await settle(env,db,salon,s,g);if(r.state==='success'&&g.kind==='single')await sendResultToBot(env,env.APP_ORIGIN||u.origin,salon,s,{...g,result_id:r.result_id}).catch(e=>console.error('bot result',e?.message));return J(r);}
 throw new Problem(404,'مسیر یافت نشد');
}
export function errorResponse(e){if(!(e instanceof Problem))console.error('unhandled',e&&e.stack||e);if(String(e.message).includes('UNIQUE constraint'))return J({error:'این مورد قبلاً ثبت شده است؛ صفحه را تازه کنید'},409);return J({error:e instanceof Problem?e.message:'مشکلی پیش آمد. چند دقیقه بعد دوباره امتحان کنید'},e.status||500);}
