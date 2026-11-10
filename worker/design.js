// Shared design system for every Mezon Aroos page (customer page, boutique panel, 404).
// Concept: آینه = mirror. Photos live inside an arched fitting mirror; everything
// around them stays quiet: cool mirror-glass background, espresso ink, one
// Persian-turquoise action colour. Estedad (a Persian-designed face) for names
// and headings, Vazirmatn for everything else.

export const fontFaces=String.raw`
@font-face{font-family:"Vazirmatn";font-style:normal;font-weight:100 900;font-display:swap;src:url(/fonts/vazirmatn-arabic.woff2) format("woff2");unicode-range:U+0600-06FF,U+0750-077F,U+08A0-08FF,U+200C-200F,U+2010-2011,U+204F,U+FB50-FDFF,U+FE70-FEFC}
@font-face{font-family:"Vazirmatn";font-style:normal;font-weight:100 900;font-display:swap;src:url(/fonts/vazirmatn-latin.woff2) format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-200B,U+2012-206F,U+20AC,U+2122,U+2212}
@font-face{font-family:"Estedad";font-style:normal;font-weight:100 900;font-display:swap;src:url(/fonts/estedad-arabic.woff2) format("woff2");unicode-range:U+0600-06FF,U+0750-077F,U+08A0-08FF,U+200C-200F,U+FB50-FDFF,U+FE70-FEFC}
`;

// Antique gilded mirror: one silhouette (pointed ogee crown + mirrored ogee base, rounded shoulders)
// used as mask for the photo and as the outline of three stacked gold layers (outer facet, inner
// facet, soft inner shadow + hairline). Strokes are non-scaling so the gold stays the same
// thickness (~11px) at any frame size; the path itself stretches with the box.
export const MZ_D="M50 0C47.67 1.08 38.84 2.96 32.79 5.11C30 6.19 28.6 6.99 28.6 8.34C28.6 9.01 25.81 8.87 22.09 9.41C16.98 10.08 14.19 11.56 14.19 13.45C14.19 14.25 11.4 14.12 8.14 15.33C3.49 17.21 0 19.36 0 24.74V75.26C0 80.64 3.49 82.79 8.14 84.67C11.4 85.88 14.19 85.75 14.19 86.55C14.19 88.44 16.98 89.92 22.09 90.59C25.81 91.13 28.6 90.99 28.6 91.66C28.6 93.01 30 93.81 32.79 94.89C38.84 97.04 47.67 98.92 50 100C52.33 98.92 61.16 97.04 67.21 94.89C70 93.81 71.4 93.01 71.4 91.66C71.4 90.99 74.19 91.13 77.91 90.59C83.02 89.92 85.81 88.44 85.81 86.55C85.81 85.75 88.6 85.88 91.86 84.67C96.51 82.79 100 80.64 100 75.26V24.74C100 19.36 96.51 17.21 91.86 15.33C88.6 14.12 85.81 14.25 85.81 13.45C85.81 11.56 83.02 10.08 77.91 9.41C74.19 8.87 71.4 9.01 71.4 8.34C71.4 6.99 70 6.19 67.21 5.11C61.16 2.96 52.33 1.08 50 0Z";
const uri=svg=>'url("data:image/svg+xml,'+encodeURIComponent(svg).replace(/'/g,'%27').replace(/"/g,'%22')+'")';
const svgOpen="<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'>";
const ns="vector-effect='non-scaling-stroke'";
const stops=a=>a.map(([o,c,op])=>"<stop offset='"+o+"' stop-color='"+c+"'"+(op==null?'':" stop-opacity='"+op+"'")+"/>").join('');
const lg=(id,x1,y1,x2,y2,a)=>"<linearGradient id='"+id+"' x1='"+x1+"' y1='"+y1+"' x2='"+x2+"' y2='"+y2+"'>"+stops(a)+"</linearGradient>";
const MZ={
 shape:uri(svgOpen+"<path d='"+MZ_D+"'/></svg>"),
 bevel:uri(svgOpen+"<defs>"+lg('m',0,0,1,1,[[0,'#F4E8C6'],[.1,'#C6A462'],[.2,'#FFF8DE'],[.3,'#A68150'],[.42,'#F2E3B6'],[.55,'#8D6A38'],[.66,'#F8EECB'],[.78,'#B18C55'],[.9,'#F0E0B3'],[1,'#98763F']])+lg('h',0,0,1,1,[[0,'#FFFFFF',.95],[.35,'#FFF4D2',.55],[.7,'#7A5A22',.25],[1,'#5E4318',.5]])+"</defs><path d='"+MZ_D+"' fill='url(#m)'/><path d='"+MZ_D+"' fill='none' stroke='url(#h)' stroke-width='9' "+ns+"/><path d='"+MZ_D+"' fill='none' stroke='#86693A' stroke-opacity='.8' stroke-width='2' "+ns+"/></svg>"),
 hair:uri(svgOpen+"<defs>"+lg('i',1,1,0,0,[[0,'#FFFAE8'],[.3,'#DCC38C'],[.62,'#A9885A'],[1,'#765828']])+"</defs><path d='"+MZ_D+"' fill='none' stroke='url(#i)' stroke-width='10' "+ns+"/><path d='"+MZ_D+"' fill='none' stroke='#FFF4CF' stroke-opacity='.7' stroke-width='1.4' "+ns+"/></svg>"),
 hairOn:uri(svgOpen+"<path d='"+MZ_D+"' fill='none' stroke='#0F4C4A' stroke-opacity='.88' stroke-width='10' "+ns+"/></svg>"),
 inner:uri(svgOpen+"<defs><filter id='b' x='-10%' y='-10%' width='120%' height='120%'><feGaussianBlur stdDeviation='1.1'/></filter></defs><path d='"+MZ_D+"' fill='none' stroke='#2E2008' stroke-opacity='.17' stroke-width='14' "+ns+" filter='url(#b)'/><path d='"+MZ_D+"' fill='none' stroke='#F5E7BF' stroke-width='2' stroke-opacity='.95' "+ns+"/><path d='"+MZ_D+"' fill='none' stroke='#8A6527' stroke-width='1' stroke-opacity='.5' "+ns+"/></svg>")
};

export const baseCSS=fontFaces+String.raw`
:root{
 --glass:#e8edeb;--glass-2:#dde5e2;--surface:#fafbfa;--surface-2:#f2f5f4;
 --ink:#23170f;--ink-2:#4b3d33;--muted:#5f6763;--line:#cdd6d2;--line-2:#e0e6e3;
 --accent:#0c6b6b;--accent-ink:#074c4d;--accent-soft:#d3e9e6;--accent-ring:rgba(12,107,107,.28);
 --honey:#b9822e;--honey-soft:#f4e6cc;
 --ok:#2b6a40;--ok-soft:#dcefe1;--warn:#82560f;--warn-soft:#f6e8cc;--danger:#9b2c3a;--danger-soft:#f7e1e3;
 --r-lg:26px;--r:18px;--r-sm:12px;--pill:999px;
 --arch:999px 999px var(--r) var(--r);
 --mz-gold:linear-gradient(135deg,#C9A96A,#E8D9B0 45%,#C9A96A);--mz-ivory:#F7F3EC;--mz-emerald:#0F4C4A;
 --mz-shape:${MZ.shape};
 --mz-bevel:${MZ.bevel};
 --mz-hair:${MZ.hair};
 --mz-hair-on:${MZ.hairOn};
 --mz-inner:${MZ.inner};

 --lift:0 1px 0 rgba(255,255,255,.7) inset,0 18px 40px -26px rgba(35,23,15,.45);
 --float:0 30px 70px -30px rgba(35,23,15,.55);
 --ease:cubic-bezier(.2,.7,.2,1);--tap:48px;
 --display:"Estedad","Vazirmatn",system-ui,sans-serif;
 --text:"Vazirmatn",system-ui,-apple-system,"Segoe UI",Tahoma,sans-serif;
 --safe-b:env(safe-area-inset-bottom,0px);
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth;scroll-padding-top:88px}
body{margin:0;background:var(--glass);color:var(--ink);font:400 15px/1.8 var(--text);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;overflow-x:hidden}
h1,h2,h3,h4{margin:0;line-height:1.3;font-weight:700}
.display{font-family:var(--display);font-weight:800;letter-spacing:0}
p{margin:0}
button,input,select,textarea{font:inherit;color:inherit}
button{cursor:pointer}
a{color:var(--accent-ink);text-decoration:none}
img{display:block;max-width:100%}
:focus-visible{outline:3px solid var(--accent-ring);outline-offset:2px;border-radius:10px}
::selection{background:var(--accent-soft)}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.skip{position:absolute;inset-inline-start:-999px;top:8px;z-index:90;background:var(--surface);padding:10px 16px;border-radius:12px}
.skip:focus{inset-inline-start:8px}
.wrap{width:100%;max-width:1160px;margin:0 auto;padding:0 18px}
.grow{flex:1;min-width:0}
.muted{color:var(--muted)}
.tiny{font-size:12.5px;line-height:1.85}

/* --- the mirror: antique-mirror frame (ogee crown, double champagne-gold bevel) used for every photo --- */
.mirror{--mz-pad:11px;position:relative;padding:var(--mz-pad);isolation:isolate;filter:drop-shadow(0 20px 18px rgba(35,23,15,.17)) drop-shadow(0 2px 2px rgba(35,23,15,.12)) drop-shadow(0 0 20px rgba(255,247,226,.7))}
/* A mirror whose contents animate (the waiting scene, the before/after slider, the angle viewer) must not carry the drop-shadow filter:
   it would be redrawn on every frame. Its shadow sits on a static twin behind it instead (.mirror-shd). */
.mirror.nofx{filter:none}
.mirror-shd{position:absolute;inset:0;pointer-events:none;z-index:0}
.mirror-shd .mirror__glass{height:100%;aspect-ratio:auto}
.mirror::before,.mirror::after{content:"";position:absolute;pointer-events:none;background-size:100% 100%;background-repeat:no-repeat;-webkit-mask:var(--mz-shape) 0 0/100% 100% no-repeat;mask:var(--mz-shape) 0 0/100% 100% no-repeat}
.mirror::before{inset:0;z-index:-1;background-image:var(--mz-bevel)}
.mirror::after{inset:calc(var(--mz-pad) - 5px);z-index:2;background-image:var(--mz-hair)}
.mirror>*{-webkit-mask:var(--mz-shape) 0 0/100% 100% no-repeat;mask:var(--mz-shape) 0 0/100% 100% no-repeat}
.mirror__glass{position:relative;overflow:hidden;background:linear-gradient(172deg,#FBF8F2,#EEE8DB)}
.mirror__glass>img{width:100%;height:100%;object-fit:cover}
.mirror__glass::after{content:"";position:absolute;inset:0;pointer-events:none;background:var(--mz-inner) 0 0/100% 100% no-repeat,linear-gradient(118deg,transparent 40%,rgba(255,255,255,.14) 48%,transparent 56%)}
.mz-shape{-webkit-mask:var(--mz-shape) 0 0/100% 100% no-repeat;mask:var(--mz-shape) 0 0/100% 100% no-repeat;border-radius:0}
.mz-mini{display:block;padding:3px;border:0;background:linear-gradient(135deg,#F6E6B0,#C79F4E 38%,#FFF3CB 52%,#A47C35 78%,#E3C879);-webkit-mask:var(--mz-shape) 0 0/100% 100% no-repeat;mask:var(--mz-shape) 0 0/100% 100% no-repeat;overflow:hidden}
.mz-mini>*{display:block;width:100%;height:100%;object-fit:cover;-webkit-mask:var(--mz-shape) 0 0/100% 100% no-repeat;mask:var(--mz-shape) 0 0/100% 100% no-repeat;background-color:#EEE8DB}

/* --- buttons --- */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:var(--tap);padding:0 20px;border:1px solid transparent;border-radius:14px;background:var(--surface);color:var(--ink);font-weight:600;font-size:14.5px;white-space:nowrap;text-decoration:none;transition:transform .14s var(--ease),background-color .14s var(--ease),border-color .14s var(--ease),box-shadow .14s var(--ease)}
.btn svg{width:19px;height:19px;flex:none}
.btn:active{transform:translateY(1px)}
.btn--primary{background:var(--accent);color:#fff;box-shadow:0 1px 0 rgba(255,255,255,.18) inset,0 10px 24px -14px rgba(7,76,77,.9)}
.btn--primary:hover{background:var(--accent-ink)}
.btn--ink{background:var(--ink);color:#fff}
.btn--ink:hover{background:#3a2a1f}
.btn--soft{background:var(--accent-soft);color:var(--accent-ink)}
.btn--soft:hover{background:#c3e0dc}
.btn--ghost{border-color:var(--line);background:transparent;color:var(--ink-2)}
.btn--ghost:hover{background:var(--surface);border-color:#b9c5c0}
.btn--danger{background:transparent;color:var(--danger);border-color:#e6c3c8}
.btn--danger:hover{background:var(--danger-soft)}
.btn--block{width:100%}
.btn--sm{min-height:44px;padding:0 14px;font-size:13px;border-radius:12px}
.btn[disabled]{opacity:.45;cursor:not-allowed;transform:none;box-shadow:none}

.panel{background:var(--surface);border-radius:var(--r-lg);box-shadow:var(--lift)}
.row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.chip{display:inline-flex;align-items:center;gap:6px;min-height:38px;padding:0 15px;border-radius:var(--pill);border:1px solid var(--line);background:transparent;color:var(--ink-2);font-size:13.5px;font-weight:600;transition:background-color .14s var(--ease),border-color .14s var(--ease),color .14s var(--ease)}
.chip:hover{border-color:#b3c0bb;background:var(--surface)}
.chip[aria-pressed="true"],.chip.is-on{background:var(--ink);border-color:var(--ink);color:#fff}
.badge{display:inline-flex;align-items:center;gap:6px;padding:3px 11px;border-radius:var(--pill);background:var(--glass-2);color:var(--ink-2);font-size:12px;font-weight:600;white-space:nowrap}
.badge::before{content:"";width:7px;height:7px;border-radius:50%;background:currentColor;opacity:.7}
.badge--accent{background:var(--accent-soft);color:var(--accent-ink)}
.badge--ok{background:var(--ok-soft);color:var(--ok)}
.badge--warn{background:var(--warn-soft);color:var(--warn)}
.badge--danger{background:var(--danger-soft);color:var(--danger)}

/* --- forms --- */
.field{display:block;margin-bottom:16px}
.field>span.lbl,.lbl{display:block;font-size:13px;font-weight:600;color:var(--ink-2);margin-bottom:7px}
.field input,.field select,.field textarea{display:block;width:100%;min-height:var(--tap);padding:11px 14px;border:1px solid var(--line);border-radius:var(--r-sm);background:#fff;color:var(--ink);transition:border-color .14s var(--ease),box-shadow .14s var(--ease)}
.field textarea{min-height:92px;resize:vertical;line-height:1.8}
.field input:focus,.field select:focus,.field textarea:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 4px var(--accent-ring)}
.field .hint{display:block;font-size:12px;color:var(--muted);margin-top:6px;line-height:1.7}
.field .err{display:none;font-size:12.5px;color:var(--danger);margin-top:6px;font-weight:600}
.field[data-invalid="true"] input,.field[data-invalid="true"] select,.field[data-invalid="true"] textarea{border-color:#d58f99;background:#fff8f8}
.field[data-invalid="true"] .err{display:block}
.check{display:flex;gap:11px;align-items:flex-start;font-size:13.5px;line-height:1.7;color:var(--ink-2);margin:12px 0;cursor:pointer}
.check input{width:20px;height:20px;margin:2px 0 0;flex:none;accent-color:var(--accent)}

.notice{border-radius:var(--r-sm);padding:12px 14px;font-size:13px;line-height:1.85;display:flex;gap:10px;align-items:flex-start;background:var(--surface-2);color:var(--ink-2);border-inline-start:3px solid var(--line)}
.notice svg{width:18px;height:18px;flex:none;margin-top:2px}
.notice--info{border-color:var(--accent);background:#e9f3f1;color:#21494a}
.notice--warn{border-color:var(--honey);background:#f8efdd;color:#674511}
.notice--danger{border-color:var(--danger);background:#f8e8ea;color:#7c2230}
.notice--ok{border-color:var(--ok);background:#e5f2e8;color:#1f4f30}

.skel{border-radius:12px;background:linear-gradient(90deg,var(--line-2) 25%,#eef2f0 37%,var(--line-2) 63%);background-size:400% 100%;animation:sk 1.4s ease infinite}
@keyframes sk{0%{background-position:100% 50%}100%{background-position:0 50%}}

/* --- dialogs: bottom sheet on phones, centred on wide screens --- */
.sheet{border:0;padding:0;background:transparent;max-width:600px;width:100%;margin:auto auto 0;color:var(--ink);max-height:none}
.sheet::backdrop{background:rgba(35,23,15,.42);backdrop-filter:blur(4px)}
.sheet[open]{animation:sheetIn .26s var(--ease)}
@keyframes sheetIn{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}
.sheet__panel{background:var(--surface);border-radius:var(--r-lg) var(--r-lg) 0 0;padding:22px 20px calc(22px + var(--safe-b));max-height:90vh;overflow:auto;box-shadow:var(--float)}
.sheet__panel::before{content:"";display:block;width:44px;height:5px;border-radius:9px;background:var(--line);margin:-8px auto 14px}
@media(min-width:700px){.sheet{margin:auto}.sheet__panel{border-radius:var(--r-lg);padding:26px}.sheet__panel::before{display:none}}
.sheet__head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
.sheet__head h2{font-family:var(--display);font-weight:800;font-size:22px}
.sheet__x{width:44px;height:44px;display:grid;place-items:center;border:0;border-radius:50%;background:var(--glass);font-size:22px;line-height:1;color:var(--ink-2);flex:none}
.sheet__x:hover{background:var(--glass-2)}

.toast{position:fixed;inset-inline:16px;bottom:calc(var(--safe-b) + 100px);z-index:95;margin:auto;max-width:520px;background:var(--ink);color:#fff;padding:14px 18px;border-radius:16px;font-size:14px;box-shadow:var(--float);opacity:0;transform:translateY(12px);pointer-events:none;transition:opacity .2s var(--ease),transform .2s var(--ease)}
.toast.is-on{opacity:1;transform:none}
.toast.is-error{background:#6e1f2b}

/* --- empty states, loader, success --- */
.empty{display:grid;justify-items:center;gap:6px;text-align:center;padding:22px 12px 18px;color:var(--muted)}
.empty svg{width:140px;height:auto;max-width:60%;margin-bottom:6px}
.empty b{font-family:var(--display);font-weight:800;font-size:16.5px;color:var(--ink)}
.empty p{font-size:13.5px;line-height:1.9;max-width:34ch}
.draw-check{width:84px;height:84px;display:block;margin:0 auto}
.draw-check circle{fill:none;stroke:#C9A96A;stroke-width:1.5;transform-origin:center;animation:pop .45s var(--ease) both}
.draw-check path{fill:none;stroke:#C9A96A;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:50;stroke-dashoffset:50;animation:draw .5s .25s var(--ease) forwards}
@keyframes pop{from{transform:scale(.4);opacity:0}to{transform:none;opacity:1}}
@keyframes draw{to{stroke-dashoffset:0}}
.loader-illo{width:150px;height:auto;display:block;margin:0 auto}
.loader-illo .sweep{animation:sweep 2.2s ease-in-out infinite;transform-origin:center}
@keyframes sweep{0%,100%{opacity:.15;transform:translateX(-14px)}50%{opacity:.7;transform:translateX(14px)}}
@media (prefers-reduced-motion:reduce){.draw-check path{stroke-dashoffset:0}.loader-illo .sweep{animation:none;opacity:.4}}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{animation-duration:.001ms!important;transition-duration:.001ms!important}}
`;

// Brand mark: an arched fitting mirror with a small gown outline in the glass.
export const markSVG='<svg viewBox="0 0 32 40" fill="none" aria-hidden="true"><path d="M4 38V16a12 12 0 0 1 24 0v22z" fill="#0c6b6b"/><path d="M8 34V16.5a8 8 0 0 1 16 0V34z" fill="#e8edeb"/><path d="M14.5 17.5 16 14l1.5 3.5-1.2 4L21.5 33h-11l5.2-11.5z" stroke="#23170f" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/></svg>';
export const favicon='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40"><path d="M4 38V16a12 12 0 0 1 24 0v22z" fill="#0c6b6b"/><path d="M8 34V16.5a8 8 0 0 1 16 0V34z" fill="#e8edeb"/><path d="M14.5 17.5 16 14l1.5 3.5-1.2 4L21.5 33h-11l5.2-11.5z" stroke="#23170f" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" fill="none"/></svg>';

// Vector illustrations (no emoji, no raster): shared by the manager panel and customer page.
const T='#0c6b6b',G='#e8edeb',G2='#d3e9e6',I='#23170f',H='#b9822e';
const frame='<path d="M30 112V50a30 30 0 0 1 60 0v62z" fill="#fafbfa" stroke="'+T+'" stroke-width="3"/><path d="M38 108V50a22 22 0 0 1 44 0v58z" fill="'+G+'"/>';
const gown='<path d="M60 40l4 10-3 8 13 44H46l13-44-3-8z" fill="none" stroke="'+I+'" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>';
export const illos={
 dresses:'<svg viewBox="0 0 120 120" fill="none" aria-hidden="true">'+frame+'<path d="M60 54l3 7-2 6 10 36H49l10-36-2-6z" fill="'+G2+'" stroke="'+T+'" stroke-width="2.4" stroke-linejoin="round"/><path d="M96 24v10M91 29h10" stroke="'+H+'" stroke-width="3" stroke-linecap="round"/><circle cx="22" cy="40" r="3" fill="'+H+'"/></svg>',
 leads:'<svg viewBox="0 0 120 120" fill="none" aria-hidden="true"><rect x="22" y="30" width="76" height="62" rx="12" fill="#fafbfa" stroke="'+T+'" stroke-width="3"/><path d="M28 40l32 24 32-24" stroke="'+T+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M88 18c0 5-8 8-8 14 0-6-8-9-8-14a4 4 0 0 1 8-1 4 4 0 0 1 8 1z" fill="'+H+'" transform="translate(6 -6) scale(.9)"/></svg>',
 results:'<svg viewBox="0 0 120 120" fill="none" aria-hidden="true">'+frame+'<circle cx="60" cy="48" r="9" fill="'+G2+'"/><path d="M42 96l14-20 10 12 8-9 8 17z" fill="'+G2+'" stroke="'+T+'" stroke-width="2.4" stroke-linejoin="round"/><path d="M26 30l3-6 3 6 6 3-6 3-3 6-3-6-6-3z" fill="'+H+'"/></svg>',
 loader:'<svg class="loader-illo" viewBox="0 0 120 120" fill="none" aria-hidden="true">'+frame+gown+'<rect class="sweep" x="50" y="22" width="14" height="84" rx="7" fill="#fff"/></svg>',
 success:'<svg class="draw-check" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="38"/><path d="M26 43l11 11 21-23"/></svg>',
 offline:'<svg viewBox="0 0 120 120" fill="none" aria-hidden="true"><path d="M20 52a56 56 0 0 1 80 0M32 66a38 38 0 0 1 56 0M45 80a20 20 0 0 1 30 0" stroke="'+T+'" stroke-width="3.5" stroke-linecap="round"/><circle cx="60" cy="94" r="4.5" fill="'+T+'"/><path d="M26 22l68 80" stroke="'+H+'" stroke-width="4" stroke-linecap="round"/></svg>'
};
