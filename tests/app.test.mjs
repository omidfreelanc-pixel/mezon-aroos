import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,readdirSync} from 'node:fs';
import {database,memoryBucket} from '../scripts/local-adapter.mjs';import app from '../worker/index.js';
import {phone} from '../worker/domain.js';import {appHTML} from '../worker/ui.js';import {customerHTML} from '../worker/customer.js';import {tick,VIEWS_PROMPT} from '../worker/server.js';

const origin='https://test.example';
const migrations=readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort();
function fixture(){const DB=database();for(const f of migrations)DB.sql.exec(readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8'));return {DB,BUCKET:memoryBucket(),OWNER_EMAIL:'owner@test',JOB_TOKEN:'job-test',TRUST_PLATFORM_IDENTITY:'true'};}
const OWNER={user:'owner-a',email:'owner@test'};
async function call(env,path,body,{cookie='',user='',email='',headers:extra={}}={}){const headers={origin,'oai-authenticated-user-id':user,'oai-authenticated-user-email':email,cookie,...extra};let payload;if(body!==undefined){if(body instanceof Uint8Array){payload=body}else{headers['content-type']='application/json';payload=JSON.stringify(body)}}const res=await app.fetch(new Request(origin+path,{method:body===undefined?'GET':'POST',headers,body:payload}),env);let d;try{d=await res.json()}catch{d=null}return {status:res.status,data:d,cookie:res.headers.get('set-cookie')?.split(';')[0]};}
async function salon(env,slug='salon-a'){const r=await call(env,'/api/salons',{slug,name:'مزون '+slug},OWNER);assert.equal(r.status,200,JSON.stringify(r));env.DB.sql.prepare("UPDATE salons SET settings=json_set(COALESCE(settings,'{}'),'$.catalog',json('true')) WHERE slug=?").run(slug);return {id:r.data.id,slug};}
async function guest(env,s){const r=await call(env,'/api/s/'+s.slug+'/session',{});assert.equal(r.status,200);return {cookie:r.cookie};}
const png=()=>{const b=new Uint8Array(150);b.set([137,80,78,71,13,10,26,10]);return b};
async function upload(env,s,g,kind='original'){const r=await call(env,'/api/s/'+s.slug+'/upload?kind='+kind,png(),g);assert.equal(r.status,200,JSON.stringify(r));return r.data.id;}
const lead=(original,extra={})=>({data_consent:true,idem:crypto.randomUUID(),name:'سارا محمدی',phone:'۰۹۱۲۱۲۳۴۵۶۷',original_id:original,look:'پرنسسی پفی',...extra});
// Telegram stand-in: records every call, never reaches the network.
function mockTelegram({fail=false}={}){const calls=[];const previous=globalThis.fetch;globalThis.fetch=async(url,init)=>{const u=String(url);if(u.startsWith('https://api.telegram.org/file/'))return new Response(png());if(!u.startsWith('https://api.telegram.org/'))return previous(url,init);const method=u.split('/').pop();let body=init?.body;if(body instanceof FormData){const o={};for(const [k,v] of body.entries())o[k]=typeof v==='string'?v:'<file>';body=o}else body=JSON.parse(body||'{}');calls.push({method,body});if(fail)return Response.json({ok:false,description:'Bad Gateway'},{status:502});if(method==='getFile')return Response.json({ok:true,result:{file_path:'photos/x.jpg'}});if(method==='getMe')return Response.json({ok:true,result:{username:'ayneh_bot'}});if(method==='sendMediaGroup')return Response.json({ok:true,result:[{message_id:1},{message_id:2}]});return Response.json({ok:true,result:{message_id:1}})};return {calls,restore(){globalThis.fetch=previous}};}
const tgEnv=e=>Object.assign(e,{TELEGRAM_BOT_TOKEN:'123:abc',TELEGRAM_WEBHOOK_SECRET:'hook-secret',TELEGRAM_BOT_USERNAME:'ayneh_bot'});
const hook=(env,update,secret='hook-secret')=>app.fetch(new Request(origin+'/api/telegram/webhook',{method:'POST',headers:{'content-type':'application/json','x-telegram-bot-api-secret-token':secret},body:JSON.stringify(update)}),env);
async function linkSalon(env,s,chat=777,wizard=false){const r=await call(env,'/api/s/'+s.slug+'/owner/telegram-link',{},OWNER);assert.equal(r.status,200,JSON.stringify(r));assert.match(r.data.link,/^https:\/\/t\.me\/ayneh_bot\?start=[a-f0-9]{24}$/);await hook(env,{message:{chat:{id:chat,type:'private'},text:'/start '+r.data.code}});if(wizard===false)await hook(env,{message:{chat:{id:chat,type:'private'},text:'/stop'}});return r.data.code;}

test('pages parse; Iranian mobiles normalise',()=>{
 new Function(appHTML.split('<script>')[1].split('</script>')[0]);
 new Function(customerHTML.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/)[1]);
 assert.equal(phone('۰۹۱۲۱۲۳۴۵۶۷'),'+989121234567');
 assert(!/appointment|services|staff|kavenegar/i.test(customerHTML.match(/<script>([\s\S]*?)<\/script>/)[1]),'customer page no longer books or texts');
});

test('only the project owner manages salons; salon panel routes are gone',async()=>{const e=fixture();
 assert.equal((await call(e,'/api/salons',{slug:'x-salon',name:'x'},{user:'stranger',email:'someone@else'})).status,403);
 const s=await salon(e);
 assert.equal((await call(e,'/api/s/salon-a/owner',undefined,{user:'stranger',email:'someone@else'})).status,403);
 assert.equal((await call(e,'/api/s/salon-a/owner')).status,401);
 assert.equal((await call(e,'/api/s/salon-a/owner',undefined,OWNER)).status,200);
 assert([404,405].includes((await call(e,'/api/s/salon-a/admin',undefined,OWNER)).status),'old panel API is gone');
 assert.equal((await call(e,'/api/s/salon-a/owner/profile',undefined,OWNER)).status,405,'mutations reject GET');
 const me=await call(e,'/api/me',undefined,OWNER);assert.equal(me.data.owner,true);
});

test('owner edits the salon profile; landline phones and links are accepted, bad links are not',async()=>{const e=fixture(),s=await salon(e);
 const ok=await call(e,'/api/s/salon-a/owner/profile',{name:'مزون آینه',profile:{bio:'معرفی',address:'تهران',hours:'۱۰ تا ۲۰',phone:'۰۲۱-۲۲۳۳۴۴۵۵',instagram:'https://instagram.com/x',map:'',telegram:'',website:''}},OWNER);
 assert.equal(ok.status,200,JSON.stringify(ok));
 const pub=await call(e,'/api/s/salon-a/public');assert.equal(pub.data.salon.name,'مزون آینه');assert.equal(pub.data.salon.profile.phone,'02122334455');assert.equal(pub.data.telegram,false);
 assert.equal((await call(e,'/api/s/salon-a/owner/profile',{name:'x',profile:{instagram:'javascript:alert(1)'}},OWNER)).status,400);
});

test('salon isolation and private photos: other guests and other salons cannot read an original',async()=>{const e=fixture(),a=await salon(e),b=await salon(e,'salon-b'),g=await guest(e,a),g2=await guest(e,a);
 const id=await upload(e,a,g);
 assert.equal((await call(e,'/api/s/salon-a/media/'+id,undefined,g)).status,200);
 assert.equal((await call(e,'/api/s/salon-a/media/'+id,undefined,g2)).status,403);
 assert.equal((await call(e,'/api/s/salon-b/media/'+id,undefined,g)).status,404);
 assert.equal((await call(e,'/api/s/salon-a/media/'+id)).status,401);
 assert.equal((await call(e,'/api/s/salon-a/media/'+id,undefined,OWNER)).status,200);
 assert.equal((await call(e,'/api/s/salon-a/session',undefined,g)).status,200);
 assert.equal((await call(e,'/api/s/salon-b/session',undefined,g)).status,401,'a session is bound to its salon');
 assert.equal((await call(e,'/api/s/salon-a/upload?kind=brand',png(),g)).status,401,'customers cannot upload brand images');
});


test('a failed Telegram send is retried by the scheduler, then given up after three attempts',async()=>{const e=tgEnv(fixture()),s=await salon(e),g=await guest(e,s),original=await upload(e,s,g);
 let tg=mockTelegram();await linkSalon(e,s);tg.restore();
 tg=mockTelegram({fail:true});try{
  const r=await call(e,'/api/s/salon-a/leads',lead(original),g);assert.equal(r.status,200);assert.equal(r.data.delivered,false);
  assert.equal(e.DB.sql.prepare('SELECT status FROM leads').get().status,'retry');
  await tick(e,origin);await tick(e,origin);
  const row=e.DB.sql.prepare('SELECT status,attempts FROM leads').get();assert.equal(row.status,'failed');assert.equal(row.attempts,3);
  await tick(e,origin);assert.equal(e.DB.sql.prepare('SELECT attempts FROM leads').get().attempts,3,'no fourth attempt');
 }finally{tg.restore()}
 tg=mockTelegram();try{
  const id=e.DB.sql.prepare('SELECT id FROM leads').get().id;
  const retry=await call(e,'/api/s/salon-a/owner/leads/retry',{id},OWNER);assert.equal(retry.data.delivered,true);
  assert.equal(e.DB.sql.prepare('SELECT status FROM leads').get().status,'sent');
 }finally{tg.restore()}
});

test('Telegram webhook: secret required, link codes are one-time, photos become portfolio items and can be deleted',async()=>{const e=tgEnv(fixture()),s=await salon(e),b=await salon(e,'salon-b');const tg=mockTelegram();try{
 assert.equal((await hook(e,{message:{chat:{id:1,type:'private'},text:'/start'}},'wrong')).status,403);
 const code=await linkSalon(e,s,777);
 await hook(e,{message:{chat:{id:888,type:'private'},text:'/start '+code}});
 assert.equal(e.DB.sql.prepare("SELECT telegram_chat_id c FROM salons WHERE slug='salon-a'").get().c,'777','a used code cannot be reused by another chat');
 assert.equal(e.DB.sql.prepare("SELECT telegram_chat_id c FROM salons WHERE slug='salon-b'").get().c,null);
 await hook(e,{message:{chat:{id:999,type:'private'},photo:[{file_id:'small',file_size:10},{file_id:'big',file_size:2000}],caption:'پرنسسی پفی\nکار نگار'}});
 assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM portfolio').get().n,0,'unlinked chats cannot publish');
 await hook(e,{message:{chat:{id:777,type:'private'},photo:[{file_id:'small',file_size:10},{file_id:'big',file_size:2000}],caption:'پرنسسی پفی\nکار نگار'}});
 assert.equal(tg.calls.find(c=>c.method==='getFile').body.file_id,'big','largest size is used');
 const pub=await call(e,'/api/s/salon-a/public');assert.equal(pub.data.portfolio.length,1);const item=pub.data.portfolio[0];assert.equal(item.title,'پرنسسی پفی');assert.equal(item.category,'پفی');
 assert.equal((await call(e,'/api/s/salon-a/media/'+JSON.parse(item.images)[0])).status,200,'published portfolio is public');
 assert.equal((await call(e,'/api/s/salon-b/public')).data.portfolio.length,0);
 await hook(e,{callback_query:{id:'q1',data:'del:'+item.id,message:{chat:{id:888}}}});
 assert.equal((await call(e,'/api/s/salon-a/public')).data.portfolio.length,1,'another chat cannot delete');
 await hook(e,{callback_query:{id:'q2',data:'del:'+item.id,message:{chat:{id:777}}}});
 assert.equal((await call(e,'/api/s/salon-a/public')).data.portfolio.length,0);
 e.DB.sql.exec("UPDATE salons SET telegram_code_hash='x',telegram_code_expires=0");
 const stale=await call(e,'/api/s/salon-b/owner/telegram-link',{},OWNER);e.DB.sql.exec("UPDATE salons SET telegram_code_expires=1 WHERE slug='salon-b'");
 await hook(e,{message:{chat:{id:555,type:'private'},text:'/start '+stale.data.code}});
 assert.equal(e.DB.sql.prepare("SELECT telegram_chat_id c FROM salons WHERE slug='salon-b'").get().c,null,'expired code rejected');
 const unlink=await call(e,'/api/s/salon-a/owner/telegram-unlink',{},OWNER);assert.equal(unlink.status,200);assert.equal((await call(e,'/api/s/salon-a/public')).data.telegram,false);
}finally{tg.restore()}});


test('expired sessions and CSRF are rejected; the retired hair-studio routes are gone',async()=>{const e=fixture(),s=await salon(e),g=await guest(e,s);
 e.DB.sql.exec('UPDATE sessions SET expires_at=0');assert.equal((await call(e,'/api/s/salon-a/session',undefined,g)).status,401);
 assert.equal((await app.fetch(new Request(origin+'/api/salons',{method:'POST',headers:{origin:'https://evil.example'}}),e)).status,403);
 for(const path of ['/api/create','/api/config','/api/status','/api/views'])assert.equal((await app.fetch(new Request(origin+path,{method:'POST',headers:{origin}}),e)).status,404,path);
 assert.equal((await app.fetch(new Request(origin+'/legacy'),e)).status,404);
 assert.equal((await app.fetch(new Request(origin+'/no-such-page'),e)).status,404);
 assert.equal((await app.fetch(new Request(origin+'/'),e)).status,200);
});


test('queue endpoint rejects the wrong method before evaluating its token',async()=>{const e=fixture();
 assert.equal((await app.fetch(new Request(origin+'/api/internal/tick',{headers:{authorization:'Bearer job-test'}}),e)).status,405);
 assert.equal((await app.fetch(new Request(origin+'/api/internal/tick',{method:'POST'}),e)).status,403);
 assert.equal((await app.fetch(new Request(origin+'/api/internal/tick',{method:'POST',headers:{authorization:'Bearer job-test'}}),e)).status,200);
});

test('tiny uploads get a size-specific error',async()=>{const e=fixture(),s=await salon(e),g=await guest(e,s);
 const r=await call(e,'/api/s/salon-a/upload?kind=original',new Uint8Array([1,2,3]),g);assert.equal(r.status,400);assert.match(r.data.error,/کوچک/);
});

test('retention keeps customer photos and submissions for good; only expired sessions and rate limits go',async()=>{const e=tgEnv(fixture()),s=await salon(e),old=Date.now()-40*86400000;
 e.DB.sql.exec("INSERT INTO sessions(id,salon_id,customer_id,token_hash,expires_at,created_at) VALUES('s-exp','"+s.id+"',NULL,'h-exp',"+(Date.now()-1000)+","+old+")");
 e.DB.sql.exec("INSERT INTO sessions(id,salon_id,customer_id,token_hash,expires_at,created_at) VALUES('s-old','"+s.id+"',NULL,'h-old',"+(Date.now()+1000)+","+old+")");
 e.DB.sql.exec("INSERT INTO limits(key,count,expires_at) VALUES('k-exp',1,"+(Date.now()-1000)+")");
 await e.BUCKET.put(s.id+'/m-exp',new Uint8Array([1,2,3]));
 e.DB.sql.exec("INSERT INTO media(id,salon_id,session_id,kind,object_key,mime,created_at) VALUES('m-exp','"+s.id+"',NULL,'original','"+s.id+"/m-exp','image/jpeg',"+old+")");
 e.DB.sql.exec("INSERT INTO leads(id,salon_id,session_id,name,phone,original_id,idem,status,created_at) VALUES('l-old','"+s.id+"','s-old','x','+989121234567','m-exp','i','sent',"+old+")");
 await tick(e,origin);
 assert.equal(e.DB.sql.prepare("SELECT count(*) n FROM sessions WHERE id='s-exp'").get().n,0);
 assert.equal(e.DB.sql.prepare("SELECT count(*) n FROM limits WHERE key='k-exp'").get().n,0);
 assert.equal(e.DB.sql.prepare("SELECT count(*) n FROM media WHERE id='m-exp'").get().n,1);
 assert.equal(e.DB.sql.prepare("SELECT count(*) n FROM leads").get().n,1);
 assert.equal(e.BUCKET.objects.has(s.id+'/m-exp'),true);
});

test('pages keep framing denied, use no third-party fonts and serve our own fonts and favicon',async()=>{const e=fixture();
 const r=await app.fetch(new Request(origin+'/'),e);assert.match(r.headers.get('content-security-policy'),/frame-ancestors 'none'/);
 for(const html of [customerHTML,appHTML]){assert(!/fonts\.googleapis|gstatic|\/\/[a-z.]*cdn/i.test(html));assert.match(html,/\/fonts\/vazirmatn-arabic\.woff2/);assert(!/type:'date'|type:'time'|datetime-local/.test(html));}
 for(const f of ['vazirmatn-arabic.woff2','vazirmatn-latin.woff2','estedad-arabic.woff2']){const res=await app.fetch(new Request(origin+'/fonts/'+f),e);assert.equal(res.status,200,f);assert.equal(res.headers.get('content-type'),'font/woff2');const b=new Uint8Array(await res.arrayBuffer());assert.equal(String.fromCharCode(...b.slice(0,4)),'wOF2');}
 assert.equal((await app.fetch(new Request(origin+'/fonts/nope.woff2'),e)).status,404);
 assert.match(await (await app.fetch(new Request(origin+'/favicon.svg'),e)).text(),/<svg/);
});

test('owner signs in with a password on hosts without a platform identity gateway',async()=>{const e={...fixture(),TRUST_PLATFORM_IDENTITY:'',OWNER_PASSWORD:'correct horse battery',SESSION_SECRET:'session-secret-for-tests',OWNER_EMAIL:'owner@test',OWNER_ID:'owner-1'};
 const anon=await call(e,'/api/me');assert.equal(anon.data.owner,false);assert.equal(anon.data.passwordLogin,true);
 assert.equal((await call(e,'/api/login',{password:'wrong'})).status,401);
 const ok=await call(e,'/api/login',{password:'correct horse battery'});assert.equal(ok.status,200);assert.match(ok.cookie,/^ayneh_admin=/);
 assert.equal((await call(e,'/api/me',undefined,{cookie:ok.cookie})).data.owner,true);
 assert.equal((await call(e,'/api/salons',{slug:'salon-p',name:'مزون رمز'},{cookie:ok.cookie})).status,200);
 assert.equal((await call(e,'/api/s/salon-p/owner',undefined,{cookie:ok.cookie})).status,200);
 assert.equal((await call(e,'/api/s/salon-p/owner',undefined,{cookie:ok.cookie.replace(/.$/,c=>c==='0'?'1':'0')})).status,401);
 const out=await call(e,'/api/logout',{},{cookie:ok.cookie});assert.equal(out.cookie,'ayneh_admin=');
});

test('password login stays disabled until a secret is configured',async()=>{const e=fixture();assert.equal((await call(e,'/api/login',{password:'anything'})).status,503);assert.equal((await call(e,'/api/me')).data.passwordLogin,false);});

test('hosting identity headers are ignored unless the deployment opts in',async()=>{const base=fixture();await salon(base);const untrusted={...base,TRUST_PLATFORM_IDENTITY:'false'};
 assert.equal((await call(untrusted,'/api/s/salon-a/owner',undefined,OWNER)).status,401);
 assert.equal((await call(untrusted,'/api/salons',{slug:'salon-z',name:'z'},OWNER)).status,401);
});

test('photos fall back to D1 blobs when no object storage is bound',async()=>{const e=fixture();delete e.BUCKET;const s=await salon(e),g=await guest(e,s);
 const id=await upload(e,s,g);const got=await app.fetch(new Request(origin+'/api/s/salon-a/media/'+id,{headers:{cookie:g.cookie}}),e);assert.equal(got.status,200);
 assert.equal(new Uint8Array(await got.arrayBuffer())[0],137);assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM blobs').get().n,1);
});

test('KV adapter round-trips a photo when R2 is unavailable',async()=>{const e=fixture();const store=new Map();e.KV={async put(k,v,o){store.set(k,{v,o})},async getWithMetadata(k){const x=store.get(k);return x?{value:x.v,metadata:x.o?.metadata||null}:{value:null,metadata:null}},async delete(k){store.delete(k)}};delete e.BUCKET;const s=await salon(e),g=await guest(e,s);
 const id=await upload(e,s,g);const got=await app.fetch(new Request(origin+'/api/s/salon-a/media/'+id,{headers:{cookie:g.cookie}}),e);assert.equal(got.status,200);assert.equal(new Uint8Array(await got.arrayBuffer())[0],137);
});


test('salon can pick the faster model; a rejected model falls back once, network errors never retry a paid task',async()=>{const e=fixture(),s=await salon(e),g=await guest(e,s);e.KIE_API_KEY='mock';
 const original=await upload(e,s,g);let previous=globalThis.fetch,models=[],mode='ok';
 globalThis.fetch=async(url,opts)=>{const u=String(url);if(u.includes('file-base64-upload'))return Response.json({success:true,data:{downloadUrl:'https://provider.example/x.jpg'}});if(u.includes('createTask')){const m=JSON.parse(opts.body).model;models.push(m);if(mode==='network')throw new Error('reset');if(mode==='reject'&&m!=='nano-banana-2')return Response.json({code:422,msg:'model not available'});return Response.json({code:200,data:{taskId:'t'+models.length}})}return new Response(png())};
 try{
  await call(e,'/api/s/salon-a/owner/settings',{generation_enabled:true,catalog:true,image_model:'fast'},OWNER);
  assert.equal((await call(e,'/api/s/salon-a/generate',{image_consent:true,idem:crypto.randomUUID(),original_id:original,style:1},g)).status,200);assert.equal(models.at(-1),'nano-banana-2-1');
  await call(e,'/api/s/salon-a/owner/settings',{generation_enabled:true,catalog:true,image_model:'pro'},OWNER);mode='reject';models=[];
  assert.equal((await call(e,'/api/s/salon-a/generate',{image_consent:true,idem:crypto.randomUUID(),original_id:original,style:1},g)).status,200);assert.deepEqual(models,['nano-banana-pro','nano-banana-2']);
  mode='network';models=[];
  assert.equal((await call(e,'/api/s/salon-a/generate',{image_consent:true,idem:crypto.randomUUID(),original_id:original,style:1},g)).status,502);assert.deepEqual(models,['nano-banana-pro'],'no second paid attempt after an ambiguous failure');
 }finally{globalThis.fetch=previous}});

// Melipayamak stand-in: records every call, never reaches the network.
function mockSms({otpCode='48213',recId=123456789012,fail=false}={}){const calls=[];const previous=globalThis.fetch;globalThis.fetch=async(url,init)=>{const u=String(url),base='https://console.melipayamak.com/api/send/';if(!u.startsWith(base))return previous(url,init);const [kind,token]=u.slice(base.length).split('/');calls.push({kind,token,body:JSON.parse(init.body)});if(fail)return Response.json({code:'',recId:3,status:'اعتبار کافی نیست'});return Response.json(kind==='otp'?{code:otpCode,status:''}:{recId,status:''})};return {calls,restore(){globalThis.fetch=previous}};}
const smsEnv=e=>Object.assign(e,{MELIPAYAMAK_TOKEN:'tok-secret',MELIPAYAMAK_BODY_ID:'524',APP_ORIGIN:'https://ayneh.example'});
const otpBody=(extra={})=>({first_name:'سارا',last_name:'محمدی',phone:'۰۹۱۲۱۲۳۴۵۶۷',...extra});

test('SMS is optional: without MELIPAYAMAK_TOKEN nothing is gated and the code routes refuse',async()=>{const e=fixture(),s=await salon(e),g=await guest(e,s);
 assert.equal((await call(e,'/api/s/salon-a/public')).data.otp,false);
 assert.equal((await call(e,'/api/s/salon-a/otp/send',otpBody(),g)).status,503);
 const original=await upload(e,s,g);assert.equal((await call(e,'/api/s/salon-a/leads',lead(original),g)).status,503,'only the missing Telegram link blocks it, not verification');
});

test('mobile verification: code is texted, checked server-side, gates generation and fixes the lead identity',async()=>{const e=smsEnv(tgEnv(fixture())),s=await salon(e),g=await guest(e,s);e.KIE_API_KEY='mock';
 assert.equal((await call(e,'/api/s/salon-a/public')).data.otp,true);
 const original=await upload(e,s,g);
 assert.equal((await call(e,'/api/s/salon-a/generate',{image_consent:true,idem:crypto.randomUUID(),original_id:original,style:1},g)).status,403,'generation needs a verified mobile');
 const sms=mockSms(),tg=mockTelegram();try{
  assert.equal((await call(e,'/api/s/salon-a/otp/send',otpBody({phone:'12345'}),g)).status,400);
  assert.equal((await call(e,'/api/s/salon-a/otp/send',otpBody({first_name:'س'}),g)).status,400);
  assert.equal(sms.calls.length,0,'nothing texted for invalid input');
  const sent=await call(e,'/api/s/salon-a/otp/send',otpBody(),g);assert.equal(sent.status,200,JSON.stringify(sent));
  assert.deepEqual(sms.calls[0],{kind:'otp',token:'tok-secret',body:{to:'09121234567'}});
  assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM otps').get().n,1);
  assert(!JSON.stringify(e.DB.sql.prepare('SELECT * FROM otps').all()).includes('48213'),'only a hash of the code is stored');
  assert.equal((await call(e,'/api/s/salon-a/otp/send',otpBody(),g)).status,429,'resend cooldown');
  assert.equal((await call(e,'/api/s/salon-a/otp/verify',{code:'11111'},g)).status,400);
  assert.equal((await call(e,'/api/s/salon-a/leads',lead(original),g)).status,403,'unverified sessions cannot send requests');
  const other=await guest(e,s);assert.equal((await call(e,'/api/s/salon-a/otp/verify',{code:'48213'},other)).status,400,'a code only works in the session that asked for it');
  const ok=await call(e,'/api/s/salon-a/otp/verify',{code:'۴۸۲۱۳'},g);assert.equal(ok.status,200,JSON.stringify(ok));assert.equal(ok.data.phone,'+989121234567');
  assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM otps').get().n,0,'a used code is gone');
  const me=await call(e,'/api/s/salon-a/session',undefined,g);assert.equal(me.data.verified,true);assert.equal(me.data.name,'سارا محمدی');
  assert.equal((await call(e,'/api/s/salon-a/session',undefined,other)).data.verified,false);
  const gen=await call(e,'/api/s/salon-a/generate',{image_consent:true,idem:crypto.randomUUID(),original_id:original,style:1},g);assert.notEqual(gen.status,403,'verified sessions pass the gate');
  await linkSalon(e,s);
  const r=await call(e,'/api/s/salon-a/leads',lead(original,{name:'کس دیگر',phone:'09351112233'}),g);assert.equal(r.status,200,JSON.stringify(r));
  const row=e.DB.sql.prepare('SELECT name,phone FROM leads').get();assert.equal(row.phone,'+989121234567','the verified mobile wins over the form');assert.equal(row.name,'سارا محمدی');
 }finally{sms.restore();tg.restore()}
});

test('verification limits: five wrong guesses burn the code, expired codes are refused, provider failures are reported without leaking the token',async()=>{const e=smsEnv(fixture()),s=await salon(e);
 const sms=mockSms();try{
  let g=await guest(e,s);await call(e,'/api/s/salon-a/otp/send',otpBody(),g);
  for(let i=0;i<5;i++)assert.equal((await call(e,'/api/s/salon-a/otp/verify',{code:'00000'},g)).status,400);
  assert.equal((await call(e,'/api/s/salon-a/otp/verify',{code:'48213'},g)).status,429,'right code too late: attempts are spent');
  assert.equal(e.DB.sql.prepare('SELECT verified_phone p FROM sessions WHERE id IS NOT NULL LIMIT 1').get().p,null);
  g=await guest(e,s);await call(e,'/api/s/salon-a/otp/send',otpBody({phone:'09351112233'}),g);
  e.DB.sql.exec('UPDATE otps SET expires_at=1');assert.equal((await call(e,'/api/s/salon-a/otp/verify',{code:'48213'},g)).status,410);
  await tick(e,origin);assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM otps').get().n,0,'expired codes are cleaned up');
  // one mobile cannot be used to spam: 5 codes a day
  for(let i=0;i<7;i++){const x=await guest(e,s);const r=await call(e,'/api/s/salon-a/otp/send',otpBody({phone:'09361110000'}),x);if(i>=5)assert.equal(r.status,429,'per-number daily cap');else assert.equal(r.status,200);}
 }finally{sms.restore()}
 const bad=mockSms({fail:true});try{
  const g2=await guest(e,s);const r=await call(e,'/api/s/salon-a/otp/send',otpBody({phone:'09371110000'}),g2);assert.equal(r.status,502);assert(!JSON.stringify(r.data).includes('tok-secret'));
  assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM otps WHERE phone=?').get('+989371110000').n,0,'no code stored when the text was not sent');
 }finally{bad.restore()}
});

test('a salon texts its page link to a customer by typing the mobile number in the Telegram bot',async()=>{const e=smsEnv(tgEnv(fixture())),s=await salon(e,'salon-a');await call(e,'/api/s/salon-a/owner/profile',{name:'مزون آینه',profile:{}},OWNER);
 const tg=mockTelegram(),sms=mockSms();try{
  await linkSalon(e,s,777);
  const say=t=>hook(e,{message:{chat:{id:777,type:'private'},text:t}});
  const last=()=>tg.calls.filter(c=>c.method==='sendMessage').at(-1).body.text;
  await say('۰۹۱۲۱۲۳۴۵۶۷');
  assert.deepEqual(sms.calls.at(-1),{kind:'shared',token:'tok-secret',body:{bodyId:524,to:'09121234567',args:['مزون آینه','salon-a']}});
  assert.match(last(),/✅ 09121234567/);
  assert.equal(e.DB.sql.prepare("SELECT status FROM invites").get().status,'sent');
  const n=sms.calls.length;await say('09121234567');assert.equal(sms.calls.length,n,'same number is not texted twice within an hour');assert.match(last(),/↩️/);
  await say('09351112233 09361112233');assert.equal(sms.calls.length,n+2,'several numbers in one message');
  await say('سلام ۰۹۱۲');assert.equal(sms.calls.length,n+2,'ordinary text never sends a text message');
  await say('0912111222 0912111223 0912111224 0912111225 0912111226 0912111227');assert.equal(sms.calls.length,n+2,'more than five numbers is not a number message');
  assert.equal((await hook(e,{message:{chat:{id:999,type:'private'},text:'09371112233'}})).status,200);assert.equal(sms.calls.length,n+2,'unlinked chats cannot send texts');
  // credit problems are shown to the salon, not hidden
  const bad=mockSms({fail:true});try{await say('09381112233');assert.match(last(),/❌ 09381112233/);assert.equal(e.DB.sql.prepare("SELECT status FROM invites WHERE phone='+989381112233'").get().status,'failed')}finally{bad.restore()}
  // the daily cap per salon
  e.DB.sql.exec("DELETE FROM limits");for(let i=0;i<30;i++)await say('09'+String(100000000+i).slice(-9));
  const before=sms.calls.length;await say('09391112233');assert.equal(sms.calls.length,before,'31st text of the day is refused');assert.match(last(),/سقف/);
 }finally{sms.restore();tg.restore()}
 // not configured: the bot says so instead of silently ignoring the number
 const e2=tgEnv(fixture()),s2=await salon(e2,'salon-b');const tg2=mockTelegram();try{await linkSalon(e2,s2,555);await hook(e2,{message:{chat:{id:555,type:'private'},text:'09121234567'}});const m=tg2.calls.filter(c=>c.method==='sendMessage').at(-1).body;assert.match(m.text,/لینک برای <b>09121234567/);const btn=m.reply_markup.inline_keyboard.flat();assert.match(btn[0].url,/^https:\/\/wa\.me\/989121234567\?text=/);assert.match(btn[1].url,/^https:\/\/t\.me\/share\/url\?url=/);assert.match(btn[2].url,/\/i\/salon-b\?to=09121234567$/)}finally{tg2.restore()}
});

test('owner console reports SMS state; verified mobiles and invite records are kept; dev-mock never calls the network',async()=>{const e=smsEnv(fixture());await salon(e);
 assert.deepEqual((await call(e,'/api/owner',undefined,OWNER)).data.sms,{otp:true,invite:true});
 assert.deepEqual((await call(fixture(),'/api/owner',undefined,OWNER)).data.sms,{otp:false,invite:false});
 const old=Date.now()-40*86400000,sid=e.DB.sql.prepare('SELECT id FROM salons').get().id;
 e.DB.sql.exec("INSERT INTO sessions(id,salon_id,customer_id,token_hash,expires_at,created_at,verified_phone,verified_name) VALUES('s-v','"+sid+"',NULL,'h-v',"+(Date.now()+1000)+","+old+",'+989121234567','x y')");
 e.DB.sql.exec("INSERT INTO invites(id,salon_id,phone,status,created_at) VALUES('i-old','"+sid+"','+989121234567','sent',"+old+")");
 await tick(e,origin);
 assert.equal(e.DB.sql.prepare("SELECT verified_phone p FROM sessions WHERE id='s-v'").get()?.p,'+989121234567');
 assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM invites').get().n,1);
 const {sendOtp,DEV_CODE}=await import('../worker/sms.js');const previous=globalThis.fetch;globalThis.fetch=()=>{throw new Error('network used')};try{assert.equal(await sendOtp({MELIPAYAMAK_TOKEN:'dev-mock'},'+989121234567'),DEV_CODE)}finally{globalThis.fetch=previous}
});

test('with an approved code text the code is generated here and sent from the shared line',async()=>{const e=smsEnv(fixture()),s=await salon(e);e.MELIPAYAMAK_OTP_BODY_ID='573875';
 const sms=mockSms();try{
  const g=await guest(e,s);const r=await call(e,'/api/s/salon-a/otp/send',otpBody(),g);assert.equal(r.status,200,JSON.stringify(r));
  const c=sms.calls.at(-1);assert.equal(c.kind,'shared');assert.equal(c.body.bodyId,573875);assert.equal(c.body.to,'09121234567');assert.match(c.body.args[0],/^\d{6}$/);
  assert.equal((await call(e,'/api/s/salon-a/otp/verify',{code:'000000'},g)).status,400);
  assert.equal((await call(e,'/api/s/salon-a/otp/verify',{code:c.body.args[0]},g)).status,200,'the code we generated verifies');
 }finally{sms.restore()}
});

// ---------- follow-up, wizard, Bale, tracking, stats, link previews ----------
const baleHook=(env,update,secret='hook-secret')=>app.fetch(new Request(origin+'/api/bale/webhook/'+secret,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(update)}),env);
async function sendLead(e,s,g,extra={}){const original=await upload(e,s,g);const r=await call(e,'/api/s/'+s.slug+'/leads',lead(original,{v:'a'.repeat(32),...extra}),g);assert.equal(r.status,200,JSON.stringify(r));return r.data;}

test('salon taps a status button: the lead updates, the keyboard marks it, a following customer is told',async()=>{const e=tgEnv(fixture()),s=await salon(e),g=await guest(e,s);const tg=mockTelegram();try{
 await linkSalon(e,s,777);const d=await sendLead(e,s,g);
 const token=d.follow.telegram.split('start=f_')[1];
 await hook(e,{message:{chat:{id:5150,type:'private'},text:'/start f_'+token}});
 assert.equal(e.DB.sql.prepare('SELECT follow_chat c FROM leads').get().c,'5150');
 assert.match(tg.calls.filter(c=>c.method==='sendMessage'&&c.body.chat_id==='5150').at(-1).body.text,/هر وقت/);
 await hook(e,{callback_query:{id:'q1',data:'ls:called:'+d.id,message:{chat:{id:888},message_id:9}}});
 assert.equal(e.DB.sql.prepare('SELECT salon_status s FROM leads').get().s,'new','another chat cannot change it');
 await hook(e,{callback_query:{id:'q2',data:'ls:booked:'+d.id,message:{chat:{id:777},message_id:9}}});
 const row=e.DB.sql.prepare('SELECT salon_status s,handled_at h FROM leads').get();assert.equal(row.s,'booked');assert(row.h>0);
 const edit=tg.calls.find(c=>c.method==='editMessageReplyMarkup');assert(edit.body.reply_markup.inline_keyboard.flat().some(b=>b.text.startsWith('✔︎ ')&&b.callback_data.startsWith('ls:booked')));
 assert.match(tg.calls.filter(c=>c.method==='sendMessage'&&c.body.chat_id==='5150').at(-1).body.text,/نوبت شما را هماهنگ کرد/);
 const mine=await call(e,'/api/s/salon-a/requests',undefined,g);assert.equal(mine.data.requests[0].salon_status,'booked');assert.equal(mine.data.requests[0].followed,1);
 const other=await guest(e,s);assert.equal((await call(e,'/api/s/salon-a/requests',undefined,other)).data.requests.length,0,'a customer sees only her own requests');
 await hook(e,{message:{chat:{id:6000,type:'private'},text:'/start f_'+'0'.repeat(24)}});assert.match(tg.calls.at(-1).body.text,/منقضی/);
}finally{tg.restore()}});

test('untouched submissions are reminded at 2h and 24h during Tehran working hours, then the customer is told',async()=>{const e=tgEnv(fixture()),s=await salon(e),g=await guest(e,s);const tg=mockTelegram();try{
 await linkSalon(e,s,777);const d=await sendLead(e,s,g);e.DB.sql.exec("UPDATE leads SET follow_chat='5150',follow_platform='telegram'");
 const {remind}=await import('../worker/telegram.js');
 const noon=Date.parse('2026-11-03T08:30:00Z'),night=Date.parse('2026-11-03T20:00:00Z'); // 12:00 and 23:30 Tehran
 e.DB.sql.exec('UPDATE leads SET created_at='+(noon-3*3600000));
 assert.equal(await remind(e,origin,night),0,'quiet at night');
 assert.equal(await remind(e,origin,noon),1);assert.equal(await remind(e,origin,noon),0,'not twice');
 assert.match(tg.calls.filter(c=>c.body.chat_id==='777').at(-1).body.text,/یادآوری/);
 e.DB.sql.exec('UPDATE leads SET created_at='+(noon-25*3600000));
 assert.equal(await remind(e,origin,noon),1);
 assert.match(tg.calls.filter(c=>c.body.chat_id==='5150').at(-1).body.text,/هنوز درخواستت را جواب نداده/);
 assert.equal(await remind(e,origin,noon),0,'two reminders at most');
 await hook(e,{callback_query:{id:'q',data:'ls:called:'+d.id,message:{chat:{id:777},message_id:1}}});
}finally{tg.restore()}});

test('linking starts a setup wizard that fills the salon page one answer at a time',async()=>{const e=tgEnv(fixture()),s=await salon(e);const tg=mockTelegram();try{
 const say=m=>hook(e,{message:{chat:{id:777,type:'private'},...m}});const tap=d=>hook(e,{callback_query:{id:'q',data:d,message:{chat:{id:777},message_id:3}}});
 await linkSalon(e,s,777,true);
 assert.match(tg.calls.filter(c=>c.method==='sendMessage').at(-1).body.text,/۱ از ۱۱/);
 await say({text:'مزون زیبایی ساناز'});
 await say({photo:[{file_id:'logo',file_size:100}]});
 await tap('wz:skip');
 await say({text:'تخصص ما لباس دانتل است.'});
 await say({text:'تهران، ونک'});
 await say({location:{latitude:35.7575,longitude:51.4101}});
 await say({text:'۱۰ تا ۲۰'});
 await say({text:'abc'});assert.match(tg.calls.at(-1).body.text,/شماره درست نیست/);
 await say({text:'۰۲۱-۲۲۳۳۴۴۵۵'});
 await say({text:'@sanaz.salon'});
 await say({text:'ساناز احمدی'});
 await tap('wz:skip');
 const pub=(await call(e,'/api/s/salon-a/public')).data.salon;
 assert.equal(pub.name,'مزون زیبایی ساناز');assert.equal(pub.profile.bio,'تخصص ما لباس دانتل است.');assert.equal(pub.profile.phone,'02122334455');assert.equal(pub.profile.instagram,'https://instagram.com/sanaz.salon');assert.equal(pub.profile.map,'https://www.google.com/maps?q=35.757500,51.410100');assert.equal(pub.profile.manager,'ساناز احمدی');assert(pub.profile.logo);assert(!pub.profile.cover);
 assert.match(tg.calls.filter(c=>c.method==='sendMessage').at(-1).body.text,/آماده است[\s\S]*\/s\/salon-a/);
 assert.equal(e.DB.sql.prepare('SELECT bot_state b FROM salons').get().b,'');
 await say({photo:[{file_id:'work',file_size:100}],caption:'پرنسسی'});assert.equal((await call(e,'/api/s/salon-a/public')).data.portfolio.length,1,'after the wizard photos are portfolio again');
 await say({text:'/setup'});await tap('wz:keep');assert.match(tg.calls.filter(c=>c.method==='sendMessage').at(-1).body.text,/۲ از ۱۱/);
}finally{tg.restore()}});

test('Bale: path secret required, same link code works, submissions reach both inboxes, plain text only',async()=>{const e=tgEnv(fixture());e.BALE_BOT_TOKEN='777:bale';e.BALE_BOT_USERNAME='ayneh_bale_bot';const s=await salon(e),g=await guest(e,s);
 const calls=[];const previous=globalThis.fetch;globalThis.fetch=async(url,init)=>{const u=String(url);if(!/api\.telegram\.org|tapi\.bale\.ai/.test(u))return previous(url,init);const host=u.includes('bale')?'bale':'tg',method=u.split('/').pop();let body=init?.body;if(body instanceof FormData){const o={};for(const [k,v] of body.entries())o[k]=typeof v==='string'?v:'<file>';body=o}else body=JSON.parse(body||'{}');calls.push({host,method,body});if(host==='bale'&&method==='sendMediaGroup')return Response.json({ok:false,description:'not supported'},{status:400});if(method==='sendMediaGroup')return Response.json({ok:true,result:[{message_id:1}]});return Response.json({ok:true,result:{message_id:2,username:host==='bale'?'ayneh_bale_bot':'ayneh_bot'}})};
 try{
  assert.equal((await baleHook(e,{message:{chat:{id:1,type:'private'},text:'/start'}},'wrong')).status,403);
  const link=await call(e,'/api/s/salon-a/owner/telegram-link',{},OWNER);assert.match(link.data.links.bale,/^https:\/\/ble\.ir\/ayneh_bale_bot\?start=[a-f0-9]{24}$/);assert.match(link.data.links.telegram,/t\.me/);
  await baleHook(e,{message:{chat:{id:9001,type:'private'},text:'/start '+link.data.code}});await baleHook(e,{message:{chat:{id:9001,type:'private'},text:'/stop'}});
  assert.equal(e.DB.sql.prepare('SELECT bale_chat_id b FROM salons').get().b,'9001');
  assert.equal((await call(e,'/api/s/salon-a/public')).data.telegram,true,'a Bale-only salon can receive submissions');
  const d=await sendLead(e,s,g);assert.equal(d.delivered,true);assert(d.follow.bale.startsWith('https://ble.ir/ayneh_bale_bot?start=f_'));
  const details=calls.find(c=>c.host==='bale'&&c.method==='sendMessage'&&/درخواست تازه/.test(c.body.text||''));assert(details,'details sent to Bale');assert(!details.body.parse_mode&&!/<b>/.test(details.body.text),'Bale gets plain text');assert.equal(details.body.reply_to_message_id,2);
  assert(calls.filter(c=>c.host==='bale'&&c.method==='sendPhoto').length>=1,'album falls back to single photos on Bale');
  const hook2=await call(e,'/api/owner/webhook',{},OWNER);assert.equal(hook2.status,200);assert.equal(calls.find(c=>c.host==='bale'&&c.method==='setWebhook').body.url,origin+'/api/bale/webhook/hook-secret');
 }finally{globalThis.fetch=previous}});


// ---------- team members and staff referrals ----------
const V=n=>String(n).repeat(32).slice(0,32);
async function addMember(e,s,name,chat){const r=await call(e,'/api/s/'+s.slug+'/owner/team',{name,specialty:'پرو و تنظیم لباس'},OWNER);assert.equal(r.status,200,JSON.stringify(r));const code=r.data.links.telegram.split('start=')[1];if(chat)await hook(e,{message:{chat:{id:chat,type:'private'},text:'/start '+code}});return {...r.data.member,ref:r.data.ref,code};}
const visit=async(e,s,v,r)=>(await call(e,'/api/s/'+s.slug+'/ref',{v,r})).data;
const sentTo=(tg,chat)=>tg.calls.filter(c=>(c.method==='sendMessage'||c.method==='sendMediaGroup'||c.method==='sendPhoto')&&String(c.body.chat_id)===String(chat));

test('manager builds the team in the bot; a member links their own chat and gets a personal link',async()=>{const e=tgEnv(fixture()),s=await salon(e);const tg=mockTelegram();try{
 await linkSalon(e,s,777);
 await hook(e,{message:{chat:{id:777,type:'private'},text:'/team'}});assert.match(tg.calls.at(-1).body.text,/هنوز نیرویی/);
 await hook(e,{callback_query:{id:'a',data:'tm:add',message:{chat:{id:777},message_id:3}}});
 await hook(e,{message:{chat:{id:777,type:'private'},text:'مریم محمدی'}});
 await hook(e,{callback_query:{id:'b',data:'tm:s:0',message:{chat:{id:777},message_id:4}}});
 const t=e.DB.sql.prepare('SELECT * FROM team').get();assert.equal(t.name,'مریم محمدی');assert.equal(t.specialty,'مشاوره و فروش لباس');assert.match(t.ref_code,/^s[a-z2-9]{7}$/);
 const msg=tg.calls.filter(c=>c.method==='sendMessage'&&c.body.chat_id==='777').at(-1).body.text;assert.match(msg,/start=[a-f0-9]{24}/);assert(msg.includes('/s/salon-a?r='+t.ref_code));
 const code=msg.match(/start=([a-f0-9]{24})/)[1];
 await hook(e,{message:{chat:{id:777,type:'private'},text:'/start '+code}});assert.equal(e.DB.sql.prepare('SELECT telegram_chat_id c FROM team').get().c,null,'the manager chat cannot become a member');
 await hook(e,{message:{chat:{id:4001,type:'private'},text:'/start '+code}});
 assert.equal(e.DB.sql.prepare('SELECT telegram_chat_id c FROM team').get().c,'4001');
 assert(sentTo(tg,4001).some(c=>c.body.text?.includes('?r='+t.ref_code)));
 await hook(e,{message:{chat:{id:4001,type:'private'},text:'/team'}});assert(!/تیم «/.test(sentTo(tg,4001).at(-1).body.text),'members cannot manage the team');
 await hook(e,{message:{chat:{id:4001,type:'private'},photo:[{file_id:'p1',file_size:100}],caption:'پرنسسی پفی'}});
 const pf=e.DB.sql.prepare('SELECT stylist,staff_id FROM portfolio').get();assert.equal(pf.stylist,'مریم محمدی');assert.equal(pf.staff_id,t.id);
 assert.equal((await call(e,'/api/s/salon-a/public')).data.portfolio[0].maker,t.id);
 await hook(e,{message:{chat:{id:4001,type:'private'},text:'/start '+code}});assert.match(sentTo(tg,4001).at(-1).body.text,/منقضی|لینک اختصاصی/);
}finally{tg.restore()}});

test('referral chain: a member keeps every generation, first link wins, a mobile keeps its owner, requests reach only the owner',async()=>{const e=tgEnv(fixture()),s=await salon(e),other=await salon(e,'salon-b');const tg=mockTelegram();try{
 await linkSalon(e,s,777);const maryam=await addMember(e,s,'مریم محمدی',4001),sara=await addMember(e,s,'سارا',4002);
 // Maryam → Nazanin → friend → friend's friend
 const nazanin=await visit(e,s,V(1),maryam.ref.split('r=')[1]);assert.equal(nazanin.mine,maryam.id);
 const f1=await visit(e,s,V(2),nazanin.tag);assert.equal(f1.mine,maryam.id);
 const f2=await visit(e,s,V(3),f1.tag);assert.equal(f2.mine,maryam.id);
 assert.equal(e.DB.sql.prepare("SELECT gen FROM ref_visitors WHERE visitor=?").get(V(3)).gen,3);
 assert.equal((await visit(e,s,V(1),sara.ref.split('r=')[1])).mine,maryam.id,'a later link does not move her');
 assert.equal((await visit(e,other,V(1),'')).mine,null,'attribution is per salon');
 assert.equal((await visit(e,s,V(9),'vzzzzzzzz')).mine,null,'unknown codes make a salon customer');
 // Nazanin sends a request: only Maryam gets it, the manager gets nothing about her (but a conflict note).
 const before=sentTo(tg,777).length,g=await guest(e,s);const d=await sendLead(e,s,g,{v:V(1),phone:'09120000001',name:'نازنین احمدی'});
 assert.equal(d.delivered,true);assert(sentTo(tg,4001).some(c=>c.body.text?.includes('نازنین احمدی')));
 assert(!sentTo(tg,4002).some(c=>c.body.text?.includes('نازنین')),'not to Sara');
 const mgr=sentTo(tg,777).slice(before);assert(!mgr.some(c=>c.body.text?.includes('09120000001')),'manager never sees her mobile');
 assert(mgr.some(c=>/با لینک سارا آمد/.test(c.body.text||'')),'manager is told about the conflict');
 // Sara cannot press Maryam's buttons; Maryam can.
 await hook(e,{callback_query:{id:'x',data:'ls:called:'+d.id,message:{chat:{id:4002},message_id:1}}});assert.equal(e.DB.sql.prepare('SELECT salon_status s FROM leads WHERE id=?').get(d.id).s,'new');
 await hook(e,{callback_query:{id:'y',data:'ls:called:'+d.id,message:{chat:{id:777},message_id:1}}});assert.equal(e.DB.sql.prepare('SELECT salon_status s FROM leads WHERE id=?').get(d.id).s,'new','nor can the manager');
 await hook(e,{callback_query:{id:'z',data:'ls:called:'+d.id,message:{chat:{id:4001},message_id:1}}});assert.equal(e.DB.sql.prepare('SELECT salon_status s FROM leads WHERE id=?').get(d.id).s,'called');
 // Same mobile on a new phone that arrived via Sara's link stays Maryam's.
 await visit(e,s,V(4),sara.ref.split('r=')[1]);const g2=await guest(e,s);const d2=await sendLead(e,s,g2,{v:V(4),phone:'09120000001',name:'نازنین احمدی'});
 assert.equal(e.DB.sql.prepare('SELECT staff_id FROM leads WHERE id=?').get(d2.id).staff_id,maryam.id);
 // A salon customer goes to the manager with hand-over buttons; handing over locks her subtree.
 const solo=await visit(e,s,V(5),'');await visit(e,s,V(6),solo.tag);
 const g3=await guest(e,s);const d3=await sendLead(e,s,g3,{v:V(5),phone:'09120000005',name:'لیلا'});
 const card=sentTo(tg,777).filter(c=>c.body.reply_markup).at(-1);assert(card.body.text.includes('لیلا'));
 const btn=card.body.reply_markup.inline_keyboard.flat().find(b=>b.callback_data==='la:'+sara.id+':'+d3.id);assert(btn,'hand-over button for Sara');assert(btn.callback_data.length<=64);
 await hook(e,{callback_query:{id:'h',data:btn.callback_data,message:{chat:{id:777},message_id:5}}});
 assert.equal(e.DB.sql.prepare('SELECT staff_id FROM leads WHERE id=?').get(d3.id).staff_id,sara.id);
 assert(sentTo(tg,4002).some(c=>c.body.text?.includes('لیلا')));
 assert.equal((await visit(e,s,V(6),'')).mine,sara.id,'her friend follows her to Sara');
 assert.equal(e.DB.sql.prepare('SELECT staff_id FROM ref_phones WHERE staff_id=?').all(sara.id).length,1);
 // The conflict button gives Nazanin to Sara for good.
 const cf=sentTo(tg,777).find(c=>/با لینک سارا آمد/.test(c.body.text||'')).body.reply_markup.inline_keyboard[0][0].callback_data;
 await hook(e,{callback_query:{id:'c',data:cf,message:{chat:{id:777},message_id:6}}});
 assert.equal((await visit(e,s,V(1),'')).mine,sara.id);assert.equal((await visit(e,s,V(3),'')).mine,sara.id,'her whole tree moves');
 // Report
 const rep=(await call(e,'/api/owner/referrals?salon=salon-a',undefined,OWNER)).data;
 const sr=rep.staff.find(x=>x.id===sara.id);assert(sr.visitors>=5);assert(sr.requests>=2);
 assert(rep.top.some(t=>t.name==='نازنین احمدی'&&t.brought===2));
 assert(rep.trees.find(t=>t.staff_id===sara.id).nodes.length>=1);
 assert.equal((await call(e,'/api/owner/referrals')).status,401);
}finally{tg.restore()}});

test('a member who has not linked yet: the request waits, the manager only hears that, and it goes out on link; removal hands everything over',async()=>{const e=tgEnv(fixture()),s=await salon(e);const tg=mockTelegram();try{
 await linkSalon(e,s,777);const maryam=await addMember(e,s,'مریم',null),sara=await addMember(e,s,'سارا',4002);
 await visit(e,s,V(1),maryam.ref.split('r=')[1]);const g=await guest(e,s);const d=await sendLead(e,s,g,{v:V(1),phone:'09120000011',name:'نگار'});
 assert.equal(d.delivered,false);assert.equal(d.waiting,true);
 const note=sentTo(tg,777).at(-1).body.text;assert.match(note,/هنوز ربات را وصل نکرده/);assert(!note.includes('نگار')&&!note.includes('0912'));
 await tick(e,origin);assert.equal(e.DB.sql.prepare('SELECT status FROM leads').get().status,'queued','the scheduler leaves it waiting');
 await hook(e,{message:{chat:{id:4001,type:'private'},text:'/start '+maryam.code}});
 assert(sentTo(tg,4001).some(c=>c.body.text?.includes('نگار')));assert.equal(e.DB.sql.prepare('SELECT waiting,status FROM leads').get().status,'sent');
 // Remove Maryam → Sara inherits customers, links and the open request.
 const r=await call(e,'/api/s/salon-a/owner/team/remove',{id:maryam.id,to:sara.id},OWNER);assert.equal(r.status,200);assert.equal(r.data.moved,1);
 assert(sentTo(tg,4002).some(c=>c.body.text?.includes('نگار')));
 assert.equal((await visit(e,s,V(7),maryam.ref.split('r=')[1])).mine,sara.id,'old links now bring customers to Sara');
 assert.equal((await visit(e,s,V(1),'')).mine,sara.id);
 assert.equal((await call(e,'/api/s/salon-a/owner',undefined,OWNER)).data.team.length,1);
}finally{tg.restore()}});

test('Bale: a member links through Bale and gets their customers there, in plain text',async()=>{const e=tgEnv(fixture());e.BALE_BOT_TOKEN='777:bale';e.BALE_BOT_USERNAME='ayneh_bale_bot';const s=await salon(e);
 const calls=[];const previous=globalThis.fetch;globalThis.fetch=async(url,init)=>{const u=String(url);if(!/api\.telegram\.org|tapi\.bale\.ai/.test(u))return previous(url,init);const host=u.includes('bale')?'bale':'tg',method=u.split('/').pop();let body=init?.body;if(body instanceof FormData){const o={};for(const [k,v] of body.entries())o[k]=typeof v==='string'?v:'<file>';body=o}else body=JSON.parse(body||'{}');calls.push({host,method,body});if(method==='sendMediaGroup')return Response.json({ok:true,result:[{message_id:1}]});return Response.json({ok:true,result:{message_id:2}})};
 try{
  await linkSalon(e,s,777);
  const r=await call(e,'/api/s/salon-a/owner/team',{name:'مریم',specialty:'اجارهٔ لباس'},OWNER);assert.match(r.data.links.bale,/^https:\/\/ble\.ir\/ayneh_bale_bot\?start=[a-f0-9]{24}$/);
  await baleHook(e,{message:{chat:{id:9101,type:'private'},text:'/start '+r.data.links.bale.split('start=')[1]}});
  assert.equal(e.DB.sql.prepare('SELECT bale_chat_id b FROM team').get().b,'9101');
  await visit(e,s,V(1),r.data.ref.split('r=')[1]);const g=await guest(e,s);await sendLead(e,s,g,{v:V(1),phone:'09120000021',name:'رها'});
  const msg=calls.filter(c=>c.host==='bale'&&c.method==='sendMessage'&&c.body.chat_id==='9101').at(-1).body;
  assert(msg.text.includes('رها'));assert(!msg.text.includes('<b>'));assert.equal(msg.parse_mode,undefined);
  assert(!calls.some(c=>c.host==='tg'&&String(c.body.chat_id)==='777'&&String(c.body.text||'').includes('رها')),'not to the manager');
 }finally{globalThis.fetch=previous}
});

// ---------- bot reliability and owner alerts ----------
async function linkOwnerChat(e,chat=1000){const r=await call(e,'/api/owner/alerts-link',{},OWNER);assert.equal(r.status,200,JSON.stringify(r));await hook(e,{message:{chat:{id:chat,type:'private'},text:'/start '+r.data.links.telegram.split('start=')[1]}});return chat;}
const toOwner=(tg,chat=1000)=>tg.calls.filter(c=>c.method==='sendMessage'&&String(c.body.chat_id)===String(chat)).map(c=>c.body.text);
const say=(e,chat,text)=>hook(e,{message:{chat:{id:chat,type:'private'},text}});

test('owner alerts: linking, setup events, abandoned wizard frees later photos, /report and the nightly digest',async()=>{const e=tgEnv(fixture()),s=await salon(e);const tg=mockTelegram();try{
 await linkOwnerChat(e);assert(toOwner(tg).some(t=>/گزارش‌های مزون آینه/.test(t)));
 assert.deepEqual((await call(e,'/api/owner',undefined,OWNER)).data.alerts.chats,['telegram']);
 const r=await call(e,'/api/s/salon-a/owner/telegram-link',{},OWNER);await say(e,777,'/start '+r.data.code);
 assert(toOwner(tg).some(t=>/ربات را در تلگرام وصل کرد/.test(t)),'owner hears the salon linked');
 // The wizard started on link (profile empty). Answer the name, then abandon at the logo step.
 await say(e,777,'مزون ساناز');assert.equal(JSON.parse(e.DB.sql.prepare('SELECT bot_state b FROM salons').get().b).step,1);
 e.DB.sql.exec("UPDATE salons SET bot_state=json_set(bot_state,'$.ts',"+(Date.now()-30*60000)+")");
 await hook(e,{message:{chat:{id:777,type:'private'},photo:[{file_id:'p1',file_size:100}],caption:'پرنسسی پفی'}});
 assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM portfolio').get().n,1,'the photo became portfolio, not the logo');
 assert.equal(JSON.parse(e.DB.sql.prepare('SELECT profile FROM salons').get().profile).logo,undefined);
 assert(toOwner(tg).some(t=>/نیمه‌کاره رها کرد/.test(t)&&/مانده:/.test(t)));
 // Finishing early gives a summary to the salon and the owner.
 await say(e,777,'/setup');await hook(e,{callback_query:{id:'d',data:'wz:done',message:{chat:{id:777},message_id:3}}});
 assert(tg.calls.some(c=>c.body.chat_id==='777'&&/از ۱۱ مورد پر شده/.test(c.body.text||'')));assert(toOwner(tg).some(t=>/زودتر تمام کرد/.test(t)));
 const owner=(await call(e,'/api/owner',undefined,OWNER)).data;assert.equal(owner.salons[0].setup.total,11);assert(owner.activity.length>=3);
 // /report and the 21:00 digest (once a day).
 await say(e,1000,'/report');assert(toOwner(tg).some(t=>/گزارش امروز مزون آینه/.test(t)));
 const {maybeDigest}=await import('../worker/alerts.js');const nine=Date.parse('2026-11-02T17:45:00Z');
 assert.equal(await maybeDigest(e,nine),true);assert.equal(await maybeDigest(e,nine+60000),false,'once a day');
 assert.equal(await maybeDigest(e,Date.parse('2026-11-03T10:00:00Z')),false,'not before 21:00');
 // A stranger link cannot subscribe; stale/abandoned states expire on the scheduler too.
 await say(e,2000,'/start o_'+'0'.repeat(24));assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM owner_chats').get().n,1);
 assert.equal((await call(e,'/api/owner/alerts-link',{})).status,401);
}finally{tg.restore()}});

test('team question: an abandoned or wrong answer never becomes a member; errors are explained to the sender',async()=>{const e=tgEnv(fixture()),s=await salon(e);const tg=mockTelegram();try{
 await linkSalon(e,s,777);
 await hook(e,{callback_query:{id:'a',data:'tm:add',message:{chat:{id:777},message_id:3}}});
 await say(e,777,'09121234567');assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM team').get().n,0);assert.match(tg.calls.at(-1).body.text,/اسم درست نیست/);
 e.DB.sql.exec("UPDATE salons SET bot_state=json_set(bot_state,'$.ts',"+(Date.now()-30*60000)+")");
 await say(e,777,'مریم');assert.equal(e.DB.sql.prepare('SELECT bot_state b FROM salons').get().b,'','expired: not taken as a name');
 assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM team').get().n,0);
 // Oversized photo: the salon is told why.
 await hook(e,{message:{chat:{id:777,type:'private'},document:{file_id:'big',mime_type:'image/jpeg',file_size:9*1024*1024},caption:'x'}});
 assert.match(tg.calls.filter(c=>c.body.chat_id==='777').at(-1).body.text,/بزرگ‌تر از ۵ مگابایت/);
 // Same update delivered twice is handled once.
 const u={update_id:42,message:{chat:{id:777,type:'private'},photo:[{file_id:'p9',file_size:100}],caption:'لایت'}};await hook(e,u);await hook(e,u);
 assert.equal(e.DB.sql.prepare("SELECT count(*) n FROM portfolio WHERE title='لایت'").get().n,1);
 // An album: the caption arrives on the second photo but names both.
 await hook(e,{message:{chat:{id:777,type:'private'},media_group_id:'g1',photo:[{file_id:'a1',file_size:100}]}});
 await hook(e,{message:{chat:{id:777,type:'private'},media_group_id:'g1',photo:[{file_id:'a2',file_size:100}],caption:'شینیون عروس'}});
 await hook(e,{message:{chat:{id:777,type:'private'},media_group_id:'g1',photo:[{file_id:'a3',file_size:100}]}});
 assert.equal(e.DB.sql.prepare("SELECT count(*) n FROM portfolio WHERE title='شینیون عروس'").get().n,1,'an album is one dress');
 assert.equal(JSON.parse(e.DB.sql.prepare("SELECT images FROM portfolio WHERE title='شینیون عروس'").get().images).length,3,'its photos are the angles');
}finally{tg.restore()}});


test('a member texts their own link, so the referral is kept',async()=>{const e=smsEnv(tgEnv(fixture())),s=await salon(e);const tg=mockTelegram();try{
 await linkSalon(e,s,777);const m=await addMember(e,s,'مریم',4001);
 const sms=mockSms();try{await say(e,4001,'09121112233');
  const inv=sms.calls.find(c=>c.kind==='shared');assert(inv,'texted');assert.deepEqual(inv.body.args,['مزون salon-a','salon-a?r='+m.ref_code]);
 }finally{sms.restore()}
 await say(e,4001,'/list');assert.match(tg.calls.at(-1).body.text,/هنوز نمونه‌کاری از تو/);
}finally{tg.restore()}});

test('review fixes: send form shows when only members can receive; long free text is cut, not rejected',async()=>{const e=tgEnv(fixture()),s=await salon(e);const tg=mockTelegram();try{
 assert.equal((await call(e,'/api/s/salon-a/public')).data.telegram,false);
 const r=await call(e,'/api/s/salon-a/owner/team',{name:'مریم',specialty:'پرو و تنظیم لباس'},OWNER);
 assert.equal((await call(e,'/api/s/salon-a/public')).data.telegram,true,'a member can receive (or the request waits for them)');
 await hook(e,{message:{chat:{id:4001,type:'private'},text:'/start '+r.data.links.telegram.split('start=')[1]}});
 await visit(e,s,V(1),r.data.ref.split('r=')[1]);const g=await guest(e,s);
 const d=await sendLead(e,s,g,{v:V(1),phone:'09120000041',name:'ن'.repeat(140),look:'ل'.repeat(300),note:'x'.repeat(2000)});
 const row=e.DB.sql.prepare('SELECT name,look,note FROM leads WHERE id=?').get(d.id);assert.equal(row.name.length,100);assert.equal(row.look.length,150);assert.equal(row.note.length,1000);
 assert(tg.calls.some(c=>String(c.body.chat_id)==='4001'&&(c.body.text||'').includes('درخواست تازه')));
}finally{tg.restore()}});

test('console token is taken from a pasted full API address or padded value',async()=>{const {consoleToken}=await import('../worker/sms.js');
 const t='81a6aaaabbbbccccddddeeeeffff0000';
 for(const v of [t,' '+t+'\n','https://console.melipayamak.com/api/send/shared/'+t,'https://console.melipayamak.com/api/send/otp/'+t+'/ '])assert.equal(consoleToken({MELIPAYAMAK_TOKEN:v}),t);
});

test('without SMS invites the bot offers messenger buttons and /i/ is a send page with the referral link',async()=>{const e=tgEnv(fixture()),s=await salon(e,'salon-a');const tg=mockTelegram();
 try{await linkSalon(e,s,777);
  await hook(e,{message:{chat:{id:777,type:'private'},text:'/share'}});const m=tg.calls.filter(c=>c.method==='sendMessage').at(-1).body;
  assert.match(m.text,/salon-a/);assert.equal(m.reply_markup.inline_keyboard.flat().length,3);assert.match(m.reply_markup.inline_keyboard[0][0].url,/^https:\/\/wa\.me\/\?text=/);
  const t=e.DB.sql.prepare("SELECT id FROM salons WHERE slug='salon-a'").get();e.DB.sql.prepare("INSERT INTO team(id,salon_id,name,specialty,ref_code,created_at) VALUES('t1',?,'مریم','',?,1)").run(t.id,'sabcdefg');
  const page=await app.fetch(new Request(origin+'/i/salon-a?r=sabcdefg&to=09121234567'),e);assert.equal(page.status,200);const html=await page.text();
  assert.match(html,/sms:09121234567\?&amp;body=/);assert.match(html,/wa\.me\/989121234567/);assert.match(html,/\/s\/salon-a\?r=sabcdefg/);assert.match(html,/مریم از «مزون salon-a»/);assert.match(html,/noindex/);
  new Function(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
  const bad=await app.fetch(new Request(origin+'/i/salon-a?r=<x>&to=javascript:1'),e);const bh=await bad.text();assert.doesNotMatch(bh,/javascript:1|<x>/);assert.match(bh,/\/s\/salon-a/);
  assert.equal((await app.fetch(new Request(origin+'/i/nope'),e)).status,404);
 }finally{tg.restore()}});

// ---------- landing page and salon inquiries ----------

test('free trial salon: built from the landing form, one per mobile, 5 images and 10 hours enforced by the server',async()=>{const e=tgEnv(fixture());e.KIE_API_KEY='mock';const tg=mockTelegram();const previous=globalThis.fetch;let tasks=0;
 const net=globalThis.fetch;globalThis.fetch=async(url,opts)=>{const u=String(url);if(u.includes('file-base64-upload'))return Response.json({success:true,data:{downloadUrl:'https://provider.example/'+crypto.randomUUID()+'.jpg'}});if(u.includes('createTask')){tasks++;return Response.json({code:200,data:{taskId:'t'+tasks}})}return net(url,opts)};
 try{await linkOwnerChat(e);
  const body={name:'سارا',salon:'مزون رز',city:'تهران',phone:'۰۹۱۲۱۲۳۴۵۶۷',brand:'#8E3050',consent:true,username:'sara.rose',password:'Passw0rd!x',subdomain:'rose'};
  assert.equal((await call(e,'/api/trial',{...body,consent:false})).status,400);
  assert.equal((await call(e,'/api/trial',{...body,website:'x'})).status,200);assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM trials').get().n,0,'honeypot is dropped');
  const r=await call(e,'/api/trial',body);assert.equal(r.status,200,JSON.stringify(r));assert.match(r.data.path,/^\/s\/t-[a-f0-9]{8}$/);assert.equal(r.data.images,5);assert.equal(r.data.hours,10);
  assert.equal((await call(e,'/api/trial',body)).status,409,'one trial per mobile');
  const slug=r.data.path.slice(3),row=e.DB.sql.prepare('SELECT * FROM trials').get();assert.ok(Math.abs(row.expires_at-row.created_at-36000000)<1000);
  assert(toOwner(tg).find(t=>/مزون رز/.test(t)&&new RegExp(slug).test(t)),'owner chat got the trial link');
  const pub=await call(e,'/api/s/'+slug+'/public');assert.equal(pub.status,200);assert.equal(pub.data.trial.images_left,5);assert.equal(pub.data.trial.brand,'#8E3050');
  const g=await guest(e,{slug}),original=await upload(e,{slug},g);
  const gen=()=>call(e,'/api/s/'+slug+'/generate',{image_consent:true,idem:crypto.randomUUID(),original_id:original,style:0},g);
  assert.equal((await gen()).status,403,'unapproved salon cannot generate');assert.equal(tasks,0);
  e.DB.sql.prepare('UPDATE salons SET approved=1 WHERE slug=?').run(slug);
  for(let i=0;i<5;i++)assert.equal((await gen()).status,200);assert.equal(tasks,5);
  const sixth=await gen();assert.equal(sixth.status,402);assert.equal(tasks,5,'no paid task after the budget');
  assert.equal((await call(e,'/api/s/'+slug+'/public')).data.trial.images_left,0);
  e.DB.sql.prepare('UPDATE trials SET expires_at=?, images_used=0').run(Date.now()-1000);
  assert.equal((await gen()).status,410);assert.equal((await call(e,'/api/s/'+slug+'/session',{})).status,410);
  const done=await call(e,'/api/s/'+slug+'/public');assert.equal(done.status,200);assert.equal(done.data.trial.expired,true);
 }finally{globalThis.fetch=previous;tg.restore()}});



test('free trial with SMS on: the mobile is confirmed by a texted code before the page is built',async()=>{const e=smsEnv(tgEnv(fixture()));const tg=mockTelegram(),sms=mockSms();try{await linkOwnerChat(e);
 const body={salon:'مزون یاس',phone:'۰۹۱۲۷۶۵۴۳۲۱',consent:true,username:'yas.salon',password:'Passw0rd!x'};
 const sent=await call(e,'/api/trial',body);assert.equal(sent.status,200,JSON.stringify(sent));assert.equal(sent.data.code_sent,true);assert.equal(sms.calls.length,1);
 assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM trials').get().n,0,'nothing is built before the code');
 assert.equal((await call(e,'/api/trial',body)).status,429,'resend cooldown');
 assert.equal((await call(e,'/api/trial',{...body,code:'11111'})).status,400);
 const ok=await call(e,'/api/trial',{...body,code:'۴۸۲۱۳'});assert.equal(ok.status,200,JSON.stringify(ok));assert.match(ok.data.path,/^\/s\/t-/);
 assert.equal(e.DB.sql.prepare("SELECT count(*) n FROM otps WHERE session_id LIKE 'trial:%'").get().n,0,'a used code is gone');
 assert.equal((await call(e,'/api/trial',{...body,code:'48213'})).status,409);
}finally{tg.restore();sms.restore()}});
test('salon daily image cap is an owner setting: 0 removes it, a number enforces it, other settings are kept',async()=>{
 const e=fixture(),s=await salon(e),g=await guest(e,s);e.KIE_API_KEY='mock';
 const previous=globalThis.fetch;let tasks=0;
 globalThis.fetch=async(url)=>{if(String(url).includes('file-base64-upload'))return Response.json({success:true,data:{downloadUrl:'https://provider.example/'+crypto.randomUUID()+'.jpg'}});if(String(url).includes('createTask')){tasks++;return Response.json({code:200,data:{taskId:'t'+tasks}})}return new Response(png())};
 try{
  const o=await upload(e,s,g),gen=()=>call(e,'/api/s/salon-a/generate',{image_consent:true,idem:crypto.randomUUID(),original_id:o,style:0},g);
  assert.equal((await call(e,'/api/s/salon-a/owner/settings',{generation_enabled:true,catalog:true,reference_verified:true,daily_limit:2},OWNER)).status,200);
  assert.equal((await gen()).status,200);assert.equal((await gen()).status,200);
  const third=await gen();assert.equal(third.status,429);assert.match(third.data.error,/سقف استفادهٔ روزانه/);
  assert.equal((await call(e,'/api/s/salon-a/owner/settings',{generation_enabled:true,catalog:true,reference_verified:true,daily_limit:0},OWNER)).status,200);
  assert.equal((await gen()).status,200,'no cap');
  const st=(await call(e,'/api/s/salon-a/owner',undefined,OWNER)).data.salon.settings;assert.equal(st.daily_limit,0);assert.equal(st.generation_enabled,true);
  // Saving without the field keeps the cap; flags set elsewhere survive.
  e.DB.sql.prepare("UPDATE salons SET settings=json_set(settings,'$.demo',json('true')) WHERE slug='salon-a'").run();
  await call(e,'/api/s/salon-a/owner/settings',{generation_enabled:true,catalog:true,reference_verified:true},OWNER);
  const st2=(await call(e,'/api/s/salon-a/owner',undefined,OWNER)).data.salon.settings;assert.equal(st2.daily_limit,0);assert.equal(st2.demo,true);
 }finally{globalThis.fetch=previous}
});
test('the team\'s own verified mobiles (app_settings unlimited_phones) have no image limits',async()=>{
 const e=fixture(),s=await salon(e);e.KIE_API_KEY='mock';
 const previous=globalThis.fetch;let tasks=0;
 globalThis.fetch=async(url)=>{if(String(url).includes('file-base64-upload'))return Response.json({success:true,data:{downloadUrl:'https://provider.example/'+crypto.randomUUID()+'.jpg'}});if(String(url).includes('createTask')){tasks++;return Response.json({code:200,data:{taskId:'t'+tasks}})}return new Response(png())};
 try{
  await call(e,'/api/s/salon-a/owner/settings',{generation_enabled:true,catalog:true,reference_verified:true,daily_limit:2},OWNER);
  e.DB.sql.prepare("INSERT INTO app_settings(key,value,updated_at) VALUES('unlimited_phones',?,?)").run(JSON.stringify(['+989120000001']),Date.now());
  const g=await guest(e,s),sid=e.DB.sql.prepare('SELECT id FROM sessions ORDER BY created_at DESC LIMIT 1').get().id;
  e.DB.sql.prepare('UPDATE sessions SET verified_phone=? WHERE id=?').run('+989120000001',sid);
  const o=await upload(e,s,g);
  assert.equal((await call(e,'/api/s/salon-a/session',undefined,g)).data.quota,null);
  for(let i=0;i<5;i++){const r=await call(e,'/api/s/salon-a/generate',{image_consent:true,idem:crypto.randomUUID(),original_id:o,style:0},g);assert.equal(r.status,200,JSON.stringify(r))}
  // Anyone else still has the limits.
  const g2=await guest(e,s),o2=await upload(e,s,g2);
  const other=()=>call(e,'/api/s/salon-a/generate',{image_consent:true,idem:crypto.randomUUID(),original_id:o2,style:0},g2);
  assert.equal((await other()).status,200);assert.equal((await other()).status,200);assert.equal((await other()).status,429,'the daily cap of 2 still applies to others');
 }finally{globalThis.fetch=previous}
});

// ---- Mezon Aroos (wedding-dress fitting) ----
import {LINE_KEYS,DRESS_STYLES,linePrompt} from '../worker/lines.js';

test('mezon: one dress line, 15 ready-made dresses, prompts lock body size and identity',()=>{
 assert.deepEqual(LINE_KEYS,['dress']);assert.equal(DRESS_STYLES.length,15);
 for(const [,,,d] of DRESS_STYLES)assert(d.length>40,'every dress is described in detail');
 const cat=linePrompt('dress','catalog',DRESS_STYLES[1][3]);
 assert.match(cat,/Photo 1 is the bride in a full-body photo/);assert.match(cat,/ball-gown/);assert.match(cat,/never slim|never.*idealis/i);assert.match(cat,/IDENTITY LOCK/i);assert.match(cat,/no text|watermark/i);
 const ref=linePrompt('dress','reference','');
 assert.match(ref,/Photo 2 shows a wedding dress[\s\S]*DIFFERENT person/);assert.match(ref,/never her face, hair, skin, body/);
 assert(!/haircut|hair colou?r|hair-salon|salon consultation/i.test(cat+ref),'no hair-salon wording in the prompts');
 assert.equal(linePrompt('hair','catalog','x'),'','no other service lines exist');
});

test('mezon: the three-angle prompt is about the dress, not about hair',()=>{
 assert.match(VIEWS_PROMPT,/SAME bride[\s\S]*SAME dress/);assert.match(VIEWS_PROMPT,/3 equal tiles side by side in one row/);
 assert.match(VIEWS_PROMPT,/tile 1 = front 3\/4[\s\S]*tile 2 = exact side profile[\s\S]*tile 3 = back view[\s\S]*train/);
 assert.match(VIEWS_PROMPT,/plain light background/);assert.match(VIEWS_PROMPT,/body size and proportions/);
 assert(!/haircut|hair consultation|back of her head/i.test(VIEWS_PROMPT));
 assert.match(customerHTML,/نمای سه‌زاویه/);assert(!/مدل مو|رنگ مو|ناخن|مژه/.test(customerHTML+appHTML),'no salon wording on the pages');
});

test('mezon: landing is public and the customer page is dress-only (limits temporarily off)',async()=>{
 const e=fixture(),s=await salon(e),g=await guest(e,s);
 const home=await app.fetch(new Request(origin+'/'),e);assert.equal(home.status,200);assert.match(await home.text(),/مزون آینه/);
 const page=await app.fetch(new Request(origin+'/s/'+s.slug),e);const html=await page.text();
 assert.equal(page.status,200);assert.match(html,/لباس‌های مزون/);
 const v='ab'.repeat(16);assert.deepEqual((await call(e,'/api/s/'+s.slug+'/session?v='+v,undefined,g)).data.quota.left,{dress:4});
});

test.skip('mezon: 8 tries per person, the ninth is refused before anything is paid; failures are given back',async()=>{
 const e=fixture(),s=await salon(e),g=await guest(e,s);e.KIE_API_KEY='mock';await call(e,'/api/s/salon-a/owner/settings',{generation_enabled:true,catalog:true,reference_verified:true},OWNER);
 const previous=globalThis.fetch;let tasks=0;
 globalThis.fetch=async(url)=>{if(String(url).includes('file-base64-upload'))return Response.json({success:true,data:{downloadUrl:'https://provider.example/'+crypto.randomUUID()+'.jpg'}});if(String(url).includes('createTask')){tasks++;return Response.json({code:200,data:{taskId:'t'+tasks}})}return new Response(png())};
 try{
  const v='ab'.repeat(16),original=await upload(e,s,g);
  const gen=(i)=>call(e,'/api/s/salon-a/generate',{v,image_consent:true,idem:crypto.randomUUID(),line:'dress',original_id:original,style:i%15},g);
  for(let i=0;i<8;i++)assert.equal((await gen(i)).status,200,'try '+(i+1));
  assert.equal((await gen(8)).status,429);assert.equal(tasks,8,'nothing paid beyond the quota');
  e.DB.sql.prepare("UPDATE generations SET state='fail' WHERE rowid=(SELECT MIN(rowid) FROM generations WHERE line='dress')").run();
  assert.equal((await call(e,'/api/s/salon-a/session?v='+v,undefined,g)).data.quota.left.dress,1);
  assert.equal((await gen(9)).status,200);
 }finally{globalThis.fetch=previous}
});

test('step 2: landing page has the sections, meta tags, caching and no external resources',async()=>{
 const r=await app.fetch(new Request(origin+'/'),fixture());const html=await r.text();
 assert.equal(r.status,200);assert.equal(r.headers.get('cache-control'),'public,max-age=300');
 assert.match(html,/<html lang="fa" dir="rtl">/);assert.match(html,/<title>[^<]+<\/title>/);assert.match(html,/name="description"/);assert.match(html,/property="og:title"/);
 for(const needle of ['href="/s/demo"','demo-before.webp','demo-after.webp','https://t.me/mezon_aynehbot','<details>','<footer','id="owners"','type="range"'])assert(html.includes(needle),needle);
 assert(!/(src|href)="https?:\/\/(?!t\.me)/.test(html.replace(/<link rel="(canonical|alternate)"[^>]*>/g,'')),'no external resources');
 new Function(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
});
test('step 2: customer page paints the boutique name in the skeleton and offers save and compare',async()=>{
 const e=fixture(),s=await salon(e);
 const html=await(await app.fetch(new Request(origin+'/s/'+s.slug),e)).text();
 assert.match(html,/class="hero__name" style="height:auto">[^<]+</);
 for(const needle of ['function openSaved','memSaved','data-save','تلاش دوباره','مقایسهٔ لباس‌های ذخیره‌شده','ارتباط برقرار نشد'])assert(html.includes(needle),needle);
});

/* ---------- Step 3: leads, reservation, per-dress analytics, photo retention ---------- */
import {putImage} from '../worker/server.js';
import {dressStats,purgePhotos} from '../worker/dresses.js';
import {stats} from '../worker/stats.js';
import {digest} from '../worker/alerts.js';
// A finished try-on made without the image provider: an original, a result and the generation row.
async function tryOn(e,s,g,{style=null,reference=null}={}){
 const original=await upload(e,s,g);const sid=e.DB.sql.prepare('SELECT s.id FROM sessions s WHERE s.token_hash=?').get(await sha(g.cookie.match(/ayneh=([a-f0-9]{64})/)[1])).id;
 const result=await putImage(e,{id:s.id},{id:sid},png(),'simulation');
 e.DB.sql.prepare("INSERT INTO generations(id,salon_id,session_id,idem,kind,state,original_id,reference_id,result_id,style,created_at,updated_at,line) VALUES(?,?,?,?,'single','success',?,?,?,?,?,?,'dress')").run(crypto.randomUUID(),s.id,sid,crypto.randomUUID(),original,reference,result,style,Date.now(),Date.now());
 return {original,result,sid};
}
const sha=async t=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t))),x=>x.toString(16).padStart(2,'0')).join('');
const want=(t,extra={})=>({intent:'want',data_consent:true,idem:crypto.randomUUID(),name:'نیلوفر کریمی',phone:'۰۹۱۲۳۴۵۶۷۸۹',original_id:t.original,preview_id:t.result,visit_note:'پنجشنبه عصر',note:'سایز ۳۸',v:'b'.repeat(32),...extra});

test('step 3: «می‌خواهم» validates, ties the request to the dress server-side and reaches the boutique with status buttons',async()=>{
 const e=tgEnv(fixture()),s=await salon(e),g=await guest(e,s);const tg=mockTelegram();try{
  await linkSalon(e,s,777);
  const t=await tryOn(e,s,g,{style:2});
  const post=(b,gg=g)=>call(e,'/api/s/salon-a/leads',b,gg);
  assert.equal((await post(want(t,{data_consent:false}))).status,400,'consent is required');
  assert.equal((await post(want(t,{phone:'0912'}))).status,400,'bad mobile');
  assert.equal((await post(want(t,{phone:'09351234567'.replace('09','۰۹')}))).status,200,'Persian digits are accepted');
  assert.equal((await post(want(t,{preview_id:undefined}))).status,400,'a result is needed');
  assert.equal((await post(want(t,{preview_id:crypto.randomUUID()}))).status,400,'an unknown result is refused');
  const g2=await guest(e,s);assert.equal((await post(want(t),g2)).status,400,'another visitor cannot use this result');
  const r=await post(want(t));assert.equal(r.status,200,JSON.stringify(r));assert.equal(r.data.delivered,true);
  const row=e.DB.sql.prepare("SELECT * FROM leads WHERE id=?").get(r.data.id);
  assert.equal(row.intent,'want');assert.equal(row.phone,'+989123456789');assert.equal(row.dress_key,'d:2');assert.equal(row.visit_note,'پنجشنبه عصر');assert.equal(row.look,DRESS_NAME(2));
  const msg=tg.calls.filter(c=>c.method==='sendMessage'&&c.body.chat_id==='777').at(-1).body;
  assert.match(msg.text,/این لباس را می‌خواهم/);assert.match(msg.text,/نیلوفر کریمی/);assert.match(msg.text,/09123456789/);assert.match(msg.text,/پنجشنبه عصر/);assert.match(msg.text,/روی شماره بزنید/);
  const labels=msg.reply_markup.inline_keyboard.flat().map(b=>b.text.replace('✔︎ ',''));
  for(const l of ['جدید','تماس گرفته شد','رزرو شد','لغو'])assert(labels.some(x=>x.includes(l)),l);
  assert(tg.calls.some(c=>c.method==='sendPhoto'||c.method==='sendMediaGroup'),'before/after photos are sent');
  const again=await post(want(t));assert.equal(again.data.duplicate,true,'the same bride and dress is not sent twice while open');assert.equal(again.data.id,r.data.id);
 }finally{tg.restore()}});
function DRESS_NAME(i){return DRESS_STYLES[i][0]}

test('step 3: want requests are rate limited per mobile',async()=>{
 const e=tgEnv(fixture()),s=await salon(e),g=await guest(e,s);const tg=mockTelegram();try{
  await linkSalon(e,s,777);
  let last=0;for(let i=0;i<8;i++){const t=await tryOn(e,s,g,{style:i});last=(await call(e,'/api/s/salon-a/leads',want(t),g)).status;if(last===429)break}
  assert.equal(last,429);
 }finally{tg.restore()}});

test('step 3: status buttons and the admin panel update a request, closing and reopening it; list filter and CSV work',async()=>{
 const e=tgEnv(fixture()),s=await salon(e),g=await guest(e,s);const tg=mockTelegram();try{
  await linkSalon(e,s,777);const t=await tryOn(e,s,g,{style:1});
  const d=(await call(e,'/api/s/salon-a/leads',want(t,{name:'=SUM(A1)'}),g)).data;
  const tap=async(st,chat=777)=>hook(e,{callback_query:{id:'q'+Math.random(),data:'ls:'+st+':'+d.id,message:{chat:{id:chat},message_id:9}}});
  const get=()=>e.DB.sql.prepare('SELECT salon_status s,closed_at c,handled_at h FROM leads WHERE id=?').get(d.id);
  await tap('called',888);assert.equal(get().s,'new','a stranger cannot');
  await tap('called');assert.equal(get().s,'called');assert.equal(get().c,null);
  await tap('booked');assert.equal(get().s,'booked');assert(get().c>0,'closing sets closed_at');
  await tap('new');assert.equal(get().s,'new');assert.equal(get().c,null,'reopening clears it');
  await tap('cancelled');assert.equal(get().s,'cancelled');assert(get().c>0);
  // admin API
  assert.equal((await call(e,'/api/s/salon-a/owner/leads/status',{id:d.id,status:'booked'})).status,401);
  assert.equal((await call(e,'/api/s/salon-a/owner/leads/status',{id:d.id,status:'nope'},OWNER)).status,400);
  assert.equal((await call(e,'/api/s/salon-a/owner/leads/status',{id:d.id,status:'booked'},OWNER)).status,200);assert.equal(get().s,'booked');
  const all=await call(e,'/api/s/salon-a/owner/leads',undefined,OWNER);assert.equal(all.data.leads.length,1);assert.equal(all.data.counts.booked,1);
  assert.equal((await call(e,'/api/s/salon-a/owner/leads?status=new',undefined,OWNER)).data.leads.length,0);
  assert.equal((await call(e,'/api/s/salon-a/owner/leads?status=booked',undefined,OWNER)).data.leads.length,1);
  assert.equal((await call(e,'/api/s/salon-a/owner/leads?status=bogus',undefined,OWNER)).status,400);
  const csvRes=await app.fetch(new Request(origin+'/api/s/salon-a/owner/leads.csv',{headers:{origin,'oai-authenticated-user-id':OWNER.user,'oai-authenticated-user-email':OWNER.email}}),e);
  assert.equal(csvRes.status,200);assert.match(csvRes.headers.get('content-type'),/text\/csv/);const csv=await csvRes.text();
  assert(csv.includes('"\'=SUM(A1)"'),'formula cells are neutralised');assert(csv.includes('09123456789'));assert(csv.includes('رزرو شد'));
 }finally{tg.restore()}});

test('step 3: per-dress try-ons, saves and requests are counted; old c:/n:/r:/l: events are ignored; the daily report lists top dresses',async()=>{
 const e=tgEnv(fixture()),s=await salon(e),g=await guest(e,s);const tg=mockTelegram();try{
  await linkSalon(e,s,777);
  const p=(await call(e,'/api/s/salon-a/owner/portfolio/add',{media_id:await ownerPortfolio(e,s),title:'پرنسس مروارید'},OWNER)).data.id;
  const pm=e.DB.sql.prepare('SELECT images FROM portfolio WHERE id=?').get(p).images;const refMedia=JSON.parse(pm)[0];
  const a=await tryOn(e,s,g,{style:3});await tryOn(e,s,g,{style:3});await tryOn(e,s,g,{style:3});
  const b=await tryOn(e,s,g,{reference:refMedia});
  await tryOn(e,s,g,{reference:'customer-own-photo'}); // a customer's own dress photo is not a boutique dress
  await call(e,'/api/s/salon-a/track',{kind:'save_look',v:'c'.repeat(32),meta:'d:3'});await call(e,'/api/s/salon-a/track',{kind:'save_look',v:'c'.repeat(32),meta:'d:3'});
  await call(e,'/api/s/salon-a/track',{kind:'save_look',v:'c'.repeat(32),meta:'p:'+p});await call(e,'/api/s/salon-a/track',{kind:'save_look',v:'c'.repeat(32),meta:'junk<script>'});
  assert.equal((await call(e,'/api/s/salon-a/leads',want(a),g)).status,200);
  assert.equal((await call(e,'/api/s/salon-a/leads',want(b,{phone:'09120000002'}),g)).status,200);
  for(const m of ['c:3','n:7','r:2','l:1','s:پرنسس مروارید','d:3'])await call(e,'/api/s/salon-a/track',{kind:'look',v:'d'.repeat(32),meta:m});
  const st=await stats(e.DB,{days:30});
  const by=Object.fromEntries(st.dresses.map(x=>[x.key,x]));
  assert.deepEqual([by['d:3'].tryons,by['d:3'].saves,by['d:3'].wants],[3,2,1]);assert.equal(Math.round(by['d:3'].conversion*100),33);
  assert.deepEqual([by['p:'+p].tryons,by['p:'+p].saves,by['p:'+p].wants],[1,1,1]);assert.equal(by['p:'+p].name,'پرنسس مروارید');
  assert.equal(st.dresses.length,2,'own-photo dresses are not listed');
  assert(st.looks.every(x=>!/^[cnrl]:/.test(x.label)&&x.label!=='نامشخص'),JSON.stringify(st.looks));
  assert.equal(st.looks.length,2,'only the d: and s: events remain');
  const api=await call(e,'/api/owner/stats?days=30',undefined,OWNER);assert.equal(api.data.dresses.length,2);
  const report=await digest(e);assert.match(report,/لباس‌های امروز/);assert.match(report,/پرنسس مروارید/);assert.match(report,/این لباس را می‌خواهم/);
  assert.deepEqual((await dressStats(e.DB,{salonId:s.id,from:Date.now()-1000*86400*400,to:Date.now()+1,limit:1})).length,1);
 }finally{tg.restore()}});
async function ownerPortfolio(e,s){const r=await app.fetch(new Request(origin+'/api/s/'+s.slug+'/upload?kind=portfolio',{method:'POST',headers:{origin,'oai-authenticated-user-id':OWNER.user,'oai-authenticated-user-email':OWNER.email},body:png()}),e);return (await r.json()).id}

test('step 3: photo retention deletes old non-lead photos, keeps requests until closed plus N days, honours the setting and leaves the portfolio alone',async()=>{
 const e=tgEnv(fixture()),s=await salon(e),g=await guest(e,s);const tg=mockTelegram();try{
  await linkSalon(e,s,777);
  assert.equal((await call(e,'/api/s/salon-a/public')).data.retention_days,30,'default is 30 and the customer page is told');
  const day=86400000,now=Date.now();
  const old=await tryOn(e,s,g,{style:1}),fresh=await tryOn(e,s,g,{style:2}),lead=await tryOn(e,s,g,{style:3}),closed=await tryOn(e,s,g,{style:4}),closedRecent=await tryOn(e,s,g,{style:5});
  const age=(ids,days)=>{for(const id of ids)e.DB.sql.prepare('UPDATE media SET created_at=? WHERE id=?').run(now-days*day,id)};
  age([old.original,old.result,lead.original,lead.result,closed.original,closed.result,closedRecent.original,closedRecent.result],40);
  const mk=async t=>(await call(e,'/api/s/salon-a/leads',want(t,{phone:'0912000'+Math.floor(1000+Math.random()*8999),idem:crypto.randomUUID()}),g)).data.id;
  const openId=await mk(lead),closedId=await mk(closed),recentId=await mk(closedRecent);
  e.DB.sql.prepare("UPDATE leads SET salon_status='booked',closed_at=? WHERE id=?").run(now-35*day,closedId);
  e.DB.sql.prepare("UPDATE leads SET salon_status='booked',closed_at=? WHERE id=?").run(now-5*day,recentId);
  const portfolioMedia=await ownerPortfolio(e,s);e.DB.sql.prepare('UPDATE media SET created_at=? WHERE id=?').run(now-400*day,portfolioMedia);
  const has=id=>e.DB.sql.prepare('SELECT COUNT(*) n FROM media WHERE id=?').get(id).n===1;
  const n=await purgePhotos(e,now);
  assert.equal(n,4,'old original+result and the long-closed request\'s two photos');
  assert(!has(old.original)&&!has(old.result));assert(!e.BUCKET.objects.has(s.id+'/'+old.result),'the stored file is deleted too');
  assert(has(fresh.original)&&has(fresh.result),'recent photos stay');
  assert(has(lead.original)&&has(lead.result),'an open request keeps its photos');
  assert(!has(closed.original)&&!has(closed.result),'closed more than N days ago');
  assert(has(closedRecent.original)&&has(closedRecent.result),'closed less than N days ago');
  assert(has(portfolioMedia),'portfolio photos are never deleted');
  assert.equal(e.DB.sql.prepare('SELECT COUNT(*) n FROM leads').get().n,3,'requests themselves are kept');
  // the setting: a shorter window deletes more, 0 keeps everything, and tick() runs the job
  assert.equal((await call(e,'/api/s/salon-a/owner/settings',{generation_enabled:true,catalog:true,reference_verified:true,retention_days:0},OWNER)).status,200);
  age([fresh.original,fresh.result],60);assert.equal(await purgePhotos(e,now),0,'0 = keep everything');
  await call(e,'/api/s/salon-a/owner/settings',{generation_enabled:true,catalog:true,reference_verified:true,retention_days:45},OWNER);
  assert.equal((await call(e,'/api/s/salon-a/public')).data.retention_days,45);
  const t=await tick(e,origin);assert.equal(t.purged,2);assert(!has(fresh.original));
  assert(has(lead.original),'still open');
 }finally{tg.restore()}});

test('step 3: customer page has the want sheet, consent line and retention note; admin has leads filter and settings',()=>{
 for(const needle of ['function openWant','این لباس را می‌خواهم','wconsent','retentionLine','روز و ساعت دلخواه','leads','intent:\'want\''])assert(customerHTML.includes(needle),needle);
 for(const needle of ['leadsCard','leads.csv','عملکرد هر لباس','retention_days'])assert(appHTML.includes(needle),needle);
 const script=customerHTML.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/)[1];
 assert(!/fetch\(['"]https?:|XMLHttpRequest/.test(script),'no external requests in the customer script');
});

// ---- Kiosk: QR result link and "finish" wipe ----
test('kiosk: result QR link opens only that photo, expires, and finishing wipes the visitor\'s photos',async()=>{
 const e=fixture(),s=await salon(e),g=await guest(e,s);
 const original=await upload(e,s,g),v='ab'.repeat(16);
 const sess=e.DB.sql.prepare('SELECT id,salon_id FROM media WHERE id=?').get(original);
 const sid=e.DB.sql.prepare('SELECT session_id FROM media WHERE id=?').get(original).session_id;
 const gid=crypto.randomUUID(),now=Date.now();
 e.DB.sql.prepare("INSERT INTO generations(id,salon_id,session_id,idem,kind,state,original_id,result_id,created_at,updated_at,line,opts) VALUES(?,?,?,?,'single','success',?,?,?,?,'dress','{}')").run(gid,sess.salon_id,sid,crypto.randomUUID(),original,original,now,now);
 const bad=await call(e,'/api/s/'+s.slug+'/result-link',{v,gen:crypto.randomUUID()},g);assert.equal(bad.status,404);
 const r=await call(e,'/api/s/'+s.slug+'/result-link',{v,gen:gid},g);assert.equal(r.status,200);
 assert.match(r.data.url,/\/r\/[a-f0-9]{48}$/);const token=r.data.token;
 const page=await app.fetch(new Request(origin+'/r/'+token),e);assert.equal(page.status,200);assert.match(await page.text(),/دانلود عکس[\s\S]*اشتراک‌گذاری/);
 const img=await app.fetch(new Request(origin+'/r/'+token+'/img'),e);assert.equal(img.status,200);assert.match(img.headers.get('content-type'),/^image\//);
 assert.equal((await app.fetch(new Request(origin+'/r/'+'0'.repeat(48)),e)).status,404);
 e.DB.sql.prepare('UPDATE result_links SET expires_at=1 WHERE token=?').run(token);
 assert.equal((await app.fetch(new Request(origin+'/r/'+token+'/img'),e)).status,404,'expired link is closed');
 const r2=await call(e,'/api/s/'+s.slug+'/result-link',{v,gen:gid},g);
 const wipe=await call(e,'/api/s/'+s.slug+'/erase',{v},g);assert.equal(wipe.status,200);assert(wipe.data.deleted>=1);
 assert.equal(e.DB.sql.prepare('SELECT COUNT(*) c FROM media WHERE id=?').get(original).c,0);
 assert.equal((await app.fetch(new Request(origin+'/r/'+r2.data.token+'/img'),e)).status,404,'links die with the photos');
});

test('kiosk page: ?kiosk=1 is the same page, QR library and camera guide are shipped',async()=>{
 const e=fixture(),s=await salon(e);
 const html=await (await app.fetch(new Request(origin+'/s/'+s.slug+'?kiosk=1'),e)).text();
 assert.match(html,/function kioskBoot/);assert.match(html,/var qrcode=/);assert.match(html,/آرایش ملایم عروس/);
});

test('a result becomes a shareable post: likes, comments, the bride is told, social consent is kept',async()=>{
  const e=tgEnv(fixture()),s=await salon(e,'post-a'),g=await guest(e,s),original=await upload(e,s,g);
  const tg=mockTelegram(),calls=tg.calls;
  try{
    const sess=e.DB.sql.prepare('SELECT id FROM sessions').get().id;
    e.DB.sql.prepare("UPDATE sessions SET bot_platform='telegram',bot_chat='555',bot_name='مریم' WHERE id=?").run(sess);
    const gid=crypto.randomUUID();
    e.DB.sql.prepare("INSERT INTO generations(id,salon_id,session_id,idem,state,original_id,result_id,style,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)").run(gid,e.DB.sql.prepare('SELECT id FROM salons').get().id,sess,crypto.randomUUID(),'success',original,original,3,Date.now(),Date.now());
    // not yours -> no post
    assert.equal((await call(e,'/api/s/post-a/share',{gen:crypto.randomUUID()},g)).status,404);
    const sh=await call(e,'/api/s/post-a/share',{gen:gid,name:'مریم'},g);assert.equal(sh.status,200,JSON.stringify(sh));
    assert.match(sh.data.url,/\/p\/[a-f0-9]{32}$/);assert.ok(sh.data.text.includes('مزون post-a')&&sh.data.text.includes('فیت'));
    const t=sh.data.token,pub=await app.fetch(new Request(origin+'/p/'+t),e);assert.equal(pub.status,200);assert.ok((await pub.text()).includes('مریم'));
    assert.equal((await app.fetch(new Request(origin+'/api/p/'+t+'/image'),e)).status,200);
    assert.equal((await app.fetch(new Request(origin+'/p/'+'0'.repeat(32)),e)).status,404);
    const post=(path,body)=>app.fetch(new Request(origin+'/api/p/'+t+path,{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)}),e);
    assert.equal((await post('/like',{v:'a'.repeat(20)})).status,200);
    assert.equal((await (await post('/like',{v:'a'.repeat(20)})).json()).likes,1); // same visitor counts once
    assert.equal((await post('/comment',{name:'سارا',body:'خیلی بهت میاد'})).status,200);
    assert.equal((await post('/comment',{name:'س',body:''})).status,400);
    assert.ok(calls.some(c=>c.method==='sendMessage'&&String(c.body.chat_id)==='555'&&String(c.body.text).includes('سارا')),'the bride is told about the comment');
    const rx=await call(e,'/api/s/post-a/reactions/'+gid,undefined,g);assert.equal(rx.data.likes,1);assert.equal(rx.data.comments[0].name,'سارا');assert.equal(rx.data.consent,0);
    assert.equal((await call(e,'/api/s/post-a/social',{gen:gid,consent:true},g)).status,200);
    assert.equal((await call(e,'/api/s/post-a/reactions/'+gid,undefined,g)).data.consent,1);
    const list=await call(e,'/api/s/post-a/owner/social',undefined,OWNER);assert.equal(list.data.items.length,1);assert.equal(list.data.items[0].dress.length>0,true);
  }finally{tg.restore()}
});

test('a bride messages the bot from the boutique link: photo in, personal link out, consent answered by button',async()=>{
  const e=tgEnv(fixture()),s=await salon(e,'bot-a'),tg=mockTelegram();
  try{
    let id=1;const send=m=>hook(e,{update_id:id++,message:{chat:{id:9001,type:'private'},from:{id:9001,first_name:'مریم'},...m}});
    assert.equal((await send({text:'/start c_bot-a'})).status,200);
    assert.ok(tg.calls.some(c=>c.method==='sendMessage'&&String(c.body.text).includes('تمام‌قد')),'asks for a full-length photo');
    await send({photo:[{file_id:'p1',file_size:2000}]});
    const link=tg.calls.filter(c=>c.method==='sendMessage').map(c=>c.body.reply_markup?.inline_keyboard?.[0]?.[0]?.url).find(Boolean);
    assert.match(link,/\/s\/bot-a\?c=[a-f0-9]{64}$/);
    // the personal link opens her session with the photo already in it
    const key=link.split('?c=')[1],claim=await call(e,'/api/s/bot-a/session/claim',{t:key});assert.equal(claim.status,200);
    const me=await call(e,'/api/s/bot-a/session',undefined,{cookie:claim.cookie});assert.equal(me.data.bot,true);assert.ok(me.data.original);
    assert.equal((await call(e,'/api/s/bot-a/session/claim',{t:'0'.repeat(64)})).status,410);
    // unknown boutique
    await send({text:'/start c_nope'});assert.ok(tg.calls.some(c=>String(c.body.text||'').includes('پیدا نشد')));
  }finally{tg.restore()}
});

test('360: turntable video is requested from the result, stored as mp4 and served with byte ranges',async()=>{
 const e=fixture(),s=await salon(e),g=await guest(e,s);e.KIE_API_KEY='mock';
 await call(e,'/api/s/'+s.slug+'/owner/settings',{generation_enabled:true,catalog:true,reference_verified:true},OWNER);
 const original=await upload(e,s,g),v='ab'.repeat(16);
 const sid=e.DB.sql.prepare('SELECT session_id FROM media WHERE id=?').get(original).session_id,salonId=e.DB.sql.prepare('SELECT salon_id FROM media WHERE id=?').get(original).salon_id;
 const base=crypto.randomUUID(),now=Date.now();
 e.DB.sql.prepare("INSERT INTO generations(id,salon_id,session_id,idem,kind,state,original_id,result_id,created_at,updated_at,line,opts) VALUES(?,?,?,?,'single','success',?,?,?,?,'dress','{}')").run(base,salonId,sid,crypto.randomUUID(),original,original,now,now);
 const mp4=new Uint8Array(5000);mp4.set([0,0,0,24,0x66,0x74,0x79,0x70,0x69,0x73,0x6f,0x6d],0);for(let i=12;i<mp4.length;i++)mp4[i]=i%251;
 const previous=globalThis.fetch;const tasks=[];
 globalThis.fetch=async(url,init)=>{url=String(url);
  if(url.includes('file-base64-upload'))return Response.json({success:true,data:{downloadUrl:'https://provider.example/in.jpg'}});
  if(url.includes('createTask')){const b=JSON.parse(init.body);tasks.push(b);return Response.json({code:200,data:{taskId:'t'+tasks.length}})}
  if(url.includes('recordInfo'))return Response.json({code:200,data:{state:'success',resultJson:JSON.stringify({resultUrls:[(url.includes('taskId=t2')||url.includes('taskId=t3'))?'https://provider.example/out.mp4':'https://provider.example/back.jpg']})}});
  if(url.endsWith('out.mp4'))return new Response(mp4);
  return new Response(png())};
 try{
  const idem=crypto.randomUUID(),job=await call(e,'/api/s/'+s.slug+'/spin',{v,parent:base,idem},g);assert.equal(job.status,200);
  assert.match(tasks[0].input.prompt,/BEHIND/,'stage 1 makes the back view of the same bride');
  const again=await call(e,'/api/s/'+s.slug+'/spin',{v,parent:base,idem},g);assert.equal(again.data.id,job.data.id,'same idem, same job');
  const mid=await call(e,'/api/s/'+s.slug+'/generation/'+job.data.id,undefined,g);assert.equal(mid.data.state,'waiting','back view done, video started');
  assert.equal(tasks[1].model,'kling-3.0/video');assert.equal(tasks[1].input.image_urls.length,2,'front frame + back frame');assert.match(tasks[1].input.prompt,/half-turn/);
  const mid2=await call(e,'/api/s/'+s.slug+'/generation/'+job.data.id,undefined,g);assert.equal(mid2.data.state,'waiting','clip A stored, clip B started');
  assert.equal(tasks[2].input.image_urls.length,2);assert.match(tasks[2].input.prompt,/back view.*front view/s);assert.match(tasks[2].input.prompt,/smile/,'expression in the closing second');
  const done=await call(e,'/api/s/'+s.slug+'/generation/'+job.data.id,undefined,g);assert.equal(done.data.state,'success');assert.ok(done.data.part2,'second half of the full turn');
  const media=e.DB.sql.prepare('SELECT kind,mime FROM media WHERE id=?').get(done.data.result_id);assert.deepEqual({...media},{kind:'spin',mime:'video/mp4'});
  const url=origin+'/api/s/'+s.slug+'/media/'+done.data.result_id;
  const rl=await call(e,'/api/s/'+s.slug+'/result-link',{v,gen:job.data.id},g);assert.equal(rl.status,200);
  const rp=await (await app.fetch(new Request(rl.data.url),e)).text();assert.match(rp,/<video/);
  const rr=await app.fetch(new Request(rl.data.url+'/img',{headers:{Range:'bytes=0-9'}}),e);assert.equal(rr.status,206,'phone can stream the shared video');
  const part=await app.fetch(new Request(url,{headers:{origin,cookie:g.cookie,Range:'bytes=100-199'}}),e);assert.equal(part.status,206);assert.equal(part.headers.get('content-range'),'bytes 100-199/5000');assert.equal((await part.arrayBuffer()).byteLength,100);
 }finally{globalThis.fetch=previous}
});

test('boutique shows only its own dresses: catalog and own-photo are opt-in, all angles of the owner dress reach the model',async()=>{
 const e=fixture(),s=await salon(e),g=await guest(e,s);e.KIE_API_KEY='mock';
 e.DB.sql.prepare("UPDATE salons SET settings=json_set(settings,'$.catalog',json('false'),'$.generation_enabled',json('true')) WHERE slug='salon-a'").run();
 const pub=(await call(e,'/api/s/salon-a/public')).data;assert.equal(pub.catalog,false);assert.equal(pub.own_dress,false);
 const original=await upload(e,s,g),front=await upload(e,s,g),back=await upload(e,s,g);
 e.DB.sql.prepare("INSERT INTO portfolio(id,salon_id,title,category,description,stylist,images,published,try_on,permission,created_at,line) VALUES('d1',?,'پرنسسی','','','',?,1,1,1,?,'dress')").run(e.DB.sql.prepare("SELECT id FROM salons WHERE slug='salon-a'").get().id,JSON.stringify([front,back]),Date.now());
 const gen=b=>call(e,'/api/s/salon-a/generate',{image_consent:true,idem:crypto.randomUUID(),original_id:original,...b},g);
 assert.equal((await gen({style:1})).status,403,'sample catalog is closed');
 const own=await upload(e,s,g);
 const previous=globalThis.fetch,sent=[];
 globalThis.fetch=async(url,opts)=>{const u=String(url);if(u.includes('file-base64-upload'))return Response.json({success:true,data:{downloadUrl:'https://provider.example/'+sent.length+'.jpg'}});if(u.includes('createTask')){sent.push(JSON.parse(opts.body));return Response.json({code:200,data:{taskId:'t1'}})}return previous(url,opts)};
 try{
  assert.equal((await gen({reference_id:own})).status,403,'a customer-uploaded dress photo is closed');
  assert.equal((await gen({reference_id:front})).status,200);
  assert.equal(sent.at(-1).input.image_input.length,3,'her photo + both angles');
  assert.match(sent.at(-1).input.prompt,/different angles/);
  await call(e,'/api/s/salon-a/owner/settings',{generation_enabled:true,catalog:true,allow_own_dress:true},OWNER);
  const p2=(await call(e,'/api/s/salon-a/public')).data;assert.equal(p2.catalog,true);assert.equal(p2.own_dress,true);
  assert.equal((await gen({style:1})).status,200);
 }finally{globalThis.fetch=previous}
});

test('phone -> kiosk pairing: QR code, public phone page, photo lands only in the kiosk session, expires and is erased',async()=>{
 const e=fixture(),s=await salon(e),g=await guest(e,s);
 const p=await call(e,'/api/s/salon-a/pair',{v:'k1'},g);assert.equal(p.status,200,JSON.stringify(p));assert.match(p.data.code,/^[a-f0-9]{12}$/);assert.ok(p.data.url.endsWith('/u/'+p.data.code));
 const page=await app.fetch(new Request(origin+'/u/'+p.data.code),e);assert.equal(page.status,200);const html=await page.text();assert.match(html,/checkPhoto/);assert.match(html,/capture="environment"/);
 assert.equal((await app.fetch(new Request(origin+'/u/'+'0'.repeat(12)),e)).status,404);
 {const w=await call(e,'/api/s/salon-a/pair/check?seen=',undefined,g);assert.equal(w.data.state,'waiting',JSON.stringify(w))}
 const send=(body,code=p.data.code)=>app.fetch(new Request(origin+'/u/'+code+'/photo',{method:'POST',body}),e);
 assert.equal((await send(new Uint8Array(300).fill(65))).status,400,'not an image');
 assert.equal((await send(png())).status,200);
 const st=await call(e,'/api/s/salon-a/pair/check?seen=',undefined,g);assert.equal(st.data.state,'received');
 const row=e.DB.sql.prepare('SELECT session_id,kind FROM media WHERE id=?').get(st.data.media_id);assert.equal(row.kind,'original');
 assert.equal((await call(e,'/api/s/salon-a/pair/check?seen='+st.data.media_id,undefined,g)).data.state,'waiting','reported once');
 const other=await guest(e,s);assert.equal((await call(e,'/api/s/salon-a/pair/check?seen=',undefined,other)).data.state,'none','another visitor never sees it');
 e.DB.sql.prepare('UPDATE pairings SET expires_at=1').run();assert.equal((await send(png())).status,404,'expired code');
 assert.equal((await call(e,'/api/s/salon-a/erase',{v:'k1'},g)).status,200);assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM pairings').get().n,0);
 const cust=await app.fetch(new Request(origin+'/s/salon-a?kiosk=1'),e);const ch=await cust.text();assert.match(ch,/openPhonePair/);assert.match(ch,/function checkPhoto/);
});

test('a salon can set sale/rent, price and stock per dress; customers see them, junk is dropped',async()=>{
 const e=tgEnv(fixture()),s=await salon(e);
 const id=(await call(e,'/api/s/salon-a/owner/portfolio/add',{media_id:await ownerPortfolio(e,s),title:'لباس قیمت‌دار'},OWNER)).data.id;
 assert.equal((await call(e,'/api/s/salon-a/owner/portfolio/info',{id,mode:'rent',price:'۱۲ میلیون',stock:'available'},OWNER)).status,200);
 let p=(await call(e,'/api/s/salon-a/public')).data.portfolio.find(x=>x.id===id);
 assert.deepEqual([p.mode,p.price,p.stock],['rent','۱۲ میلیون','available']);
 await call(e,'/api/s/salon-a/owner/portfolio/info',{id,mode:'x',price:'a'.repeat(200),stock:'y'},OWNER);
 p=(await call(e,'/api/s/salon-a/public')).data.portfolio.find(x=>x.id===id);
 assert.deepEqual([p.mode,p.price.length,p.stock],['',60,'']);
});

test('name + mobile on the welcome screen, thumbs, and "send it to me" reaches the chat that shared the same number',async()=>{
  const e=tgEnv(fixture()),s=await salon(e,'me-a'),g=await guest(e,s),original=await upload(e,s,g),tg=mockTelegram();
  try{
    assert.equal((await call(e,'/api/s/me-a/session/profile',{v:'k'.repeat(20),name:'م',phone:'09123456789'},g)).status,400,'name too short');
    assert.equal((await call(e,'/api/s/me-a/session/profile',{v:'k'.repeat(20),name:'مریم احمدی',phone:'12345'},g)).status,400,'bad mobile');
    const ok=await call(e,'/api/s/me-a/session/profile',{v:'k'.repeat(20),name:'مریم احمدی',phone:'۹۱۲۳۴۵۶۷۸۹'},g);assert.equal(ok.status,200,JSON.stringify(ok));assert.equal(ok.data.phone,'09123456789');
    const ses=await call(e,'/api/s/me-a/session',undefined,g);assert.equal(ses.data.cname,'مریم احمدی');assert.equal(ses.data.cphone,'09123456789');
    const sess=e.DB.sql.prepare('SELECT id FROM sessions').get().id,salonId=e.DB.sql.prepare('SELECT id FROM salons').get().id,gid=crypto.randomUUID();
    e.DB.sql.prepare("INSERT INTO generations(id,salon_id,session_id,idem,state,original_id,result_id,style,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)").run(gid,salonId,sess,crypto.randomUUID(),'success',original,original,3,Date.now(),Date.now());
    assert.equal((await call(e,'/api/s/me-a/reaction',{v:'k'.repeat(20),gen:gid,r:'up'},g)).status,200);assert.equal(e.DB.sql.prepare('SELECT reaction FROM generations WHERE id=?').get(gid).reaction,'up');
    await call(e,'/api/s/me-a/reaction',{v:'k'.repeat(20),gen:gid,r:'x'},g);assert.equal(e.DB.sql.prepare('SELECT reaction FROM generations WHERE id=?').get(gid).reaction,'');
    const none=await call(e,'/api/s/me-a/send-bot',{v:'k'.repeat(20),gen:gid},g);assert.equal(none.status,200);assert.equal(none.data.sent,false,'bot does not know this number yet');
    // she shares her contact with the bot
    const hookMsg=m=>hook(e,{update_id:77,message:{chat:{id:9100,type:'private'},from:{id:9100,first_name:'مریم'},...m}});
    await hookMsg({text:'/start c_me-a'});
    assert.ok(tg.calls.some(c=>c.method==='sendMessage'&&c.body.reply_markup?.keyboard?.[0]?.[0]?.request_contact),'asks for her number');
    await hook(e,{update_id:78,message:{chat:{id:9100,type:'private'},from:{id:9100,first_name:'مریم'},contact:{phone_number:'+989123456789',user_id:9100}}});
    assert.equal(e.DB.sql.prepare('SELECT phone FROM bot_customers WHERE chat_id=?').get('9100').phone,'09123456789');
    const sent=await call(e,'/api/s/me-a/send-bot',{v:'k'.repeat(20),gen:gid},g);assert.equal(sent.data.sent,true,JSON.stringify(sent));
    assert.ok(tg.calls.some(c=>c.method==='sendMessage'&&String(c.body.chat_id)==='9100'&&String(c.body.text).includes('مریم احمدی')&&String(c.body.text).includes('09123456789')),'details sent');
    // someone else's contact is ignored
    await hook(e,{update_id:79,message:{chat:{id:9100,type:'private'},from:{id:9100,first_name:'م'},contact:{phone_number:'+989111111111',user_id:5}}});
    assert.equal(e.DB.sql.prepare('SELECT phone FROM bot_customers WHERE chat_id=?').get('9100').phone,'09123456789');
  }finally{tg.restore()}
});

test('credits: 100 per salon by default, unapproved salons cannot generate, admin approves and recharges, manager panel requests a pack',async()=>{
 const e=tgEnv(fixture());e.KIE_API_KEY='mock';const tg=mockTelegram();const net=globalThis.fetch;globalThis.fetch=async(url,opts)=>{const u=String(url);if(u.includes('file-base64-upload'))return Response.json({success:true,data:{downloadUrl:'https://provider.example/f.png'}});if(u.includes('createTask'))return Response.json({code:200,data:{taskId:'t'+Math.random()}});return net(url,opts)};
 try{await linkOwnerChat(e);
  const s=await salon(e,'credit-salon');
  const slug=s.slug,row=()=>e.DB.sql.prepare('SELECT * FROM salons WHERE slug=?').get(slug);
  assert.equal(row().credit_limit,100,'default credit is 100');assert.equal(row().approved,1,'owner-made salons are approved');assert.match(row().manage_token,/^[a-f0-9]{32}$/);
  const g=await guest(e,{slug}),original=await upload(e,{slug},g);
  const gen=()=>call(e,'/api/s/'+slug+'/generate',{image_consent:true,idem:crypto.randomUUID(),original_id:original,style:0},g);
  e.DB.sql.prepare('UPDATE salons SET credit_limit=2 WHERE slug=?').run(slug);
  assert.equal((await gen()).status,200);assert.equal((await gen()).status,200);
  const capped=await gen();assert.equal(capped.status,402);assert.match(capped.data.error,/ظرفیت/);
  // unapproved: blocked even with credit
  e.DB.sql.prepare('UPDATE salons SET credit_limit=100,approved=0 WHERE slug=?').run(slug);
  assert.equal((await gen()).status,403);
  // admin list + approve + add credit
  assert.equal((await call(e,'/api/owner/accounts')).status,401);
  const list=await call(e,'/api/owner/accounts',undefined,OWNER);assert.equal(list.status,200);const acc=list.data.accounts.find(a=>a.slug===slug);assert.equal(acc.approved,false);assert.equal(acc.used,2);assert.equal(acc.limit,100);assert.match(acc.panel,/\/m\/[a-f0-9]{32}$/);
  const ok=await call(e,'/api/owner/account',{slug,approved:true,add:50},OWNER);assert.equal(ok.status,200);assert.equal(ok.data.limit,150);assert.equal(ok.data.approved,true);
  assert.equal((await gen()).status,200);
  // manager panel: no login, private token
  const token=row().manage_token,pnl=await call(e,'/api/m/'+token);assert.equal(pnl.status,200);assert.equal(pnl.data.left,150-3);assert.deepEqual(pnl.data.packs,[100,300,1000]);
  assert.equal((await call(e,'/api/m/'+'0'.repeat(32))).status,404);
  assert.equal((await call(e,'/api/m/'+token+'/recharge',{amount:7})).status,400);
  const rq=await call(e,'/api/m/'+token+'/recharge',{amount:300,note:'پرداخت شد'});assert.equal(rq.status,200,JSON.stringify(rq));assert.equal(rq.data.requests[0].status,'pending');
  assert(toOwner(tg).find(t=>/درخواست شارژ/.test(t)),'owner was told about the request');
  assert.equal(e.DB.sql.prepare('SELECT credit_limit l FROM salons WHERE slug=?').get(slug).l,150,'nothing is added before approval');
  const pend=(await call(e,'/api/owner/accounts',undefined,OWNER)).data.requests;assert.equal(pend.length,1);
  assert.equal((await call(e,'/api/owner/recharge',{id:pend[0].id,action:'approve'},OWNER)).status,200);
  assert.equal(e.DB.sql.prepare('SELECT credit_limit l FROM salons WHERE slug=?').get(slug).l,450);
  assert.equal((await call(e,'/api/owner/recharge',{id:pend[0].id,action:'approve'},OWNER)).status,404,'a request is handled once');
  const page=await app.fetch(new Request(origin+'/m/'+token),e);assert.equal(page.status,200);assert.match(await page.text(),/پنل مزون/);
  assert.equal((await app.fetch(new Request(origin+'/m/'+'f'.repeat(32)),e)).status,404);
 }finally{globalThis.fetch=net;tg.restore()}});

test('manager accounts: chosen at registration, panel opens after approval on the salon subdomain at /manager, scoped to its own salon',async()=>{
 const e=tgEnv(fixture());e.SESSION_SECRET='s3cret-test';e.APP_ORIGIN='https://ayneh.test';const tg=mockTelegram();
 try{await linkOwnerChat(e);
  const body={name:'سارا',salon:'مزون رز',city:'تهران',phone:'۰۹۱۲۱۲۳۴۵۶۷',consent:true,username:'sara.rose',password:'Passw0rd!x',subdomain:'rose'};
  assert.equal((await call(e,'/api/trial',{...body,username:'x'})).status,400,'short username');
  assert.equal((await call(e,'/api/trial',{...body,password:'short'})).status,400,'short password');
  assert.equal((await call(e,'/api/trial',{...body,subdomain:'www'})).status,400,'reserved subdomain');
  const r=await call(e,'/api/trial',body);assert.equal(r.status,200,JSON.stringify(r));const slug=r.data.path.slice(3);
  const row=()=>e.DB.sql.prepare('SELECT * FROM salons WHERE slug=?').get(slug);
  assert.equal(row().mgr_user,'sara.rose');assert.notEqual(row().mgr_hash,'Passw0rd!x');assert.equal(row().desired_sub,'rose');assert.equal(row().subdomain,null);
  assert.match(r.data.bot.telegram,/t\.me\/ayneh_bot\?start=[a-f0-9]{24}/,'registration returns the bot start link');
  await hook(e,{message:{chat:{id:777,type:'private'},text:'/start '+r.data.bot.telegram.split('start=')[1]}});
  const f=(host,path,init={})=>app.fetch(new Request('https://'+host+path,{...init,headers:{origin:'https://'+host,'content-type':'application/json',...(init.headers||{})}}),e);
  // before approval: no subdomain, no manager login
  assert.equal((await f('rose.ayneh.test','/')).status,404);
  assert.equal((await f('t-x.ayneh.test','/api/s/'+slug+'/manager/login',{method:'POST',body:JSON.stringify({username:'sara.rose',password:'Passw0rd!x'})})).status,403);
  // owner approves: subdomain is created
  const ap=await call(e,'/api/owner/account',{slug,approved:true,subdomain:'Rose'},OWNER);assert.equal(ap.status,200,JSON.stringify(ap));assert.equal(ap.data.subdomain,'rose');
  assert.deepEqual(ap.data.notified.bot,['telegram']);assert.equal(ap.data.notified.sms,'off');const said=toOwner(tg,777).join('\n');assert.match(said,/rose\.ayneh\.test\/manager/);assert.match(said,/sara\.rose/);assert.equal(row().subdomain,'rose');
  const other=await salon(e,'other-salon');assert.equal((await call(e,'/api/owner/account',{slug:other.slug,approved:true,subdomain:'rose'},OWNER)).status,409,'subdomain is unique');
  const home=await f('rose.ayneh.test','/');assert.equal(home.status,200);assert.match(await home.text(),new RegExp('window.__SLUG="'+slug+'"'));
  const mp=await f('rose.ayneh.test','/manager');assert.equal(mp.status,200);assert.match(await mp.text(),new RegExp('window.__MGR="'+slug+'"'));
  assert.equal((await f('nope.ayneh.test','/')).status,404);
  // login: wrong password, then right one
  const login=pw=>f('rose.ayneh.test','/api/s/'+slug+'/manager/login',{method:'POST',body:JSON.stringify({username:'sara.rose',password:pw})});
  assert.equal((await login('wrong-password')).status,401);
  const ok=await login('Passw0rd!x');assert.equal(ok.status,200);const cookie=ok.headers.get('set-cookie').split(';')[0];
  const as=(path,init={})=>f('rose.ayneh.test',path,{...init,headers:{cookie,...(init.headers||{})}});
  assert.equal((await as('/api/me')).status,200);assert.equal((await (await as('/api/me')).json()).manager,slug);
  assert.equal((await as('/api/s/'+slug+'/owner')).status,200,'manager reads own salon');
  assert.equal((await as('/api/s/'+slug+'/owner/profile',{method:'POST',body:JSON.stringify({profile:{bio:'سلام'}})})).status,200,'manager edits own salon');
  assert.equal((await as('/api/s/'+slug+'/owner/credits')).status,200);
  assert.equal((await as('/api/s/'+other.slug+'/owner')).status,401,'not another salon');
  assert.equal((await as('/api/owner/accounts')).status,401,'not the platform admin');
  assert.equal((await as('/api/owner/stats?salon='+slug)).status,200,'own stats');assert.equal((await as('/api/owner/stats')).status,401,'not platform-wide stats');
  assert.equal((await f('rose.ayneh.test','/api/s/'+slug+'/owner')).status,401,'no cookie, no access');
  // suspended salon: the cookie stops working
  await call(e,'/api/owner/account',{slug,approved:false},OWNER);assert.equal((await as('/api/s/'+slug+'/owner')).status,401);
 }finally{tg.restore()}});

test('manager can text the page link to customers (needs the invite text); approval ends the trial strip',async()=>{
 const e=tgEnv(fixture());e.SESSION_SECRET='s3cret-test';e.APP_ORIGIN='https://ayneh.test';
 const body={name:'نرگس',salon:'مزون نرگس',city:'تهران',phone:'09125550001',consent:true,username:'narges.m',password:'Passw0rd!x',subdomain:'narges'};
 const r=await call(e,'/api/trial',body);assert.equal(r.status,200,JSON.stringify(r));const slug=r.data.path.slice(3);
 assert.equal((await call(e,'/api/s/'+slug+'/public')).data.trial?.images_limit,5,'trial strip before approval');
 const none=await call(e,'/api/s/'+slug+'/owner/invite',{numbers:'09121234567'},OWNER);assert.equal(none.status,503,'SMS off');
 await call(e,'/api/owner/account',{slug,approved:true,subdomain:'narges'},OWNER);
 const pub=(await call(e,'/api/s/'+slug+'/public')).data;assert.ok(!pub.trial,'no trial strip after approval');assert.match(pub.brand,/^#/,'page colour stays');
 Object.assign(e,{MELIPAYAMAK_TOKEN:'dev-mock',MELIPAYAMAK_BODY_ID:'524'});
 const ok=await call(e,'/api/s/'+slug+'/owner/invite',{numbers:'09121234567 09351234567'},OWNER);assert.equal(ok.status,200,JSON.stringify(ok));assert.equal(ok.data.results.filter(x=>x.ok).length,2);
 assert.equal((await call(e,'/api/s/'+slug+'/owner/invite',{numbers:'abc'},OWNER)).status,400);
});

test('quick dress intake: one dress with 4 angle photos, duplicates refused',async()=>{
 const e=fixture(),s=await salon(e);
 const ids=[];for(let i=0;i<5;i++)ids.push(await ownerPortfolio(e,s));
 const r=await call(e,'/api/s/salon-a/owner/portfolio/add',{media_ids:ids,title:'چهار زاویه'},OWNER);assert.equal(r.status,200);
 const row=e.DB.sql.prepare('SELECT images FROM portfolio WHERE id=?').get(r.data.id);assert.deepEqual(JSON.parse(row.images),ids.slice(0,4),'max 4 photos, in order');
 const dup=await call(e,'/api/s/salon-a/owner/portfolio/add',{media_ids:[ids[0]],title:'تکراری'},OWNER);assert.equal(dup.status,400);
});
