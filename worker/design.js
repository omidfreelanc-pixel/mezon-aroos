// Shared design system for every Ayneh page (customer page, salon panel, 404).
// Concept: آینه = mirror. Photos live inside an arched salon mirror; everything
// around them stays quiet: cool mirror-glass background, espresso ink, one
// Persian-turquoise action colour. Estedad (a Persian-designed face) for names
// and headings, Vazirmatn for everything else.

export const fontFaces=String.raw`
@font-face{font-family:"Vazirmatn";font-style:normal;font-weight:100 900;font-display:swap;src:url(/fonts/vazirmatn-arabic.woff2) format("woff2");unicode-range:U+0600-06FF,U+0750-077F,U+08A0-08FF,U+200C-200F,U+2010-2011,U+204F,U+FB50-FDFF,U+FE70-FEFC}
@font-face{font-family:"Vazirmatn";font-style:normal;font-weight:100 900;font-display:swap;src:url(/fonts/vazirmatn-latin.woff2) format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-200B,U+2012-206F,U+20AC,U+2122,U+2212}
@font-face{font-family:"Estedad";font-style:normal;font-weight:100 900;font-display:swap;src:url(/fonts/estedad-arabic.woff2) format("woff2");unicode-range:U+0600-06FF,U+0750-077F,U+08A0-08FF,U+200C-200F,U+FB50-FDFF,U+FE70-FEFC}
`;

export const baseCSS=fontFaces+String.raw`
:root{
 --glass:#e8edeb;--glass-2:#dde5e2;--surface:#fafbfa;--surface-2:#f2f5f4;
 --ink:#23170f;--ink-2:#4b3d33;--muted:#5f6763;--line:#cdd6d2;--line-2:#e0e6e3;
 --accent:#0c6b6b;--accent-ink:#074c4d;--accent-soft:#d3e9e6;--accent-ring:rgba(12,107,107,.28);
 --honey:#b9822e;--honey-soft:#f4e6cc;
 --ok:#2b6a40;--ok-soft:#dcefe1;--warn:#82560f;--warn-soft:#f6e8cc;--danger:#9b2c3a;--danger-soft:#f7e1e3;
 --r-lg:26px;--r:18px;--r-sm:12px;--pill:999px;
 --arch:999px 999px var(--r) var(--r);
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

/* --- the mirror: arched frame used for every photo --- */
.mirror{position:relative;padding:7px;background:var(--surface);border-radius:var(--arch);box-shadow:var(--lift);isolation:isolate}
.mirror__glass{position:relative;overflow:hidden;border-radius:999px 999px calc(var(--r) - 5px) calc(var(--r) - 5px);background:linear-gradient(170deg,#f4f7f6,#d6dfdb)}
.mirror__glass>img{width:100%;height:100%;object-fit:cover}
.mirror__glass::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(118deg,transparent 38%,rgba(255,255,255,.26) 46%,transparent 54%),linear-gradient(180deg,rgba(255,255,255,.18),transparent 30%);mix-blend-mode:screen}

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
.btn--sm{min-height:40px;padding:0 14px;font-size:13px;border-radius:12px}
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
.sheet__x{width:40px;height:40px;border:0;border-radius:50%;background:var(--glass);font-size:22px;line-height:1;color:var(--ink-2);flex:none}
.sheet__x:hover{background:var(--glass-2)}

.toast{position:fixed;inset-inline:16px;bottom:calc(var(--safe-b) + 100px);z-index:95;margin:auto;max-width:520px;background:var(--ink);color:#fff;padding:14px 18px;border-radius:16px;font-size:14px;box-shadow:var(--float);opacity:0;transform:translateY(12px);pointer-events:none;transition:opacity .2s var(--ease),transform .2s var(--ease)}
.toast.is-on{opacity:1;transform:none}
.toast.is-error{background:#6e1f2b}

@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{animation-duration:.001ms!important;transition-duration:.001ms!important}}
`;

// Brand mark: an arched mirror with a single strand of hair across the glass.
export const markSVG='<svg viewBox="0 0 32 40" fill="none" aria-hidden="true"><path d="M4 38V16a12 12 0 0 1 24 0v22z" fill="#0c6b6b"/><path d="M8 34V16.5a8 8 0 0 1 16 0V34z" fill="#e8edeb"/><path d="M11 33c3-6 1-11 5-17s6-3 7-1" stroke="#23170f" stroke-width="1.8" stroke-linecap="round"/></svg>';
export const favicon='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40"><path d="M4 38V16a12 12 0 0 1 24 0v22z" fill="#0c6b6b"/><path d="M8 34V16.5a8 8 0 0 1 16 0V34z" fill="#e8edeb"/><path d="M11 33c3-6 1-11 5-17s6-3 7-1" stroke="#23170f" stroke-width="1.8" stroke-linecap="round" fill="none"/></svg>';
