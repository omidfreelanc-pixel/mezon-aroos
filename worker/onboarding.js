// Platform onboarding for the Ayneh bot (Telegram + Bale), for a plain /start with no code:
//  - a welcome that explains the product, with a four-button menu;
//  - a purchase guide screen;
//  - the salon manager's sign-in: verified phone (request_contact) + panel password, then the chat is linked
//    to the salon exactly like /start <code>;
//  - an intro video sent about a minute after the welcome (queue table promo_queue, see processDue).
// Nothing here throws into the webhook: every public function swallows its own failures.
import {Problem,digits,limited} from './domain.js';
import {pwHash} from './manager.js';
import {same} from './auth.js';
import {setting,setSetting} from './alerts.js';
import {call,PLATFORMS,platformReady,actorByChat,linkSalonChat,sendManagerHelp} from './telegram.js';

const one=(db,sql,...a)=>db.prepare(sql).bind(...a).first();
const run=(db,sql,...a)=>db.prepare(sql).bind(...a).run();
const all=async(db,sql,...a)=>(await db.prepare(sql).bind(...a).all()).results;
const parse=s=>{try{return JSON.parse(s||'{}')}catch{return {}}};

export const ONB_TTL=10*60000;          // an unfinished sign-in is dropped after 10 minutes
export const LOCK_FAILS=5,LOCK_WINDOW=15*60000; // 5 failures per chat lock sign-in for 15 minutes
export const VIDEO_DELAY=15000;         // intro video is due 15 s after the welcome
export const timing={sleep:ms=>new Promise(r=>setTimeout(r,ms))}; // replaced in tests
export const VIDEO_PATH='/promo/ayneh-intro.mp4';
export const VIDEO_CAPTION='معرفی پلتفرم آینه در یک دقیقه';
const VIDEO_META={width:720,height:1280,duration:54};
const VIDEO_VERSION='v1'; // bump when public/promo/ayneh-intro.mp4 changes so cached file_ids are not reused

/* ---------- copy ---------- */
const RULE='───────────';
export const WELCOME_TEXT='<b>پلتفرم آینه</b>\nپرو مجازی لباس عروس برای مزون‌ها\n'+RULE+'\n'+
 'عروس عکسی تمام‌قد می‌فرستد و تقریباً در یک دقیقه، لباس‌های واقعی <b>همان مزون</b> را با هوش مصنوعی روی خودش می‌بیند؛ سپس نتیجه را برای مزون می‌فرستد.\n\n'+
 '◆ صفحه و <b>QR اختصاصی</b> مزون\n'+
 '◆ مدیریت <b>کاتالوگ</b> لباس‌ها\n'+
 '◆ دریافت <b>درخواست مشتری</b> همین‌جا در ربات\n'+
 '◆ استفاده روی <b>کیوسک</b> یا تبلت مزون\n'+
 '◆ آمار و <b>اعتبار مصرفی</b> در پنل\n'+RULE+'\n'+
 'برای ادامه، یکی از گزینه‌ها را انتخاب کنید.';
export const GUIDE_TEXT='<b>راهنمای خرید و راه‌اندازی</b>\n'+RULE+'\n'+
 '◆ <b>گام اول</b>  ورود به سایت\n'+
 '◆ <b>گام دوم</b>  ثبت‌نام مزون‌دار و ساخت حساب\n'+
 '◆ <b>گام سوم</b>  امتحان <b>دمو</b> پس از ورود\n'+RULE+'\n'+
 '<blockquote>حدود یک روز کاری بعد، کارشناسان ما با شما تماس می‌گیرند. اگر از نتیجه راضی بودید، راه‌اندازی آینه روی کیوسک، تبلت یا دستگاه‌های دیگر و پنل‌های موجود را همراه با <b>قیمت هر پنل</b> برایتان توضیح می‌دهند.</blockquote>';
export const ASK_PHONE='برای ورود مدیر مزون، اول شمارهٔ موبایل خودتان را تأیید کنید.\nدکمهٔ «تأیید شمارهٔ من» را در پایین صفحه بزنید. فقط شمارهٔ خود همین حساب پذیرفته می‌شود و تایپ‌کردن شماره کافی نیست.';
export const PHONE_REJECT='این شماره پذیرفته نشد. فقط شمارهٔ خود حساب شما با دکمهٔ «تأیید شمارهٔ من» قابل تأیید است. دوباره امتحان کنید یا «انصراف» را بزنید.';
export const PHONE_OK='شمارهٔ شما دریافت شد.';
export const ASK_PASSWORD='حالا رمز عبور پنل مدیریت مزون را بفرستید.\nبرای امنیت، پیام رمز شما بلافاصله بعد از دریافت پاک می‌شود. اگر پاک نشد، خودتان آن را حذف کنید.\nاین مرحله ۱۰ دقیقه اعتبار دارد.';
export const LOGIN_FAILED='ورود تأیید نشد. شماره و رمز را بررسی کنید و دوباره از «ورود مدیر مزون» امتحان کنید.';
export const LOGIN_LOCKED='تلاش‌های ناموفق زیاد بود. به‌دلیل امنیت، تا ۱۵ دقیقه دیگر امکان ورود نیست.';
export const LOGIN_EXPIRED='مهلت ورود تمام شد. اگر می‌خواهید ادامه دهید، دوباره «ورود مدیر مزون» را بزنید.';
export const LOGIN_CANCELLED='ورود لغو شد.';
export const ALREADY_LINKED=name=>'این گفتگو همین حالا به «'+name+'» وصل است.';
export const DELETE_WARN='پیام رمز شما به‌طور خودکار پاک نشد. لطفاً خودتان آن را از گفتگو حذف کنید.';
export const MENU_HINT='از منوی زیر ادامه دهید.';

/* ---------- keyboards (one button per row; one small symbol per label) ---------- */
export const BTN={login:'ورود مدیر ◂',panel:'پنل مدیریت من ◂',register:'ثبت‌نام مزون‌دار ↗',guide:'راهنمای خرید ◂',demo:'مشاهده دمو ↗',site:'سایت آینه ↗',demoOnly:'مشاهده دمو ↗',back:'▸ منوی اصلی',cancel:'انصراف',share:'تأیید شمارهٔ من'};
const url=(origin,path='')=>String(origin||'').replace(/\/+$/,'')+path;
// Primary action full width (Telegram paints style:'primary' blue; unsupported -> call() resends without it), secondary in pairs.
export const mainKeyboard=(origin,panel=false)=>{
 const reg={text:BTN.register,url:url(origin,'/register'),style:'primary'},guide={text:BTN.guide,callback_data:'ob:guide'},demo={text:BTN.demo,url:url(origin,'/s/demo')};
 return {inline_keyboard:panel
  ?[[{text:BTN.panel,callback_data:'ob:panel',style:'success'}],[reg],[guide,demo]]
  :[[reg],[{text:BTN.login,callback_data:'ob:login'},guide],[demo]]};
};
export const guideKeyboard=origin=>({inline_keyboard:[
 [{text:BTN.register,url:url(origin,'/register'),style:'primary'}],
 [{text:BTN.site,url:url(origin,'/')},{text:BTN.demoOnly,url:url(origin,'/s/demo')}],
 [{text:BTN.back,callback_data:'ob:home'}]]});
export const contactKeyboard=()=>({keyboard:[[{text:BTN.share,request_contact:true}],[{text:BTN.cancel}]],resize_keyboard:true,one_time_keyboard:true,is_persistent:false});
export const cancelKeyboard=()=>({inline_keyboard:[[{text:BTN.cancel,callback_data:'ob:cancel'}]]});
export const menuKeyboard=()=>({inline_keyboard:[[{text:BTN.back,callback_data:'ob:home'}]]});

/* ---------- phone ---------- */
// Any spelling of an Iranian mobile (+98 / 98 / 0098 / 0 / bare 9..., Persian digits) -> 09xxxxxxxxx, else ''.
export function normalizeMobile(raw){
 let n=digits(raw).replace(/[^\d+]/g,'').replace(/^\+/,'');
 if(n.startsWith('00'))n=n.slice(2);
 if(/^989\d{9}$/.test(n))n='0'+n.slice(2);else if(/^9\d{9}$/.test(n))n='0'+n;
 return /^09\d{9}$/.test(n)?n:'';
}
export const e164=m=>'+98'+m.slice(1); // 09121234567 -> +989121234567 (how trials.phone is stored)

/* ---------- small state in app_settings ---------- */
const stKey=(p,chat)=>'onb:'+p+':'+chat,failKey=(p,chat)=>'onbf:'+p+':'+chat;
async function getJ(db,key){return parse(await setting(db,key))}
const putJ=(db,key,v)=>setSetting(db,key,JSON.stringify(v));
const del=(db,key)=>run(db,'DELETE FROM app_settings WHERE key=?',key);
export const clearOnb=(db,p,chat)=>del(db,stKey(p,chat)).catch(()=>{});
async function getState(db,p,chat){const raw=await setting(db,stKey(p,chat));if(raw==null)return null;const s=parse(raw);return s&&s.step?s:null}
const api=(ctx,method,payload)=>ctx.call?ctx.call(method,payload):call(ctx.env,ctx.p,method,payload);
const sendSafe=async(ctx,text,extra)=>{try{return await ctx.say(text,extra)}catch(e){console.error('onboarding say',e?.message);return null}};
const locked=async ctx=>{const f=await getJ(ctx.db,failKey(ctx.p,ctx.chat));return Number(f.until||0)>Date.now()};
// Counts a failed attempt; the 5th inside 15 minutes locks this chat for 15 minutes.
export async function noteFailure(ctx){
 const key=failKey(ctx.p,ctx.chat),now=Date.now();let f=await getJ(ctx.db,key);
 if(!f.first||now-f.first>LOCK_WINDOW)f={n:0,first:now};
 f.n=(f.n||0)+1;if(f.n>=LOCK_FAILS)f.until=now+LOCK_WINDOW;
 await putJ(ctx.db,key,f);return f.n>=LOCK_FAILS;
}

/* ---------- screens ---------- */
// panel: chat is a linked salon/team chat or the owner chat (menu gets the manager-panel button).
// force: /welcome, skips the 24 h video dedupe. The owner chat always skips it, so it can re-test.
export async function sendWelcome(ctx,{panel=false,force=false}={}){
 let queued=false;
 await typing(ctx);
 await sendSafe(ctx,WELCOME_TEXT,{parse_mode:'HTML',reply_markup:mainKeyboard(ctx.origin,panel)});
 // Rows for panel chats use kind 'introf': processDue does not skip them as "already a salon chat".
 try{queued=await scheduleIntro(ctx.db,ctx.p,ctx.chat,Date.now(),{kind:panel||force?'introf':'intro',force:force||!!ctx.owner})}catch(e){console.error('schedule intro',e?.message)}
 // Primary path: keep this request's isolate alive and send when due. The queue row is the fallback; processDue claims rows atomically, so the video can never go twice.
 if(queued&&ctx.wait)ctx.wait(timing.sleep(VIDEO_DELAY+500).then(()=>processDue(ctx.env,{origin:ctx.origin,limit:5})).catch(()=>{}));
}
const typing=ctx=>api(ctx,'sendChatAction',{chat_id:ctx.chat,action:'typing'}).catch(()=>{});
// A tap always produces a NEW message (so the user sees the reply); the old message loses its buttons so none go stale.
const unstick=(ctx,q)=>q?.message?.message_id?api(ctx,'editMessageReplyMarkup',{chat_id:ctx.chat,message_id:q.message.message_id,reply_markup:{inline_keyboard:[]}}).catch(()=>{}):null;
async function screen(ctx,q,text,kb){
 await typing(ctx);
 await sendSafe(ctx,text,{parse_mode:'HTML',reply_markup:kb});
}

export async function onbCallback(ctx,q){
 const {env,db,p}=ctx,data=String(q.data||''),chat=String(q.message?.chat?.id||'');
 ctx.chat=chat;ctx.say=(t,extra={})=>call(env,p,'sendMessage',{chat_id:chat,text:t,...extra});
 let note='';
 try{
  if(!chat)return;
  if(data==='ob:guide')await screen(ctx,q,GUIDE_TEXT,guideKeyboard(ctx.origin));
  else if(data==='ob:home'){await clearOnb(db,p,chat);await screen(ctx,q,WELCOME_TEXT,mainKeyboard(ctx.origin,await hasPanelChat(ctx)))}
  else if(data==='ob:panel'){await typing(ctx);if(!await sendManagerHelp(ctx,{reply_markup:menuKeyboard()}))note='این گفتگو به مزونی وصل نیست'}
  else if(data==='ob:cancel'){await clearOnb(db,p,chat);await sendSafe(ctx,LOGIN_CANCELLED+'\n'+MENU_HINT,{reply_markup:mainKeyboard(ctx.origin)});note=LOGIN_CANCELLED}
  else if(data==='ob:login')note=await startLogin(ctx);
 }catch(e){console.error('onboarding callback',e?.message)}
 await unstick(ctx,q);
 await api(ctx,'answerCallbackQuery',{callback_query_id:q.id,...(note?{text:note}:{})}).catch(()=>{});
}
const hasPanelChat=async ctx=>!!(await actorByChat(ctx.db,ctx.p,ctx.chat))||!!(await one(ctx.db,'SELECT 1 AS x FROM owner_chats WHERE platform=? AND chat_id=?',ctx.p,ctx.chat));
async function startLogin(ctx){
 const {db,p,chat}=ctx,a=await actorByChat(db,p,chat);
 if(a){await sendSafe(ctx,ALREADY_LINKED(a.salon?.name||''),{reply_markup:menuKeyboard()});return ''}
 if(await locked(ctx)){await sendSafe(ctx,LOGIN_LOCKED,{reply_markup:mainKeyboard(ctx.origin)});return ''}
 await putJ(db,stKey(p,chat),{step:'phone',ts:Date.now()});
 await typing(ctx);
 await sendSafe(ctx,ASK_PHONE,{reply_markup:contactKeyboard()});
 return '';
}

/* ---------- messages while a sign-in is open; true = handled ---------- */
export async function onboardingMessage(ctx,m,textIn){
 try{
  const {db,p,chat}=ctx,st=await getState(db,p,chat);
  if(!st)return false;
  const hide={remove_keyboard:true};
  if(Date.now()-Number(st.ts||0)>ONB_TTL){
   await clearOnb(db,p,chat);
   // The password may be in this very message: remove it even though the sign-in is over.
   if(st.step==='pass'&&m.text)await api(ctx,'deleteMessage',{chat_id:chat,message_id:m.message_id}).catch(()=>{});
   await sendSafe(ctx,LOGIN_EXPIRED,{reply_markup:mainKeyboard(ctx.origin)});return true;
  }
  if(textIn==='انصراف'||textIn==='/cancel'){
   await clearOnb(db,p,chat);
   await sendSafe(ctx,LOGIN_CANCELLED,{reply_markup:hide});
   await sendSafe(ctx,MENU_HINT,{reply_markup:mainKeyboard(ctx.origin)});return true;
  }
  if(st.step==='phone'){
   if(!m.contact){await sendSafe(ctx,ASK_PHONE,{reply_markup:contactKeyboard()});return true}
   await acceptContact(ctx,m,st);return true;
  }
  if(st.step==='pass'){
   if(typeof m.text!=='string'||!m.text){await sendSafe(ctx,'رمز را به‌صورت متن بفرستید یا «انصراف» را بزنید.',{reply_markup:cancelKeyboard()});return true}
   await checkPassword(ctx,m,st);return true;
  }
  await clearOnb(db,p,chat);return false;
 }catch(e){
  console.error('onboarding message',e?.message);
  await sendSafe(ctx,'یک مشکل پیش آمد. کمی بعد دوباره امتحان کنید.',{reply_markup:mainKeyboard(ctx.origin)});
  return true;
 }
}
async function acceptContact(ctx,m,st){
 const {db,p,chat}=ctx,c=m.contact,mobile=normalizeMobile(c?.phone_number);
 // Only the sender's own number counts: a forwarded or hand-picked contact carries someone else's user id (or none).
 const own=c&&c.user_id!=null&&m.from?.id!=null&&String(c.user_id)===String(m.from.id);
 if(!own||!mobile){
  const nowLocked=await noteFailure(ctx);
  if(nowLocked){await clearOnb(db,p,chat);await sendSafe(ctx,LOGIN_LOCKED,{reply_markup:{remove_keyboard:true}});return}
  await sendSafe(ctx,PHONE_REJECT,{reply_markup:contactKeyboard()});return;
 }
 await putJ(db,stKey(p,chat),{step:'pass',phone:mobile,ts:Date.now()});
 await api(ctx,'deleteMessage',{chat_id:chat,message_id:m.message_id}).catch(()=>{}); // the contact card shows the number
 await sendSafe(ctx,PHONE_OK,{reply_markup:{remove_keyboard:true}});
 await sendSafe(ctx,ASK_PASSWORD,{reply_markup:cancelKeyboard()});
}
// Salon whose registered phone (trials.phone, the number used at sign-up and for password recovery) is this one.
export async function salonForPhone(db,mobile){
 return one(db,'SELECT s.* FROM trials t JOIN salons s ON s.id=t.salon_id WHERE t.phone=?',e164(mobile));
}
const DUMMY_SALT='0'.repeat(32);
export async function verifyManager(db,mobile,password){
 const s=await salonForPhone(db,mobile);
 // Same conditions as the website's manager sign-in. A missing salon still costs one PBKDF2, so timing
 // does not tell whether the phone is registered.
 if(!s||!s.approved||!s.mgr_user||!s.mgr_hash||!s.mgr_salt){await pwHash(password,DUMMY_SALT);return null}
 return same(await pwHash(password,s.mgr_salt),s.mgr_hash)?s:null;
}
async function checkPassword(ctx,m,st){
 const {db,p,chat}=ctx;
 // The password leaves the chat first, whatever the outcome.
 const deleted=await api(ctx,'deleteMessage',{chat_id:chat,message_id:m.message_id}).then(()=>true,()=>false);
 let salon=null,blocked=false;
 try{
  await limited(db,'botlogin-chat:'+p+':'+chat,30,'x');
  await limited(db,'botlogin:'+st.phone,12,'x'); // per phone, whether or not it is registered
 }catch(e){if(e instanceof Problem&&e.status===429)blocked=true;else throw e}
 if(!blocked)salon=await verifyManager(db,st.phone,m.text);
 if(!salon){
  const nowLocked=blocked||await noteFailure(ctx);
  await clearOnb(db,p,chat);
  await sendSafe(ctx,nowLocked?LOGIN_LOCKED:LOGIN_FAILED,{reply_markup:mainKeyboard(ctx.origin)});
  if(!deleted)await sendSafe(ctx,DELETE_WARN);
  return;
 }
 await clearOnb(db,p,chat);await del(db,failKey(p,chat)).catch(()=>{});
 await linkSalonChat(ctx,salon,{wizard:false,via:'ورود مدیر با شماره و رمز'});
 if(!deleted)await sendSafe(ctx,DELETE_WARN+' برای امنیت، رمز پنل را هم بعداً عوض کنید.');
}

/* ---------- intro video queue ---------- */
// One row per (platform, chat) per 24 hours; the insert is a single atomic statement, so two welcomes can not queue two videos.
export async function scheduleIntro(db,p,chat,now=Date.now(),{kind='intro',force=false}={}){
 if(force){ // replace whatever is still waiting for this chat, then queue a fresh one
  await run(db,"DELETE FROM promo_queue WHERE platform=? AND chat_id=? AND status='pending'",p,String(chat));
  const r=await run(db,"INSERT INTO promo_queue(id,platform,chat_id,kind,due_at,status,attempts,created_at,updated_at) VALUES(?,?,?,?,?,'pending',0,?,?)",crypto.randomUUID(),p,String(chat),kind,now+VIDEO_DELAY,now,now);
  return r.meta.changes>0;
 }
 const r=await run(db,"INSERT INTO promo_queue(id,platform,chat_id,kind,due_at,status,attempts,created_at,updated_at) SELECT ?,?,?,?,?,'pending',0,?,? WHERE NOT EXISTS(SELECT 1 FROM promo_queue WHERE platform=? AND chat_id=? AND kind IN('intro','introf') AND created_at>?)",crypto.randomUUID(),p,String(chat),kind,now+VIDEO_DELAY,now,now,p,String(chat),now-86400000);
 return r.meta.changes>0;
}
const GONE=/blocked|deactivated|chat not found|kicked|forbidden|not a member|user not found|bot can't initiate/i;
const fidKey=p=>'promo_fid:'+p+':'+VIDEO_VERSION;
async function sendIntro(env,p,chat,origin){
 const db=env.DB,fid=await setting(db,fidKey(p)),base={chat_id:chat,caption:VIDEO_CAPTION,supports_streaming:true,...VIDEO_META};
 let res;
 if(fid){try{res=await call(env,p,'sendVideo',{...base,video:fid})}catch(e){if(GONE.test(e?.message||''))throw e;await run(db,'DELETE FROM app_settings WHERE key=?',fidKey(p))}}
 if(!res)res=await call(env,p,'sendVideo',{...base,video:url(env.APP_ORIGIN||origin,VIDEO_PATH)});
 const id=res?.video?.file_id;if(id&&id!==fid)await setSetting(db,fidKey(p),id).catch(()=>{});
}
// Sends every due video. Safe to call from anywhere, any number of times: rows are claimed with a compare-and-set,
// a crash leaves a 'sending' row that is retried after 5 minutes, and it never throws.
export async function processDue(env,{origin='',limit=5}={}){
 let sent=0;
 try{
  if(!env?.DB)return 0;
  const db=env.DB,now=Date.now();
  await run(db,"UPDATE promo_queue SET status='pending',updated_at=? WHERE status='sending' AND updated_at<?",now,now-300000);
  for(const r of await all(db,"SELECT * FROM promo_queue WHERE status='pending' AND due_at<=? ORDER BY due_at LIMIT ?",now,limit)){
   const claim=await run(db,"UPDATE promo_queue SET status='sending',attempts=attempts+1,updated_at=? WHERE id=? AND status='pending'",Date.now(),r.id);
   if(!claim.meta.changes)continue;
   const finish=(status,error='',due)=>run(db,'UPDATE promo_queue SET status=?,error=?,updated_at=?,due_at=COALESCE(?,due_at) WHERE id=?',status,String(error).slice(0,200),Date.now(),due??null,r.id);
   try{
    const P=PLATFORMS[r.platform];
    if(!P||!platformReady(env,r.platform)){await finish('skipped','platform not configured');continue}
    // A chat that signed in as a manager in the meantime does not need the sales video.
    if(r.kind==='intro'&&await one(db,'SELECT 1 AS x FROM salons WHERE '+P.col+'=? UNION SELECT 1 FROM team WHERE '+P.col+'=? AND active=1',r.chat_id,r.chat_id)){await finish('skipped','already a salon chat');continue}
    try{await sendIntro(env,r.platform,r.chat_id,origin);await finish('sent');sent++}
    catch(e){
     const msg=String(e?.message||e);
     if(GONE.test(msg))await finish('blocked',msg);
     else if(r.attempts+1<3)await finish('pending',msg,Date.now()+90000);
     else{ // give up on the upload; at least hand over the link
      await finish('failed',msg);
      await call(env,r.platform,'sendMessage',{chat_id:r.chat_id,text:VIDEO_CAPTION,reply_markup:{inline_keyboard:[[{text:'تماشای ویدئو ↗',url:url(env.APP_ORIGIN||origin,VIDEO_PATH)}]]}}).catch(()=>{});
     }
    }
   }catch(e){console.error('promo row',e?.message);await finish('pending',e?.message||'error',Date.now()+120000).catch(()=>{})}
  }
 }catch(e){console.error('processDue',e?.message)}
 return sent;
}
// Called from every webhook / landing hit: at most one database look per 5 seconds per isolate.
let lastLook=0;
export function processSoon(env,origin,ctx){
 const now=Date.now();if(now-lastLook<5000)return;lastLook=now;
 const job=processDue(env,{origin});
 try{ctx?.waitUntil(job)}catch{}
}
export const _resetThrottle=()=>{lastLook=0};
// Housekeeping for tick(): stale sign-in states and old queue rows.
export async function onbCleanup(db){
 const now=Date.now();
 await run(db,"DELETE FROM app_settings WHERE key LIKE 'onb:%' AND updated_at<?",now-ONB_TTL*3);
 await run(db,"DELETE FROM app_settings WHERE key LIKE 'onbf:%' AND updated_at<?",now-LOCK_WINDOW*4);
 await run(db,"DELETE FROM promo_queue WHERE created_at<?",now-30*86400000);
 await run(db,"DELETE FROM support_hist WHERE updated_at<?",now-2*86400000).catch(()=>{});
}
