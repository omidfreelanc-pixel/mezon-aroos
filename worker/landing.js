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
.hero__cta .btn--ghost{flex:1 1 140px}
.hero__note,.cmp-hint{line-height:1.8}
.owner .btn--ghost{min-height:48px}
.owner__alt{margin-top:14px;font-size:14px}
.owner__note{margin-top:12px;font-size:14px;font-weight:600}
.sub{font-size:20px;margin-top:30px}
.owner__alt a{color:#fff;text-decoration:underline;display:inline-flex;align-items:center;min-height:44px}
.proof{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;padding:0;list-style:none}
.proof li{font-size:13px;font-weight:600;color:var(--accent-ink);background:var(--surface);padding:6px 12px;border-radius:var(--pill);box-shadow:var(--lift)}
section{padding:36px 0}
.eyebrow{display:inline-block;font-size:12.5px;font-weight:700;color:var(--accent-ink);background:var(--accent-soft);padding:3px 12px;border-radius:var(--pill);margin-bottom:12px}
h1.display{font-size:clamp(30px,8.6vw,52px);line-height:1.3}
h2.display{font-size:clamp(24px,6.4vw,34px);margin-bottom:10px}
.lead{font-size:16.5px;line-height:2;color:var(--ink-2);margin-top:14px;max-width:34em}
.hero{display:grid;gap:28px;padding-top:12px}
.hero__cta{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}
.hero__cta .btn{min-height:54px;font-size:16px;padding-inline:26px}
.hero__cta .btn--primary{flex:1 1 220px}
.hero__note{margin-top:12px;font-size:13px;color:var(--muted)}
.cmp-wrap{width:min(100%,380px);margin-inline:auto}
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
.cmp-hint{text-align:center;font-size:13px;color:var(--muted);margin-top:12px}
.steps{display:grid;gap:12px;margin:18px 0 0;padding:0;list-style:none;counter-reset:s}
.steps li{display:flex;gap:14px;align-items:flex-start;padding:16px;background:var(--surface);border-radius:var(--r);box-shadow:var(--lift)}
.steps li::before{counter-increment:s;content:counter(s,persian);flex:none;width:36px;height:36px;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;font-weight:800}
.steps b{display:block;font-size:16.5px;margin-bottom:2px}
.steps span{color:var(--ink-2);font-size:14.5px}
.ben{display:grid;gap:12px;margin-top:18px}
.ben div{padding:18px;border-radius:var(--r);background:var(--surface-2);border:1px solid var(--line-2)}
.ben b{display:block;font-size:16.5px;margin-bottom:4px;color:var(--accent-ink)}
.ben p{color:var(--ink-2);font-size:14.5px}
.owner{background:var(--ink);color:#fff;border-radius:var(--r-lg);padding:26px 20px}
.owner h2{color:#fff}
.owner p,.owner li{color:rgba(255,255,255,.86);font-size:15px}
.owner ol{list-style:persian;margin:16px 0 22px;padding-inline-start:22px;display:grid;gap:8px}
.owner .btn--primary{background:#fff;color:var(--ink);min-height:54px;font-size:16px}
.owner .btn--primary:hover{background:var(--accent-soft)}
.trust{display:grid;gap:10px;margin-top:14px}
.trust p{display:flex;gap:10px;align-items:flex-start;color:var(--ink-2)}
.trust p::before{content:"";flex:none;width:8px;height:8px;border-radius:50%;background:var(--accent);margin-top:12px}
details{background:var(--surface);border-radius:var(--r-sm);padding:0 16px;margin-top:10px;box-shadow:var(--lift)}
summary{cursor:pointer;min-height:52px;display:flex;align-items:center;font-weight:700;list-style:none}
summary::-webkit-details-marker{display:none}
summary::after{content:"+";margin-inline-start:auto;font-size:22px;color:var(--accent)}
details[open] summary::after{content:"−"}
details p{padding:0 0 16px;color:var(--ink-2)}
footer{padding:28px 0 48px;color:var(--muted);font-size:13px;display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;justify-content:space-between;border-top:1px solid var(--line)}
footer a{color:var(--accent-ink);font-weight:600;text-decoration:underline}
.pain{display:grid;gap:10px;margin:18px 0 0;padding:0;list-style:none}
.pain li{display:flex;gap:12px;align-items:flex-start;padding:14px 16px;border-radius:var(--r);background:var(--surface-2);border:1px solid var(--line-2);color:var(--ink-2);font-size:15px;line-height:1.9}
.pain li::before{content:"";flex:none;width:8px;height:8px;border-radius:50%;background:#b9975b;margin-top:12px}
.val{display:grid;gap:12px;margin-top:18px}
.val>div{padding:20px;border-radius:var(--r);background:var(--surface);box-shadow:var(--lift)}
.val b{display:block;font-size:17px;margin-bottom:6px;color:var(--accent-ink)}
.val p{color:var(--ink-2);font-size:14.5px;line-height:1.9}
.lead-demo{display:grid;gap:22px;align-items:center}
.lcard{background:var(--surface);border-radius:var(--r-lg);box-shadow:var(--lift);padding:16px;display:grid;gap:14px;max-width:420px;width:100%;margin-inline:auto;position:relative}
.lcard__tag{position:absolute;top:-11px;inset-inline-start:16px;background:var(--ink);color:#fff;font-size:12px;font-weight:700;padding:3px 12px;border-radius:99px}
.lcard__imgs{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.lcard__imgs figure{margin:0;position:relative;border-radius:14px;overflow:hidden;aspect-ratio:3/4;background:var(--glass-2)}
.lcard__imgs img{width:100%;height:100%;object-fit:cover;display:block}
.lcard__imgs figcaption{position:absolute;bottom:8px;inset-inline-start:8px;background:rgba(250,251,250,.94);padding:2px 10px;border-radius:99px;font-size:12px;font-weight:700}
.lcard dl{margin:0;display:grid;gap:8px}
.lcard dl div{display:flex;justify-content:space-between;gap:10px;font-size:14.5px;padding-bottom:8px;border-bottom:1px dashed var(--line)}
.lcard dt{color:var(--muted)}.lcard dd{margin:0;font-weight:700}
.lcard__st{display:flex;gap:8px;flex-wrap:wrap}
.lcard__st span{font-size:12.5px;font-weight:700;padding:5px 12px;border-radius:99px;background:var(--accent-soft);color:var(--accent-ink)}
.lcard__st span.on{background:var(--accent);color:#fff}
.ways{display:grid;gap:12px;margin-top:18px}
.ways>div{padding:20px;border-radius:var(--r);border:1px solid var(--line-2);background:var(--surface-2)}
.ways b{display:block;font-size:17px;margin-bottom:6px}
.ways p{color:var(--ink-2);font-size:14.5px;line-height:1.9}
.ways .chip{display:inline-block;margin-top:10px;font-size:12.5px;font-weight:700;color:var(--accent-ink);background:var(--accent-soft);padding:3px 12px;border-radius:99px}
.plan{padding:24px 20px;border-radius:var(--r-lg);background:var(--surface);box-shadow:var(--lift);border:1.5px solid var(--accent)}
.plan h3{font-size:20px;margin-bottom:10px}
.plan ul{margin:0 0 16px;padding:0;list-style:none;display:grid;gap:8px}
.plan li{display:flex;gap:10px;align-items:flex-start;color:var(--ink-2);font-size:15px}
.plan li::before{content:"✓";flex:none;color:var(--accent);font-weight:800}
.plan .btn{min-height:54px;font-size:16px;width:100%}
.plan small{display:block;margin-top:10px;color:var(--muted);line-height:1.8}
.final{background:var(--ink);color:#fff;border-radius:var(--r-lg);padding:34px 22px;text-align:center}
.final h2{color:#fff}.final p{color:rgba(255,255,255,.86);margin:10px auto 20px;max-width:30em;line-height:1.9}
.final .btn--primary{background:#fff;color:var(--ink);min-height:54px;font-size:16px;padding-inline:30px}
.final .btn--primary:hover{background:var(--accent-soft)}
.final__alt{margin-top:14px;font-size:14px}.final__alt a{color:#fff;text-decoration:underline;display:inline-flex;align-items:center;min-height:44px}
@media(min-width:820px){
 .val{grid-template-columns:repeat(2,1fr)}
 .lead-demo{grid-template-columns:1fr 1fr;gap:48px}
 .ways{grid-template-columns:repeat(2,1fr)}
 .plan{padding:32px;display:grid;grid-template-columns:1.2fr 1fr;gap:28px;align-items:center}
 .final{padding:56px 40px}
 .hero{grid-template-columns:1.1fr .9fr;align-items:center;gap:48px;padding-top:28px}
 .steps,.ben{grid-template-columns:repeat(3,1fr)}
 .steps li{flex-direction:column}
 .owner{padding:40px}
 section{padding:56px 0}
}
`;
const grip='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 8 5 12l4 4M15 8l4 4-4 4"/></svg>';
const js=String.raw`(function(){var c=document.getElementById('cmp'),r=document.getElementById('cmpr');if(!c||!r)return;function set(v){c.style.setProperty('--x',v+'%')}
r.addEventListener('input',function(){set(r.value)});
var d=false;function mv(e){var b=c.getBoundingClientRect();var v=Math.max(0,Math.min(100,(e.clientX-b.left)/b.width*100));r.value=v;set(v)}
c.addEventListener('pointerdown',function(e){d=true;mv(e)});c.addEventListener('pointermove',function(e){if(d)mv(e)});
['pointerup','pointercancel','pointerleave'].forEach(function(n){c.addEventListener(n,function(){d=false})});
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){var t=0,i=setInterval(function(){t+=1;if(t>40||d){clearInterval(i);return}var v=50+Math.sin(t/40*Math.PI*2)*18;r.value=v;set(v)},40);r.addEventListener('input',function(){clearInterval(i)})}})();`;
const faq=[
 ['عروس‌ها چطور به صفحهٔ مزون من می‌رسند؟','شما یک لینک و QR اختصاصی می‌گیرید. لینک را در اینستاگرام، واتساپ یا پیام‌های مشتری بگذارید و QR را روی تبلت یا میز مزون قرار دهید. عروس بدون نصب برنامه، در مرورگر گوشی‌اش صفحه را باز می‌کند.'],
 ['لباس‌های مزون چطور وارد می‌شوند؟','عکس لباس‌ها را در ربات تلگرام مزون آینه می‌فرستید، با نام هر لباس. برای نتیجهٔ دقیق‌تر از هر لباس چند نما (جلو، کنار، پشت، جزئیات) بفرستید. لباس‌ها را خودتان هر وقت خواستید اضافه یا حذف می‌کنید.'],
 ['درخواست‌ها را از کجا می‌بینم؟','هر بار عروس نتیجه را برای مزون بفرستد، درخواستش با عکس قبل و بعد، اسم، شمارهٔ تماس و لباس انتخابی در ربات تلگرام و پنل مزون به شما می‌رسد و وضعیتش را همان‌جا تغییر می‌دهید.'],
 ['لباس در نتیجه دقیقاً همان لباس مزون است؟','هدف همین است: لباسی که شما داده‌اید روی عکس عروس نشانده می‌شود و چهره و اندامش حفظ می‌شود. نتیجه یک شبیه‌سازی برای تصمیم‌گیری اولیه است و رنگ، پارچه و دوخت نهایی را با پرو حضوری تأیید می‌کنید.'],
 ['با عکس عروس‌ها چه می‌شود؟','عکس‌هایی که برای درخواست فرستاده نمی‌شوند ۱۵ دقیقه بعد خودکار پاک می‌شوند و عروس هم می‌تواند خودش همان لحظه عکس‌هایش را پاک کند. عکس عروس جایی نمایش عمومی ندارد و فقط عکس‌های درخواست‌های ارسال‌شده به مزون می‌رسد.'],
 ['هزینه چقدر است؟','برای امتحان، یک نسخهٔ آزمایشی رایگان دارید. قیمت بسته‌ها هنگام ثبت‌نام اعلام می‌شود و تا وقتی تأیید نکنید چیزی پرداخت نمی‌کنید.'],
 ['اگر عروس حضوری آمد چه؟','می‌توانید همان صفحه را روی تبلت مزون باز بگذارید؛ عروس در دوربین داخل صفحه عکس می‌گیرد و پیش از پرو حضوری چند لباس را روی خودش می‌بیند.'],
 ['نیاز به نصب برنامه یا تیم فنی دارم؟','نه. ثبت‌نام یک فرم کوتاه است و مدیریت لباس‌ها و درخواست‌ها از تلگرام انجام می‌شود. صفحهٔ مزون شما بعد از تأیید حساب فعال می‌شود.']
];
const title='پرو مجازی لباس عروس برای مزون‌ها | مشتری آماده بگیرید · مزون آینه';
const desc='عروس‌ها لباس‌های مزون شما را روی عکس خودشان می‌بینند و با اسم، شماره و مدل انتخابی برای شما درخواست می‌فرستند. بدون نصب برنامه؛ نسخهٔ آزمایشی رایگان.';
const ogImg='/og.jpg';
const ld=o=>'<script type="application/ld+json">'+JSON.stringify(o).replace(/</g,'\\u003c')+'</script>';
const jsonld=o=>ld({'@context':'https://schema.org','@graph':[
 {'@type':'Organization','@id':o+'/#org','name':'مزون آینه','alternateName':'Mezon Aynehe','url':o+'/','logo':o+'/icon-512.png','sameAs':[BOT_URL]},
 {'@type':'WebSite','@id':o+'/#site','url':o+'/','name':'مزون آینه','inLanguage':'fa-IR','publisher':{'@id':o+'/#org'}},
 {'@type':'SoftwareApplication','name':'مزون آینه','applicationCategory':'BusinessApplication','operatingSystem':'Web (موبایل و دسکتاپ)','inLanguage':'fa-IR','url':o+'/','description':desc,'image':o+ogImg,'publisher':{'@id':o+'/#org'}},
 {'@type':'FAQPage','inLanguage':'fa-IR','mainEntity':faq.map(([q,a])=>({'@type':'Question','name':q,'acceptedAnswer':{'@type':'Answer','text':a}}))}
]});
export const landingFor=o=>'<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#e8edeb"><meta name="color-scheme" content="light"><title>'+title+'</title><meta name="description" content="'+desc+'"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="'+o+'/"><link rel="alternate" hreflang="fa" href="'+o+'/"><link rel="alternate" hreflang="x-default" href="'+o+'/"><meta property="og:title" content="'+title+'"><meta property="og:description" content="'+desc+'"><meta property="og:type" content="website"><meta property="og:url" content="'+o+'/"><meta property="og:image" content="'+o+ogImg+'"><meta property="og:image:alt" content="لوگوی مزون آینه؛ لباس عروس را روی اندام خودت ببین"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:site_name" content="مزون آینه"><meta property="og:locale" content="fa_IR"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="'+title+'"><meta name="twitter:description" content="'+desc+'"><meta name="twitter:image" content="'+o+ogImg+'">'+jsonld(o)+'<link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/manifest.webmanifest"><link rel="preload" href="/fonts/vazirmatn-arabic.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/fonts/estedad-arabic.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/catalog/dress/demo-after.webp" as="image"><style>'+baseCSS+css+'</style></head><body>'
+'<a class="skip" href="#main">پرش به محتوای اصلی</a>'
+'<div class="wrap"><header class="top"><a class="brand" href="/" aria-label="مزون آینه">'+brandImg(36)+'<span>مزون آینه</span></a><a class="btn btn--primary" href="/register">شروع آزمایشی رایگان</a></header>'
+'<main id="main">'
+'<section class="hero" aria-labelledby="h1"><div><span class="eyebrow">برای مزون‌دارها</span><h1 class="display" id="h1">عروس‌ها لباس شما را روی خودشان می‌بینند؛ شما مشتری آماده می‌گیرید</h1><p class="lead">مزون آینه پرو مجازی لباس عروس برای مزون شماست. عروس عکس خودش را می‌دهد، لباس‌های شما را روی اندام خودش می‌بیند و با اسم، شماره و مدل انتخابی‌اش برای شما درخواست می‌فرستد.</p><div class="hero__cta"><a class="btn btn--primary" href="/register">شروع آزمایشی رایگان</a><a class="btn btn--ghost" href="/s/demo">خودتان امتحان کنید</a></div><ul class="proof"><li>بدون نصب برنامه</li><li>با لباس‌های خود شما</li><li>درخواست‌ها در تلگرام</li></ul></div>'
+'<div class="cmp-wrap"><div class="mirror"><div class="cmp" id="cmp"><img src="/catalog/dress/demo-before.webp" alt="عکس عروس پیش از پرو" width="480" height="720"><div class="cmp__after"><img src="/catalog/dress/demo-after.webp" alt="همان عکس با لباس عروس انتخاب‌شده" width="480" height="720" fetchpriority="high"></div><span class="cmp__line"></span><span class="cmp__grip">'+grip+'</span><span class="cmp__tag cmp__tag--b">قبل</span><span class="cmp__tag cmp__tag--a">بعد</span><input class="cmp__range" id="cmpr" type="range" min="0" max="100" value="50" dir="ltr" aria-label="مقایسهٔ قبل و بعد؛ با کلیدهای جهت خط را جابه‌جا کن"></div></div><p class="cmp-hint">این چیزی است که مشتری شما می‌بیند. خط را بکشید.</p></div></section>'
+'<section aria-labelledby="pain"><span class="eyebrow">مشکل امروز</span><h2 class="display" id="pain">مشتری قبل از رسیدن به مزون، تصمیمش را نیمه‌کاره گرفته است</h2><ul class="pain"><li>عروس‌ها اول در اینستاگرام و واتساپ می‌گردند و چند مزون را کنار هم می‌گذارند.</li><li>عکس لباس روی مانکن نشان نمی‌دهد همان لباس روی اندام خودش چطور است.</li><li>پرسش‌ها و پیام‌های بی‌نتیجه زیاد است و نمی‌دانید کدام مدل واقعاً مورد توجه بوده.</li></ul></section>'
+'<section aria-labelledby="val"><span class="eyebrow">چرا مزون آینه</span><h2 class="display" id="val">چهار دلیل که برای مزون شما می‌ارزد</h2><div class="val"><div><b>درخواست آماده، نه پیام سرد</b><p>عروس با عکس خودش، لباس انتخابی و شمارهٔ تماس می‌آید. اولین تماس شما از همان لباس شروع می‌شود.</p></div><div><b>مزون شما متفاوت دیده می‌شود</b><p>وقتی عروس می‌تواند همان لباس را روی خودش ببیند، مزون شما را زودتر و بهتر به خاطر می‌سپارد و برای دوستانش هم می‌فرستد.</p></div><div><b>بدانید چه چیزی مورد توجه است</b><p>آمار می‌گوید کدام لباس بیشتر امتحان و ذخیره می‌شود و مشتری‌ها از QR، اینستاگرام یا واتساپ آمده‌اند.</p></div><div><b>بدون زحمت راه‌اندازی</b><p>نه برنامه‌ای نصب می‌شود و نه تیم فنی لازم است. لباس‌ها و درخواست‌ها را از تلگرام مدیریت می‌کنید.</p></div></div></section>'
+'<section aria-labelledby="how"><span class="eyebrow">راه‌اندازی</span><h2 class="display" id="how">در سه قدم، مزون شما آماده است</h2><ol class="steps"><li><div><b>ثبت‌نام و ارسال لباس‌ها</b><span>فرم کوتاه را پر کنید و عکس لباس‌ها را در ربات تلگرام بفرستید.</span></div></li><li><div><b>لینک یا QR را پخش کنید</b><span>در اینستاگرام، واتساپ یا روی تبلت داخل مزون بگذارید.</span></div></li><li><div><b>درخواست‌ها را پیگیری کنید</b><span>هر عروس با عکس قبل و بعد، اسم و شماره به شما می‌رسد.</span></div></li></ol></section>'
+'<section aria-labelledby="lead"><div class="lead-demo"><div><span class="eyebrow">آنچه دریافت می‌کنید</span><h2 class="display" id="lead">هر درخواست، یک مشتری با نیاز مشخص</h2><p class="lead">به‌جای «قیمت لباس‌ها چنده؟»، کسی با شما تماس می‌گیرد که لباس مشخصی را روی خودش دیده و برای پرو حضوری آماده است. وضعیت هر درخواست را (جدید، تماس گرفته شد، نوبت پرو) همان‌جا ثبت می‌کنید.</p></div>'
+'<div class="lcard"><span class="lcard__tag">نمونهٔ نمایشی</span><div class="lcard__imgs"><figure><img src="/catalog/dress/demo-before.webp" alt="" loading="lazy" width="240" height="320"><figcaption>عکس عروس</figcaption></figure><figure><img src="/catalog/dress/demo-after.webp" alt="" loading="lazy" width="240" height="320"><figcaption>با لباس مزون</figcaption></figure></div><dl><div><dt>نام</dt><dd>عروس نمونه</dd></div><div><dt>موبایل</dt><dd dir="ltr">۰۹۱۲ ۰۰۰ ۰۰۰۰</dd></div><div><dt>لباس انتخابی</dt><dd>مدل ماهی دانتل</dd></div></dl><div class="lcard__st"><span class="on">جدید</span><span>تماس گرفته شد</span><span>نوبت پرو</span></div></div></div></section>'
+'<section aria-labelledby="ways"><span class="eyebrow">دو راه استفاده</span><h2 class="display" id="ways">هم قبل از آمدن، هم داخل مزون</h2><div class="ways"><div><b>آنلاین، با لینک و QR</b><p>لینک مزون را در پیج و پیام‌ها بگذارید. عروس‌ها از خانه، پیش از اینکه وقت بگیرند، لباس‌های شما را امتحان می‌کنند.</p><span class="chip">اینستاگرام · واتساپ · QR</span></div><div><b>داخل مزون، روی تبلت</b><p>عروسی که حضوری آمده، روی تبلت مزون از خودش عکس می‌گیرد و پیش از پرو چند لباس را روی خودش می‌بیند.</p><span class="chip">دوربین داخل صفحه</span></div></div></section>'
+'<section aria-labelledby="priv"><span class="eyebrow">اعتماد و حریم خصوصی</span><h2 class="display" id="priv">برای شما و برای مشتری‌هایتان قابل اعتماد</h2><div class="trust"><p>لباس‌ها مال شماست و فقط در صفحهٔ مزون خودتان نمایش داده می‌شود.</p><p>عکس عروسی که درخواست نفرستد، ۱۵ دقیقه بعد خودکار پاک می‌شود و خودش هم می‌تواند فوراً پاکش کند.</p><p>نتیجه شبیه‌سازی است؛ رنگ، پارچه و دوخت نهایی را خودتان با پرو حضوری تأیید می‌کنید.</p></div></section>'
+'<section id="owners" aria-labelledby="own"><span class="eyebrow">شروع</span><h2 class="display" id="own">بدون ریسک امتحان کنید</h2><div class="plan" id="start"><div><h3>نسخهٔ آزمایشی رایگان</h3><ul><li>صفحهٔ اختصاصی مزون خودتان</li><li>ده ساعت استفاده و پنج عکس نتیجه</li><li>درخواست‌ها در ربات تلگرام</li></ul><a class="btn btn--primary" href="/register">شروع آزمایشی رایگان</a><small>قیمت بسته‌ها هنگام ثبت‌نام اعلام می‌شود و تا وقتی تأیید نکنید پرداختی ندارید.</small></div><div><p class="lead" style="margin:0">ترجیح می‌دهید اول با ما صحبت کنید؟ ربات تلگرام را باز کنید، لباس‌هایتان را بفرستید و لینک اختصاصی مزونتان را بگیرید.</p><p style="margin-top:12px"><a class="btn btn--ghost" href="'+BOT_URL+'" rel="noopener">ربات تلگرام مزون آینه</a></p></div></div></section>'
+'<section aria-labelledby="faq"><h2 class="display" id="faq">سؤال‌های مزون‌دارها</h2>'+faq.map(([q,a])=>'<details><summary>'+q+'</summary><p>'+a+'</p></details>').join('')+'</section>'
+'<section aria-labelledby="fin"><div class="final"><h2 class="display" id="fin">اولین عروس را امتحان کنید</h2><p>خودتان یک بار نمونه را امتحان کنید و ببینید مشتری شما چه تجربه‌ای خواهد داشت.</p><a class="btn btn--primary" href="/s/demo">امتحان نمونه</a><p class="final__alt">آمادهٔ شروع هستید؟ <a href="/register">ثبت‌نام مدیر مزون</a></p></div></section>'
+'</main><footer><span>© مزون آینه</span><span><a href="/s/demo">نمونه</a> · <a href="/register">ثبت‌نام مدیر مزون</a> · <a href="/privacy">قوانین و حریم خصوصی</a> · <a href="'+BOT_URL+'" rel="noopener">ربات تلگرام</a></span></footer></div><script>'+js+'</script></body></html>';
export const landingHTML=landingFor('');
