// Tells a salon manager that the page is live: bot message (Telegram/Bale, when the chat is linked) and an SMS.
import {PLATFORMS,call} from './telegram.js';
import {smsReady,sendApproved} from './sms.js';
const esc=s=>String(s??'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

export function hostOf(env,origin,salon){
 const base=new URL(env.APP_ORIGIN||origin).hostname;
 return salon.subdomain?salon.subdomain+'.'+base:'';
}
// Where the salon manager manages the account: the salon's own subdomain once approved, else the private token page.
export function panelUrl(env,origin,salon){
 const base=env.APP_ORIGIN||origin;
 if(salon.approved&&salon.mgr_user&&salon.subdomain){try{const u=new URL(base);return u.protocol+'//'+salon.subdomain+'.'+u.host+'/manager'}catch{}}
 return base+'/m/'+(salon.manage_token||'');
}
export function activationText(env,origin,salon){
 const host=hostOf(env,origin,salon),site='https://'+host;
 return '🎉 <b>صفحهٔ مزون «'+esc(salon.name)+'» فعال شد!</b>\n\n'+
  '🌐 صفحهٔ مشتری‌ها:\n'+site+'\n\n'+
  '🔑 پنل مدیریت:\n'+site+'/manager\n'+
  'ورود با نام کاربری و رمزی که هنگام ثبت‌نام انتخاب کردید'+(salon.mgr_user?' (نام کاربری: <code>'+esc(salon.mgr_user)+'</code>)':'')+'.\n\n'+
  '📌 چند قدم برای شروع:\n'+
  '۱) وارد پنل مدیریت شوید و لوگو، کاور، آدرس و ساعت کاری مزون را کامل کنید.\n'+
  '۲) لباس‌های مزون را در بخش نمونه‌کارها اضافه کنید.\n'+
  '۳) لینک صفحه یا QR آن را به مشتری‌ها بدهید تا لباس را روی خودشان امتحان کنند.\n'+
  '۴) درخواست مشتری‌ها همین‌جا در همین ربات برای شما می‌آید.\n\n'+
  '🖼 اعتبار ساخت تصویر: ۱۰۰ تصویر. وقتی تمام شد از پنل مدیریت درخواست شارژ بدهید.';
}
// Returns {bot:[platforms notified], sms:bool|'off', errors:[]}.
export async function notifyActivation(db,env,origin,salon){
 const out={bot:[],sms:'off',errors:[]};
 const text=activationText(env,origin,salon);
 for(const P of Object.values(PLATFORMS)){
  if(!salon[P.col]||!P.token(env))continue;
  try{await call(env,P.name,'sendMessage',{chat_id:salon[P.col],text,parse_mode:'HTML',disable_web_page_preview:true});out.bot.push(P.name)}
  catch(e){out.errors.push(P.label+': '+(e.message||'خطا'))}
 }
 const t=await db.prepare('SELECT phone FROM trials WHERE salon_id=?').bind(salon.id).first();
 if(t?.phone&&smsReady(env)){
  try{const r=await sendApproved(env,t.phone,[salon.name,hostOf(env,origin,salon)]);out.sms=r?true:'off'}
  catch(e){out.sms=false;out.errors.push('پیامک: '+(e.message||'خطا'))}
 }
 return out;
}
