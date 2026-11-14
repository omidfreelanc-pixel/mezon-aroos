import {landingRegistration} from './register.js';
// Home page: a sales page for boutique owners (the buyers); brides only reach it through the owners' own links. Self-contained (inline CSS/JS, own-origin assets only).
import {baseCSS,brandImg} from './design.js';
export const BOT_URL='https://t.me/mezon_aynehbot';
const css=String.raw`
body{overflow-x:hidden}
.top{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 0}
.top .brand{display:inline-flex;align-items:center;gap:8px;font-weight:800;font-family:var(--display);font-size:18px;color:var(--ink)}
.top .brand img{display:block;flex:none}
.top .btn{min-height:48px}
footer a{display:inline-flex;align-items:center;min-height:44px;padding:0 8px}
section{padding:34px 0}
.eyebrow{display:inline-block;font-size:12.5px;font-weight:700;color:var(--accent-ink);background:var(--accent-soft);padding:3px 12px;border-radius:var(--pill);margin-bottom:12px}
h1.display{font-size:clamp(30px,8.4vw,52px);line-height:1.3}
h2.display{font-size:clamp(24px,6.4vw,36px);margin-bottom:6px;line-height:1.4}
.sub-l{font-size:16px;line-height:1.9;color:var(--ink-2);margin-top:8px;max-width:30em}
.ic{width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;flex:none}
/* hero */
.hero{display:grid;gap:30px;padding-top:10px}
.hero__cta{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}
.hero__cta .btn{min-height:54px;font-size:16px;padding-inline:26px}
.hero__cta .btn--primary{flex:1 1 220px}.hero__cta .btn--ghost{flex:1 1 140px}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0 0;padding:0;list-style:none}
.chips li{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:700;color:var(--accent-ink);background:var(--surface);padding:7px 13px;border-radius:var(--pill);box-shadow:var(--lift)}
.chips .ic{width:17px;height:17px}
.stage{position:relative;width:min(100%,430px);margin-inline:auto;padding:0 0 14px}
.dev{position:relative;background:#16191a;border-radius:22px;padding:12px;box-shadow:0 26px 50px -18px rgba(10,30,30,.55),inset 0 0 0 1.5px rgba(255,255,255,.07)}
.dev::after{content:"";position:absolute;left:50%;top:5px;width:6px;height:6px;margin-left:-3px;border-radius:50%;background:#2c3335}
.dev .cmp{border-radius:12px}
.dev__stand{width:34%;height:46px;margin:-1px auto 0;background:linear-gradient(180deg,#262b2c,#141718);clip-path:polygon(18% 0,82% 0,100% 100%,0 100%)}
.dev__base{width:62%;height:9px;margin:0 auto;border-radius:99px;background:#1b1f20;box-shadow:0 10px 20px rgba(10,30,30,.3)}
.float{position:absolute;z-index:3;display:inline-flex;align-items:center;gap:8px;background:#fff;border-radius:99px;padding:8px 14px;font-size:13px;font-weight:800;color:var(--ink);box-shadow:0 10px 24px -8px rgba(10,30,30,.35)}
.float .ic{width:18px;height:18px;color:var(--accent)}
.float--a{top:12%;inset-inline-end:-6px}.float--b{bottom:20%;inset-inline-start:-6px}
.cmp{position:relative;aspect-ratio:3/5;overflow:hidden;background:var(--glass-2);direction:ltr;touch-action:pan-y;user-select:none;-webkit-user-select:none;cursor:ew-resize;--x:50%}
.cmp img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
.cmp__after{position:absolute;inset:0;clip-path:inset(0 calc(100% - var(--x)) 0 0)}
.cmp__line{position:absolute;top:0;bottom:0;left:var(--x);width:2px;margin-left:-1px;background:#fff;box-shadow:0 0 12px rgba(0,0,0,.3);pointer-events:none}
.cmp__grip{position:absolute;top:60%;left:var(--x);width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:#fff;display:grid;place-items:center;box-shadow:var(--lift);pointer-events:none;color:var(--ink)}
.cmp__grip svg{width:22px;height:22px}
.cmp__tag{position:absolute;bottom:26%;z-index:2;background:rgba(250,251,250,.94);padding:3px 12px;border-radius:999px;font-size:12px;font-weight:700;color:var(--ink-2);pointer-events:none}
.cmp__tag--b{right:14px}.cmp__tag--a{left:14px}
.cmp__range{position:absolute;inset:0;width:100%;height:100%;opacity:0;margin:0;cursor:ew-resize}
.cmp:focus-within{outline:3px solid var(--accent-ring);outline-offset:3px}
.cap{text-align:center;font-size:13px;color:var(--muted);margin-top:10px}
/* where it lives */
.where{display:grid;gap:12px;margin-top:20px}
.spot{background:var(--surface);border-radius:var(--r-lg);box-shadow:var(--lift);overflow:hidden}
.spot svg.art{display:block;width:100%;height:auto;background:linear-gradient(160deg,var(--accent-soft),var(--surface-2))}
.spot div{padding:14px 16px 16px}
.spot b{display:block;font-size:17px;margin-bottom:2px}
.spot span{color:var(--ink-2);font-size:14.5px}
/* feelings */
.feel{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px}
.feel div{padding:18px 14px;border-radius:var(--r-lg);background:var(--ink);color:#fff;text-align:center;display:grid;gap:8px;justify-items:center}
.feel div:nth-child(2),.feel div:nth-child(3){background:var(--accent)}
.feel .ic{width:34px;height:34px;color:#f3e3bd}
.feel b{font-size:19px;font-family:var(--display)}
.feel span{font-size:13.5px;color:rgba(255,255,255,.86);line-height:1.8}
/* why it pays */
.why{display:grid;gap:10px;margin-top:20px}
.why div{display:flex;gap:14px;align-items:center;padding:14px 16px;border-radius:var(--r);background:var(--surface);box-shadow:var(--lift)}
.why .ic{width:40px;height:40px;padding:9px;border-radius:12px;background:var(--accent-soft);color:var(--accent-ink);box-sizing:border-box}
.why b{display:block;font-size:16px}.why span{color:var(--ink-2);font-size:14px}
/* journey */
.path{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:22px 0 0;padding:0;list-style:none;position:relative}
.path li{display:grid;justify-items:center;gap:8px;text-align:center;font-size:13px;font-weight:700;position:relative}
.path .ic{width:52px;height:52px;padding:13px;border-radius:50%;background:var(--surface);box-shadow:var(--lift);color:var(--accent);box-sizing:border-box}
.path li:not(:last-child)::after{content:"";position:absolute;top:26px;inset-inline-end:-50%;width:100%;border-top:2px dashed var(--accent-ring);z-index:-1}
/* setup */
.set{display:grid;gap:10px;margin:20px 0 0;padding:0;list-style:none;counter-reset:s}
.set li{display:flex;gap:14px;align-items:center;padding:14px 16px;background:var(--surface);border-radius:var(--r);box-shadow:var(--lift);font-weight:600}
.set li::before{counter-increment:s;content:counter(s,persian);flex:none;width:34px;height:34px;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;font-weight:800}
/* trust strip */
.safe{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}
.safe span{display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border-radius:99px;background:var(--surface-2);border:1px solid var(--line-2);font-size:14px;font-weight:600;color:var(--ink-2)}
.safe .ic{width:20px;height:20px;color:var(--accent)}
.plan{padding:24px 20px;border-radius:var(--r-lg);background:var(--surface);box-shadow:var(--lift);border:1.5px solid var(--accent)}
.plan h3{font-size:20px;margin-bottom:10px}
.plan ul{margin:0 0 16px;padding:0;list-style:none;display:grid;gap:8px}
.plan li{display:flex;gap:10px;align-items:flex-start;color:var(--ink-2);font-size:15px}
.plan li::before{content:"✓";flex:none;color:var(--accent);font-weight:800}
.plan .btn{min-height:54px;font-size:16px;width:100%}
.plan small{display:block;margin-top:10px;color:var(--muted);line-height:1.8}
details{background:var(--surface);border-radius:var(--r-sm);padding:0 16px;margin-top:10px;box-shadow:var(--lift)}
summary{cursor:pointer;min-height:52px;display:flex;align-items:center;font-weight:700;list-style:none}
summary::-webkit-details-marker{display:none}
summary::after{content:"+";margin-inline-start:auto;font-size:22px;color:var(--accent)}
details[open] summary::after{content:"−"}
details p{padding:0 0 16px;color:var(--ink-2)}
.final{background:var(--ink);color:#fff;border-radius:var(--r-lg);padding:34px 22px;text-align:center}
.final h2{color:#fff}.final p{color:rgba(255,255,255,.86);margin:10px auto 20px;max-width:30em;line-height:1.9}
.final .btn--primary{background:#fff;color:var(--ink);min-height:54px;font-size:16px;padding-inline:30px}
.final .btn--primary:hover{background:var(--accent-soft)}
.final__alt{margin-top:14px;font-size:14px}.final__alt a{color:#fff;text-decoration:underline;display:inline-flex;align-items:center;min-height:44px}
footer{padding:28px 0 48px;color:var(--muted);font-size:13px;display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;justify-content:space-between;border-top:1px solid var(--line)}
footer a{color:var(--accent-ink);font-weight:600;text-decoration:underline}
@media(min-width:820px){
 section{padding:56px 0}
 .hero{grid-template-columns:1.05fr .95fr;align-items:center;gap:56px;padding-top:28px}
 .where{grid-template-columns:repeat(3,1fr)}
 .feel{grid-template-columns:repeat(4,1fr)}
 .why{grid-template-columns:repeat(2,1fr)}
 .plan{padding:32px;display:grid;grid-template-columns:1.2fr 1fr;gap:28px;align-items:center}
 .final{padding:56px 40px}
 .path .ic{width:64px;height:64px;padding:16px}.path li{font-size:15px}.path li:not(:last-child)::after{top:32px}
}
`;
const grip='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 8 5 12l4 4M15 8l4 4-4 4"/></svg>';
const js=String.raw`(function(){var c=document.getElementById('cmp'),r=document.getElementById('cmpr');if(!c||!r)return;function set(v){c.style.setProperty('--x',v+'%')}
r.addEventListener('input',function(){set(r.value)});
var d=false;function mv(e){var b=c.getBoundingClientRect();var v=Math.max(0,Math.min(100,(e.clientX-b.left)/b.width*100));r.value=v;set(v)}
c.addEventListener('pointerdown',function(e){d=true;mv(e)});c.addEventListener('pointermove',function(e){if(d)mv(e)});
['pointerup','pointercancel','pointerleave'].forEach(function(n){c.addEventListener(n,function(){d=false})});
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){var t=0,i=setInterval(function(){t+=1;if(t>40||d){clearInterval(i);return}var v=50+Math.sin(t/40*Math.PI*2)*18;r.value=v;set(v)},40);r.addEventListener('input',function(){clearInterval(i)})}})();`;
const P={tv:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',tablet:'<rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="M11 18.5h2"/>',heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',users:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.4 2.7-5.5 6-5.5s6 2.1 6 5.5"/><circle cx="17" cy="9" r="2.4"/><path d="M17 14.4c2.4 0 4 1.6 4 4.1"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',lock:'<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',camera:'<path d="M4 8h3l1.6-2.5h6.8L17 8h3v11H4z"/><circle cx="12" cy="13.5" r="3.4"/>',dress:'<path d="M9 3l3 3 3-3 1 6-2 3 3 9H7l3-9-2-3z"/>',chat:'<path d="M4 5h16v11H9l-5 4z"/>',chart:'<path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6"/>',eye:'<path d="M2 12s3.7-7 10-7 10 7 10 7-3.7 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',trash:'<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',shield:'<path d="M12 3l8 3v6c0 4.6-3.2 7.8-8 9-4.8-1.2-8-4.4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',smile:'<circle cx="12" cy="12" r="9"/><path d="M8 14.5c1 1.6 2.4 2.4 4 2.4s3-.8 4-2.4M9 9.5h.01M15 9.5h.01"/>',wifi:'<path d="M3 9a14 14 0 0 1 18 0M6 12.5a9.5 9.5 0 0 1 12 0M9.3 16a5 5 0 0 1 5.4 0M12 19.5h.01"/>'};
const ic=n=>'<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">'+P[n]+'</svg>';
const art={
 tv:'<svg class="art" viewBox="0 0 320 170" aria-hidden="true"><rect x="40" y="18" width="240" height="124" rx="10" fill="#16191a"/><rect x="48" y="26" width="224" height="108" rx="5" fill="#e9efec"/><rect x="132" y="34" width="56" height="92" rx="28" fill="#d9c9a4"/><path d="M146 126l14-44 14 44z" fill="#fff"/><rect x="146" y="142" width="28" height="10" fill="#2b3234"/><rect x="118" y="150" width="84" height="6" rx="3" fill="#2b3234"/></svg>',
 stand:'<svg class="art" viewBox="0 0 320 170" aria-hidden="true"><rect x="120" y="10" width="80" height="128" rx="9" fill="#16191a"/><rect x="126" y="17" width="68" height="114" rx="5" fill="#e9efec"/><rect x="146" y="30" width="28" height="68" rx="14" fill="#d9c9a4"/><path d="M152 100l8-26 8 26z" fill="#fff"/><rect x="154" y="138" width="12" height="16" fill="#2b3234"/><rect x="128" y="152" width="64" height="8" rx="4" fill="#2b3234"/><path d="M60 156h40M220 156h40" stroke="#c8d1ce" stroke-width="3" stroke-linecap="round"/></svg>',
 tablet:'<svg class="art" viewBox="0 0 320 170" aria-hidden="true"><rect x="30" y="118" width="260" height="36" rx="6" fill="#c8b48a"/><rect x="104" y="34" width="112" height="86" rx="9" fill="#16191a" transform="rotate(-6 160 77)"/><rect x="110" y="40" width="100" height="74" rx="4" fill="#e9efec" transform="rotate(-6 160 77)"/><rect x="144" y="50" width="26" height="56" rx="13" fill="#d9c9a4" transform="rotate(-6 160 77)"/><circle cx="244" cy="104" r="9" fill="#2b3234"/><rect x="236" y="112" width="16" height="8" fill="#2b3234"/></svg>'
};
const faq=[
 ['برای نمایش در مزون چه چیزی لازم دارم؟','یک تبلت، تلویزیون هوشمند یا هر صفحه‌ای که مرورگر و اینترنت دارد. صفحهٔ مزون شما را باز می‌گذارید و مشتری همان‌جا از خودش عکس می‌گیرد. برنامه‌ای نصب نمی‌شود.'],
 ['لباس‌های مزون را چطور وارد می‌کنم؟','عکس لباس‌ها را با نامشان در ربات تلگرام مزون آینه می‌فرستید. برای نتیجهٔ دقیق‌تر از هر لباس چند نما (جلو، کنار، پشت، جزئیات) بفرستید. هر وقت خواستید لباس اضافه یا حذف می‌کنید.'],
 ['مشتری فقط لباس‌های مزون من را می‌بیند؟','بله. فقط لباس‌هایی که شما اضافه کرده‌اید نمایش داده می‌شود و مشتری روی همان‌ها خودش را می‌بیند.'],
 ['با عکس مشتری‌ها چه می‌شود؟','عکس‌هایی که برای درخواست فرستاده نمی‌شوند ۱۵ دقیقه بعد خودکار پاک می‌شوند و مشتری می‌تواند همان لحظه خودش هم پاکشان کند. عکس مشتری جایی نمایش عمومی ندارد.'],
 ['لباس در نتیجه دقیقاً همان لباس است؟','هدف همین است: لباس شما روی عکس مشتری نشانده می‌شود و چهره و اندامش حفظ می‌شود. نتیجه یک شبیه‌سازی برای تصمیم‌گیری اولیه است و رنگ، پارچه و دوخت نهایی را با پرو حضوری تأیید می‌کنید.'],
 ['اگر مشتری علاقه‌مند شد چه؟','مشتری می‌تواند درخواستش را با نام و شماره ثبت کند و در ربات تلگرام و پنل مزون به شما می‌رسد. بعد از پیگیری، وضعیتش را ثبت می‌کنید.'],
 ['هزینه چقدر است؟','برای امتحان، یک نسخهٔ آزمایشی رایگان دارید. قیمت بسته‌ها هنگام ثبت‌نام اعلام می‌شود و تا وقتی تأیید نکنید پرداختی ندارید.']
];
const title='پرو مجازی لباس عروس داخل مزون | روی تبلت، تلویزیون یا استند · مزون آینه';
const desc='مشتری شما داخل مزون، روی تبلت، تلویزیون یا استند، خودش را در لباس‌های مزون شما می‌بیند. بدون نصب برنامه؛ نسخهٔ آزمایشی رایگان.';
const ogImg='/og.jpg';
const ld=o=>'<script type="application/ld+json">'+JSON.stringify(o).replace(/</g,'\\u003c')+'</script>';
const jsonld=o=>ld({'@context':'https://schema.org','@graph':[
 {'@type':'Organization','@id':o+'/#org','name':'مزون آینه','alternateName':'Mezon Aynehe','url':o+'/','logo':o+'/icon-512.png','sameAs':[BOT_URL]},
 {'@type':'WebSite','@id':o+'/#site','url':o+'/','name':'مزون آینه','inLanguage':'fa-IR','publisher':{'@id':o+'/#org'}},
 {'@type':'SoftwareApplication','name':'مزون آینه','applicationCategory':'BusinessApplication','operatingSystem':'Web (موبایل و دسکتاپ)','inLanguage':'fa-IR','url':o+'/','description':desc,'image':o+ogImg,'publisher':{'@id':o+'/#org'}},
 {'@type':'FAQPage','inLanguage':'fa-IR','mainEntity':faq.map(([q,a])=>({'@type':'Question','name':q,'acceptedAnswer':{'@type':'Answer','text':a}}))}
]});
export const landingFor=o=>'<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#e8edeb"><meta name="color-scheme" content="light"><title>'+title+'</title><meta name="description" content="'+desc+'"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="'+o+'/"><link rel="alternate" hreflang="fa" href="'+o+'/"><link rel="alternate" hreflang="x-default" href="'+o+'/"><meta property="og:title" content="'+title+'"><meta property="og:description" content="'+desc+'"><meta property="og:type" content="website"><meta property="og:url" content="'+o+'/"><meta property="og:image" content="'+o+ogImg+'"><meta property="og:image:alt" content="لوگوی مزون آینه؛ لباس عروس را روی اندام خودت ببین"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:site_name" content="مزون آینه"><meta property="og:locale" content="fa_IR"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="'+title+'"><meta name="twitter:description" content="'+desc+'"><meta name="twitter:image" content="'+o+ogImg+'">'+jsonld(o)+'<link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/manifest.webmanifest"><link rel="preload" href="/fonts/vazirmatn-arabic.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/fonts/estedad-arabic.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/catalog/dress/demo-after.webp" as="image"><style>'+baseCSS+css+`
.landing-registration{max-width:580px}
.landing-registration .card{padding:clamp(16px,4vw,30px);border:1px solid #d6dfdb;border-radius:22px;background:#fff}
.landing-registration label,.landing-registration label small,.landing-registration .ferr{display:block}
.landing-registration label{margin-block:12px}
.landing-registration input:not([type=checkbox]){display:block;width:100%;padding:10px;border:1px solid #a8bbb4;border-radius:8px;font:inherit}
.landing-registration .ltr{direction:ltr;text-align:left}
.landing-registration .pw button{font:inherit}
.landing-registration .grp+.grp{border-top:1px solid #d6dfdb;padding-top:14px}
.landing-registration .draw-check{display:block;width:72px;margin:auto}
.landing-registration .msg{margin-top:12px}
.landing-registration .bad,.landing-registration .ferr{color:#952525}
.landing-registration a{overflow-wrap:anywhere}
.landing-registration [hidden]{display:none!important}
`+'</style></head><body>'
+'<a class="skip" href="#main">پرش به محتوای اصلی</a>'
+'<div class="wrap"><header class="top"><a class="brand" href="/" aria-label="مزون آینه">'+brandImg(36)+'<span>مزون آینه</span></a><a class="btn btn--primary" href="#start">ساخت صفحهٔ مزون</a></header>'
+'<main id="main">'
+'<section class="hero" aria-labelledby="h1"><div><span class="eyebrow">آینهٔ هوشمند داخل مزون</span><h1 class="display" id="h1">مشتری شما، همان‌جا در مزون، خودش را در لباس‌های شما می‌بیند</h1><p class="sub-l">یک تبلت، تلویزیون یا استند کنار مشاور؛ بدون نصب برنامه.</p><div class="hero__cta"><a class="btn btn--primary" href="#start">ساخت صفحهٔ مزون</a><a class="btn btn--ghost" href="/s/demo">امتحان نمونه</a></div><ul class="chips"><li>'+ic('dress')+'لباس‌های خود شما</li><li>'+ic('clock')+'حدود یک دقیقه</li><li>'+ic('lock')+'عکس خودکار پاک می‌شود</li></ul></div>'
+'<div class="stage"><span class="float float--a">'+ic('spark')+'چهرهٔ خودش، لباس شما</span><span class="float float--b">'+ic('heart')+'همین‌جا، بدون پرو سنگین</span><div class="dev"><div class="cmp" id="cmp"><img src="/catalog/dress/demo-before.webp" alt="عکس مشتری پیش از پرو" width="480" height="720"><div class="cmp__after"><img src="/catalog/dress/demo-after.webp" alt="همان عکس با لباس مزون" width="480" height="720" fetchpriority="high"></div><span class="cmp__line"></span><span class="cmp__grip">'+grip+'</span><span class="cmp__tag cmp__tag--b">قبل</span><span class="cmp__tag cmp__tag--a">بعد</span><input class="cmp__range" id="cmpr" type="range" min="0" max="100" value="50" dir="ltr" aria-label="مقایسهٔ قبل و بعد؛ با کلیدهای جهت خط را جابه‌جا کن"></div></div><div class="dev__stand"></div><div class="dev__base"></div><p class="cap">این چیزی است که مشتری شما روی صفحه می‌بیند</p></div></section>'
+'<section aria-labelledby="where"><span class="eyebrow">کجا بگذارید؟</span><h2 class="display" id="where">هر جا که مشتری نگاه می‌کند</h2><img src="/demo/salon-setup.webp" alt="نمایش پرو مجازی لباس عروس در مزون" width="1536" height="1024" loading="lazy" style="width:100%;height:auto;border-radius:20px;margin-bottom:16px"><div class="where"><div class="spot">'+art.tv+'<div><b>تلویزیون روی دیوار</b><span>مشتری و همراهانش با هم روی صفحهٔ بزرگ می‌بینند.</span></div></div><div class="spot">'+art.stand+'<div><b>استند کنار ورودی</b><span>اولین چیزی که مشتری جدید می‌بیند.</span></div></div><div class="spot">'+art.tablet+'<div><b>تبلت روی میز مشاور</b><span>مشاور کنار مشتری، لباس‌ها را با او مرور می‌کند.</span></div></div></div></section>'
+'<section aria-labelledby="why"><span class="eyebrow">چرا داخل مزون جواب می‌دهد</span><h2 class="display" id="why">برای شما چه چیزی عوض می‌شود؟</h2><div class="why"><div>'+ic('dress')+'<p><b>پرو حضوری هدفمندتر</b><span>مشتری با چند لباس مورد علاقه سراغ پرو می‌رود.</span></p></div><div>'+ic('users')+'<p><b>همراهان هم شریک می‌شوند</b><span>خانواده روی صفحه می‌بینند و تصمیم سریع‌تر می‌شود.</span></p></div><div>'+ic('clock')+'<p><b>وقت مشاور آزاد می‌شود</b><span>هر لباس را لازم نیست از قفسه بیاورد و بپوشاند.</span></p></div><div>'+ic('chart')+'<p><b>بدانید چه چیزی دیده می‌شود</b><span>آمار نشان می‌دهد کدام لباس‌ها بیشتر امتحان می‌شوند.</span></p></div><div>'+ic('chat')+'<p><b>درخواست آماده</b><span>مشتری علاقه‌مند، اسم و شمارهٔ خودش را می‌گذارد.</span></p></div><div>'+ic('eye')+'<p><b>مزون شما دیده می‌شود</b><span>تجربه‌ای که مشتری برای دوستانش تعریف می‌کند.</span></p></div></div></section>'
+'<section aria-labelledby="path"><span class="eyebrow">تجربهٔ مشتری</span><h2 class="display" id="path">یک دقیقه، چهار حرکت</h2><ol class="path"><li>'+ic('camera')+'عکس بگیر</li><li>'+ic('dress')+'لباس را انتخاب کن</li><li>'+ic('eye')+'خودت را ببین</li><li>'+ic('heart')+'حضوری بپوش</li></ol></section>'
+'<section aria-labelledby="setup"><span class="eyebrow">راه‌اندازی</span><h2 class="display" id="setup">سه قدم تا روشن شدن صفحه</h2><ol class="set"><li>فرم همین صفحه را تکمیل کنید و عکس لباس‌ها را در تلگرام بفرستید</li><li>صفحهٔ مزونتان را روی تبلت یا تلویزیون باز کنید</li><li>مشتری را کنار صفحه بنشانید؛ تمام!</li></ol></section>'
+'<section aria-labelledby="priv"><span class="eyebrow">اعتماد</span><h2 class="display" id="priv">مشتری با خیال راحت عکس می‌گیرد</h2><div class="safe"><span>'+ic('trash')+'عکس بعد از ۱۵ دقیقه پاک می‌شود</span><span>'+ic('lock')+'جایی نمایش عمومی ندارد</span><span>'+ic('trash')+'خودش هم می‌تواند فوری پاک کند</span><span>'+ic('shield')+'نتیجه شبیه‌سازی است؛ پرو حضوری نهایی است</span></div></section>'
+'<section id="owners" aria-labelledby="start"><h2 class="display" id="start">صفحهٔ مزونتان را بسازید</h2><p class="sub-l">رایگان شروع کنید. شمارهٔ موبایل را وارد کنید تا تیم مزون آینه برای فعال‌سازی با شما تماس بگیرد.</p><div class="landing-registration">'+landingRegistration+'</div></section>'
+'<section aria-labelledby="faq"><h2 class="display" id="faq">سؤال‌های مزون‌دارها</h2>'+faq.map(([q,a])=>'<details><summary>'+q+'</summary><p>'+a+'</p></details>').join('')+'</section>'
+'</main><footer><span>© مزون آینه</span><span><a href="/s/demo">نمونه</a> · <a href="#start">ثبت‌نام مدیر مزون</a> · <a href="/privacy">قوانین و حریم خصوصی</a> · <a href="'+BOT_URL+'" rel="noopener">ربات تلگرام</a></span></footer></div><script>'+js+'</script></body></html>';
export const landingHTML=landingFor('');
