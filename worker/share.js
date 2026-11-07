// Salon -> customer invitations through messengers instead of SMS.
// A shared-line SMS may not carry a link without a starred eNamad, so the stylist sends the link
// herself: the bot answers a customer's mobile number (or /share) with buttons that open WhatsApp
// straight to that number, Telegram's contact picker, and /i/<slug>, a small page with SMS from her
// own phone, Bale, Instagram Direct, copy and the phone's share menu. The link carries her
// referral code (?r=), so whoever opens it becomes her customer.
import {phone} from './domain.js';
import {STAFF_CODE} from './referral.js';
import {baseCSS} from './design.js';

const attr=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const local=p=>String(p||'').replace(/^\+98/,'0');
const intl=p=>String(p||'').replace(/^\+/,'');

export function inviteUrl(origin,salon,member){return origin+'/s/'+salon.slug+(member?.ref_code?'?r='+member.ref_code:'')}
export function inviteText(salon,member){
 const from=member&&!member.is_manager&&member.name?member.name+' از «'+salon.name+'»':'«'+salon.name+'»';
 return 'سلام 🌸 '+from+' هستم. مدل مو، طرح ناخن یا مژهٔ جدید رو اینجا روی عکس خودت امتحان کن؛ رایگان و بدون نصب. هر کدوم رو خواستی همون‌جا برامون بفرست 👇';
}
// Everything the bot and the page need for one recipient (number optional).
export function shareLinks(origin,salon,member,number=null){
 const url=inviteUrl(origin,salon,member),text=inviteText(salon,member),both=text+'\n'+url;
 const q=new URLSearchParams();if(member?.ref_code)q.set('r',member.ref_code);if(number)q.set('to',local(number));
 return {
  url,text,both,
  whatsapp:'https://wa.me/'+(number?intl(number):'')+'?text='+encodeURIComponent(both),
  telegram:'https://t.me/share/url?url='+encodeURIComponent(url)+'&text='+encodeURIComponent(text),
  page:origin+'/i/'+salon.slug+(q.toString()?'?'+q:''),
 };
}
// Inline keyboard for Telegram and Bale (url buttons only).
export function shareKeyboard(links,number=null){
 return {inline_keyboard:[
  [{text:'💬 واتساپ'+(number?' به همین شماره':''),url:links.whatsapp},{text:'✈️ تلگرام',url:links.telegram}],
  [{text:'✉️ پیامک، بله، اینستاگرام و بقیه',url:links.page}]
 ]};
}

const SVG={
 sms:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/></svg>',
 wa:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11.6a8.4 8.4 0 0 1-12.4 7.3L3.5 20l1.2-3.9A8.4 8.4 0 1 1 20 11.6Z"/><path d="M9 8.6c0 3.3 2.9 6.4 6.3 6.4l1-1.5-2-1-1 1c-1.2-.5-2.4-1.7-2.9-2.9l1-1-1-2-1.4 1Z"/></svg>',
 tg:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.4 3.6 2.9 10.8c-.9.4-.9 1.6.1 1.9l4.6 1.5 1.8 5.6c.3.8 1.3 1 1.9.4l2.6-2.5 4.7 3.5c.7.5 1.7.1 1.9-.8l3-14.6c.2-1-.8-1.8-1.7-1.4ZM9.6 14.6l-.4 4-1.4-4.6L18 7.5l-8.4 7.1Z"/></svg>',
 bale:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.5 11 15l4.5-5.5"/></svg>',
 ig:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".9" fill="currentColor"/></svg>',
 copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
 more:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>'
};

// /i/<slug>?r=<staff code>&to=<mobile>: the stylist's send page. Not indexed and not tracked as a
// visit; the text is built here from the salon's name, never taken from the address.
export async function sharePage(u,env){
 const slug=u.pathname.split('/')[2];
 const salon=env.DB?await env.DB.prepare('SELECT id,slug,name FROM salons WHERE slug=?').bind(slug).first().catch(()=>null):null;
 if(!salon)return null;
 const r=u.searchParams.get('r')||'';let member=null;
 if(STAFF_CODE.test(r))member=await env.DB.prepare('SELECT name,ref_code,is_manager FROM team WHERE salon_id=? AND ref_code=? AND active=1').bind(salon.id,r).first().catch(()=>null);
 let number=null;try{if(u.searchParams.get('to'))number=phone(u.searchParams.get('to'))}catch{}
 const origin=env.APP_ORIGIN||u.origin,L=shareLinks(origin,salon,member,number);
 const sms='sms:'+(number?local(number):'')+'?&body='+encodeURIComponent(L.both);
 const opt=(id,label,ic,bg,href)=>'<a class="opt" id="'+id+'" href="'+attr(href)+'"'+(href.startsWith('http')?' target="_blank" rel="noopener"':'')+'><span class="ic" style="background:'+bg+'">'+ic+'</span><span>'+label+'</span></a>';
 return '<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><meta name="theme-color" content="#e8edeb"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><title>فرستادن لینک «'+attr(salon.name)+'» | مزون عروس</title><style>'+baseCSS+
 '.wrap{max-width:460px;margin:0 auto;padding:28px 16px 40px;display:grid;gap:16px}h1{font-family:var(--display);font-size:22px;margin:0}.sub{color:var(--muted);font-size:13.5px;line-height:1.9;margin:0}'+
 '.card{background:var(--surface,#fff);border:1px solid var(--line-2);border-radius:18px;padding:14px;display:grid;gap:8px}.card b{font-size:13px;color:var(--muted)}.msg{white-space:pre-wrap;font-size:14px;line-height:1.9;overflow-wrap:anywhere}.to{direction:ltr;text-align:right;font-weight:800;font-size:16px}'+
 '.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.opt{display:grid;justify-items:center;gap:8px;padding:14px 6px;border:1px solid var(--line-2);border-radius:16px;background:var(--surface,#fff);color:var(--ink);font-size:13px;font-weight:700;text-align:center;cursor:pointer}'+
 '.ic{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;color:#fff}.ic svg{width:24px;height:24px}.note{font-size:12.5px;color:var(--muted);line-height:1.9;text-align:center;margin:0}'+
 '.toast{position:fixed;inset:auto 16px 20px;max-width:420px;margin:0 auto;background:var(--ink);color:#fff;border-radius:14px;padding:12px 16px;font-size:13.5px;text-align:center;opacity:0;transition:opacity .2s;pointer-events:none}.toast.on{opacity:1}'+
 '</style></head><body><main class="wrap">'+
 '<div><h1>فرستادن لینک «'+attr(salon.name)+'»</h1><p class="sub">'+(member&&!member.is_manager?'لینک اختصاصی '+attr(member.name)+'؛ هر کس با آن بیاید مشتری خودت حساب می‌شود. ':'')+'یکی از راه‌ها را بزن؛ پیام از گوشی خودت فرستاده می‌شود.</p></div>'+
 (number?'<div class="card"><b>برای</b><div class="to">'+attr(local(number))+'</div></div>':'')+
 '<div class="card"><b>متن پیام</b><div class="msg">'+attr(L.both)+'</div></div>'+
 '<div class="grid">'+
  opt('o-sms','پیامک',SVG.sms,'#6a7a75',sms)+
  opt('o-wa','واتساپ',SVG.wa,'#25a85a',L.whatsapp)+
  opt('o-tg','تلگرام',SVG.tg,'#2a9fd8',L.telegram)+
  opt('o-bale','بله',SVG.bale,'#1fa37a','#')+
  opt('o-ig','اینستاگرام',SVG.ig,'#c13584','#')+
  opt('o-copy','کپی متن',SVG.copy,'#4b3d33','#')+
 '</div>'+
 '<button class="btn btn--soft" id="o-more" type="button" hidden>'+SVG.more.replace('<svg','<svg width="18" height="18"')+'<span>بقیهٔ برنامه‌ها</span></button>'+
 '<p class="note">برای بله و اینستاگرام متن کپی می‌شود؛ در گفتگوی مشتری نگه دار و «چسباندن» را بزن.</p>'+
 '</main><div class="toast" id="toast" role="status"></div><script>'+
 'var T='+JSON.stringify(L.both).replace(/</g,'\\u003c')+';'+
 'function toast(m){var t=document.getElementById("toast");t.textContent=m;t.className="toast on";clearTimeout(window.__t);window.__t=setTimeout(function(){t.className="toast"},3500)}'+
 'function copy(){if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(T).then(function(){return true},function(){return old()});return Promise.resolve(old())}'+
 'function old(){var a=document.createElement("textarea");a.value=T;a.style.position="fixed";a.style.opacity="0";document.body.appendChild(a);a.select();var ok=false;try{ok=document.execCommand("copy")}catch(e){}a.remove();return ok}'+
 'function share(){if(navigator.share){navigator.share({text:T}).catch(function(){});return true}return false}'+
 'document.getElementById("o-copy").onclick=function(e){e.preventDefault();copy().then(function(ok){toast(ok?"متن کپی شد":"کپی نشد؛ متن بالا را نگه دار و کپی کن")})};'+
 'document.getElementById("o-bale").onclick=function(e){e.preventDefault();if(share())return;copy().then(function(){toast("متن کپی شد؛ در بله گفتگوی مشتری را باز کن و بچسبان");setTimeout(function(){location.href="https://web.bale.ai/"},900)})};'+
 'document.getElementById("o-ig").onclick=function(e){e.preventDefault();copy().then(function(){toast("متن کپی شد؛ در دایرکت مشتری بچسبان");setTimeout(function(){location.href="https://www.instagram.com/direct/inbox/"},900)})};'+
 'if(navigator.share){var m=document.getElementById("o-more");m.hidden=false;m.onclick=share}'+
 '</script></body></html>';
}
