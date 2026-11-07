// Melipayamak (ملی پیامک) texts. Two jobs only:
//  1. One-time code: POST /api/send/otp/<token> {to} -> {code,status}. Melipayamak generates and
//     texts the code and hands it back, so we can check it ourselves. We keep only its hash.
//  2. Invitation: POST /api/send/shared/<token> {bodyId,to,args} from the shared service line,
//     using the approved ready-made text MELIPAYAMAK_BODY_ID. args fill its variables in order:
//     [salon name, salon slug]. The text itself ends with the fixed site address, e.g.
//     «… ayneh-salon.site/s/{1}», so the link is the site plus /s/<slug>.
// Secrets: MELIPAYAMAK_TOKEN is the random segment at the end of the API address shown in the
// Melipayamak console (it is a credential: never commit it); MELIPAYAMAK_BODY_ID is the number of
// the approved invitation text; MELIPAYAMAK_OTP_BODY_ID (optional) the approved one-time-code text.
// MELIPAYAMAK_TOKEN=dev-mock answers locally with code 12345 and sends nothing.
import {Problem,must} from './domain.js';

const BASE='https://console.melipayamak.com/api/send/';
export const DEV_CODE='12345';
export const smsReady=env=>!!env?.MELIPAYAMAK_TOKEN;
export const otpTextReady=env=>smsReady(env)&&/^\d+$/.test(String(env?.MELIPAYAMAK_OTP_BODY_ID||'').trim());
export const inviteReady=env=>smsReady(env)&&/^\d+$/.test(String(env?.MELIPAYAMAK_BODY_ID||'').trim());
const mock=env=>env.MELIPAYAMAK_TOKEN==='dev-mock';
// The console shows the token inside a full address (…/api/send/otp/<token> or …/shared/<token>);
// accept that whole address too, and ignore stray spaces or line breaks around it.
export const consoleToken=env=>String(env.MELIPAYAMAK_TOKEN||'').trim().split(/[/?#\s]+/).filter(Boolean).pop()||'';
// +989121234567 -> 09121234567, the form the console API expects.
export const localNumber=p=>'0'+String(p).replace(/^\+98/,'');

async function post(env,kind,payload){
 try{
  const res=await fetch(BASE+kind+'/'+encodeURIComponent(consoleToken(env)),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(15000)});
  const d=await res.json().catch(()=>({}));
  return {ok:res.ok,d:d&&typeof d==='object'?d:{}};
 }catch{
  // The URL contains the token, so the original error is never logged or returned.
  throw new Problem(502,'ارتباط با سرویس پیامک برقرار نشد؛ کمی بعد دوباره تلاش کن');
 }
}

// Shared-line text from an approved ready-made message. Returns {recId}.
async function shared(env,phone,bodyId,args){
 const {ok,d}=await post(env,'shared',{bodyId,to:localNumber(phone),args:args.map(String)});
 // On success recId is a long delivery id; failures come back as a small error number plus a status text.
 const rec=Number(d.recId);
 if(!ok||!Number.isFinite(rec)||rec<=1000){console.error('melipayamak shared failed:',String(d.status||'').slice(0,120));throw new Problem(502,'پیامک ارسال نشد'+(d.status?' ('+String(d.status).slice(0,80)+')':''));}
 return {recId:String(d.recId)};
}

// Texts a one-time code to `phone` (+98…) and returns the code to check later.
// With MELIPAYAMAK_OTP_BODY_ID (an approved text with one variable, the code) we make a 6-digit code
// ourselves and send it from the shared line, so the wording and site address are ours.
// Without it, Melipayamak's own one-time-code method generates, texts and returns the code.
export async function sendOtp(env,phone){
 must(smsReady(env),'تأیید شماره هنوز فعال نشده است',503);
 if(mock(env)){console.log('[sms mock] otp ->',localNumber(phone),DEV_CODE);return DEV_CODE;}
 if(otpTextReady(env)){
  const code=String(100000+crypto.getRandomValues(new Uint32Array(1))[0]%900000);
  await shared(env,phone,Number(String(env.MELIPAYAMAK_OTP_BODY_ID).trim()),[code]);
  return code;
 }
 const {ok,d}=await post(env,'otp',{to:localNumber(phone)});
 const code=String(d.code??'').trim();
 if(!ok||!/^\d{3,12}$/.test(code)){console.error('melipayamak otp failed:',String(d.status||'').slice(0,120));throw new Problem(502,'ارسال پیامک تأیید انجام نشد؛ کمی بعد دوباره تلاش کن');}
 return code;
}

// Texts the approved invitation message from the shared line. Returns {recId}.
export async function sendInvite(env,phone,args){
 must(inviteReady(env),'پیامک دعوت هنوز فعال نشده است',503);
 if(mock(env)){console.log('[sms mock] invite ->',localNumber(phone),JSON.stringify(args));return {recId:'mock'};}
 return shared(env,phone,Number(String(env.MELIPAYAMAK_BODY_ID).trim()),args);
}
