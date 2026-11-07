import {styles} from './legacy.js';
import {DRESS_STYLES,LINE_OPTIONS,LINE_COLORS,LINE_POPULAR,LINE_FILTERS,LINE_PHOTO,LINE_LABEL} from './lines.js';
const lineJSON=(line,list)=>({styles:list.map(x=>[x[0],x[1],x[2]]),filters:LINE_FILTERS[line],options:(LINE_OPTIONS[line]||[]).map(o=>({key:o.key,label:o.label,items:o.items.map(i=>i[0])})),colors:(LINE_COLORS[line]||[]).map(c=>[c[0],c[1]]),popular:LINE_POPULAR[line]||[]});
const LINES_JSON=JSON.stringify({label:LINE_LABEL,photo:{dress:LINE_PHOTO.dress},dress:lineJSON('dress',DRESS_STYLES)});
import {baseCSS,markSVG} from './design.js';

const customerCSS=String.raw`
/* ---------- hero: full-width cover, logo on its edge, the name on one line ---------- */
.hero{position:relative;padding:14px 0 22px}
.hero__bar{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px}
.brand{display:inline-flex;align-items:center;gap:8px;color:var(--ink-2);font-size:13px;font-weight:600}
.brand svg{width:20px;height:25px}
.icon-btn{width:44px;height:44px;border-radius:50%;border:1px solid var(--line);background:var(--surface);display:grid;place-items:center;color:var(--ink);transition:background-color .14s var(--ease),border-color .14s var(--ease)}
.icon-btn:hover{border-color:#b3c0bb}
.icon-btn svg{width:20px;height:20px}
.cover{position:relative;aspect-ratio:16/7;border-radius:var(--r-lg);background:var(--glass-2);box-shadow:var(--lift)}
.cover__img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit}
.cover::after{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(180deg,rgba(255,255,255,.08),transparent 40%,rgba(20,14,10,.18));pointer-events:none}
.cover__glow{position:absolute;inset:0;border-radius:inherit;overflow:hidden;background:radial-gradient(60% 90% at 88% 0,rgba(255,255,255,.7),transparent 70%),radial-gradient(55% 80% at 8% 110%,rgba(214,166,92,.45),transparent 70%),radial-gradient(120% 140% at 85% 0,#cfe6e2 0,#a9cbc6 38%,#7fb0aa 70%,#5f9690 100%)}
.cover__logo{position:absolute;z-index:2;inset-inline-start:18px;bottom:-34px;width:74px;height:74px;border-radius:50%;object-fit:cover;border:4px solid var(--glass);background:var(--surface);box-shadow:0 10px 24px -12px rgba(35,23,15,.55)}
.cover__logo--letter{display:grid;place-items:center;font-family:var(--display);font-weight:800;font-size:32px;color:var(--accent-ink);background:var(--surface)}
.hero__body{display:grid;gap:16px;padding:44px 4px 0}
.hero__text{min-width:0}
.hero__name{font-family:var(--display);font-weight:800;font-size:clamp(28px,8.4vw,52px);line-height:1.25;color:var(--ink);white-space:nowrap;overflow:hidden}
.hero__name.is-wrapped{white-space:normal;overflow-wrap:anywhere}
.hero__chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.hchip{display:inline-flex;align-items:center;gap:6px;max-width:100%;min-height:34px;padding:5px 12px;border:1px solid var(--line-2);border-radius:999px;background:var(--surface);color:var(--ink-2);font:inherit;font-size:12.5px;font-weight:600;text-decoration:none;cursor:default}
a.hchip,button.hchip{cursor:pointer}a.hchip:hover,button.hchip:hover{border-color:var(--line)}
.hchip__ico{display:inline-grid;color:var(--accent)}.hchip__ico svg{width:15px;height:15px}
.hchip__txt{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:62vw}
.hero__cta .btn{width:100%}
.btn--lg{min-height:54px;font-size:16px;padding-inline:26px}
@media(min-width:760px){
 .hero{padding:20px 0 30px}
 .cover{aspect-ratio:auto;height:280px}
 .cover__logo{width:104px;height:104px;bottom:-46px;inset-inline-start:30px;border-width:5px}
 .cover__logo--letter{font-size:44px}
 .hero__body{grid-template-columns:minmax(0,1fr) auto;align-items:end;gap:28px;padding:16px 6px 0;padding-inline-start:156px;min-height:84px}
 .hero__cta .btn{width:auto}
 .hchip__txt{max-width:44ch}
}
/* ---------- steps: a three-part sequence ---------- */
.steps{position:sticky;top:0;z-index:30;background:rgba(232,237,235,.86);backdrop-filter:saturate(1.4) blur(14px);-webkit-backdrop-filter:saturate(1.4) blur(14px);border-bottom:1px solid var(--line-2)}
.steps__list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;padding:10px 18px}
.steps__item{display:flex;align-items:center;gap:8px;min-height:44px;padding:0 6px;border:0;background:transparent;color:var(--muted);font-size:13px;font-weight:600;text-align:start;position:relative;border-radius:12px}
.steps__item::after{content:"";position:absolute;inset-inline:6px;bottom:2px;height:3px;border-radius:3px;background:var(--line)}
.steps__item.is-done::after{background:var(--accent)}
.steps__item.is-active::after{background:var(--ink)}
.steps__item.is-active{color:var(--ink)}
.steps__num{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;border:1.5px solid var(--line);color:var(--ink-2);font-size:12.5px;font-weight:700;flex:none;background:var(--surface)}
.steps__item.is-active .steps__num{background:var(--ink);border-color:var(--ink);color:#fff}
.steps__item.is-done .steps__num{background:var(--accent);border-color:var(--accent);color:#fff}
.steps__label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

/* ---------- layout ---------- */
.layout{display:grid;grid-template-columns:minmax(0,1fr);gap:20px;padding:20px 0 28px}
@media(min-width:960px){.layout{grid-template-columns:minmax(0,1fr) 340px;gap:28px;align-items:start}.side{position:sticky;top:84px}}
.side{display:grid;gap:20px;min-width:0}
.flow{padding:22px 18px 24px;scroll-margin-top:84px}
@media(min-width:600px){.flow{padding:28px 30px 30px}}
.flow__head{margin-bottom:18px}
.flow__title{font-family:var(--display);font-weight:800;font-size:26px}
.flow__sub{font-size:13.5px;color:var(--muted);margin-top:4px;max-width:58ch;line-height:1.85}
.flow__nav{display:flex;gap:10px;margin-top:22px;flex-wrap:wrap}
.flow__nav .btn--primary{flex:1;min-width:180px}

/* ---------- step 1: the empty mirror ---------- */
.shoot{display:grid;gap:22px}
@media(min-width:700px){.shoot{grid-template-columns:260px minmax(0,1fr);align-items:center;gap:30px}}
.upload{position:relative;display:grid;place-items:center;align-content:center;gap:10px;width:min(100%,280px);margin:0 auto;aspect-ratio:3/4;padding:24px 18px;border:2px dashed #a9b8b2;border-radius:var(--arch);background:linear-gradient(170deg,#f6f9f8,#e3eae7);text-align:center;cursor:pointer;transition:border-color .15s var(--ease),background .15s var(--ease)}
.upload:hover,.upload.is-drag{border-color:var(--accent);background:linear-gradient(170deg,#f2f8f7,#d8ebe7)}
.upload__icon{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;background:var(--accent);color:#fff;box-shadow:0 12px 24px -12px rgba(7,76,77,.8)}
.upload__icon svg{width:27px;height:27px}
.upload strong{font-size:15px;line-height:1.6}
.upload__hint{font-size:12.5px;color:var(--muted);max-width:24ch;line-height:1.75}
.shoot__side{display:grid;gap:16px}
.shoot__btns{display:grid;gap:10px}
@media(min-width:420px){.shoot__btns{grid-template-columns:1fr 1fr}}
.tips{display:grid;gap:10px;margin:0;padding:0;list-style:none}
.tip{display:flex;gap:11px;align-items:flex-start;font-size:13.5px;color:var(--ink-2);line-height:1.7}
.tip svg{width:18px;height:18px;flex:none;margin-top:3px;color:var(--accent)}
.tip b{font-weight:700;color:var(--ink)}
.photo{width:min(100%,320px);margin:0 auto}
.photo .mirror__glass{aspect-ratio:3/4}
.photo__bar{display:flex;gap:10px;align-items:center;justify-content:space-between;margin-top:12px;font-size:13.5px;font-weight:600;color:var(--ink-2)}
.photo__bar span{display:inline-flex;align-items:center;gap:6px}
.photo__bar span svg{width:18px;height:18px;color:var(--accent)}
.upl{position:absolute;inset:0;display:grid;align-content:end;justify-items:center;gap:10px;padding:20px;background:linear-gradient(180deg,transparent 45%,rgba(8,32,32,.62));color:#fff;font-weight:700;font-size:14.5px}
.upl__scan{position:absolute;inset-inline:0;top:-35%;height:35%;background:linear-gradient(180deg,transparent,rgba(255,255,255,.5),transparent);animation:scan 1.5s ease-in-out infinite}
.upl__bar{width:70%;height:4px;border-radius:2px;background:rgba(255,255,255,.3);overflow:hidden}.upl__bar i{display:block;width:40%;height:100%;border-radius:2px;background:#fff;animation:slide 1.1s ease-in-out infinite}
@keyframes scan{to{top:100%}}@keyframes slide{0%{transform:translateX(160%)}100%{transform:translateX(-260%)}}
.photo__badge{position:absolute;left:50%;top:50%;width:76px;height:76px;margin:-38px 0 0 -38px;border-radius:50%;display:grid;place-items:center;background:var(--ok);color:#fff;box-shadow:0 0 0 8px rgba(255,255,255,.55),0 14px 30px -10px rgba(0,0,0,.45);animation:pop .55s var(--ease) both}
.photo__badge svg{width:38px;height:38px}
@keyframes pop{0%{transform:scale(.3);opacity:0}60%{transform:scale(1.12);opacity:1}100%{transform:scale(1)}}
.photo__auto{height:4px;border-radius:2px;background:#dfe6e3;overflow:hidden;margin-top:14px}.photo__auto i{display:block;height:100%;width:0;background:var(--accent);animation:fill 1.8s linear forwards}
@keyframes fill{to{width:100%}}
.selfie{display:flex;align-items:center;gap:10px;padding:8px 10px;margin:0 0 14px;border-radius:16px;background:var(--glass)}
.selfie img{width:40px;height:52px;object-fit:cover;border-radius:20px 20px 6px 6px;flex:none}
.selfie div{display:grid;gap:2px}.selfie b{display:flex;align-items:center;gap:5px;font-size:13.5px}.selfie b svg{width:16px;height:16px;color:var(--ok)}.selfie span{font-size:12px;color:var(--muted)}
.selfie .btn{margin-inline-start:auto}
.pc-by{display:block;font-size:11.5px;color:var(--muted);margin-top:2px}
.steps__top{display:flex;justify-content:center;padding-top:10px}
.linesw{display:inline-grid;grid-template-columns:repeat(4,1fr);gap:4px;padding:4px;border-radius:999px;background:var(--glass);box-shadow:inset 0 1px 2px rgba(0,0,0,.06);width:min(100%,500px)}
.linesw__btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:40px;padding:6px 8px;white-space:nowrap;border:0;border-radius:999px;background:transparent;color:var(--ink-2);font:inherit;font-size:14px;font-weight:700;cursor:pointer;transition:background .2s var(--ease),color .2s var(--ease),box-shadow .2s var(--ease)}
.linesw__btn svg{width:18px;height:18px}
.linesw__btn:hover{color:var(--ink)}
.linesw__btn.is-on{background:var(--surface);color:var(--accent-ink);box-shadow:0 2px 8px -3px rgba(0,0,0,.25)}
.linesw__btn:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.opt{margin-top:16px}.opt .lbl{margin-bottom:6px}
.opt-row{flex-wrap:wrap}
@media (prefers-reduced-motion:reduce){.linesw__btn{transition:none}}
#invite{margin:22px 0 0}
.invite{position:relative;overflow:hidden;display:grid;grid-template-columns:auto 1fr;gap:18px;align-items:center;width:100%;padding:20px;border:0;border-radius:var(--r-lg);background:radial-gradient(120% 140% at 100% 0,#16716f 0,#0c4f50 55%,#083a3b 100%);color:#fff;text-align:start;font:inherit;cursor:pointer;box-shadow:0 22px 40px -24px rgba(7,60,60,.9);transition:transform .2s var(--ease)}
.invite:hover{transform:translateY(-2px)}.invite:focus-visible{outline:3px solid var(--honey);outline-offset:3px}
.invite::after{content:"";position:absolute;inset:auto -40px -60px auto;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(214,166,92,.35),transparent 70%);pointer-events:none}
.invite__pics{position:relative;width:112px;height:92px;flex:none}
.invite__pics img,.invite__pics span{position:absolute;bottom:0;width:52px;height:68px;object-fit:cover;border-radius:26px 26px 8px 8px;border:3px solid rgba(255,255,255,.9);background:#cfdcd8;box-shadow:0 8px 16px -8px rgba(0,0,0,.5)}
.invite__pics :nth-child(1){right:6px;transform:rotate(8deg)}.invite__pics :nth-child(2){right:30px;bottom:14px;z-index:1;width:56px;height:74px}.invite__pics :nth-child(3){right:56px;transform:rotate(-8deg)}
.invite__txt{display:grid;gap:6px;position:relative;z-index:1}
.invite__txt b{font-family:var(--display);font-weight:800;font-size:19px;line-height:1.5}
.invite__txt span{font-size:13.5px;line-height:1.9;color:rgba(255,255,255,.85)}
.invite__cta{justify-self:start;display:inline-flex;align-items:center;gap:8px;margin-top:6px;padding:10px 16px;border-radius:999px;background:var(--honey);color:#2a1a08;font-weight:800;font-size:14px}
.invite__cta svg{width:18px;height:18px}
@media (max-width:420px){.invite{grid-template-columns:1fr;justify-items:start}.invite__pics{height:84px}}
.share__prev{display:flex;gap:12px;align-items:center;padding:12px;border-radius:16px;background:var(--glass);margin:4px 0 16px}
.share__prev img,.share__prev .share__logo{width:46px;height:46px;border-radius:12px;object-fit:cover;flex:none;background:var(--accent);display:grid;place-items:center;color:#fff;font-weight:800}
.share__prev div{display:grid;gap:2px;min-width:0}.share__prev b{font-size:14.5px}.share__prev span{font-size:12px;color:var(--muted);direction:ltr;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.share__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.share__opt{display:grid;justify-items:center;gap:8px;padding:14px 6px;border:1px solid var(--line,#dfe6e3);border-radius:16px;background:var(--surface);color:var(--ink);font:inherit;font-size:13px;font-weight:700;text-decoration:none;cursor:pointer;transition:background .15s var(--ease),transform .15s var(--ease)}
.share__opt:hover{background:var(--surface-2,#f1f5f4);transform:translateY(-1px)}
.share__ic{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;color:#fff}.share__ic svg{width:24px;height:24px}
.share__note{margin-top:14px;font-size:12.5px;color:var(--muted);line-height:1.9;text-align:center}
@media (prefers-reduced-motion:reduce){.invite,.share__opt{transition:none}.invite:hover,.share__opt:hover{transform:none}}
@media (prefers-reduced-motion:reduce){.upl__scan,.upl__bar i,.photo__badge{animation:none}.photo__auto i{animation:none;width:100%}}

.collapse{border-top:1px solid var(--line-2);padding-top:12px;font-size:13px;color:var(--muted)}
.collapse summary{cursor:pointer;font-weight:600;color:var(--ink-2);list-style:none;display:flex;align-items:center;gap:7px}
.collapse summary::-webkit-details-marker{display:none}
.collapse summary svg{width:17px;height:17px;color:var(--accent)}
.collapse p{margin-top:8px;line-height:1.95}

/* ---------- step 2: choosing a look ---------- */
.seg{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:4px;background:var(--glass);padding:4px;border-radius:16px;margin-bottom:18px}
.seg button{min-height:42px;border:0;background:transparent;border-radius:12px;font-size:13px;font-weight:600;color:var(--ink-2);padding:0 6px;transition:background-color .14s var(--ease),color .14s var(--ease)}
.seg button[aria-selected="true"]{background:var(--surface);color:var(--ink);box-shadow:0 1px 3px rgba(35,23,15,.12)}
.filters{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;margin-bottom:14px;scrollbar-width:none}
.filters::-webkit-scrollbar{display:none}
.filters .chip{flex:none}
.looks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
@media(min-width:600px){.looks{grid-template-columns:repeat(3,minmax(0,1fr))}}
.style-card{display:grid;gap:2px;align-content:start;min-height:84px;padding:14px 14px 12px;border:1.5px solid var(--line-2);background:var(--surface-2);border-radius:var(--r);text-align:start;transition:border-color .14s var(--ease),background-color .14s var(--ease)}
.style-card:hover{border-color:var(--line)}
.style-card.is-on{border-color:var(--ink);background:#fff;box-shadow:0 0 0 3px rgba(35,23,15,.08)}
.style-card__name{font-family:var(--display);font-weight:800;font-size:19px;color:var(--ink);line-height:1.35}
.style-card__en{font-size:11.5px;color:var(--muted);direction:ltr;text-align:end}
.style-card__tag{font-size:12px;color:var(--accent-ink);font-weight:600;margin-top:4px}
.rail{display:grid;grid-auto-flow:column;grid-auto-columns:138px;gap:12px;overflow-x:auto;padding:4px 2px 10px;scroll-snap-type:x mandatory;scrollbar-width:thin}
.port-card{scroll-snap-align:start;border:0;background:transparent;padding:0;text-align:start}
.port-card .mirror{padding:5px;transition:box-shadow .14s var(--ease)}
.port-card .mirror__glass{aspect-ratio:3/4}
.port-card span.pc-name{display:block;padding:8px 4px 0;font-size:13px;color:var(--ink-2);font-weight:600}
.port-card.is-on .mirror{box-shadow:0 0 0 3px var(--accent),var(--lift)}
.port-card.is-on span.pc-name{color:var(--accent-ink)}
.picked{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:14px;padding:10px 12px 10px 10px;border-radius:14px;background:var(--accent-soft);color:var(--accent-ink);font-size:13.5px;font-weight:600}
.picked .btn{min-height:34px}
.ref-photo{width:min(100%,240px);margin:14px auto 0}
.ref-photo .mirror__glass{aspect-ratio:3/4}

/* ---------- step 3: result ---------- */
.summary{display:flex;gap:12px;align-items:center;padding:10px;border-radius:16px;background:var(--surface-2);border:1px solid var(--line-2)}
.summary img{width:52px;height:66px;object-fit:cover;border-radius:999px 999px 8px 8px;background:var(--glass-2)}
.summary__meta{font-size:12.5px;color:var(--muted)}
.summary b{display:block;font-size:14px;color:var(--ink)}
.stage{width:min(100%,360px);margin:18px auto 0}
.stage .mirror__glass{aspect-ratio:3/4;display:grid;place-items:center}
.stage__empty{position:relative;z-index:1;color:var(--muted);font-size:13px;text-align:center;padding:24px;max-width:22ch;line-height:1.9}
.compare-wrap{width:min(100%,400px);margin:18px auto 0}
.compare{position:relative;aspect-ratio:3/4;overflow:hidden;border-radius:999px 999px calc(var(--r) - 5px) calc(var(--r) - 5px);background:var(--glass-2);touch-action:pan-y;user-select:none;-webkit-user-select:none;cursor:ew-resize;direction:ltr}
.compare img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none;-webkit-user-drag:none}
.compare__after{position:absolute;inset:0;clip-path:inset(0 calc(100% - var(--x,50%)) 0 0)}
.compare__handle{position:absolute;top:0;bottom:0;left:var(--x,50%);width:2px;margin-left:-1px;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.1),0 0 12px rgba(0,0,0,.25);pointer-events:none}
.compare__grip{position:absolute;top:58%;left:50%;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:#fff;display:grid;place-items:center;box-shadow:var(--lift);color:var(--ink);transition:transform .15s var(--ease)}
.compare.is-dragging .compare__grip{transform:scale(1.12)}
.compare.is-animating .compare__after{transition:clip-path .28s var(--ease)}
.compare.is-animating .compare__handle{transition:left .28s var(--ease)}
.compare__grip svg{width:22px;height:22px}
.compare__range{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;bottom:0;left:0}
.compare:has(.compare__range:focus-visible){outline:3px solid var(--accent-ring);outline-offset:3px}
.compare__tag{position:absolute;bottom:12px;z-index:2;background:rgba(250,251,250,.94);padding:3px 12px;border-radius:999px;font-size:12px;font-weight:700;color:var(--ink-2);pointer-events:none}
.compare__tag--before{right:12px}
.compare__tag--after{left:12px}
.compare__hint{text-align:center;font-size:12.5px;color:var(--muted);margin-top:10px}
.progress{display:grid;gap:10px;margin-top:18px}
.progress__bar{height:6px;border-radius:999px;background:var(--glass-2);overflow:hidden}
.progress__fill{height:100%;width:8%;border-radius:999px;background:var(--accent);transition:width .6s var(--ease)}
.rate-line{display:flex;align-items:center;gap:12px;justify-content:space-between;flex-wrap:wrap;margin-top:18px;padding-top:16px;border-top:1px solid var(--line-2)}
.rating{display:flex;gap:4px}
.rating button{width:42px;height:42px;border-radius:50%;border:0;background:transparent;font-size:22px;color:#c3ccc8;transition:color .14s var(--ease),transform .14s var(--ease)}
.rating button:hover{transform:scale(1.1)}
.rating button.is-on{color:var(--honey)}
.result-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:14px}

/* ---------- side: portfolio, contact, requests ---------- */
.sidecard{padding:20px}
.sidecard h2{font-family:var(--display);font-weight:800;font-size:21px;margin-bottom:14px}
.gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 12px}
@media(min-width:560px) and (max-width:959px){.gallery{grid-template-columns:repeat(3,minmax(0,1fr))}}
.pcard{border:0;padding:0;background:transparent;text-align:start}
.pcard .mirror{padding:5px}
.pcard .mirror__glass{aspect-ratio:4/5}
.pcard h3{font-size:13.5px;margin-top:8px}
.pcard p{font-size:12px;color:var(--muted)}
.pcard:hover .mirror{box-shadow:0 0 0 2px var(--accent),var(--lift)}
.meta-list{display:grid;gap:2px}
.meta-list a,.meta-list span.mi{display:flex;gap:12px;align-items:flex-start;color:var(--ink-2);line-height:1.75;font-size:13.5px;padding:9px 0;border-bottom:1px solid var(--line-2)}
.meta-list>:last-child{border-bottom:0}
.meta-list a:hover{color:var(--accent-ink)}
.meta-list svg{width:18px;height:18px;flex:none;margin-top:3px;color:var(--accent)}
.manager{display:flex;align-items:center;gap:12px;margin-top:12px;padding-top:12px;border-top:1px solid var(--line-2);font-size:13px;color:var(--ink-2)}
.manager img{width:46px;height:46px;border-radius:50%;object-fit:cover}
.foot{text-align:center;font-size:12px;color:var(--muted);padding:6px 6px 0;line-height:1.9;max-width:44ch;margin:0 auto}

/* ---------- dock ---------- */
.dock{position:fixed;inset-inline:0;bottom:0;z-index:40;padding:12px 14px calc(12px + var(--safe-b));background:linear-gradient(180deg,rgba(232,237,235,0),rgba(232,237,235,.92) 40%);pointer-events:none}
.dock__inner{pointer-events:auto;max-width:620px;margin:0 auto;display:flex;gap:8px;align-items:center;background:var(--ink);border-radius:20px;padding:7px;box-shadow:var(--float)}
.dock__hint{font-size:13px;color:rgba(255,255,255,.72);padding-inline-start:12px;flex:1;min-width:0;line-height:1.5;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dock .btn--ghost{color:#fff;border-color:rgba(255,255,255,.22)}
.dock .btn--ghost:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.4)}
.dock .btn--primary{flex:none;box-shadow:none}
.dock .btn--primary[disabled]{opacity:.55}
@media(max-width:560px){.dock__hint{display:none}.dock .btn--primary{flex:1}}
@media(min-width:960px){.dock{display:none}}



.hero__tools{display:flex;gap:8px;align-items:center}
.help-btn{width:42px;height:42px;border-radius:50%;border:1px solid var(--line);background:var(--surface);color:var(--ink-2);font-weight:700;font-size:17px;display:grid;place-items:center}
.help-btn:hover{border-color:#b3c0bb}
/* tour */
.tour{position:fixed;inset:0;z-index:100;animation:tourIn .25s var(--ease)}
.tour.is-leaving{opacity:0;transition:opacity .2s var(--ease)}
@keyframes tourIn{from{opacity:0}to{opacity:1}}
.tour__spot{position:fixed;left:0;top:0;width:0;height:0;border-radius:20px;box-shadow:0 0 0 200vmax rgba(24,16,10,.66),0 0 0 3px rgba(255,255,255,.9) inset;pointer-events:none;transition:transform .38s var(--ease),width .38s var(--ease),height .38s var(--ease)}
.tour--welcome .tour__spot{transform:translate(50vw,50vh);box-shadow:0 0 0 200vmax rgba(24,16,10,.72)}
.tour__card{position:fixed;left:0;top:0;width:min(360px,calc(100vw - 24px));background:var(--surface);border-radius:22px;padding:18px 18px 16px;box-shadow:var(--float);outline:none;transition:transform .38s var(--ease)}
.tour--welcome .tour__card{left:50%;top:50%;transform:translate(-50%,-50%);width:min(400px,calc(100vw - 32px));padding:26px 22px 20px;text-align:center;transition:none}
.tour__mirror{position:relative;width:96px;aspect-ratio:3/4;margin:0 auto 16px;border-radius:999px 999px 14px 14px;background:linear-gradient(170deg,#f4f7f6,#d6dfdb);box-shadow:0 0 0 6px var(--surface),0 0 0 7px var(--line),var(--lift);overflow:hidden;display:grid;place-items:center}
.tour__mark{width:42%;position:relative;z-index:1}
.tour__mark svg{width:100%;height:auto;display:block}
.tour__shine{position:absolute;inset:-20% -60%;background:linear-gradient(115deg,transparent 40%,rgba(255,255,255,.85) 50%,transparent 60%);transform:translateX(-60%);animation:shine 1.6s .3s var(--ease) both}
@keyframes shine{to{transform:translateX(60%)}}
.tour__title{font-family:var(--display);font-weight:800;font-size:21px;line-height:1.4}
.tour--welcome .tour__title{font-size:26px}
.tour__text{font-size:14px;line-height:1.95;color:var(--ink-2);margin-top:6px}
.tour__path{list-style:none;margin:18px 0 20px;padding:0;display:grid;grid-template-columns:repeat(3,1fr);position:relative}
.tour__path::before{content:"";position:absolute;top:21px;inset-inline:16%;height:2px;background:var(--line)}
.tour__path li{display:grid;justify-items:center;gap:7px;position:relative;font-size:12.5px}
.tour__path span{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:var(--accent);color:#fff;box-shadow:0 0 0 5px var(--surface)}
.tour__path li:nth-child(2) span{background:var(--ink)}
.tour__path li:nth-child(3) span{background:var(--honey)}
.tour__path svg{width:20px;height:20px}
.tour__actions{display:grid;gap:8px}
.tour__skip{border-color:transparent}
.tour__top{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.tour__dots{display:flex;gap:5px}
.tour__dots span{width:7px;height:7px;border-radius:9px;background:var(--line);transition:width .25s var(--ease),background-color .25s}
.tour__dots .is-on{width:20px;background:var(--accent)}
.tour__dots .is-done{background:var(--accent-soft)}
.tour__x{width:34px;height:34px;border:0;border-radius:50%;background:var(--glass);color:var(--ink-2);font-size:19px;line-height:1}
.tour__nav{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:14px}
.tour__count{font-size:12px;color:var(--muted)}
.tour--still,.tour--still *{animation:none!important;transition:none!important}
body.is-touring{overflow:hidden}
.flowcol{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;min-width:0;align-content:start}.flowcol>section{min-width:0}
/* demo before/after */
.compare--demo{cursor:default;pointer-events:none}
.demo{flex:none}
.demo--small{width:118px;padding:4px}
.demo .compare__tag{font-size:10.5px;padding:1px 8px;bottom:8px}
.demo .compare__tag--before{right:8px}.demo .compare__tag--after{left:8px}
.demo-row{display:flex;gap:14px;align-items:center;margin:0 0 18px;padding:10px 14px 10px 10px;border-radius:20px;background:var(--glass)}
.demo-row__text{display:grid;gap:3px;font-size:13px;line-height:1.85;color:var(--ink-2)}
.demo-row__text b{font-family:var(--display);font-weight:800;font-size:17px;color:var(--ink)}
.tour__demo{width:150px;margin:0 auto 16px}
/* after sending */
.sent__follow{display:grid;gap:8px;width:100%;margin-top:4px;padding:14px;border-radius:18px;background:var(--glass)}
.sent__hint{font-size:13px;color:var(--ink-2);line-height:1.85}
/* your request card */
.mine{padding:16px 18px;box-shadow:inset 0 3px 0 var(--accent),var(--lift)}
.mine--booked{box-shadow:inset 0 3px 0 var(--ok),var(--lift)}.mine--declined{box-shadow:inset 0 3px 0 var(--honey),var(--lift)}
.mine__head{display:flex;gap:12px;align-items:center}
.mine__icon{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:var(--glass);font-size:20px;flex:none}
.mine__head b{display:block;font-size:15px}
.mine__meta{font-size:12.5px;color:var(--muted)}
.mine__steps{list-style:none;margin:14px 0 0;padding:0;display:grid;grid-template-columns:repeat(3,1fr);position:relative}
.mine__steps::before{content:"";position:absolute;top:6px;inset-inline:16%;height:2px;background:var(--line)}
.mine__steps li{display:grid;justify-items:center;gap:6px;position:relative;font-size:12px;color:var(--muted)}
.mine__steps li span{width:14px;height:14px;border-radius:50%;background:var(--line);box-shadow:0 0 0 4px var(--surface)}
.mine__steps li.is-on{color:var(--ink)}.mine__steps li.is-on span{background:var(--accent)}
.mine__note{font-size:13px;color:var(--ink-2);margin-top:12px;line-height:1.85}
.mine__actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
/* 360 viewer */
.spin-wrap{width:min(100%,330px);margin:4px auto 0;padding:6px}
.spin{position:relative;aspect-ratio:3/4;border-radius:999px 999px 13px 13px;overflow:hidden;background:linear-gradient(170deg,#f4f7f6,#d6dfdb);touch-action:pan-y;user-select:none;-webkit-user-select:none;outline:none}
.spin:focus-visible{box-shadow:0 0 0 3px var(--accent-ring)}
.spin.is-ready{cursor:grab}.spin.is-ready:active{cursor:grabbing}
.spin__layer{position:absolute;inset:0;background-repeat:no-repeat;background-size:300% 100%;opacity:0;transition:opacity .35s ease}
.spin__layer.is-on{opacity:1}
.spin__loading{position:absolute;inset:0;display:grid;place-items:center;align-content:center;gap:14px;padding:20px;text-align:center;transition:opacity .35s var(--ease);perspective:700px}
.spin.is-ready .spin__loading{opacity:0}
.spin__orbit{width:58%;aspect-ratio:3/4;border-radius:999px 999px 12px 12px;overflow:hidden;box-shadow:var(--float);animation:sway 3.2s ease-in-out infinite;transform-style:preserve-3d}
.spin__orbit img{width:100%;height:100%;object-fit:cover}
@keyframes sway{0%,100%{transform:rotateY(-24deg)}50%{transform:rotateY(24deg)}}
.spin__ring{position:absolute;left:50%;top:44%;width:84%;aspect-ratio:1;transform:translate(-50%,-50%) rotateX(74deg);border-radius:50%;border:2px dashed rgba(12,107,107,.35);animation:orbit 6s linear infinite;pointer-events:none}
@keyframes orbit{to{transform:translate(-50%,-50%) rotateX(74deg) rotate(360deg)}}
.spin__tip{font-size:13px;color:var(--ink-2);min-height:1.8em}
.spin__track{width:62%;height:4px;border-radius:9px;background:rgba(35,23,15,.1);overflow:hidden}
.spin__bar{display:block;height:100%;width:2%;background:var(--accent);border-radius:9px;transition:width .4s linear}
.spin__controls{margin-top:12px;display:grid;gap:12px}.spin__controls[hidden]{display:none}
.spin__row{display:flex;align-items:center;gap:12px;justify-content:center}
.spin__dial{position:relative;width:34px;height:34px;border-radius:50%;border:2px solid var(--line);--r:0deg}
.spin__dial::before{content:"";position:absolute;left:50%;top:-6px;width:2px;height:6px;margin-left:-1px;background:var(--muted);border-radius:2px}
.spin__dot{position:absolute;inset:0;transform:rotate(var(--r));transition:transform .2s var(--ease)}
.spin__dot::after{content:"";position:absolute;left:50%;top:2px;width:8px;height:8px;margin-left:-4px;border-radius:50%;background:var(--accent)}
.spin__angle{min-width:58px;font-weight:700;font-size:14px;text-align:center}
.spin__thumbs{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-width:260px;margin:0 auto;width:100%}
.spin__thumb{aspect-ratio:3/4;border-radius:999px 999px 6px 6px;border:2px solid transparent;background-size:300% 100%;background-repeat:no-repeat;padding:0;opacity:.6;transition:opacity .15s,border-color .15s}
.spin__thumb.is-on{border-color:var(--accent);opacity:1}
.spin__note{text-align:center;margin-top:10px}
.layout--solo{grid-template-columns:minmax(0,1fr)!important;max-width:760px;margin:0 auto}
.about-btn{display:inline-flex;align-items:center;gap:7px;min-height:42px;padding:0 15px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-weight:600;font-size:13.5px}
.about-btn:hover{border-color:#b3c0bb}
.about-btn svg{width:18px;height:18px;color:var(--accent)}
.hero__tag{margin-top:6px;font-size:14.5px;line-height:1.9;color:var(--ink-2);max-width:52ch}
.about__bio{font-size:14.5px;line-height:2;color:var(--ink-2);margin-bottom:16px}
.about__quick{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:12px}
.sidecard__lead{font-size:13px;color:var(--muted);margin:-8px 0 14px}
.style-card{padding:0;overflow:hidden;min-height:0}
.style-card__art{display:block;aspect-ratio:4/5;background:linear-gradient(170deg,#eef2f0,#d6dfdb);overflow:hidden}
.style-card__art img{width:100%;height:100%;object-fit:cover;transition:transform .3s var(--ease)}
.style-card:hover .style-card__art img{transform:scale(1.03)}
.style-card__art.is-missing{aspect-ratio:auto;height:6px}
.style-card__body{display:grid;gap:0;padding:10px 12px 12px}
.style-card__name{font-size:16px}
.style-card.is-on .style-card__art{box-shadow:inset 0 -4px 0 var(--ink)}
.color{margin-top:20px;padding-top:18px;border-top:1px solid var(--line-2)}
.color__box{position:relative}
.color__box input{display:block;width:100%;min-height:var(--tap);padding:11px 14px;padding-inline-end:44px;border:1px solid var(--line);border-radius:var(--r-sm);background:#fff;color:var(--ink)}
.color__box input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 4px var(--accent-ring)}
.color__clear{position:absolute;inset-inline-end:6px;top:50%;transform:translateY(-50%);width:34px;height:34px;border:0;border-radius:50%;background:var(--glass);color:var(--ink-2);font-size:19px;line-height:1}
.color__list{position:absolute;inset-inline:0;top:calc(100% + 6px);z-index:20;margin:0;padding:6px;list-style:none;background:var(--surface);border:1px solid var(--line-2);border-radius:16px;box-shadow:var(--float);max-height:300px;overflow:auto}
.color__list li{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:10px;cursor:pointer;font-size:14px}
.color__list li:hover,.color__list li.is-active{background:var(--glass)}
.color__list .color__free{color:var(--muted);font-size:13px;cursor:default}
.swatch{width:26px;height:26px;border-radius:50%;flex:none;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)}
.color .hint{display:block;font-size:12px;color:var(--muted);margin-top:6px;line-height:1.7}
.send-note{display:flex;gap:9px;align-items:flex-start;margin-top:12px;font-size:13px;line-height:1.85;color:var(--muted)}
.send-note svg{width:17px;height:17px;flex:none;margin-top:3px;color:var(--accent)}
.outbox{display:flex;gap:14px;align-items:center;padding:12px;border-radius:16px;background:var(--glass);margin-bottom:14px}
.outbox b{display:block;font-size:14.5px;line-height:1.6}
.outbox p{font-size:13px;color:var(--ink-2);line-height:1.8;margin-top:2px}
.outbox__thumbs{display:flex;flex:none}
.outbox__thumbs img{width:46px;height:60px;object-fit:cover;border-radius:999px 999px 8px 8px;border:3px solid var(--surface);background:var(--glass-2)}
.outbox__thumbs img+img{margin-inline-start:-14px}
.how{margin:0 0 18px;padding:0;list-style:none;counter-reset:how;display:grid;gap:8px}
.how li{counter-increment:how;display:flex;gap:10px;align-items:flex-start;font-size:13.5px;line-height:1.8;color:var(--ink-2)}
.how li::before{content:counter(how,persian);width:24px;height:24px;flex:none;border-radius:50%;display:grid;place-items:center;background:var(--ink);color:#fff;font-size:12px;font-weight:700;margin-top:1px}
.sent{display:grid;justify-items:center;gap:12px;text-align:center;padding:10px 0 4px}
.sent__mark{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;background:var(--ok-soft);color:var(--ok)}
.sent__mark svg{width:32px;height:32px}
.sent h2{font-family:var(--display);font-weight:800;font-size:24px}
.sent p{color:var(--ink-2);line-height:1.95;max-width:40ch}
.fatal{display:grid;gap:14px;justify-items:start;padding:28px;margin:40px auto;max-width:460px}
.fatal h1{font-family:var(--display);font-weight:800;font-size:26px}

/* ---------- the chosen look is unmistakable: accent frame, tick and a small lift ---------- */
.looks .style-card{position:relative;transition:border-color .15s var(--ease),box-shadow .15s var(--ease),transform .15s var(--ease)}
.looks .style-card.is-on{border-color:var(--accent);background:#fff;box-shadow:0 0 0 3px var(--accent),0 14px 26px -16px rgba(7,76,77,.75);transform:translateY(-2px)}
.looks .style-card.is-on .style-card__art{box-shadow:none}
.looks .style-card.is-on .style-card__name{color:var(--accent-ink)}
.looks .style-card.is-on::after{content:"";position:absolute;top:8px;inset-inline-start:8px;z-index:2;width:30px;height:30px;border-radius:50%;background:var(--accent) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12.5l4.5 4.5L19 7.5'/%3E%3C/svg%3E") center/18px no-repeat;box-shadow:0 0 0 3px #fff,0 4px 10px rgba(0,0,0,.25);animation:pop .35s var(--ease) both}
@media (prefers-reduced-motion:reduce){.looks .style-card{transition:none}.looks .style-card.is-on{transform:none}.looks .style-card.is-on::after{animation:none}}
/* ---------- sticky header: services above, a slim stepper below on its own strip ---------- */
.steps{background:rgba(232,237,235,.94);border-bottom:0;box-shadow:0 8px 18px -16px rgba(35,23,15,.5)}
.steps__top{padding:10px 0 10px}
.steps__topin{display:flex;justify-content:center}
.linesw{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:0;background:transparent;box-shadow:none;border-radius:0;width:min(100%,520px)}
.linesw__btn{min-height:46px;border:1.5px solid var(--line-2);border-radius:14px;background:var(--surface);color:var(--muted);box-shadow:0 1px 2px rgba(35,23,15,.05)}
.linesw__btn:hover{color:var(--ink);border-color:var(--line)}
.linesw__btn.is-on{background:var(--accent);border-color:var(--accent);color:#fff;box-shadow:0 8px 16px -10px rgba(7,76,77,.9)}
.linesw__btn.is-on svg{color:#fff}
.steps__bottom{background:var(--surface);border-top:1px solid var(--line-2);border-bottom:1px solid var(--line-2)}
.steps__list{display:flex;align-items:center;gap:8px;padding:6px 18px;grid-template-columns:none;max-width:560px;margin-inline:auto}
.steps__item{flex:none;min-height:34px;padding:0 2px;gap:6px;font-size:12.5px;font-weight:600;color:var(--muted);border-radius:10px}
.steps__item::after{display:none}
.steps__num{width:22px;height:22px;font-size:11.5px;border-width:1.5px}
.steps__line{flex:1;height:2px;min-width:14px;border-radius:2px;background:var(--line)}
.steps__line.is-done{background:var(--accent)}
.steps__label{overflow:visible;white-space:nowrap}
@media(max-width:479px){
 .linesw{gap:6px}
 .linesw__btn{min-height:54px;border-radius:14px}
}
/* ---------- toasts sit at the top, never over the choices or the dock; a tap closes them ---------- */
.toast{top:calc(env(safe-area-inset-top,0px) + 10px);bottom:auto;transform:translateY(-12px);pointer-events:auto;cursor:pointer;font-size:13.5px;line-height:1.8}
/* ---------- images that are still loading: a soft shimmer, then a fade-in ---------- */
.style-card__art,.port-card .mirror__glass,.base__opt img{background-image:linear-gradient(100deg,rgba(255,255,255,0) 30%,rgba(255,255,255,.55) 50%,rgba(255,255,255,0) 70%);background-size:220% 100%;background-color:#dfe7e4;animation:shimmer 1.3s linear infinite}
.style-card__art--sw{background-image:none;animation:none}
@keyframes shimmer{from{background-position:120% 0}to{background-position:-120% 0}}
img[loading="lazy"]{opacity:0;transition:opacity .35s var(--ease)}
img[loading="lazy"].is-in{opacity:1}
.style-card__art.is-in,.port-card .mirror__glass.is-in{animation:none;background-image:none}
@media (prefers-reduced-motion:reduce){.style-card__art,.port-card .mirror__glass{animation:none}img[loading="lazy"]{transition:none}}
/* ---------- four services on a phone: icon above the word ---------- */
@media(max-width:479px){
 .linesw{border-radius:18px;width:100%}
 .linesw__btn{flex-direction:column;gap:2px;min-height:52px;padding:6px 2px;border-radius:14px;font-size:12.5px}
 .linesw__btn svg{width:20px;height:20px}
}
/* ---------- step 2: the photo just arrived ---------- */
.selfie--fresh{animation:fresh 1.6s var(--ease) both}
.selfie--fresh img{animation:pop .55s var(--ease) both}
@keyframes fresh{0%{background:var(--ok-soft);box-shadow:0 0 0 3px rgba(43,106,64,.25)}100%{background:var(--glass);box-shadow:0 0 0 0 rgba(43,106,64,0)}}
.fine-print{font-size:12px;color:var(--muted);line-height:1.85;margin-top:10px;text-align:center}
.upload--ref{aspect-ratio:auto;min-height:220px;border-radius:var(--r-lg)}
/* ---------- hair colour: on the new hairstyle or the original photo ---------- */
.base-wrap{margin:0 0 16px}
.base{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:6px}
.base__opt{display:flex;align-items:center;gap:10px;padding:8px;border:1.5px solid var(--line-2);border-radius:16px;background:var(--surface-2);text-align:start;font:inherit;color:var(--ink);cursor:pointer;min-width:0}
.base__opt img{width:46px;height:58px;object-fit:cover;border-radius:22px 22px 8px 8px;flex:none}
.base__opt span{display:grid;gap:2px;min-width:0}.base__opt b{font-size:13px;line-height:1.5}.base__opt small{font-size:11.5px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.base__opt.is-on{border-color:var(--accent);background:#fff;box-shadow:0 0 0 3px var(--accent-ring)}
.basehint{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 12px;margin:0 0 16px;border-radius:16px;background:var(--honey-soft);font-size:12.5px;line-height:1.8;color:var(--ink-2)}
.basehint>span:first-child{display:inline-grid;color:var(--honey)}.basehint svg{width:20px;height:20px}
.basehint>span:nth-child(2){flex:1;min-width:180px}
.style-card__art--sw.is-missing{aspect-ratio:4/5;height:auto}
.style-card__dot{position:absolute;inset-inline-end:8px;bottom:8px;width:16px;height:16px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3)}
.build--color .build__fx,.looks .style-card__art{position:relative}
/* ---------- after a hairstyle: try a colour on it ---------- */
.next-line{display:flex;align-items:center;gap:12px;width:100%;margin-top:16px;padding:12px 14px;border:1.5px dashed #c9a46a;border-radius:18px;background:linear-gradient(100deg,#fbf3e4,#f6ead2);text-align:start;font:inherit;color:var(--ink);cursor:pointer;transition:transform .15s var(--ease)}
.next-line:hover{transform:translateY(-1px)}
.next-line__ico{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:var(--honey);color:#fff;flex:none}.next-line__ico svg{width:22px;height:22px}
.next-line b{display:block;font-size:14px}.next-line small{font-size:12px;color:var(--muted)}
.next-line__go{margin-inline-start:auto;display:inline-grid;color:var(--honey)}.next-line__go svg{width:20px;height:20px}
/* ---------- building: a small scene for each service ---------- */
.build-wrap{display:grid;gap:16px;margin-top:16px}
@media(min-width:640px){.build-wrap{grid-template-columns:minmax(0,300px) minmax(0,1fr);align-items:center;gap:26px}}
.build{width:min(100%,320px);margin:0 auto}
.build .mirror__glass{position:relative;aspect-ratio:3/4;overflow:hidden;background:#20302e}
.build__photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(.55) brightness(.72);animation:breathe 4s ease-in-out infinite}
@keyframes breathe{50%{transform:scale(1.035)}}
.build__scan{position:absolute;inset-inline:0;top:-30%;height:30%;background:linear-gradient(180deg,transparent,rgba(255,255,255,.28),transparent);animation:scan 2.4s ease-in-out infinite}
.build__fx{position:absolute;inset:0;pointer-events:none}
.fx{position:absolute;width:64px;height:64px;filter:drop-shadow(0 6px 10px rgba(0,0,0,.35))}
.build__pct{position:absolute;inset-inline:0;bottom:14px;display:flex;justify-content:center;align-items:baseline;gap:2px;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.45)}
.build__pct b{font-family:var(--display);font-weight:800;font-size:40px;line-height:1}.build__pct span{font-size:20px;font-weight:700}
.build__spark{position:absolute;color:#ffe9b8;font-size:18px;animation:twinkle 1.8s ease-in-out infinite;text-shadow:0 0 10px rgba(255,220,150,.9)}
.build__spark--1{top:14%;inset-inline-start:16%}.build__spark--2{top:38%;inset-inline-end:12%;animation-delay:.6s;font-size:14px}.build__spark--3{top:62%;inset-inline-start:22%;animation-delay:1.2s;font-size:22px}
@keyframes twinkle{0%,100%{opacity:0;transform:scale(.4) rotate(0)}50%{opacity:1;transform:scale(1) rotate(25deg)}}
/* hair: scissors snipping across the hair, little cut ends falling */
.fx--scissors{top:12%;left:10%;animation:snipPath 3.6s ease-in-out infinite alternate}
.fx__b1,.fx__b2{transform-origin:33px 32px}
.fx__b1{animation:bladeA .32s ease-in-out infinite alternate}.fx__b2{animation:bladeB .32s ease-in-out infinite alternate}
@keyframes bladeA{to{transform:rotate(-14deg)}}@keyframes bladeB{to{transform:rotate(14deg)}}
@keyframes snipPath{0%{transform:translate(0,0) rotate(-8deg)}50%{transform:translate(60px,22px) rotate(6deg)}100%{transform:translate(150px,6px) rotate(-4deg)}}
.fx__bit{position:absolute;top:24%;width:14px;height:3px;border-radius:3px;background:#e9d3b6;opacity:0;animation:fall 2.2s ease-in infinite}
.fx__bit:nth-of-type(1){left:28%}.fx__bit:nth-of-type(2){left:48%;animation-delay:.5s}.fx__bit:nth-of-type(3){left:64%;animation-delay:1s}.fx__bit:nth-of-type(4){left:38%;animation-delay:1.5s}
@keyframes fall{0%{opacity:0;transform:translateY(0) rotate(0)}15%{opacity:1}100%{opacity:0;transform:translateY(150px) rotate(220deg)}}
/* colour: a brush painting a wash of the chosen colour down the hair */
.fx__wash{position:absolute;inset:0;background:linear-gradient(180deg,var(--wash) 0,var(--wash) 55%,transparent 80%);mix-blend-mode:color;opacity:.85;clip-path:inset(0 0 100% 0);animation:wash 3.4s var(--ease) infinite}
@keyframes wash{0%{clip-path:inset(0 0 100% 0)}70%,100%{clip-path:inset(0 0 22% 0)}}
.fx--brush{top:4%;left:8%;animation:brushPath 1.7s ease-in-out infinite alternate}
@keyframes brushPath{0%{transform:translate(0,0) rotate(-6deg)}100%{transform:translate(150px,70px) rotate(10deg)}}
/* nails: a polish bottle bobbing and a brush gliding */
.fx--bottle{bottom:24%;inset-inline-start:12%;animation:bob 1.4s ease-in-out infinite alternate}
@keyframes bob{to{transform:translateY(-10px) rotate(-6deg)}}
.fx--wand{top:30%;inset-inline-end:14%;animation:stroke 1.1s ease-in-out infinite alternate}
@keyframes stroke{0%{transform:translate(0,0) rotate(0)}100%{transform:translate(-40px,26px) rotate(-12deg)}}
/* lashes: an eye blinking while its lashes grow one by one */
.fx--eye{width:120px;height:75px;top:26%;left:50%;margin-left:-60px}
.fx__lid{transform-origin:40px 30px;animation:blink 3.2s ease-in-out infinite}
@keyframes blink{0%,44%,56%,100%{transform:scaleY(1)}50%{transform:scaleY(.08)}}
.fx__lash path{stroke-dasharray:14;stroke-dashoffset:14;animation:grow 3.2s ease-out infinite}
.fx__lash path:nth-child(2){animation-delay:.15s}.fx__lash path:nth-child(3){animation-delay:.3s}.fx__lash path:nth-child(4){animation-delay:.45s}.fx__lash path:nth-child(5){animation-delay:.6s}.fx__lash path:nth-child(6){animation-delay:.75s}
@keyframes grow{0%{stroke-dashoffset:14}30%,85%{stroke-dashoffset:0}100%{stroke-dashoffset:0;opacity:0}}
.build__side{display:grid;gap:12px}
.build__title{font-family:var(--display);font-weight:800;font-size:19px}
.build__steps{list-style:none;display:grid;gap:8px;margin:0;padding:0}
.build__steps li{display:flex;align-items:center;gap:10px;font-size:13.5px;color:var(--muted)}
.build__steps li span{width:22px;height:22px;border-radius:50%;border:1.5px solid var(--line);display:grid;place-items:center;flex:none;background:var(--surface)}
.build__steps li span svg{width:13px;height:13px}
.build__steps li.is-done{color:var(--ink-2)}.build__steps li.is-done span{background:var(--accent);border-color:var(--accent);color:#fff}
.build__steps li.is-on{color:var(--ink);font-weight:700}.build__steps li.is-on span{border-color:var(--accent);box-shadow:0 0 0 4px var(--accent-ring);animation:ping 1.2s ease-in-out infinite}
@keyframes ping{50%{box-shadow:0 0 0 7px rgba(12,107,107,.08)}}
@media (prefers-reduced-motion:reduce){
 .build__photo,.build__scan,.build__spark,.fx,.fx__b1,.fx__b2,.fx__bit,.fx__wash,.fx__lid,.fx__lash path,.build__steps li.is-on span,.selfie--fresh,.selfie--fresh img{animation:none}
 .fx__wash{clip-path:inset(0 0 40% 0)}.fx__lash path{stroke-dashoffset:0}.fx__bit{display:none}
}
`;

const clientJS=String.raw`
var STYLES=__STYLES__;
var LINES=__LINES__;
var MARK=__MARK__;
var SLUG=location.pathname.split('/').filter(Boolean)[1]||'';
var ICO={
 camera:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.2a2 2 0 0 0 1.7-.9l.6-1a2 2 0 0 1 1.7-.9h2.6a2 2 0 0 1 1.7.9l.6 1a2 2 0 0 0 1.7.9h1.2A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z"/><circle cx="12" cy="12.5" r="3.4"/></svg>',
 lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><rect x="4.5" y="10" width="15" height="10" rx="2.6"/><path d="M8.5 10V7.8a3.5 3.5 0 0 1 7 0V10"/></svg>',
 phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 3.5h2.2l1.6 4-2 1.3a12 12 0 0 0 6.4 6.4l1.3-2 4 1.6v2.2a2.5 2.5 0 0 1-2.7 2.5A16.5 16.5 0 0 1 4 6.2 2.5 2.5 0 0 1 6.5 3.5z"/></svg>',
 pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s6.5-6 6.5-11a6.5 6.5 0 1 0-13 0C5.5 15 12 21 12 21z"/><circle cx="12" cy="10" r="2.4"/></svg>',
 clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5l3.2 2"/></svg>',
 instagram:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r="1"/></svg>',
 globe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.4 3.6 8.5S14.4 18.1 12 20.5c-2.4-2.4-3.6-5.4-3.6-8.5S9.6 5.9 12 3.5z"/></svg>',
 send:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4 3.5 10.6l6.3 2.6 2.6 6.3z"/><path d="M20 4l-7.6 15.5"/></svg>',
 spark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z"/><path d="M18.5 16.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/></svg>',
 download:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11"/><path d="m7.5 11 4.5 4.5L16.5 11"/><path d="M4.5 19.5h15"/></svg>',
 check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7"/></svg>',
 info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.4"/></svg>',
 warn:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4.5 21 19.5H3z"/><path d="M12 10v4.5M12 17.2v.3"/></svg>',
 user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c1.2-3.4 3.9-5.2 7.5-5.2s6.3 1.8 7.5 5.2"/></svg>',
 scissors:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="6.5" cy="6.5" r="2.5"/><path d="M8.7 8.3 20 19M8.7 15.7 20 5"/></svg>',
 sun:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/></svg>',
 gallery:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="m20.5 15-4.6-4.4L7 19.5"/></svg>',
 orbit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="9" ry="3.6"/><path d="M12 3.5c2 1.6 3.2 4.7 3.2 8.5s-1.2 6.9-3.2 8.5"/><path d="m18.6 13.8 2 1.6-2.3 1"/></svg>',
 drop:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.2c3.2 3.7 5.6 6.9 5.6 10a5.6 5.6 0 0 1-11.2 0c0-3.1 2.4-6.3 5.6-10Z"/><path d="M9.2 14.2a2.9 2.9 0 0 0 2.6 2.6"/></svg>',
 nails:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21v-9.5a4 4 0 0 1 8 0V21"/><path d="M10 11.5V9a2 2 0 0 1 4 0v2.5"/></svg>',
 lashes:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13c2.5-3.2 5.5-4.8 9-4.8s6.5 1.6 9 4.8"/><path d="M3 13c2.5 3 5.5 4.5 9 4.5s6.5-1.5 9-4.5"/><circle cx="12" cy="13" r="2.4"/><path d="M6 9.6 4.8 7.6M9 8.5l-.6-2.2M12 8.2V6M15 8.5l.6-2.2M18 9.6l1.2-2"/></svg>',
 arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12H4M10 6l-6 6 6 6"/></svg>',};
var state={line:'dress',opts:{},ratio:'',pub:null,step:1,original:null,reference:null,refTitle:'',style:null,tab:'salon',transfer:'both',color:'',result:null,gen:null,genState:null,busy:false,error:'',session:false,verified:false,idem:null,rating:0,me:null};
try{state.me=JSON.parse(localStorage.getItem('ayneh-me')||'null')}catch(e){}
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
function fa(n){return new Intl.NumberFormat('fa-IR').format(n)}
function fmt(ms){if(!ms)return '';try{return new Intl.DateTimeFormat('fa-IR',{timeZone:'Asia/Tehran',dateStyle:'medium',timeStyle:'short'}).format(ms)}catch(e){return ''}}
function uuid(){var b=crypto.getRandomValues(new Uint8Array(16));b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;var x=Array.prototype.map.call(b,function(v){return v.toString(16).padStart(2,'0')}).join('');return x.slice(0,8)+'-'+x.slice(8,12)+'-'+x.slice(12,16)+'-'+x.slice(16,20)+'-'+x.slice(20)}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms)})}
function tehranDate(d){var p={};new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d).forEach(function(x){p[x.type]=x.value});return p.year+'-'+p.month+'-'+p.day}
function el(tag,attrs,children){var e=document.createElement(tag);attrs=attrs||{};Object.keys(attrs).forEach(function(k){var v=attrs[k];if(v===undefined||v===null)return;if(k==='text')e.textContent=v;else if(k==='html')e.innerHTML=v;else if(k==='class')e.className=v;else if(k.slice(0,2)==='on')e.addEventListener(k.slice(2),v);else if(k==='checked'||k==='disabled'||k==='hidden'||k==='required')e[k]=!!v;else e.setAttribute(k,v)});(children||[]).forEach(function(c){if(c!==null&&c!==undefined&&c!==false)e.append(c)});return e}
function h(tag,text,cls){return el(tag,{class:cls||'',text:text})}
function media(id){return '/api/s/'+SLUG+'/media/'+id}
function api(path,body,raw){
 var init={};
 if(body!==undefined){init.method='POST';init.headers=raw?{}:{'Content-Type':'application/json'};init.body=raw?body:JSON.stringify(body)}
 return fetch('/api/s/'+SLUG+'/'+path,init).then(function(r){return r.json().catch(function(){return {}}).then(function(d){if(!r.ok)throw new Error(d.error||'خطای ارتباط با سرور');return d})})
}
function toast(msg,kind){
 var t=$('#toast');if(!t)return;
 t.textContent=msg;t.className='toast is-on'+(kind==='error'?' is-error':'');
 if(!t.__tap){t.__tap=1;t.addEventListener('click',function(){t.className='toast'})}
 clearTimeout(window.__tt);window.__tt=setTimeout(function(){t.className='toast'},kind==='error'?6500:4200);
}
function svg(name){return el('span',{html:ICO[name]||'',class:'ico'})}

/* ---------- lazy images fade in when they arrive (or show their frame if they fail) ---------- */
document.addEventListener('load',function(e){var t=e.target;if(t&&t.tagName==='IMG'&&t.loading==='lazy'){t.classList.add('is-in');if(t.parentNode&&t.parentNode.classList)t.parentNode.classList.add('is-in')}},true);
document.addEventListener('error',function(e){var t=e.target;if(t&&t.tagName==='IMG'&&t.parentNode&&t.parentNode.classList)t.parentNode.classList.add('is-in')},true);
/* ---------- anonymous usage events (no name, phone or photo) ---------- */
var VISITOR=(function(){var v='';try{v=localStorage.getItem('ayneh-v')||''}catch(e){}if(!/^[a-f0-9]{32}$/.test(v)){v=Array.prototype.map.call(crypto.getRandomValues(new Uint8Array(16)),function(b){return b.toString(16).padStart(2,'0')}).join('');try{localStorage.setItem('ayneh-v',v)}catch(e){}}return v})();
var tracked={};
function track(kind,meta,once){if(once){if(tracked[kind+meta])return;tracked[kind+meta]=1}try{fetch('/api/s/'+SLUG+'/track',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:kind,v:VISITOR,meta:meta==null?'':String(meta)}),keepalive:true}).catch(function(){})}catch(e){}}

/* ---------- boot ---------- */
(async function boot(){
 try{state.pub=await api('public')}catch(e){showFatal(e.message);return}
 // Referral: who brought this visitor (kept by the server for good) and the tag for her own shares.
 var refIn=(location.search.match(/[?&]r=([a-z0-9]{1,20})/)||[])[1]||'';
 try{var rr=await Promise.race([api('ref',{v:VISITOR,r:refIn}),sleep(2500).then(function(){return null})]);if(rr){state.tag=rr.tag;state.mine=rr.mine||null}}catch(e){}
 if(refIn&&history.replaceState){try{history.replaceState(null,'',location.pathname)}catch(e){}}
 if(state.mine)state.pub.portfolio=(state.pub.portfolio||[]).slice().sort(function(a,b){return (b.maker===state.mine)-(a.maker===state.mine)});
 document.title=state.pub.salon.name+' | آینه مزون';
 if(state.pub.trial)trialBar(state.pub.trial);
 if(state.pub.demo)document.body.prepend(el('div',{class:'trialbar',role:'status'},[document.createTextNode('نسخهٔ نمونهٔ آینه · روزی ۳ تصویر · '),el('a',{href:'/#start',style:'color:#fff;text-decoration:underline',text:'صفحهٔ مزون خودتان را بسازید'})]));
 var lq=(location.search.match(/[?&]l=(dress)/)||[])[1];var lm=null;try{lm=localStorage.getItem('ayneh-line-'+SLUG)}catch(e){}
 var pending=null;try{pending=sessionStorage.getItem('ayneh-job-'+SLUG)}catch(e){}
 var pm=pending&&pending.match(/^(dress):(.+)$/);if(pm){lq=pm[1];pending=pm[2]}
 state.line=lq||(LINES.label[lm]?lm:'dress');document.body.setAttribute('data-line',state.line);
 // The landing page hands over the look the visitor picked: ?s=<hair style index>&c=<colour name>.
 var qs=(location.search.match(/[?&]s=(\d{1,2})/)||[])[1],qc=(location.search.match(/[?&]c=([^&]{1,240})/)||[])[1];
 if(qs!==undefined&&state.line==='hair'&&+qs<20)state.style=+qs;
 if(qc){try{state.color=decodeURIComponent(qc).slice(0,60)}catch(e){}}
 // Open on the salon's own work for this line when it has some, otherwise on the ready-made looks.
 state.tab=hasLineWork(state.line)?'salon':'catalog';
 renderAll();
 if(pending){state.gen=pending;state.step=3;state.busy=true;state.genT0=Date.now()-8000;renderFlow();renderDock();poll(pending,true)}
 track('view',refIn?'share':'',true);
 renderInvite();
 maybeTour();
 loadMine();
})();

/* ---------- free trial strip: brand colour, time left, images left ---------- */
function trialBar(t){
 var root=document.documentElement;
 if(/^#[0-9a-f]{6}$/i.test(t.brand||'')){var n=parseInt(t.brand.slice(1),16),r=n>>16,g=(n>>8)&255,b=n&255,mix=function(k,to){return 'rgb('+[r,g,b].map(function(c){return Math.round(c+(to-c)*k)}).join(',')+')'};root.style.setProperty('--accent',mix(.18,0));root.style.setProperty('--accent-ink',mix(.45,0));root.style.setProperty('--accent-soft',mix(.82,255));root.style.setProperty('--accent-ring','rgba('+r+','+g+','+b+',.3)')}
 var bar=el('div',{class:'trialbar',role:'status'}),fa=function(x){return String(x).replace(/\d/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'[d]})};
 function paint(){var ms=t.expires_at-Date.now();if(t.expired||ms<=0){bar.textContent='مهلت صفحهٔ آزمایشی تمام شد. برای ادامه با آینه تماس بگیرید.';bar.classList.add('is-over');var main=$('#main');if(main&&!$('.trial-over')){main.replaceChildren(el('div',{class:'panel fatal trial-over'},[h('h1','مهلت صفحهٔ آزمایشی تمام شد'),h('p','این صفحه ۱۰ ساعت و ۵ تصویر برای امتحان داشت. برای نسخهٔ دائمی با آینه تماس بگیرید.','muted'),el('a',{class:'btn btn--primary',href:'/#start',text:'درخواست نسخهٔ دائمی'})]))}return}
  var m=Math.ceil(ms/60000),hh=Math.floor(m/60),mm=m%60;bar.textContent='صفحهٔ آزمایشی · '+fa(hh)+' ساعت و '+fa(mm)+' دقیقه مانده · '+fa(t.images_left)+' تصویر از '+fa(t.images_limit)}
 paint();document.body.prepend(bar);setInterval(paint,30000);
 window.__trialLeft=function(){return api('public').then(function(p){if(p.trial){t.images_left=p.trial.images_left;t.expired=p.trial.expired;paint()}}).catch(function(){})};
}

function showFatal(msg){
 var main=$('#main');if(!main)return;
 main.replaceChildren(el('div',{class:'panel fatal'},[h('h1','این صفحه باز نشد'),h('p',msg,'muted'),el('a',{class:'btn btn--primary',href:'/',text:'بازگشت به آینه'})]));
 var dock=$('#dock');if(dock)dock.hidden=true;
}

/* ---------- header ---------- */
function heroTag(){return 'لباس عروس را روی اندام خودت ببین؛ سایز و فرم بدنت همان می‌ماند. بعد برای مزون بفرست.'}
function renderHead(){
 var s=state.pub.salon,p=s.profile||{},head=$('#head');
 var bar=el('div',{class:'hero__bar'},[el('span',{class:'brand',html:MARK+'<span>آینه مزون</span>'}),el('div',{class:'hero__tools'},[el('button',{class:'help-btn',type:'button','aria-label':'راهنمای استفاده',onclick:startTour,text:'؟'}),el('button',{class:'about-btn',type:'button',onclick:openAbout,html:ICO.info+'<span>دربارهٔ مزون</span>'})])]);
 // Full-width cover with the round logo sitting on its edge; without a cover, a soft mirror-glass panel.
 var cover=el('div',{class:'cover'+(p.cover?'':' cover--plain')},[p.cover?el('img',{class:'cover__img',src:media(p.cover),alt:'',fetchpriority:'high'}):el('span',{class:'cover__glow','aria-hidden':'true'})]);
 var logo=p.logo?el('img',{class:'cover__logo',src:media(p.logo),alt:'لوگوی '+s.name}):el('span',{class:'cover__logo cover__logo--letter','aria-hidden':'true',text:(s.name||'آ').trim().charAt(0)});
 cover.append(logo);
 var chips=el('div',{class:'hero__chips'});
 if(p.address)chips.append(el(p.map?'a':'button',{class:'hchip',href:p.map||null,target:p.map?'_blank':null,rel:p.map?'noopener noreferrer':null,type:p.map?null:'button',onclick:p.map?null:openAbout,title:p.address},[el('span',{class:'hchip__ico',html:ICO.pin}),el('span',{class:'hchip__txt',text:p.address})]));
 if(p.hours)chips.append(el('span',{class:'hchip'},[el('span',{class:'hchip__ico',html:ICO.clock}),el('span',{class:'hchip__txt',text:p.hours})]));
 var name=el('h1',{class:'hero__name',text:s.name});
 var body=el('div',{class:'hero__body'},[
  el('div',{class:'hero__text'},[name,el('p',{class:'hero__tag',text:heroTag()}),chips.childNodes.length?chips:null]),
  el('div',{class:'hero__cta'},[el('button',{class:'btn btn--primary btn--lg',type:'button',onclick:function(){go(state.original?2:1)},html:ICO.camera+'<span>شروع با عکس خودم</span>'})])
 ]);
 head.replaceChildren(el('div',{class:'wrap'},[bar,cover,body]));
 fitName(name);
}
// The salon name always sits on one line: the font shrinks to fit; only very long names wrap.
function fitName(n){
 function fit(){if(!n.isConnected)return;n.classList.remove('is-wrapped');n.style.fontSize='';var max=parseFloat(getComputedStyle(n).fontSize)||40,size=max;
  while(n.scrollWidth>n.clientWidth+1&&size>20){size-=1;n.style.fontSize=size+'px'}
  if(n.scrollWidth>n.clientWidth+1)n.classList.add('is-wrapped')}
 fit();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
 if(!fitName.on){fitName.on=1;var t=0;window.addEventListener('resize',function(){clearTimeout(t);t=setTimeout(function(){var x=$('.hero__name');if(x)fitName(x)},120)})}
}

/* ---------- about the salon: every detail lives here ---------- */
function openAbout(){
 track('about');
 var s=state.pub.salon,p=s.profile||{};
 var panel=el('div',{class:'sheet__panel about'});
 panel.append(el('div',{class:'sheet__head'},[h('h2',s.name),el('button',{class:'sheet__x',type:'button','aria-label':'بستن',text:'×',onclick:closeSheet})]));
 if(p.bio)panel.append(el('p',{class:'about__bio',text:p.bio}));
 var quick=el('div',{class:'about__quick'});
 if(p.phone)quick.append(el('a',{class:'btn btn--primary',href:'tel:'+p.phone,html:ICO.phone+'<span>تماس</span>'}));
 if(p.map)quick.append(el('a',{class:'btn btn--ghost',href:p.map,target:'_blank',rel:'noopener noreferrer',html:ICO.pin+'<span>مسیریابی</span>'}));
 if(quick.childNodes.length)panel.append(quick);
 var list=el('div',{class:'meta-list'});
 if(p.address)list.append(el(p.map?'a':'span',{class:'mi',href:p.map||null,target:p.map?'_blank':null,rel:'noopener noreferrer'},[el('span',{html:ICO.pin}),el('span',{text:p.address})]));
 if(p.hours)list.append(el('span',{class:'mi'},[el('span',{html:ICO.clock}),el('span',{text:p.hours})]));
 if(p.phone)list.append(el('a',{class:'mi',href:'tel:'+p.phone},[el('span',{html:ICO.phone}),el('span',{text:fa0(p.phone),dir:'ltr'})]));
 if(p.instagram)list.append(el('a',{class:'mi',href:p.instagram,target:'_blank',rel:'noopener noreferrer'},[el('span',{html:ICO.instagram}),el('span',{text:'اینستاگرام مزون'})]));
 if(p.telegram)list.append(el('a',{class:'mi',href:p.telegram,target:'_blank',rel:'noopener noreferrer'},[el('span',{html:ICO.send}),el('span',{text:'تلگرام مزون'})]));
 if(p.website)list.append(el('a',{class:'mi',href:p.website,target:'_blank',rel:'noopener noreferrer'},[el('span',{html:ICO.globe}),el('span',{text:'وب‌سایت'})]));
 if(!list.childNodes.length&&!p.bio)list.append(el('span',{class:'mi',text:'مزون هنوز اطلاعاتی ثبت نکرده است.'}));
 panel.append(list);
 if(p.manager)panel.append(el('div',{class:'manager'},[p.portrait?el('img',{src:media(p.portrait),alt:''}):null,el('span',{text:p.manager})]));
 openSheet(panel);
}


/* ---------- steps ---------- */
/* ---------- service lines: hairstyle, hair colour, nails, lashes ---------- */
// Each line keeps its own photo, choices and result; switching is one tap and loses nothing.
var LINE_FIELDS=['step','original','preview','ratio','reference','refTitle','style','tab','transfer','color','opts','result','gen','genState','views','viewsIdem','idem','filter','error','justUploaded','base','genBase','resultBase','genT0'];
var LINE_LIST=[['dress','لباس عروس','spark']];
var FACE=[];
var lineStore={};
function hasLineWork(line){return (state.pub&&state.pub.portfolio||[]).some(function(p){return (p.published||p.try_on)&&(p.line||'dress')===line})}
function lineDefaults(to){return {step:1,original:null,preview:null,ratio:'',reference:null,refTitle:'',style:null,tab:hasLineWork(to)?'salon':'catalog',transfer:'both',color:'',opts:{},result:null,gen:null,genState:null,views:null,viewsIdem:null,idem:null,filter:'همه',error:'',justUploaded:false,base:'hair',genBase:null,resultBase:null,genT0:0}}
function LP(){return LINES.photo[state.line]||LINES.photo.dress}
function lineCat(){return LINES[state.line]}
function catalogImg(i){return '/catalog/'+(state.line+'/')+String(i+1).padStart(2,'0')+'.webp'}
function lookPrefix(){return {dress:'d:'}[state.line]||'c:'}
function lineData(k){if(k===state.line){var o={};LINE_FIELDS.forEach(function(f){o[f]=state[f]});return o}return lineStore[k]||null}
// The newest hairstyle result made on this same photo: hair colour is tried on it by default.
function hairResult(){
 if(state.line!=='color'||!state.original)return null;
 var h=lineStore.hair;if(!h||!h.result||h.original!==state.original)return null;
 return {id:h.result,name:h.reference?(h.refTitle||'مدل دلخواه'):(h.style!==null?STYLES[h.style][0]:'مدل جدید')};
}
function baseId(){var h=hairResult();return h&&state.base!=='original'?h.id:null}
function switchLine(to,opts){
 if(to===state.line||!LINES.label[to])return;
 if(state.busy){toast('صبر کن کار فعلی تمام شود');return}
 lineStore[state.line]=lineData(state.line);
 var from=state.line,next=Object.assign({},lineStore[to]||lineDefaults(to));
 // One face photo serves hairstyle, hair colour and lashes.
 if(FACE.indexOf(to)>=0&&!next.original){
  var src=FACE.map(lineData).filter(function(d){return d&&d.original})[0];
  if(src){Object.assign(next,{original:src.original,preview:src.preview,ratio:src.ratio,step:Math.max(next.step,2)});if(to==='lashes')setTimeout(function(){toast('از همان عکس صورتت استفاده کردیم؛ اگر عکس نزدیک‌تری از چشم‌هایت داری، عوضش کن')},300)}
 }
 if(opts&&opts.step)next.step=opts.step;
 if(to==='color'&&opts&&opts.onHair)next.base='hair';
 clearTimeout(state.advT);Object.assign(state,next);state.line=to;
 try{localStorage.setItem('ayneh-line-'+SLUG,to)}catch(e){}
 if(!(opts&&opts.silent))track('line',to);
 document.body.setAttribute('data-line',to);
 renderAll();
 if(!(opts&&opts.silent)&&from!==to&&opts&&opts.scroll)focusFlow();
}
function renderAll(){renderHead();renderSteps();renderFlow();renderSide();renderDock()}
function lineSwitch(){
 var bar=el('div',{class:'linesw',role:'tablist','aria-label':'خدمت'});
 LINE_LIST.forEach(function(x){
  var on=state.line===x[0];
  bar.append(el('button',{class:'linesw__btn'+(on?' is-on':''),type:'button',role:'tab','data-line':x[0],'aria-selected':on?'true':'false',onclick:function(){switchLine(x[0])},html:ICO[x[2]]+'<span>'+x[1]+'</span>'}));
 });
 return bar;
}
// Two clearly different things: which service (big, coloured tiles) and where you are (a slim
// stepper on its own white strip).
function renderSteps(){
 var bar=$('#steps');bar.hidden=false;
 var list=el('div',{class:'steps__list wrap',role:'list','aria-label':'مراحل'});
 [['عکس تو',1],['انتخاب',2],['نتیجه',3]].forEach(function(x,k){
  var n=x[1];
  if(k)list.append(el('span',{class:'steps__line'+(state.step>=n?' is-done':''),'aria-hidden':'true'}));
  var cls='steps__item'+(state.step===n?' is-active':'')+(state.step>n?' is-done':'');
  var b=el('button',{class:cls,type:'button',role:'listitem','aria-current':state.step===n?'step':'false'},[
   el('span',{class:'steps__num',html:state.step>n?'✓':fa(n)}),
   el('span',{class:'steps__label',text:x[0]})
  ]);
  b.addEventListener('click',function(){go(n)});
  list.append(b);
 });
 bar.replaceChildren(el('div',{class:'steps__top'},[el('div',{class:'wrap steps__topin'},[lineSwitch()])]),el('div',{class:'steps__bottom'},[list]));
}
function go(n,quiet){
 if(n===2&&!state.original){toast('اول عکس خودت را اضافه کن');return}
 if(n!==1)state.justUploaded=false;clearTimeout(state.advT);
 state.step=n;renderSteps();renderFlow();renderDock();
 if(!quiet)focusFlow();
}
// Brings the top of the current step just under the sticky steps bar, and keeps it there while
// images above or inside it finish loading (unless the customer scrolls on her own meanwhile).
var userScrollAt=0;
['wheel','touchmove','keydown'].forEach(function(ev){window.addEventListener(ev,function(){userScrollAt=Date.now()},{passive:true})});
function focusFlow(){
 var f=$('#flow');if(!f)return;
 var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches,started=Date.now();
 function off(){var bar=$('#steps');return (bar&&!bar.hidden?bar.getBoundingClientRect().height:0)+12}
 function to(beh){var y=f.getBoundingClientRect().top+window.pageYOffset-off();window.scrollTo({top:Math.max(0,y),behavior:beh})}
 to(reduce?'auto':'smooth');
 clearTimeout(focusFlow.t1);clearTimeout(focusFlow.t2);
 function fix(){if(userScrollAt>started)return;var d=f.getBoundingClientRect().top-off();if(Math.abs(d)>24)to('auto')}
 focusFlow.t1=setTimeout(fix,650);focusFlow.t2=setTimeout(fix,1400);
}

/* ---------- flow (steps 1-3) ---------- */
function renderFlow(){
 var root=$('#flow');if(!root)return;
 // Hold the old height for a moment so the page never collapses and jumps to the banner below.
 root.style.minHeight=root.offsetHeight+'px';
 root.replaceChildren();
 requestAnimationFrame(function(){requestAnimationFrame(function(){root.style.minHeight=''})});
 if(state.step===1)root.append(stepPhoto());
 else if(state.step===2)root.append(stepModel());
 else root.append(stepResult());
}
function flowHead(title,sub){
 return el('div',{class:'flow__head'},[h('h2',title,'flow__title'),sub?h('p',sub,'flow__sub'):null]);
}
function openCamera(){var cam=el('input',{type:'file',accept:'image/*',capture:'user'});cam.style.display='none';cam.addEventListener('change',function(){handleFile(cam.files&&cam.files[0],'original');cam.remove()});document.body.append(cam);cam.click()}
function stepPhoto(){
 var box=el('div',{class:'panel flow'});
 if(!state.original&&state.preview){
  box.append(flowHead('دارم عکست را بارگذاری می‌کنم','چند ثانیه صبر کن؛ همین که آماده شد خبرت می‌کنم.'));
  box.append(el('div',{class:'photo'},[el('div',{class:'mirror'},[el('div',{class:'mirror__glass'},[el('img',{src:state.preview,alt:'عکس انتخابی شما'}),el('div',{class:'upl',role:'status'},[el('span',{class:'upl__scan'}),el('span',{text:'در حال بارگذاری…'}),el('span',{class:'upl__bar'},[el('i')])])])])]));
 }else if(!state.original){
  box.append(flowHead(LP().head,LP().sub));
  var input=el('input',{type:'file',accept:'image/jpeg,image/png,image/webp',id:'pick',class:'sr-only'});
  var drop=el('label',{class:'upload',for:'pick'},[
   el('span',{class:'upload__icon',html:ICO.camera}),
   el('strong',{text:LP().drop}),
   el('span',{class:'upload__hint',text:'از گالری انتخاب کن یا عکس را روی همین قاب رها کن'})
  ]);
  input.addEventListener('change',function(){handleFile(input.files&&input.files[0],'original')});
  ['dragenter','dragover'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.add('is-drag')})});
  ['dragleave','drop'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.remove('is-drag')})});
  drop.addEventListener('drop',function(e){var f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];handleFile(f,'original')});
  var side=el('div',{class:'shoot__side'},[
   el('ul',{class:'tips'},LP().tips.map(function(t){return el('li',{class:'tip'},[el('span',{html:ICO[t[0]]}),el('span',{},[el('b',{text:t[1]}),document.createTextNode(t[2])])])})),
   el('div',{class:'shoot__btns'},[
    el('button',{class:'btn btn--primary',type:'button',onclick:pickNow,html:ICO.gallery+'<span>انتخاب از گالری</span>'}),
    el('button',{class:'btn btn--ghost',type:'button',onclick:openCamera,html:ICO.camera+'<span>عکس با دوربین</span>'})
   ]),
   el('details',{class:'collapse'},[
    el('summary',{html:ICO.lock+'<span>عکسم کجا نگه‌داری می‌شود؟</span>'}),
    h('p','عکس فقط برای همین مزون استفاده می‌شود و دسترسی عمومی ندارد؛ در سابقهٔ مزون نگه داشته می‌شود تا مزون‌دارت بعداً هم آن را ببیند. برای شبیه‌سازی، نسخهٔ فشردهٔ عکس به سرویس تصویر ارسال می‌شود.')
   ])
  ]);
  box.append(input,el('div',{class:'demo-row'},[demoCompare('demo--small'),el('div',{class:'demo-row__text'},[h('b','این‌طوری می‌شود'),h('span',LP().demo)])]),el('div',{class:'shoot'},[drop,side]));
 }else{
  var fresh=state.justUploaded;
  box.append(flowHead(fresh?'عکست بارگذاری شد':'عکست آماده است',fresh?'الان می‌رویم سراغ انتخاب '+({color:'رنگ',nails:'طرح',dress:'لباس'}[state.line]||'مدل')+'…':LP().ready));
  box.append(el('div',{class:'photo'},[
   el('div',{class:'mirror'},[el('div',{class:'mirror__glass'},[el('img',{src:state.preview||media(state.original),alt:'عکس انتخابی شما'}),fresh?el('span',{class:'photo__badge','aria-hidden':'true',html:ICO.check}):null])]),
   fresh?el('div',{class:'photo__auto','aria-hidden':'true'},[el('i')]):null,
   el('div',{class:'photo__bar'},[
    el('span',{html:ICO.check+'<span>عکس انتخاب شد</span>'}),
    el('button',{class:'btn btn--ghost btn--sm',type:'button',onclick:changePhoto,text:'تغییر عکس'})
   ])
  ]));
  box.append(el('div',{class:'flow__nav'},[
   el('button',{class:'btn btn--primary',type:'button',onclick:function(){go(2)},text:'ادامه: انتخاب '+({color:'رنگ',nails:'طرح',dress:'لباس'}[state.line]||'مدل')})
  ]));
 }
 return box;
}
function pickedBar(text,onRemove){
 return el('div',{class:'picked'},[el('span',{text:text}),el('button',{class:'btn btn--ghost btn--sm',type:'button',onclick:onRemove,text:'حذف انتخاب'})]);
}
var TAB_LABEL={dress:['لباس‌های مزون','لباس‌های آماده','عکس لباس من'],hair:['کارهای مزون','مدل‌های آماده','عکس مدل من'],color:['کارهای مزون','رنگ‌های آماده','عکس رنگ دلخواه'],nails:['کارهای مزون','طرح‌های آماده','عکس طرح من'],lashes:['کارهای مزون','مدل‌های آماده','عکس مدل من']};
var MODEL_HEAD={
 dress:['لباس عروس را انتخاب کن','از لباس‌های همین مزون، لباس‌های آماده یا عکس لباسی که خودت پیدا کرده‌ای. فقط لباس عوض می‌شود؛ چهره، سایز و فرم بدنت همان می‌ماند.'],
 hair:['مدل مو را انتخاب کن','از کارهای همین مزون، مدل‌های آماده یا عکس مدلی که خودت پیدا کرده‌ای. فقط فرم و کوتاهی عوض می‌شود و رنگ موهایت همان می‌ماند؛ رنگ را در بخش «رنگ مو» امتحان کن.'],
 color:['رنگ مو را انتخاب کن','از کارهای همین مزون، رنگ‌های آماده یا عکس رنگی که دوست داری. مدل و کوتاهی موهایت دست نمی‌خورد؛ فقط رنگ عوض می‌شود.'],
 nails:['طرح و رنگ ناخن را انتخاب کن','از کارهای همین مزون، طرح‌های آماده یا عکس طرحی که خودت پیدا کرده‌ای. فرم، طول و رنگ را هم انتخاب کن.'],
 lashes:['مدل مژه را انتخاب کن','از کارهای همین مزون، مدل‌های آماده یا عکس مدلی که خودت پیدا کرده‌ای. حالت و طول را هم انتخاب کن.']
};
function pickLook(fn){fn();state.result=null;state.error='';renderFlow();renderDock()}
// Choosing a look brings the next thing to do into view: nail and lash options, or «بساز».
function chooseLook(fn){pickLook(fn);scrollToBuild()}
function scrollToBuild(){
 var f=$('#flow');if(!f)return;
 var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches,beh=reduce?'auto':'smooth';
 var bar=$('#steps'),top=(bar&&!bar.hidden?bar.getBoundingClientRect().height:0)+12;
 var dock=$('#dock:not([hidden])'),bottom=(dock&&getComputedStyle(dock).position==='fixed'?dock.getBoundingClientRect().height:0)+16;
 var opt=f.querySelector('.opt'),nav=f.querySelector('.flow__nav'),picked=f.querySelector('.picked');
 requestAnimationFrame(function(){
  var y;
  if(opt)y=opt.getBoundingClientRect().top+window.pageYOffset-top;
  else if(nav){var hint=f.querySelector('.build-hint')||nav,end=hint.getBoundingClientRect().bottom+window.pageYOffset;y=end-(window.innerHeight-bottom);
   var start=(picked||nav).getBoundingClientRect().top+window.pageYOffset-top;if(y>start)y=start}
  if(y!=null)window.scrollTo({top:Math.max(0,y),behavior:beh});
 });
}
function stepModel(){
 var box=el('div',{class:'panel flow'}),L=state.line;
 if(state.original){
  var fresh=state.justArrived;state.justArrived=false;
  box.append(el('div',{class:'selfie'+(fresh?' selfie--fresh':'')},[el('img',{src:state.preview||media(state.original),alt:''}),el('div',{},[el('b',{html:ICO.check+'<span>'+(fresh?'عکست ثبت شد':'عکست آماده است')+'</span>'}),el('span',{text:(L==='nails'?'طرح':L==='color'?'رنگ':L==='dress'?'لباس':'مدل')+' انتخابی روی همین عکس امتحان می‌شود.'})]),el('button',{class:'btn btn--ghost btn--sm',type:'button',onclick:function(){changePhoto();go(1)},text:'تغییر'})]));
 }
 box.append(flowHead(MODEL_HEAD[L][0],MODEL_HEAD[L][1]));
 if(quotaLeft()===0&&!state.tourDemo)box.append(notice('warn',quotaOut()));
 if(L==='color'){var bc=baseChooser();if(bc)box.append(bc)}
 var seg=el('div',{class:'seg',role:'tablist'});
 [['salon',0],['catalog',1],['upload',2]].forEach(function(x){
  var b=el('button',{type:'button',role:'tab','data-tab':x[0],'aria-selected':state.tab===x[0]?'true':'false',text:TAB_LABEL[L][x[1]]});
  b.addEventListener('click',function(){state.tab=x[0];renderFlow()});
  seg.append(b);
 });
 box.append(seg);
 if(state.tab==='salon'){
  var items=(state.pub.portfolio||[]).filter(function(p){return (p.published||p.try_on)&&(p.line||'dress')===L});
  if(!items.length)box.append(notice('info','مزون هنوز نمونه‌کاری در این بخش نگذاشته. از «'+TAB_LABEL[L][1]+'» یا «'+TAB_LABEL[L][2]+'» استفاده کن.'));
  else{
   // Same vertical grid as the ready-made looks.
   var grid0=el('div',{class:'looks looks--salon'});
   items.forEach(function(p){
    var imgs=[];try{imgs=JSON.parse(p.images||'[]')}catch(e){}
    if(!imgs.length)return;
    var on=state.reference===imgs[0];
    var pic0=el('img',{src:media(imgs[0]),alt:'',loading:'lazy',decoding:'async'}),art0=el('span',{class:'style-card__art'},[pic0]);
    pic0.addEventListener('error',function(){art0.classList.add('is-missing');pic0.remove()});
    var card=el('button',{class:'style-card'+(on?' is-on':''),type:'button','aria-pressed':on?'true':'false'},[
     art0,
     el('span',{class:'style-card__body'},[el('span',{class:'style-card__name',text:p.title}),el('span',{class:'style-card__tag',text:p.stylist?'کار '+p.stylist:(p.category||'کار مزون')})])
    ]);
    card.addEventListener('click',function(){track('look','s:'+p.title);chooseLook(function(){state.reference=imgs[0];state.refTitle=p.title;state.style=null;if(L==='color')state.color=''})});
    grid0.append(card);
   });
   box.append(grid0);
  }
  if(state.reference&&state.refTitle)box.append(pickedBar('کار انتخابی: '+state.refTitle,function(){pickLook(function(){state.reference=null;state.refTitle=''})}));
 }else if(state.tab==='catalog'){
  var cat=lineCat(),LIST=cat?cat.styles:STYLES;
  var filters=cat?cat.filters:['همه','کوتاه','متوسط','بلند','چتری','فر','جمع'];
  var fbar=el('div',{class:'filters'});
  filters.forEach(function(f){
   var on=(state.filter||'همه')===f;
   var c=el('button',{class:'chip',type:'button','aria-pressed':on?'true':'false',text:f});
   c.addEventListener('click',function(){state.filter=f;renderFlow()});
   fbar.append(c);
  });
  box.append(fbar);
  var grid=el('div',{class:'looks'});
  LIST.forEach(function(s,i){
   if((state.filter||'همه')!=='همه'&&s[2]!==state.filter)return;
   var on=state.style===i&&!state.reference;
   var pic=el('img',{src:catalogImg(i),alt:'',loading:'lazy',decoding:'async'});
   var art=el('span',{class:'style-card__art'},[pic]);
   if(L==='color'){var sw=cat.swatches[i].split(',');art.classList.add('style-card__art--sw');art.style.background=sw.length>1?'linear-gradient(180deg,'+sw[0]+' 0 35%,'+sw[1]+' 100%)':sw[0];art.append(el('span',{class:'style-card__dot',style:'background:'+(sw[1]||sw[0])}))}
   pic.addEventListener('error',function(){art.classList.add('is-missing');pic.remove()});
   var card=el('button',{class:'style-card'+(on?' is-on':''),type:'button','aria-pressed':on?'true':'false'},[
    art,
    el('span',{class:'style-card__body'},[el('span',{class:'style-card__name',text:s[0]}),el('span',{class:'style-card__tag',text:s[2]})])
   ]);
   card.addEventListener('click',function(){track('look',lookPrefix()+i);if(L==='color')track('color',s[0]);chooseLook(function(){state.style=i;state.reference=null;state.refTitle='';if(L==='color')state.color=''})});
   grid.append(card);
  });
  box.append(grid);
  if(state.style!==null&&!state.reference)box.append(pickedBar((L==='color'?'رنگ انتخابی: ':L==='nails'?'طرح انتخابی: ':'مدل انتخابی: ')+LIST[state.style][0],function(){pickLook(function(){state.style=null})}));
 }else{
  if(!state.reference||state.refTitle){
   var input2=el('input',{type:'file',accept:'image/jpeg,image/png,image/webp',id:'pickref',class:'sr-only'});
   var drop2=el('label',{class:'upload upload--ref',for:'pickref'},[
    el('span',{class:'upload__icon',html:ICO.gallery}),
    el('strong',{text:{nails:'عکس طرح دلخواهت',color:'عکس رنگ موی دلخواهت'}[L]||'عکس مدل دلخواهت'}),
    el('span',{class:'upload__hint',text:LP().ref})
   ]);
   input2.addEventListener('change',function(){handleFile(input2.files&&input2.files[0],'reference')});
   box.append(input2,drop2);
  }else{
   box.append(el('div',{class:'ref-photo mirror'},[el('div',{class:'mirror__glass'},[el('img',{src:media(state.reference),alt:'عکس مرجع'})])]));
   box.append(pickedBar(L==='color'?'عکس رنگ اضافه شد':'عکس مدل اضافه شد',function(){pickLook(function(){state.reference=null})}));
   box.append(h('p',LP().ref,'hint'));
  }
 }
 // Nail shape and length, lash mapping and length: chips that apply to every way of choosing.
 var cat2=lineCat();
 if(cat2&&cat2.options.length)cat2.options.forEach(function(o){
  var row=el('div',{class:'filters opt-row',role:'group','aria-label':o.label});
  o.items.forEach(function(it,j){var on=state.opts[o.key]===j;row.append(el('button',{class:'chip',type:'button','aria-pressed':on?'true':'false',text:it,onclick:function(){if(on)delete state.opts[o.key];else state.opts[o.key]=j;state.result=null;renderFlow();renderDock()}}))});
  box.append(el('div',{class:'opt'},[h('p',o.label+' (اختیاری)','lbl'),row]));
 });
 // Nails and lashes: a colour box for every way of choosing. Hair colour: a colour can also just be typed.
 if(L!=='hair'&&L!=='dress')box.append(colorPicker());
 if(state.reference&&!state.pub.reference&&state.pub.generation)box.append(notice('warn','ساخت تصویر از عکس مرجع یا کار مزون هنوز برای این مزون فعال نشده. می‌توانی از موارد آماده انتخاب کنی، یا همین را بدون شبیه‌سازی برای '+artist()+' بفرستی.'));
 var can=canGenerate()||!!state.tourDemo,ready=hasChoice()||!!state.tourDemo,left=quotaLeft();
 box.append(el('div',{class:'flow__nav'},[
  el('button',{class:'btn btn--ghost',type:'button',onclick:function(){go(1)},text:'بازگشت'}),
  el('button',{class:'btn btn--primary btn--build',type:'button',disabled:!ready,onclick:build,html:buildLabel(can)})
 ]));
 box.append(h('p',buildHint(ready,can,left),'fine-print build-hint'));
 return box;
}
function buildLabel(can){return can?ICO.spark+'<span>بساز</span>':(quotaLeft()===0?ICO.send+'<span>فرستادن برای '+artist()+'</span>':'<span>ادامه: نتیجه</span>')}
function buildHint(ready,can,left){
 if(!ready)return missingReason()+'؛ بعد «بساز» فعال می‌شود.';
 if(!can)return '';
 return 'با زدن «بساز» عکست برای ساخت فرستاده می‌شود و فقط برای همین مزون می‌ماند.'+(left!=null?' '+fa(left)+' ساخت دیگر در این بخش داری.':'');
}
// Step 2 → 3 in one tap: «بساز» goes straight to building, no page in between.
function build(){
 if(!hasChoice()){toast(missingReason());return}
 if(!canGenerate()){go(3);return}
 go(3);generate();
}
// Hair colour: on the new hairstyle (default) or on the original photo.
function baseChooser(){
 var hr=hairResult();
 if(!hr){
  if(!state.original)return null;
  return el('div',{class:'basehint'},[el('span',{html:ICO.scissors}),el('span',{text:'می‌خواهی رنگ را روی مدل موی جدیدت ببینی؟ اول در بخش «مدل مو» یک مدل بساز.'}),el('button',{class:'btn btn--ghost btn--sm',type:'button',onclick:function(){switchLine('hair',{scroll:true})},text:'رفتن به مدل مو'})]);
 }
 var wrap=el('div',{class:'base',role:'radiogroup','aria-label':'رنگ روی کدام عکس امتحان شود؟'});
 [['hair',hr.id,'روی مدل موی جدیدم','«'+hr.name+'»'],['original',state.original,'روی عکس اصلی خودم','موهای همین الانت']].forEach(function(x){
  var on=(state.base||'hair')===x[0];
  wrap.append(el('button',{class:'base__opt'+(on?' is-on':''),type:'button',role:'radio','aria-checked':on?'true':'false',onclick:function(){pickLook(function(){state.base=x[0]})}},[el('img',{src:x[0]==='original'&&state.preview?state.preview:media(x[1]),alt:''}),el('span',{},[el('b',{text:x[2]}),el('small',{text:x[3]})])]));
 });
 return el('div',{class:'base-wrap'},[h('p','رنگ روی کدام عکس امتحان شود؟','lbl'),wrap]);
}
/* ---------- colour box with suggestions ---------- */
var COLORS=[
 ['مشکی','#151515'],['مشکی کلاغی','#0f1420'],['مشکی آبی','#141a2c'],['قهوه‌ای تیره','#3b2518'],['قهوه‌ای متوسط','#5e3c25'],['قهوه‌ای روشن','#7a5233'],
 ['شکلاتی','#4b2b1c'],['شکلاتی تلخ','#33201a'],['شکلاتی گرم','#5a321e'],['موکا','#6a4a37'],['نسکافه‌ای','#8d6646'],['فندقی','#8b5a2b'],['قهوه‌ای دودی','#5a4a42'],['دودی زیتونی','#6b6450'],['زیتونی','#6b6a3f'],['شکلاتی دودی','#4a3a33'],['نسکافه‌ای دودی','#7d6a5a'],['قهوه‌ای سرد','#54443c'],
 ['کاراملی','#a86c34'],['عسلی','#b8803a'],['عسلی طلایی','#c99a45'],['بلوند عسلی','#c8913f'],['بلوند کاراملی','#b9864f'],['بلوند طلایی','#d8b064'],['بلوند شامپاینی','#e2cfa5'],
 ['بلوند بژ','#d4bc96'],['بلوند روشن','#ddc28c'],['بلوند خیلی روشن','#ecdcb4'],['بلوند تیره','#9e7a4a'],['بلوند دودی','#b6aa96'],['بلوند خاکستری','#c9c2b0'],['بلوند نقره‌ای','#dcd8cc'],
 ['بلوند یخی','#e8e6dd'],['پلاتینه','#ece8dc'],['بلوند توت‌فرنگی','#d79a72'],['بلوند رزگلد','#d9a19a'],
 ['مسی','#b5602f'],['مسی روشن','#c87a45'],['قرمز مسی','#a8462a'],['حنایی','#a4482a'],['دارچینی','#8f4f2c'],['ماهاگونی','#6e2f25'],['قرمز آتشین','#b0302a'],
 ['شرابی','#6b1f2e'],['آلبالویی','#7a1f2b'],['زرشکی','#6d1a2a'],['یاقوتی','#8b1d36'],['بادمجانی','#4a2438'],['بنفش','#5b3a78'],['یاسی','#b8a1d6'],
 ['رزگلد','#c98c7a'],['صورتی پاستلی','#e8b4c4'],['آبی دودی','#5a6e86'],['آبی نفتی','#23465c'],['نقره‌ای','#c4c4c2'],['خاکستری','#a9a9a6'],['سفید یخی','#ebebe8'],
 ['بالیاژ عسلی','#3b2518,#c8913f'],['بالیاژ کاراملی','#4b2b1c,#b9864f'],['بالیاژ شامپاینی','#5e3c25,#e2cfa5'],['بالیاژ سرد','#3b3430,#d6d2c6'],['بالیاژ مسی','#4b2b1c,#c87a45'],
 ['آمبره قهوه‌ای به بلوند','#3b2518,#ddc28c'],['آمبره شرابی','#33201a,#7a1f2b'],['آمبره دودی','#2b2622,#b6aa96'],['سامبره','#5e3c25,#b8803a'],
 ['هایلایت طلایی','#5e3c25,#d8b064'],['مش دودی','#4b4540,#b6aa96'],['مش عسلی','#5e3c25,#c8913f'],['بالیاژ دودی','#2b2622,#a59a8c'],['هایلایت نقره‌ای','#4b4540,#dcd8cc'],['لایت عسلی','#7a5233,#c8913f'],['لایت دودی','#5a4a42,#c9c2b0'],['بیبی لایت','#8b5a2b,#ddc28c']
];
var POPULAR=['دودی زیتونی','نسکافه‌ای','بالیاژ عسلی','شکلاتی','مش دودی','کاراملی','بلوند شامپاینی','شرابی'];
function normFa(s){return String(s||'').replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/[‌\s]/g,'')}
function swatch(hex){var c=hex.split(',');return el('span',{class:'swatch',style:'background:'+(c.length>1?'linear-gradient(135deg,'+c[0]+' 0 45%,'+c[1]+' 55%)':c[0])})}
function colorPicker(){
 var wrap=el('div',{class:'color'});
 var input=el('input',{id:'color',type:'text',maxlength:'60',value:state.color||'',autocomplete:'off',role:'combobox','aria-autocomplete':'list','aria-expanded':'false','aria-controls':'color-list',placeholder:'مثلاً عسلی، شکلاتی، بالیاژ سرد'});
 var list=el('ul',{class:'color__list',id:'color-list',role:'listbox',hidden:true});
 var clear=el('button',{class:'color__clear',type:'button','aria-label':'پاک کردن رنگ',text:'×',hidden:!state.color});
 var active=-1,shown=[];
 function typed(){if(state.line==='color'&&state.color){var had=state.style!==null||state.reference;state.style=null;state.reference=null;state.refTitle='';if(had){renderDockSoon()}}}
 function pick(name){track('color',name);state.color=name;input.value=name;clear.hidden=false;close();state.result=null;typed();if(state.line==='color'){renderFlow();renderDock()}}
 function close(){list.hidden=true;input.setAttribute('aria-expanded','false');active=-1}
 function render(){
  var q=normFa(input.value);
  var own=lineCat()&&lineCat().colors.length,CL=own?lineCat().colors:COLORS,PP=own?lineCat().popular:POPULAR;
  shown=q?CL.filter(function(c){return normFa(c[0]).indexOf(q)>=0}).slice(0,8):PP.map(function(n){return CL.find(function(c){return c[0]===n})}).filter(Boolean);
  list.replaceChildren();
  shown.forEach(function(c,i){var li=el('li',{role:'option',id:'co-'+i,class:i===active?'is-active':'','aria-selected':i===active?'true':'false'},[swatch(c[1]),el('span',{text:c[0]})]);li.addEventListener('mousedown',function(e){e.preventDefault();pick(c[0])});list.append(li)});
  if(q&&!shown.length)list.append(el('li',{class:'color__free',text:'«'+input.value.trim()+'» همین‌طور که نوشتی فرستاده می‌شود'}));
  list.hidden=false;input.setAttribute('aria-expanded','true');
  if(active>=0)input.setAttribute('aria-activedescendant','co-'+active);else input.removeAttribute('aria-activedescendant');
 }
 input.addEventListener('focus',render);
 input.addEventListener('input',function(){state.color=input.value.trim();clear.hidden=!input.value;active=-1;state.result=null;typed();render();renderDockSoon()});
 input.addEventListener('keydown',function(e){
  if(e.key==='ArrowDown'){e.preventDefault();active=Math.min(shown.length-1,active+1);render()}
  else if(e.key==='ArrowUp'){e.preventDefault();active=Math.max(0,active-1);render()}
  else if(e.key==='Enter'&&active>=0&&shown[active]){e.preventDefault();pick(shown[active][0])}
  else if(e.key==='Escape')close();
 });
 input.addEventListener('blur',function(){setTimeout(close,120)});
 clear.addEventListener('click',function(){state.color='';input.value='';clear.hidden=true;input.focus();renderDockSoon()});
 var hint=state.tab==='upload'&&state.reference&&state.transfer!=='style'?'اگر رنگی بنویسی، به‌جای رنگ عکس مدل استفاده می‌شود.':state.tab==='salon'&&state.reference?'اگر رنگی بنویسی، مدل همان کار مزون می‌ماند و رنگ عوض می‌شود.':'خالی بماند یعنی رنگ فعلی موهایت حفظ شود.';
 if(state.line==='nails'||state.line==='lashes')hint=state.reference?'اگر رنگی بنویسی، طرح همان می‌ماند و رنگ عوض می‌شود.':'خالی بگذاری، رنگی که به مدل می‌آید انتخاب می‌شود.';
 if(state.line==='color')hint='رنگت در لیست نیست؟ اسمش را بنویس (مثلاً «قهوه‌ای سرد» یا «مش طلایی»)؛ همان‌طور که نوشتی ساخته می‌شود.';
 input.placeholder=state.line==='nails'?'مثلاً نود، قرمز، شیری':state.line==='lashes'?'مثلاً مشکی، قهوه‌ای':input.placeholder;
 if(state.line==='color'&&(state.style!==null||state.reference))input.value='';
 wrap.append(el('label',{class:'lbl',for:'color',text:state.line==='nails'?'رنگ ناخن (اختیاری)':state.line==='lashes'?'رنگ مژه (اختیاری)':'یا اسم رنگ را بنویس'}),el('div',{class:'color__box'},[input,clear,list]),el('span',{class:'hint',text:hint}));
 return wrap;
}

function renderDockSoon(){clearTimeout(renderDockSoon.t);renderDockSoon.t=setTimeout(function(){renderDock();var b=$('#flow .btn--build');if(b){var c=canGenerate(),r=hasChoice();b.innerHTML=buildLabel(c);b.disabled=!r;var hn=$('#flow .build-hint');if(hn)hn.textContent=buildHint(r,c,quotaLeft())}},60)}
function typedColor(){return state.line==='color'&&state.style===null&&!state.reference&&String(state.color||'').trim().length>=2}
function hasChoice(){return !!state.original&&(state.style!==null||!!state.reference||typedColor())}
function canGenerate(){return hasChoice()&&!!state.pub.generation&&(!state.reference||!!state.pub.reference)&&quotaLeft()!==0}
function missingReason(){
 if(!state.original)return 'اول عکس خودت را اضافه کن';
 if(quotaLeft()===0)return quotaOut();
 if(!state.pub.generation)return 'تولید شبیه‌سازی برای این مزون فعال نیست؛ می‌توانی درخواست بررسی بفرستی';
 if(state.reference&&!state.pub.reference)return 'انتقال عکس مرجع هنوز فعال نشده است';
 return {color:'یک رنگ انتخاب کن یا اسمش را بنویس',nails:'یک طرح انتخاب کن',dress:'یک لباس انتخاب کن'}[state.line]||'یک مدل انتخاب کن';
}
// Before/after: the line sits exactly under the finger. Positions are physical (left→right)
// so RTL page direction never flips the drag. Drag moves 1:1, a tap moves the line there,
// and the hidden range keeps keyboard and screen-reader control.
function compareBlock(){
 var wrap=el('div',{class:'compare'});
 wrap.append(el('img',{src:media(state.resultBase||state.original),alt:'قبل',draggable:'false'}));
 wrap.append(el('div',{class:'compare__after'},[el('img',{src:media(state.result),alt:'بعد',draggable:'false'})]));
 wrap.append(el('div',{class:'compare__handle'},[el('span',{class:'compare__grip',html:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 8 5 12l4 4M15 8l4 4-4 4"/></svg>'})]));
 wrap.append(el('span',{class:'compare__tag compare__tag--before',text:'قبل'}));
 wrap.append(el('span',{class:'compare__tag compare__tag--after',text:'بعد'}));
 var range=el('input',{type:'range',min:'0',max:'100',value:'50',dir:'ltr',class:'compare__range','aria-label':'مقایسهٔ قبل و بعد؛ با کلیدهای جهت خط را جابه‌جا کن'});
 wrap.append(range);
 var x=50;
 function set(v,animate){x=Math.max(0,Math.min(100,v));wrap.classList.toggle('is-animating',!!animate);wrap.style.setProperty('--x',x+'%');range.value=String(Math.round(x))}
 set(50);
 var start=null;
 wrap.addEventListener('pointerdown',function(e){if(e.button>0)return;var r=wrap.getBoundingClientRect();start={px:e.clientX,x:x,w:r.width,left:r.left,moved:false,id:e.pointerId};wrap.classList.add('is-dragging')});
 wrap.addEventListener('pointermove',function(e){if(!start||e.pointerId!==start.id)return;var dx=e.clientX-start.px;if(!start.moved&&Math.abs(dx)<4)return;if(!start.moved){start.moved=true;try{wrap.setPointerCapture(e.pointerId)}catch(err){}}e.preventDefault();set(start.x+dx/start.w*100,false)});
 function end(e){if(!start)return;if(!start.moved&&e.type==='pointerup')set((e.clientX-start.left)/start.w*100,true);start=null;wrap.classList.remove('is-dragging')}
 wrap.addEventListener('pointerup',end);wrap.addEventListener('pointercancel',end);
 range.addEventListener('input',function(){set(Number(range.value),false)});
 return el('div',{},[el('div',{class:'mirror compare-wrap'},[wrap]),el('p',{class:'compare__hint',text:'خط را با انگشت بکش یا روی هر جای عکس بزن'})]);
}
function ratingBlock(){
 var wrap=el('div',{class:'rate-line'});
 wrap.append(h('span','چقدر شبیه خودت شد؟','tiny muted'));
 var stars=el('div',{class:'rating',role:'group','aria-label':'امتیاز به شباهت'});
 for(var i=1;i<=5;i++){
  (function(n){
   var b=el('button',{class:'rating__star'+(state.rating>=n?' is-on':''),type:'button','aria-label':fa(n)+' از ۵','aria-pressed':state.rating>=n?'true':'false',text:'★'});
   b.addEventListener('click',function(){state.rating=n;saveRating(n);renderFlow()});
   stars.append(b);
  })(i);
 }
 wrap.append(stars);
 return wrap;
}
function saveRating(n){try{localStorage.setItem('ayneh-rating-'+state.result,String(n))}catch(e){}track('rating',n+':'+(state.gen||''))}
function notice(kind,text){
 var map={info:ICO.info,warn:ICO.warn,danger:ICO.warn,ok:ICO.check};
 return el('div',{class:'notice notice--'+kind,style:'margin-top:14px'},[el('span',{html:map[kind]||ICO.info}),el('span',{text:text})]);
}
function field(id,label,hint,type,value,onInput,extra){
 var input=el('input',{id:id,type:type||'text',value:value||'',autocomplete:extra&&extra.autocomplete||'off',inputmode:extra&&extra.inputmode||null,placeholder:extra&&extra.placeholder||''});
 if(onInput)input.addEventListener('input',function(){onInput(input.value)});
 return el('label',{class:'field'},[el('span',{class:'lbl',text:label}),input,hint?el('span',{class:'hint',text:hint}):null]);
}
function filtersRow(opts,cur,onPick){
 var row=el('div',{class:'row'});
 opts.forEach(function(o){
  var b=el('button',{class:'chip'+(cur===o[0]?' is-on':''),type:'button','aria-pressed':cur===o[0]?'true':'false',text:o[1]});
  b.addEventListener('click',function(){onPick(o[0])});
  row.append(b);
 });
 return row;
}


function lookName(){
 var cat=lineCat(),L=state.line,LIST=cat?cat.styles:STYLES;
 var base=state.reference?(state.refTitle?'«'+state.refTitle+'» از کارهای مزون':({nails:'عکس طرح دلخواه',color:'عکس رنگ دلخواه'}[L]||'عکس مدل دلخواه')):(state.style!==null?LIST[state.style][0]:(typedColor()?state.color.trim():''));
 if(!base)return '';
 if(L==='hair')return base;
 if(L==='color'){var hr=hairResult();return 'رنگ مو: '+base+(hr&&state.base!=='original'?' روی مدل «'+hr.name+'»':'')}
 var extra=cat.options.map(function(o){return Number.isInteger(state.opts[o.key])?o.items[state.opts[o.key]]:''}).filter(Boolean).join('، ');
 return (L==='nails'?'ناخن: ':'مژه: ')+base+(extra?' ('+extra+')':'');
}
// The colour sent with a request: hair colour line = the chosen colour; nails and lashes = the colour box.
function colorLabel(){if(state.line==='hair')return '';if(state.line==='color')return state.reference?'':(state.style!==null?LINES.color.styles[state.style][0]:String(state.color||'').trim());return state.color||''}
function artist(){return 'مزون‌دار'}
function sendButton(){return el('button',{class:'btn btn--primary',type:'button',onclick:openRequest,html:ICO.send+'<span>فرستادن برای '+artist()+'</span>'})}
// Building: a playful scene for each service in the mirror, the stage it is at and a live percentage.
var BUILD={
 dress:{title:'در حال پرو کردن لباس…',steps:['آماده‌سازی عکس','پیدا کردن اندام و قد','اندازه کردن لباس','نشاندن لباس روی بدنت','چین و دنباله']},
 hair:{title:'در حال کوتاهی و حالت‌دهی…',steps:['آماده‌سازی عکس','پیدا کردن صورت و خط مو','کوتاهی و فرم','جزئیات تار به تار','براشینگ آخر']},
 color:{title:'در حال رنگ کردن موها…',steps:['آماده‌سازی عکس','پیدا کردن موها','ترکیب رنگ','رنگ‌گذاری تار به تار','براق کردن']},
 nails:{title:'در حال لاک زدن ناخن‌ها…',steps:['آماده‌سازی عکس','پیدا کردن ناخن‌ها','فرم و سوهان','لاک و طرح','براق کردن']},
 lashes:{title:'در حال کاشت مژه…',steps:['آماده‌سازی عکس','پیدا کردن چشم‌ها','نقشهٔ مژه','کاشت تار به تار','فر و حالت']}
};
var FX={
 dress:'<svg class="fx fx--bottle" viewBox="0 0 64 64" aria-hidden="true"><path d="M24 4h16l-3 16 10 40H17l10-40Z" fill="#fff" stroke="rgba(255,255,255,.6)" stroke-width="2"/><path d="M26 22h12" stroke="var(--wash)" stroke-width="3" stroke-linecap="round"/></svg><svg class="fx fx--wand" viewBox="0 0 64 64" aria-hidden="true"><path d="M32 4l5 18 18 5-18 5-5 18-5-18-18-5 18-5Z" fill="#fff" stroke="var(--wash)" stroke-width="2"/></svg>',
 hair:'<svg class="fx fx--scissors" viewBox="0 0 64 64" aria-hidden="true"><g class="fx__b1"><circle cx="15" cy="47" r="8" fill="none" stroke="#fff" stroke-width="4"/><path d="M21 42 56 14" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g><g class="fx__b2"><circle cx="15" cy="17" r="8" fill="none" stroke="#fff" stroke-width="4"/><path d="M21 22 56 50" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g><circle cx="33" cy="32" r="3.2" fill="#f4e6cc"/></svg><i class="fx__bit"></i><i class="fx__bit"></i><i class="fx__bit"></i><i class="fx__bit"></i>',
 color:'<span class="fx__wash"></span><svg class="fx fx--brush" viewBox="0 0 64 64" aria-hidden="true"><g transform="rotate(-38 32 32)"><rect x="27" y="2" width="10" height="30" rx="5" fill="#fff"/><rect x="23.5" y="30" width="17" height="8" rx="2" fill="#e8d7c0"/><path d="M24 38h16l-1.5 15c-4.5 3.4-8.5 3.4-13 0Z" fill="var(--wash)" stroke="#fff" stroke-width="2"/></g></svg>',
 nails:'<svg class="fx fx--bottle" viewBox="0 0 64 64" aria-hidden="true"><rect x="25" y="3" width="14" height="19" rx="4" fill="#fff"/><rect x="17" y="21" width="30" height="38" rx="11" fill="var(--wash)" stroke="#fff" stroke-width="3"/><path d="M24 30v16" stroke="rgba(255,255,255,.75)" stroke-width="3.2" stroke-linecap="round"/></svg><svg class="fx fx--wand" viewBox="0 0 64 64" aria-hidden="true"><path d="M10 54 44 20" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M44 20c4-4 10-5 12-3s1 8-3 12c-3 3-7 2-9 0s-3-6 0-9Z" fill="var(--wash)" stroke="#fff" stroke-width="2.5"/></svg>',
 lashes:'<svg class="fx fx--eye" viewBox="0 0 80 50" aria-hidden="true"><g class="fx__lid"><path d="M6 30Q40 4 74 30Q40 52 6 30Z" fill="rgba(255,255,255,.92)"/><circle cx="40" cy="30" r="9.5" fill="#3b2a20"/><circle cx="43.5" cy="26.5" r="3" fill="#fff"/></g><g class="fx__lash" stroke="#fff" stroke-width="3.2" stroke-linecap="round" fill="none"><path d="M13 23 6 14"/><path d="M22 16 17 6"/><path d="M32 12 30 1"/><path d="M48 12 50 1"/><path d="M58 16 63 6"/><path d="M67 23 74 14"/></g></svg>'
};
function washColor(){
 if(state.line==='color'&&state.style!==null){var sw=LINES.color.swatches[state.style].split(',');return sw[sw.length-1]}
 var cl=(lineCat()&&lineCat().colors||COLORS).find(function(c){return normFa(c[0])===normFa(state.color)});
 if(cl)return cl[1].split(',').pop();
 return state.line==='nails'?'#d9506e':state.line==='color'?'#b8803a':'#c9a14a';
}
// Real builds take about 50–80 seconds: the curve reaches ~80% at a minute and keeps moving after.
function buildPct(){var t=Date.now()-(state.genT0||Date.now());return state.result?100:Math.min(97,Math.round(3+94*(1-Math.exp(-t/38000))))}
function buildNote(){var t=Date.now()-(state.genT0||Date.now());return t>85000?'کمی بیشتر از همیشه طول کشید؛ هنوز در حال ساخت است. صفحه را نبند.':t>45000?'دارد تمام می‌شود… معمولاً حدود یک دقیقه طول می‌کشد.':'این صفحه را نبند؛ معمولاً حدود یک دقیقه طول می‌کشد.'}
function buildStage(){
 var L=state.line,B=BUILD[L]||BUILD.hair,pct=buildPct(),src=state.genBase?media(state.genBase):(state.original?media(state.original):'');
 var stage=el('div',{class:'stage mirror build build--'+L,style:'--wash:'+washColor()},[el('div',{class:'mirror__glass'},[
  src?el('img',{class:'build__photo',src:src,alt:''}):null,
  el('span',{class:'build__scan','aria-hidden':'true'}),
  el('div',{class:'build__fx',html:FX[L]||FX.hair}),
  el('span',{class:'build__spark build__spark--1','aria-hidden':'true',text:'✦'}),el('span',{class:'build__spark build__spark--2','aria-hidden':'true',text:'✦'}),el('span',{class:'build__spark build__spark--3','aria-hidden':'true',text:'✧'}),
  el('div',{class:'build__pct'},[el('b',{class:'build__num',text:fa(pct)}),el('span',{text:'٪'})])
 ])]);
 var at=Math.min(B.steps.length-1,Math.floor(pct/100*B.steps.length));
 var list=el('ol',{class:'build__steps'},B.steps.map(function(t,i){return el('li',{class:i<at?'is-done':i===at?'is-on':''},[el('span',{html:i<at?ICO.check:''}),el('b',{text:t})])}));
 return el('div',{class:'build-wrap',role:'status','aria-live':'polite'},[stage,el('div',{class:'build__side'},[h('p',B.title,'build__title'),el('div',{class:'progress'},[el('div',{class:'progress__bar'},[el('div',{class:'progress__fill',style:'width:'+pct+'%'})])]),list,h('p',buildNote(),'tiny muted build__note')])]);
}
// One name per saved photo: salon, service, date and time, and the result's own id.
function saveName(id){
 var d=new Date(),p={};try{new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).formatToParts(d).forEach(function(x){p[x.type]=x.value})}catch(e){}
 var stamp=(p.year||d.getFullYear())+(p.month||'')+(p.day||'')+'-'+String(p.hour||'').replace('24','00')+(p.minute||'')+(p.second||'');
 return ['ayneh',SLUG,{dress:'lebas-aroos'}[state.line]||'lebas',stamp,String(id||'').replace(/[^a-z0-9]/gi,'').slice(0,8)].join('-')+'.jpg';
}
// The saved or shared photo carries the salon's badge (logo and name) in the bottom-right corner,
// so a story made from it is a small ad for the salon. Made in the browser; the original stays clean.
function loadImg(src){return new Promise(function(res,rej){var i=new Image();i.decoding='async';i.onload=function(){res(i)};i.onerror=rej;i.src=src})}
function brandedBlob(id){
 var s=state.pub.salon,p=s.profile||{};
 return Promise.all([loadImg(media(id)),p.logo?loadImg(media(p.logo)).catch(function(){return null}):Promise.resolve(null)]).then(function(r){
  var img=r[0],logo=r[1],W=img.naturalWidth,H=img.naturalHeight,c=document.createElement('canvas');c.width=W;c.height=H;var g=c.getContext('2d');g.drawImage(img,0,0,W,H);
  // Only the salon's round logo, bottom right, on a thin white ring.
  var u=Math.min(W,H),pad=Math.round(u*.035),d=Math.round(u*.12),ring=Math.max(2,Math.round(d*.06)),cx=W-pad-d/2,cy=H-pad-d/2;
  g.save();g.shadowColor='rgba(0,0,0,.3)';g.shadowBlur=Math.round(u*.015);g.fillStyle='#fff';g.beginPath();g.arc(cx,cy,d/2+ring,0,Math.PI*2);g.fill();g.restore();
  if(logo){g.save();g.beginPath();g.arc(cx,cy,d/2,0,Math.PI*2);g.clip();var lw=logo.naturalWidth,lh=logo.naturalHeight,k=Math.max(d/lw,d/lh);g.drawImage(logo,cx-lw*k/2,cy-lh*k/2,lw*k,lh*k);g.restore()}
  else{g.fillStyle='#0c6b6b';g.beginPath();g.arc(cx,cy,d/2,0,Math.PI*2);g.fill();g.fillStyle='#fff';g.font='800 '+Math.round(d*.46)+'px Estedad, Vazirmatn, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText((s.name||'آ').trim().charAt(0),cx,cy+d*.03)}
  return new Promise(function(res){c.toBlob(function(b){res(b)},'image/jpeg',.92)});
 });
}
// The logo version is made as soon as a result appears, so a tap downloads at once (phones block a
// download or share that starts seconds after the tap).
var branded={};
function prepareBranded(id){
 if(!id||branded[id])return branded[id]&&branded[id].p;
 var rec=branded[id]={};
 rec.p=brandedBlob(id).then(function(blob){if(!blob)throw new Error('x');rec.name=saveName(id);rec.url=URL.createObjectURL(blob);try{rec.file=new File([blob],rec.name,{type:'image/jpeg'})}catch(e){}
  Array.prototype.forEach.call(document.querySelectorAll('a[data-dl="'+id+'"]'),function(a){a.href=rec.url;a.setAttribute('download',rec.name)});return rec}).catch(function(){rec.failed=true;return rec});
 return rec.p;
}
var IOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
function downloadLink(cls,label){
 var id=state.result,rec=branded[id];
 var a=el('a',{class:cls,'data-dl':id,href:rec&&rec.url||media(id),download:rec&&rec.name||saveName(id),html:ICO.download+'<span>'+label+'</span>'});
 a.addEventListener('click',function(e){
  var r=branded[id];
  // iPhone: the share sheet's «Save Image» puts it in Photos; elsewhere the link itself downloads.
  if(r&&r.file&&IOS&&navigator.canShare&&navigator.canShare({files:[r.file]})){e.preventDefault();track('save','share');navigator.share({files:[r.file]}).catch(function(){});return}
  if(r&&r.url){track('save','file');return}
  if(r&&r.failed){track('save','plain');return}
  e.preventDefault();toast('یک لحظه، دارم عکس را آماده می‌کنم…');
  prepareBranded(id).then(function(x){if(x&&x.url){a.href=x.url;a.setAttribute('download',x.name)}a.click()});
 });
 prepareBranded(id);
 return a;
}
function stepResult(){
 var box=el('div',{class:'panel flow'}),L=state.line;
 box.append(flowHead(state.result?({color:'خودت با رنگ جدید',nails:'ناخن‌هایت با طرح جدید',lashes:'خودت با مژهٔ جدید'}[L]||'خودت با مدل جدید'):state.busy?'دارم می‌سازم…':'نتیجه و ارسال','این تصویر یک شبیه‌سازی پیشنهادی است، نه تضمین اجرا. تصمیم نهایی با '+artist()+' است.'));
 var meta=L==='dress'?'چهره و سایز بدنت همان است':L==='hair'?'رنگ موهایت همان می‌ماند':L==='color'?(baseId()?'روی مدل موی جدیدت':'روی عکس اصلی‌ات'):(state.color?'رنگ: '+state.color:'رنگ: هر چه به طرح بیاید');
 box.append(el('div',{class:'summary'},[
  state.original?el('img',{src:media(state.original),alt:''}):null,
  el('div',{class:'grow'},[el('b',{text:(lookName()||'هنوز چیزی انتخاب نشده')}),el('div',{class:'summary__meta',text:meta})]),
  el('button',{class:'btn btn--ghost btn--sm',type:'button',onclick:function(){go(2)},text:'تغییر'})
 ]));
 if(state.error)box.append(notice('danger',state.error));
 if(state.busy&&!state.result){box.append(buildStage());startBuildClock()}
 if(state.result){
  box.append(compareBlock());
  box.append(el('div',{class:'result-actions'},[
   L==='hair'?el('button',{class:'btn btn--soft btn--sm',type:'button',onclick:openViews,html:ICO.orbit+'<span>نمای ۳۶۰ درجه</span>'}):null,
   downloadLink('btn btn--ghost btn--sm','دانلود'),
   el('button',{class:'btn btn--ghost btn--sm',type:'button',onclick:function(){state.result=null;state.gen=null;state.idem=null;state.error='';state.busy=false;state.resultBase=null;go(2)},text:'یک مدل دیگر'})
  ]));
  // After a new hairstyle, the natural next step is its colour.
  if(L==='hair')box.append(el('button',{class:'next-line',type:'button',onclick:function(){track('color_on_hair');switchLine('color',{step:2,onHair:true,scroll:true})}},[el('span',{class:'next-line__ico',html:ICO.drop}),el('span',{},[el('b',{text:'رنگ مو را هم روی همین مدل امتحان کن'}),el('small',{text:'مدل همین می‌ماند و فقط رنگ عوض می‌شود.'})]),el('span',{class:'next-line__go',html:ICO.arrow})]));
  box.append(h('p','عکسی که دانلود می‌کنی، گوشهٔ پایینش لوگوی «'+state.pub.salon.name+'» را دارد.','fine-print'));
  box.append(ratingBlock());
  box.append(el('div',{class:'flow__nav'},[sendButton()]));
  box.append(sendNote());
 }else if(!state.busy){
  if(!canGenerate()){
   box.append(notice('info',!state.pub.generation?'این مزون پیش‌نمایش تصویری را فعال نکرده. عکس و انتخابت را برای '+artist()+' بفرست تا بررسی کند.':(!hasChoice()?missingReason()+'.':'ساخت تصویر از این انتخاب هنوز فعال نیست. عکس و انتخابت را مستقیم برای '+artist()+' بفرست.')));
   box.append(el('div',{class:'flow__nav'},[!hasChoice()&&state.original?el('button',{class:'btn btn--ghost',type:'button',onclick:function(){go(2)},text:'انتخاب'}):null,sendButton()]));
   box.append(sendNote());
  }else{
   box.append(el('div',{class:'stage mirror'},[el('div',{class:'mirror__glass'},[el('span',{class:'stage__empty',text:'نتیجه همین‌جا، در قاب آینه، ظاهر می‌شود'})])]));
   box.append(el('div',{class:'flow__nav'},[
    el('button',{class:'btn btn--primary',type:'button',onclick:generate,html:ICO.spark+'<span>بساز</span>'}),
    el('button',{class:'btn btn--ghost',type:'button',onclick:openRequest,html:ICO.send+'<span>بدون شبیه‌سازی بفرست</span>'})
   ]));
   box.append(h('p','با زدن «بساز» عکست برای ساخت شبیه‌سازی فرستاده می‌شود و فقط برای همین مزون می‌ماند.','fine-print'));
  }
 }
 return box;
}
// Keeps the percentage and the stage moving smoothly between server checks.
function startBuildClock(){
 if(startBuildClock.t)return;
 startBuildClock.t=setInterval(function(){if(!state.busy||state.result||state.step!==3){clearInterval(startBuildClock.t);startBuildClock.t=0;return}updateProgress()},300);
}
function sendNote(){
 var name=state.pub.salon.name;
 return el('p',{class:'send-note'},[el('span',{html:ICO.send}),el('span',{text:state.pub.telegram?'عکس و مدلت با اسم و شماره‌ات در تلگرام برای «'+name+'» فرستاده می‌شود. خود مزون با تو تماس می‌گیرد یا در تلگرام پیام می‌دهد.':'«'+name+'» هنوز ارسال آنلاین را فعال نکرده؛ با زدن این دکمه راه‌های تماس با مزون را می‌بینی.'})]);
}

/* ---------- side: the salon's own work ---------- */
// The salon's own work lives only in step 2, under «کارهای مزون»; nothing beside the flow.
function renderSide(){var side=$('#side');if(side){side.replaceChildren();side.hidden=true}var l=$('.layout');if(l)l.classList.add('layout--solo')}
function fa0(v){return String(v).replace(/^\+98/,'0').replace(/\d/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'[d]})}

/* ---------- dock ---------- */
function renderDock(){
 var dock=$('#dock');
 var inner=el('div',{class:'dock__inner'});
 var hint='',primary=null;
 if(state.step===1){
  hint=state.original?'عکس آماده است':(state.line==='nails'?'برای شروع، عکس دستت را اضافه کن':'برای شروع، عکس خودت را اضافه کن');
  if(state.busy&&!state.original){hint='در حال بارگذاری عکس…';primary=el('button',{class:'btn btn--primary',type:'button',disabled:true,text:'در حال بارگذاری…'})}
  else primary=el('button',{class:'btn btn--primary',type:'button',onclick:function(){(state.original?go(2):pickNow())},html:(state.original?ICO.check:ICO.camera)+'<span>'+(state.original?'ادامه':'افزودن عکس')+'</span>'});
 }else if(state.step===2){
  var ready=hasChoice(),can=canGenerate();
  var out=quotaLeft()===0;
  hint=out?'سهم ساخت این بخش تمام شد':ready?(can?'آماده؛ بزن بساز':'آماده'):missingReason();
  primary=el('button',{class:'btn btn--primary',type:'button',disabled:!ready,onclick:build,html:can?ICO.spark+'<span>بساز</span>':out?ICO.send+'<span>فرستادن</span>':ICO.arrow+'<span>ادامه</span>'});
 }else{
  if(state.busy){hint='در حال ساخت…';primary=el('button',{class:'btn btn--primary',type:'button',disabled:true,text:'در حال ساخت…'})}
  else if(state.result||!canGenerate()){hint='فرستادن در تلگرام برای مزون';primary=el('button',{class:'btn btn--primary',type:'button',onclick:openRequest,html:ICO.send+'<span>فرستادن برای '+artist()+'</span>'})}
  else{hint='آمادهٔ ساخت';primary=el('button',{class:'btn btn--primary',type:'button',onclick:generate,html:ICO.spark+'<span>بساز</span>'})}
 }
 inner.append(el('div',{class:'dock__hint',text:hint}),el('button',{class:'btn btn--ghost',type:'button',onclick:openAbout,'aria-label':'دربارهٔ مزون',html:ICO.info}),primary);
 dock.replaceChildren(inner);dock.hidden=false;
}

/* ---------- upload ---------- */
function handleFile(file,kind){
 if(!file){toast('عکسی انتخاب نشد');return}
 if(['image/jpeg','image/png','image/webp'].indexOf(file.type)<0){toast('فقط JPG، PNG یا WebP','error');return}
 state.busy=true;renderDock();
 if(kind==='original'){try{if(state.preview)URL.revokeObjectURL(state.preview);state.preview=URL.createObjectURL(file)}catch(e){state.preview=null}state.original=null;state.justUploaded=false;clearTimeout(state.advT);if(state.step!==1){state.step=1;renderSteps()}renderFlow();focusFlow()}
 Promise.all([compress(file),ensureSession()]).then(function(r){
  return api('upload?kind='+kind,r[0],true);
 }).then(function(d){
  if(kind==='original'){track('photo',state.line);state.original=d.id;state.ratio=compress.ratio||'';state.result=null;state.error='';state.idem=null;state.justUploaded=true;
   state.advT=setTimeout(function(){if(state.step===1&&state.justUploaded){state.justArrived=true;go(2)}},1600)}
  else{track('look','u');state.reference=d.id;state.refTitle='';state.style=null;state.result=null;state.error='';if(state.line==='color')state.color='';setTimeout(scrollToBuild,60)}
  renderFlow();renderSteps();renderDock();
 }).catch(function(e){if(kind==='original'&&!state.original){state.preview=null;renderFlow()}toast(e.message,'error')}).then(function(){state.busy=false;renderDock()});
}
function changePhoto(){clearTimeout(state.advT);state.justUploaded=false;state.original=null;state.preview=null;state.result=null;renderFlow();renderSteps();renderDock()}
function nearestRatio(r){var R=[['1:1',1],['4:5',.8],['3:4',.75],['2:3',.667],['9:16',.5625],['5:4',1.25],['4:3',1.333],['3:2',1.5],['16:9',1.778]];var best=R[0];R.forEach(function(x){if(Math.abs(Math.log(x[1]/r))<Math.abs(Math.log(best[1]/r)))best=x});return best[0]}
function compress(file){
 return createImageBitmap(file).then(function(bitmap){
  compress.ratio=nearestRatio(bitmap.width/bitmap.height);
  if(bitmap.width<300||bitmap.height<300){bitmap.close();throw new Error('عکس خیلی کوچک است؛ حداقل ۳۰۰×۳۰۰ پیکسل')}
  var canvas=document.createElement('canvas');
  var scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
  var attempt=0;
  function step(){
   canvas.width=Math.max(300,Math.round(bitmap.width*scale));
   canvas.height=Math.max(300,Math.round(bitmap.height*scale));
   var ctx=canvas.getContext('2d');
   ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
   if(attempt===0){
    var data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
    var light=0,c=0;
    for(var i=0;i<data.length;i+=160){light+=(data[i]+data[i+1]+data[i+2])/3;c++}
    if(light/c<22){bitmap.close();throw new Error('عکس خیلی تاریک است؛ نور بهتری انتخاب کن')}
   }
   return new Promise(function(res){canvas.toBlob(res,'image/jpeg',attempt<2?0.85:0.75)}).then(function(blob){
    if(!blob){bitmap.close();throw new Error('تبدیل عکس ممکن نشد')}
    if(blob.size<=820*1024||attempt>=5){bitmap.close();return blob}
    attempt++;scale*=0.72;return step();
   });
  }
  return step();
 });
}

/* ---------- generation ---------- */
function generate(){
 if(state.busy)return;
 if(!canGenerate()){toast(missingReason());return}
 if(state.pub.otp&&!state.verified){
  ensureSession().then(function(){
   if(state.verified){generate();return}
   openOtp(generate);
  }).catch(function(e){toast(e.message,'error')});
  return;
 }
 state.busy=true;state.error='';state.result=null;state.genT0=Date.now();state.genBase=baseId();renderFlow();renderDock();
 ensureSession().then(function(){
  state.idem=state.idem||uuid();
  var col=state.line==='hair'?'':state.line==='color'?(typedColor()?state.color.trim():''):state.color;
  // The page's own note under «بساز» says the photo is sent for the simulation; no extra checkbox.
  return api('generate',{v:VISITOR,image_consent:true,idem:state.idem,line:state.line,opts:state.opts,ratio:state.ratio||undefined,original_id:state.original,base_id:state.line==='color'?(state.genBase||undefined):undefined,reference_id:state.reference||undefined,style:state.reference?undefined:(state.style===null?undefined:state.style),color:col||undefined});
 }).then(function(job){
  track('generate',state.reference?(state.refTitle?'salon':'upload'):'catalog');
  spentQuota(state.line);
  state.gen=job.id;state.genState=job.state;state.step=3;
  try{sessionStorage.setItem('ayneh-job-'+SLUG,state.line+':'+job.id)}catch(e){}
  renderFlow();renderDock();
  return poll(job.id);
 }).catch(function(e){
  state.busy=false;
  if(needsVerify(e.message)){state.verified=false;state.error='';renderFlow();renderDock();openOtp(generate);return}
  if(/سهم امتحان/.test(e.message)&&state.quota&&state.quota.left)state.quota.left[state.line]=0;
  state.error=friendly(e.message);
  renderFlow();renderDock();
 });
}
function friendly(msg){
 if(/سقف استفاده/.test(msg))return 'سقف استفادهٔ امروز پر شده است؛ فردا دوباره امتحان کن.';
 if(/فعال نشده/.test(msg))return 'تولید شبیه‌سازی برای این مزون فعال نیست.';
 if(/وضعیت نامشخص/.test(msg))return 'ارسال به سرویس تصویر نامشخص ماند. برای جلوگیری از هزینهٔ دوباره، خودکار تکرار نمی‌شود؛ کمی بعد دوباره سر بزن.';
 if(/درخواست را نپذیرفت/.test(msg))return 'سرویس تصویر درخواست را نپذیرفت. کمی بعد دوباره تلاش کن.';
 return msg;
}
function pickNow(){var pick=$('#pick');if(pick)pick.click();else toast('اول عکس خودت را اضافه کن')}
function updateProgress(){
 var f=$('#flow');if(!f)return;
 var pct=buildPct(),B=BUILD[state.line]||BUILD.hair;
 var bar=f.querySelector('.progress__fill');if(bar)bar.style.width=pct+'%';
 var num=f.querySelector('.build__num');if(num)num.textContent=fa(pct);var note=f.querySelector('.build__note');if(note){var nt=buildNote();if(note.textContent!==nt)note.textContent=nt}
 var at=Math.min(B.steps.length-1,Math.floor(pct/100*B.steps.length));
 Array.prototype.forEach.call(f.querySelectorAll('.build__steps li'),function(li,i){var c=i<at?'is-done':i===at?'is-on':'';if(li.className!==c){li.className=c;li.firstChild.innerHTML=i<at?ICO.check:''}});
}
function poll(id,resumed){
 var attempts=0;
 function tick(){
  attempts++;
  updateProgress();
  return api('generation/'+id).then(function(d){
   state.genState=d.state;
   if(d.state==='success'){
    track('result','',true);
    if(window.__trialLeft)window.__trialLeft();
    state.result=d.result_id;state.resultBase=state.genBase||null;state.busy=false;state.idem=null;state.session=false;loadSession().catch(function(){});
    try{sessionStorage.removeItem('ayneh-job-'+SLUG)}catch(e){}
    state.rating=Number(localStorage.getItem('ayneh-rating-'+d.result_id)||0);
    renderFlow();renderDock();toast('شبیه‌سازی آماده شد');
    return;
   }
   if(d.state==='fail'||d.state==='unknown'){
    track('gen_fail',d.state);
    state.busy=false;state.error=d.state==='fail'?'سرویس تصویر نتوانست خروجی بسازد. می‌توانی دوباره تلاش کنی.':friendly('وضعیت نامشخص');
    renderFlow();renderDock();return;
   }
   if(attempts>90){state.busy=false;state.error='هنوز آماده نشده؛ با بازکردن دوبارهٔ صفحه همان درخواست پیگیری می‌شود.';renderFlow();renderDock();return}
   return sleep(Math.min(4000,1400+attempts*160)).then(tick);
  }).catch(function(){
   if(attempts>8){state.busy=false;state.error='ارتباط با سرور قطع شد؛ بعداً دوباره سر بزن.';renderFlow();renderDock();return}
   return sleep(2200).then(tick);
  });
 }
 return tick();
}
/* ---------- 360° view: 8 estimated angles played as a drag-to-turn spin ---------- */
/* ---------- 360° view: 8 estimated angles, played like a turntable ---------- */
// Drag (with momentum), tap a thumbnail, use the arrow keys, or let it turn on its own.
// While the angles are being made, the result itself sways in 3D so the wait feels alive.
function openViews(){
 track('view360');
 if(!state.gen)return;
 var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 // Front = her own result photo (her real face); the other three come from one generated row.
 var ANG=['جلو','نیم‌رخ چپ','پشت سر','نیم‌رخ راست'],N=4;
 var panel=el('div',{class:'sheet__panel spin-panel'});
 panel.append(el('div',{class:'sheet__head'},[h('h2','از همهٔ زاویه‌ها'),el('button',{class:'sheet__x',type:'button','aria-label':'بستن',text:'×',onclick:closeSheet})]));
 var a=el('div',{class:'spin__layer'}),b=el('div',{class:'spin__layer'});
 var stage=el('div',{class:'spin',tabindex:'0',role:'img','aria-label':'نمای چرخشی مدل مو؛ برای چرخاندن بکش یا از کلیدهای جهت استفاده کن'},[a,b]);
 var tip=el('p',{class:'spin__tip',text:'دارم زاویه‌های دیگر را می‌سازم… معمولاً ۲ تا ۳ دقیقه طول می‌کشد.'}),bar=el('span',{class:'spin__bar'});
 var loading=el('div',{class:'spin__loading'},[el('div',{class:'spin__orbit'},[el('img',{src:media(state.result),alt:''})]),el('span',{class:'spin__ring'}),tip,el('span',{class:'spin__track'},[bar])]);
 stage.append(loading);
 var angle=el('span',{class:'spin__angle',text:''});
 var dial=el('div',{class:'spin__dial','aria-hidden':'true'},[el('span',{class:'spin__dot'})]);
 var thumbs=el('div',{class:'spin__thumbs',role:'group','aria-label':'زاویه‌ها'});
 var play=el('button',{class:'btn btn--ghost btn--sm spin__play',type:'button',text:'⏸ توقف'});
 var controls=el('div',{class:'spin__controls',hidden:true},[el('div',{class:'spin__row'},[dial,angle,play]),thumbs]);
 panel.append(el('div',{class:'mirror spin-wrap'},[stage]),controls,h('p','جلو همان عکس خودت است؛ نیم‌رخ‌ها و پشت سر تخمینی‌اند و اسکن سه‌بعدی نیست.','tiny muted spin__note'));
 openSheet(panel);
 var frame=0,front=a,timer=null,spinTimer=null,tipTimer=null,progTimer=null,src='';
 function paint(layer,n){if(n===0){layer.style.backgroundImage='url('+media(state.result)+')';layer.style.backgroundSize='cover';layer.style.backgroundPosition='50% 30%'}else{layer.style.backgroundImage='url('+src+')';layer.style.backgroundSize='300% 100%';layer.style.backgroundPosition=((n-1)*50)+'% 0'}}
 function show(n,instant){
  frame=(n%N+N)%N;var back=front===a?b:a;paint(back,frame);
  if(instant||reduce){paint(front,frame)}else{back.classList.add('is-on');front.classList.remove('is-on');front=back}
  angle.textContent=ANG[frame];dial.style.setProperty('--r',(frame*90)+'deg');
  Array.prototype.forEach.call(thumbs.children,function(t,i){t.classList.toggle('is-on',i===frame);t.setAttribute('aria-pressed',i===frame?'true':'false')});
 }
 function auto(on){clearInterval(spinTimer);spinTimer=null;play.textContent=on?'⏸ توقف':'▶ چرخش';if(on&&!reduce)spinTimer=setInterval(function(){if(!panel.isConnected){cleanup();return}show(frame+1)},1100)}
 function cleanup(){clearInterval(spinTimer);clearInterval(tipTimer);clearInterval(progTimer);cancelAnimationFrame(timer)}
 play.addEventListener('click',function(){auto(!spinTimer)});
 var drag=null;
 stage.addEventListener('pointerdown',function(e){if(!src)return;auto(false);cancelAnimationFrame(timer);drag={x:e.clientX,f:frame,t:performance.now(),v:0,lx:e.clientX};try{stage.setPointerCapture(e.pointerId)}catch(err){}});
 stage.addEventListener('pointermove',function(e){if(!drag)return;var now=performance.now(),dt=Math.max(1,now-drag.t);drag.v=(drag.lx-e.clientX)/dt;drag.lx=e.clientX;drag.t=now;var f=drag.f+Math.round((drag.x-e.clientX)/56);if(f!==frame)show(f)});
 function release(){if(!drag)return;var v=drag.v;drag=null;if(reduce||Math.abs(v)<0.25)return;var acc=0,last=performance.now();
  (function coast(now){var dt=now-last;last=now;acc+=v*dt/56;v*=Math.pow(0.992,dt);if(Math.abs(acc)>=1){var s=acc>0?1:-1;show(frame+s);acc-=s}if(Math.abs(v)>0.05&&panel.isConnected)timer=requestAnimationFrame(coast)})(last)}
 stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);
 stage.addEventListener('keydown',function(e){if(!src)return;if(e.key==='ArrowLeft'){auto(false);show(frame+1)}if(e.key==='ArrowRight'){auto(false);show(frame-1)}if(e.key===' '){e.preventDefault();auto(!spinTimer)}});
 function ready(id){
  src=media(id);
  thumbs.replaceChildren();for(var i=0;i<N;i++)(function(n){var t=el('button',{class:'spin__thumb',type:'button','aria-label':ANG[n]});paint(t,n);t.addEventListener('click',function(){auto(false);show(n)});thumbs.append(t)})(i);
  clearInterval(tipTimer);clearInterval(progTimer);bar.style.width='100%';
  stage.classList.add('is-ready');a.classList.add('is-on');controls.hidden=false;
  setTimeout(function(){loading.remove()},reduce?0:350);
  show(0,true);auto(true);
 }
 var tips=['دارم پشت سرت را می‌سازم…','نیم‌رخ چپ…','نیم‌رخ راست…','هماهنگ‌کردن نور و رنگ مو…','نیم‌رخ‌ها و پشت سر با هم ساخته می‌شوند؛ ۲ تا ۳ دقیقه صبر کن…'],ti=0,started=Date.now();
 tipTimer=setInterval(function(){if(!panel.isConnected){cleanup();return}tip.textContent=tips[ti++%tips.length]},2400);
 progTimer=setInterval(function(){bar.style.width=Math.round(3+92*(1-Math.exp(-(Date.now()-started)/70000)))+'%'},400);
 if(state.views&&state.views.gen===state.gen){ready(state.views.id);return}
 if(quotaLeft('hair')===0){cleanup();tip.textContent='سهم امتحان «مدل مو» برای شما تمام شد؛ نمای ۳۶۰ هم یک تصویر از همین سهم است.';return}
 api('views',{v:VISITOR,parent:state.gen,idem:state.viewsIdem||(state.viewsIdem=uuid())}).then(function(job){
  spentQuota('hair');var tries=0;
  function check(){if(!panel.isConnected)return;return api('generation/'+job.id).then(function(d){
   if(d.state==='success'){state.views={gen:state.gen,id:d.result_id};state.viewsIdem=null;ready(d.result_id);return}
   if(d.state==='fail'||d.state==='unknown'||++tries>90){cleanup();tip.textContent='ساخت زاویه‌ها ممکن نشد؛ کمی بعد دوباره امتحان کن.';state.viewsIdem=null;return}
   return sleep(3000).then(check);
  })}
  return check();
 }).catch(function(e){cleanup();tip.textContent=e.message});
}

/* ---------- demo before/after, shown before we ask for a photo ---------- */
// Uses /catalog/demo-before.webp and demo-after.webp (made by the catalog workflow); if they are
// missing, nothing is shown. The line sweeps by itself; reduced motion keeps it still.
function demoCompare(cls){
 var base='/catalog/'+(state.line+'/');
 var wrap=el('div',{class:'compare compare--demo'},[el('img',{src:base+'demo-before.webp',alt:'نمونه: قبل',draggable:'false'}),el('div',{class:'compare__after'},[el('img',{src:base+'demo-after.webp',alt:'نمونه: بعد',draggable:'false'})]),el('div',{class:'compare__handle'}),el('span',{class:'compare__tag compare__tag--before',text:'قبل'}),el('span',{class:'compare__tag compare__tag--after',text:'بعد'})]);
 var box=el('div',{class:'mirror demo '+(cls||'')},[wrap]),fails=0;
 Array.prototype.forEach.call(wrap.querySelectorAll('img'),function(i){i.addEventListener('error',function(){if(++fails===1)box.remove()})});
 wrap.style.setProperty('--x','62%');
 if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){var t0=performance.now(),seen=false,raf=0;
  function tick(now){if(!box.isConnected)return;wrap.style.setProperty('--x',(50+30*Math.sin((now-t0)/1100))+'%');raf=requestAnimationFrame(tick)}
  var io=window.IntersectionObserver?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){if(!seen){seen=true;track('demo','',true)}cancelAnimationFrame(raf);raf=requestAnimationFrame(tick)}else cancelAnimationFrame(raf)})}):null;
  if(io)setTimeout(function(){io.observe(box)},0);else raf=requestAnimationFrame(tick);
 }
 return box;
}

/* ---------- "your request" card: what the salon did with it ---------- */
var MINE={new:['⏳','فرستاده شد؛ منتظر تماس مزون باش','sent'],called:['📞','مزون گفته با تو تماس گرفته','called'],booked:['🎉','نوبتت هماهنگ شد','booked'],declined:['✋','مزون گفت این مدل در مزون اجرا نمی‌شود','declined']};
function loadMine(){
 var flag=null;try{flag=localStorage.getItem('ayneh-sent-'+SLUG)}catch(e){}
 if(!flag&&!state.sentOnce)return;
 api('requests').then(function(d){renderMine(d)}).catch(function(){});
}
function renderMine(d){
 var box=$('#mine');if(!box)return;var r=(d.requests||[])[0];if(!r){box.hidden=true;return}
 var st=MINE[r.salon_status]||MINE.new,late=r.salon_status==='new'&&Date.now()-r.created_at>86400000;
 var steps=['فرستاده شد','مزون جواب داد','نوبت'],reached=r.salon_status==='booked'?3:(r.salon_status==='new'?1:2);
 var follow=null;try{follow=JSON.parse(localStorage.getItem('ayneh-follow-'+SLUG)||'null')}catch(e){}
 var tel=d.phone?String(d.phone).replace(/^\+98/,'0'):'';
 var actions=el('div',{class:'mine__actions'});
 if((late||r.salon_status==='called')&&tel)actions.append(el('a',{class:'btn btn--primary btn--sm',href:'tel:'+tel,html:ICO.phone+'<span>تماس با مزون</span>'}));
 if(r.salon_status==='declined')actions.append(el('button',{class:'btn btn--soft btn--sm',type:'button',onclick:function(){go(state.original?2:1)},text:'امتحان یک مدل دیگر'}));
 if(!r.followed&&follow&&r.salon_status==='new'){if(follow.telegram)actions.append(el('a',{class:'btn btn--ghost btn--sm',href:follow.telegram,target:'_blank',rel:'noopener',onclick:function(){track('follow','telegram')},text:'خبرم کن در تلگرام'}));if(follow.bale)actions.append(el('a',{class:'btn btn--ghost btn--sm',href:follow.bale,target:'_blank',rel:'noopener',onclick:function(){track('follow','bale')},text:'خبرم کن در بله'}))}
 box.replaceChildren(el('div',{class:'panel mine mine--'+st[2]},[
  el('div',{class:'mine__head'},[el('span',{class:'mine__icon','aria-hidden':'true',text:st[0]}),el('div',{},[h('b',late?'مزون هنوز جواب نداده':st[1]),h('span',(r.look?r.look+'، ':'')+fmt(r.created_at),'mine__meta')])]),
  el('ol',{class:'mine__steps'},steps.map(function(t,i){return el('li',{class:i<reached?'is-on':''},[el('span',{}),el('b',{text:t})])})),
  late?h('p','معمولاً مزون‌ها در یکی دو روز تماس می‌گیرند. اگر عجله داری، مستقیم زنگ بزن.','mine__note'):null,
  actions.childNodes.length?actions:null
 ]));
 box.hidden=false;
}

/* ---------- first-visit tour: welcome card, then a spotlight that glides between parts ---------- */
var TOUR_KEY='ayneh-tour-v2';
function pageGo(n){go(n)}
// The tour opens one service (hair colour) and walks through the three ways of choosing, then puts
// the page back exactly as it was.
function tourView(line,step,tab,style){
 var d=lineDefaults(line);Object.assign(state,d,{line:line,step:step,tab:tab||d.tab,filter:'همه',original:null,preview:null,style:style===undefined?null:style,tourDemo:true});
 document.body.setAttribute('data-line',line);renderAll();
}
function tourSteps(){
 var mobile=window.matchMedia('(max-width:959px)').matches;
 return [
  {el:'#flow',enter:function(){tourView('dress',1,'salon')},title:'اول، عکس تمام‌قد خودت',text:'یک عکس ایستاده از سر تا پا، روبه‌رو و با لباس ساده. لباس روی همین عکس و همین اندام امتحان می‌شود؛ سایزت دست نمی‌خورد.'},
  {el:'#flow .seg',enter:function(){tourView('dress',2,'salon')},title:'سه راه برای انتخاب لباس',text:'«'+TAB_LABEL.dress[0]+'»، «'+TAB_LABEL.dress[1]+'» و «'+TAB_LABEL.dress[2]+'». هر کدام را بزنی، پایینش عوض می‌شود.'},
  {el:'#flow .seg [data-tab="salon"]',enter:function(){tourView('dress',2,'salon')},title:'۱. لباس‌های همین مزون',text:hasLineWork('dress')?'لباس‌های واقعی «'+state.pub.salon.name+'». روی هر کدام بزن تا همان لباس روی تو ساخته شود.':'لباس‌های واقعی مزون اینجا می‌آید. روی هر کدام بزنی، همان لباس روی تو ساخته می‌شود.'},
  {el:'#flow .looks .style-card',enter:function(){tourView('dress',2,'catalog')},title:'۲. لباس‌های آماده',text:'مدل‌های پرطرفدار با عکس نمونه. با فیلترهای بالا سریع پیدا کن: پفی، ماهی، پوشیده، دانتل…'},
  {el:'#flow .upload--ref',enter:function(){tourView('dress',2,'upload')},title:'۳. عکس لباسی که خودت داری',text:'لباسی در اینستاگرام یا گالری‌ات دیدی؟ عکسش را اینجا بگذار. فقط خود لباس برداشته می‌شود؛ مدل و بدنش نه.'},
  {el:'#flow .btn--build',enter:function(){tourView('dress',2,'catalog',3)},title:'انتخاب کردی؟ «بساز»',text:'با یک دکمه پرو شروع می‌شود و نتیجه را کنار عکس خودت می‌بینی. بعد با یک دکمه برای مزون می‌فرستی.'},
  {el:'#steps .steps__list',title:'همیشه می‌دانی کجایی',text:'عکس تو، انتخاب، نتیجه. روی هر قدم بزنی برمی‌گردی.'},
  {el:'.about-btn',title:'همه‌چیز دربارهٔ مزون',text:'آدرس، شماره، ساعت کاری و صفحه‌های مزون اینجاست.'},
  {el:mobile?'#dock .dock__inner':'.hero__cta .btn',title:'شروع کنیم؟',text:'اول عکس تمام‌قدت را بگذار. بعد از دیدن نتیجه، با یک دکمه برای مزون فرستاده می‌شود و خود مزون با تو تماس می‌گیرد.',last:true}
 ].filter(Boolean);
}
function maybeTour(){try{if(localStorage.getItem(TOUR_KEY))return}catch(e){return}if(state.busy)return;setTimeout(startTour,700)}
function startTour(){
 if($('.tour'))return;
 var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 track('tour_start');
 var root=el('div',{class:'tour'+(reduce?' tour--still':''),role:'dialog','aria-modal':'true','aria-labelledby':'tour-title'});
 var spot=el('div',{class:'tour__spot','aria-hidden':'true'});
 var card=el('div',{class:'tour__card',tabindex:'-1'});
 root.append(spot,card);document.body.append(root);document.body.classList.add('is-touring');
 var steps=[],i=-1,lastFocus=document.activeElement;
 // Everything the tour changes, to put back when it ends.
 var saved={line:state.line,data:lineData(state.line),store:Object.assign({},lineStore),y:window.pageYOffset},changed=false;
 function restore(){state.tourDemo=false;if(!changed)return;lineStore=saved.store;Object.assign(state,saved.data);state.line=saved.line;document.body.setAttribute('data-line',saved.line);renderAll()}
 function done(how){track(how==='done'?'tour_done':'tour_skip');try{localStorage.setItem(TOUR_KEY,'1')}catch(e){}window.removeEventListener('resize',place);window.removeEventListener('keydown',keys);restore();root.classList.add('is-leaving');setTimeout(function(){root.remove();document.body.classList.remove('is-touring')},reduce?0:220);if(how==='done'){pageGo(state.original?2:1)}else if(changed)window.scrollTo({top:0});if(lastFocus&&lastFocus.focus)lastFocus.focus()}
 function keys(e){if(e.key==='Escape')done();else if(i>=0&&(e.key==='ArrowLeft'))go(i+1);else if(i>0&&e.key==='ArrowRight')go(i-1)}
 window.addEventListener('keydown',keys);
 function welcome(){
  root.classList.add('tour--welcome');
  card.replaceChildren(
   demoCompare('tour__demo')||null,
   el('h2',{id:'tour-title',class:'tour__title',text:'به آینه مزون خوش آمدی'}),
   el('p',{class:'tour__text',text:'قبل از اینکه به پرو «'+state.pub.salon.name+'» بیایی، لباس عروس را روی اندام خودت ببین؛ قد و سایز بدنت همان می‌ماند. در یک دقیقه نشانت می‌دهم چطور.'}),
   el('ol',{class:'tour__path'},[
    el('li',{},[el('span',{html:ICO.camera}),el('b',{text:'عکس تو'})]),
    el('li',{},[el('span',{html:ICO.spark}),el('b',{text:'انتخاب لباس'})]),
    el('li',{},[el('span',{html:ICO.spark}),el('b',{text:'بساز و بفرست'})])
   ]),
   el('div',{class:'tour__actions'},[
    el('button',{class:'btn btn--primary btn--block',type:'button',text:'نشانم بده',onclick:function(){root.classList.remove('tour--welcome');steps=tourSteps();go(0)}}),
    el('button',{class:'btn btn--ghost btn--block tour__skip',type:'button',text:'بلدم، شروع کنیم',onclick:done})
   ])
  );
  card.focus();
 }
 function go(n){
  if(n>=steps.length){done();return}
  var prev=i;i=n;var s=steps[i];
  if(s.enter){s.enter();changed=true}else if(changed){restore();changed=false}
  var target=$(s.el);if(!target){if(n<prev&&n>0)go(n-1);else go(n+1);return}
  target.scrollIntoView({block:'center',behavior:reduce?'auto':'smooth'});
  var dots=el('div',{class:'tour__dots','aria-label':'قدم '+fa(i+1)+' از '+fa(steps.length)},steps.map(function(_,k){return el('span',{class:k===i?'is-on':k<i?'is-done':''})}));
  card.replaceChildren(
   el('div',{class:'tour__top'},[dots,el('button',{class:'tour__x',type:'button','aria-label':'بستن راهنما',text:'×',onclick:done})]),
   el('h2',{id:'tour-title',class:'tour__title',text:s.title}),
   el('p',{class:'tour__text',text:s.text}),
   el('div',{class:'tour__nav'},[
    i>0?el('button',{class:'btn btn--ghost btn--sm',type:'button',text:'قبلی',onclick:function(){go(i-1)}}):el('button',{class:'btn btn--ghost btn--sm',type:'button',text:'رد شو',onclick:done}),
    el('span',{class:'tour__count',text:fa(i+1)+' از '+fa(steps.length)}),
    el('button',{class:'btn btn--primary btn--sm',type:'button',text:s.last?'شروع کنیم':'بعدی',onclick:function(){if(s.last)done('done');else go(i+1)}})
   ])
  );
  setTimeout(place,reduce?0:320);place();card.focus({preventScroll:true});
 }
 function place(){
  if(i<0)return;var t=$(steps[i].el);if(!t)return;var r=t.getBoundingClientRect(),pad=8,vw=window.innerWidth,vh=window.innerHeight;
  var x=Math.max(6,r.left-pad),y=Math.max(6,r.top-pad),w=Math.min(vw-12,r.width+pad*2),hgt=Math.min(vh-12,r.height+pad*2);
  spot.style.transform='translate('+x+'px,'+y+'px)';spot.style.width=w+'px';spot.style.height=hgt+'px';
  var cw=Math.min(360,vw-24),ch=card.offsetHeight||200,below=y+hgt+12,above=y-12-ch;
  var top=below+ch<vh-8?below:(above>8?above:Math.max(8,vh-ch-8));
  var left=Math.min(Math.max(12,x+w/2-cw/2),vw-cw-12);
  card.style.width=cw+'px';card.style.transform='translate('+left+'px,'+top+'px)';
 }
 window.addEventListener('resize',place);
 window.addEventListener('scroll',function(){if(document.body.contains(root))place()},{passive:true});
 welcome();
}

/* ---------- session ---------- */
function ensureSession(){
 if(state.session)return Promise.resolve();
 return loadSession().catch(function(){
  state.verified=false;
  return api('session',{}).then(function(){return loadSession().catch(function(){state.session=true})});
 });
}
// The session also says how many images this person has left in each service.
function loadSession(){return api('session?v='+VISITOR).then(function(d){state.session=true;applyVerified(d);if(d.quota){state.quota=d.quota;renderDockSoon();var f=$('#flow');if(f&&state.step===2&&!state.busy)renderFlow()}})}
function quotaLeft(line){return state.quota&&state.quota.left?state.quota.left[line||state.line]:null}
function spentQuota(line){if(state.quota&&state.quota.left&&state.quota.left[line]>0)state.quota.left[line]--}
function quotaOut(){
 var others=LINE_LIST.filter(function(x){return x[0]!==state.line&&quotaLeft(x[0])!==0}).map(function(x){return '«'+x[1]+'»'});
 return 'سهم امتحان «'+LINES.label[state.line]+'» برای شما تمام شد ('+fa(state.quota.per)+' تصویر). '+(others.length?'هنوز می‌توانی '+others.join('، ')+' را امتحان کنی، یا همین نتیجه‌ها را برای مزون بفرستی.':'سهم امتحان همهٔ بخش‌ها تمام شده؛ می‌توانی همین نتیجه‌ها را برای مزون بفرستی تا با تو تماس بگیرند.');
}

/* ---------- phone verification (SMS code) ---------- */
function applyVerified(d){
 if(!d||!d.verified)return;
 state.verified=true;
 state.me=Object.assign({},state.me||{},{name:d.name||'',phone:d.phone?'0'+String(d.phone).replace(/^\+98/,''):''});
}
function needsVerify(msg){return /را تأیید کن/.test(String(msg||''))}
function openOtp(next){
 var timer=null;
 function shut(){clearInterval(timer);closeSheet()}
 var panel=el('div',{class:'sheet__panel'});
 var head=el('div',{class:'sheet__head'},[h('h2','تأیید شمارهٔ موبایل'),el('button',{class:'sheet__x',type:'button','aria-label':'بستن',text:'×',onclick:shut})]);
 var me=state.me||{},bits=String(me.name||'').trim().split(/\s+/);
 var firstWrap=wrapField('otpFirst','نام','text',bits[0]||'','',{autocomplete:'given-name'});
 var lastWrap=wrapField('otpLast','نام خانوادگی','text',bits.slice(1).join(' '),'',{autocomplete:'family-name'});
 var phoneWrap=wrapField('otpPhone','شمارهٔ موبایل','tel',me.phone||'','۰۹۱۲۱۲۳۴۵۶۷',{inputmode:'tel',autocomplete:'tel'});
 var sendBtn=el('button',{class:'btn btn--primary btn--block',type:'submit',text:'ارسال کد تأیید'});
 var form=el('form',{novalidate:'true'},[firstWrap,lastWrap,phoneWrap,sendBtn]);
 var last=null;
 panel.append(head,h('p','برای ساخت شبیه‌سازی، اول شمارهٔ موبایلت را تأیید می‌کنیم. یک کد پیامکی برایت می‌فرستیم. نام و شماره‌ات فقط برای همین مزون و پیگیری درخواستت استفاده می‌شود و در سابقهٔ مزون می‌ماند.','muted'),form);
 function codeStep(){
  var codeWrap=wrapField('otpCode','کد پیامک‌شده','text','','',{autocomplete:'one-time-code',inputmode:'numeric'});
  codeWrap.querySelector('input').setAttribute('dir','ltr');
  var verify=el('button',{class:'btn btn--primary btn--block',type:'submit',text:'تأیید'});
  var again=el('button',{class:'btn btn--ghost btn--block',type:'button',disabled:true,text:''});
  var f2=el('form',{novalidate:'true'},[codeWrap,verify,again]);
  panel.replaceChildren(head,h('p','کد به '+last.shown+' پیامک شد. تا چند لحظهٔ دیگر می‌رسد.','muted'),f2);
  var left=60;
  function tickDown(){
   if(!panel.isConnected){clearInterval(timer);return}
   again.disabled=left>0;again.textContent=left>0?'ارسال دوبارهٔ کد تا '+fa(left)+' ثانیه دیگر':'ارسال دوبارهٔ کد';
   if(left>0)left--;
  }
  clearInterval(timer);tickDown();timer=setInterval(tickDown,1000);
  setTimeout(function(){var i=codeWrap.querySelector('input');if(i)i.focus()},50);
  again.addEventListener('click',function(){
   again.disabled=true;
   api('otp/send',last.body).then(function(){left=60;toast('کد تازه فرستاده شد')}).catch(function(err){toast(err.message,'error')});
  });
  f2.addEventListener('submit',function(e){
   e.preventDefault();
   var code=codeWrap.querySelector('input').value.trim();
   var ok=validate(codeWrap,function(){return /^[0-9۰-۹٠-٩]{3,12}$/.test(code)},'کد را همان‌طور که پیامک شده بنویس');
   if(!ok)return;
   verify.disabled=true;verify.textContent='در حال بررسی…';
   api('otp/verify',{code:code}).then(function(d){
    state.verified=true;
    state.me=Object.assign({},state.me||{},{name:d.name,phone:'0'+String(d.phone).replace(/^\+98/,'')});
    try{localStorage.setItem('ayneh-me',JSON.stringify(state.me))}catch(err){}
    shut();toast('شمارهات تأیید شد');
    if(next)next();
   }).catch(function(err){verify.disabled=false;verify.textContent='تأیید';toast(err.message,'error')});
  });
 }
 form.addEventListener('submit',function(e){
  e.preventDefault();
  var first=firstWrap.querySelector('input').value.trim(),lastName=lastWrap.querySelector('input').value.trim();
  var okFirst=validate(firstWrap,function(){return first.length>=2},'نام را بنویس');
  var okLast=validate(lastWrap,function(){return lastName.length>=2},'نام خانوادگی را بنویس');
  var num=normalizePhone(phoneWrap.querySelector('input').value);
  var okPhone=validate(phoneWrap,function(){return /^\+989\d{9}$/.test(num)},'شمارهٔ موبایل درست نیست؛ مثل ۰۹۱۲۱۲۳۴۵۶۷');
  if(!okFirst||!okLast||!okPhone)return;
  sendBtn.disabled=true;sendBtn.textContent='در حال فرستادن…';
  ensureSession().then(function(){
   var body={first_name:first,last_name:lastName,phone:num};
   return api('otp/send',body).then(function(){last={body:body,shown:'0'+num.slice(3)};codeStep()});
  }).catch(function(err){sendBtn.disabled=false;sendBtn.textContent='ارسال کد تأیید';toast(err.message,'error')});
 });
 openSheet(panel);
}

/* ---------- send to the salon (Telegram) ---------- */
function openRequest(){
 track('send_open');
 if(!state.original){toast('اول عکس خودت را اضافه کن');go(1);return}
 var s=state.pub.salon,p=s.profile||{};
 var panel=el('div',{class:'sheet__panel'});
 panel.append(el('div',{class:'sheet__head'},[h('h2','فرستادن برای '+artist()),el('button',{class:'sheet__x',type:'button','aria-label':'بستن',text:'×',onclick:closeSheet})]));
 if(!state.pub.telegram){
  panel.append(notice('info',state.pub.demo?'این نسخهٔ نمونهٔ آینه است و مزونی برای دریافت ندارد. نتیجه را دانلود کن. برای اینکه مشتری‌های خودت به مزون خودت درخواست بفرستند، صفحهٔ آزمایشی رایگان را بساز.':'«'+s.name+'» هنوز دریافت آنلاین را فعال نکرده. عکس نتیجه را دانلود کن و از یکی از این راه‌ها برای مزون بفرست.'));
  if(state.pub.demo)panel.append(el('a',{class:'btn btn--primary',href:'/#start',style:'margin-top:12px',text:'صفحهٔ آزمایشی رایگان مزون من'}));
  var ways=el('div',{class:'about__quick',style:'margin-top:14px'});
  if(p.phone)ways.append(el('a',{class:'btn btn--primary',href:'tel:'+p.phone,html:ICO.phone+'<span>تماس با مزون</span>'}));
  if(p.telegram)ways.append(el('a',{class:'btn btn--ghost',href:p.telegram,target:'_blank',rel:'noopener noreferrer',html:ICO.send+'<span>تلگرام مزون</span>'}));
  if(p.instagram)ways.append(el('a',{class:'btn btn--ghost',href:p.instagram,target:'_blank',rel:'noopener noreferrer',html:ICO.instagram+'<span>اینستاگرام</span>'}));
  if(state.result)ways.append(downloadLink('btn btn--ghost','دانلود'));
  panel.append(ways);openSheet(panel);return;
 }
 // What goes, and where: said plainly before anything is typed.
 var thumbs=el('div',{class:'outbox__thumbs'},[
  el('img',{src:media(state.original),alt:'عکس تو'}),
  state.result?el('img',{src:media(state.result),alt:'نتیجه'}):null,
  state.reference&&!state.refTitle?el('img',{src:media(state.reference),alt:'عکس مدل'}):null
 ]);
 panel.append(el('div',{class:'outbox'},[thumbs,el('div',{},[
  h('b','در تلگرام برای «'+s.name+'» فرستاده می‌شود'),
  h('p',[state.result?'عکس خودت و نتیجهٔ شبیه‌سازی':'عکس خودت',lookName()?'انتخاب: '+lookName():'',(state.line==='nails'||state.line==='lashes')&&state.color?'رنگ: '+state.color:''].filter(Boolean).join('، ')+'، به همراه نام، شماره و توضیحت.')
 ])]));
 panel.append(el('ol',{class:'how'},[
  el('li',{text:'پیام همین الان در تلگرام به دست مزون می‌رسد.'}),
  el('li',{text:artist()+' عکس‌ها را می‌بیند و امکان اجرا را بررسی می‌کند.'}),
  el('li',{text:'خود مزون به شماره‌ات زنگ می‌زند'+' یا اگر آیدی تلگرام بدهی، همان‌جا پیام می‌دهد.'})
 ]));
 var form=el('form',{novalidate:'true'});
 var nameWrap=wrapField('name','نام و نام خانوادگی','text',state.me&&state.me.name||'','',{autocomplete:'name'});
 var phoneWrap=wrapField('phone','شمارهٔ موبایل','tel',state.me&&state.me.phone||'','۰۹۱۲۱۲۳۴۵۶۷',{inputmode:'tel',autocomplete:'tel'});
 var tgWrap=wrapField('tgid','آیدی تلگرام (اختیاری)','text',state.me&&state.me.telegram||'','@username',{autocomplete:'off'});
 tgWrap.querySelector('input').setAttribute('dir','ltr');
 if(state.verified){nameWrap.querySelector('input').readOnly=true;phoneWrap.querySelector('input').readOnly=true}
 var note=el('textarea',{id:'rnote',maxlength:'1000',placeholder:'مثلاً سابقهٔ رنگ یا حنا، حساسیت پوستی، یا هر چیزی که مزون‌دار باید بداند'});
 var submit=el('button',{class:'btn btn--primary btn--block',type:'submit',html:ICO.send+'<span>فرستادن</span>'});
 form.append(nameWrap,phoneWrap,tgWrap,el('label',{class:'field'},[el('span',{class:'lbl',text:'توضیح برای مزون‌دار (اختیاری)'}),note]),
  submit,h('p','با فرستادن، عکس‌ها، اسم و شماره‌ات فقط برای همین مزون فرستاده می‌شود و در سابقهٔ مزون می‌ماند.','fine-print'));
 form.addEventListener('submit',function(e){
  e.preventDefault();
  var okName=validate(nameWrap,function(){return nameWrap.querySelector('input').value.trim().length>=3},'نام و نام خانوادگی‌ات را بنویس');
  var phoneVal=normalizePhone(phoneWrap.querySelector('input').value);
  var okPhone=validate(phoneWrap,function(){return /^\+989\d{9}$/.test(phoneVal)},'شمارهٔ موبایل درست نیست؛ مثل ۰۹۱۲۱۲۳۴۵۶۷');
  var tg=tgWrap.querySelector('input').value.trim().replace(/^@/,'').replace(/^https?:\/\/t\.me\//,'');
  var okTg=validate(tgWrap,function(){return !tg||/^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(tg)},'آیدی تلگرام فقط حروف انگلیسی، عدد و _ است');
  if(!okName||!okPhone||!okTg)return;
  submit.disabled=true;submit.textContent='در حال فرستادن…';
  state.me={name:nameWrap.querySelector('input').value.trim(),phone:phoneWrap.querySelector('input').value.trim(),telegram:tg};
  try{localStorage.setItem('ayneh-me',JSON.stringify(state.me))}catch(err){}
  ensureSession().then(function(){
   state.sendIdem=state.sendIdem||uuid();
   return api('leads',{data_consent:true,idem:state.sendIdem,name:state.me.name,phone:phoneVal,telegram:tg,note:note.value,original_id:state.original,reference_id:state.reference||undefined,preview_id:state.result||undefined,look:lookName(),color:colorLabel(),line:state.line,v:VISITOR});
  }).then(function(d){
   state.sendIdem=null;
   var follow=d.follow||{},fl=[];state.sentOnce=true;try{localStorage.setItem('ayneh-sent-'+SLUG,'1');localStorage.setItem('ayneh-follow-'+SLUG,JSON.stringify(follow))}catch(err){}
   if(follow.telegram)fl.push(el('a',{class:'btn btn--primary btn--block',href:follow.telegram,target:'_blank',rel:'noopener',onclick:function(){track('follow','telegram')},html:ICO.send+'<span>خبرم کن در تلگرام</span>'}));
   if(follow.bale)fl.push(el('a',{class:'btn btn--soft btn--block',href:follow.bale,target:'_blank',rel:'noopener',onclick:function(){track('follow','bale')},html:ICO.send+'<span>خبرم کن در بله</span>'}));
   setTimeout(loadMine,600);
   panel.replaceChildren(el('div',{class:'sent'},[
    el('span',{class:'sent__mark',html:ICO.check}),
    h('h2',d.delivered?'برای مزون فرستاده شد':d.waiting?'درخواستت ثبت شد':'در صف ارسال است'),
    h('p',d.delivered?'«'+s.name+'» عکس و مدلت را در تلگرام دریافت کرد. منتظر تماس مزون'+(tg?' یا پیامش در تلگرام':'')+' باش.':(d.waiting?'درخواستت ذخیره شد و به‌زودی به دست مزون‌دارت در «'+s.name+'» می‌رسد. منتظر تماسش باش.':'تلگرام الان جواب نداد؛ درخواستت ذخیره شد و چند دقیقهٔ دیگر خودکار برای مزون فرستاده می‌شود.')),
    fl.length?el('div',{class:'sent__follow'},[h('p','می‌خواهی وقتی مزون جواب داد خبردار شوی؟ یک بار ربات را باز کن و Start بزن.','sent__hint')].concat(fl)):null,
    el('button',{class:fl.length?'btn btn--ghost btn--block':'btn btn--primary btn--block',type:'button',onclick:closeSheet,text:fl.length?'نه، ممنون':'باشه'})
   ]));
  }).catch(function(err){submit.disabled=false;submit.innerHTML=ICO.send+'<span>فرستادن</span>';if(needsVerify(err.message)){state.verified=false;openOtp(openRequest);return}toast(err.message,'error')});
 });
 panel.append(form);
 openSheet(panel);
}

function wrapField(id,label,type,value,placeholder,extra){
 var input=el('input',{id:id,type:type,value:value||'',placeholder:placeholder||'',autocomplete:extra&&extra.autocomplete||'off',inputmode:extra&&extra.inputmode||null,maxlength:id==='tgid'?'40':id==='phone'?'20':'100'});
 var err=el('span',{class:'err',text:''});
 return el('label',{class:'field','data-invalid':'false'},[el('span',{class:'lbl',text:label}),input,err]);
}
function validate(wrap,test,msg){
 var ok=test();
 wrap.setAttribute('data-invalid',ok?'false':'true');
 var e=wrap.querySelector('.err');if(e)e.textContent=ok?'':msg;
 return ok;
}
function normalizePhone(v){
 var s=String(v||'').replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)}).replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d)}).replace(/[\s()+-]/g,'');
 if(/^09\d{9}$/.test(s))return '+98'+s.slice(1);
 if(/^9\d{9}$/.test(s))return '+98'+s;
 if(/^00989\d{9}$/.test(s))return '+98'+s.slice(4);
 if(/^989\d{9}$/.test(s))return '+'+s;
 return s;
}

/* ---------- invite friends: banner at the bottom + share sheet ---------- */
// Shares the salon page itself with this visitor's own tag (?r=<tag>), so whoever opens it joins the
// same referral tree; the dashboard also counts visits that came from a shared link.
var SHARE_IC={
 share:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="m8.3 10.8 7.4-4.4M8.3 13.2l7.4 4.4"/></svg>',
 plane:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.4 3.6 2.9 10.8c-.9.4-.9 1.6.1 1.9l4.6 1.5 1.8 5.6c.3.8 1.3 1 1.9.4l2.6-2.5 4.7 3.5c.7.5 1.6.1 1.8-.7l3-15.2c.2-1-.8-1.8-1.9-1.4zM9.6 14.2l8.2-7.3-6.5 8.4-.3 3.1z"/></svg>',
 chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/><path d="M9.2 9.3c.3 2.4 2.2 4.3 4.6 4.8l1-1.1 1.7.8-.4 1.6c-3.6.3-7.2-3.3-6.9-6.9l1.6-.4.8 1.7z" fill="currentColor" stroke="none"/></svg>',
 sms:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 10.5h.01M12 10.5h.01M16 10.5h.01"/></svg>',
 cam:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.3 6.7h.01"/></svg>',
 link:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/></svg>',
 more:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>'
};
function shareUrl(){return location.origin+'/s/'+SLUG+(state.tag?'?r='+state.tag:'')}
function shareText(){return 'این رو ببین! توی صفحهٔ «'+state.pub.salon.name+'» می‌تونی مدل مو، رنگ مو، طرح ناخن یا مژهٔ جدید رو روی عکس خودت امتحان کنی؛ رایگان و بدون نصب 👇'}
function renderInvite(){
 var box=$('#invite');if(!box||!state.pub)return;
 var pics=el('span',{class:'invite__pics','aria-hidden':'true'});
 ['03','09','15'].forEach(function(n){var i=el('img',{src:'/catalog/dress/'+n+'.webp',alt:'',loading:'lazy'});i.addEventListener('error',function(){i.replaceWith(el('span'))});pics.append(i)});
 var b=el('button',{class:'invite',type:'button',onclick:function(){track('share_open');openShare()}},[
  pics,
  el('span',{class:'invite__txt'},[
   h('b','دوستات هم مدل بعدی‌شان را ببینند'),
   h('span','لینک صفحهٔ «'+state.pub.salon.name+'» را برایشان بفرست؛ رایگان و بدون نصب، روی عکس خودشان امتحان می‌کنند.'),
   el('span',{class:'invite__cta',html:SHARE_IC.share+'<span>فرستادن برای دوستان</span>'})
  ])
 ]);
 box.replaceChildren(b);box.hidden=false;
}
function copyText(t){
 if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(t);
 return new Promise(function(ok,no){var ta=el('textarea',{style:'position:fixed;opacity:0'});ta.value=t;document.body.append(ta);ta.select();try{document.execCommand('copy')?ok():no()}catch(e){no(e)}ta.remove()});
}
function openShare(){
 var url=shareUrl(),text=shareText(),both=text+'\n'+url,s=state.pub.salon,logo=state.pub.salon.profile&&state.pub.salon.profile.logo;
 var panel=el('div',{class:'sheet__panel'});
 panel.append(el('div',{class:'sheet__head'},[h('h2','برای کی بفرستیم؟'),el('button',{class:'sheet__x',type:'button','aria-label':'بستن',text:'×',onclick:closeSheet})]));
 panel.append(el('div',{class:'share__prev'},[logo?el('img',{src:media(logo),alt:''}):el('span',{class:'share__logo',text:String(s.name||'آ').trim().charAt(0)}),el('div',{},[h('b',s.name),h('span',url.replace(/^https?:\/\//,''))])]));
 function done(kind,msg){track('share',kind);if(msg)toast(msg)}
 function opt(kind,label,ic,bg,href,onclick){
  var a=href?el('a',{class:'share__opt',href:href,target:'_blank',rel:'noopener',onclick:function(){done(kind)}}):el('button',{class:'share__opt',type:'button',onclick:onclick});
  a.append(el('span',{class:'share__ic',style:'background:'+bg,html:ic}),el('span',{text:label}));return a;
 }
 var grid=el('div',{class:'share__grid'},[
  opt('telegram','تلگرام',SHARE_IC.plane,'#2a9fd8','https://t.me/share/url?url='+encodeURIComponent(url)+'&text='+encodeURIComponent(text)),
  opt('whatsapp','واتساپ',SHARE_IC.chat,'#25a85a','https://wa.me/?text='+encodeURIComponent(both)),
  opt('sms','پیامک',SHARE_IC.sms,'#6a7a75','sms:?&body='+encodeURIComponent(both)),
  opt('instagram','اینستاگرام',SHARE_IC.cam,'linear-gradient(45deg,#f2a93b,#d6286f 55%,#7b3bc4)',null,function(){copyText(url).then(function(){done('instagram','لینک کپی شد؛ در دایرکت یا استوری اینستاگرام بگذار')},function(){toast(url)})}),
  opt('copy','کپی لینک',SHARE_IC.link,'var(--accent)',null,function(){copyText(both).then(function(){done('copy','متن و لینک کپی شد')},function(){toast(url)})}),
  navigator.share?opt('native','بله، ایتا و…',SHARE_IC.more,'#2f3b38',null,function(){navigator.share({title:s.name,text:text,url:url}).then(function(){done('native')},function(){})}):null
 ]);
 panel.append(grid,h('p','دوستت لینک را باز می‌کند و مدل مو، رنگ مو، طرح ناخن یا مژه را روی عکس خودش امتحان می‌کند. عکس‌ها خصوصی‌اند و برای کسی نمایش داده نمی‌شوند.','share__note'));
 openSheet(panel);
}

/* ---------- sheet ---------- */
function openSheet(node){
 var d=$('#sheet');
 d.replaceChildren(node);
 if(!d.open)d.showModal();
}
function closeSheet(){var d=$('#sheet');if(d&&d.open)d.close()}

document.addEventListener('click',function(e){
 if(e.target&&e.target.classList&&e.target.classList.contains('sheet'))closeSheet();
});
`;

export const customerHTML=String.raw`<!doctype html><html lang="fa" dir="rtl"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#e8edeb">
<meta name="color-scheme" content="light">
<meta name="description" content="مدل و رنگ موی بعدی‌ات را روی عکس خودت ببین و برای بررسی به مزون‌دار بفرست.">
<meta property="og:title" content="آینه | مشاورهٔ مدل و رنگ مو">
<meta property="og:description" content="مدل مو را انتخاب کن، عکس خودت را اضافه کن و نتیجه را برای بررسی به مزون بفرست.">
<meta property="og:type" content="website">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/vazirmatn-arabic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/estedad-arabic.woff2" as="font" type="font/woff2" crossorigin>
<title>آینه | مشاورهٔ مو</title>
<style>__CSS__.trialbar{position:sticky;top:0;z-index:30;padding:8px 14px;text-align:center;font-size:13px;font-weight:700;background:var(--accent-ink);color:#fff}.trialbar.is-over{background:var(--danger)}</style>
</head><body>
<a class="skip" href="#main">پرش به محتوای اصلی</a>
<header class="hero" id="head"><div class="wrap"><div class="hero__bar"><div class="skel" style="width:70px;height:22px"></div></div><div class="skel cover"></div><div class="hero__body"><div><div class="skel" style="width:70%;height:38px"></div><div class="skel" style="width:52%;height:14px;margin-top:14px"></div></div></div></div></header>
<nav class="steps" id="steps" aria-label="مراحل" hidden></nav>
<main class="wrap" id="main">
 <div class="layout layout--solo">
  <div class="flowcol"><section id="mine" aria-live="polite" hidden></section>
  <section id="flow" aria-live="polite"><div class="panel flow"><div class="skel" style="height:26px;width:46%"></div><div class="skel" style="width:min(100%,280px);aspect-ratio:3/4;margin:20px auto 0;border-radius:999px 999px 18px 18px"></div></div></section></div>
  <aside class="side" id="side" hidden></aside>
 </div>
 <section id="invite" aria-label="معرفی به دوستان" hidden></section>
 <footer class="foot" id="foot" style="padding-bottom:130px">شبیه‌سازی پیشنهادی است و اجرای دقیق را تضمین نمی‌کند. عکس‌ها فقط برای همین مزون استفاده می‌شوند و نمایش عمومی ندارند.</footer>
</main>
<div class="dock" id="dock" hidden></div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
<dialog class="sheet" id="sheet" aria-label="پنجره"></dialog>
<script>__JS__</script>
</body></html>`
 .replace('__CSS__',()=>baseCSS+customerCSS)
 .replace('__JS__',()=>clientJS.replace('__STYLES__',()=>JSON.stringify(styles)).replace('__LINES__',()=>LINES_JSON).replace('__MARK__',()=>JSON.stringify(markSVG)));
