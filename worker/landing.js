// Home page: a real landing for brides and boutique owners. Self-contained (inline CSS/JS, own-origin assets only).
import {baseCSS,markSVG} from './design.js';
export const BOT_URL='https://t.me/mezon_aynehbot';
const css=String.raw`
body{overflow-x:hidden}
.top{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 0}
.top .brand{display:inline-flex;align-items:center;gap:8px;font-weight:800;font-family:var(--display);font-size:18px;color:var(--ink)}
.top .brand svg{width:22px;height:28px}
.top .btn{min-height:44px}
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
.cmp{position:relative;aspect-ratio:2/3;overflow:hidden;border-radius:999px 999px calc(var(--r) - 5px) calc(var(--r) - 5px);background:var(--glass-2);direction:ltr;touch-action:pan-y;user-select:none;-webkit-user-select:none;cursor:ew-resize;--x:50%}
.cmp img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
.cmp__after{position:absolute;inset:0;clip-path:inset(0 calc(100% - var(--x)) 0 0)}
.cmp__line{position:absolute;top:0;bottom:0;left:var(--x);width:2px;margin-left:-1px;background:#fff;box-shadow:0 0 12px rgba(0,0,0,.3);pointer-events:none}
.cmp__grip{position:absolute;top:60%;left:var(--x);width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:#fff;display:grid;place-items:center;box-shadow:var(--lift);pointer-events:none;color:var(--ink)}
.cmp__grip svg{width:22px;height:22px}
.cmp__tag{position:absolute;bottom:14px;z-index:2;background:rgba(250,251,250,.94);padding:3px 12px;border-radius:999px;font-size:12px;font-weight:700;color:var(--ink-2);pointer-events:none}
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
@media(min-width:820px){
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
 ['عکس من کجا نگه‌داری می‌شود؟','عکس‌ها فقط برای همان مزونی که از آن پرو می‌کنی استفاده می‌شوند و جایی نمایش عمومی ندارند.'],
 ['آیا سایز و فرم بدنم تغییر می‌کند؟','نه. هدف این است که اندام واقعی تو حفظ شود و فقط لباس عوض شود. نتیجه یک شبیه‌سازی پیشنهادی است و اجرای دقیق را مزون تأیید می‌کند.'],
 ['باید برنامه نصب کنم؟','نه. همه‌چیز در مرورگر گوشی انجام می‌شود؛ لینک مزون را باز کن و عکس تمام‌قدت را اضافه کن.'],
 ['چقدر طول می‌کشد؟','معمولاً حدود یک دقیقه. نتیجه را می‌توانی ذخیره کنی، دانلود کنی یا برای مزون و دوستانت بفرستی.'],
 ['من مزون‌دارم؛ چطور شروع کنم؟','ربات تلگرام مزون عروس را باز کن، عکس لباس‌هایت را بفرست و لینک اختصاصی صفحهٔ مزونت را بگیر.']
];
const title='مزون عروس | لباس عروس را روی اندام خودت ببین';
const desc='پرو مجازی لباس عروس روی عکس تمام‌قد خودت؛ سایز و فرم بدنت همان می‌ماند. در یک دقیقه، بدون نصب، و بعد برای مزون بفرست.';
export const landingHTML='<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#e8edeb"><meta name="color-scheme" content="light"><title>'+title+'</title><meta name="description" content="'+desc+'"><meta property="og:title" content="'+title+'"><meta property="og:description" content="'+desc+'"><meta property="og:type" content="website"><meta property="og:site_name" content="مزون عروس"><meta property="og:locale" content="fa_IR"><meta name="twitter:card" content="summary"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="preload" href="/fonts/vazirmatn-arabic.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/fonts/estedad-arabic.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/catalog/dress/demo-after.webp" as="image"><style>'+baseCSS+css+'</style></head><body>'
+'<a class="skip" href="#main">پرش به محتوای اصلی</a>'
+'<div class="wrap"><header class="top"><span class="brand">'+markSVG.replace('<svg','<svg width="22" height="28"')+'<span>مزون عروس</span></span><a class="btn btn--ghost" href="#owners">مزون‌دار هستید؟</a></header>'
+'<main id="main">'
+'<section class="hero" aria-labelledby="h1"><div><span class="eyebrow">پرو مجازی لباس عروس</span><h1 class="display" id="h1">لباس عروس را روی اندام خودت ببین</h1><p class="lead">عکس تمام‌قدت را اضافه کن، لباس را انتخاب کن و در یک دقیقه نتیجه را ببین. قد و سایز بدنت همان می‌ماند، فقط لباس عوض می‌شود.</p><div class="hero__cta"><a class="btn btn--primary" href="/s/demo">نمونه را ببین</a><a class="btn btn--ghost" href="#owners">مزون‌دار هستم</a></div><p class="hero__note">رایگان برای عروس‌ها · بدون نصب برنامه</p></div>'
+'<div class="cmp-wrap"><div class="mirror"><div class="cmp" id="cmp"><img src="/catalog/dress/demo-before.webp" alt="عکس عروس پیش از پرو" width="480" height="720"><div class="cmp__after"><img src="/catalog/dress/demo-after.webp" alt="همان عکس با لباس عروس انتخاب‌شده" width="480" height="720" fetchpriority="high"></div><span class="cmp__line"></span><span class="cmp__grip">'+grip+'</span><span class="cmp__tag cmp__tag--b">قبل</span><span class="cmp__tag cmp__tag--a">بعد</span><input class="cmp__range" id="cmpr" type="range" min="0" max="100" value="50" dir="ltr" aria-label="مقایسهٔ قبل و بعد؛ با کلیدهای جهت خط را جابه‌جا کن"></div></div><p class="cmp-hint">خط را بکش و قبل و بعد را مقایسه کن</p></div></section>'
+'<section aria-labelledby="how"><h2 class="display" id="how">چطور کار می‌کند؟</h2><ol class="steps"><li><div><b>عکس تمام‌قد</b><span>یک عکس ایستاده با نور خوب از خودت اضافه کن.</span></div></li><li><div><b>انتخاب لباس</b><span>از مدل‌های مزون یکی را بردار یا عکس لباس دلخواهت را بگذار.</span></div></li><li><div><b>نتیجه</b><span>خودت را با لباس ببین، ذخیره و مقایسه کن و برای مزون بفرست.</span></div></li></ol></section>'
+'<section aria-labelledby="why"><h2 class="display" id="why">چرا مزون عروس؟</h2><div class="ben"><div><b>اندام واقعی حفظ می‌شود</b><p>سایز و فرم بدنت دست‌نخورده می‌ماند تا تصمیم‌گیری واقعی باشد.</p></div><div><b>در یک دقیقه</b><p>بدون وقت گرفتن و رفت‌وآمد، چند مدل را پشت‌سرهم امتحان کن.</p></div><div><b>بدون نصب</b><p>فقط یک لینک؛ روی هر گوشی در مرورگر باز می‌شود.</p></div></div></section>'
+'<section id="owners" aria-labelledby="own"><div class="owner" id="start"><h2 class="display" id="own">مزون‌دار هستید؟</h2><p>صفحهٔ پرو مجازی مخصوص مزون خودتان را بگیرید تا مشتری‌ها قبل از آمدن، لباس‌هایتان را امتحان کنند.</p><ol><li>ربات تلگرام مزون عروس را باز کنید.</li><li>عکس لباس‌هایتان را از همان ربات بارگذاری کنید.</li><li>لینک اختصاصی صفحهٔ مزونتان را بگیرید.</li><li>درخواست‌ها و مشتریان بالقوه را در ربات ببینید.</li></ol><a class="btn btn--primary" href="'+BOT_URL+'" rel="noopener">شروع در تلگرام</a></div></section>'
+'<section aria-labelledby="priv"><h2 class="display" id="priv">حریم خصوصی و اعتماد</h2><div class="trust"><p>عکس‌ها فقط برای همان مزونی که از آن پرو می‌کنی استفاده می‌شوند.</p><p>عکس تو جایی نمایش عمومی ندارد و فقط با اجازهٔ خودت برای مزون فرستاده می‌شود.</p><p>نتیجه شبیه‌سازی پیشنهادی است؛ اجرای دقیق با مزون است.</p></div></section>'
+'<section aria-labelledby="faq"><h2 class="display" id="faq">سؤال‌های رایج</h2>'+faq.map(([q,a])=>'<details><summary>'+q+'</summary><p>'+a+'</p></details>').join('')+'</section>'
+'</main><footer><span>© مزون عروس</span><span><a href="/s/demo">نمونه</a> · <a href="'+BOT_URL+'" rel="noopener">ربات تلگرام</a></span></footer></div><script>'+js+'</script></body></html>';
