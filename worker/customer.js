import {DRESS_STYLES,LINE_FILTERS,LINE_PHOTO,LINE_LABEL} from './lines.js';
import {QR_JS} from './qr.js';
import {PHOTO_CHECK_JS} from './pairing.js';
import {SCENE_JS} from './scene.js';
const lineJSON=(line,list)=>({styles:list.map(x=>[x[0],x[1],x[2]]),filters:LINE_FILTERS[line]});
const LINES_JSON=JSON.stringify({label:LINE_LABEL,photo:{dress:LINE_PHOTO.dress},dress:lineJSON('dress',DRESS_STYLES)});
import {baseCSS,markSVG,illos,MZ_D} from './design.js';

const customerCSS=String.raw`
.hd{position:relative;display:grid;grid-template-columns:1fr;grid-template-rows:auto auto;align-content:center;justify-items:center;gap:22px;margin:12px 0 6px;min-height:clamp(300px,50vh,460px);padding:34px 20px;border-radius:var(--r-lg);overflow:hidden;border:1px solid rgba(201,165,92,.45);background:radial-gradient(70% 120% at 85% 0,rgba(255,255,255,.95),transparent 62%),radial-gradient(60% 100% at 10% 100%,rgba(232,217,176,.55),transparent 70%),linear-gradient(135deg,#f7f3ec,#e9efec);box-shadow:var(--lift)}
.hd::before{content:"";position:absolute;inset:7px;border-radius:calc(var(--r-lg) - 6px);border:1px solid rgba(201,165,92,.35);pointer-events:none}
.hd::after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 12% 28%,rgba(201,165,92,.5) 0 1.5px,transparent 2.5px),radial-gradient(circle at 36% 80%,rgba(201,165,92,.4) 0 1.5px,transparent 2.5px),radial-gradient(circle at 62% 22%,rgba(201,165,92,.45) 0 1.5px,transparent 2.5px),radial-gradient(circle at 90% 74%,rgba(201,165,92,.5) 0 1.5px,transparent 2.5px)}
.hd__side{position:relative;z-index:1;display:flex;align-items:center;min-width:0}
.hd__side--logo{justify-content:center}
.hd__side--name{justify-content:center;text-align:center}
.hd__logo{width:150px;height:150px;border-radius:50%;object-fit:cover;border:3px solid #fff;outline:1.5px solid rgba(201,165,92,.7);outline-offset:3px;background:var(--surface);box-shadow:var(--lift)}
.hd__logo--letter{display:grid;place-items:center;font-family:var(--display);font-weight:800;font-size:56px;color:var(--accent-ink)}
.hd__name{margin:0;width:100%;font-size:36px;line-height:1.5}
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
@media(max-width:959px){.hero__cta{display:none}}
@media(max-width:959px){.btn--build{display:none}}
@media(max-width:560px){.flow--shoot .flow__sub,.demo-row__text span{display:none}.flow--shoot .upload{width:min(100%,250px)}.demo-row{margin-bottom:12px}}
.tipsbox{border-top:0;padding-top:0}.tipsbox .tips{margin-top:10px}
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
.upload{--mz-pad:11px;display:block;width:min(100%,280px);margin:0 auto;aspect-ratio:4/7;padding:var(--mz-pad);cursor:pointer;-webkit-tap-highlight-color:transparent}
.upload__in{height:100%;display:grid;place-items:center;align-content:center;gap:12px;padding:24px 22px;text-align:center;background:linear-gradient(172deg,#FBF8F2,#EEE8DB);transition:background .25s var(--ease)}
.upload:hover .upload__in,.upload.is-drag .upload__in{background:linear-gradient(172deg,#FFFDF8,#F3ECDD)}
.upload:focus-within{outline:2px solid var(--accent-ring);outline-offset:4px}
.upload__icon{width:84px;display:block;color:#C9A96A}
.upload__icon svg{width:100%;height:auto;display:block;overflow:visible}
.upload--ref .upload__icon{width:64px}
.upload strong{font-size:15px;line-height:1.7;font-weight:600;color:var(--mz-emerald)}
.upload__hint{font-size:12.5px;color:var(--muted);max-width:22ch;line-height:1.8}
.shoot__side{display:grid;gap:16px}
.shoot__btns{display:grid;gap:10px}
@media(min-width:420px){.shoot__btns{grid-template-columns:1fr 1fr}}
.tips{display:grid;gap:10px;margin:0;padding:0;list-style:none}
.tip{display:flex;gap:11px;align-items:flex-start;font-size:14px;color:var(--ink);line-height:1.7}
.tip svg{width:18px;height:18px;flex:none;margin-top:3px;color:var(--accent)}
.tip b{font-weight:700;color:var(--ink)}
.photo{width:min(100%,320px);margin:0 auto}
.photo .mirror__glass{aspect-ratio:4/7}
.photo__bar{display:flex;gap:10px;align-items:center;justify-content:space-between;margin-top:12px;font-size:13.5px;font-weight:600;color:var(--ink-2)}
.photo__bar span{display:inline-flex;align-items:center;gap:6px}
.photo__bar span svg{width:18px;height:18px;color:var(--accent)}
.upl{position:absolute;inset:0;display:grid;align-content:end;justify-items:center;gap:10px;padding:20px;background:linear-gradient(180deg,transparent 45%,rgba(8,32,32,.62));color:#fff;font-weight:700;font-size:14.5px}
.upl__scan{position:absolute;inset-inline:0;top:-35%;height:35%;background:linear-gradient(180deg,transparent,rgba(255,255,255,.5),transparent);animation:scan 1.5s ease-in-out infinite}
.upl__bar{width:70%;height:4px;border-radius:2px;background:rgba(255,255,255,.3);overflow:hidden}.upl__bar i{display:block;width:40%;height:100%;border-radius:2px;background:#fff;animation:slide 1.1s ease-in-out infinite}
@keyframes scan{to{top:100%}}@keyframes slide{0%{transform:translateX(160%)}100%{transform:translateX(-260%)}}
.photo__badge{position:absolute;left:50%;top:50%;width:72px;height:72px;margin:-36px 0 0 -36px;border-radius:50%;display:grid;place-items:center;background:rgba(247,243,236,.78);color:#B8924A;border:1.5px solid #C9A96A;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);animation:pop .55s var(--ease) both}
.photo__badge svg{width:38px;height:38px}
@keyframes pop{0%{transform:scale(.3);opacity:0}60%{transform:scale(1.12);opacity:1}100%{transform:scale(1)}}
.photo__auto{height:4px;border-radius:2px;background:#dfe6e3;overflow:hidden;margin-top:14px}.photo__auto i{display:block;height:100%;width:0;background:var(--accent);animation:fill 1.8s linear forwards}
@keyframes fill{to{width:100%}}
.selfie{display:flex;align-items:center;gap:10px;padding:8px 10px;margin:0 0 14px;border-radius:16px;background:var(--glass)}
.selfie img{width:40px;height:52px;object-fit:cover;border-radius:20px 20px 6px 6px;flex:none}
.selfie div{display:grid;gap:2px}.selfie b{display:flex;align-items:center;gap:5px;font-size:13.5px}.selfie b svg{width:16px;height:16px;color:var(--ok)}.selfie span{font-size:12px;color:var(--muted)}
.selfie .btn{margin-inline-start:auto}
.pc-by{display:block;font-size:11.5px;color:var(--muted);margin-top:2px}
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
.collapse summary{min-height:44px;cursor:pointer;font-weight:600;color:var(--ink-2);list-style:none;display:flex;align-items:center;gap:7px}
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
.dress-info{display:flex;flex-wrap:wrap;gap:4px 8px;margin-top:4px;font-size:12px;color:var(--ink)}.dress-info:empty{display:none}.dress-info em{font-style:normal;font-weight:700;color:#8a5a00}.dress-info em.ok{color:#0a7a3c}
.style-card__tag{font-size:12px;color:var(--accent-ink);font-weight:600;margin-top:4px}
.rail{display:grid;grid-auto-flow:column;grid-auto-columns:138px;gap:12px;overflow-x:auto;padding:4px 2px 10px;scroll-snap-type:x mandatory;scrollbar-width:thin}
.port-card{scroll-snap-align:start;border:0;background:transparent;padding:0;text-align:start}
.port-card .mirror{--mz-pad:6px}
.port-card .mirror__glass{aspect-ratio:4/7}
.port-card span.pc-name{display:block;padding:8px 4px 0;font-size:13px;color:var(--ink-2);font-weight:600}
.port-card.is-on .mirror{--mz-hair:var(--mz-hair-on)}
.port-card.is-on span.pc-name{color:var(--accent-ink)}
.picked{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:14px;padding:10px 12px 10px 10px;border-radius:14px;background:var(--accent-soft);color:var(--accent-ink);font-size:13.5px;font-weight:600}
.picked .btn{min-height:34px}
.ref-photo{width:min(100%,240px);margin:14px auto 0}
.ref-photo .mirror__glass{aspect-ratio:4/7}

/* ---------- step 3: result ---------- */
.summary{display:flex;gap:12px;align-items:center;padding:10px;border-radius:16px;background:var(--surface-2);border:1px solid var(--line-2)}
.summary img{width:52px;height:66px;object-fit:cover;background:var(--glass-2);-webkit-mask:var(--mz-shape) 0 0/100% 100% no-repeat;mask:var(--mz-shape) 0 0/100% 100% no-repeat}
.summary__meta{font-size:12.5px;color:var(--muted)}
.summary b{display:block;font-size:14px;color:var(--ink)}
.stage{width:min(100%,var(--fw-max,380px),calc((78svh - 22px) * var(--ar,.5714) + 22px));margin:18px auto 0}
.stage .mirror__glass{aspect-ratio:var(--ar,.5714);display:grid;place-items:center}
.stage__empty svg{width:96px;height:auto;display:block;margin:0 auto 6px;opacity:.9}.stage__empty{position:relative;z-index:1;color:var(--muted);font-size:13px;text-align:center;padding:24px;max-width:22ch;line-height:1.9}
.rev__tips{margin:8px 0 0;padding:0 18px;font-size:13px;line-height:2;color:var(--muted)}
.sizes{margin:10px 0;padding:10px 12px;border:1px solid var(--glass-2);border-radius:var(--r-lg)}.sizes summary{cursor:pointer}.sizes__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}.sizes__grid input{width:100%;text-align:center}
.upload strong.upload__say{font-family:var(--display);font-weight:800;font-size:23px;line-height:1.9;color:var(--mz-emerald);text-align:center;padding:0 14px}
.zoomable{position:relative;width:min(100%,var(--fw-max,380px),calc((78svh - 22px) * var(--ar,.6667) + 22px));margin:18px auto 0}
.compare-wrap{width:100%;margin:0}
.compare{position:relative;aspect-ratio:var(--ar,.6667);overflow:hidden;background:var(--glass-2);touch-action:pan-y pinch-zoom;user-select:none;-webkit-user-select:none;cursor:ew-resize;direction:ltr}
.compare img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 18%;pointer-events:none;-webkit-user-drag:none}
.compare__after{position:absolute;inset:0;clip-path:inset(0 calc(100% - var(--x,50%)) 0 0)}
.compare__handle{position:absolute;top:0;bottom:0;left:var(--x,50%);width:2px;margin-left:-1px;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.1),0 0 12px rgba(0,0,0,.25);pointer-events:none}
.compare__grip{position:absolute;top:58%;left:50%;width:24px;height:24px;margin:-12px 0 0 -12px;border-radius:50%;background:rgba(255,255,255,.88);display:grid;place-items:center;box-shadow:var(--lift);color:var(--ink);transition:transform .15s var(--ease)}
.compare.is-dragging .compare__grip{transform:scale(1.12)}
.compare.is-animating .compare__after{transition:clip-path .28s var(--ease)}
.compare.is-animating .compare__handle{transition:left .28s var(--ease)}
.compare__grip svg{width:14px;height:14px}
.compare__range{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;bottom:0;left:0}
.compare:has(.compare__range:focus-visible){outline:3px solid var(--accent-ring);outline-offset:3px}
.compare__tag{position:absolute;bottom:26%;z-index:2;background:rgba(250,251,250,.94);padding:3px 12px;border-radius:999px;font-size:12px;font-weight:700;color:var(--ink-2);pointer-events:none}
.compare__tag--before{right:12px}
.compare__tag--after{left:12px}
.compare__hint{text-align:center;font-size:12.5px;color:var(--muted);margin-top:10px}
.progress{display:grid;gap:10px;margin-top:18px}
.progress__bar{height:6px;border-radius:999px;background:var(--glass-2);overflow:hidden}
.progress__fill{height:100%;width:8%;border-radius:999px;background:var(--accent);transition:width .6s var(--ease)}
.rate-line{display:flex;align-items:center;gap:12px;justify-content:space-between;flex-wrap:wrap;margin-top:18px;padding-top:16px;border-top:1px solid var(--line-2)}
.rating{display:flex;gap:4px}
.social{margin-top:16px;display:grid;gap:12px}.soc-card{border:1px solid var(--line-2);border-radius:18px;padding:14px;background:var(--surface,#fff);display:grid;gap:10px}.soc-card p{margin:0;font-size:14px;line-height:1.95}.soc-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.soc-stat{font-size:13px;color:var(--muted)}.soc-c{border-top:1px dashed var(--line-2);padding-top:8px;font-size:14px;line-height:1.9;overflow-wrap:anywhere}.soc-c b{display:block;font-size:12.5px;color:var(--muted)}
.rating button svg{width:26px;height:26px;margin:auto}.rating button{width:44px;height:44px;display:grid;place-items:center;border-radius:50%;border:0;background:transparent;color:#c3ccc8;transition:color .14s var(--ease),transform .14s var(--ease)}
.rating button:hover{transform:scale(1.1)}
.rating button.is-on{color:var(--honey)}
.result-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:14px}

/* ---------- side: portfolio, contact, requests ---------- */
.sidecard{padding:20px}
.sidecard h2{font-family:var(--display);font-weight:800;font-size:21px;margin-bottom:14px}
.gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 12px}
@media(min-width:560px) and (max-width:959px){.gallery{grid-template-columns:repeat(3,minmax(0,1fr))}}
.pcard{border:0;padding:0;background:transparent;text-align:start}
.pcard .mirror{--mz-pad:6px}
.pcard .mirror__glass{aspect-ratio:2/3}
.pcard h3{font-size:13.5px;margin-top:8px}
.pcard p{font-size:12px;color:var(--muted)}
.pcard:hover .mirror{--mz-hair:var(--mz-hair-on)}
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
.help-btn{width:44px;height:44px;border-radius:50%;border:1px solid var(--line);background:var(--surface);color:var(--ink-2);font-weight:700;font-size:17px;display:grid;place-items:center}
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
.tour__path li:nth-child(2) span{background:#9a3f5b}
.tour__path li:nth-child(3) span{background:var(--honey)}
.tour__path svg{width:20px;height:20px}
.tour__actions{display:grid;gap:8px}
.tour__skip{border-color:transparent;min-height:48px}
.tour__top{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.tour__dots{display:flex;gap:5px}
.tour__dots span{width:7px;height:7px;border-radius:9px;background:var(--line);transition:width .25s var(--ease),background-color .25s}
.tour__dots .is-on{width:20px;background:var(--accent)}
.tour__dots .is-done{background:var(--accent-soft)}
.tour__x{width:44px;height:44px;border:0;border-radius:50%;background:var(--glass);color:var(--ink-2);font-size:19px;line-height:1}
.tour__nav{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:14px}
.tour__count{font-size:12px;color:var(--muted)}
.tour--still,.tour--still *{animation:none!important;transition:none!important}
body.is-touring{overflow:hidden}
.flowcol{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;min-width:0;align-content:start}.flowcol>section{min-width:0}
/* demo before/after */
.compare--demo{cursor:default;pointer-events:none}
.demo{flex:none}
.demo--small{width:118px;--mz-pad:6px}
.demo .compare__tag{font-size:12px;padding:1px 8px;bottom:26%}
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
.mine__icon{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:var(--glass);color:var(--accent-ink);flex:none}.mine__icon svg{width:22px;height:22px}.ic-inline{display:flex;align-items:center;gap:7px}.ic-inline svg{width:17px;height:17px;flex:none}.soc-stat.ic-inline{gap:5px}.soc-stat.ic-inline span+svg{margin-inline-start:8px}.rev__bad.ic-inline svg,.rev__warn.ic-inline svg{margin-top:0}
.mine__head b{display:block;font-size:15px}
.mine__meta{font-size:12.5px;color:var(--muted)}
.mine__steps{list-style:none;margin:14px 0 0;padding:0;display:grid;grid-template-columns:repeat(3,1fr);position:relative}
.mine__steps::before{content:"";position:absolute;top:6px;inset-inline:16%;height:2px;background:var(--line)}
.mine__steps li{display:grid;justify-items:center;gap:6px;position:relative;font-size:12px;color:var(--muted)}
.mine__steps li span{width:14px;height:14px;border-radius:50%;background:var(--line);box-shadow:0 0 0 4px var(--surface)}
.mine__steps li.is-on{color:var(--ink)}.mine__steps li.is-on span{background:var(--accent)}
.mine__note{font-size:13px;color:var(--ink-2);margin-top:12px;line-height:1.85}
.mine__actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}

.cmpx__picks{display:flex;gap:8px;overflow-x:auto;padding:10px 2px;margin-bottom:6px}
.cmpx__pick{flex:none;width:52px;height:68px;opacity:.6;cursor:pointer}
.cmpx__pick.is-on{opacity:1;background:linear-gradient(135deg,#B8924A,#E8D9B0 45%,#B8924A)}
.cmpx__pick img{width:100%;height:100%;object-fit:cover}
.cmpx__grid{display:grid;gap:8px;align-items:start}
.cmpx__col{margin:0;display:grid;gap:6px;min-width:0}
.cmpx__img{position:relative;aspect-ratio:3/4;overflow:hidden;background:var(--glass-2);-webkit-mask:var(--mz-shape) 0 0/100% 100% no-repeat;mask:var(--mz-shape) 0 0/100% 100% no-repeat}
.cmpx__img--before{aspect-ratio:3/3.2;border-radius:12px;-webkit-mask:none;mask:none}
.cmpx__img img{width:100%;height:100%;object-fit:cover}
.cmpx__img span{position:absolute;bottom:5px;inset-inline-start:5px;background:rgba(250,251,250,.94);padding:0 8px;border-radius:99px;font-size:11px;font-weight:700}
.cmpx__col figcaption{font-size:12px;font-weight:600;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cmpx__col .btn{padding:0 6px;font-size:12px;white-space:normal;text-align:center;line-height:1.4}
.cmpx__col .btn svg{display:none}
.result-actions .btn{flex:1 1 auto}
.mkrow{display:flex;gap:10px;align-items:flex-start;margin:0 0 14px;padding:10px 12px;border-radius:14px;background:var(--glass-2);font-size:13.5px;line-height:1.7;cursor:pointer}.mkrow input{margin-top:5px;width:18px;height:18px;accent-color:var(--accent)}
.react button svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.8;display:block}.react button.is-on svg{fill:currentColor}
.kqrs{display:flex;gap:18px;justify-content:center;flex-wrap:wrap;align-items:center;margin:10px 0}.kqrs p{flex-basis:100%;margin:0;font-size:15px}.kqr{display:grid;gap:6px;justify-items:center;font-weight:700}.kqr .qr__code{width:150px}
.rev{display:grid;gap:12px;justify-items:center;padding:4px 4px 14px}.rev__img{max-height:38vh;max-width:70%;border-radius:12px;box-shadow:var(--lift)}.rev__list{display:grid;gap:8px;width:100%}.rev__bad,.rev__warn{border-radius:12px;padding:10px 14px;font-size:15px;line-height:1.7}.rev__bad{background:#fde8e8;color:#8a1c1c}.rev__warn{background:#fff3d6;color:#6b4a00}.rev__btns{display:grid;gap:8px;width:100%}.pairsteps{margin:0 0 12px;padding:0 22px;font-size:15px;color:var(--muted,#6a5d60);line-height:1.9}
.qr{display:grid;justify-items:center;gap:14px;padding:6px 4px 14px}.qr__code{width:min(100%,300px);background:#fff;border-radius:16px;padding:10px;box-shadow:var(--lift)}.qr__code svg{display:block;width:100%;height:auto}.qr__note{text-align:center;font-size:13.5px;color:var(--ink-2);line-height:1.9;margin:0}
.noimg{display:grid;gap:12px;justify-items:center;text-align:center;margin-top:16px;padding:20px 16px;border:1px solid var(--line-2);border-radius:var(--r);background:var(--surface)}.noimg svg.noimg__ic{width:40px;height:40px;color:var(--accent)}.noimg p{margin:0;line-height:1.95;font-size:14.5px;max-width:34ch;color:var(--ink-2)}.noimg .btn{width:100%;max-width:360px}.rchips{display:flex;flex-wrap:wrap;gap:8px;margin:4px 0 12px}.rchips .chip{min-height:44px}.rnote{width:100%;min-height:76px;border:1.5px solid var(--line);border-radius:14px;padding:10px 12px;font:inherit;font-size:15px;margin-bottom:12px;resize:vertical}.hintbar{margin-top:10px}.offline-bar{position:fixed;inset-inline:12px;top:calc(env(safe-area-inset-top,0px) + 10px);z-index:96;display:flex;gap:8px;align-items:center;max-width:520px;margin:auto;padding:11px 16px;border-radius:14px;background:#6e1f2b;color:#fff;font-size:13.5px;box-shadow:0 18px 40px -20px rgba(0,0,0,.5)}.offline-bar[hidden]{display:none}
.kiosk{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;overscroll-behavior:none}.kiosk img{-webkit-user-drag:none}
.kiosk .btn{min-height:56px;font-size:17px}
.kov{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:#f6f4f1;padding:20px}.kov__card{width:min(92vw,520px);text-align:center;display:grid;gap:14px}.kov__card h1{font-size:30px;margin:0}.kov__card h2{margin:0}.kov__card p{margin:0;line-height:1.9}.kov__fine{font-size:13px;color:var(--muted)}
.kend{position:fixed;left:12px;bottom:calc(var(--safe-b) + 12px);z-index:900;border:0;border-radius:999px;min-height:48px;padding:0 20px;background:var(--ink);color:#fff;font:inherit;font-size:14px;font-weight:600;box-shadow:var(--float)}.kend:focus-visible{outline:3px solid #fff;outline-offset:2px;box-shadow:0 0 0 6px var(--ink)}
.kcam .btn--ghost{color:#fff;border-color:rgba(255,255,255,.6)}.kcam{background:#111;color:#fff;grid-template-rows:1fr auto}.kcam video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scaleX(-1)}.kcam__guide{position:absolute;inset:6% 0 18%;display:grid;place-items:center;pointer-events:none}.kcam__guide svg{height:100%}.kcam__count{position:absolute;inset:0;display:grid;place-items:center;font-size:140px;font-weight:700;text-shadow:0 4px 24px rgba(0,0,0,.6);pointer-events:none}.kcam__tip{position:absolute;top:14px;left:0;right:0;text-align:center;font-size:15px;text-shadow:0 2px 10px rgba(0,0,0,.7)}.kcam__btns{position:absolute;bottom:18px;left:0;right:0;display:flex;gap:12px;justify-content:center}
/* ---------- professional camera screen: dimmed room, an arched frame with a soft bridal silhouette, a ring countdown ---------- */
.kcam{background:#0b1c1c}.kcam video{filter:saturate(1.02)}
.kcam__shade{position:absolute;inset:0;pointer-events:none;background:radial-gradient(70% 90% at 50% 45%,transparent 55%,rgba(5,18,18,.55))}
.kcam__arch{position:absolute;left:50%;top:88px;bottom:268px;aspect-ratio:.46;transform:translateX(-50%);border:2px solid rgba(255,255,255,.92);border-radius:999px 999px 22px 22px;box-shadow:0 0 0 100vmax rgba(6,20,20,.74),0 0 40px rgba(212,176,118,.35),inset 0 0 36px rgba(255,255,255,.07);pointer-events:none}
.kcam__arch svg{position:absolute;inset:6% 12% 3%;width:76%;height:91%;overflow:visible}
.kcam__arch svg .sil{fill:rgba(255,255,255,.10);stroke:rgba(255,255,255,.72);stroke-width:1.6;stroke-linejoin:round}
.kcam__mark{position:absolute;inset-inline:-70px;display:flex;align-items:center;gap:8px;font-size:12px;color:#f3e6cf;pointer-events:none}
.kcam__mark::before{content:"";flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(243,230,207,.8))}
.kcam__mark span{padding:3px 10px;border-radius:99px;background:rgba(6,20,20,.65);border:1px solid rgba(243,230,207,.45)}
.kcam__mark::after{content:"";flex:1;height:1px;background:linear-gradient(270deg,transparent,rgba(243,230,207,.8))}
.kcam__mark--top{top:7%}.kcam__mark--bot{bottom:2%}
.kcam__head{position:absolute;top:0;left:0;right:0;display:flex;align-items:center;gap:12px;padding:14px 18px;background:linear-gradient(180deg,rgba(5,18,18,.85),transparent);pointer-events:none}
.kcam__head img{width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid rgba(243,230,207,.7);background:#fff}
.kcam__head b{display:block;font-size:17px}.kcam__head small{opacity:.85;font-size:13px}
.kcam__ring{position:absolute;bottom:84px;width:84px!important;height:84px!important;left:50%;transform:translateX(-50%);width:92px;height:92px;pointer-events:none}
.kcam__ring svg{width:100%;height:100%;transform:rotate(-90deg)}.kcam__ring circle{fill:rgba(6,20,20,.55);stroke-width:5}
.kcam__ring .bg{stroke:rgba(255,255,255,.25)}.kcam__ring .fg{stroke:#d9b878;stroke-linecap:round;fill:none;stroke-dasharray:276.5;stroke-dashoffset:276.5}
.kcam .btn--ghost:hover,.kcam .btn--ghost:focus,.kcam .btn--ghost:active{background:rgba(255,255,255,.16)!important;color:#fff!important}
.kcam--rear video{transform:none!important}.kcam__btns{flex-wrap:wrap;justify-content:center}
.kcam__ring.go .fg{animation:kring 10s linear forwards}@keyframes kring{to{stroke-dashoffset:0}}
.kcam__ring b{position:absolute;inset:0;display:grid;place-items:center;font-size:38px;font-weight:700}
.kcam .kcam__tip{top:auto;bottom:186px;left:0;right:0;font-size:14px;line-height:1.7;padding:0 22px;opacity:.95;max-height:70px}
.kcam .btn--primary{background:linear-gradient(135deg,#d9b878,#b98f4c);color:#2b1d07;border:0}
/* ---------- welcome: full-screen preview of the boutique, then name and mobile ---------- */
.wl{position:fixed;inset:0;z-index:90;background:#0b1c1c;color:#fff;overflow:hidden;font-family:inherit}
.wl__img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 1.2s ease;transform:scale(1.04)}
.wl__img.on{opacity:1;animation:wlzoom 7s ease-out forwards}@keyframes wlzoom{to{transform:scale(1.12)}}
.wl.is-paused .wl__img.on{animation-play-state:paused;filter:blur(10px) brightness(.55);transition:filter .5s}
.wl__shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,18,18,.55),transparent 28%,transparent 55%,rgba(5,18,18,.82))}
.wl__brand{position:absolute;top:22px;inset-inline:26px;display:flex;align-items:center;gap:12px}
.wl__brand img{width:52px;height:52px;border-radius:50%;object-fit:cover;border:2px solid rgba(243,230,207,.75);background:#fff}
.wl__brand b{font-size:21px}.kend{z-index:95}
.wl__cap{position:absolute;bottom:92px;inset-inline:0;text-align:center;transition:opacity .5s}.wl__cap strong{display:block;font-size:26px;letter-spacing:.2px}.wl__cap span{opacity:.9;font-size:15px}
.wl__tap{position:absolute;bottom:30px;inset-inline:0;text-align:center;font-size:17px;animation:wlpulse 2s ease-in-out infinite}@keyframes wlpulse{50%{opacity:.45}}
.wl__qr{position:absolute;top:72px;inset-inline-end:20px;width:118px;padding:6px;border-radius:14px;background:rgba(255,255,255,.92)}.wl.is-paused .wl__qr,.wl.is-paused .wl__brand{display:none}.wl__qr p,.wl__qr span{display:none}.wl__qr .qr__code{width:100%}.wl__qr .kqr{margin:0}
.wl__card{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(92vw,460px);padding:30px 26px;border-radius:26px;background:rgba(250,251,250,.94);color:var(--ink);box-shadow:0 30px 80px rgba(0,0,0,.45);text-align:center;display:none}
.wl.is-paused .wl__card{display:block;animation:wlin .45s ease}@keyframes wlin{from{opacity:0;transform:translate(-50%,-46%)}}
.wl__card img.logo{width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid #d9b878;margin:0 auto 10px;display:block;background:#fff}
.wl__card h2{margin:0 0 6px;font-size:24px}.wl__card p{margin:0 0 16px;color:var(--ink-2);font-size:15px;line-height:1.9}
.wl__card input{width:100%;height:54px;border-radius:14px;border:1.5px solid var(--line);padding:0 16px;font:inherit;font-size:18px;text-align:center;background:#fff;margin-bottom:12px}
.wl__card input:focus{outline:0;border-color:var(--accent);box-shadow:0 0 0 4px var(--accent-ring)}
.wl__card .btn{width:100%;height:52px;margin-top:2px}.wl__card .btn--ghost{margin-top:8px}
.wl__err{color:#a32222;font-size:14px;min-height:20px;margin:-4px 0 6px}
.wl__big{font-size:30px;margin:6px 0}
.wl.is-out{opacity:0;transition:opacity .7s}
/* ---------- like / dislike / send to me ---------- */
.me-block{display:grid;gap:12px;margin:14px 0;padding:16px;border-radius:18px;background:var(--surface-2);border:1px solid var(--line-2)}
.react{display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap}.react .tiny{flex-basis:100%;text-align:center}
.react button{display:grid;place-items:center;color:#4a3f37;width:56px;height:56px;border-radius:50%;border:1.5px solid var(--line);background:#fff;cursor:pointer;transition:transform .15s,border-color .15s}
.react button.is-on{color:var(--accent-ink,#6b4f1d);border-color:var(--accent);background:var(--accent-soft);transform:scale(1.1)}
.me-note{margin:0;text-align:center;font-size:13.5px;color:var(--muted);line-height:1.9}

.bgrow{margin:14px 0 6px}.bgrow>b{display:block;margin-bottom:8px}
.bgstrip{display:flex;gap:10px;overflow-x:auto;padding:4px 2px 10px;scroll-snap-type:x proximity}
.bgchip{flex:none;width:104px;scroll-snap-align:start;border:2px solid var(--line);border-radius:16px;background:#fff;padding:0;overflow:hidden;cursor:pointer;display:grid;text-align:center;font:inherit;transition:border-color .15s,box-shadow .15s}
.bgnote{margin:8px 2px 0;font-size:12px;line-height:1.8;color:var(--muted)}.bgchip img,.bgchip__own{width:100%;aspect-ratio:2/3;object-fit:cover;display:grid;place-items:center;background:var(--surface-2)}.bgchip__own svg{width:30px;height:30px;color:var(--accent)}
.bgchip>span:last-child{font-size:12px;line-height:1.5;padding:6px 4px;color:var(--ink-2)}
.bgchip.is-on{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-ring)}.bgchip.is-on>span:last-child{color:var(--accent-ink);font-weight:700}
.vspin{display:grid;gap:12px;justify-items:center;padding:4px 2px 14px}.vspin__stage{position:relative;width:min(100%,380px);overflow:hidden;border-radius:18px;background:#e9e5df;touch-action:none;cursor:grab;box-shadow:var(--lift)}.vspin__stage canvas{display:block;width:100%;height:auto;transform-origin:center;will-change:transform;pointer-events:none}.vspin__wait{display:grid;gap:12px;justify-items:center;text-align:center}.vspin__wait img{width:min(60%,220px);border-radius:16px;animation:sway 3.2s ease-in-out infinite;box-shadow:var(--float)}
/* 360 viewer */
.spin-wrap{width:100%;margin:0;padding:11px}.zoomable--views{width:min(100%,330px);margin:4px auto 0}
.spin-panel .result-actions .btn{white-space:normal;line-height:1.5;min-height:44px;padding-block:6px}
@media(max-width:420px){.zoomable--views{width:min(100%,330px,calc((100svh - 340px)*.62))}.result-actions{display:grid;grid-template-columns:1fr 1fr}.result-actions .btn{min-width:0;padding:0 10px}}
.spin{position:relative;aspect-ratio:4/7;border-radius:999px 999px 13px 13px;overflow:hidden;background:linear-gradient(170deg,#f4f7f6,#d6dfdb);touch-action:pan-y pinch-zoom;user-select:none;-webkit-user-select:none;outline:none}
.spin:focus-visible{box-shadow:0 0 0 3px var(--accent-ring)}
.spin.is-ready{cursor:grab}.spin.is-ready:active{cursor:grabbing}
.spin__layer{position:absolute;inset:0;background-repeat:no-repeat;background-size:300% 100%;opacity:0;transition:opacity .35s ease}
.spin__layer.is-on{opacity:1}
.spin__loading{position:absolute;inset:0;display:grid;place-items:center;align-content:center;gap:14px;padding:20px;text-align:center;transition:opacity .35s var(--ease);perspective:700px}
.spin.is-ready .spin__loading{opacity:0}
.spin__orbit{width:58%;aspect-ratio:3/4;overflow:hidden;-webkit-mask:var(--mz-shape) 0 0/100% 100% no-repeat;mask:var(--mz-shape) 0 0/100% 100% no-repeat;animation:sway 3.2s ease-in-out infinite;transform-style:preserve-3d}
.spin__orbit img{width:100%;height:100%;object-fit:cover}
@keyframes sway{0%,100%{transform:rotateY(-24deg)}50%{transform:rotateY(24deg)}}
.spin__ring{position:absolute;left:50%;top:44%;width:84%;aspect-ratio:1;transform:translate(-50%,-50%) rotateX(74deg);border-radius:50%;border:2px dashed rgba(12,107,107,.35);animation:orbit 6s linear infinite;pointer-events:none}
@keyframes orbit{to{transform:translate(-50%,-50%) rotateX(74deg) rotate(360deg)}}
.spin__tip{font-size:14px;color:var(--ink-2);min-height:1.8em}.spin__loading .spin__tip{position:relative;z-index:4;background:rgba(250,251,250,.9);padding:6px 14px;border-radius:99px;margin-top:auto}.spin__loading .spin__track{position:relative;z-index:4}.spin__loading{align-content:end}.zoomx[hidden]{display:none}
.spin__track{width:62%;height:4px;border-radius:9px;background:rgba(35,23,15,.1);overflow:hidden}
.spin__bar{display:block;height:100%;width:2%;background:var(--accent);border-radius:9px;transition:width .4s linear}
.spin__controls{margin-top:12px;display:grid;gap:12px}.spin__controls[hidden]{display:none}
.spin__row{display:flex;align-items:center;gap:12px;justify-content:center}
.spin__dial{position:relative;width:34px;height:34px;border-radius:50%;border:2px solid var(--line);--r:0deg}
.spin__dial::before{content:"";position:absolute;left:50%;top:-6px;width:2px;height:6px;margin-left:-1px;background:var(--muted);border-radius:2px}
.spin__dot{position:absolute;inset:0;transform:rotate(var(--r));transition:transform .2s var(--ease)}
.spin__dot::after{content:"";position:absolute;left:50%;top:2px;width:8px;height:8px;margin-left:-4px;border-radius:50%;background:var(--accent)}
.spin__angle{min-width:58px;font-weight:700;font-size:14px;text-align:center}
.spin__thumbs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:240px;margin:0 auto;width:100%}
.spin__thumb{aspect-ratio:4/7;min-height:44px;opacity:.55;cursor:pointer;transition:opacity .15s}
.spin__thumb i{background-size:300% 100%;background-repeat:no-repeat}
.spin__thumb.is-on{opacity:1}
.spin__note{text-align:center;margin-top:10px}
.layout--solo{grid-template-columns:minmax(0,1fr)!important;max-width:760px;margin:0 auto}
.about-btn{display:inline-flex;align-items:center;gap:7px;min-height:44px;padding:0 15px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-weight:600;font-size:13.5px}
.about-btn:hover{border-color:#b3c0bb}
.about-btn svg{width:18px;height:18px;color:var(--accent)}
.hero__tag{margin-top:6px;font-size:14.5px;line-height:1.9;color:var(--ink-2);max-width:52ch}
.about__bio{font-size:14.5px;line-height:2;color:var(--ink-2);margin-bottom:16px}
.about__quick{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:12px}
.sidecard__lead{font-size:13px;color:var(--muted);margin:-8px 0 14px}
.style-card{padding:0;overflow:hidden;min-height:0}
.style-card__art{display:block;aspect-ratio:4/5;background:linear-gradient(170deg,#eef2f0,#d6dfdb);overflow:hidden;position:relative}
.angle-badge{position:absolute;inset-block-end:8px;inset-inline-start:8px;background:rgba(0,0,0,.55);color:#fff;font-size:12px;padding:2px 8px;border-radius:999px}
.dress-stage{position:relative;display:flex;justify-content:center;background:#f3f1ee;border-radius:14px;overflow:hidden}
.dress-big{max-width:100%;max-height:58vh;object-fit:contain;display:block;transform-origin:center;user-select:none;-webkit-user-drag:none}
.dress-thumbs{display:flex;gap:8px;justify-content:center;margin:10px 0}
.dress-th{border:2px solid transparent;border-radius:10px;padding:0;background:none;width:64px;cursor:pointer;font:inherit;font-size:11px;color:inherit}
.dress-th img{width:100%;height:80px;object-fit:cover;border-radius:8px;display:block}
.dress-th.is-on{border-color:var(--ink)}
.style-card__art img{width:100%;height:100%;object-fit:cover;transition:transform .3s var(--ease)}
.style-card:hover .style-card__art img{transform:scale(1.03)}
.style-card__art.is-missing{aspect-ratio:auto;height:6px}
.style-card__body{display:grid;gap:0;padding:10px 12px 12px}
.style-card__name{font-size:16px}
.style-card.is-on .style-card__art{box-shadow:inset 0 -4px 0 var(--ink)}
.send-note{display:flex;gap:9px;align-items:flex-start;margin-top:12px;font-size:13px;line-height:1.85;color:var(--muted)}
.send-note svg{width:17px;height:17px;flex:none;margin-top:3px;color:var(--accent)}
.outbox{display:flex;gap:14px;align-items:center;padding:12px;border-radius:16px;background:var(--glass);margin-bottom:14px}
.outbox b{display:block;font-size:14.5px;line-height:1.6}
.outbox p{font-size:13px;color:var(--ink-2);line-height:1.8;margin-top:2px}
.outbox__thumbs{display:flex;flex:none}
.outbox__thumbs img{width:46px;height:60px;object-fit:cover;background:var(--glass-2);-webkit-mask:var(--mz-shape) 0 0/100% 100% no-repeat;mask:var(--mz-shape) 0 0/100% 100% no-repeat;filter:drop-shadow(0 0 1px #C9A96A)}
.outbox__thumbs img+img{margin-inline-start:-14px}
.how{margin:0 0 18px;padding:0;list-style:none;counter-reset:how;display:grid;gap:8px}
.how li{counter-increment:how;display:flex;gap:10px;align-items:flex-start;font-size:13.5px;line-height:1.8;color:var(--ink-2)}
.how li::before{content:counter(how,persian);width:24px;height:24px;flex:none;border-radius:50%;display:grid;place-items:center;background:var(--ink);color:#fff;font-size:12px;font-weight:700;margin-top:1px}
.sent{display:grid;justify-items:center;gap:12px;text-align:center;padding:10px 0 4px}
.sent__mark{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;background:var(--ok-soft);color:var(--ok)}
.sent__mark svg{width:32px;height:32px}.sent__mark--anim{width:auto;height:auto;background:none}.sent__mark--anim svg{width:84px;height:84px}
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
/* ---------- sticky header: a slim stepper on its own strip ---------- */
.steps{background:rgba(232,237,235,.94);border-bottom:0;box-shadow:0 8px 18px -16px rgba(35,23,15,.5)}
.steps__bottom{background:var(--surface);border-top:1px solid var(--line-2);border-bottom:1px solid var(--line-2)}
.steps__list{display:flex;align-items:center;gap:8px;padding:6px 18px;grid-template-columns:none;max-width:560px;margin-inline:auto}
.steps__item{flex:none;min-height:44px;padding:0 2px;gap:6px;font-size:12.5px;font-weight:600;color:var(--muted);border-radius:10px}
.steps__item::after{display:none}
.steps__num{width:24px;height:24px;font-size:12px;border-width:1.5px}
.steps__line{flex:1;height:2px;min-width:14px;border-radius:2px;background:var(--line)}
.steps__line.is-done{background:var(--accent)}
.steps__label{overflow:visible;white-space:nowrap}
/* ---------- toasts sit at the top, never over the choices or the dock; a tap closes them ---------- */
.toast{top:calc(env(safe-area-inset-top,0px) + 10px);bottom:auto;transform:translateY(-12px);pointer-events:auto;cursor:pointer;font-size:13.5px;line-height:1.8}
/* ---------- images that are still loading: a soft shimmer, then a fade-in ---------- */
.style-card__art,.port-card .mirror__glass{background-image:linear-gradient(100deg,rgba(255,255,255,0) 30%,rgba(255,255,255,.55) 50%,rgba(255,255,255,0) 70%);background-size:220% 100%;background-color:#dfe7e4;animation:shimmer 1.3s linear infinite}
@keyframes shimmer{from{background-position:120% 0}to{background-position:-120% 0}}
img[loading="lazy"]{opacity:0;transition:opacity .35s var(--ease)}
img[loading="lazy"].is-in{opacity:1}
.style-card__art.is-in,.port-card .mirror__glass.is-in{animation:none;background-image:none}
@media (prefers-reduced-motion:reduce){.style-card__art,.port-card .mirror__glass{animation:none}img[loading="lazy"]{transition:none}}
/* ---------- step 2: the photo just arrived ---------- */
.selfie--fresh{animation:fresh 1.6s var(--ease) both}
.selfie--fresh img{animation:pop .55s var(--ease) both}
@keyframes fresh{0%{background:var(--ok-soft);box-shadow:0 0 0 3px rgba(43,106,64,.25)}100%{background:var(--glass);box-shadow:0 0 0 0 rgba(43,106,64,0)}}
.consent{display:flex;gap:10px;align-items:flex-start;font-size:13.5px;line-height:1.8;color:var(--ink-2);margin:2px 0 16px;flex-wrap:wrap}.consent input{width:22px;height:22px;flex:none;margin-top:3px;accent-color:var(--accent-ink)}.consent span:not(.err){flex:1;min-width:0}.consent .err{display:none;flex-basis:100%;font-size:12.5px;color:var(--danger);font-weight:600}.consent[data-invalid="true"] .err{display:block}.consent[data-invalid="true"] input{outline:2px solid var(--danger);outline-offset:2px}.flow__nav--want{flex-direction:column;align-items:stretch}.flow__nav--want .btn{width:100%}
.fine-print{font-size:12px;color:var(--muted);line-height:1.85;margin-top:10px;text-align:center}
.upload--ref{width:min(100%,220px);margin-top:14px}
.looks .style-card__art{position:relative}
/* ---------- «پردهٔ آینه»: the waiting scene. Her own photo behind a sheer ivory silk veil that lifts, a focus pull from the hem to the head, light moving over the glass and around the gilded bevel ---------- */
/* Only transform and opacity ever animate. Nothing here has the shape of a gown; the dress adds a faint tint (12% at most) to the glow and to the progress dot. */
:root{--fw-max:380px}
.fw{width:min(100%,var(--fw-max),calc((78svh - 22px) * var(--ar,.5714) + 22px));margin-inline:auto}
.pm{--glw:255,247,226;--dot:201,169,106;position:relative;display:grid;justify-items:center;margin:18px auto 0;width:100%;isolation:isolate}
.pm__glow{position:absolute;left:50%;top:44%;width:112%;max-width:520px;aspect-ratio:3/4;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(closest-side,rgba(var(--glw),.95),rgba(var(--glw),0));pointer-events:none;z-index:0;opacity:.5}
.pm__stack{position:relative;z-index:1}
.pm__stack>.pm__mirror{position:relative;z-index:1;width:100%}
.pm__glass{position:relative;aspect-ratio:var(--ar,.5714);overflow:hidden;background:#EFE9DD;contain:paint}
.pm__world{position:absolute;inset:0;transform-origin:50% 58%}
.pm__im{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 20%;display:block}
.pm__soft:not([src]),.pm__rsoft:not([src]){visibility:hidden}
.pm__res,.pm__rsoft{opacity:0}
.pm__res{transform-origin:50% 50%}
/* the sharp copy of her photo is uncovered from the hem upward through a feathered mask: the focus pull */
.pm__sharp{position:absolute;inset:0;transform:translate3d(0,100%,0);-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 24%);mask-image:linear-gradient(180deg,transparent 0,#000 24%)}
.pm__sharpin{position:absolute;inset:0}
.pm--noblur .pm__sharp{display:none}
@supports not ((mask-image:linear-gradient(#000,transparent)) or (-webkit-mask-image:linear-gradient(#000,transparent))){.pm__sharp{-webkit-mask-image:none;mask-image:none}}
@supports (filter:blur(1px)){.pm__cssblur{filter:blur(6px) saturate(.6);transform:scale(1.06)}}
/* the sheer ivory silk: a soft translucent gradient (never a flat wash), densest at the top, dissolving at the hem */
.pm__veil{position:absolute;left:-2%;right:-2%;top:0;height:135%;pointer-events:none;background:linear-gradient(180deg,rgba(252,248,239,.55) 0,rgba(252,248,239,.5) 46%,rgba(252,248,239,.26) 76%,rgba(252,248,239,0) 100%)}
.pm__folds{position:absolute;inset:0 0 22% 0;background:radial-gradient(22% 70% at 20% 40%,rgba(255,255,255,.34),transparent),radial-gradient(18% 64% at 52% 34%,rgba(255,255,255,.16),transparent),radial-gradient(24% 72% at 80% 46%,rgba(255,255,255,.3),transparent),radial-gradient(80% 20% at 34% 2%,rgba(255,255,255,.4),transparent)}
/* light moving across real glass: wide, soft, very faint */
.pm__spec{position:absolute;top:-10%;bottom:-10%;left:0;width:54%;pointer-events:none;opacity:.12;background:linear-gradient(104deg,transparent 12%,rgba(255,252,242,.35) 38%,rgba(255,255,255,.9) 50%,rgba(255,252,242,.35) 62%,transparent 88%);transform:translate3d(-130%,0,0) skewX(-14deg)}
/* the gilded bevel: light travelling around the frame's edge (below the glass, so only the bevel shows it) */
.pm__bevel{position:absolute;inset:0;z-index:-1;pointer-events:none;overflow:hidden;overflow:clip;contain:paint}
.pm__bv1{position:absolute;left:50%;top:50%;width:190%;aspect-ratio:1;margin:-95% 0 0 -95%;background:conic-gradient(from 0deg,transparent 0,transparent 62%,rgba(255,246,214,.18) 72%,rgba(255,250,232,.82) 80%,rgba(255,246,214,.18) 88%,transparent 96%)}
.pm__bv2{position:absolute;inset:0;background:rgba(255,250,236,.8);opacity:0}
@supports not ((mask-image:linear-gradient(#000,transparent)) or (-webkit-mask-image:linear-gradient(#000,transparent))){.pm__bevel{display:none}}
.pm__hold{position:absolute;inset:0;pointer-events:none;opacity:0;overflow:hidden;transition:opacity .8s ease}
.pm__hold i{position:absolute;top:-10%;bottom:-10%;left:0;width:46%;background:linear-gradient(105deg,transparent 15%,rgba(var(--glw),.4) 45%,rgba(255,255,255,.55) 50%,rgba(var(--glw),.4) 55%,transparent 85%);transform:translate3d(-120%,0,0)}
.pm.is-hold .pm__hold i{animation:pmhold 3.8s ease-in-out infinite}
@keyframes pmhold{0%{transform:translate3d(-120%,0,0)}60%,100%{transform:translate3d(240%,0,0)}}
.pm__flash{position:absolute;inset:0;pointer-events:none;background:radial-gradient(80% 60% at 50% 45%,rgba(255,252,240,.95),rgba(255,246,222,0) 70%);opacity:0}
.pm.is-run .pm__flash,.pm.is-run .pm__hold,.pm.is-run .pm__res,.pm.is-run .pm__rsoft,.pm.is-run .pm__bv2{will-change:opacity}
.pm.is-run .pm__bar i,.pm.is-run .pm__bar b{will-change:transform}
.pm.is-run .pm__veil,.pm.is-run .pm__sharp,.pm.is-run .pm__sharpin,.pm.is-run .pm__spec,.pm.is-run .pm__bv1,.pm.is-run .pm__world{will-change:transform}
.pm__cap{position:relative;z-index:1;margin-top:18px;width:min(100%,340px);display:grid;justify-items:center;gap:14px}
.pm__lines{position:relative;height:36px;width:100%}
.pm__lines span{position:absolute;inset:0;display:grid;place-items:center;font:600 18px/1.8 var(--display);color:#0F4C4A;opacity:0;transform:translateY(7px);transition:opacity .5s ease,transform .5s ease;white-space:nowrap}
.pm__lines span.on{opacity:1;transform:none}
.pm__lines span:nth-child(4){font-weight:700}
.pm__lines span.end{font-weight:800;color:#0B3F3D}
.pm.is-hold .pm__lines span:nth-child(4){background:linear-gradient(100deg,#0F4C4A 35%,#B58B3C 50%,#0F4C4A 65%) 0 0/250% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:pmtxt 3.8s ease-in-out infinite}
@keyframes pmtxt{0%{background-position:100% 0}70%,100%{background-position:-50% 0}}
.pm__bar{position:relative;width:190px;height:1px;background:rgba(201,169,106,.34)}
.pm__bar i{position:absolute;inset-inline-start:0;top:0;height:1px;width:100%;background:linear-gradient(90deg,#C9A96A,#EAD9A8);transform-origin:right center;transform:scaleX(0);transition:transform .6s linear}
.pm__bar b{position:absolute;top:-2.5px;width:6px;height:6px;margin-inline-start:-3px;border-radius:50%;background:rgb(var(--dot));box-shadow:0 0 0 3px rgba(var(--dot),.18);inset-inline-start:0;transition:transform .6s linear}
.pm__note{font-size:14px;line-height:1.9;color:var(--ink-2);text-align:center;min-height:1.9em;max-width:32ch}
.pm__rm{display:none;font:700 17px/1.8 var(--display);color:#0F4C4A;text-align:center}
.pm__calm{display:grid;justify-items:center;gap:8px;text-align:center;margin-top:22px;width:min(100%,340px)}
.pm__calm b{font:800 19px/1.7 var(--display);color:#0F4C4A}.pm__calm p{font-size:15px;line-height:1.95;color:var(--ink-2);max-width:32ch}
.pm__calm .btn{margin-top:6px}
.pm--inner{position:absolute;inset:0;z-index:2;display:block;margin:0}
.pm--inner .pm__glass{position:absolute;inset:0;aspect-ratio:auto}
/* a browser that cannot do the full scene (data-mode="lite") keeps the veil and the focus pull and drops the moving light */
.pm[data-mode="lite"] .pm__spec,.pm[data-mode="lite"] .pm__bevel{display:none}
@media (prefers-reduced-motion:reduce){
 .pm__flash,.pm__spec,.pm__hold,.pm__bevel{display:none}
 .pm__lines{display:none}.pm__rm{display:block}
 .pm.is-hold .pm__lines span:nth-child(4){animation:none}
 .pm__lines span{transition:none}
}
/* ---------- the salon seal under the finished photo (never over it) ---------- */
.sealfoot{display:grid;justify-items:center;gap:10px;margin:22px auto 0;width:min(100%,var(--fw-max));padding:0 8px 4px;text-align:center}
.sealfoot__rule{width:100%;height:1px;background:linear-gradient(90deg,transparent,#C9A96A 18%,#EAD9A8 50%,#C9A96A 82%,transparent)}
.sealfoot__row{display:flex;align-items:center;justify-content:center;gap:12px;max-width:100%;min-width:0;padding-top:6px}
.sealfoot__logo{display:block;height:28px;width:auto;max-width:112px;object-fit:contain;flex:none}
.sealfoot__logo--mono{width:calc(28px * var(--lar,1));background:linear-gradient(135deg,#B8924A,#E2CD94 45%,#A47C35);-webkit-mask:var(--lg) center/contain no-repeat;mask:var(--lg) center/contain no-repeat}
.sealfoot__name{font:800 19px/1.6 var(--display);color:var(--ink);min-width:0;overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;line-clamp:2;overflow-wrap:anywhere;letter-spacing:.2px}
.sealfoot__city{font-size:14px;color:var(--ink-2)}
.sealfoot__by{font-size:12.5px;color:#8D6A2E;letter-spacing:.3px}
.pmark{display:flex;align-items:center;gap:6px;padding:10px 4px 0;font-size:12.5px;font-weight:700;color:var(--muted)}.pmark svg{width:12px;height:15px}
/* ---------- full-screen viewer: pinch, double-tap, drag, wheel ---------- */
.viewer{border:0;padding:0;margin:0;width:100vw;max-width:none;height:100dvh;max-height:none;background:#16110c;color:#fff;overflow:hidden}
.viewer::backdrop{background:#16110c}
.viewer__stage{position:absolute;inset:0;touch-action:none;overflow:hidden;cursor:grab;user-select:none;-webkit-user-select:none;direction:ltr}
.viewer__stage.is-pan{cursor:grabbing}
.viewer__item{position:absolute;left:0;top:0;transform-origin:50% 50%;will-change:transform;overflow:hidden;pointer-events:none}
.viewer__item img{display:block;width:100%;height:100%;object-fit:contain;-webkit-user-drag:none}
.viewer__item--crop img{position:absolute;top:0;max-width:none;height:100%;object-fit:fill}
.viewer__bar{position:absolute;z-index:3;top:0;inset-inline:0;display:flex;align-items:center;gap:10px;padding:max(10px,env(safe-area-inset-top)) 12px 10px;background:linear-gradient(rgba(10,7,4,.7),transparent)}
.viewer__x,.viewer__btn{min-width:48px;height:48px;border-radius:24px;border:1px solid rgba(255,255,255,.35);background:rgba(20,15,10,.62);color:#fff;font-size:15px;font-weight:700;display:inline-grid;place-items:center;padding:0 14px}
.viewer__x{font-size:26px;line-height:1;padding:0}
.viewer__x:hover,.viewer__btn:hover{background:rgba(60,45,28,.8)}
.viewer__x:focus-visible,.viewer__btn:focus-visible,.viewer__tab:focus-visible{outline:3px solid #F2E3B6;outline-offset:2px}
.viewer__title{flex:1;min-width:0;font:700 16px/1.5 var(--display);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.viewer__foot{position:absolute;z-index:3;bottom:0;inset-inline:0;display:grid;justify-items:center;gap:10px;padding:10px 12px max(14px,env(safe-area-inset-bottom));background:linear-gradient(transparent,rgba(10,7,4,.72))}
.viewer__tabs{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.viewer__tab{min-width:64px;height:44px;padding:0 16px;border-radius:22px;border:1px solid rgba(255,255,255,.35);background:rgba(20,15,10,.55);color:#fff;font-weight:700;font-size:15px}
.viewer__tab[aria-pressed="true"]{background:#F2E3B6;color:#2c1e0c;border-color:#F2E3B6}
.viewer__hint{font-size:14px;color:rgba(255,255,255,.86)}
.zoomx{position:absolute;z-index:6;top:27%;inset-inline-end:9%;width:48px;height:48px;border-radius:50%;border:1px solid rgba(255,255,255,.7);background:rgba(250,251,250,.92);color:var(--ink);display:grid;place-items:center;box-shadow:var(--lift)}
.zoomx svg{width:22px;height:22px}
body{font-size:16px}.tiny{font-size:13.5px}
@media (prefers-reduced-motion:reduce){.viewer__item{will-change:auto}}
@keyframes ping{50%{box-shadow:0 0 0 7px rgba(12,107,107,.08)}}
@media (prefers-reduced-motion:reduce){
 .build__photo,.build__scan,.build__spark,.fx,.build__steps li.is-on span,.selfie--fresh,.selfie--fresh img{animation:none}
}
.keepnote{margin:0 0 10px;padding:9px 12px;border-radius:12px;background:var(--accent-soft,rgba(15,110,110,.09));color:var(--accent-ink,#0b5555);font-size:13px;font-weight:600;line-height:1.7}
.btn--danger-ghost{color:#b3261e;border-color:rgba(179,38,30,.35)}
/* one rhythm: the same side gutter for header, steps and cards, and a single 16px gap between sections */
.wrap{max-width:900px;padding-inline:clamp(16px,3.2vw,28px)}
.layout--solo{max-width:none!important;margin:0}
#head.hero{padding:0}
.hero__cta{margin:0 0 16px}
.hd{margin:16px 0}
.layout{padding:16px 0 28px;gap:16px}
.flowcol{gap:16px}
.steps__list{padding-inline:clamp(16px,3.2vw,28px)}
@media(min-width:700px){.hd{min-height:clamp(300px,34vh,400px)}}
`;

const clientJS=String.raw`
/*__QR__*/
/*__CHECK__*/
/*__SCENE__*/
var LINES=__LINES__;
var MARK=__MARK__;
var SLUG=window.__SLUG||location.pathname.split('/').filter(Boolean)[1]||'';
var ILLO=__ILLO__;
var ICO={
 camera:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.2a2 2 0 0 0 1.7-.9l.6-1a2 2 0 0 1 1.7-.9h2.6a2 2 0 0 1 1.7.9l.6 1a2 2 0 0 0 1.7.9h1.2A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z"/><circle cx="12" cy="12.5" r="3.4"/></svg>',
 lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><rect x="4.5" y="10" width="15" height="10" rx="2.6"/><path d="M8.5 10V7.8a3.5 3.5 0 0 1 7 0V10"/></svg>',
 phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 3.5h2.2l1.6 4-2 1.3a12 12 0 0 0 6.4 6.4l1.3-2 4 1.6v2.2a2.5 2.5 0 0 1-2.7 2.5A16.5 16.5 0 0 1 4 6.2 2.5 2.5 0 0 1 6.5 3.5z"/></svg>',
 heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
 pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s6.5-6 6.5-11a6.5 6.5 0 1 0-13 0C5.5 15 12 21 12 21z"/><circle cx="12" cy="10" r="2.4"/></svg>',
 clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5l3.2 2"/></svg>',
 instagram:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r="1"/></svg>',
 globe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.4 3.6 8.5S14.4 18.1 12 20.5c-2.4-2.4-3.6-5.4-3.6-8.5S9.6 5.9 12 3.5z"/></svg>',
 send:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4 3.5 10.6l6.3 2.6 2.6 6.3z"/><path d="M20 4l-7.6 15.5"/></svg>',
 star:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.2l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.5l6-.8z"/></svg>',
 chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 3.5V17A2.5 2.5 0 0 1 4 14.5z"/></svg>',
 ban:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/></svg>',
 hand:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M8.5 12h7"/></svg>',
 SIL:'<svg viewBox="0 0 60 140" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="30" cy="13" r="7.5"/><path d="M27 20.500v5.500M33 20.500v5.500"/><path d="M27 26c-4 1.200-8 2.200-10.500 5.500C13.500 36 13 46 12 58M33 26c4 1.200 8 2.200 10.500 5.500C46.500 36 47 46 48 58"/><path d="M22.500 33.500Q30 40 37.500 33.500"/><path d="M23 34c1.200 9 2.200 18 1.500 28M37 34c-1.200 9-2.200 18-1.500 28"/><path d="M24.500 62Q30 64.500 35.500 62"/><path d="M24.500 62C22 86 14 108 5.500 129Q30 135 54.500 129C46 108 38 86 35.500 62"/><path d="M27.500 68C25 94 20 112 16.500 128M32.500 68C35 94 40 112 43.500 128" stroke-opacity=".55"/></svg>',
 spark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 21V10c0-3.5 2.7-6 6-8 3.3 2 6 4.5 6 8v11z"/><path d="M10 18c.6-3 1.4-4.5 2-6 .6 1.5 1.4 3 2 6"/></svg>',
 download:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11"/><path d="m7.5 11 4.5 4.5L16.5 11"/><path d="M4.5 19.5h15"/></svg>',
 check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7"/></svg>',
 info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.4"/></svg>',
 warn:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4.5 21 19.5H3z"/><path d="M12 10v4.5M12 17.2v.3"/></svg>',
 user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c1.2-3.4 3.9-5.2 7.5-5.2s6.3 1.8 7.5 5.2"/></svg>',
 sun:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/></svg>',
 gallery:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="m20.5 15-4.6-4.4L7 19.5"/></svg>',
 views:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3z"/><path d="M12 12 4 7.5M12 12l8-4.5M12 12v9"/></svg>',
 rot360:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.2 13a8.2 8.2 0 1 1-2.2-6.4"/><path d="M20.5 3.5v4h-4"/><text x="12" y="15" font-size="6.4" font-weight="700" text-anchor="middle" fill="currentColor" stroke="none" font-family="system-ui,sans-serif">360</text></svg>',
 phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2.5" width="10" height="19" rx="2.4"/><path d="M11 18.5h2"/><path d="M9.5 8.5h2v2h-2zM12.5 8.5h2v2h-2zM9.5 11.5h2v2h-2z"/></svg>',
 up:'<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10.5V20H4.2A1.2 1.2 0 0 1 3 18.8v-7.1a1.2 1.2 0 0 1 1.2-1.2H7zM7 10.5l3.4-7a2.1 2.1 0 0 1 2.1 2.2v3.6h5.1a2.1 2.1 0 0 1 2.1 2.4l-1.1 6.5A2.1 2.1 0 0 1 16.5 20H7"/></svg>',
 down:'<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><g transform="rotate(180 12 12)"><path d="M7 10.5V20H4.2A1.2 1.2 0 0 1 3 18.8v-7.1a1.2 1.2 0 0 1 1.2-1.2H7zM7 10.5l3.4-7a2.1 2.1 0 0 1 2.1 2.2v3.6h5.1a2.1 2.1 0 0 1 2.1 2.4l-1.1 6.5A2.1 2.1 0 0 1 16.5 20H7"/></g></svg>',
 orbit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="9" ry="3.6"/><path d="M12 3.5c2 1.6 3.2 4.7 3.2 8.5s-1.2 6.9-3.2 8.5"/><path d="m18.6 13.8 2 1.6-2.3 1"/></svg>',
 arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12H4M10 6l-6 6 6 6"/></svg>',};
var state={sz:{arm:'',bust:'',belly:''},ratio:'',pub:null,step:1,original:null,reference:null,refTitle:'',style:null,tab:'salon',result:null,gen:null,genState:null,busy:false,error:'',session:false,verified:false,idem:null,rating:0,me:null};
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
function dressInfo(p){var m={sale:'فروش',rent:'اجاره',both:'فروش و اجاره'}[p.mode]||'',t=[m,p.price].filter(Boolean).join(' · '),st=p.stock==='available'?'موجود':p.stock==='ask'?'موجودی: بپرسید':'';if(!t&&!st)return el('span',{class:'dress-info'});return el('span',{class:'dress-info'},[t?el('span',{text:t}):null,st?el('em',{class:p.stock==='available'?'ok':'',text:st}):null])}
function fa_msg(m,fb){return typeof m==='string'&&/[\u0600-\u06FF]/.test(m)?m:(fb||'مشکلی پیش آمد؛ کمی بعد دوباره امتحان کن.')}
function api(path,body,raw){
 var init={};
 if(body!==undefined){init.method='POST';init.headers=raw?{}:{'Content-Type':'application/json'};init.body=raw?body:JSON.stringify(body)}
 return fetch('/api/s/'+SLUG+'/'+path,init).catch(function(){throw new Error('ارتباط برقرار نشد؛ اینترنتت را بررسی کن و دوباره امتحان کن.')}).then(function(r){return r.json().catch(function(){return {}}).then(function(d){if(!r.ok){var er=new Error(fa_msg(d.error));er.status=r.status;throw er}return d})})
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
function trafficSrc(){var m=location.search.match(/[?&]src=([a-z]{2,8})(&|$)/);if(m)return m[1];return /[?&]kiosk=1(&|$)/.test(location.search)?'kiosk':''}
function track(kind,meta,once){if(once){if(tracked[kind+meta])return;tracked[kind+meta]=1}try{fetch('/api/s/'+SLUG+'/track',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:kind,v:VISITOR,meta:meta==null?'':String(meta),src:kind==='view'?trafficSrc():undefined}),keepalive:true}).catch(function(){})}catch(e){}}

/* ---------- boot ---------- */
(async function boot(){
 var refIn=(location.search.match(/[?&]r=([a-z0-9]{1,20})/)||[])[1]||'';
 // Both requests start together; the page paints as soon as the boutique arrives and the referral tag follows on its own.
 var pubP=api('public'),refP=api('ref',{v:VISITOR,r:refIn}).catch(function(){return null});
 try{state.pub=await pubP}catch(e){showFatal(e.message);return}

 if(refIn&&history.replaceState){try{history.replaceState(null,'',location.pathname)}catch(e){}}
 document.title=state.pub.salon.name+' | مزون آینه';
 if(state.pub.trial)trialBar(state.pub.trial);else if(state.pub.brand)applyBrand({brand:state.pub.brand});
 if(state.pub.demo)document.body.prepend(el('div',{class:'trialbar',role:'status'},[document.createTextNode('نسخهٔ نمونهٔ مزون آینه · روزی ۳ تصویر · '),el('a',{href:'/#start',style:'color:#fff;text-decoration:underline',text:'صفحهٔ مزون خودتان را بسازید'})]));
 // A bride who sent her photo to the bot arrives with her personal key: it opens her own session, photo already in it.
 var claim=(location.search.match(/[?&]c=([a-f0-9]{64})/)||[])[1]||'';
 if(claim&&history.replaceState){try{history.replaceState(null,'',location.pathname)}catch(e){}}
 var claimP=claim?api('session/claim',{t:claim}).then(function(){state.session=false;return ensureSession()}).catch(function(e){toast(e.message,'error')}):null;
 var pending=null;try{pending=sessionStorage.getItem('ayneh-job-'+SLUG)}catch(e){}
 if(pending)pending=pending.replace(/^dress:/,'');
 // Open on the boutique's own dresses when it has some, otherwise on the ready-made ones.
 state.tab=hasLineWork()?'salon':'catalog';
 renderAll();
 if(pending){state.gen=pending;state.step=3;state.busy=true;state.genT0=Date.now()-8000;renderFlow();renderDock();poll(pending,true)}
 track('view',refIn?'share':'',true);
  refP.then(function(rr){if(!rr)return;state.tag=rr.tag;state.mine=rr.mine||null;if(state.mine&&state.pub.portfolio){state.pub.portfolio=state.pub.portfolio.slice().sort(function(x,y){return (y.maker===state.mine)-(x.maker===state.mine)});if(state.step===2&&!state.busy)renderFlow()}});
 maybeTour();
 loadMine();
})();

/* ---------- free trial strip: brand colour, time left, images left ---------- */
function applyBrand(t){
 var root=document.documentElement;
 if(/^#[0-9a-f]{6}$/i.test(t.brand||'')){var n=parseInt(t.brand.slice(1),16),r=n>>16,g=(n>>8)&255,b=n&255,mix=function(k,to){return 'rgb('+[r,g,b].map(function(c){return Math.round(c+(to-c)*k)}).join(',')+')'};root.style.setProperty('--accent',mix(.18,0));root.style.setProperty('--accent-ink',mix(.45,0));root.style.setProperty('--accent-soft',mix(.82,255));root.style.setProperty('--accent-ring','rgba('+r+','+g+','+b+',.3)')}
}
function trialBar(t){
 applyBrand(t);
 var bar=el('div',{class:'trialbar',role:'status'}),fa=function(x){return String(x).replace(/\d/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'[d]})};
 function paint(){if(!t.expires_at&&!t.expired){bar.textContent='نسخهٔ آزمایشی: پس از اولین تصویر، شمارش ۱۰ ساعت آغاز می‌شود.';return}var ms=t.expires_at-Date.now();if(t.expired||ms<=0){bar.textContent='مهلت صفحهٔ آزمایشی تمام شد. برای ادامه با مزون آینه تماس بگیرید.';bar.classList.add('is-over');var main=$('#main');if(main&&!$('.trial-over')){main.replaceChildren(el('div',{class:'panel fatal trial-over'},[h('h1','مهلت صفحهٔ آزمایشی تمام شد'),h('p','این صفحه ۱۰ ساعت و ۵ تصویر برای امتحان داشت. برای نسخهٔ دائمی با مزون آینه تماس بگیرید.','muted'),el('a',{class:'btn btn--primary',href:'/#start',text:'درخواست نسخهٔ دائمی'})]))}return}
  var m=Math.ceil(ms/60000),hh=Math.floor(m/60),mm=m%60;bar.textContent='صفحهٔ آزمایشی · '+fa(hh)+' ساعت و '+fa(mm)+' دقیقه مانده · '+fa(t.images_left)+' تصویر از '+fa(t.images_limit)}
 paint();document.body.prepend(bar);setInterval(paint,30000);
 window.__trialLeft=function(){return api('public').then(function(p){if(p.trial){t.images_left=p.trial.images_left;t.expired=p.trial.expired;paint()}}).catch(function(){})};
}

function showFatal(msg){
 var main=$('#main');if(!main)return;
 main.replaceChildren(el('div',{class:'panel fatal'},[h('h1','این صفحه باز نشد'),h('p',msg,'muted'),el('a',{class:'btn btn--primary',href:'/',text:'بازگشت به مزون آینه'})]));
 var dock=$('#dock');if(dock)dock.hidden=true;
}

/* ---------- header ---------- */
function heroTag(){return 'لباس عروس را روی اندام خودت ببین؛ سایز و فرم بدنت همان می‌ماند.'}
function renderHead(){
 var s=state.pub.salon,p=s.profile||{},head=$('#head');
 var logo=p.logo?el('img',{class:'hd__logo',src:media(p.logo),alt:'لوگوی '+s.name}):el('span',{class:'hd__logo hd__logo--letter','aria-hidden':'true',text:(s.name||'آ').trim().charAt(0)});
 var name=el('h1',{class:'hd__name hero__name',text:s.name});
 head.replaceChildren(el('div',{class:'wrap'},[el('div',{class:'hd'},[el('div',{class:'hd__side hd__side--logo'},[logo]),el('div',{class:'hd__side hd__side--name'},[name])]),
  el('div',{class:'hero__cta'},[el('button',{class:'btn btn--primary btn--lg',type:'button',onclick:function(){go(state.original?2:1)},html:ICO.camera+'<span>شروع با عکس خودم</span>'})])]));
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
// What one fitting keeps (the tour saves and restores it).
var VIEW_FIELDS=['step','original','preview','ratio','reference','refTitle','style','tab','result','gen','genState','views','viewsIdem','idem','filter','error','justUploaded','genT0'];
function hasLineWork(){return (state.pub&&state.pub.portfolio||[]).some(function(p){return (p.published||p.try_on)&&(p.line||'dress')==='dress'})}
function viewDefaults(){return {step:1,original:null,preview:null,ratio:'',reference:null,refTitle:'',style:null,tab:hasLineWork()?'salon':'catalog',result:null,gen:null,genState:null,views:null,viewsIdem:null,idem:null,filter:'همه',error:'',justUploaded:false,genT0:0}}
function viewData(){var o={};VIEW_FIELDS.forEach(function(f){o[f]=state[f]});return o}
function LP(){return LINES.photo.dress}
function lineCat(){return LINES.dress}
function catalogImg(i){return '/catalog/dress/'+String(i+1).padStart(2,'0')+'.webp'}
function renderAll(){renderHead();renderSteps();renderFlow();renderSide();renderDock()}
// Where you are: a slim stepper on its own white strip.
function renderSteps(){
 var bar=$('#steps');bar.hidden=false;
 var list=el('div',{class:'steps__list wrap',role:'list','aria-label':'مراحل'});
 [['عکس تو',1],['انتخاب',2],['نتیجه',3]].forEach(function(x,k){
  var n=x[1];
  if(k)list.append(el('span',{class:'steps__line'+(state.step>=n?' is-done':''),'aria-hidden':'true'}));
  var cls='steps__item'+(state.step===n?' is-active':'')+(state.step>n?' is-done':'');
  var b=el('button',{class:cls,type:'button',role:'listitem','aria-current':state.step===n?'step':'false'},[
   el('span',{class:'steps__num',html:state.step>n?ICO.check:fa(n)}),
   el('span',{class:'steps__label',text:x[0]})
  ]);
  b.addEventListener('click',function(){go(n)});
  list.append(b);
 });
 bar.replaceChildren(el('div',{class:'steps__bottom'},[list]));
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
function isTablet(){try{return !!(navigator.maxTouchPoints>0&&Math.min(screen.width,screen.height)>=600)}catch(e){return false}}
function openCamera(){if((DESK||isTablet())&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia){kioskCamera();return}var cam=el('input',{type:'file',accept:'image/*',capture:'user'});cam.style.display='none';cam.addEventListener('change',function(){handleFile(cam.files&&cam.files[0],'original');cam.remove()});document.body.append(cam);cam.click()}
function stepPhoto(){
 var box=el('div',{class:'panel flow flow--shoot'});
 if(!state.original&&state.preview){
  box.append(flowHead('دارم عکست را بارگذاری می‌کنم','چند ثانیه صبر کن؛ همین که آماده شد خبرت می‌کنم.'));
  box.append(el('div',{class:'photo'},[el('div',{class:'mirror'},[el('div',{class:'mirror__glass'},[el('img',{src:state.preview,alt:'عکس انتخابی شما'}),el('div',{class:'upl',role:'status'},[el('span',{class:'upl__scan'}),el('span',{text:'در حال بارگذاری…'}),el('span',{class:'upl__bar'},[el('i')])])])])]));
 }else if(!state.original){
  box.append(flowHead(LP().head,LP().sub));
  var input=el('input',{type:'file',accept:'image/jpeg,image/png,image/webp',id:'pick',class:'sr-only','aria-label':'انتخاب عکس'});
  var drop=el('label',DESK?{class:'upload mirror'}:{class:'upload mirror',for:'pick'},[el('div',{class:'upload__in mirror__glass'},[
   el('strong',{class:'upload__say',text:'عکست رو بده تا عروست کنم.'})
  ])]);
  if(DESK)drop.addEventListener('click',function(e){e.preventDefault();openCamera()});
  input.addEventListener('change',function(){handleFile(input.files&&input.files[0],'original')});
  ['dragenter','dragover'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.add('is-drag')})});
  ['dragleave','drop'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.remove('is-drag')})});
  drop.addEventListener('drop',function(e){var f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];handleFile(f,'original')});
  var side=el('div',{class:'shoot__side'},[
   h('p',keepNote(),'keepnote'),
   el('details',{class:'collapse tipsbox',open:''},[el('summary',{html:ICO.info+'<span>نکات یک عکس خوب</span>'}),el('ul',{class:'tips'},LP().tips.map(function(t){return el('li',{class:'tip'},[el('span',{html:ICO[t[0]]}),el('span',{},[el('b',{text:t[1]}),document.createTextNode(t[2])])])}))]),
   el('div',{class:'shoot__btns'},[
    DESK?null:el('button',{class:'btn btn--primary',type:'button',onclick:pickNow,html:ICO.gallery+'<span>انتخاب از گالری</span>'}),
    el('button',{class:DESK?'btn btn--primary':'btn btn--ghost',type:'button',onclick:openCamera,html:ICO.camera+'<span>عکس با دوربین</span>'}),
    DESK?el('button',{class:'btn btn--ghost',type:'button',onclick:openPhonePair,html:ICO.send+'<span>ارسال از گوشی خودم</span>'}):null
   ])
  ]);
  box.append(input,el('div',{class:'demo-row'},[demoCompare('demo--small'),el('div',{class:'demo-row__text'},[h('b','این‌طوری می‌شود'),h('span',LP().demo)])]),el('div',{class:'shoot'},[drop,side]));
 }else{
  var fresh=state.justUploaded;
  box.append(flowHead(fresh?'عکست بارگذاری شد':'عکست آماده است',fresh&&!state.photoWarn?'الان می‌رویم سراغ انتخاب لباس…':LP().ready));
  box.append(el('div',{class:'photo'},[
   el('div',{class:'mirror'},[el('div',{class:'mirror__glass'},[el('img',{src:state.preview||media(state.original),alt:'عکس انتخابی شما'}),fresh?el('span',{class:'photo__badge','aria-hidden':'true',html:ICO.check}):null])]),
   fresh&&!state.photoWarn?el('div',{class:'photo__auto','aria-hidden':'true'},[el('i')]):null,
   el('div',{class:'photo__bar'},[
    el('span',{html:ICO.check+'<span>عکس انتخاب شد</span>'}),
    el('button',{class:'btn btn--ghost btn--sm',type:'button',onclick:changePhoto,text:'تغییر عکس'})
   ])
  ]));
  if(state.photoWarn)box.append(notice('info',state.photoWarn));
  box.append(el('div',{class:'flow__nav'},[
   el('button',{class:'btn btn--primary',type:'button',onclick:function(){go(2)},text:'ادامه: انتخاب لباس'})
  ]));
 }
 return box;
}
function pickedBar(text,onRemove){
 return el('div',{class:'picked'},[el('span',{text:text}),el('button',{class:'btn btn--ghost btn--sm',type:'button',onclick:onRemove,text:'حذف انتخاب'})]);
}
var TAB_LABEL={dress:['لباس‌های مزون','لباس‌های آماده','عکس لباس من']};var MODEL_HEAD={
 dress:['لباس عروس را انتخاب کن','از لباس‌های همین مزون، لباس‌های آماده یا عکس لباسی که خودت پیدا کرده‌ای. فقط لباس عوض می‌شود؛ چهره، سایز و فرم بدنت همان می‌ماند.']
};
function pickLook(fn){fn();state.result=null;state.error='';renderFlow();renderDock()}
// Choosing a dress brings the next thing to do into view: «خودت را در لباس عروس ببین».
function chooseLook(fn){pickLook(fn);scrollToBuild()}
function scrollToBuild(){
 var f=$('#flow');if(!f)return;
 var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches,beh=reduce?'auto':'smooth';
 var bar=$('#steps'),top=(bar&&!bar.hidden?bar.getBoundingClientRect().height:0)+12;
 var dock=$('#dock:not([hidden])'),bottom=(dock&&getComputedStyle(dock).position==='fixed'?dock.getBoundingClientRect().height:0)+16;
 var nav=f.querySelector('.flow__nav'),picked=f.querySelector('.picked');
 requestAnimationFrame(function(){
  var y;
  if(nav){var hint=f.querySelector('.build-hint')||nav,end=hint.getBoundingClientRect().bottom+window.pageYOffset;y=end-(window.innerHeight-bottom);
   var start=(picked||nav).getBoundingClientRect().top+window.pageYOffset-top;if(y>start)y=start}
  if(y!=null)window.scrollTo({top:Math.max(0,y),behavior:beh});
 });
}
function sizesPayload(){var o={};['arm','bust','belly'].forEach(function(k){var n=parseInt(state.sz[k],10);if(n>=15&&n<=250)o[k]=n});return Object.keys(o).length?o:undefined}
function sizesRow(){
 var wrap=el('details',{class:'sizes'+((state.sz.arm||state.sz.bust||state.sz.belly)?'':'')});
 if(state.sz.arm||state.sz.bust||state.sz.belly)wrap.open=true;
 wrap.append(el('summary',{},[el('b',{text:'اندازه‌های بدنم (اختیاری)'})]));
 wrap.append(h('p','اگر بنویسی، تصویر با همین تناسب ساخته می‌شود. خالی بگذاری، همان اندام عکس حفظ می‌شود.','tiny muted'));
 var g=el('div',{class:'sizes__grid'});
 [['arm','دور بازو'],['bust','دور سینه'],['belly','دور شکم']].forEach(function(x){
  var i=el('input',{type:'text',inputmode:'numeric',maxlength:'3',placeholder:'سانتی‌متر',dir:'ltr','aria-label':x[1]+' به سانتی‌متر'});
  i.value=state.sz[x[0]]||'';
  i.addEventListener('input',function(){var v=i.value.replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)}).replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d)}).replace(/\D/g,'').slice(0,3);if(i.value!==v)i.value=v;state.sz[x[0]]=v;state.idem=null});
  g.append(el('label',{class:'field'},[el('span',{class:'lbl',text:x[1]}),i]));
 });
 wrap.append(g);return wrap;
}
function stepModel(){
 var box=el('div',{class:'panel flow'});
 if(state.original){
  var fresh=state.justArrived;state.justArrived=false;
  box.append(el('div',{class:'selfie'+(fresh?' selfie--fresh':'')},[el('img',{src:state.preview||media(state.original),alt:''}),el('div',{},[el('b',{html:ICO.check+'<span>'+(fresh?'عکست ثبت شد':'عکست آماده است')+'</span>'}),el('span',{text:'لباس انتخابی روی همین عکس امتحان می‌شود.'})]),el('button',{class:'btn btn--ghost btn--sm',type:'button',onclick:function(){changePhoto();go(1)},text:'تغییر'})]));
 }
 box.append(sizesRow());
 if(quotaLeft()===0&&!state.tourDemo)box.append(notice('warn',quotaOut()));
 var seg=el('div',{class:'seg',role:'tablist'});
 var tabs=[['salon',0]];if(state.pub.catalog)tabs.push(['catalog',1]);if(state.pub.own_dress)tabs.push(['upload',2]);
 if(!tabs.some(function(x){return x[0]===state.tab}))state.tab='salon';
 tabs.forEach(function(x){
  var b=el('button',{type:'button',role:'tab','data-tab':x[0],'aria-selected':state.tab===x[0]?'true':'false',text:TAB_LABEL.dress[x[1]]});
  b.addEventListener('click',function(){state.tab=x[0];renderFlow()});
  seg.append(b);
 });
 if(tabs.length>1)box.append(seg);
 if(state.tab==='salon'){
  var items=(state.pub.portfolio||[]).filter(function(p){return (p.published||p.try_on)&&(p.line||'dress')==='dress'});
  if(!items.length)box.append(el('div',{class:'empty'},[el('span',{html:ILLO.dresses}),h('b','گالری مزون هنوز لباسی ندارد'),h('p',state.pub.catalog||state.pub.own_dress?'تا اضافه شدن لباس‌ها، از «'+TAB_LABEL.dress[1]+'» یا «'+TAB_LABEL.dress[2]+'» استفاده کن.':'به‌زودی پر می‌شود. ')]));
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
     el('span',{class:'style-card__body'},[el('span',{class:'style-card__name',text:p.title})])
    ]);
    if(imgs.length>1)art0.append(el('span',{class:'angle-badge',text:fa(imgs.length)+' نما'}));
    function pickIt(){track('look','s:'+p.title);chooseLook(function(){state.reference=imgs[0];state.refTitle=p.title;state.style=null})}
    card.addEventListener('click',function(){if(imgs.length>1)openDress(p,imgs,pickIt);else pickIt()});
    grid0.append(card);
   });
   box.append(grid0);
  }
  if(state.reference&&state.refTitle)box.append(pickedBar('کار انتخابی: '+state.refTitle,function(){pickLook(function(){state.reference=null;state.refTitle=''})}));
 }else if(state.tab==='catalog'){
  var cat=lineCat(),LIST=cat.styles,filters=cat.filters;
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
   pic.addEventListener('error',function(){art.classList.add('is-missing');pic.remove()});
   var card=el('button',{class:'style-card'+(on?' is-on':''),type:'button','aria-pressed':on?'true':'false'},[
    art,
    el('span',{class:'style-card__body'},[el('span',{class:'style-card__name',text:s[0]}),el('span',{class:'style-card__tag',text:s[2]})])
   ]);
   card.addEventListener('click',function(){track('look','d:'+i);chooseLook(function(){state.style=i;state.reference=null;state.refTitle=''})});
   grid.append(card);
  });
  box.append(grid);
  if(state.style!==null&&!state.reference)box.append(pickedBar('لباس انتخابی: '+LIST[state.style][0],function(){pickLook(function(){state.style=null})}));
 }else{
  if(!state.reference||state.refTitle){
   var input2=el('input',{type:'file',accept:'image/jpeg,image/png,image/webp',id:'pickref',class:'sr-only'});
   var drop2=el('label',{class:'upload upload--ref mirror',for:'pickref'},[el('div',{class:'upload__in mirror__glass'},[
    el('span',{class:'upload__icon',html:ICO.gallery}),
    el('strong',{text:'عکس لباس دلخواهت'}),
    el('span',{class:'upload__hint',text:LP().ref})
   ])]);
   input2.addEventListener('change',function(){handleFile(input2.files&&input2.files[0],'reference')});
   box.append(input2,drop2);
  }else{
   box.append(el('div',{class:'ref-photo mirror'},[el('div',{class:'mirror__glass'},[el('img',{src:media(state.reference),alt:'عکس مرجع'})])]));
   box.append(pickedBar('عکس لباس اضافه شد',function(){pickLook(function(){state.reference=null})}));
   box.append(h('p',LP().ref,'hint'));
  }
 }
 if(state.reference&&!state.pub.reference&&state.pub.generation)box.append(notice('warn','ساخت تصویر از عکس مرجع یا لباس مزون هنوز برای این مزون فعال نشده. می‌توانی از موارد آماده انتخاب کنی، یا همین را بدون شبیه‌سازی برای '+artist()+' بفرستی.'));
 var can=canGenerate()||!!state.tourDemo,ready=hasChoice()||!!state.tourDemo,left=quotaLeft();
 box.append(el('div',{class:'flow__nav'},[
  el('button',{class:'btn btn--ghost',type:'button',onclick:function(){go(1)},text:'بازگشت'}),
  el('button',{class:'btn btn--primary btn--build',type:'button',disabled:!ready,onclick:build,html:buildLabel(can)})
 ]));
 box.append(h('p',buildHint(ready,can,left),'fine-print build-hint'));
 return box;
}
function buildLabel(can){return can?ICO.spark+'<span>خودت را در لباس عروس ببین</span>':(quotaLeft()===0?ICO.send+'<span>فرستادن برای '+artist()+'</span>':'<span>ادامه: نتیجه</span>')}
function buildHint(ready,can,left){
 if(!ready)return missingReason()+'.';
 if(!can)return '';
 return 'با زدن «خودت را در لباس عروس ببین» عکست برای ساخت فرستاده می‌شود و فقط برای همین مزون می‌ماند.'+(left!=null?' '+fa(left)+' ساخت دیگر در این بخش داری.':'');
}
// Step 2 → 3 in one tap: «خودت را در لباس عروس ببین» goes straight to building, no page in between.
function build(){
 if(!hasChoice()){toast(missingReason());return}
 if(!canGenerate()){go(3);return}
 go(3);generate();
}
function renderDockSoon(){clearTimeout(renderDockSoon.t);renderDockSoon.t=setTimeout(function(){renderDock();var b=$('#flow .btn--build');if(b){var c=canGenerate(),r=hasChoice();b.innerHTML=buildLabel(c);b.disabled=!r;var hn=$('#flow .build-hint');if(hn)hn.textContent=buildHint(r,c,quotaLeft())}},60)}
function hasChoice(){return !!state.original&&(state.style!==null||!!state.reference)}
function canGenerate(){return hasChoice()&&!!state.pub.generation&&(!state.reference||!!state.pub.reference)&&quotaLeft()!==0}
function missingReason(){
 if(!state.original)return 'اول عکس خودت را اضافه کن';
 if(quotaLeft()===0)return quotaOut();
 if(!state.pub.generation)return 'تولید شبیه‌سازی برای این مزون فعال نیست؛ می‌توانی درخواست بررسی بفرستی';
 if(state.reference&&!state.pub.reference)return 'انتقال عکس مرجع هنوز فعال نشده است';
 return 'یک لباس انتخاب کن';
}
// Before/after: the line sits exactly under the finger. Positions are physical (left→right)
// so RTL page direction never flips the drag. Drag moves 1:1, a tap moves the line there,
// and the hidden range keeps keyboard and screen-reader control.
var EXPAND_ICO='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>';
function compareBlock(){
 var wrap=el('div',{class:'compare'}),ru=media(state.result);
 var bImg=el('img',{src:media(state.original),alt:'قبل',draggable:'false',decoding:'async'}),aImg=el('img',{src:ru,alt:'بعد',draggable:'false',decoding:'async'});
 wrap.append(bImg);
 wrap.append(el('div',{class:'compare__after'},[aImg]));
 wrap.append(el('div',{class:'compare__handle'},[el('span',{class:'compare__grip',html:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 8 5 12l4 4M15 8l4 4-4 4"/></svg>'})]));
 wrap.append(el('span',{class:'compare__tag compare__tag--before',text:'قبل'}));
 wrap.append(el('span',{class:'compare__tag compare__tag--after',text:'بعد'}));
 var range=el('input',{type:'range',min:'0',max:'100',value:'50',dir:'ltr',class:'compare__range','aria-label':'مقایسهٔ قبل و بعد؛ با کلیدهای جهت خط را جابه‌جا کن'});
 wrap.append(range);
 var x=50;
 function set(v,animate){x=Math.max(0,Math.min(100,v));wrap.classList.toggle('is-animating',!!animate);wrap.style.setProperty('--x',x+'%');range.value=String(Math.round(x))}
 set(50);
 var mir=el('div',{class:'mirror compare-wrap nofx',style:'position:relative;z-index:1'},[wrap]);
 var box=el('div',{class:'zoomable',style:'--ar:'+((state.arOf&&state.arOf[ru])||.6667)},[el('div',{class:'mirror mirror-shd compare-wrap','aria-hidden':'true'},[el('div',{class:'mirror__glass'})]),mir]);
 aImg.addEventListener('load',function(){var a=clampAr(aImg.naturalWidth,aImg.naturalHeight);(state.arOf=state.arOf||{})[ru]=a;box.style.setProperty('--ar',a);aImg.setAttribute('width',aImg.naturalWidth);aImg.setAttribute('height',aImg.naturalHeight)});
 var start=null;
 wrap.addEventListener('pointerdown',function(e){if(e.button>0)return;var r=wrap.getBoundingClientRect();start={px:e.clientX,x:x,w:r.width,left:r.left,moved:false,id:e.pointerId};wrap.classList.add('is-dragging')});
 wrap.addEventListener('pointermove',function(e){if(!start||e.pointerId!==start.id)return;var dx=e.clientX-start.px;if(!start.moved&&Math.abs(dx)<4)return;if(!start.moved){start.moved=true;try{wrap.setPointerCapture(e.pointerId)}catch(err){}}e.preventDefault();set(start.x+dx/start.w*100,false)});
 function end(e){if(!start)return;if(!start.moved&&e.type==='pointerup')set((e.clientX-start.left)/start.w*100,true);start=null;wrap.classList.remove('is-dragging')}
 wrap.addEventListener('pointerup',end);wrap.addEventListener('pointercancel',end);
 range.addEventListener('input',function(){set(Number(range.value),false)});
 var zb=el('button',{class:'zoomx',type:'button','aria-label':'باز کردن عکس تمام‌صفحه برای بزرگ‌نمایی',html:EXPAND_ICO});
 zb.addEventListener('pointerdown',function(e){e.stopPropagation()});
 zb.addEventListener('click',function(){openViewer([{src:ru,name:'بعد'},{src:media(state.original),name:'قبل'}],0,{title:'نتیجهٔ تو'})});
 box.append(zb);
 return el('div',{},[box,el('p',{class:'compare__hint',text:'خط را با انگشت بکش یا روی هر جای عکس بزن'})]);
}
function ratingBlock(){
 var wrap=el('div',{class:'rate-line'});
 wrap.append(h('span','چقدر شبیه خودت شد؟','tiny muted'));
 var stars=el('div',{class:'rating',role:'group','aria-label':'امتیاز به شباهت'});
 for(var i=1;i<=5;i++){
  (function(n){
   var b=el('button',{class:'rating__star'+(state.rating>=n?' is-on':''),type:'button','aria-label':fa(n)+' از ۵','aria-pressed':state.rating>=n?'true':'false',html:ICO.star});
   b.addEventListener('click',function(){state.rating=n;saveRating(n);renderFlow()});
   stars.append(b);
  })(i);
 }
 wrap.append(stars);
 return wrap;
}
/* ---------- share, likes and comments under the result, and "may we post this on the boutique's social media?" ---------- */
function socialBlock(){
 var wrap=el('div',{class:'social'}),gen=state.gen;
 if(!gen||!state.result)return wrap;
 var S=state.soc&&state.soc.gen===gen?state.soc:(state.soc={gen:gen,likes:0,comments:[],consent:0,loaded:false});
 function paint(){
  wrap.replaceChildren();
  var salon=state.pub.salon.name;
  if(S.consent===0){
   wrap.append(el('div',{class:'soc-card'},[
    h('p','به نظر ما تصویر شما بسیار زیبا و دیدنی است. افتخار به اشتراک‌گذاری این تصویر در سوشال مزون («'+salon+'») را به ما می‌دهید؟'),
    el('div',{class:'soc-row'},[
     el('button',{class:'btn btn--primary btn--sm',type:'button',text:'بله، افتخار می‌دهم',onclick:function(){answer(true)}}),
     el('button',{class:'btn btn--ghost btn--sm',type:'button',text:'نه، ممنون',onclick:function(){answer(false)}})
    ])
   ]));
  }else if(S.consent===1){wrap.append(h('p','ممنون! اجازهٔ انتشار این تصویر در سوشال «'+salon+'» ثبت شد.','soc-stat'))}
  var nm=el('input',{type:'text',maxlength:'40',placeholder:'اسمت (برای متن پست)',autocomplete:'given-name',value:S.name||''});
  nm.addEventListener('input',function(){S.name=nm.value});
  var card=el('div',{class:'soc-card'},[
   h('p','این تصویر را برای دوستان و خانواده بفرست؛ هر کس روی لینک بزند می‌تواند لایک کند و نظر بنویسد.'),
   el('div',{class:'soc-row'},[nm,el('button',{class:'btn btn--soft btn--sm',type:'button',html:ICO.send+'<span>اشتراک‌گذاری</span>',onclick:share})]),
   el('div',{class:'soc-stat ic-inline',html:ICO.heart+'<span>'+fa(S.likes)+'</span>'+ICO.chat+'<span>'+fa(S.comments.length)+'</span>'})
  ]);
  S.comments.forEach(function(c){card.append(el('div',{class:'soc-c'},[el('b',{text:c.name}),el('span',{text:c.body})]))});
  wrap.append(card);
 }
 function answer(yes){api('social',{gen:gen,consent:yes}).then(function(){S.consent=yes?1:2;paint();if(yes)toast('ممنون! ثبت شد')}).catch(function(e){toast(e.message,'error')})}
 function share(){
  api('share',{gen:gen,name:(S.name||'').trim()}).then(function(d){
   track('share_post','');
   if(navigator.share)return navigator.share({text:d.text}).catch(function(){});
   return copyText(d.text).then(function(){toast('متن و لینک کپی شد؛ برای هر کس خواستی بفرست')},function(){toast(d.text)});
  }).catch(function(e){toast(e.message,'error')});
 }
 function load(){api('reactions/'+gen).then(function(d){var ch=d.likes!==S.likes||d.comments.length!==S.comments.length||d.consent!==S.consent||!S.loaded;S.likes=d.likes;S.comments=d.comments||[];S.consent=d.consent;S.loaded=true;if(ch&&wrap.isConnected&&!(document.activeElement&&wrap.contains(document.activeElement)))paint()}).catch(function(){})}
 paint();load();
 var t=setInterval(function(){if(!wrap.isConnected&&S.polled){clearInterval(t);return}S.polled=true;load()},20000);
 return wrap;
}

function saveRating(n){try{localStorage.setItem('ayneh-rating-'+state.result,String(n))}catch(e){}track('rating',n+':'+(state.gen||''))}
function noImageCard(msg){
 var t=(state.pub&&state.pub.no_image_message)||msg||'الان امکان ساخت تصویر نیست؛ درخواستت را برای مزون بفرست';
 return el('div',{class:'noimg',role:'status'},[el('span',{class:'noimg__ic',html:ICO.info.replace('<svg','<svg class="noimg__ic"')}),h('p',t),
  el('button',{class:'btn btn--primary btn--block',type:'button',onclick:function(){closeSheet();openRequest()},html:ICO.send+'<span>ارسال درخواست برای مزون بدون تصویر</span>'})]);
}
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
 if(state.reference)return state.refTitle?'«'+state.refTitle+'» از لباس‌های مزون':'عکس لباس دلخواه';
 return state.style!==null?lineCat().styles[state.style][0]:'';
}
function artist(){return 'مدیر مزون'}
// What happens to photos that are never sent to the boutique (a boutique setting, 30 days by default).
function retentionLine(){var m=state.pub&&state.pub.photo_ttl;if(m)return 'عکس و نتیجه‌ای که برای مزون نفرستی، بعد از '+(m===60?'یک ساعت':m%60===0?fa(m/60)+' ساعت':fa(m)+' دقیقه')+' خودکار پاک می‌شود.';var d=state.pub&&state.pub.retention_days;return d?'عکس و نتیجه‌ای که برای مزون نفرستی، بعد از '+fa(d)+' روز خودکار پاک می‌شود.':''}
// The dress behind the current choice, for the save counter: a boutique dress ('p:id') or a catalogue one ('d:n').
function dressKey(){
 if(state.reference){var hit=(state.pub.portfolio||[]).filter(function(x){try{return JSON.parse(x.images||'[]').indexOf(state.reference)>-1}catch(e){return false}})[0];return hit?'p:'+hit.id:''}
 return state.style!==null&&state.style!==undefined?'d:'+state.style:'';
}
function wantButton(cls){return el('button',{class:cls||'btn btn--primary',type:'button','data-want':'1',onclick:function(){openWant()},html:ICO.heart+'<span>این لباس را می‌خواهم</span>'})}
function sendButton(){return el('button',{class:'btn btn--primary',type:'button',onclick:openRequest,html:ICO.send+'<span>فرستادن برای '+artist()+'</span>'})}
/* ---------- «پردهٔ آینه»: the waiting scene, driven by the real job ---------- */
// Her own photo stays visible the whole time, behind a sheer ivory silk veil that lifts while her photo comes into focus from the hem
// upward. Light moves slowly over the glass and around the gilded bevel. Nothing is drawn in the shape of any gown and no pattern is
// laid over the picture: the chosen dress only adds a faint tint (12% at most) to the glow and to the progress dot.
// If the job takes longer than usual the scene rests on «آخرین پرداخت…». When the server says it is done, a glimpse of the real
// result flickers through the veil, the bevel flashes, the veil lifts and the result develops.
// Only transform and opacity are animated, from one requestAnimationFrame loop that sleeps when the tab is hidden.
var PM_LINES=['لباس انتخاب شد…','روی اندام تو تنظیم می‌شود…','نور و سایه جا می‌افتد…','آخرین پرداخت…','آینه آماده است'];
var PM_END=2.7,PM_P0=.82;
function pmEnv(){
 var f={css:false,filter:false,ctxFilter:false,canvas:false,mask:true,raf:typeof requestAnimationFrame==='function',reduce:false,lowEnd:false};
 try{f.css=!!(window.CSS&&CSS.supports&&CSS.supports('transform','translate3d(0,0,0)')&&CSS.supports('inset','0'))}catch(e){}
 try{f.filter=!!(window.CSS&&CSS.supports&&(CSS.supports('filter','blur(1px)')||CSS.supports('-webkit-filter','blur(1px)')))}catch(e){}
 try{f.mask=!!(window.CSS&&CSS.supports&&(CSS.supports('mask-image','linear-gradient(#000,transparent)')||CSS.supports('-webkit-mask-image','linear-gradient(#000,transparent)')))}catch(e){}
 try{var cv=document.createElement('canvas'),g=cv.getContext&&cv.getContext('2d');f.canvas=!!g;if(g){g.filter='blur(2px)';f.ctxFilter=g.filter==='blur(2px)'}}catch(e){}
 try{f.reduce=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(e){}
 try{f.lowEnd=(navigator.hardwareConcurrency||8)<=2||(navigator.deviceMemory||4)<=1}catch(e){}
 return {f:f,caps:sceneCaps(f)};
}
// The dress she chose, as a picture: a boutique dress or an upload (media id) or a catalogue one.
function dressUrl(){
 if(state.reference)return media(state.reference);
 return state.style!==null&&state.style!==undefined?catalogImg(state.style):'';
}
// Colours of the chosen dress; resolves to null when the picture cannot be had (the scene stays ivory and gold).
var DLOOK={};
function dressLook(url){
 if(!url)return Promise.resolve(null);
 if(DLOOK[url])return DLOOK[url];
 return DLOOK[url]=new Promise(function(res){
  var done=false;function fin(v){if(!done){done=true;res(v)}}
  setTimeout(function(){fin(null)},6000);
  loadImg(url).then(function(im){
   var look={pal:neutralPalette()};
   try{
    var cw=32,ch=Math.max(8,Math.min(64,Math.round(cw*((im.naturalHeight||1)/(im.naturalWidth||1))))),cv=document.createElement('canvas');cv.width=cw;cv.height=ch;
    var g=cv.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0,cw,ch);
    look.pal=dressPalette(g.getImageData(0,0,cw,ch).data,cw,ch);
   }catch(e){look.pal=neutralPalette()}
   fin(look);
  }).catch(function(){fin(null)});
 });
}
// A photo out of focus: a small copy that the browser stretches, a little desaturated (a canvas filter if it has one).
// Cached by address; returns '' when the picture cannot be read (a tainted canvas).
var SOFT={};
function softCopy(img,how){
 var key=(img.currentSrc||img.src)+'|'+how;if(SOFT[key]!==undefined)return SOFT[key];
 var out='';
 try{
  var w=img.naturalWidth||0,hh=img.naturalHeight||0;
  if(w&&hh&&how!=='none'){
   var tw=how==='ctx'?230:56,th=Math.max(8,Math.round(tw*hh/w)),c=document.createElement('canvas'),g=c.getContext('2d');
   c.width=tw;c.height=th;g.imageSmoothingEnabled=true;try{g.imageSmoothingQuality='high'}catch(e){}
   if(how==='ctx'){g.filter='blur(1.2px) saturate(.6)';g.drawImage(img,0,0,tw,th)}
   else{
    var c2=document.createElement('canvas'),g2=c2.getContext('2d'),mw=Math.max(6,Math.round(tw*.6)),mh=Math.max(6,Math.round(th*.6));c2.width=mw;c2.height=mh;g2.imageSmoothingEnabled=true;g2.drawImage(img,0,0,mw,mh);g.drawImage(c2,0,0,tw,th);
    var id=g.getImageData(0,0,tw,th),d=id.data;for(var i=0;i<d.length;i+=4){var m=d[i]*.3+d[i+1]*.59+d[i+2]*.11;d[i]=m+(d[i]-m)*.6;d[i+1]=m+(d[i+1]-m)*.6;d[i+2]=m+(d[i+2]-m)*.6}
    g.putImageData(id,0,0);
   }
   out=c.toDataURL('image/jpeg',.86);
  }
 }catch(e){out=''}
 if(Object.keys(SOFT).length>8)SOFT={};
 return SOFT[key]=out;
}
// Applies a dress's colours to one scene: two colour variables (glow and progress dot), each tinted 12% at most.
function pmTint(root,look){
 var pal=look&&look.pal?look.pal:neutralPalette(),a=sceneAccent(pal);
 root.style.setProperty('--glw',rgbCss(a.glow));root.style.setProperty('--dot',rgbCss(a.dot));
 root.setAttribute('data-tone',pal.tone);
}
function clampAr(w,h){var r=(w&&h)?w/h:.6667;return Math.max(.46,Math.min(.85,r))}
// Builds the scene. opts.inner: only the glass (inside another frame); opts.calm: a still pose, no timeline.
function pmScene(src,opts){
 opts=opts||{};
 var env=pmEnv(),caps=env.caps,full=caps.mode==='full'&&!opts.calm,still=caps.mode==='still'||!!opts.calm;
 var soft=el('img',{class:'pm__im pm__soft',alt:'',decoding:'async'});
 var photo=src?el('img',{class:'pm__im pm__before',src:src,alt:'',decoding:'async'}):el('span',{class:'pm__im',html:ILLO.loader});
 var rsoft=el('img',{class:'pm__im pm__rsoft',alt:'',decoding:'async'}),res=el('img',{class:'pm__im pm__res',alt:'',decoding:'async'});
 var sharpin=el('div',{class:'pm__sharpin'},[photo]);
 var sharp=el('div',{class:'pm__sharp'},[sharpin]);
 var veil=el('div',{class:'pm__veil'},[el('div',{class:'pm__folds'})]);
 var spec=full?el('div',{class:'pm__spec'}):null,hold=el('div',{class:'pm__hold'},[el('i')]);
 var world=el('div',{class:'pm__world'},[soft,sharp,rsoft,res,veil,hold]);
 var flash=el('div',{class:'pm__flash'});
 var glass=el('div',{class:'mirror__glass pm__glass'},[world,spec,flash]);
 var bv1=full?el('i',{class:'pm__bv1'}):null,bv2=full?el('i',{class:'pm__bv2'}):null,bevel=full?el('div',{class:'pm__bevel','aria-hidden':'true'},[bv1,bv2]):null;
 var S={root:null,photo:photo,res:res,rsoft:rsoft,mirror:null,glass:glass,world:world,soft:soft,sharp:sharp,sharpin:sharpin,veil:veil,spec:spec,bv1:bv1,bv2:bv2,flash:flash,hold:hold,blurOn:false,W:0,H:0,caps:caps,still:still,full:full};
 // the out-of-focus copy of her photo
 function makeSoft(){
  if(!src||!photo.naturalWidth)return;
  var how=caps.blur,u=softCopy(photo,how);
  if(u){soft.src=u;S.blurOn=true}
  else if(how!=='none'&&env.f.filter){soft.src=src;soft.classList.add('pm__cssblur');S.blurOn=true}
  else{S.blurOn=false;soft.src=src}
  S.root&&S.root.classList.toggle('pm--noblur',!S.blurOn);
  if(S.pose)S.pose();
 }
 // the result, out of focus first (it develops from blur to sharp): built when the result is known
 S.setResult=function(url){
  if(!url)return;
  res.src=url;
  var go=function(){var u=softCopy(res,caps.blur==='none'?'none':caps.blur);if(u)rsoft.src=u;else if(env.f.filter){rsoft.src=url;rsoft.classList.add('pm__cssblur')}};
  if(res.complete&&res.naturalWidth)go();else res.addEventListener('load',go);
 };
 var ar=state.arOf&&state.arOf[state.original]||.5714,root;
 if(opts.inner){
  root=el('div',{class:'pm pm--inner','aria-hidden':'true'},[glass]);
 }else{
  // the frame's shadow lives on a static twin: a drop-shadow filter on the animating mirror would be redrawn every frame
  var mirror=el('div',{class:'pm__stack fw',style:'--ar:'+ar},[el('div',{class:'mirror mirror-shd','aria-hidden':'true'},[el('div',{class:'mirror__glass'})]),el('div',{class:'mirror pm__mirror nofx'},[glass,bevel])]);S.mirror=mirror;
  var lines=el('div',{class:'pm__lines','aria-hidden':'true'},PM_LINES.map(function(t,i){return el('span',{class:i===4?'end':'',text:t})}));
  var cap=el('div',{class:'pm__cap'},[lines,el('div',{class:'pm__rm','aria-hidden':'true',text:PM_LINES[0]}),el('div',{class:'pm__bar','aria-hidden':'true'},[el('i'),el('b')]),el('p',{class:'pm__note',text:''}),el('span',{class:'sr-only','aria-live':'polite',role:'status'})]);
  root=el('div',{class:'pm'+(opts.calm?' pm--calm':''),'data-mode':caps.mode},[el('span',{class:'pm__glow','aria-hidden':'true'}),mirror,opts.calm?null:cap]);
  photo.addEventListener('load',function(){var a=clampAr(photo.naturalWidth,photo.naturalHeight);(state.arOf=state.arOf||{})[state.original]=a;mirror.style.setProperty('--ar',a)});
 }
 root.setAttribute('data-mode',caps.mode);
 S.root=root;
 if(photo.addEventListener){if(photo.complete&&photo.naturalWidth)makeSoft();else photo.addEventListener('load',makeSoft)}
 // colours of the chosen dress (ivory and gold until they are known, and for good if the picture cannot be read)
 pmTint(root,null);
 var du2=dressUrl();
 if(du2)dressLook(du2).then(function(look){if(look)pmTint(root,look)}).catch(function(){});
 return S;
}
// Writes one frame. Only transform and opacity (and class-free), no layout reads: W and H were measured once.
function pmSet(e,v){if(e&&e.__t!==v){e.__t=v;e.style.transform=v}}
function pmOp(e,v){v=Math.round(Math.max(0,Math.min(1,v))*100)/100;if(e&&e.__o!==v){e.__o=v;e.style.opacity=v}}
function smooth(a,b,x){x=Math.max(0,Math.min(1,(x-a)/(b-a)));return x*x*(3-2*x)}
// a pulse: up from a to b, down from b to c
function tri(a,b,c,x){return x<=a||x>=c?0:x<b?(x-a)/(b-a):(c-x)/(c-b)}
// x: hold (shimmer), enter, glimpse (0..1 opacity of the real result through the veil), flash, spark (bevel flash), dev (0..1 the result develops), fin
function pmPose(S,p,t,x){
 x=x||{};
 var g=sceneGeom(p),u=g.u,sh=S.blurOn?g.sharp:1,H=S.H||0,W=S.W||0,full=S.full;
 if(x.hold)u=Math.max(0,u+Math.sin(t*1.1)*.006);
 pmSet(S.veil,'translate3d(0,'+(-u*100).toFixed(2)+'%,0)');pmOp(S.veil,1-.4*smooth(0,1,p));
 pmSet(S.sharp,'translate3d(0,'+(sh*100).toFixed(2)+'%,0)');pmSet(S.sharpin,'translate3d(0,'+(-sh*100).toFixed(2)+'%,0)');
 pmOp(S.hold,x.hold?1:0);
 // light on the glass, and around the bevel (each pass takes about seven seconds)
 if(full){
  var s=x.specPos==null?((t*.14)%1)*1.7-.35:x.specPos;
  pmSet(S.spec,'translate3d('+(-130+440*s).toFixed(1)+'%,0,0) skewX(-14deg)');
  pmOp(S.spec,.12+.4*(x.sweep||0));
  pmSet(S.bv1,'rotate('+(((t*52+(x.spin||0)*540)%360)).toFixed(1)+'deg)');
  pmOp(S.bv1,.9);pmOp(S.bv2,.9*(x.spark||0));
 }
 // her photo breathes a little (1 to 1.015) and settles when the result has developed
 var br=(1-Math.cos(t*.9))*.0075*(1-(x.dev||0)),sc=1+br;
 pmSet(S.world,'scale('+sc.toFixed(4)+')');
 // the real result, seen for an instant through the veil, then developing from blur to sharp
 var dev=x.dev||0;
 pmOp(S.rsoft,smooth(0,.5,dev));
 pmOp(S.res,Math.max(x.glimpse||0,smooth(.35,1,dev)));
 pmSet(S.res,dev>0&&dev<1?'scale('+(1+.02*(1-smooth(.35,1,dev))).toFixed(4)+')':'');
 pmOp(S.flash,x.flash||0);
}
// One controller per job: it maps real elapsed time to the scene's own clock, and plays the finish when told.
function pmCtl(o){
 var c={t0:o.t0||Date.now(),tb:(o.tb||42)*1000,mode:'build',p:0,ct:0,last:0,root:null,res:null,mirror:null,S:null,raf:0,tm:0,line:-1,url:'',resolve:null,hold:false,off:false,t:0,txtAt:0,noteOverride:'',born:performance.now()};
 var rm=function(){try{return !!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(e){return false}};
 function live(){return c.root&&c.root.isConnected}
 function measure(){var S=c.S;if(!S||!S.glass)return;S.W=S.glass.clientWidth;S.H=S.glass.clientHeight}
 c.mount=function(sc){
  unobserve();
  c.S=sc;c.root=sc.root;c.res=sc.res;c.mirror=sc.mirror||null;c.line=-1;sc.pose=function(){if(!c.raf)draw(0)};
  sc.root.__glow=sc.root.querySelector('.pm__glow');
  if(c.url)sc.setResult(c.url);
  measure();observe();
  c.q={bar:sc.root.querySelector('.pm__bar i'),dot:sc.root.querySelector('.pm__bar b')};
  if(!c.raf&&!c.tm)start();else{setRun(!!c.raf);draw(0);bar();text(true)}
 };
 var ro=null;
 function observe(){try{if(window.ResizeObserver&&c.S&&c.S.glass){ro=new ResizeObserver(function(){measure();if(!c.raf)draw(0)});ro.observe(c.S.glass)}}catch(e){ro=null}}
 function unobserve(){try{if(ro)ro.disconnect()}catch(e){}ro=null}
 function text(force){
  var now=performance.now();if(!force&&now-c.txtAt<250)return;c.txtAt=now;bar();
  var root=c.root,idx;
  if(c.mode==='build')idx=c.hold?3:(c.p<.16?0:c.p<.4?1:2);
  else if(c.mode==='ff')idx=3;
  else idx=c.ct>=.9?4:3;
  if(idx!==c.line){
   c.line=idx;
   var ls=root.querySelectorAll('.pm__lines span');for(var i=0;i<ls.length;i++)ls[i].classList.toggle('on',i===idx);
   var sr=root.querySelector('.sr-only');if(sr)sr.textContent=PM_LINES[idx];var r=root.querySelector('.pm__rm');if(r)r.textContent=PM_LINES[idx];
  }
  var nt=root.querySelector('.pm__note');
  if(nt){var s=c.noteOverride||(c.mode==='build'?holdNote(Date.now()-c.t0):'');if(nt.textContent!==s)nt.textContent=s}
  root.classList.toggle('is-hold',c.mode==='build'&&c.hold&&!c.off);
 }
 function bar(){
  var q=c.q;if(!q||!q.bar)return;
  var f=c.mode==='build'?Math.min(.93,c.p/.8*.93):(c.mode==='ff'||c.ct<.3)?.93:1;
  pmSet(q.bar,'scaleX('+f.toFixed(3)+')');pmSet(q.dot,'translate3d('+(-f*190).toFixed(1)+'px,0,0)');
 }
 function draw(dt){
  var S=c.S;if(!S)return;
  var x={hold:c.mode==='build'&&c.hold&&!c.off};
  if(c.mode==='climax'||c.mode==='done'){
   var ct=c.mode==='done'?9:c.ct,ready=!!(c.url&&S.res&&S.res.complete&&S.res.naturalWidth);
   // a quick glimpse of the real result through the veil, only if it is already here
   if(ready)x.glimpse=.55*tri(.10,.17,.30,ct)+.4*tri(.42,.48,.66,ct);
   x.flash=.3*smooth(.85,1.2,ct)*(1-smooth(1.2,1.9,ct));
   x.spark=smooth(.8,1.05,ct)*(1-smooth(1.05,1.8,ct));
   x.spin=smooth(.8,1.7,ct);
   x.sweep=smooth(.85,1.3,ct)*(1-smooth(1.7,2.3,ct));
   x.specPos=-.35+smooth(.85,2.2,ct)*1.7;
   x.dev=c.url?smooth(1.1,2.4,ct):1;
  }
  pmPose(S,c.p,c.t,x);
 }
 function frame(dt){
  if(!live())return false;
  c.t+=dt;
  if(c.mode==='build'){var el_=Date.now()-c.t0;c.p=buildProgress(el_,c.tb);c.hold=el_>=c.tb}
  else if(c.mode==='ff'){c.p=Math.min(PM_P0,c.p+dt*Math.max(.18,(PM_P0-c.p)/.45));if(c.p>=PM_P0-.0005){c.p=PM_P0;c.mode='climax';c.ct=0;measure()}}
  else if(c.mode==='climax'){
   c.ct+=dt;var q=smooth(.95,2.0,c.ct);c.p=PM_P0+(1-PM_P0)*q;
   if(c.ct>=PM_END){c.mode='done'}
  }
  draw(dt);text(false);
  if(c.mode==='done'){var r=c.resolve;c.resolve=null;stopLoop();setRun(false);if(r)setTimeout(r,140);return false}
  return true;
 }
 function setRun(on){if(c.root)c.root.classList.toggle('is-run',!!on)}
 function loop(now){
  c.raf=0;
  if(document.hidden||c.off)return;
  var dt=Math.min(.1,Math.max(0,(now-c.last)/1000));c.last=now;
  if(frame(dt))c.raf=requestAnimationFrame(loop);
 }
 function start(){
  if(rm()||c.S&&c.S.caps.mode==='still'){
   // no motion: the scene sits in a calm pose and only its words and bar move, every so often
   c.p=.45;c.t=2;setRun(false);
   c.tm=setInterval(function(){
    if(c.mode==='ff'||c.mode==='climax'){c.mode='done';c.p=1}
    if(!live()){stopLoop();return}
    if(c.mode==='done'){draw(0);bar();text(true);stopLoop();var r=c.resolve;c.resolve=null;if(r)setTimeout(r,140);return}
    if(c.mode==='build'){c.hold=Date.now()-c.t0>=c.tb}
    draw(0);bar();text(true);
   },900);
   draw(0);bar();text(true);return;
  }
  setRun(true);
  c.last=performance.now();
  if(!document.hidden&&!c.off)c.raf=requestAnimationFrame(loop);
 }
 function stopLoop(){if(c.raf)cancelAnimationFrame(c.raf);clearInterval(c.tm);c.raf=0;c.tm=0}
 function onVis(){
  if(c.mode==='stopped')return;
  if(document.hidden){if(c.raf){cancelAnimationFrame(c.raf);c.raf=0}return}
  if(!c.raf&&!c.tm&&!c.off&&live()&&c.mode!=='done'){c.last=performance.now();c.raf=requestAnimationFrame(loop)}
 }
 document.addEventListener('visibilitychange',onVis);
 function destroy(){stopLoop();unobserve();document.removeEventListener('visibilitychange',onVis);c.resolve=null}
 // A watchdog for the build clock: if the loop is not running (and was not told to rest) start it again.
 c.kick=function(){if(c.S&&!c.raf&&!c.tm&&!c.off&&!document.hidden&&live()&&c.mode!=='stopped'&&c.mode!=='done')start()};
 c.stop=function(){destroy();c.mode='stopped';setRun(false)};
 // The scene rests in a calm pose (offline, failure): the loop sleeps but nothing is torn down.
 c.rest=function(note){c.off=true;stopLoop();setRun(false);c.noteOverride=note||'';if(live()){draw(0);bar();text(true);c.root.classList.remove('is-hold')}};
 c.wake=function(){if(!c.off)return;c.off=false;c.noteOverride='';if(c.mode!=='stopped'&&live()&&!c.raf&&!c.tm)start()};
 // url: the finished photo (or null: only lift the veil).
 c.finish=function(url){
  return new Promise(function(done){
   var go=function(a){
    if(c.mode==='stopped'||!live()){done();return}
    c.url=url||'';if(url&&c.S)c.S.setResult(url);
    if(a&&c.mirror){(state.arOf=state.arOf||{})[url]=a;c.mirror.style.setProperty('--ar',a)}
    c.resolve=done;c.off=false;c.noteOverride='';c.mode='ff';measure();
    if(document.hidden){c.mode='done';c.p=1;c.resolve=null;setTimeout(done,0);return}
    if(rm()||c.S&&c.S.caps.mode==='still'){c.mode='done';c.p=1;if(!c.tm)start();return}
    if(!c.raf&&!c.tm)start();
   };
   if(!url){go();return}
   loadImg(url).then(function(im){go(clampAr(im.naturalWidth,im.naturalHeight))}).catch(function(){go()});
  });
 };
 return c;
}
var PMC=null;
function buildNote(){return holdNote(Date.now()-(state.genT0||Date.now()))}
function buildStage(){
 var sc=pmScene(state.original?media(state.original):'');
 if(!PMC||PMC.t0!==state.genT0||PMC.mode==='stopped'){if(PMC)PMC.stop();PMC=pmCtl({t0:state.genT0||Date.now(),tb:GEN_TOTAL_MS/1000})}
 PMC.mount(sc);
 return sc.root;
}
// A failed or timed-out job: the same mirror, veil resting, and one calm sentence. Nothing alarming.
function retryStage(msg){
 var sc=pmScene(state.original?media(state.original):'',{calm:true});
 var box=el('div',{class:'pm__calm'},[el('b',{text:'این بار کامل نشد'}),h('p',msg||'یک بار دیگر امتحان کنیم؟')]);
 sc.root.append(box);
 sc.pose=function(){pmPose(sc,.38,0,{enter:1})};sc.pose();
 return sc.root;
}
// One name per saved photo: boutique, date and time, and the result's own id.
function saveName(id){
 var d=new Date(),p={};try{new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).formatToParts(d).forEach(function(x){p[x.type]=x.value})}catch(e){}
 var stamp=(p.year||d.getFullYear())+(p.month||'')+(p.day||'')+'-'+String(p.hour||'').replace('24','00')+(p.minute||'')+(p.second||'');
 return ['mezon',SLUG,'lebas-aroos',stamp,String(id||'').replace(/[^a-z0-9]/gi,'').slice(0,8)].join('-')+'.jpg';
}
// The salon's logo, read once: a monochrome logo is re-tinted to warm gold (dark pixels become the mark, even
// on an opaque white background); a coloured logo keeps its colours.
var LOGOI={};
function logoInfo(id){
 if(!id)return Promise.resolve(null);
 if(LOGOI[id])return LOGOI[id];
 return LOGOI[id]=loadImg(media(id)).then(function(im){
  var w=im.naturalWidth||1,hh=im.naturalHeight||1,k=Math.min(1,480/Math.max(w,hh)),cw=Math.max(1,Math.round(w*k)),ch=Math.max(1,Math.round(hh*k));
  var c=document.createElement('canvas');c.width=cw;c.height=ch;var g=c.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0,cw,ch);
  var data=g.getImageData(0,0,cw,ch),d=data.data,n=0,sat=0,opaque=0,tot=cw*ch;
  for(var i=0;i<d.length;i+=4){if(d[i+3]>=250)opaque++;if(d[i+3]<40)continue;var mx=Math.max(d[i],d[i+1],d[i+2]),mn=Math.min(d[i],d[i+1],d[i+2]);n++;sat+=mx?(mx-mn)/mx:0}
  var info={im:im,ar:w/hh,mono:false,canvas:null};
  if(n>30&&sat/n<.16){
   info.mono=true;
   var lightBg=false;if(opaque/tot>.97){var corner=(d[0]+d[1]+d[2])/3;lightBg=corner>128;var dark=corner<=128}
   for(var j=0;j<d.length;j+=4){var lum=(d[j]*.3+d[j+1]*.59+d[j+2]*.11);var a=d[j+3];
    if(opaque/tot>.97){a=lightBg?255-lum:lum;a=Math.max(0,Math.min(255,(a-20)*1.25))}
    d[j]=0;d[j+1]=0;d[j+2]=0;d[j+3]=a}
   g.putImageData(data,0,0);g.globalCompositeOperation='source-in';
   var gr=g.createLinearGradient(0,0,cw,ch);gr.addColorStop(0,'#B8924A');gr.addColorStop(.5,'#E2CD94');gr.addColorStop(1,'#A47C35');g.fillStyle=gr;g.fillRect(0,0,cw,ch);
   info.canvas=c;
  }
  return info;
 }).catch(function(){return null});
}
// Under the finished photo, never over it: a gold hairline, the salon's small logo and its name.
function sealFoot(){
 var s=state.pub.salon,p=s.profile||{};
 var row=el('div',{class:'sealfoot__row'}),name=el('span',{class:'sealfoot__name',text:s.name,title:s.name});
 var foot=el('footer',{class:'sealfoot','aria-label':'مزون '+s.name},[el('div',{class:'sealfoot__rule','aria-hidden':'true'}),row]);
 row.append(name);
 if(p.city)foot.append(el('div',{class:'sealfoot__city',text:p.city}));
 foot.append(el('div',{class:'sealfoot__by',text:'با مزون آینه'}));
 if(p.logo)logoInfo(p.logo).then(function(i){
  if(!i||!foot.isConnected&&false)return;
  var im=el('img',{class:'sealfoot__logo',alt:'',decoding:'async',width:Math.round(28*Math.min(4,i.ar)),height:28,src:i.mono&&i.canvas?i.canvas.toDataURL('image/png'):media(p.logo)});
  row.prepend(im);
 });
 return foot;
}

// The saved or shared image is a card: ivory paper, the photo in its gilded mirror frame, and a footer strip with
// the salon's logo, name and city. Nothing is drawn over the photo. Made in the browser; the original stays clean.
function loadImg(src){return new Promise(function(res,rej){var i=new Image();i.decoding='async';i.onload=function(){res(i)};i.onerror=rej;i.src=src})}
var MZ_D=__MZD__;
function cardFont(px,w){return (w||800)+' '+px+'px Estedad, Vazirmatn, Tahoma, sans-serif'}
// Fits a line into maxW: shrinks to 62%, then breaks at the space nearest the middle, then cuts with an ellipsis.
function fitLines(g,text,size,maxW,w){
 g.font=cardFont(size,w);
 if(g.measureText(text).width<=maxW)return {lines:[text],size:size};
 var s=size;while(s>size*.62&&g.measureText(text).width>maxW){s-=2;g.font=cardFont(s,w)}
 if(g.measureText(text).width<=maxW)return {lines:[text],size:s};
 var words=text.split(/\s+/);
 if(words.length>1){
  var best=null;for(var i=1;i<words.length;i++){var a=words.slice(0,i).join(' '),b=words.slice(i).join(' '),m=Math.max(g.measureText(a).width,g.measureText(b).width);if(!best||m<best.m)best={a:a,b:b,m:m}}
  s=size*.8;g.font=cardFont(s,w);
  while(s>size*.5&&best.m>maxW){s-=2;g.font=cardFont(s,w);best.m=Math.max(g.measureText(best.a).width,g.measureText(best.b).width)}
  if(best.m<=maxW)return {lines:[best.a,best.b],size:s};
 }
 g.font=cardFont(size*.62,w);var t=text;while(t.length>1&&g.measureText(t+'…').width>maxW)t=t.slice(0,-1);
 return {lines:[t+'…'],size:size*.62};
}
function brandedBlob(id){
 var s=state.pub.salon,p=s.profile||{},dpr=Math.min(3,Math.max(1,window.devicePixelRatio||1));
 var W=dpr>=2.5?2160:1440,u=W/1440;
 var fonts=document.fonts&&document.fonts.load?Promise.all([document.fonts.load('800 56px Estedad','مزون آینه'),document.fonts.load('600 40px Vazirmatn','مزون آینه')]).catch(function(){}):Promise.resolve();
 return Promise.all([loadImg(media(id)),logoInfo(p.logo),fonts]).then(function(r){
  var img=r[0],logo=r[1],ar=clampAr(img.naturalWidth,img.naturalHeight);
  var M=Math.round(96*u),Fw=W-2*M,k=Fw/380,pad=Math.round(11*k),Gw=Fw-2*pad,Gh=Math.round(Gw/ar),Fh=Gh+2*pad,top=Math.round(110*u);
  var scratch=document.createElement('canvas').getContext('2d');
  // footer layout
  var lh=Math.round(84*u),gap=Math.round(26*u),maxRow=W-2*M-Math.round(40*u);
  var logoW=0;if(logo){logoW=Math.min(Math.round(lh*Math.min(4,logo.ar)),Math.round(380*u))}
  var nameBox=fitLines(scratch,s.name||'',Math.round(60*u),maxRow-(logoW?logoW+gap:0),800);
  var nSize=nameBox.size,nLine=Math.round(nSize*1.45),nameH=nLine*nameBox.lines.length,rowH=Math.max(logo?lh:0,nameH);
  var cityTxt=p.city||'',cityH=cityTxt?Math.round(58*u):0;
  var y0=top+Fh+Math.round(96*u),ruleY=y0,rowY=ruleY+Math.round(52*u),cityY=rowY+rowH+Math.round(18*u),creditY=cityY+cityH+Math.round(74*u),H=creditY+Math.round(86*u);
  var c=document.createElement('canvas');c.width=W;c.height=H;var g=c.getContext('2d');
  g.textBaseline='middle';
  // paper
  var bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#FBF8F2');bg.addColorStop(1,'#F1EADB');g.fillStyle=bg;g.fillRect(0,0,W,H);
  g.strokeStyle='rgba(201,169,106,.55)';g.lineWidth=Math.max(2,2*u);g.strokeRect(34*u,34*u,W-68*u,H-68*u);
  // frame
  var P=new Path2D(MZ_D);
  function path(x,y,w,hh){var q=new Path2D();q.addPath(P,new DOMMatrix([w/100,0,0,hh/100,x,y]));return q}
  var fx=M,fy=top,outer=path(fx,fy,Fw,Fh);
  g.save();g.shadowColor='rgba(35,23,15,.28)';g.shadowBlur=70*u;g.shadowOffsetY=34*u;g.fillStyle='#B8924A';g.fill(outer);g.restore();
  var bev=g.createLinearGradient(fx,fy,fx+Fw,fy+Fh);[[0,'#F4E8C6'],[.1,'#C6A462'],[.2,'#FFF8DE'],[.3,'#A68150'],[.42,'#F2E3B6'],[.55,'#8D6A38'],[.66,'#F8EECB'],[.78,'#B18C55'],[.9,'#F0E0B3'],[1,'#98763F']].forEach(function(x){bev.addColorStop(x[0],x[1])});
  g.fillStyle=bev;g.fill(outer);
  var hl=g.createLinearGradient(fx,fy,fx+Fw,fy+Fh);hl.addColorStop(0,'rgba(255,255,255,.95)');hl.addColorStop(.35,'rgba(255,244,210,.55)');hl.addColorStop(.7,'rgba(122,90,34,.25)');hl.addColorStop(1,'rgba(94,67,24,.5)');
  g.save();g.clip(outer);g.strokeStyle=hl;g.lineWidth=9*k;g.stroke(outer);g.restore();
  g.strokeStyle='rgba(134,105,58,.8)';g.lineWidth=2*k;g.stroke(outer);
  // inner facet
  var hair=path(fx+6*k,fy+6*k,Fw-12*k,Fh-12*k),hg=g.createLinearGradient(fx+Fw,fy+Fh,fx,fy);[[0,'#FFFAE8'],[.3,'#DCC38C'],[.62,'#A9885A'],[1,'#765828']].forEach(function(x){hg.addColorStop(x[0],x[1])});
  g.save();g.strokeStyle=hg;g.lineWidth=10*k;g.stroke(hair);g.strokeStyle='rgba(255,244,207,.7)';g.lineWidth=1.4*k;g.stroke(hair);g.restore();
  // the photo, in the glass
  var glass=path(fx+pad,fy+pad,Gw,Gh);
  g.save();g.clip(glass);g.fillStyle='#EEE8DB';g.fillRect(fx+pad,fy+pad,Gw,Gh);
  var iw=img.naturalWidth,ih=img.naturalHeight,sc=Math.max(Gw/iw,Gh/ih),dw=iw*sc,dh=ih*sc;
  g.imageSmoothingQuality='high';g.drawImage(img,fx+pad+(Gw-dw)/2,fy+pad+Math.min(0,(Gh-dh)*.18),dw,dh);
  g.strokeStyle='rgba(46,32,8,.16)';g.lineWidth=9*k;g.stroke(glass);g.restore();
  g.strokeStyle='rgba(245,231,191,.95)';g.lineWidth=2*k;g.stroke(glass);
  // footer: hairline, logo + name, city, platform credit
  var rw=W*.56,rg=g.createLinearGradient((W-rw)/2,0,(W+rw)/2,0);rg.addColorStop(0,'rgba(201,169,106,0)');rg.addColorStop(.2,'#C9A96A');rg.addColorStop(.5,'#EAD9A8');rg.addColorStop(.8,'#C9A96A');rg.addColorStop(1,'rgba(201,169,106,0)');
  g.fillStyle=rg;g.fillRect((W-rw)/2,ruleY,rw,Math.max(2,3*u));
  g.direction='rtl';g.textAlign='center';
  var widest=0;nameBox.lines.forEach(function(t){g.font=cardFont(nSize,800);widest=Math.max(widest,g.measureText(t).width)});
  var total=widest+(logoW?logoW+gap:0),sx=(W-total)/2,rowMid=rowY+rowH/2;
  g.fillStyle='#23170F';g.font=cardFont(nSize,800);
  nameBox.lines.forEach(function(t,i){g.fillText(t,sx+widest/2,rowY+rowH/2-(nameBox.lines.length-1)*nLine/2+i*nLine)});
  if(logo){var lx=sx+widest+gap,lhh=Math.min(lh,Math.round(logoW/Math.max(.1,logo.ar)));g.imageSmoothingQuality='high';g.drawImage(logo.mono&&logo.canvas?logo.canvas:logo.im,lx,rowMid-lhh/2,logoW,lhh)}
  if(cityTxt){g.fillStyle='#4B3D33';g.font=cardFont(Math.round(38*u),500);g.fillText(cityTxt,W/2,cityY+cityH/2)}
  g.fillStyle='#A07A2E';g.font=cardFont(Math.round(30*u),600);g.fillText('با مزون آینه',W/2,creditY+Math.round(20*u));
  return new Promise(function(res){c.toBlob(function(b){res(b)},'image/jpeg',.93)});
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
function downloadLink(cls,label,idArg){
 var id=idArg||state.result,rec=branded[id];
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
 var box=el('div',{class:'panel flow'});
 box.append(flowHead(state.result?'خودت با لباس جدید':state.busy?'دارم می‌سازم…':'نتیجه و ارسال','این تصویر یک شبیه‌سازی پیشنهادی است، نه تضمین اجرا. تصمیم نهایی با '+artist()+' است.'));
 var meta='چهره و سایز بدنت همان است';
 box.append(el('div',{class:'summary'},[
  state.original?el('img',{src:media(state.original),alt:''}):null,
  el('div',{class:'grow'},[el('b',{text:(lookName()||'هنوز چیزی انتخاب نشده')}),el('div',{class:'summary__meta',text:meta})]),
  el('button',{class:'btn btn--ghost btn--sm',type:'button',onclick:function(){go(2)},text:'تغییر'})
 ]));
 if(state.pub.sandbox)box.append(notice('info','این صفحه هنوز در مرحلهٔ راه‌اندازی است؛ اگر تصویر ساخته نشد، درخواستت را برای مزون بفرست.'));
 var recheck=!!(state.gen&&!state.result&&!state.busy&&recheckKind(state.errKind));
 var calmRetry=!!(state.error&&state.original&&!state.result&&!state.busy&&(canGenerate()||recheck)&&!state.noImage);
 if(state.error&&!calmRetry)box.append(notice('danger',state.error));
 if(state.noImage&&!state.result&&!state.busy)box.append(noImageCard(state.noImage==='x'?'':state.noImage));
 if(state.busy&&!state.result){box.append(buildStage());startBuildClock()}
 if(state.result){
  box.append(compareBlock());
  box.append(sealFoot());
  box.append(el('div',{class:'result-actions'},[
   el('button',{class:'btn btn--ghost btn--sm',type:'button',onclick:function(){openViewer([{src:media(state.result),name:'بعد'},{src:media(state.original),name:'قبل'}],0,{title:'نتیجهٔ تو'})},html:ICO.search?ICO.search+'<span>بزرگ‌نمایی</span>':'<span>＋ بزرگ‌نمایی</span>'}),
   el('button',{class:'btn btn--soft btn--sm',type:'button',onclick:openViews,html:ICO.views+'<span>زوایای دیگر</span>'}),
   el('button',{class:'btn btn--primary btn--sm',type:'button',onclick:function(){openQR()},html:ICO.phone+'<span>ارسال برای خودم</span>'}),
   el('button',{class:'btn btn--ghost btn--sm',type:'button',onclick:function(){state.result=null;state.gen=null;state.idem=null;state.error='';state.busy=false;go(2)},text:'یک لباس دیگر'}),
   deleteBtn()
  ]));
  box.append(ratingBlock());
  box.append(meBlock());
 }else if(!state.busy){
  if(!canGenerate()&&!recheck){
   box.append(notice('info',!state.pub.generation?'این مزون پیش‌نمایش تصویری را فعال نکرده. عکس و انتخابت را برای '+artist()+' بفرست تا بررسی کند.':(!hasChoice()?missingReason()+'.':'ساخت تصویر از این انتخاب هنوز فعال نیست. عکس و انتخابت را مستقیم برای '+artist()+' بفرست.')));
   box.append(el('div',{class:'flow__nav'},[!hasChoice()&&state.original?el('button',{class:'btn btn--ghost',type:'button',onclick:function(){go(2)},text:'انتخاب'}):null,sendButton()]));
   box.append(sendNote());
  }else if(state.noImage){
   box.append(el('div',{class:'flow__nav'},[el('button',{class:'btn btn--ghost',type:'button',onclick:function(){go(2)},text:'تغییر انتخاب'})]));
  }else{
   if(calmRetry)box.append(retryStage(state.error));
   else box.append(el('div',{class:'stage mirror'},[el('div',{class:'mirror__glass'},[el('span',{class:'stage__empty',html:ILLO.results+'<span style="display:block">نتیجه همین‌جا، در قاب آینه، ظاهر می‌شود</span>'})])]));
   box.append(el('div',{class:'flow__nav'},[
    el('button',{class:'btn btn--primary','data-act':state.error?'retry':'generate',type:'button',onclick:retry,html:ICO.spark+'<span>'+(state.error?retryLabel(state.errKind):'خودت را در لباس عروس ببین')+'</span>'}),
    el('button',{class:'btn btn--ghost',type:'button',onclick:openRequest,html:ICO.send+'<span>بدون شبیه‌سازی بفرست</span>'})
   ]));
   box.append(h('p','با زدن «خودت را در لباس عروس ببین» عکست برای ساخت شبیه‌سازی فرستاده می‌شود و فقط برای همین مزون می‌ماند.','fine-print'));
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
  if(!state.original&&!state.busy){dock.hidden=true;dock.replaceChildren();return}
  hint=state.original?'عکس آماده است':'برای شروع، عکس تمام‌قدت را اضافه کن';
  if(state.busy&&!state.original){hint='در حال بارگذاری عکس…';primary=el('button',{class:'btn btn--primary',type:'button',disabled:true,text:'در حال بارگذاری…'})}
  else primary=el('button',{class:'btn btn--primary',type:'button',onclick:function(){(state.original?go(2):pickNow())},html:(state.original?ICO.check:ICO.spark)+'<span>'+(state.original?'ادامه':'خودت را در لباس عروس ببین')+'</span>'});
 }else if(state.step===2){
  var ready=hasChoice(),can=canGenerate();
  var out=quotaLeft()===0;
  hint=out?'سهم ساخت این بخش تمام شد':ready?(can?'آماده؛ بزن «خودت را در لباس عروس ببین»':'آماده'):missingReason();
  primary=el('button',{class:'btn btn--primary',type:'button',disabled:!ready,onclick:build,html:can?ICO.spark+'<span>خودت را در لباس عروس ببین</span>':out?ICO.send+'<span>فرستادن</span>':!ready?'<span>اول لباس را انتخاب کن</span>':ICO.arrow+'<span>ادامه</span>'});
 }else{
  if(state.busy){hint='در حال ساخت…';primary=el('button',{class:'btn btn--primary',type:'button',disabled:true,text:'در حال ساخت…'})}
  else if(state.result){hint='عکس را روی گوشی‌ات بگیر';primary=el('button',{class:'btn btn--primary',type:'button',onclick:function(){openQR()},html:ICO.phone+'<span>ارسال برای خودم</span>'})}
  else if(state.gen&&!state.result&&recheckKind(state.errKind)){hint='نتیجهٔ همان درخواست را دوباره بررسی کن';primary=el('button',{class:'btn btn--primary',type:'button',onclick:retry,html:ICO.spark+'<span>'+retryLabel(state.errKind)+'</span>'})}
  else if(state.result||!canGenerate()||state.noImage){hint='فرستادن در تلگرام برای مزون';primary=el('button',{class:'btn btn--primary',type:'button',onclick:openRequest,html:ICO.send+'<span>فرستادن برای '+artist()+'</span>'})}
  else{hint='آمادهٔ ساخت';primary=el('button',{class:'btn btn--primary',type:'button',onclick:retry,html:ICO.spark+'<span>'+(state.error?retryLabel(state.errKind):'خودت را در لباس عروس ببین')+'</span>'})}
 }
 inner.append(el('div',{class:'dock__hint',text:hint}),primary);
 dock.replaceChildren(inner);dock.hidden=false;
}

/* ---------- upload ---------- */
function handleFile(file,kind,checked){
 if(!file){toast('عکسی انتخاب نشد');return}
 if(['image/jpeg','image/png','image/webp'].indexOf(file.type)<0){toast('فقط JPG، PNG یا WebP','error');return}
 if(kind==='original'&&!checked){precheck(file,function(){handleFile(file,kind,true)});return}
 state.busy=true;renderDock();
 if(kind==='original'){try{if(state.preview)URL.revokeObjectURL(state.preview);state.preview=URL.createObjectURL(file)}catch(e){state.preview=null}state.original=null;state.photoWarn='';state.justUploaded=false;clearTimeout(state.advT);if(state.step!==1){state.step=1;renderSteps()}renderFlow();focusFlow()}
 Promise.all([compress(file),ensureSession()]).then(function(r){
  return api('upload?kind='+kind,r[0],true);
 }).then(function(d){
  if(kind==='original'){track('photo','dress');state.original=d.id;state.ratio=compress.ratio||'';state.result=null;state.error='';state.idem=null;state.justUploaded=true;state.photoWarn=(d.warnings||[]).map(function(w){return w.message}).filter(Boolean).join(' ');
   if(!state.photoWarn)state.advT=setTimeout(function(){if(state.step===1&&state.justUploaded){state.justArrived=true;go(2)}},1600)}
  else{track('look','u');state.reference=d.id;state.refTitle='';state.style=null;state.result=null;state.error='';setTimeout(scrollToBuild,60)}
  renderFlow();renderSteps();renderDock();
 }).catch(function(e){if(kind==='original'&&!state.original){state.preview=null;renderFlow()}toast(fa_msg(e.message,'آپلود عکس انجام نشد؛ دوباره امتحان کن.'),'error')}).then(function(){state.busy=false;renderDock()});
}

/* ---------- photo guidelines: every full-length photo (camera, gallery, or sent from a phone) is checked before it is used ---------- */
function precheck(file,use){
 var url=URL.createObjectURL(file),img=new Image();
 img.onload=function(){var r=checkPhoto(img);if(!r.hard.length&&!r.soft.length){URL.revokeObjectURL(url);use();return}photoReview(url,r,function(){URL.revokeObjectURL(url);use()})};
 img.onerror=function(){URL.revokeObjectURL(url);use()};
 img.src=url;
}
function photoReview(src,r,use){
 var panel=el('div',{class:'sheet__panel'});
 panel.append(el('div',{class:'sheet__head'},[h('h2',r.hard.length?'این عکس مناسب نیست':'یک نکته دربارهٔ عکس'),el('button',{class:'sheet__x',type:'button','aria-label':'بستن',text:'×',onclick:closeSheet})]));
 var list=el('div',{class:'rev__list'},r.hard.map(function(x){return (function(){var d=el('div',{class:'rev__bad ic-inline',html:ICO.ban});d.append(h('span',x));return d})()}).concat(r.soft.map(function(x){return (function(){var d=el('div',{class:'rev__warn ic-inline',html:ICO.warn});d.append(h('span',x));return d})()})));
 var btns=[el('button',{class:'btn btn--primary',type:'button',text:'عکس دیگر می‌گیرم',onclick:function(){closeSheet();pickNow()}})];
 if(!r.hard.length)btns.push(el('button',{class:'btn btn--ghost',type:'button',text:'با همین عکس ادامه بده',onclick:function(){closeSheet();use()}}));
 var tips=r.hard.length?el('ul',{class:'rev__tips'},['تمام‌قد: از سر تا کفش، ایستاده و روبه‌رو','نور روشن و یکنواخت؛ پشت به پنجره یا چراغ نباش','گوشی ثابت و عمودی؛ از نسخهٔ اصلی عکس استفاده کن، نه فشرده‌شده','لباس ساده و چسبان تا اندام معلوم باشد'].map(function(t){return h('li',t)})):null;
 panel.append(el('div',{class:'rev'},[el('img',{src:src,alt:'',class:'rev__img'}),list,tips,el('div',{class:'rev__btns'},btns)]));
 openSheet(panel);
}
// A photo that arrived from the bride's phone gets the same checks before it replaces the kiosk photo.
function acceptPhoto(id){
 var img=new Image();
 function use(){track('photo','phone');state.original=id;state.preview=null;state.ratio=nearestRatio(img.naturalWidth/img.naturalHeight);state.result=null;state.error='';state.idem=null;state.justUploaded=true;
  if(state.step!==1){state.step=1;renderSteps()}clearTimeout(state.advT);state.advT=setTimeout(function(){if(state.step===1&&state.justUploaded){state.justArrived=true;go(2)}},1600);renderFlow();renderSteps();renderDock()}
 img.onload=function(){var r=checkPhoto(img);if(r.hard.length||r.soft.length)photoReview(img.src,r,use);else use()};
 img.onerror=use;img.src=media(id);
}
// The kiosk shows a QR; the bride scans it with her own phone, takes the photo there, and it appears here.
function openPhonePair(){
 var seen='',timer=0,stopped=false;
 var panel=el('div',{class:'sheet__panel'});
 function stop(){stopped=true;clearTimeout(timer)}
 panel.append(el('div',{class:'sheet__head'},[h('h2','ارسال عکس از گوشی خودت'),el('button',{class:'sheet__x',type:'button','aria-label':'بستن',text:'×',onclick:function(){stop();closeSheet()}})]));
 var box=el('div',{class:'qr'},[h('p','در حال ساخت کد…','qr__note')]);
 panel.append(box,el('ol',{class:'pairsteps'},[el('li',{text:'دوربین گوشی را روی کد بگیر'}),el('li',{text:'عکس تمام‌قدت را بگیر یا از گالری بفرست'}),el('li',{text:'همین‌جا خودکار ادامه پیدا می‌کند'})]));
 openSheet(panel);
 function poll(){
  if(stopped)return;
  api('pair/check?seen='+encodeURIComponent(seen)).then(function(d){
   if(stopped)return;
   if(d.state==='received'){stop();closeSheet();acceptPhoto(d.media_id);return}
   if(d.state==='expired'){box.replaceChildren(notice('warn','کد منقضی شد.'),el('button',{class:'btn btn--primary',type:'button',text:'کد تازه',onclick:function(){stop();closeSheet();openPhonePair()}}));return}
   timer=setTimeout(poll,2000);
  }).catch(function(){timer=setTimeout(poll,4000)});
 }
 ensureSession().then(function(){return api('pair',{v:VISITOR})}).then(function(d){
  box.replaceChildren(el('div',{class:'qr__code',dir:'ltr',html:qrSvg(d.url)}),h('p','کد ۱۵ دقیقه معتبر است و فقط عکس را به همین دستگاه می‌رساند.','qr__note'));
  poll();
 }).catch(function(e){stop();box.replaceChildren(notice('danger',e.message||'ساخت کد ممکن نشد'))});
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
 state.busy=true;state.error='';state.errKind='';state.noImage=null;state.result=null;state.genT0=Date.now();renderFlow();renderDock();
 ensureSession().then(function(){
  state.idem=state.idem||uuid();
  // The page's own note under «خودت را در لباس عروس ببین» says the photo is sent for the simulation; no extra checkbox.
  return api('generate',{v:VISITOR,image_consent:true,sizes:sizesPayload(),idem:state.idem,ratio:state.ratio||undefined,original_id:state.original,reference_id:state.reference||undefined,style:state.reference?undefined:(state.style===null?undefined:state.style)});
 }).then(function(job){
  track('generate',state.reference?(state.refTitle?'salon':'upload'):'catalog');
  spentQuota();
  state.gen=job.id;state.genState=job.state;state.step=3;
  try{sessionStorage.setItem('ayneh-job-'+SLUG,job.id)}catch(e){}
  renderFlow();renderDock();
  return poll(job.id);
 }).catch(function(e){
  state.busy=false;
  if(e.status===402){state.noImage=e.message||'x';state.error='';renderFlow();renderDock();return}
  if(needsVerify(e.message)){state.verified=false;state.error='';renderFlow();renderDock();openOtp(generate);return}
  if(/سهم امتحان/.test(e.message)&&state.quota&&state.quota.left)state.quota.left.dress=0;
  state.error=friendly(e.message);state.errKind='request';
  renderFlow();renderDock();
 });
}
// «Try again»: a failed job makes a new one; a job whose answer we could not get is only asked about again.
function recheckKind(k){return k==='unknown'||k==='timeout'||k==='lost'}
function retry(){if(state.gen&&!state.result&&recheckKind(state.errKind))recheck();else generate()}
function recheck(){
 if(state.busy||!state.gen)return;
 state.busy=true;state.error='';state.errKind='';state.genT0=Date.now()-GEN_TOTAL_MS+400;
 renderFlow();renderDock();poll(state.gen,true);
}
function friendly(msg){
 if(/سقف استفاده/.test(msg))return 'سقف استفادهٔ امروز پر شده است؛ فردا دوباره امتحان کن.';
 if(/فعال نشده/.test(msg))return 'تولید شبیه‌سازی برای این مزون فعال نیست.';
 if(/وضعیت نامشخص/.test(msg))return 'ارسال به سرویس تصویر نامشخص ماند. برای جلوگیری از هزینهٔ دوباره، خودکار تکرار نمی‌شود؛ کمی بعد دوباره سر بزن.';
 if(/درخواست را نپذیرفت/.test(msg))return 'سرویس تصویر درخواست را نپذیرفت. کمی بعد دوباره تلاش کن.';
 return msg;
}
function pickNow(){if(DESK){kioskCamera();return}var pick=$('#pick');if(pick)pick.click();else toast('اول عکس خودت را اضافه کن')}
function updateProgress(){if(PMC&&PMC.root&&PMC.root.isConnected&&PMC.mode==='build')PMC.kick()}
// The state machine (genReduce) decides what the scene shows; this function only feeds it what happened.
var GM=genReduce(null,{type:'leave'}),POLLTOK=0;
function gm(ev){var n=genReduce(GM,ev);if(n!==GM){GM=n}return GM}
function poll(id,resumed){
 var tok=++POLLTOK,attempts=0,timer=0;
 gm({type:'leave'});gm({type:'start'});
 function alive(){return tok===POLLTOK}
 function off(){window.removeEventListener('online',onOn);window.removeEventListener('offline',onOff);document.removeEventListener('visibilitychange',onVis);clearTimeout(timer)}
 function end(){if(alive())POLLTOK++;off()}
 function show(){
  // offline: the scene rests and says why; back online: it wakes and carries on
  if(!PMC)return;
  if(GM.phase==='offline')PMC.rest(phaseCopy('offline'));else PMC.wake();
 }
 function onOff(){if(!alive())return;gm({type:'neterr',online:false});show()}
 function onOn(){if(!alive())return;gm({type:'online'});show();clearTimeout(timer);timer=setTimeout(tick,150)}
 function onVis(){if(!alive()||document.hidden)return;clearTimeout(timer);timer=setTimeout(tick,60)}
 window.addEventListener('online',onOn);window.addEventListener('offline',onOff);document.addEventListener('visibilitychange',onVis);
 if(navigator.onLine===false){gm({type:'neterr',online:false});show()}
 function stopWith(kind){
  end();if(PMC)PMC.stop();
  state.busy=false;state.errKind=kind;state.error=phaseCopy(kind);
  if(kind==='failed'){state.idem=null;state.gen=null;try{sessionStorage.removeItem('ayneh-job-'+SLUG)}catch(e){}}
  renderFlow();renderDock();
 }
 function again(ms){clearTimeout(timer);timer=setTimeout(tick,ms)}
 function tick(){
  if(!alive())return;
  attempts++;updateProgress();
  gm({type:'tick',elapsed:Date.now()-(state.genT0||Date.now())});
  if(GM.phase==='timeout'){stopWith('timeout');return}
  if(navigator.onLine===false){gm({type:'neterr',online:false});show();again(2500);return}
  return api('generation/'+id).then(function(d){
   if(!alive())return;
   state.genState=d.state;
   gm({type:'poll',state:d.state});show();
   if(d.state==='success'){
    end();
    track('result','',true);
    if(window.__trialLeft)window.__trialLeft();
    state.idem=null;state.session=false;loadSession().catch(function(){});
    try{sessionStorage.removeItem('ayneh-job-'+SLUG)}catch(e){}
    var fin=function(){
     gm({type:'finished'});
     state.result=d.result_id;state.busy=false;state.error='';state.errKind='';
     state.rating=Number(localStorage.getItem('ayneh-rating-'+d.result_id)||0);
     renderFlow();
     // the dock and the toast are a separate task: the result screen is built in pieces so no single task runs long
     setTimeout(function(){renderDock();toast('شبیه‌سازی آماده شد')},0);
    };
    // The climax plays only if the waiting scene is on screen; otherwise show the result at once.
    if(PMC&&PMC.root&&PMC.root.isConnected&&state.step===3)PMC.finish(media(d.result_id)).then(fin);else fin();
    return;
   }
   if(d.state==='fail'||d.state==='unknown'){
    track('gen_fail',d.state);
    stopWith(d.state==='fail'?'failed':'unknown');return;
   }
   again(Math.min(4000,1400+attempts*160));
  }).catch(function(){
   if(!alive())return;
   gm({type:'neterr',online:navigator.onLine!==false});show();
   if(GM.phase==='lost'){stopWith('lost');return}
   again(GM.phase==='offline'?2500:2200);
  });
 }
 return tick();
}
/* ---------- three-angle view: front 3/4, side and back, played like a turntable ---------- */
// Drag (with momentum), tap a thumbnail, use the arrow keys, or let it turn on its own.
// While the angles are being made, the result itself sways in 3D so the wait feels alive.
function openViews(){
 track('view360');
 if(!state.gen)return;
 var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 // The three angles come from one generated row: front 3/4, side profile and back of the dress.
 var ANG=['روبه‌رو','نیم‌رخ راست','پشت لباس','نیم‌رخ چپ'],N=4;
 var panel=el('div',{class:'sheet__panel spin-panel'});
 panel.append(el('div',{class:'sheet__head'},[h('h2','از همهٔ زاویه‌ها'),el('button',{class:'sheet__x',type:'button','aria-label':'بستن',text:'×',onclick:closeSheet})]));
 var a=el('div',{class:'spin__layer'}),b=el('div',{class:'spin__layer'});
 var stage=el('div',{class:'spin',tabindex:'0',role:'img','aria-label':'زوایای لباس؛ برای چرخاندن بکش، برای زوم دو انگشت یا دوبار لمس'},[a,b]);
 var tip=el('p',{class:'spin__tip',text:'دارم زاویه‌های لباس را می‌سازم… معمولاً ۲ تا ۳ دقیقه طول می‌کشد.'}),bar=el('span',{class:'spin__bar'});
 var vsc=pmScene(media(state.result),{inner:true}),vpm=pmCtl({t0:Date.now(),tb:100});
 var loading=el('div',{class:'spin__loading'},[vsc.root,tip,el('span',{class:'spin__track'},[bar])]);
 stage.append(loading);vpm.mount(vsc);
 var angle=el('span',{class:'spin__angle',text:''});
 var dial=el('div',{class:'spin__dial','aria-hidden':'true'},[el('span',{class:'spin__dot'})]);
 var thumbs=el('div',{class:'spin__thumbs',role:'group','aria-label':'زاویه‌ها'});
 var play=el('button',{class:'btn btn--ghost btn--sm spin__play',type:'button',text:'⏸ توقف'});
 var controls=el('div',{class:'spin__controls',hidden:true},[el('div',{class:'spin__row'},[dial,angle,play]),thumbs]);
 var zbtn=el('button',{class:'zoomx',type:'button','aria-label':'باز کردن تمام‌صفحه برای بزرگ‌نمایی',html:EXPAND_ICO,hidden:true});
 zbtn.addEventListener('click',function(){auto(false);openViewer(ANG.map(function(nm,i){return {src:src,name:nm,crop:{i:i,n:N}}}),frame,{title:'از همهٔ زاویه‌ها'})});
 panel.append(el('div',{class:'zoomable zoomable--views'},[el('div',{class:'mirror mirror-shd spin-wrap','aria-hidden':'true'},[el('div',{class:'mirror__glass'})]),el('div',{class:'mirror spin-wrap nofx',style:'position:relative;z-index:1'},[stage]),zbtn]),controls,h('p','برای چرخاندن بکش؛ برای زوم دو انگشتی یا دوبار لمس. نیم‌رخ و پشت لباس تخمینی‌اند و اسکن سه‌بعدی نیست؛ طرح دقیق لباس را با مزون هماهنگ کن.','tiny muted spin__note'));
 var shareRow=el('div',{class:'result-actions'},[
  el('button',{class:'btn btn--primary btn--sm',type:'button',onclick:function(){if(!state.views||!state.views.gens){toast('کمی صبر کن تا زاویه‌ها آماده شوند');return}openQR('','همهٔ زاویه‌ها',state.views.gens.slice(0,3))},html:ICO.phone+'<span>ارسال همهٔ زاویه‌ها برای خودم</span>'}),
  el('button',{class:'btn btn--ghost btn--sm',type:'button',onclick:function(){if(!state.views||!state.views.ids){toast('کمی صبر کن تا زاویه‌ها آماده شوند');return}var u=[state.result].concat(state.views.ids);u.forEach(function(id,i){var l=el('a',{href:media(id),download:'lebas-aroos-'+(i+1)+'.jpg'});document.body.append(l);setTimeout(function(){l.click();l.remove()},i*350)})},html:ICO.gallery+'<span>ذخیرهٔ همه</span>'})]);
 panel.append(shareRow);
 openSheet(panel);
 var shEl=$('#sheet');function gone(){return !panel.isConnected||!shEl.open}
 shEl.addEventListener('close',function(){cleanup()},{once:true});
 var frame=0,front=a,timer=null,spinTimer=null,tipTimer=null,progTimer=null,src='',dead=false;
 function paint(layer,n){layer.style.backgroundImage='url('+src+')';layer.style.backgroundSize=(N*100)+'% 100%';layer.style.backgroundPosition=(n*100/(N-1))+'% 0'}
 function show(n,instant){
  frame=(n%N+N)%N;var back=front===a?b:a;paint(back,frame);
  if(instant||reduce){paint(front,frame)}else{back.classList.add('is-on');front.classList.remove('is-on');front=back}
  angle.textContent=ANG[frame];dial.style.setProperty('--r',(frame*(360/N))+'deg');
  Array.prototype.forEach.call(thumbs.children,function(t,i){t.classList.toggle('is-on',i===frame);t.setAttribute('aria-pressed',i===frame?'true':'false')});
 }
 function auto(on){clearInterval(spinTimer);spinTimer=null;play.textContent=on?'⏸ توقف':'▶ چرخش';if(on&&!reduce)spinTimer=setInterval(function(){if(gone()){cleanup();return}show(frame+1)},1100)}
 // Everything this panel started is ended here: timers, the scene's loop and listeners, and the object URL of the composed angles.
 function cleanup(failed){clearInterval(spinTimer);clearInterval(tipTimer);clearInterval(progTimer);cancelAnimationFrame(timer);dead=true;if(failed&&!stage.classList.contains('is-ready')){vpm.rest()}else vpm.stop();if(gone()&&src){try{URL.revokeObjectURL(src)}catch(e){}src=''}}
 play.addEventListener('click',function(){auto(!spinTimer)});
 var drag=null,Z=1,PX=0,PY=0,pts={},pinch=null;
 function applyZ(){var r=stage.getBoundingClientRect(),mx=r.width*(Z-1)/2,my=r.height*(Z-1)/2;PX=Math.max(-mx,Math.min(mx,PX));PY=Math.max(-my,Math.min(my,PY));var t=Z>1?'translate('+PX+'px,'+PY+'px) scale('+Z+')':'';a.style.transform=t;b.style.transform=t;stage.style.touchAction=Z>1?'none':'pan-y';stage.classList.toggle('is-zoomed',Z>1)}
 function setZ(z,cx,cy){var r=stage.getBoundingClientRect(),nz=Math.max(1,Math.min(4,z));if(cx==null){cx=r.left+r.width/2;cy=r.top+r.height/2}var k=nz/Z,ox=cx-(r.left+r.width/2),oy=cy-(r.top+r.height/2);PX=PX*k+(1-k)*(ox-0);PY=PY*k+(1-k)*(oy-0);Z=nz;if(Z===1){PX=0;PY=0}applyZ()}
 function dist(){var k=Object.keys(pts);return Math.hypot(pts[k[0]].x-pts[k[1]].x,pts[k[0]].y-pts[k[1]].y)}
 var lastTap=0;
 stage.addEventListener('pointerdown',function(e){if(!src)return;auto(false);cancelAnimationFrame(timer);pts[e.pointerId]={x:e.clientX,y:e.clientY};try{stage.setPointerCapture(e.pointerId)}catch(err){}
  if(Object.keys(pts).length===2){drag=null;pinch={d:dist(),z:Z};return}
  var n=performance.now();if(n-lastTap<300&&e.pointerType!=='mouse'||e.detail===2){setZ(Z>1?1:2.5,e.clientX,e.clientY);lastTap=0;drag=null;return}lastTap=n;
  drag={x:e.clientX,y:e.clientY,f:frame,t:n,v:0,lx:e.clientX,px:PX,py:PY}});
 stage.addEventListener('pointermove',function(e){if(pts[e.pointerId]){pts[e.pointerId]={x:e.clientX,y:e.clientY}}
  if(pinch&&Object.keys(pts).length>=2){var k=Object.keys(pts),cx=(pts[k[0]].x+pts[k[1]].x)/2,cy=(pts[k[0]].y+pts[k[1]].y)/2;setZ(pinch.z*dist()/pinch.d,cx,cy);return}
  if(!drag)return;
  if(Z>1){PX=drag.px+(e.clientX-drag.x);PY=drag.py+(e.clientY-drag.y);applyZ();return}
  var now=performance.now(),dt=Math.max(1,now-drag.t);drag.v=(drag.lx-e.clientX)/dt;drag.lx=e.clientX;drag.t=now;var f=drag.f+Math.round((drag.x-e.clientX)/56);if(f!==frame)show(f)});
 stage.addEventListener('wheel',function(e){if(!src)return;e.preventDefault();auto(false);setZ(Z*(e.deltaY<0?1.15:1/1.15),e.clientX,e.clientY)},{passive:false});
 function release(e){if(e&&pts[e.pointerId])delete pts[e.pointerId];if(pinch){if(Object.keys(pts).length<2)pinch=null;drag=null;return}if(!drag)return;var v=drag.v;drag=null;if(Z>1||reduce||Math.abs(v)<0.25)return;var acc=0,last=performance.now();
  (function coast(now){var dt=now-last;last=now;acc+=v*dt/56;v*=Math.pow(0.992,dt);if(Math.abs(acc)>=1){var s=acc>0?1:-1;show(frame+s);acc-=s}if(Math.abs(v)>0.05&&panel.isConnected)timer=requestAnimationFrame(coast)})(last)}
 stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);
 stage.addEventListener('keydown',function(e){if(!src)return;if(e.key==='ArrowLeft'){auto(false);show(frame+1)}if(e.key==='ArrowRight'){auto(false);show(frame-1)}if(e.key===' '){e.preventDefault();auto(!spinTimer)}});
 // The front is her own finished photo; the other three are separate full-quality images (face and dress locked).
 // They are laid side by side on one canvas so the viewer can turn and zoom with no waiting between angles.
 function compose(ids){
  var urls=[media(state.result)].concat(ids.map(media));
  return Promise.all(urls.map(function(u){return new Promise(function(res,rej){var im=new Image();im.onload=function(){res(im)};im.onerror=function(){rej(new Error('x'))};im.src=u})})).then(function(ims){
   var r0=ims[0].naturalWidth/ims[0].naturalHeight,H=Math.min(1400,ims[0].naturalHeight),W=Math.round(H*r0),c=document.createElement('canvas');c.width=W*N;c.height=H;var x=c.getContext('2d');
   ims.forEach(function(im,i){x.drawImage(im,i*W,0,W,H)});
   stage.style.aspectRatio=W+'/'+H;
   return new Promise(function(res){c.toBlob(function(b){res(URL.createObjectURL(b))},'image/jpeg',0.92)});
  });
 }
 function ready(ids){
  compose(ids).then(function(u){if(dead||gone()){try{URL.revokeObjectURL(u)}catch(e){}return}src=u;go()}).catch(function(){cleanup(true);tip.textContent='نمایش زاویه‌ها ممکن نشد؛ دوباره امتحان کن.'});
 }
 function go(){
  thumbs.replaceChildren();for(var i=0;i<N;i++)(function(n){var t=el('button',{class:'spin__thumb mz-mini',type:'button','aria-label':ANG[n]},[el('i')]);paint(t.firstChild,n);t.addEventListener('click',function(){auto(false);show(n)});thumbs.append(t)})(i);
  clearInterval(tipTimer);clearInterval(progTimer);bar.style.width='100%';tip.textContent='آماده است';
  a.classList.add('is-on');show(0,true);
  vpm.finish(null).then(function(){
   stage.classList.add('is-ready');controls.hidden=false;zbtn.hidden=false;
   setTimeout(function(){loading.remove()},reduce?0:350);
   auto(true);
  });
 }
 var tips=['دارم نیم‌رخ راست را می‌سازم…','پشت لباس و دنباله…','نیم‌رخ چپ…','هماهنگ‌کردن نور و رنگ لباس…','سه زاویه با هم ساخته می‌شوند؛ ۲ تا ۳ دقیقه صبر کن…'],ti=0,started=Date.now();
 tipTimer=setInterval(function(){if(gone()){cleanup();return}tip.textContent=tips[ti++%tips.length]},2400);
 progTimer=setInterval(function(){bar.style.width=Math.round(3+92*(1-Math.exp(-(Date.now()-started)/70000)))+'%'},400);
 if(state.views&&state.views.gen===state.gen&&state.views.ids){ready(state.views.ids);return}
 if(quotaLeft()===0){cleanup(true);tip.textContent='سهم امتحان «لباس عروس» برای شما تمام شد؛ زوایای دیگر هم از همین سهم حساب می‌شود.';return}
 api('views',{v:VISITOR,parent:state.gen,idem:state.viewsIdem||(state.viewsIdem=uuid())}).then(function(job){
  spentQuota();var tries=0,netFails=0,ids=job.ids||[job.id];
  function check(){if(gone()||dead){cleanup();return}
   if(navigator.onLine===false){tip.textContent='اینترنتت قطع شده؛ به‌محض وصل‌شدن ادامه می‌دهیم.';return sleep(2500).then(check)}
   return Promise.all(ids.map(function(i){return api('generation/'+i)})).then(function(ds){netFails=0;
   var done=ds.filter(function(d){return d.state==='success'&&d.result_id});
   if(done.length===ids.length){var out=done.map(function(d){return d.result_id});state.views={gen:state.gen,ids:out,gens:ids.slice(0)};state.viewsIdem=null;ready(out);return}
   if(ds.some(function(d){return d.state==='fail'||d.state==='unknown'})||++tries>90){cleanup(true);tip.textContent='ساخت زاویه‌ها ممکن نشد؛ کمی بعد دوباره امتحان کن.';state.viewsIdem=null;return}
   return sleep(3000).then(check);
  },function(){
   // a dropped connection is not the end: ask again a few times before giving up
   if(++netFails>8){cleanup(true);tip.textContent='ارتباطت قطع شد؛ دوباره که باز کنی همین درخواست پیگیری می‌شود.';return}
   return sleep(2500).then(check);
  })}
  return check();
 }).catch(function(e){cleanup(true);tip.textContent=e.message;if(e.status===402){tip.textContent='';tip.append(noImageCard(e.message))}});
}

/* ---------- demo before/after, shown before we ask for a photo ---------- */
// Uses /catalog/demo-before.webp and demo-after.webp (made by the catalog workflow); if they are
// missing, nothing is shown. The line sweeps by itself; reduced motion keeps it still.
function demoCompare(cls){
 var base='/catalog/dress/';
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
var MINE={new:[ICO.clock,'فرستاده شد؛ منتظر تماس مزون باش','sent'],called:[ICO.phone,'مزون گفته با تو تماس گرفته','called'],booked:[ICO.check,'نوبتت هماهنگ شد','booked'],declined:[ICO.hand,'فعلاً امکان‌پذیر نیست؛ مزون با تو در تماس است','declined'],cancelled:[ICO.ban,'مزون درخواستت را بست','declined']};
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
 if(r.salon_status==='declined'||r.salon_status==='cancelled')actions.append(el('button',{class:'btn btn--soft btn--sm',type:'button',onclick:function(){go(state.original?2:1)},text:'امتحان یک مدل دیگر'}));
 if(!r.followed&&follow&&r.salon_status==='new'){if(follow.telegram)actions.append(el('a',{class:'btn btn--ghost btn--sm',href:follow.telegram,target:'_blank',rel:'noopener',onclick:function(){track('follow','telegram')},text:'خبرم کن در تلگرام'}));if(follow.bale)actions.append(el('a',{class:'btn btn--ghost btn--sm',href:follow.bale,target:'_blank',rel:'noopener',onclick:function(){track('follow','bale')},text:'خبرم کن در بله'}))}
 box.replaceChildren(el('div',{class:'panel mine mine--'+st[2]},[
  el('div',{class:'mine__head'},[el('span',{class:'mine__icon','aria-hidden':'true',html:st[0]}),el('div',{},[h('b',late?'مزون هنوز جواب نداده':(r.status_text||st[1])),h('span',(r.look?r.look+'، ':'')+fmt(r.created_at),'mine__meta')])]),
  el('ol',{class:'mine__steps'},steps.map(function(t,i){return el('li',{class:i<reached?'is-on':''},[el('span',{}),el('b',{text:t})])})),
  late?h('p','معمولاً مزون‌ها در یکی دو روز تماس می‌گیرند. اگر عجله داری، مستقیم زنگ بزن.','mine__note'):null,
  actions.childNodes.length?actions:null
 ]));
 box.hidden=false;
}

/* ---------- first-visit tour: welcome card, then a spotlight that glides between parts ---------- */
var TOUR_KEY='ayneh-tour-v2';
function pageGo(n){go(n)}
// The tour walks through the three ways of choosing a dress, then puts the page back exactly as it was.
function tourView(step,tab,style){
 var d=viewDefaults();Object.assign(state,d,{step:step,tab:tab||d.tab,filter:'همه',original:null,preview:null,style:style===undefined?null:style,tourDemo:true});
 renderAll();
}
function tourSteps(){
 var mobile=window.matchMedia('(max-width:959px)').matches;
 return [
  {el:'#flow',enter:function(){tourView(1,'salon')},title:'اول، عکس تمام‌قد خودت',text:'یک عکس ایستاده از سر تا پا، روبه‌رو و با لباس ساده. لباس روی همین عکس و همین اندام امتحان می‌شود؛ سایزت دست نمی‌خورد.'},
  {el:'#flow .seg',enter:function(){tourView(2,'salon')},title:'سه راه برای انتخاب لباس',text:'«'+TAB_LABEL.dress[0]+'»، «'+TAB_LABEL.dress[1]+'» و «'+TAB_LABEL.dress[2]+'». هر کدام را بزنی، پایینش عوض می‌شود.'},
  {el:'#flow .seg [data-tab="salon"]',enter:function(){tourView(2,'salon')},title:'۱. لباس‌های همین مزون',text:hasLineWork()?'لباس‌های واقعی «'+state.pub.salon.name+'». روی هر کدام بزن تا همان لباس روی تو ساخته شود.':'لباس‌های واقعی مزون اینجا می‌آید. روی هر کدام بزنی، همان لباس روی تو ساخته می‌شود.'},
  {el:'#flow .looks .style-card',enter:function(){tourView(2,'catalog')},title:'۲. لباس‌های آماده',text:'مدل‌های پرطرفدار با عکس نمونه. با فیلترهای بالا سریع پیدا کن: پفی، ماهی، پوشیده، دانتل…'},
  {el:'#flow .upload--ref',enter:function(){tourView(2,'upload')},title:'۳. عکس لباسی که خودت داری',text:'لباسی در اینستاگرام یا گالری‌ات دیدی؟ عکسش را اینجا بگذار. فقط خود لباس برداشته می‌شود؛ مدل و بدنش نه.'},
  {el:mobile?'#dock .dock__inner':'#flow .btn--build',enter:function(){tourView(2,'catalog',3)},title:'انتخاب کردی؟ «خودت را در لباس عروس ببین»',text:'با یک دکمه پرو شروع می‌شود و نتیجه را کنار عکس خودت می‌بینی. بعد با یک دکمه برای مزون می‌فرستی.'},
  {el:'#steps .steps__list',title:'همیشه می‌دانی کجایی',text:'عکس تو، انتخاب، نتیجه. روی هر قدم بزنی برمی‌گردی.'},
  {el:mobile?'#dock .dock__inner':'.hero__cta .btn',title:'شروع کنیم؟',text:'اول عکس تمام‌قدت را بگذار. بعد از دیدن نتیجه، با «ارسال برای خودم» آن را روی گوشی‌ات بگیر.',last:true}
 ].filter(Boolean);
}
function maybeTour(){return;try{if(localStorage.getItem(TOUR_KEY))return}catch(e){return}if(state.busy)return;setTimeout(startTour,700)}
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
 var saved={data:viewData(),y:window.pageYOffset},changed=false;
 function restore(){state.tourDemo=false;if(!changed)return;Object.assign(state,saved.data);renderAll()}
 function done(how){track(how==='done'?'tour_done':'tour_skip');try{localStorage.setItem(TOUR_KEY,'1')}catch(e){}window.removeEventListener('resize',place);window.removeEventListener('keydown',keys);restore();root.classList.add('is-leaving');setTimeout(function(){root.remove();document.body.classList.remove('is-touring')},reduce?0:220);if(how==='done'){pageGo(state.original?2:1)}else if(changed)window.scrollTo({top:0});if(lastFocus&&lastFocus.focus)lastFocus.focus()}
 function keys(e){if(e.key==='Tab'){var f=[].slice.call(root.querySelectorAll('button,a[href],input,[tabindex]:not([tabindex="-1"])')).filter(function(x){return !x.disabled&&x.offsetParent!==null});if(!f.length){e.preventDefault();card.focus();return}var first=f[0],last=f[f.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===card)){e.preventDefault();last.focus()}else if(!e.shiftKey&&(document.activeElement===last||!root.contains(document.activeElement))){e.preventDefault();first.focus()}return}if(e.key==='Escape')done();else if(i>=0&&(e.key==='ArrowLeft'))go(i+1);else if(i>0&&e.key==='ArrowRight')go(i-1)}
 window.addEventListener('keydown',keys);
 function welcome(){
  root.classList.add('tour--welcome');
  card.replaceChildren(
   demoCompare('tour__demo')||null,
   el('h2',{id:'tour-title',class:'tour__title',text:'به مزون آینه خوش آمدی'}),
   el('p',{class:'tour__text',text:'قبل از اینکه به پرو «'+state.pub.salon.name+'» بیایی، لباس عروس را روی اندام خودت ببین؛ قد و سایز بدنت همان می‌ماند. در یک دقیقه نشانت می‌دهم چطور.'}),
   el('ol',{class:'tour__path'},[
    el('li',{},[el('span',{html:ICO.camera}),el('b',{text:'عکس تو'})]),
    el('li',{},[el('span',{html:ICO.heart}),el('b',{text:'انتخاب لباس'})]),
    el('li',{},[el('span',{html:ICO.spark}),el('b',{text:'بساز و ببین'})])
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
// The session also says how many images this person has left.
function loadSession(){return api('session?v='+VISITOR).then(function(d){state.session=true;if(d.cname){state.cname=d.cname;state.cphone=d.cphone}applyVerified(d);if(d.original&&!state.original){state.original=d.original;state.justUploaded=true;state.fromBot=true;state.ratio='';if(state.step===1){state.step=2;state.justArrived=true;renderSteps();renderFlow();renderDock()}}if(d.quota){state.quota=d.quota;renderDockSoon();var f=$('#flow');if(f&&state.step===2&&!state.busy)renderFlow()}})}
function quotaLeft(){return state.quota&&state.quota.left?state.quota.left.dress:null}
function spentQuota(){if(state.quota&&state.quota.left&&state.quota.left.dress>0)state.quota.left.dress--}
function quotaOut(){
 return 'سهم امتحان «'+LINES.label.dress+'» برای شما تمام شد ('+fa(state.quota.per)+' تصویر). می‌توانی همین نتیجه‌ها را برای مزون بفرستی تا با تو تماس بگیرند.';
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
  panel.append(notice('info',state.pub.demo?'این نسخهٔ نمونهٔ مزون آینه است و مزونی برای دریافت ندارد. نتیجه را دانلود کن. برای اینکه مشتری‌های خودت به مزون خودت درخواست بفرستند، صفحهٔ آزمایشی رایگان را بساز.':'«'+s.name+'» هنوز دریافت آنلاین را فعال نکرده. عکس نتیجه را دانلود کن و از یکی از این راه‌ها برای مزون بفرست.'));
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
  h('p',[state.result?'عکس خودت و نتیجهٔ شبیه‌سازی':'عکس خودت',lookName()?'انتخاب: '+lookName():''].filter(Boolean).join('، ')+'، به همراه نام، شماره و توضیحت.')
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
 form.append(nameWrap,phoneWrap,tgWrap,el('label',{class:'field'},[el('span',{class:'lbl',text:'توضیح برای مدیر مزون (اختیاری)'}),note]),
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
   return api('leads',{data_consent:true,idem:state.sendIdem,name:state.me.name,phone:phoneVal,telegram:tg,note:note.value,original_id:state.original,reference_id:state.reference||undefined,preview_id:state.result||undefined,look:lookName(),v:VISITOR});
  }).then(function(d){
   state.sendIdem=null;
   var follow=d.follow||{},fl=[];state.sentOnce=true;try{localStorage.setItem('ayneh-sent-'+SLUG,'1');localStorage.setItem('ayneh-follow-'+SLUG,JSON.stringify(follow))}catch(err){}
   if(follow.telegram)fl.push(el('a',{class:'btn btn--primary btn--block',href:follow.telegram,target:'_blank',rel:'noopener',onclick:function(){track('follow','telegram')},html:ICO.send+'<span>خبرم کن در تلگرام</span>'}));
   if(follow.bale)fl.push(el('a',{class:'btn btn--soft btn--block',href:follow.bale,target:'_blank',rel:'noopener',onclick:function(){track('follow','bale')},html:ICO.send+'<span>خبرم کن در بله</span>'}));
   setTimeout(loadMine,600);
   panel.replaceChildren(el('div',{class:'sent'},[
    el('span',{class:'sent__mark sent__mark--anim',html:ILLO.success}),
    h('h2',d.delivered?'عکست برای مزون ارسال شد':d.waiting?'درخواستت ثبت شد':'در صف ارسال است'),
    h('p',d.delivered?'مزون به‌زودی با تو تماس می‌گیرد.':(d.waiting?'درخواستت ذخیره شد و به‌زودی به دست مدیر مزون در «'+s.name+'» می‌رسد. منتظر تماسش باش.':'تلگرام الان جواب نداد؛ درخواستت ذخیره شد و چند دقیقهٔ دیگر خودکار برای مزون فرستاده می‌شود.')),
    fl.length?el('div',{class:'sent__follow'},[h('p','می‌خواهی وقتی مزون جواب داد خبردار شوی؟ یک بار ربات را باز کن و Start بزن.','sent__hint')].concat(fl)):null,
    el('button',{class:fl.length?'btn btn--ghost btn--block':'btn btn--primary btn--block',type:'button',onclick:closeSheet,text:fl.length?'نه، ممنون':'باشه'})
   ]));
  }).catch(function(err){submit.disabled=false;submit.innerHTML=ICO.send+'<span>فرستادن</span>';if(needsVerify(err.message)){state.verified=false;openOtp(openRequest);return}toast(err.message,'error')});
 });
 panel.append(form);
 openSheet(panel);
}

/* ---------- «این لباس را می‌خواهم»: a short reservation request for one dress ---------- */
function openWant(it){
 it=it||{result:state.result,original:state.original,look:lookName()};
 if(!it.result||!it.original){toast('اول نتیجهٔ لباس را بساز');return}
 if(!state.pub.telegram){openRequest();return}
 var s=state.pub.salon,p=s.profile||{};
 var panel=el('div',{class:'sheet__panel want'});
 panel.append(el('div',{class:'sheet__head'},[h('h2','این لباس را می‌خواهم'),el('button',{class:'sheet__x',type:'button','aria-label':'بستن',text:'×',onclick:closeSheet})]));
 panel.append(el('div',{class:'outbox'},[el('div',{class:'outbox__thumbs'},[el('img',{src:media(it.original),alt:'عکس تو'}),el('img',{src:media(it.result),alt:'نتیجه'})]),el('div',{},[
  h('b',it.look||'لباس انتخابی'),h('p','«'+s.name+'» این لباس را با عکس و نتیجه‌ات می‌بیند و برای هماهنگی با تو تماس می‌گیرد.')])]));
 var nameWrap=wrapField('wname','نام عروس','text',state.me&&state.me.name||'','',{autocomplete:'name'});
 var phoneWrap=wrapField('wphone','شمارهٔ موبایل','tel',state.me&&state.me.phone||'','۰۹۱۲۱۲۳۴۵۶۷',{inputmode:'tel',autocomplete:'tel'});
 phoneWrap.querySelector('input').setAttribute('dir','ltr');
 if(state.verified){nameWrap.querySelector('input').readOnly=true;phoneWrap.querySelector('input').readOnly=true}
 var visit=el('input',{id:'wvisit',type:'text',maxlength:'120',placeholder:'مثلاً پنجشنبه عصر، یا هر روز بعد از ظهر'});
 var msg=el('textarea',{id:'wnote',maxlength:'500',placeholder:'اگر چیزی هست که مزون باید بداند، بنویس'});
 var consent=el('input',{type:'checkbox',id:'wconsent'});
 var consentErr=el('span',{class:'err',text:'برای ارسال، این تأیید لازم است'});
 var consentWrap=el('label',{class:'consent','data-invalid':'false'},[consent,el('span',{},[document.createTextNode('قبول دارم عکس من و نتیجهٔ این لباس برای «'+s.name+'» فرستاده شود و برای ساخت تصویر به سرویس هوش مصنوعی خارج از کشور برود؛ '),el('a',{href:'/privacy',target:'_blank',rel:'noopener',text:'قوانین و حریم خصوصی'}),document.createTextNode(' را می‌پذیرم.')]),consentErr]);
 var submit=el('button',{class:'btn btn--primary btn--block',type:'submit',html:ICO.heart+'<span>ثبت درخواست</span>'});
 var form=el('form',{novalidate:'true'},[nameWrap,phoneWrap,
  el('label',{class:'field'},[el('span',{class:'lbl',text:'روز و ساعت دلخواه برای بازدید (اختیاری)'}),visit]),
  el('label',{class:'field'},[el('span',{class:'lbl',text:'پیام برای مزون (اختیاری)'}),msg]),
  consentWrap,submit,h('p',['با ثبت، مزون شمارهٔ تو را می‌بیند و تماس می‌گیرد.',retentionLine()?' '+retentionLine():''].join(''),'fine-print')]);
 consent.addEventListener('change',function(){consentWrap.setAttribute('data-invalid','false')});
 form.addEventListener('submit',function(e){
  e.preventDefault();
  var okName=validate(nameWrap,function(){return nameWrap.querySelector('input').value.trim().length>=2},'نام عروس را بنویس');
  var num=normalizePhone(phoneWrap.querySelector('input').value);
  var okPhone=validate(phoneWrap,function(){return /^\+989\d{9}$/.test(num)},'شمارهٔ موبایل درست نیست؛ مثل ۰۹۱۲۱۲۳۴۵۶۷');
  var okConsent=consent.checked;consentWrap.setAttribute('data-invalid',okConsent?'false':'true');
  if(!okName||!okPhone||!okConsent)return;
  submit.disabled=true;submit.textContent='در حال ثبت…';
  state.me=Object.assign({},state.me||{},{name:nameWrap.querySelector('input').value.trim(),phone:phoneWrap.querySelector('input').value.trim()});
  try{localStorage.setItem('ayneh-me',JSON.stringify(state.me))}catch(err){}
  ensureSession().then(function(){
   state.wantIdem=state.wantIdem||uuid();
   return api('leads',{intent:'want',data_consent:true,idem:state.wantIdem,name:state.me.name,phone:num,visit_note:visit.value.trim(),note:msg.value.trim(),original_id:it.original,preview_id:it.result,look:it.look||'',v:VISITOR});
  }).then(function(d){
   state.wantIdem=null;state.sentOnce=true;
   var follow=d.follow||{},fl=[];try{localStorage.setItem('ayneh-sent-'+SLUG,'1');if(d.follow)localStorage.setItem('ayneh-follow-'+SLUG,JSON.stringify(follow))}catch(err){}
   if(follow.telegram)fl.push(el('a',{class:'btn btn--soft btn--block',href:follow.telegram,target:'_blank',rel:'noopener',onclick:function(){track('follow','telegram')},html:ICO.send+'<span>خبرم کن در تلگرام</span>'}));
   if(follow.bale)fl.push(el('a',{class:'btn btn--soft btn--block',href:follow.bale,target:'_blank',rel:'noopener',onclick:function(){track('follow','bale')},html:ICO.send+'<span>خبرم کن در بله</span>'}));
   var tel=p.phone||'';
   setTimeout(loadMine,600);
   panel.replaceChildren.apply(panel,[el('div',{class:'sent'},[
    el('span',{class:'sent__mark sent__mark--anim',html:ILLO.success}),
    h('h2',d.duplicate?'قبلاً ثبت شده بود':'عکست برای مزون ارسال شد'),
    h('p',d.duplicate?'برای همین لباس درخواست بازِ تو پیش مزون است؛ دوباره نفرستادیم.':'«'+s.name+'» درخواست «'+(it.look||'این لباس')+'» را'+(d.delivered?' همین الان':'')+' دریافت کرد.')]),
    el('ol',{class:'how'},[
     el('li',{text:'مزون عکس و لباس انتخابی‌ات را می‌بیند.'}),
     el('li',{text:'با شمارهٔ '+fa0(num)+' تماس می‌گیرد و زمان بازدید و پرو را هماهنگ می‌کند'+(visit.value.trim()?' (تو نوشتی: '+visit.value.trim()+').':'.')}),
     el('li',{text:'تا آن موقع می‌توانی لباس‌های دیگر را هم امتحان کنی.'})]),
    fl.length?el('div',{class:'sent__follow'},[h('p','می‌خواهی وقتی مزون جواب داد خبردار شوی؟ یک بار ربات را باز کن و Start بزن.','sent__hint')].concat(fl)):null,
    tel?el('a',{class:'btn btn--ghost btn--block',href:'tel:'+tel,html:ICO.phone+'<span>تماس مستقیم با مزون</span>'}):null,
    el('button',{class:'btn btn--primary btn--block',type:'button',onclick:closeSheet,text:'باشه'})].filter(Boolean));
  }).catch(function(err){submit.disabled=false;submit.innerHTML=ICO.heart+'<span>ثبت درخواست</span>';if(needsVerify(err.message)){state.verified=false;closeSheet();openOtp(function(){openWant(it)});return}toast(err.message,'error')});
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
function shareText(){return 'این رو ببین! توی صفحهٔ «'+state.pub.salon.name+'» می‌تونی لباس عروس دلخواهت رو روی عکس تمام‌قد خودت امتحان کنی؛ رایگان و بدون نصب'}
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
 panel.append(grid,h('p','دوستت لینک را باز می‌کند و لباس عروس را روی عکس تمام‌قد خودش امتحان می‌کند. عکس‌ها خصوصی‌اند و برای کسی نمایش داده نمی‌شوند.','share__note'));
 openSheet(panel);
}


/* ---------- save and compare looks (localStorage, in-memory fallback) ---------- */
var SAVE_KEY='mezon-saved-'+SLUG,memSaved=[],MAXSAVE=6,sel=[];
function loadSaved(){try{var v=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(Array.isArray(v)){memSaved=v.filter(function(x){return x&&typeof x.r==='string'})}}catch(e){}return memSaved.slice()}
function writeSaved(l){memSaved=l.slice();try{localStorage.setItem(SAVE_KEY,JSON.stringify(l))}catch(e){}}
function savedCount(){return loadSaved().length}
function isSaved(id){return loadSaved().some(function(x){return x.r===id})}
function saveBtn(){
 var b=el('button',{class:'btn btn--ghost btn--sm',type:'button','data-save':'1'});
 function paint(){var on=isSaved(state.result);b.setAttribute('aria-pressed',on?'true':'false');b.innerHTML=ICO.check+'<span>'+(on?'ذخیره شد':'ذخیره')+'</span>';b.classList.toggle('btn--soft',on);b.classList.toggle('btn--ghost',!on)}
 b.addEventListener('click',function(){
  var l=loadSaved(),id=state.result;
  if(isSaved(id)){writeSaved(l.filter(function(x){return x.r!==id}));toast('از ذخیره‌ها برداشته شد')}
  else{l.push({r:id,o:state.original,look:lookName()||'',t:Date.now()});if(l.length>MAXSAVE)l=l.slice(l.length-MAXSAVE);writeSaved(l);toast('ذخیره شد؛ با «مقایسه» کنار هم ببینشان');track('save_look',dressKey())}
  paint();refreshCmp();
 });
 paint();return b;
}
function refreshCmp(){
 var ra=$('.result-actions');if(!ra)return;var old=ra.querySelector('[data-cmp]'),n=savedCount();
 if(!n){if(old)old.remove();return}
 if(!old){old=el('button',{class:'btn btn--ghost btn--sm',type:'button',onclick:openSaved,'data-cmp':'1'});ra.append(old)}
 old.textContent='مقایسه ('+fa(n)+')';
}
function openSaved(){
 var l=loadSaved();
 var panel=el('div',{class:'sheet__panel cmpx'});
 panel.append(el('div',{class:'sheet__head'},[h('h2','مقایسهٔ لباس‌های ذخیره‌شده'),el('button',{class:'sheet__x',type:'button','aria-label':'بستن',text:'×',onclick:closeSheet})]));
 if(!l.length){panel.append(notice('info','هنوز چیزی ذخیره نکرده‌ای. بعد از ساخت نتیجه، «ذخیره» را بزن.'));openSheet(panel);return}
 sel=sel.filter(function(id){return l.some(function(x){return x.r===id})});
 if(!sel.length)sel=l.slice(-3).map(function(x){return x.r});
 var picks=el('div',{class:'cmpx__picks',role:'group','aria-label':'انتخاب برای مقایسه (تا ۳ مورد)'});
 var grid=el('div',{class:'cmpx__grid'});
 function draw(){
  picks.replaceChildren.apply(picks,l.map(function(x,i){
   var on=sel.indexOf(x.r)>-1;
   var b=el('button',{class:'cmpx__pick mz-mini'+(on?' is-on':''),type:'button','aria-pressed':on?'true':'false','aria-label':(x.look||('لباس '+fa(i+1)))+(on?' (انتخاب شده)':'')},[el('img',{src:media(x.r),alt:'',loading:'lazy'})]);
   b.addEventListener('click',function(){var k=sel.indexOf(x.r);if(k>-1){if(sel.length>1)sel.splice(k,1)}else{if(sel.length>=3)sel.shift();sel.push(x.r)}draw()});
   return b}));
  var items=sel.map(function(id){return l.filter(function(x){return x.r===id})[0]}).filter(Boolean);
  grid.style.gridTemplateColumns='repeat('+Math.max(1,items.length)+',minmax(0,1fr))';
  grid.replaceChildren.apply(grid,items.map(function(x){
   var send=el('button',{class:'btn btn--primary btn--sm btn--block',type:'button',text:'این لباس را می‌خواهم',onclick:function(){openWant({result:x.r,original:x.o,look:x.look||''})}});
   var rm=el('button',{class:'btn btn--ghost btn--sm btn--block',type:'button',text:'حذف',onclick:function(){writeSaved(loadSaved().filter(function(y){return y.r!==x.r}));l=loadSaved();sel=sel.filter(function(i){return i!==x.r});refreshCmp();if(!l.length){closeSheet();return}if(!sel.length)sel=l.slice(-3).map(function(y){return y.r});draw()}});
   return el('figure',{class:'cmpx__col'},[
    x.o?el('div',{class:'cmpx__img cmpx__img--before'},[el('img',{src:media(x.o),alt:'عکس تو، قبل',loading:'lazy'}),el('span',{text:'قبل'})]):null,
    el('div',{class:'cmpx__img'},[el('img',{src:media(x.r),alt:x.look||'نتیجه',loading:'lazy'}),el('span',{text:'بعد'})]),
    el('figcaption',{text:x.look||'لباس'}),
    downloadLink('btn btn--ghost btn--sm btn--block','دانلود',x.r),send,rm])}));
 }
 panel.append(h('p','تا ۳ مورد را انتخاب کن تا کنار هم ببینی.','tiny muted'),picks,grid,
  el('button',{class:'btn btn--soft btn--block',type:'button',style:'margin-top:14px',onclick:function(){closeSheet();openShare()},html:SHARE_IC.share+'<span>ارسال برای دوستان</span>'}));
 draw();openSheet(panel);
}

/* ---------- sheet ---------- */
/* ---------- QR to the bride's phone, and the boutique touch-screen (kiosk) mode (?kiosk=1) ---------- */
/* offline banner */
(function(){var bar=document.createElement('div');bar.className='offline-bar';bar.setAttribute('role','status');bar.hidden=navigator.onLine!==false;bar.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M3.5 9.5a12 12 0 0 1 17 0M7 13a7 7 0 0 1 10 0M10.4 16.4a2.4 2.4 0 0 1 3.2 0M4 4l16 16"/></svg><span>اینترنت قطع است؛ تا وصل‌شدن دوباره، دکمه‌ها کار نمی‌کنند.</span>';document.body.append(bar);function u(){bar.hidden=navigator.onLine}window.addEventListener('online',u);window.addEventListener('offline',u)})();
var KIOSK=/[?&]kiosk=1(&|$)/.test(location.search);
var DESK=KIOSK||!!(window.matchMedia&&matchMedia('(min-width:900px) and (hover:hover)').matches);
function qrSvg(text){
 var logo=state.pub&&state.pub.salon&&state.pub.salon.profile&&state.pub.salon.profile.logo,q=qrcode(0,logo?'H':'M');q.addData(text);q.make();
 var svg=q.createSvgTag({cellSize:7,margin:2,scalable:true});
 if(!logo)return svg;
 var m=/viewBox="0 0 (\d+) (\d+)"/.exec(svg),W=m?+m[1]:0;if(!W)return svg;
 var d=Math.round(W*0.2),x=Math.round((W-d)/2),u=media(logo);
 return svg.replace('</svg>','<circle cx="'+W/2+'" cy="'+W/2+'" r="'+(d/2+6)+'" fill="#fff"/><image href="'+u+'" xlink:href="'+u+'" x="'+x+'" y="'+x+'" width="'+d+'" height="'+d+'" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 round '+d/2+'px)"/></svg>');
}
function openQR(job,what,extra){
 if(typeof job!=='string')job='';
 if(!Array.isArray(extra))extra=[];
 if(typeof what!=='string')what='';
 if(!state.gen&&!job){toast('اول نتیجه را بساز');return}
 var panel=el('div',{class:'sheet__panel'});
 panel.append(el('div',{class:'sheet__head'},[h('h2',(what||'عکس')+' را روی گوشی‌ات بگیر'),el('button',{class:'sheet__x',type:'button','aria-label':'بستن',text:'×',onclick:closeSheet})]));
 var box=el('div',{class:'qr'},[h('p','در حال ساخت لینک…','qr__note')]);
 panel.append(box);openSheet(panel);
 ensureSession().then(function(){return api('result-link',{v:VISITOR,gen:job||state.gen,extra:extra})}).then(function(d){
  box.replaceChildren(el('div',{class:'qr__code',dir:'ltr',html:qrSvg(d.url)}),h('p','دوربین گوشی را روی این کد بگیر. لینک شخصی توست و ۲۴ ساعت بعد بسته می‌شود.','qr__note'));
 }).catch(function(e){box.replaceChildren(notice('danger',(e&&e.message&&e.message!=='درخواست معتبر نیست')?e.message:'ساخت لینک ممکن نشد؛ یک بار دیگر امتحان کن'))});
}
function kioskReset(){
 var done=function(){try{localStorage.clear()}catch(e){}try{sessionStorage.clear()}catch(e){}location.replace(location.pathname+'?kiosk=1'+(state.tag?'&r='+encodeURIComponent(state.tag):''))};
 api('erase',{v:VISITOR}).then(done,done);
}
var kioskIdle=0,kioskWarnEl=null,kioskWarnT=0,kioskStarted=false;
function kioskActivity(){if(!kioskStarted||kioskWarnEl)return;clearTimeout(kioskIdle);kioskIdle=setTimeout(kioskWarn,90000)}
function kioskWarn(){
 var left=15,num=el('b',{text:fa(left)});
 kioskWarnEl=el('div',{class:'kov kov--warn',role:'alertdialog'},[el('div',{class:'kov__card'},[h('h2','هنوز اینجایی؟'),el('p',{},[document.createTextNode('برای حفظ حریم خصوصی تو، عکس‌ها تا '),num,document.createTextNode(' ثانیهٔ دیگر پاک می‌شود.')]),el('button',{class:'btn btn--primary',type:'button',text:'ادامه می‌دهم',onclick:function(){clearInterval(kioskWarnT);kioskWarnEl.remove();kioskWarnEl=null;kioskActivity()}})])]);
 document.body.append(kioskWarnEl);
 kioskWarnT=setInterval(function(){left--;num.textContent=fa(Math.max(left,0));if(left<=0){clearInterval(kioskWarnT);kioskReset()}},1000);
}
// On the boutique screen: a code that opens the bot already tied to this boutique, so a bride can send her photo from her own phone.
function botQrBlock(){
 var holder=el('div',{class:'kqrs',hidden:true}),tries=0;
 // The attract screen is drawn before the boutique has loaded, so the codes are filled in when it arrives.
 var t=setInterval(function(){
  if(state.pub||++tries>40){clearInterval(t);var bot=(state.pub&&state.pub.bot)||{},ks=Object.keys(bot);if(!ks.length||typeof qrcode==='undefined')return;
   holder.replaceChildren.apply(holder,ks.map(function(k){return el('div',{class:'kqr'},[el('div',{class:'qr__code',dir:'ltr',html:qrSvg(bot[k])}),h('span',k==='bale'?'بله':'تلگرام')])}).concat([h('p','یا با گوشی خودت اسکن کن، عکس تمام‌قدت را برای ربات بفرست و نتیجه را همان‌جا بگیر.')]));holder.hidden=false}
 },250);
 return holder;
}
function kioskBoot(){
 document.documentElement.classList.add('kiosk');
 document.addEventListener('contextmenu',function(e){e.preventDefault()});
 ['pointerdown','keydown','touchstart','wheel'].forEach(function(ev){document.addEventListener(ev,kioskActivity,{passive:true})});
 var end=el('button',{class:'kend',type:'button',text:'پایان و پاک کردن عکس‌ها',onclick:function(){
  var box=el('div',{class:'kov'},[el('div',{class:'kov__card'},[h('h2','پایان؟'),h('p','عکس‌های تو از روی این دستگاه پاک می‌شود. اگر لینک عکس را نگرفته‌ای، دیگر نمی‌توانی ببینی‌اش.'),el('button',{class:'btn btn--primary',type:'button',text:'بله، پاک کن',onclick:kioskReset}),el('button',{class:'btn btn--ghost',type:'button',text:'برگرد',onclick:function(){box.remove()}})])]);
  document.body.append(box);
 }});
 document.body.append(end);
 var name=(document.title||'').split('|')[0].trim();
 welcomeFlow({kiosk:true});
}
// Live camera with a standing guide and a 3-2-1 countdown, so the full-length photo is taken in front of the screen.
var SIL_SVG='<svg viewBox="0 0 200 440" aria-hidden="true"><ellipse class="sil" cx="100" cy="40" rx="19" ry="23"/><path class="sil" d="M92 62 L92 74 C78 78 62 84 58 100 C55 118 66 150 76 176 C70 220 52 330 30 428 L170 428 C148 330 130 220 124 176 C134 150 145 118 142 100 C138 84 122 78 108 74 L108 62 Z"/></svg>';
function kioskCamera(){
 if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){var i=$('#pick');if(i)i.click();return}
 var video=el('video',{autoplay:'',playsinline:'',muted:''});video.muted=true;
 var num=el('b',{text:fa(10)}),ring=el('div',{class:'kcam__ring',html:'<svg viewBox="0 0 100 100"><circle class="bg" cx="50" cy="50" r="44"/><circle class="fg" cx="50" cy="50" r="44"/></svg>'});ring.append(num);
 var facing='user',stream=null,timer=0,done=false,P=(state.pub&&state.pub.salon&&state.pub.salon.profile)||{};
 var first=(state.cname||'').split(' ')[0];
 var head=el('div',{class:'kcam__head'},[P.logo?el('img',{src:media(P.logo),alt:''}):null,el('div',{},[h('b',first?first+' جان، آماده‌ای؟':'آماده‌ای؟'),h('small',(state.pub&&state.pub.salon.name)||'')])]);
 var tip=el('p',{class:'kcam__tip',text:'تمام‌قد و رو به دوربین بایست؛ بعد «عکس بگیر» را بزن، یا تایمر ۱۰ ثانیه‌ای را روشن کن تا خودش عکس بگیرد.'});
 var now=el('button',{class:'btn btn--primary btn--lg',type:'button',text:'عکس بگیر'}),tbtn=el('button',{class:'btn btn--ghost',type:'button',text:'تایمر ۱۰ ثانیه‌ای'}),flip=el('button',{class:'btn btn--ghost',type:'button',text:'چرخش دوربین'}),cancel=el('button',{class:'btn btn--ghost',type:'button',text:'بستن'});
 var wrap=el('div',{class:'kov kcam'},[video,el('div',{class:'kcam__shade'}),head,tip,ring,el('div',{class:'kcam__btns'},[now,tbtn,flip,cancel])]);
 function stop(){clearInterval(timer);done=true;if(stream)stream.getTracks().forEach(function(t){t.stop()});wrap.remove()}
 cancel.addEventListener('click',stop);
 document.body.append(wrap);
 function snap(){
  if(done)return;clearInterval(timer);
  var w=video.videoWidth,hh=video.videoHeight;if(!w){stop();toast('دوربین آماده نبود؛ دوباره امتحان کن','error');return}
  var sw=Math.min(w,Math.round(hh*0.75)),sx=Math.round((w-sw)/2),c=document.createElement('canvas');c.width=sw;c.height=hh;c.getContext('2d').drawImage(video,sx,0,sw,hh,0,0,sw,hh);
  c.toBlob(function(b){stop();if(b)handleFile(new File([b],'kiosk.jpg',{type:'image/jpeg'}),'original')},'image/jpeg',0.92);
 }
 function endTimer(){clearInterval(timer);timer=0;ring.classList.remove('go');ring.style.display='none';tbtn.textContent='تایمر ۱۰ ثانیه‌ای'}
 function begin(){
  if(timer){endTimer();return}
  if(done)return;var n=10;num.textContent=fa(n);ring.style.display='block';ring.classList.remove('go');void ring.offsetWidth;ring.classList.add('go');tbtn.textContent='لغو تایمر';
  timer=setInterval(function(){n--;num.textContent=fa(Math.max(n,0));if(n<=0)snap()},1000);
 }
 function open(){
  if(stream){stream.getTracks().forEach(function(t){t.stop()});stream=null}
  wrap.classList.toggle('kcam--rear',facing==='environment');
  navigator.mediaDevices.getUserMedia({video:{facingMode:facing,width:{ideal:1920},height:{ideal:1920}},audio:false}).then(function(s){if(done){s.getTracks().forEach(function(t){t.stop()});return}stream=s;video.srcObject=s;video.play().catch(function(){})}).catch(function(){if(facing==='environment'){facing='user';toast('دوربین پشت پیدا نشد','error');open();return}stop();toast('دوربین باز نشد؛ اجازهٔ دوربین را بده و دوباره امتحان کن','error')});
 }
 ring.style.display='none';
 now.addEventListener('click',snap);
 tbtn.addEventListener('click',begin);
 flip.addEventListener('click',function(){endTimer();facing=facing==='user'?'environment':'user';open()});
 open();
}

/* ---------- thumbs up / down, "send it to me" through the bot, and how long the picture stays ---------- */
function deleteBtn(){
 var armed=false,t=0,b=el('button',{class:'btn btn--ghost btn--sm btn--danger-ghost',type:'button',text:'پاک کردن عکس‌ها'});
 b.addEventListener('click',function(){
  if(!armed){armed=true;b.textContent='مطمئنی؟ دوباره بزن';t=setTimeout(function(){armed=false;b.textContent='پاک کردن عکس‌ها'},4000);return}
  clearTimeout(t);b.disabled=true;b.textContent='در حال پاک کردن…';
  var done=function(){clearTimeout(state.advT);state.original=null;state.preview=null;state.result=null;state.gen=null;state.idem=null;state.error='';state.busy=false;state.justUploaded=false;try{sessionStorage.removeItem('ayneh-job-'+SLUG)}catch(e){}toast('عکس‌ها پاک شد');go(1);renderAll()};
  api('erase',{v:VISITOR}).then(done,function(){b.disabled=false;armed=false;b.textContent='پاک کردن عکس‌ها';toast('پاک کردن انجام نشد؛ دوباره امتحان کن','error')});
 });
 return b;
}
function keepNote(){var m=(state.pub&&state.pub.photo_ttl)||15;return 'این عکس '+(m===60?'یک ساعت':m%60===0?fa(m/60)+' ساعت':fa(m)+' دقیقه')+' اعتبار دارد و به‌صورت خودکار پاک می‌شود.'}
function ttlLine(){
 var m=state.pub&&state.pub.photo_ttl;if(!m)return '';
 return 'تصاویر شما نهایت تا '+(m===60?'یک ساعت':m%60===0?fa(m/60)+' ساعت':fa(m)+' دقیقه')+' در همین صفحه قابل مشاهده هستند و بعد از آن به صورت خودکار پاک می‌شوند.';
}
function askProfile(done){
 var panel=el('div',{class:'sheet__panel'}),nm=el('input',{type:'text',placeholder:'نام و نام خانوادگی',value:state.cname||'',autocomplete:'name'}),ph=el('input',{type:'tel',dir:'ltr',placeholder:'09123456789',value:state.cphone||'',autocomplete:'tel'});
 var err=el('div',{class:'wl__err'}),ok=el('button',{class:'btn btn--primary',type:'button',text:'ثبت'});
 [nm,ph].forEach(function(i){i.style.cssText='width:100%;height:52px;border-radius:14px;border:1.5px solid var(--line);padding:0 14px;font:inherit;font-size:17px;margin-bottom:10px'});
 panel.append(el('div',{class:'sheet__head'},[h('h2','نام و شمارهٔ موبایلت'),el('button',{class:'sheet__x',type:'button','aria-label':'بستن',text:'×',onclick:closeSheet})]),h('p','برای فرستادن تصویر به تلگرامت، شمارهٔ موبایلت لازم است.','tiny muted'),nm,ph,err,ok);
 ok.addEventListener('click',function(){ok.disabled=true;saveProfile(nm.value,ph.value).then(function(){closeSheet();done()}).catch(function(e){ok.disabled=false;err.textContent=e.message||'ثبت نشد'})});
 openSheet(panel);
}
function saveProfile(name,phone){
 return ensureSession().then(function(){return api('session/profile',{v:VISITOR,name:name,phone:phone})}).then(function(d){state.cname=d.name;state.cphone=d.phone;return d});
}
function downSheet(gen){
 var reasons=(state.pub&&state.pub.reaction_reasons)||{},pick='',sent=false,panel=el('div',{class:'sheet__panel'}),chips=el('div',{class:'rchips',role:'group','aria-label':'دلیل'});
 var note=el('textarea',{class:'rnote',maxlength:'200',placeholder:'اگر دوست داری یک جمله بنویس (اختیاری)','aria-label':'توضیح'});
 Object.keys(reasons).forEach(function(k){var c=el('button',{class:'chip',type:'button','aria-pressed':'false',text:reasons[k]});c.addEventListener('click',function(){pick=pick===k?'':k;Array.prototype.forEach.call(chips.children,function(x){x.setAttribute('aria-pressed','false')});if(pick)c.setAttribute('aria-pressed','true')});chips.append(c)});
 function send(why,txt){if(sent)return;sent=true;api('reaction',{v:VISITOR,gen:gen,r:'down',reason:why||undefined,note:txt||undefined}).then(function(d){if(d&&d.refunded)toast('سهمیه‌ات برگشت داده شد');if(d&&d.refunded&&state.quota&&state.quota.left)state.quota.left.dress++}).catch(function(){})}
 var d=$('#sheet');var onClose=function(){d.removeEventListener('close',onClose);send(pick,note.value.trim())};d.addEventListener('close',onClose);
 panel.append(el('div',{class:'sheet__head'},[h('h2','چه چیزی خوب نبود؟'),el('button',{class:'sheet__x',type:'button','aria-label':'بستن',text:'×',onclick:closeSheet})]),h('p','با گفتن دلیل به ما کمک می‌کنی؛ سهمیهٔ امتحان این تصویر هم برایت برمی‌گردد.','tiny muted'),chips,note,
  el('button',{class:'btn btn--primary btn--block',type:'button',text:'ثبت و بستن',onclick:closeSheet}));
 openSheet(panel);
}
function meBlock(){
 var wrap=el('div',{class:'me-block'}),gen=state.gen;state.react=state.react||{};
 var row=el('div',{class:'react'},[h('span','از این نتیجه راضی بودی؟','tiny muted')]);
 [['up',ICO.up],['down',ICO.down]].forEach(function(r){
  var b=el('button',{type:'button','aria-label':r[0]==='up'?'خوشم آمد':'خوشم نیامد',html:r[1],class:state.react[gen]===r[0]?'is-on':''});
  b.addEventListener('click',function(){var v=state.react[gen]===r[0]?'':r[0];state.react[gen]=v;row.querySelectorAll('button').forEach(function(x){x.classList.remove('is-on')});if(v)b.classList.add('is-on');if(v==='down'){downSheet(gen);return}api('reaction',{v:VISITOR,gen:gen,r:v}).catch(function(){})});
  row.append(b);
 });
 wrap.append(row);var t=ttlLine();if(t)wrap.append(h('p',t,'me-note'));
 return wrap;
}
/* ---------- welcome: a full-screen preview of the boutique; a touch stops it and asks for a name, then a mobile number ---------- */
function welcomeFlow(opts){
 opts=opts||{};
 var key='ayneh-welcome-'+SLUG;try{if(!opts.kiosk&&sessionStorage.getItem(key))return}catch(e){}
 var ov=el('div',{class:'wl',role:'dialog','aria-label':'خوش آمدی'});document.body.append(ov);
 var tries=0,t=setInterval(function(){if(state.pub||++tries>80){clearInterval(t);if(state.pub)build();else ov.remove()}},150);
 function build(){
  var pub=state.pub,P=pub.salon.profile||{},name=pub.salon.name,urls=[];
  (pub.portfolio||[]).forEach(function(p){try{var im=JSON.parse(p.images||'[]');if(im[0])urls.push({u:media(im[0]),t:p.title,m:p})}catch(e){}});
  if(P.cover)urls.unshift({u:media(P.cover),t:name,m:null});
  if(!urls.length){ov.remove();finish(true);return}
  var layers=[el('img',{class:'wl__img',alt:''}),el('img',{class:'wl__img',alt:''})],cap=el('div',{class:'wl__cap'}),idx=0,cur=0,timer=0;
  var tap=el('div',{class:'wl__tap',text:'برای شروع، صفحه را لمس کن'});
  var brand=el('div',{class:'wl__brand'},[P.logo?el('img',{src:media(P.logo),alt:''}):null,h('b',name)]);
  ov.append(layers[0],layers[1],el('div',{class:'wl__shade'}),brand,cap,tap);
  if(opts.kiosk){var q=botQrBlock();q.classList.add('wl__qr');ov.append(q)}
  function show(){
   var it=urls[idx%urls.length],L=layers[cur];L.onload=function(){layers.forEach(function(x){x.classList.remove('on')});L.classList.add('on');cur=1-cur};L.src=it.u;
   var sub=it.m?[it.m.mode==='sale'?'فروش':it.m.mode==='rent'?'اجاره':it.m.mode==='both'?'فروش و اجاره':'',it.m.price].filter(Boolean).join(' · '):'';
   cap.replaceChildren(h('strong',it.t),h('span',sub));idx++;
  }
  show();timer=setInterval(show,4200);
  var card=el('div',{class:'wl__card'});ov.append(card);
  function pause(){clearInterval(timer);ov.classList.add('is-paused');cap.style.opacity=0;tap.remove();ov.removeEventListener('pointerdown',pause);stepName()}
  ov.addEventListener('pointerdown',pause);
  function logo(){return P.logo?el('img',{class:'logo',src:media(P.logo),alt:''}):null}
  function stepName(){
   var nm=el('input',{type:'text',placeholder:'نام و نام خانوادگی',value:state.cname||'',autocomplete:'name'}),err=el('div',{class:'wl__err'}),go=el('button',{class:'btn btn--primary btn--lg',type:'button',text:'ادامه'});
   card.replaceChildren(logo(),h('h2','به «'+name+'» خوش آمدی'),h('p','برای شروع، نام و نام خانوادگی‌ات را بنویس.'),nm,err,go);
   function next(){var v=nm.value.replace(/\s+/g,' ').trim();if(v.length<2){err.textContent='نام و نام خانوادگی را بنویس';return}stepPhone(v)}
   go.addEventListener('click',next);nm.addEventListener('keydown',function(e){if(e.key==='Enter')next()});setTimeout(function(){nm.focus()},200);
  }
  function stepPhone(fullName){
   var first=fullName.split(' ')[0],ph=el('input',{type:'tel',dir:'ltr',placeholder:'09123456789',value:state.cphone||'',autocomplete:'tel'}),err=el('div',{class:'wl__err'}),go=el('button',{class:'btn btn--primary btn--lg',type:'button',text:'ورود'}),back=el('button',{class:'btn btn--ghost',type:'button',text:'بازگشت',onclick:stepName});
   card.replaceChildren(logo(),h('h2',first+' جان، شمارهٔ موبایلت؟'),h('p','فقط برای فرستادن تصویرهایت به تلگرام و هماهنگی با مزون.'),ph,err,go,back);
   function next(){go.disabled=true;saveProfile(fullName,ph.value).then(function(){stepWelcome(first)}).catch(function(e){go.disabled=false;err.textContent=e.message||'ثبت نشد'})}
   go.addEventListener('click',next);ph.addEventListener('keydown',function(e){if(e.key==='Enter')next()});setTimeout(function(){ph.focus()},200);
  }
  function stepWelcome(first){
   card.replaceChildren(logo(),el('div',{class:'wl__big',text:'سلام '+first+' جان'}),h('h2','به «'+name+'» خیلی خوش اومدی'),h('p','صفحهٔ مزون برایت باز می‌شود…'));
   setTimeout(function(){ov.classList.add('is-out');setTimeout(function(){ov.remove();finish(false)},700)},2200);
  }
 }
 function finish(){
  try{sessionStorage.setItem(key,'1')}catch(e){}
  if(opts.kiosk){kioskStarted=true;kioskActivity();try{if(document.documentElement.requestFullscreen)document.documentElement.requestFullscreen()}catch(e){}}
 }
}
/* ---------- true 360: a short turntable video of the bride in the dress; drag to turn it, pinch / double-tap to zoom ---------- */
// Big preview of every angle of one dress; the customer looks first, then chooses it to try on.
var ANGLE_NAMES=['جلو','کنار','پشت','جزئیات'];
function openDress(p,imgs,pick,names){
 var NM=names||ANGLE_NAMES;
 var panel=el('div',{class:'sheet__panel dress-panel'}),cur=0;
 panel.append(el('div',{class:'sheet__head'},[h('h2',p.title),el('button',{class:'sheet__x',type:'button','aria-label':'بستن',text:'×',onclick:closeSheet})]));
 var big=el('img',{class:'dress-big',alt:p.title,src:media(imgs[0])}),thumbs=el('div',{class:'dress-thumbs'});
 var tb=imgs.map(function(id,i){var b=el('button',{type:'button',class:'dress-th'+(i===0?' is-on':''),'aria-label':'نمای '+(NM[i]||i+1)},[el('img',{src:media(id),alt:'',loading:'lazy'}),el('span',{text:NM[i]||''})]);b.addEventListener('click',function(){show(i)});thumbs.append(b);return b});
 var z=1,tx=0,ty=0,pts={},pd=0,stage=null,moved=false;
 function zapply(){var w=big.clientWidth,hh=big.clientHeight,lx=(z-1)*w/2,ly=(z-1)*hh/2;tx=Math.max(-lx,Math.min(lx,tx));ty=Math.max(-ly,Math.min(ly,ty));big.style.transform='translate('+tx+'px,'+ty+'px) scale('+z+')'}
 function zset(k){z=Math.max(1,Math.min(4,k));if(z<1.02){z=1;tx=0;ty=0}zapply()}
 function show(i){zset(1);cur=(i+imgs.length)%imgs.length;big.src=media(imgs[cur]);tb.forEach(function(b,k){b.classList.toggle('is-on',k===cur)})}
 function dd(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
 var sx0=0;
 function bind(st){stage=st;st.style.touchAction='none';
  st.addEventListener('pointerdown',function(e){try{st.setPointerCapture(e.pointerId)}catch(x){}pts[e.pointerId]={x:e.clientX,y:e.clientY};sx0=e.clientX;var k=Object.keys(pts);if(k.length===2)pd=dd(pts[k[0]],pts[k[1]])});
  st.addEventListener('pointermove',function(e){var p=pts[e.pointerId];if(!p)return;var k=Object.keys(pts);
   if(k.length===2){pts[e.pointerId]={x:e.clientX,y:e.clientY};var nd=dd(pts[k[0]],pts[k[1]]);if(pd>0)zset(z*nd/pd);pd=nd;return}
   var dx=e.clientX-p.x,dy=e.clientY-p.y;pts[e.pointerId]={x:e.clientX,y:e.clientY};if(z>1.02){tx+=dx;ty+=dy;zapply()}});
  ['pointerup','pointercancel'].forEach(function(ev){st.addEventListener(ev,function(e){var n=Object.keys(pts).length;if(ev==='pointerup'&&n===1&&z<=1.02){var d=e.clientX-sx0;if(Math.abs(d)>50)show(cur+(d<0?1:-1))}delete pts[e.pointerId];pd=0})});
  st.addEventListener('dblclick',function(){zset(z>1.1?1:2.5)});
  st.addEventListener('wheel',function(e){e.preventDefault();zset(z*(e.deltaY<0?1.15:0.87))},{passive:false});
 }
 var prev=el('button',{class:'btn btn--ghost btn--sm',type:'button',text:'▶',onclick:function(){show(cur-1)},'aria-label':'قبلی'}),nxt=el('button',{class:'btn btn--ghost btn--sm',type:'button',text:'◀',onclick:function(){show(cur+1)},'aria-label':'بعدی'});
 var go=pick?el('button',{class:'btn btn--primary',type:'button',text:'این لباس را انتخاب کن و خودت را در آن ببین'}):null;if(go)go.addEventListener('click',function(){closeSheet();pick()});
 var dstage=el('div',{class:'dress-stage',dir:'ltr'},[big]);bind(dstage);
 var dx=el('button',{class:'zoomx',type:'button','aria-label':'باز کردن تمام‌صفحه',html:EXPAND_ICO,style:'bottom:10px;inset-inline-end:10px'});dx.addEventListener('pointerdown',function(e){e.stopPropagation()});dx.addEventListener('click',function(){openViewer(imgs.map(function(id,i){return {src:media(id),name:NM[i]||String(i+1)}}),cur,{title:p.title})});dstage.append(dx);
 var zin=el('button',{class:'btn btn--ghost btn--sm',type:'button',text:'＋ زوم',onclick:function(){zset(z*1.5)}}),zout=el('button',{class:'btn btn--ghost btn--sm',type:'button',text:'－ زوم',onclick:function(){zset(z/1.5)}});
 panel.append(dstage,el('div',{class:'spin__row'},[nxt,prev,zout,zin]),h('p','دوبار لمس یا دو انگشتی بزن تا جزئیات را بزرگ ببینی.','spin__tip'),thumbs,h('p',[p.stylist?'کار '+p.stylist:'',p.category||''].filter(Boolean).join(' · '),'spin__tip'));if(go)panel.append(go);openSheet(panel);
}
function openSheet(node){
 var d=$('#sheet');
 d.replaceChildren(node);
 if(!d.open)d.showModal();
}
function closeSheet(){var d=$('#sheet');if(d&&d.open)d.close()}
/* ---------- full-screen viewer: pinch, double-tap, drag, wheel / ctrl+wheel, keys; no libraries ---------- */
// items: [{src,name,crop:{i,n}?}]. crop shows tile i of n side-by-side tiles of one image (the angles).
function openViewer(items,start,opts){
 opts=opts||{};
 var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches,opener=document.activeElement;
 var d=document.createElement('dialog');d.className='viewer';d.setAttribute('aria-label',opts.title||'نمای بزرگ');
 var stage=el('div',{class:'viewer__stage',dir:'ltr'}),box=el('div',{class:'viewer__item'}),img=el('img',{alt:opts.title||'',decoding:'async',draggable:'false'});
 box.append(img);stage.append(box);
 var title=el('div',{class:'viewer__title',text:opts.title||''});
 var close=el('button',{class:'viewer__x',type:'button','aria-label':'بستن',text:'×'});
 var zin=el('button',{class:'viewer__btn',type:'button','aria-label':'بزرگ‌تر',text:'＋'}),zout=el('button',{class:'viewer__btn',type:'button','aria-label':'کوچک‌تر',text:'－'}),zrs=el('button',{class:'viewer__btn',type:'button','aria-label':'اندازهٔ اصلی',text:'۱:۱'});
 var bar=el('div',{class:'viewer__bar',dir:'rtl'},[close,title,zout,zin,zrs]);
 var tabs=el('div',{class:'viewer__tabs',role:'group','aria-label':'نماها'});
 var foot=el('div',{class:'viewer__foot',dir:'rtl'},[items.length>1?tabs:null,el('div',{class:'viewer__hint',text:'با دو انگشت یا دوبار لمس بزرگ کن؛ با یک انگشت جابه‌جا کن'})]);
 d.append(stage,bar,foot);
 var cur=0,Z=1,TX=0,TY=0,fw=0,fh=0,W=0,H=0,nat=1,maxZ=6,pts={},pinch=null,pan=null,lastTap={t:0,x:0,y:0},swipe=null,touchAt=-9999;
 function tr(anim){box.style.transition=(anim&&!RM)?'transform .22s cubic-bezier(.2,.7,.2,1)':'none'}
 function clampPan(){var mx=Math.max(0,(fw*Z-W)/2),my=Math.max(0,(fh*Z-H)/2);TX=Math.max(-mx,Math.min(mx,TX));TY=Math.max(-my,Math.min(my,TY));if(mx===0)TX=0;if(my===0)TY=0}
 function apply(anim){clampPan();tr(anim);box.style.transform='translate('+(W/2-fw/2+TX)+'px,'+(H/2-fh/2+TY)+'px) scale('+Z+')';box.dataset.z=Z.toFixed(3);stage.classList.toggle('is-zoomed',Z>1.01);zrs.textContent=Z>1.01?'۱:۱':'۱:۱';zrs.disabled=Z<=1.01;zout.disabled=Z<=1.01;zin.disabled=Z>=maxZ-.01}
 function layout(){
  W=stage.clientWidth;H=stage.clientHeight;
  var iw=img.naturalWidth||1,ih=img.naturalHeight||1,c=items[cur].crop,tw=c?iw/c.n:iw,ar=tw/ih;
  fw=Math.min(W,H*ar);fh=fw/ar;box.style.width=fw+'px';box.style.height=fh+'px';
  if(c){img.style.width=(c.n*100)+'%';img.style.left=(-c.i*100)+'%'}else{img.style.width='100%';img.style.left='0'}
  maxZ=Math.max(4,Math.min(10,tw/Math.max(1,fw)*2));apply(false);
 }
 function zoomAt(nz,cx,cy,anim){
  nz=Math.max(1,Math.min(maxZ,nz));if(nz<1.02)nz=1;
  var r=stage.getBoundingClientRect(),px=(cx==null?r.left+r.width/2:cx)-(r.left+r.width/2),py=(cy==null?r.top+r.height/2:cy)-(r.top+r.height/2),k=nz/Z;
  TX=px-(px-TX)*k;TY=py-(py-TY)*k;Z=nz;if(Z===1){TX=0;TY=0}apply(anim);
 }
 function show(i){
  cur=(i+items.length)%items.length;Z=1;TX=0;TY=0;var it=items[cur];
  img.onload=layout;img.src=it.src;img.alt=it.name||opts.title||'';title.textContent=(opts.title||'')+(it.name&&items.length>1?' · '+it.name:'');
  box.classList.toggle('viewer__item--crop',!!it.crop);
  Array.prototype.forEach.call(tabs.children,function(b,k){b.setAttribute('aria-pressed',k===cur?'true':'false')});
  if(img.complete&&img.naturalWidth)layout();
 }
 items.forEach(function(it,i){var b=el('button',{class:'viewer__tab',type:'button',text:it.name||String(i+1),'aria-pressed':'false'});b.addEventListener('click',function(){show(i)});tabs.append(b)});
 function dist(){var k=Object.keys(pts);return Math.hypot(pts[k[0]].x-pts[k[1]].x,pts[k[0]].y-pts[k[1]].y)}
 function mid(){var k=Object.keys(pts);return {x:(pts[k[0]].x+pts[k[1]].x)/2,y:(pts[k[0]].y+pts[k[1]].y)/2}}
 stage.addEventListener('pointerdown',function(e){
  if(e.button>0)return;try{stage.setPointerCapture(e.pointerId)}catch(x){}
  pts[e.pointerId]={x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY,t:performance.now()};
  var n=Object.keys(pts).length;
  if(n===2){var m=mid();pinch={d:dist(),z:Z,mx:m.x,my:m.y};pan=null;swipe=null}
  else if(n===1){pan={x:e.clientX,y:e.clientY,tx:TX,ty:TY};swipe=Z<=1.01?{x:e.clientX}:null;stage.classList.add('is-pan')}
 });
 stage.addEventListener('pointermove',function(e){
  var p=pts[e.pointerId];if(!p)return;p.x=e.clientX;p.y=e.clientY;
  if(pinch&&Object.keys(pts).length>=2){var m=mid(),nz=Math.max(1,Math.min(maxZ,pinch.z*dist()/pinch.d));TX+=m.x-pinch.mx;TY+=m.y-pinch.my;pinch.mx=m.x;pinch.my=m.y;
   var r=stage.getBoundingClientRect(),px=m.x-(r.left+r.width/2),py=m.y-(r.top+r.height/2),k=nz/Z;TX=px-(px-TX)*k;TY=py-(py-TY)*k;Z=nz;apply(false);return}
  if(pan&&Z>1.01){TX=pan.tx+(e.clientX-pan.x);TY=pan.ty+(e.clientY-pan.y);apply(false)}
 });
 function up(e){
  var p=pts[e.pointerId];if(!p)return;delete pts[e.pointerId];var left=Object.keys(pts).length;stage.classList.remove('is-pan');
  if(pinch){if(left<2)pinch=null;if(Z<1.02){Z=1;TX=0;TY=0;apply(true)}if(left===1){var k=Object.keys(pts)[0];pan={x:pts[k].x,y:pts[k].y,tx:TX,ty:TY}}return}
  var moved=Math.hypot(e.clientX-p.x0,e.clientY-p.y0),now=performance.now();
  if(swipe&&e.type==='pointerup'&&items.length>1&&Math.abs(e.clientX-swipe.x)>70&&Math.abs(e.clientY-p.y0)<80&&Z<=1.01){show(cur+(e.clientX<swipe.x?1:-1));swipe=null;pan=null;return}
  if(e.pointerType!=='mouse')touchAt=now;
  if(e.type==='pointerup'&&moved<10&&e.pointerType!=='mouse'){
   if(now-lastTap.t<320&&Math.hypot(e.clientX-lastTap.x,e.clientY-lastTap.y)<40){zoomAt(Z>1.05?1:Math.min(maxZ,2.5),e.clientX,e.clientY,true);lastTap.t=0}
   else lastTap={t:now,x:e.clientX,y:e.clientY};
  }
  pan=null;swipe=null;
 }
 stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',up);
 stage.addEventListener('dblclick',function(e){if(performance.now()-touchAt<800)return;zoomAt(Z>1.05?1:Math.min(maxZ,2.5),e.clientX,e.clientY,true)});
 stage.addEventListener('wheel',function(e){e.preventDefault();var f=Math.exp(-e.deltaY*(e.ctrlKey?.012:.0028));zoomAt(Z*f,e.clientX,e.clientY,false)},{passive:false});
 zin.addEventListener('click',function(){zoomAt(Z*1.6,null,null,true)});zout.addEventListener('click',function(){zoomAt(Z/1.6,null,null,true)});zrs.addEventListener('click',function(){zoomAt(1,null,null,true)});
 function closeIt(){if(d.open)d.close()}
 close.addEventListener('click',closeIt);
 d.addEventListener('close',function(){window.removeEventListener('resize',onResize);d.remove();if(opener&&opener.focus&&opener.isConnected)try{opener.focus()}catch(x){}});
 d.addEventListener('cancel',function(){});
 d.addEventListener('keydown',function(e){
  if(e.key==='Tab'){var f=Array.prototype.filter.call(d.querySelectorAll('button:not([disabled])'),function(b){return b.offsetParent!==null});if(!f.length)return;var a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}else if(!d.contains(document.activeElement)){e.preventDefault();a.focus()}return}
  if(e.key==='+'||e.key==='='){zoomAt(Z*1.4,null,null,true)}else if(e.key==='-'){zoomAt(Z/1.4,null,null,true)}else if(e.key==='0'){zoomAt(1,null,null,true)}
  else if(e.key==='ArrowLeft'||e.key==='ArrowRight'){if(Z>1.01){TX+=e.key==='ArrowLeft'?80:-80;apply(true)}else if(items.length>1){show(cur+(e.key==='ArrowLeft'?1:-1))}}
  else if(e.key==='ArrowUp'||e.key==='ArrowDown'){if(Z>1.01){TY+=e.key==='ArrowUp'?80:-80;apply(true)}}
 });
 function onResize(){layout()}
 window.addEventListener('resize',onResize);
 document.body.append(d);d.showModal();close.focus();show(start||0);
 return d;
}

document.addEventListener('click',function(e){
 if(e.target&&e.target.classList&&e.target.classList.contains('sheet'))closeSheet();
});
if(KIOSK)kioskBoot();else if(DESK&&!/[?&]c=/.test(location.search))welcomeFlow({});
`;

export const customerHTML=String.raw`<!doctype html><html lang="fa" dir="rtl"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#e8edeb">
<meta name="color-scheme" content="light">
<meta name="description" content="لباس عروس را روی عکس تمام‌قد خودت ببین؛ سایز و فرم بدنت همان می‌ماند. بعد برای مزون بفرست.">
<meta property="og:title" content="مزون آینه | لباس عروس را روی اندام خودت ببین">
<meta property="og:description" content="لباس عروس را انتخاب کن، عکس تمام‌قدت را اضافه کن و نتیجه را برای بررسی به مزون بفرست.">
<meta property="og:type" content="website">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/manifest.webmanifest">
<link rel="preload" href="/fonts/vazirmatn-arabic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/estedad-arabic.woff2" as="font" type="font/woff2" crossorigin>
<title>مزون آینه | لباس عروس را روی اندام خودت ببین</title>
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
 <footer class="foot" id="foot" style="padding-bottom:130px"></footer>
</main>
<div class="dock" id="dock" hidden></div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
<dialog class="sheet" id="sheet" aria-label="پنجره"></dialog>
<script>__JS__</script>
</body></html>`
 .replace('__CSS__',()=>baseCSS+customerCSS)
 .replace('__JS__',()=>clientJS.replace('/*__QR__*/',()=>QR_JS).replace('/*__CHECK__*/',()=>PHOTO_CHECK_JS).replace('/*__SCENE__*/',()=>SCENE_JS).replace('__LINES__',()=>LINES_JSON).replace('__MARK__',()=>JSON.stringify(markSVG)).replace('__ILLO__',()=>JSON.stringify(illos)).replace('__MZD__',()=>JSON.stringify(MZ_D)));
