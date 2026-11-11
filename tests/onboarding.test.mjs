import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,readdirSync} from 'node:fs';
import {database,memoryBucket} from '../scripts/local-adapter.mjs';import app from '../worker/index.js';
import {setManager} from '../worker/manager.js';
import * as ob from '../worker/onboarding.js';

const origin='https://test.example';
const migrations=readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort();
function fixture(extra={}){const DB=database();for(const f of migrations)DB.sql.exec(readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8'));return {DB,BUCKET:memoryBucket(),OWNER_EMAIL:'owner@test',JOB_TOKEN:'job-test',TRUST_PLATFORM_IDENTITY:'true',TELEGRAM_BOT_TOKEN:'123:abc',TELEGRAM_WEBHOOK_SECRET:'hook-secret',TELEGRAM_BOT_USERNAME:'ayneh_bot',...extra};}
// Stand-in for both bot APIs: records every call; `rules(method,body,platform)` may return a Response to override.
function mockBots(rules=()=>null){const calls=[];const previous=globalThis.fetch;let mid=100;
 globalThis.fetch=async(url,init)=>{const u=String(url);const tg=u.startsWith('https://api.telegram.org/'),bale=u.startsWith('https://tapi.bale.ai/');if(!tg&&!bale)return previous(url,init);
  const method=u.split('/').pop(),body=JSON.parse(init?.body||'{}'),platform=tg?'telegram':'bale';calls.push({platform,method,body});
  const o=rules(method,body,platform);if(o)return o;
  if(method==='sendVideo')return Response.json({ok:true,result:{message_id:++mid,video:{file_id:'FILEID-'+platform}}});
  return Response.json({ok:true,result:{message_id:++mid}})};
 return {calls,restore(){globalThis.fetch=previous},of(m){return calls.filter(c=>c.method===m)},last(m){return calls.filter(c=>c.method===m).at(-1)?.body}};}
let uidn=1000;
const tgHook=(env,update)=>app.fetch(new Request(origin+'/api/telegram/webhook',{method:'POST',headers:{'content-type':'application/json','x-telegram-bot-api-secret-token':'hook-secret'},body:JSON.stringify({update_id:++uidn,...update})}),env);
const baleHook=(env,update)=>app.fetch(new Request(origin+'/api/bale/webhook/hook-secret',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({update_id:++uidn,...update})}),env);
const priv=(chat,from=chat)=>({chat:{id:chat,type:'private'},from:{id:from,first_name:'امید'}});
const say=(hook,env,chat,text)=>hook(env,{message:{...priv(chat),message_id:++uidn,text}});
const press=(hook,env,chat,data,message_id=55)=>hook(env,{callback_query:{id:'cb'+(++uidn),data,from:{id:chat},message:{message_id,chat:{id:chat,type:'private'}}}});
const contact=(hook,env,chat,phone,user_id=chat,from=chat)=>hook(env,{message:{...priv(chat,from),message_id:++uidn,contact:{phone_number:phone,first_name:'امید',user_id}}});
async function makeSalon(env,{phone='+989121234567',password='Secret-pass1',approved=1,slug='mezon-test'}={}){
 const id='salon-'+slug;env.DB.sql.prepare("INSERT INTO salons(id,slug,owner_id,name,profile,settings,created_at) VALUES(?,?,?,?,?,?,?)").run(id,slug,'owner','مزون تست','{}','{}',Date.now());
 await setManager(env.DB,id,'mgr-user',password);env.DB.sql.prepare('UPDATE salons SET approved=? WHERE id=?').run(approved,id);
 env.DB.sql.prepare("INSERT INTO trials(id,salon_id,name,phone,created_at,expires_at) VALUES(?,?,?,?,?,?)").run('t-'+slug,id,'مدیر',phone,Date.now(),Date.now()+1e9);
 return id;}
const queue=env=>env.DB.sql.prepare('SELECT * FROM promo_queue ORDER BY created_at').all();
const linked=(env,id,col='telegram_chat_id')=>env.DB.sql.prepare('SELECT '+col+' AS c FROM salons WHERE id=?').get(id).c;
const T=[];const note=(who,text)=>T.push(who+': '+String(text).replace(/\n/g,'\n    '));
const show=bots=>{for(const c of bots.calls){const b=c.body;if(['sendMessage','editMessageText'].includes(c.method)){const rows=(b.reply_markup?.inline_keyboard||b.reply_markup?.keyboard||[]).map(r=>'['+r.map(x=>x.text+(x.url?' -> '+x.url:x.callback_data?' (cb '+x.callback_data+')':x.request_contact?' (request_contact)':'')).join(' | ')+']');note('BOT '+c.method+(b.reply_markup?.remove_keyboard?' +remove_keyboard':''),b.text+(rows.length?'\n'+rows.join('\n'):''))}else if(c.method==='deleteMessage')note('BOT deleteMessage','message_id='+b.message_id);else if(c.method==='sendVideo')note('BOT sendVideo',(String(b.video).startsWith('http')?'URL ':'file_id ')+b.video+' | '+b.caption+' | streaming='+b.supports_streaming);else if(c.method==='answerCallbackQuery')note('BOT answerCallbackQuery',b.text||'')}bots.calls.length=0};

test('normalizeMobile: every Iranian spelling becomes 09…; junk is rejected',()=>{
 for(const v of ['+989121234567','989121234567','00989121234567','09121234567','9121234567','+98 912 123 4567','۰۹۱۲۱۲۳۴۵۶۷','+۹۸ ۹۱۲ ۱۲۳ ۴۵۶۷','0912-123-4567'])assert.equal(ob.normalizeMobile(v),'09121234567',v);
 for(const v of ['','0212233445','+14155550123','091212345','0812123456789','abc',null,undefined])assert.equal(ob.normalizeMobile(v),'',String(v));
 assert.equal(ob.e164('09121234567'),'+989121234567');
});

test('keyboards: one button per row, URLs follow the origin, callbacks stay within 64 bytes, at most one symbol per label',()=>{
 for(const kb of [ob.mainKeyboard(origin),ob.guideKeyboard(origin)]){
  for(const row of kb.inline_keyboard){assert.equal(row.length,1);const b=row[0];assert(b.url||b.callback_data);assert(!(b.url&&b.callback_data));if(b.callback_data)assert(Buffer.byteLength(b.callback_data)<=64);if(b.url)assert(b.url.startsWith(origin+'/'));
   assert(!/\p{Emoji_Presentation}/u.test(b.text),'no emoji: '+b.text);assert((b.text.match(/[◂↗✦]/g)||[]).length<=1)}}
 const m=ob.mainKeyboard(origin).inline_keyboard.flat();
 assert.deepEqual(m.map(b=>b.text.replace(/ [◂↗]$/,'')),['ورود مدیر مزون','ثبت‌نام مزون‌دار جدید','راهنمای خرید محصول','مشاهده سایت و دمو محصول']);
 assert.equal(m[0].callback_data,'ob:login');assert.equal(m[1].url,origin+'/register');assert.equal(m[2].callback_data,'ob:guide');assert.equal(m[3].url,origin+'/s/demo');
 const g=ob.guideKeyboard(origin+'/').inline_keyboard.flat();
 assert.deepEqual(g.map(b=>b.url||b.callback_data),[origin+'/',origin+'/register',origin+'/s/demo','ob:home']);
 const ck=ob.contactKeyboard();assert.equal(ck.keyboard[0][0].request_contact,true);
 assert(/تأیید شمارهٔ من/.test(ck.keyboard[0][0].text));
});

test('plain /start: welcome with the four-button menu, video queued once per 24 h; /start <code> and linked managers keep working',async()=>{
 const env=fixture({APP_ORIGIN:'https://ayneh-mezon.site'}),bots=mockBots();
 try{
  await say(tgHook,env,5001,'/start');
  const w=bots.of('sendMessage')[0].body;
  assert.equal(w.text,ob.WELCOME_TEXT);assert.equal(w.parse_mode,'HTML');assert(w.text.startsWith('<b>سلام و خوش آمدید به پلتفرم آینه</b>'));
  assert.equal(w.reply_markup.inline_keyboard[1][0].url,'https://ayneh-mezon.site/register','APP_ORIGIN wins over the request origin');
  assert.equal(w.reply_markup.inline_keyboard[3][0].url,'https://ayneh-mezon.site/s/demo');
  let q=queue(env);assert.equal(q.length,1);assert.equal(q[0].status,'pending');assert(q[0].due_at-q[0].created_at===60000);
  await say(tgHook,env,5001,'/start');assert.equal(queue(env).length,1,'one video per chat per 24h');
  await say(tgHook,env,5002,'/start');assert.equal(queue(env).length,2);
  // an unknown code falls back to the welcome as before? (a 24-hex code that matches nothing keeps the old "expired" answer)
  await say(tgHook,env,5003,'/start '+'a'.repeat(24));assert(/منقضی/.test(bots.last('sendMessage').text));
  // a linked manager still gets the manager help, not the welcome
  const id=await makeSalon(env);env.DB.sql.prepare('UPDATE salons SET telegram_chat_id=? WHERE id=?').run('5009',id);
  bots.calls.length=0;await say(tgHook,env,5009,'/start');assert(/راهنمای مدیر مزون/.test(bots.last('sendMessage').text));
 }finally{bots.restore()}
});

test('guide screen and back button edit the menu message; Bale gets the same menu without HTML',async()=>{
 const env=fixture({BALE_BOT_TOKEN:'bale:tok'}),bots=mockBots();
 try{
  await press(tgHook,env,5001,'ob:guide',77);
  const e=bots.last('editMessageText');assert.equal(e.message_id,77);assert.equal(e.text,ob.GUIDE_TEXT);
  assert(/حدود یک روز کاری/.test(e.text)&&/قیمت هر پنل/.test(e.text)&&!/\d{3,}\s*(تومان|ریال)/.test(e.text),'no invented prices');
  assert.deepEqual(e.reply_markup.inline_keyboard.flat().map(b=>b.url||b.callback_data),[origin+'/',origin+'/register',origin+'/s/demo','ob:home']);
  await press(tgHook,env,5001,'ob:home',77);assert.equal(bots.last('editMessageText').text,ob.WELCOME_TEXT);
  assert.equal(bots.of('answerCallbackQuery').length,2);
  bots.calls.length=0;await say(baleHook,env,6001,'/start');
  const b=bots.calls.find(c=>c.method==='sendMessage');assert.equal(b.platform,'bale');assert(!/<b>/.test(b.body.text)&&!b.body.parse_mode,'Bale is plain text');assert.equal(b.body.reply_markup.inline_keyboard.length,4);
  assert.equal(queue(env).at(-1).platform,'bale');
 }finally{bots.restore()}
});

test('manager sign-in: verified phone, password deleted at once, chat linked, menu shown, state gone',async()=>{
 const env=fixture(),bots=mockBots(),id=await makeSalon(env);
 try{
  await say(tgHook,env,7001,'/start');bots.calls.length=0;
  await press(tgHook,env,7001,'ob:login');
  let m=bots.last('sendMessage');assert.equal(m.text,ob.ASK_PHONE);assert.equal(m.reply_markup.keyboard[0][0].request_contact,true);
  // typing the number does not count
  await say(tgHook,env,7001,'09121234567');assert.equal(bots.last('sendMessage').text,ob.ASK_PHONE);assert.equal(linked(env,id),null);
  // someone else's contact (user id differs) or a contact without id is refused
  await contact(tgHook,env,7001,'+989121234567',9999);assert.equal(bots.last('sendMessage').text,ob.PHONE_REJECT);
  await contact(tgHook,env,7001,'+989121234567',null);assert.equal(bots.last('sendMessage').text,ob.PHONE_REJECT);
  bots.calls.length=0;
  await contact(tgHook,env,7001,'989121234567');
  assert.equal(bots.of('deleteMessage').length,1,'contact card removed');
  assert.equal(bots.last('sendMessage').text,ob.ASK_PASSWORD);assert.equal(bots.last('sendMessage').reply_markup.inline_keyboard[0][0].callback_data,'ob:cancel');
  assert(bots.of('sendMessage')[0].body.reply_markup.remove_keyboard);
  bots.calls.length=0;
  const pw={...priv(7001),message_id:4242,text:'Secret-pass1'};await tgHook(env,{message:pw});
  const names=bots.calls.map(c=>c.method);assert.equal(names[0],'deleteMessage','password is deleted before anything else');assert.equal(bots.calls[0].body.message_id,4242);
  assert.equal(linked(env,id),'7001');
  assert(bots.of('sendMessage').some(c=>/وصل شد/.test(c.body.text)));assert(bots.of('sendMessage').some(c=>/راهنمای مدیر مزون/.test(c.body.text)));
  assert.equal(env.DB.sql.prepare("SELECT COUNT(*) n FROM app_settings WHERE key LIKE 'onb:%'").get().n,0);
  assert(!JSON.stringify(bots.calls).includes('Secret-pass1'),'the password is never echoed');
  // linked chat now behaves as a manager; the queued promo video is skipped
  env.DB.sql.prepare("UPDATE promo_queue SET due_at=0").run();bots.calls.length=0;await ob.processDue(env,{origin});
  assert.equal(bots.of('sendVideo').length,0);assert.equal(queue(env)[0].status,'skipped');
  // a second login from a linked chat is just told so
  await press(tgHook,env,7001,'ob:login');assert(/همین حالا به «مزون تست» وصل است/.test(bots.last('sendMessage').text));
 }finally{bots.restore()}
});

test('manager sign-in on Bale links the Bale chat column',async()=>{
 const env=fixture({BALE_BOT_TOKEN:'bale:tok'}),bots=mockBots(),id=await makeSalon(env);
 try{
  await press(baleHook,env,8001,'ob:login');await contact(baleHook,env,8001,'09121234567');
  await baleHook(env,{message:{...priv(8001),message_id:9,text:'Secret-pass1'}});
  assert.equal(linked(env,id,'bale_chat_id'),'8001');assert.equal(linked(env,id),null);
 }finally{bots.restore()}
});

test('wrong password, unknown phone and unapproved salon all fail with the same words; 5 failures lock the chat for 15 minutes',async()=>{
 const env=fixture(),bots=mockBots(),id=await makeSalon(env);await makeSalon(env,{phone:'+989351112233',slug:'pending-one',approved:0});
 try{
  const attempt=async(chat,phone,password)=>{await press(tgHook,env,chat,'ob:login');await contact(tgHook,env,chat,phone);bots.calls.length=0;await tgHook(env,{message:{...priv(chat),message_id:++uidn,text:password}});const t=bots.of('sendMessage').map(c=>c.body.text);return t};
  const a=await attempt(7101,'09121234567','wrong-password');
  const b=await attempt(7102,'09100000000','Secret-pass1');
  const c=await attempt(7103,'09351112233','Secret-pass1');
  assert.equal(a[0],ob.LOGIN_FAILED);assert.equal(b[0],ob.LOGIN_FAILED);assert.equal(c[0],ob.LOGIN_FAILED);
  assert.equal(linked(env,id),null);
  // five failures on one chat -> lock, even the right password is then refused to start
  for(let i=0;i<4;i++)await attempt(7200,'09121234567','nope'+i);
  const fifth=await attempt(7200,'09121234567','nope5');assert.equal(fifth[0],ob.LOGIN_LOCKED);
  bots.calls.length=0;await press(tgHook,env,7200,'ob:login');assert.equal(bots.last('sendMessage').text,ob.LOGIN_LOCKED);assert.equal(linked(env,id),null);
  // another chat is not locked
  const ok=await attempt(7300,'09121234567','Secret-pass1');assert(ok.some(x=>/وصل شد/.test(x)));
  // the lock expires after the window
  env.DB.sql.prepare("UPDATE app_settings SET value=json_set(value,'$.until',1,'$.first',1) WHERE key='onbf:telegram:7200'").run();
  bots.calls.length=0;await press(tgHook,env,7200,'ob:login');assert.equal(bots.last('sendMessage').text,ob.ASK_PHONE);
 }finally{bots.restore()}
});

test('a password whose deletion fails is reported; cancel and 10-minute expiry end the sign-in',async()=>{
 const env=fixture(),bots=mockBots(r=>null),id=await makeSalon(env);bots.restore();
 const bots2=mockBots((m)=>m==='deleteMessage'?Response.json({ok:false,description:'message can\'t be deleted'},{status:400}):null);
 try{
  await press(tgHook,env,7401,'ob:login');await contact(tgHook,env,7401,'09121234567');bots2.calls.length=0;
  await tgHook(env,{message:{...priv(7401),message_id:1,text:'Secret-pass1'}});
  assert(bots2.of('sendMessage').some(c=>c.body.text.startsWith(ob.DELETE_WARN)),'user told to delete the password message');
  // cancel
  await press(tgHook,env,7402,'ob:login');await press(tgHook,env,7402,'ob:cancel');
  assert.equal(env.DB.sql.prepare("SELECT COUNT(*) n FROM app_settings WHERE key='onb:telegram:7402'").get().n,0);
  bots2.calls.length=0;await say(tgHook,env,7402,'انصراف');assert(/به هیچ مزونی وصل نیست/.test(bots2.last('sendMessage').text),'no state: falls through to the normal stranger reply');
  // reply-keyboard cancel while waiting for the contact
  await press(tgHook,env,7403,'ob:login');bots2.calls.length=0;await say(tgHook,env,7403,'انصراف');assert.equal(bots2.of('sendMessage')[0].body.text,ob.LOGIN_CANCELLED);
  // expiry: state older than 10 minutes; a late password is still deleted and not checked
  await press(tgHook,env,7404,'ob:login');await contact(tgHook,env,7404,'09121234567');
  env.DB.sql.prepare("UPDATE app_settings SET value=json_set(value,'$.ts',?) WHERE key='onb:telegram:7404'").run(Date.now()-11*60000);
  bots2.calls.length=0;await tgHook(env,{message:{...priv(7404),message_id:2,text:'Secret-pass1'}});
  assert.equal(bots2.of('deleteMessage').length,1);assert.equal(bots2.last('sendMessage').text,ob.LOGIN_EXPIRED);assert.equal(linked(env,id),'7401','the late password did not re-link anything');
 }finally{bots2.restore()}
});

test('intro video: due-time gate, URL first then cached file_id, blocked bot, retries then link fallback, never throws',async()=>{
 const env=fixture({APP_ORIGIN:'https://ayneh-mezon.site'});let bots=mockBots();
 try{
  await ob.scheduleIntro(env.DB,'telegram','9001');await ob.scheduleIntro(env.DB,'telegram','9002');await ob.scheduleIntro(env.DB,'telegram','9003');
  assert.equal(await ob.processDue(env,{origin}),0,'nothing is due before 60 s');assert.equal(bots.of('sendVideo').length,0);
  env.DB.sql.prepare("UPDATE promo_queue SET due_at=? WHERE chat_id='9001'").run(Date.now()-1);
  assert.equal(await ob.processDue(env,{origin}),1);
  let v=bots.last('sendVideo');assert.equal(v.video,'https://ayneh-mezon.site/promo/ayneh-intro.mp4');
  assert.equal(v.caption,'معرفی پلتفرم آینه در یک دقیقه');assert.equal(v.supports_streaming,true);assert.equal(v.chat_id,'9001');
  assert.equal(await ob.processDue(env,{origin}),0,'sent rows are not sent again');
  env.DB.sql.prepare("UPDATE promo_queue SET due_at=? WHERE chat_id='9002'").run(Date.now()-1);
  await ob.processDue(env,{origin});assert.equal(bots.last('sendVideo').video,'FILEID-telegram','second send reuses the cached file_id');
  // a blocked bot is marked and not retried
  bots.restore();bots=mockBots((m)=>m==='sendVideo'?Response.json({ok:false,description:'Forbidden: bot was blocked by the user'},{status:403}):null);
  env.DB.sql.prepare("UPDATE promo_queue SET due_at=? WHERE chat_id='9003'").run(Date.now()-1);await ob.processDue(env,{origin});
  assert.equal(queue(env).find(r=>r.chat_id==='9003').status,'blocked');await ob.processDue(env,{origin});assert.equal(bots.of('sendVideo').length,1);
  // transient failures: two retries 90 s apart, then a plain link
  bots.restore();bots=mockBots((m)=>m==='sendVideo'?Response.json({ok:false,description:'Bad Gateway'},{status:502}):null);
  await ob.scheduleIntro(env.DB,'bale','9100');env.DB.sql.prepare("UPDATE promo_queue SET due_at=? WHERE chat_id='9100'").run(Date.now()-1);
  env.BALE_BOT_TOKEN='bale:tok';
  for(let i=0;i<3;i++){await ob.processDue(env,{origin});const r=queue(env).find(x=>x.chat_id==='9100');if(r.status==='pending'){assert(r.due_at>Date.now()+60000);env.DB.sql.prepare("UPDATE promo_queue SET due_at=0 WHERE chat_id='9100'").run()}}
  const r=queue(env).find(x=>x.chat_id==='9100');assert.equal(r.status,'failed');assert.equal(r.attempts,3);
  assert(bots.of('sendMessage').some(c=>c.body.reply_markup?.inline_keyboard?.[0]?.[0]?.url?.endsWith('/promo/ayneh-intro.mp4')),'link fallback sent');
  // crash safety: a stuck "sending" row is retried after 5 minutes
  await ob.scheduleIntro(env.DB,'telegram','9200');env.DB.sql.prepare("UPDATE promo_queue SET status='sending',updated_at=?,due_at=0 WHERE chat_id='9200'").run(Date.now()-6*60000);
  bots.restore();bots=mockBots();await ob.processDue(env,{origin});assert.equal(queue(env).find(x=>x.chat_id==='9200').status,'sent');
  // no database / no tokens: still no throw
  assert.equal(await ob.processDue({},{origin}),0);
 }finally{bots.restore()}
});

test('tick delivers due videos and cleans stale sign-in state; /api/internal/tick still guarded',async()=>{
 const env=fixture(),bots=mockBots();
 try{
  await ob.scheduleIntro(env.DB,'telegram','9301');env.DB.sql.prepare("UPDATE promo_queue SET due_at=0").run();
  env.DB.sql.prepare("INSERT INTO app_settings(key,value,updated_at) VALUES('onb:telegram:1','{\"step\":\"phone\",\"ts\":1}',1)").run();
  const res=await app.fetch(new Request(origin+'/api/internal/tick',{method:'POST',headers:{Authorization:'Bearer job-test'}}),env);
  assert.equal(res.status,200);const d=await res.json();assert.equal(d.promo,1);assert.equal(bots.of('sendVideo').length,1);
  assert.equal(env.DB.sql.prepare("SELECT COUNT(*) n FROM app_settings WHERE key='onb:telegram:1'").get().n,0);
  assert.equal((await app.fetch(new Request(origin+'/api/internal/tick',{method:'POST'}),env)).status,403);
 }finally{bots.restore()}
});

test('opportunistic: an incoming webhook delivers an overdue video (throttled to once per 5 s)',async()=>{
 const env=fixture(),bots=mockBots();const waits=[];const ctx={waitUntil:p=>waits.push(p)};
 try{
  await ob.scheduleIntro(env.DB,'telegram','9401');env.DB.sql.prepare("UPDATE promo_queue SET due_at=0").run();ob._resetThrottle();
  const req=()=>new Request(origin+'/api/telegram/webhook',{method:'POST',headers:{'content-type':'application/json','x-telegram-bot-api-secret-token':'hook-secret'},body:JSON.stringify({update_id:++uidn,message:{...priv(9500),message_id:1,text:'سلام'}})});
  await app.fetch(req(),env,ctx);await Promise.all(waits);
  assert.equal(bots.of('sendVideo').length,1);
  await ob.scheduleIntro(env.DB,'telegram','9402');env.DB.sql.prepare("UPDATE promo_queue SET due_at=0 WHERE chat_id='9402'").run();
  await app.fetch(req(),env,ctx);await Promise.all(waits);assert.equal(bots.of('sendVideo').length,1,'throttled');
 }finally{bots.restore()}
});

test('end-to-end transcript (set SHOW_TRANSCRIPT=1 to print)',async()=>{
 const env=fixture({APP_ORIGIN:'https://ayneh-mezon.site'}),bots=mockBots(),id=await makeSalon(env);
 try{
  note('USER','/start');await say(tgHook,env,1,'/start');show(bots);
  note('USER','taps «راهنمای خرید محصول»');await press(tgHook,env,1,'ob:guide');show(bots);
  note('USER','taps «بازگشت»');await press(tgHook,env,1,'ob:home');show(bots);
  note('USER','taps «ورود مدیر مزون»');await press(tgHook,env,1,'ob:login');show(bots);
  note('USER','shares someone else\'s contact');await contact(tgHook,env,1,'+989121234567',555);show(bots);
  note('USER','taps «تأیید شمارهٔ من» (own contact +98 912 123 4567)');await contact(tgHook,env,1,'+98 912 123 4567');show(bots);
  note('USER','types the password');await tgHook(env,{message:{...priv(1),message_id:31,text:'Secret-pass1'}});show(bots);
  note('SYSTEM','60 s later, chat 2 (a visitor who stayed in the welcome) gets the video');await say(tgHook,env,2,'/start');show(bots);
  env.DB.sql.prepare("UPDATE promo_queue SET due_at=0").run();await ob.processDue(env,{origin:'https://ayneh-mezon.site'});show(bots);
  if(process.env.SHOW_TRANSCRIPT)console.log('\n'+T.join('\n')+'\n');
  assert(T.length>10);assert.equal(linked(env,id),'1');
 }finally{bots.restore()}
});
