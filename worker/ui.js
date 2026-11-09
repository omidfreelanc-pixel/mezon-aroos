// Owner console (/ and /admin). Salons have no panel: they use the Telegram bot.
// Only the project owner signs in here to create salons, fill in their details and hand
// each salon its one-time Telegram link.
import {baseCSS,markSVG,illos} from './design.js';
import {QR_JS} from './qr.js';

const css=String.raw`
.section-title{font-family:var(--display);font-weight:800;font-size:24px;margin:34px 0 14px}
.dash{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;margin-bottom:8px}
.dash__filters{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.seg-ctl{display:inline-flex;gap:4px;padding:4px;border-radius:14px;background:var(--glass-2)}
.seg-ctl button{min-height:38px;padding:0 14px;border:0;border-radius:10px;background:transparent;font-weight:600;font-size:13.5px;color:var(--ink-2)}
.seg-ctl button[aria-pressed=true]{background:var(--surface);color:var(--ink);box-shadow:0 1px 3px rgba(35,23,15,.12)}
.dash__filters select{min-height:46px;padding:0 14px;border:1px solid var(--line);border-radius:12px;background:#fff;min-width:180px}
.dash__body{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;transition:opacity .2s}
.dcard{min-width:0}.dtable{overflow-x:auto}
.dash__body.is-refreshing{opacity:.5}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}
.kpis--small{grid-template-columns:repeat(auto-fit,minmax(130px,1fr))}
.kpi{background:var(--surface);border:1px solid var(--line-2);border-radius:18px;padding:14px 16px;display:grid;gap:2px;align-content:start}
.kpis--small .kpi{background:var(--surface-2);padding:12px 14px}
.kpi__label{font-size:13px;color:var(--muted)}
.kpi__value{font-size:30px;font-weight:700;line-height:1.3;color:var(--ink)}
.kpis--small .kpi__value{font-size:22px}
.kpi__delta{font-size:12px;color:var(--muted)}
.kpi__delta.is-up{color:var(--ok)}.kpi__delta.is-down{color:var(--danger)}
.dgrid{display:grid;gap:16px}
@media(min-width:900px){.dgrid{grid-template-columns:1fr 1fr}}
.dcard{display:grid;gap:10px;align-content:start}
.dcard>.lead{margin-bottom:4px}
.hbars{display:grid;gap:10px}
.slug-preview{direction:ltr;text-align:right;unicode-bidi:plaintext;font-family:ui-monospace,monospace;color:var(--accent-ink)}
.setup{display:grid;gap:4px;margin-top:6px}.setup small{color:var(--muted);font-size:12px;line-height:1.7}
.setup__bar{display:block;height:6px;border-radius:3px;background:var(--line-2);overflow:hidden}.setup__bar span{display:block;height:100%;background:var(--accent);border-radius:3px}
.acts{display:grid;gap:6px;max-height:420px;overflow:auto;margin-top:6px}
.act{display:flex;gap:10px;align-items:flex-start;padding:9px 12px;border-radius:12px;background:var(--surface-2);font-size:13px;line-height:1.8}
.act small{color:var(--muted);font-size:12px}.act--warn{background:#fbf1de}.act--danger{background:#f8e3e0}.act--ok{background:#e2f1ea}
.act__ic{flex:none}
.digest{white-space:pre-wrap;font:inherit;font-size:12.5px;line-height:1.9;background:var(--surface-2);padding:12px;border-radius:12px;margin-top:10px;max-height:360px;overflow:auto}
h3.sub{font-size:15px;margin:16px 0 4px}
.team{display:grid;gap:10px;margin:12px 0}
.team__row{display:grid;grid-template-columns:1fr auto;gap:8px 12px;align-items:center;padding:12px 14px;border-radius:14px;background:var(--surface-2)}
.team__row b{font-size:14.5px}.team__row small{color:var(--muted);font-size:12px}
.team__acts{display:flex;gap:6px;flex-wrap:wrap}
.team__out{grid-column:1/-1}
.team__add{display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:end;margin-top:6px}
.team__add .field{margin:0}
@media (max-width:560px){.team__add{grid-template-columns:1fr}.team__row{grid-template-columns:1fr}}
.rtree{font-size:13.5px;max-height:520px;overflow:auto;padding:4px 2px}
.rtree ul{list-style:none;margin:0;padding-inline-start:18px;border-inline-start:1px dashed #c6d1cd}
.rtree>ul{padding-inline-start:0;border:0}
.rtree li{margin:4px 0}
.rtree details>summary{cursor:pointer;list-style:none}
.rtree details>summary::-webkit-details-marker{display:none}
.rtree .node{display:inline-flex;gap:6px;align-items:center;padding:3px 10px;border-radius:999px;background:var(--surface-2)}
.rtree .node--sent{background:#d9ece6;font-weight:700}
.rtree .node small{color:var(--muted);font-weight:400}
.rtree details>summary .node::before{content:'';width:6px;height:6px;border:solid var(--muted);border-width:0 0 2px 2px;transform:rotate(45deg);margin-inline-end:2px}
.rtree details[open]>summary .node::before{transform:rotate(-45deg)}
.tree-pick{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
.dgrid.dgrid--1{grid-template-columns:minmax(0,1fr)}
.hbar{display:grid;grid-template-columns:minmax(90px,38%) 1fr auto;gap:10px;align-items:center;font-size:13.5px;border-radius:8px;outline-offset:3px}
.hbar:hover .hbar__fill,.hbar:focus .hbar__fill{filter:brightness(1.15)}
.hbar__label{display:flex;align-items:center;gap:7px;color:var(--ink-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hbar__sw{width:12px;height:12px;border-radius:50%;flex:none;box-shadow:inset 0 0 0 1px rgba(0,0,0,.15)}
.hbar__track{height:16px;display:block}
.hbar__fill{display:block;height:100%;background:var(--accent);border-radius:4px 0 0 4px}
.hbar__fill--honey{background:var(--honey)}
.hbar__val{font-size:13px;color:var(--ink);font-variant-numeric:tabular-nums;white-space:nowrap}
.colchart{display:grid;grid-template-columns:auto 1fr;gap:8px;height:190px}
.cols__y{display:flex;flex-direction:column;justify-content:space-between;font-size:12px;color:var(--muted);padding-bottom:22px;text-align:left}
.cols__grid{display:grid;grid-template-rows:1fr auto;min-width:0}
.cols{display:flex;align-items:flex-end;gap:2px;border-bottom:1px solid var(--line);background:linear-gradient(var(--line-2),var(--line-2)) 0 0/100% 1px no-repeat,linear-gradient(var(--line-2),var(--line-2)) 0 50%/100% 1px no-repeat;direction:ltr}
.col{flex:1;height:100%;display:flex;align-items:flex-end;justify-content:center;outline-offset:1px}
.col__bar{display:block;width:100%;max-width:24px;border-radius:4px 4px 0 0}
.col__bar--muted{background:#9fb0a9}.col__bar--accent{background:var(--accent)}
.col.is-today .col__bar--muted{background:var(--ink-2)}
.col:hover .col__bar,.col:focus .col__bar{filter:brightness(1.12)}
.cols__x{display:flex;justify-content:space-between;font-size:12px;color:var(--muted);padding-top:6px;direction:ltr}
.dtip{position:fixed;left:0;top:0;z-index:200;background:var(--ink);color:#fff;padding:8px 12px;border-radius:10px;font-size:13px;pointer-events:none;box-shadow:var(--float)}
.dtip__main{font-weight:700}.dtip__sub{opacity:.75;font-size:12px}
.dtable{font-size:13px}
.dtable summary,.card details>summary{min-height:44px;display:flex;align-items:center;cursor:pointer;color:var(--accent-ink);font-weight:600;font-size:12.5px}
.dtable table,.stable table{width:100%;border-collapse:collapse;margin-top:8px}
.dtable th,.dtable td,.stable th,.stable td{padding:7px 8px;border-bottom:1px solid var(--line-2);text-align:right}
.dtable td:not(:first-child),.stable td:not(:first-child){font-variant-numeric:tabular-nums}
.stable{overflow-x:auto}.stable td a,.dtable td a{display:inline-block;min-height:44px;line-height:44px}
.stable th{font-size:12.5px;color:var(--muted);font-weight:600}
.linkbox__label{font-size:12.5px;flex:none}

.appbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 20px;max-width:1080px;margin:0 auto}
.appbar__brand{display:inline-flex;align-items:center;gap:9px;color:var(--ink);font-family:var(--display);font-weight:800;font-size:22px}
.appbar__brand svg{width:22px;height:28px}
main#app{max-width:1080px;margin:0 auto;padding:6px 20px 80px;min-height:70vh}
.page-head{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;flex-wrap:wrap;margin:10px 0 22px}
.page-head h1{font-family:var(--display);font-weight:800;font-size:clamp(26px,6vw,34px)}
.page-head p{color:var(--muted);margin-top:4px;max-width:60ch;line-height:1.9}
.back{display:inline-flex;align-items:center;gap:6px;font-size:14px;font-weight:600;margin-bottom:6px;min-height:44px}.appbar__brand{min-height:44px}
.seg-ctl button{min-height:44px;padding-inline:16px}
.grid{display:grid;gap:16px}
@media(min-width:900px){.grid--2{grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);align-items:start}}
.card{background:var(--surface);border:1px solid rgba(35,23,15,.1);border-radius:22px;padding:22px;box-shadow:0 1px 2px rgba(35,23,15,.05)}
.card>h2{font-family:var(--display);font-weight:800;font-size:21px;margin-bottom:6px}
.card>.lead{color:var(--muted);font-size:13.5px;line-height:1.9;margin-bottom:16px}
.stack{display:grid;gap:16px}
.card input[type=text]{min-height:48px;padding:10px 14px;border:1px solid var(--line);border-radius:12px;background:#fff;width:100%}
.salons{display:grid;gap:12px}
.salon{display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:16px 18px;border-radius:18px;background:var(--surface);border:1px solid var(--line-2)}
.salon strong{font-size:17px;display:block}
.salon small{color:var(--muted);font-size:12.5px;direction:ltr;display:inline-block}
.salon .grow{min-width:160px}
.status{list-style:none;margin:0;padding:0;display:grid;gap:4px}
.status li{display:flex;gap:10px;align-items:flex-start;font-size:13.5px;line-height:1.75;padding:5px 0}
.dot svg,.act__ic svg,.ic-line svg,.is-done b svg{width:14px;height:14px;display:block}.act__ic svg{width:18px;height:18px;margin-top:3px}.ic-row{display:flex;gap:6px;align-items:center;color:var(--muted)}.ic-line{display:inline-flex}.act--warn .act__ic{color:var(--warn)}.act--danger .act__ic{color:var(--danger)}.act--ok .act__ic{color:var(--ok)}
.status .dot{width:22px;height:22px;border-radius:50%;flex:none;display:grid;place-items:center;font-size:12px;font-weight:700;margin-top:1px}
.status .on .dot{background:var(--ok-soft);color:var(--ok)}
.status .off{color:var(--muted)}
.status .off .dot{background:var(--glass-2)}
.linkbox{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:12px;padding:10px 10px 10px 14px;border-radius:14px;background:var(--glass)}
.linkbox code{flex:1;min-width:200px;direction:ltr;text-align:left;font-size:13px;overflow-wrap:anywhere}
.tg-state{display:flex;align-items:center;gap:12px;padding:14px;border-radius:16px;margin-bottom:14px}
.tg-state--on{background:var(--ok-soft);color:#1f4f30}
.tg-state--off{background:#f8efdd;color:#674511}
.tg-state b{display:block;font-size:15px}
.tg-state span{font-size:13px;line-height:1.8}
.tg-state svg{width:30px;height:30px;flex:none}
.uploads{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin-bottom:16px}
.uploadbox{display:flex;align-items:center;gap:12px;padding:10px;border:1.5px dashed #b2c0ba;border-radius:16px;background:var(--surface-2);cursor:pointer;margin:0}
.uploadbox:hover{border-color:var(--accent);background:#eef6f4}
.uploadbox.is-busy{opacity:.6;pointer-events:none}
.uploadbox__img{width:48px;height:62px;flex:none;border-radius:999px 999px 8px 8px;overflow:hidden;background:var(--glass-2);display:grid;place-items:center;color:var(--accent);font-size:22px}
.uploadbox__img img{width:100%;height:100%;object-fit:cover}
.uploadbox__txt{display:grid;line-height:1.5}
.uploadbox__txt strong{font-size:13.5px}
.uploadbox__txt small{color:var(--muted);font-size:12px}
.two{display:grid;gap:0 14px}
@media(min-width:620px){.two{grid-template-columns:1fr 1fr}}
.tabs{display:flex;gap:6px;overflow-x:auto;padding:4px 0 10px;margin:0 0 6px;position:sticky;top:0;z-index:5;background:var(--glass);scrollbar-width:none}.tabs::-webkit-scrollbar{display:none}.tab{flex:0 0 auto;border:0;border-radius:999px;padding:10px 16px;font:700 14px inherit;font-family:inherit;background:#e8edeb;color:#23170f;cursor:pointer;white-space:nowrap}.tab{min-height:44px;transition:background .15s,box-shadow .15s}.tab:hover{background:#d6e0dc}.tab.is-on:hover{background:#0a5a5a}.tab:focus-visible{outline:3px solid #0c6b6b;outline-offset:2px}.tab.is-on{background:#0c6b6b;color:#fff}.tabpanels{display:grid;gap:16px}.tabpanels>[hidden]{display:none}
.login input{font-family:system-ui,-apple-system,'Segoe UI',Tahoma,sans-serif;color:#23170f;-webkit-text-fill-color:#23170f;background:#fff;caret-color:#23170f;color-scheme:light;font-size:16px}
input[dir=ltr],textarea[dir=ltr],.field input[type=url],.field input[type=tel],#slug{direction:ltr;text-align:left}
.card h2{font-size:21px}
.pw{position:relative;display:block}.legend{display:flex;gap:14px;flex-wrap:wrap;font-size:12.5px;color:var(--muted);margin-top:8px}.legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-inline-end:6px;vertical-align:-1px}
.checklist{border:2px solid #0c6b6b}.checklist ol{list-style:none;margin:10px 0 0;padding:0;display:grid;gap:8px}.checklist li{display:flex;gap:10px;align-items:center;min-height:44px;padding:8px 12px;border-radius:14px;background:var(--surface-2);font-size:14px}.checklist li.is-done{color:var(--muted);text-decoration:line-through}.checklist li b{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:#0c6b6b;color:#fff;font-size:13px;flex:none;text-decoration:none}.checklist li.is-done b{background:var(--ok)}
.ports{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px}
.port-add{display:grid;gap:10px;margin-top:18px;padding:14px;border:1.5px dashed var(--line);border-radius:16px}
.port-add__list{display:grid;gap:6px}.port-add__list input{min-height:40px}
.port-add select,.port-add input[type=file]{max-width:100%}
.port{display:grid;gap:6px}
.port img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:999px 999px 12px 12px;background:var(--glass-2)}
.port b{font-size:13px;line-height:1.5}
.port .btn{min-height:34px;font-size:12.5px}
.log{display:grid}
.log__row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--line-2);font-size:13.5px}
.log__row:last-child{border-bottom:0}
.seg-ctl--wrap{display:flex;flex-wrap:wrap;gap:4px;max-width:100%}.seg-ctl--wrap button{flex:0 1 auto;white-space:nowrap;padding:7px 10px;font-size:12.5px}.log__row--lead{flex-wrap:wrap}.log__row--lead select{min-height:40px;padding:6px 10px;border:1px solid var(--line);border-radius:10px;background:#fff;font:inherit}.log__row--lead .tel{color:var(--accent-ink);font-weight:600;text-decoration:none}.log__row--lead .grow{min-width:60%}
.log__row small{color:var(--muted);font-size:12px}
.offline-bar{position:fixed;inset-inline:12px;top:calc(env(safe-area-inset-top,0px) + 10px);z-index:96;display:flex;gap:8px;align-items:center;max-width:520px;margin:auto;padding:11px 16px;border-radius:14px;background:#6e1f2b;color:#fff;font-size:13.5px;box-shadow:0 18px 40px -20px rgba(0,0,0,.5)}.offline-bar[hidden]{display:none}
.empty-note{color:var(--muted);font-size:13.5px;line-height:1.9;padding:8px 0}
.login{max-width:420px;margin:30px auto 0}
.login .mirror{width:120px;margin:0 auto 18px}
.login .mirror__glass{aspect-ratio:4/7;display:grid;place-items:center}
.login .mirror__glass span{display:block;width:40%;position:relative;z-index:1}
.login h1{font-family:var(--display);font-weight:800;font-size:28px;text-align:center}
.login p{text-align:center;color:var(--muted);margin:6px 0 18px;line-height:1.9}
.loading{padding:60px 20px;text-align:center;color:var(--muted)}
.foot{padding:26px 20px 34px;text-align:center;color:var(--muted);font-size:12px}
.prog{height:8px;border-radius:99px;background:var(--glass-2);overflow:hidden}.prog i{display:block;height:100%;background:var(--accent);border-radius:99px}.prog--warn i{background:var(--honey)}
.tools{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.tools input[type=search],.tools select{min-height:44px;border:1.5px solid var(--line);border-radius:12px;padding:0 12px;font:inherit;font-size:14px;background:var(--surface);color:var(--ink);min-width:0}.tools input[type=search]{flex:1 1 200px}
.chips{display:flex;gap:6px;flex-wrap:wrap}.chips .chip{min-height:44px}
.pager{display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap;color:var(--muted);font-size:13px}
.forgot{display:grid;gap:12px}.linkbtn{display:block;margin:6px auto 0;background:none;border:0;color:var(--accent-ink);font:inherit;font-size:14px;font-weight:600;min-height:44px;text-decoration:underline;text-underline-offset:3px;cursor:pointer}
.risk{display:grid;gap:8px}.risk li{list-style:none;padding:10px 14px;border-radius:14px;background:var(--warn-soft);color:var(--ink);font-size:13.5px;line-height:1.8}.risk ul{margin:0;padding:0;display:grid;gap:8px}.risk b{display:block}
.tbl-btn{min-height:44px}

`;

const clientJS=String.raw`
/*__QR__*/
var MARK=__MARK__;
var $=function(s,r){return (r||document).querySelector(s)};
function el(tag,attrs,children){var e=document.createElement(tag);attrs=attrs||{};Object.keys(attrs).forEach(function(k){var v=attrs[k];if(v===undefined||v===null||v===false)return;if(k==='text')e.textContent=v;else if(k==='html')e.innerHTML=v;else if(k==='class')e.className=v;else if(k.slice(0,2)==='on')e.addEventListener(k.slice(2),v);else e.setAttribute(k,v===true?'':v)});(children||[]).forEach(function(c){if(c!==null&&c!==undefined&&c!==false)e.append(c)});return e}
function h(tag,text,cls){return el(tag,{text:text,class:cls||''})}
function fa(n){return new Intl.NumberFormat('fa-IR').format(n)}
function fmt(ms){try{return new Intl.DateTimeFormat('fa-IR',{timeZone:'Asia/Tehran',dateStyle:'medium',timeStyle:'short'}).format(ms)}catch(e){return ''}}
function toast(msg,err){var t=$('#toast');t.textContent=msg;t.className='toast is-on'+(err?' is-error':'');clearTimeout(window.__t);window.__t=setTimeout(function(){t.className='toast'},6000)}
function api(path,body,raw){var init={};if(body!==undefined){init.method='POST';init.headers=raw?{}:{'Content-Type':'application/json'};init.body=raw?body:JSON.stringify(body)}return fetch(path,init).then(function(r){return r.json().catch(function(){return {}}).then(function(d){if(!r.ok)throw new Error(d.error||'خطای ارتباط');return d})})}
function act(fn){return function(){var b=this;if(b&&b.disabled!==undefined)b.disabled=true;Promise.resolve().then(fn).catch(function(e){toast(e.message,true)}).then(function(){if(b&&b.disabled!==undefined)b.disabled=false})}}
function field(id,label,value,type,hint){var input=type==='area'?el('textarea',{id:id}):el('input',{id:id,type:type||'text',value:value||''});if(type==='area')input.value=value||'';return el('label',{class:'field'},[el('span',{class:'lbl',text:label}),input,hint?el('span',{class:'hint',text:hint}):null])}
function check(id,label,on){var i=el('input',{type:'checkbox',id:id});i.checked=!!on;return el('label',{class:'check'},[i,el('span',{text:label})])}
function badge(t,tone){return el('span',{class:'badge'+(tone?' badge--'+tone:''),text:t})}
var path=location.pathname.split('/').filter(Boolean),MGR=window.__MGR||'',slug=MGR||(path[0]==='admin'?path[1]||'':'');
var IC={info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.8v.2"/></svg>',ok:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12.4 2.8 2.8L16.4 9.6"/></svg>',warn:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.6 2.8 19.4h18.4z"/><path d="M12 10v4.4M12 17v.2"/></svg>',bad:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/></svg>',check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.6 4.4 4.4L19 7.4"/></svg>',dash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M7 12h10"/></svg>',cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.6"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>'};
var ILLO=__ILLO__;
function empty(kind,title,text){return el('div',{class:'empty'},[el('span',{html:ILLO[kind]}),h('b',title),text?h('p',text):null])}
/* offline banner */
(function(){var bar=document.createElement('div');bar.className='offline-bar';bar.setAttribute('role','status');bar.hidden=navigator.onLine!==false;bar.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M3.5 9.5a12 12 0 0 1 17 0M7 13a7 7 0 0 1 10 0M10.4 16.4a2.4 2.4 0 0 1 3.2 0M4 4l16 16"/></svg><span>اینترنت قطع است؛ تا وصل‌شدن دوباره، دکمه‌ها کار نمی‌کنند.</span>';document.body.append(bar);function u(){bar.hidden=navigator.onLine}window.addEventListener('online',u);window.addEventListener('offline',u)})();
var TG='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.4 4.2 2.9 11.3c-1.2.5-1.2 1.2-.2 1.5l4.7 1.5 1.8 5.6c.2.6.1.9.8.9.5 0 .7-.2 1-.5l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.9-1.4-1.5zM9.2 14.6l8.6-5.4c.4-.2.8-.1.5.2l-7.3 6.6-.3 3z"/></svg>';

(function boot(){api('/api/me').then(function(me){
 if(MGR){var br=document.querySelector('.appbar__brand');if(br)br.href='/manager';if(me.owner||me.manager===MGR){$('#logout').hidden=false;return salonPage()}return mgrLogin()}
 if(!me.owner){return login(me)}
 $('#logout').hidden=false;
 return slug?salonPage():home();
}).catch(function(e){$('#app').replaceChildren(el('div',{class:'loading',text:e.message}))})})();

// Manager's own credit card: remaining images, account status and recharge requests.
function mgrCredits(){
 var box=el('section',{class:'card'},[h('h2','اعتبار و شارژ')]),body=el('div',{class:'stack'}),sel=0;box.append(body);
 function load(){return api('/api/s/'+MGR+'/owner/credits').then(function(d){
  var packs=el('div',{class:'row'});
  d.packs.forEach(function(n){packs.append(el('button',{class:'btn btn--soft btn--sm',type:'button',text:fa(n)+' اعتبار',onclick:function(){sel=n;Array.prototype.forEach.call(packs.children,function(c){c.classList.remove('btn--primary')});this.classList.add('btn--primary')}}))});
  var note=el('textarea',{placeholder:'توضیح یا شمارهٔ پیگیری پرداخت (اختیاری)','aria-label':'توضیح پرداخت',maxlength:'300',rows:'2'});
  body.replaceChildren(el('p',{html:''}),h('b',fa(d.left)+' اعتبار مانده — '+fa(d.used)+' از '+fa(d.limit)+' مصرف شده'),d.sandbox?el('div',{class:'stack'},[h('b','نسخهٔ آزمایشی: '+fa(d.sandbox.images_left)+' از '+fa(d.sandbox.images_limit)+' تصویر آزمایشی مانده'),el('div',{class:'prog'+(d.sandbox.images_left<=1?' prog--warn':''),role:'progressbar','aria-valuemin':'0','aria-valuemax':String(d.sandbox.images_limit),'aria-valuenow':String(d.sandbox.images_left)},[el('i',{style:'width:'+(d.sandbox.images_limit?Math.round(d.sandbox.images_left/d.sandbox.images_limit*100):0)+'%'})]),h('p','بعد از تأیید حساب توسط تیم مزون آینه، اعتبار اصلی فعال می‌شود.','muted')]):'',usageBlock(d.by_kind)||'',d.left<=0?h('p','اعتبار تمام شده؛ تا شارژ، عروس‌ها نمی‌توانند تصویر بسازند و فقط می‌توانند درخواستشان را بدون تصویر بفرستند.','notice notice--warn'):'',h('p','بسته را انتخاب کنید و درخواست بدهید؛ هزینه و روش پرداخت را تیم مزون آینه اعلام می‌کند و بعد از تأیید، اعتبار اضافه می‌شود.','muted'),packs,note,el('button',{class:'btn btn--primary',type:'button',text:'ثبت درخواست شارژ',onclick:act(function(){if(!sel)throw new Error('اول یک بسته را انتخاب کنید');return api('/api/s/'+MGR+'/owner/recharge',{amount:sel,note:note.value}).then(function(){toast('درخواست ثبت شد');sel=0;return load()})})}),d.requests.length?el('div',{},d.requests.map(function(r){return h('small',fa(r.amount)+' تصویر · '+(r.status==='approved'?'تأیید شد':r.status==='rejected'?'رد شد':'در انتظار'),'muted')})):'');
 })}
 load().catch(function(e){body.append(h('p',e.message,'empty-note'))});return box;
}
function mgrForgot(){
 var box=el('section',{class:'card login forgot'}),tick=0;
 function back(){clearInterval(tick);mgrLogin()}
 function stepSend(){
  clearInterval(tick);
  box.replaceChildren(h('h1','بازیابی رمز'),h('p','یک کد یک‌بارمصرف به شمارهٔ موبایلی که با آن ثبت‌نام کردید پیامک می‌شود.'),el('button',{class:'btn btn--primary btn--block',type:'button',text:'ارسال کد پیامکی',onclick:act(function(){return api('/api/s/'+MGR+'/manager/forgot',{}).then(function(r){stepCode(r)})})}),el('button',{class:'linkbtn',type:'button',text:'بازگشت به ورود',onclick:back}));
 }
 function stepCode(r){
  var code=field('fc','کد پیامک‌شده','', 'text'),np=field('fnp','رمز تازه (حداقل ۸ نویسه)','', 'password'),left=Number(r.resend_in)||60;
  var ci=code.querySelector('input'),pi=np.querySelector('input');ci.setAttribute('inputmode','numeric');ci.setAttribute('autocomplete','one-time-code');ci.dir='ltr';pi.dir='ltr';pi.setAttribute('autocomplete','new-password');
  var resend=el('button',{class:'btn btn--ghost btn--block',type:'button',disabled:true,onclick:act(function(){return api('/api/s/'+MGR+'/manager/forgot',{}).then(function(x){toast('کد تازه فرستاده شد.');left=Number(x.resend_in)||60;paint()})})});
  function paint(){clearInterval(tick);function t(){resend.textContent=left>0?'ارسال دوبارهٔ کد تا '+fa(left)+' ثانیه دیگر':'ارسال دوبارهٔ کد';resend.disabled=left>0}t();tick=setInterval(function(){left--;t();if(left<=0)clearInterval(tick)},1000)}
  var ok=el('button',{class:'btn btn--primary btn--block',type:'button',text:'تغییر رمز و ورود',onclick:act(function(){return api('/api/s/'+MGR+'/manager/reset',{code:ci.value,password:pi.value}).then(function(x){clearInterval(tick);if(x.login){toast('رمز عوض شد.');location.reload()}else{toast('رمز عوض شد؛ با رمز تازه وارد شوید.');back()}})})});
  box.replaceChildren(h('h1','کد را وارد کنید'),el('p',{},[document.createTextNode('کد به شمارهٔ '),el('bdi',{dir:'ltr',text:r.phone_hint||'ثبت‌نام'}),document.createTextNode(' پیامک شد و تا ۱۰ دقیقه معتبر است.')]),code,np,ok,resend,el('button',{class:'linkbtn',type:'button',text:'بازگشت به ورود',onclick:back}));
  paint();
 }
 $('#app').replaceChildren(box);stepSend();
}
function mgrLogin(){
 var u=field('mu','نام کاربری','', 'text'),pw=field('mp','رمز عبور','', 'password');
 var go=el('button',{class:'btn btn--primary btn--block',type:'button',text:'ورود',onclick:act(function(){return api('/api/s/'+MGR+'/manager/login',{username:$('#mu').value,password:$('#mp').value}).then(function(){location.reload()})})});
 [['input',u,'username','username'],['input',pw,'current-password','password']].forEach(function(a){var i=a[1].querySelector('input');i.name=a[3];i.setAttribute('autocomplete',a[2]);i.dir='ltr';i.setAttribute('autocapitalize','off');i.setAttribute('autocorrect','off');i.setAttribute('spellcheck','false');i.enterKeyHint='go';i.addEventListener('keydown',function(e){if(e.key==='Enter')go.click()})});
 pw.querySelector('input').addEventListener('keydown',function(e){if(e.key==='Enter')go.click()});
 $('#app').replaceChildren(el('section',{class:'card login'},[el('div',{class:'mirror'},[el('div',{class:'mirror__glass'},[el('span',{html:MARK})])]),h('h1','پنل مدیریت مزون'),h('p','با نام کاربری و رمزی که هنگام ثبت‌نام انتخاب کردید وارد شوید.'),u,pw,go,el('button',{class:'linkbtn',type:'button',text:'رمزم را فراموش کرده‌ام',onclick:mgrForgot})]));
}
function login(me){
 var box=el('section',{class:'card login'},[el('div',{class:'mirror'},[el('div',{class:'mirror__glass'},[el('span',{html:MARK})])]),h('h1','مدیریت مزون آینه'),h('p','اینجا فقط برای تیم مزون آینه است. مزون‌ها با ربات تلگرام کار می‌کنند و مشتری‌ها از لینک اختصاصی مزون وارد می‌شوند.')]);
 if(me.passwordLogin){var f=field('pw','رمز مدیر','', 'password');var go=el('button',{class:'btn btn--primary btn--block',type:'button',text:'ورود',onclick:act(function(){return api('/api/login',{password:$('#pw').value}).then(function(){location.reload()})})});f.querySelector('input').addEventListener('keydown',function(e){if(e.key==='Enter')go.click()});box.append(f,go)}
 else box.append(el('p',{class:'notice notice--warn',text:'ورود با رمز روی این میزبان تنظیم نشده است (OWNER_PASSWORD و SESSION_SECRET).'}));
 $('#app').replaceChildren(box);
}

/* ---------- dashboard ---------- */
// Forms follow the dataviz method: KPI tiles for headline numbers, ranked horizontal bars for
// the funnel and top lists (one hue), columns for days (one hue, today emphasised), stat tiles
// for the salon response. Every chart has a table view and per-mark tooltips.
var dashState={days:30,salon:new URLSearchParams(location.search).get('salon')||''};
var SRC_FA={qr:'QR مزون',ig:'اینستاگرام',wa:'واتساپ',tg:'تلگرام',link:'لینک',kiosk:'تبلت مزون',direct:'مستقیم'};
var KIND_FA={single:'تصویر تکی',views:'نمای سه‌زاویه',spin:'چرخش ۳۶۰'};
var RSN_FA={face:'چهره شبیه من نیست',body:'اندام یا قد تغییر کرده',dress:'لباس شبیه مدل مزون نیست',artifact:'خطای تصویر (دست، لبه، پارچه)',other:'دلیل دیگر'};
function usageBlock(by){
 var rows=['single','views','spin'].filter(function(k){return by&&by[k]}).map(function(k){var x=by[k];return el('tr',{},[el('td',{text:KIND_FA[k]}),el('td',{text:fa(x.count)}),el('td',{text:fa(x.weight)}),el('td',{text:fa(x.credits)})])});
 if(!rows.length)return null;
 return el('div',{class:'stable'},[el('table',{},[el('thead',{},[el('tr',{},['نوع','تعداد','وزن (اعتبار)','اعتبار مصرف‌شده'].map(function(t){return el('th',{text:t})}))]),el('tbody',{},rows)])]);
}
function pct(x){return x==null?'—':fa(Math.round(x*100))+'٪'}
function compact(n){n=Number(n)||0;return n>=10000?fa(Math.round(n/1000))+'هزار':fa(n)}
function delta(cur,prev,isRate){if(!prev&&!cur)return null;if(!prev)return {plain:true};var d=isRate?(cur-prev)*100:(cur-prev)/prev*100;var r=Math.round(d);return {t:(r>0?'+':'')+fa(r)+(isRate?' واحد':'٪'),up:r>=0}}
function tile(label,value,dl,hint){return el('div',{class:'kpi'},[h('span',label,'kpi__label'),h('b',value,'kpi__value'),dl&&!dl.plain?h('span',dl.t+' نسبت به دورهٔ قبل','kpi__delta '+(dl.up?'is-up':'is-down')):null,hint?h('span',hint,'kpi__delta'):null])}
var tipEl=null;
function tipShow(e,lines){if(!tipEl){tipEl=el('div',{class:'dtip',role:'tooltip'});document.body.append(tipEl)}tipEl.replaceChildren.apply(tipEl,lines.map(function(l,i){return el('div',{class:i?'dtip__sub':'dtip__main',text:l})}));tipEl.hidden=false;var r=(e.currentTarget||e.target).getBoundingClientRect();var x=Math.min(window.innerWidth-tipEl.offsetWidth-8,Math.max(8,r.left+r.width/2-tipEl.offsetWidth/2));tipEl.style.transform='translate('+x+'px,'+Math.max(8,r.top-tipEl.offsetHeight-8)+'px)'}
function tipHide(){if(tipEl)tipEl.hidden=true}
function hoverable(node,lines){node.tabIndex=0;node.addEventListener('pointerenter',function(e){tipShow(e,lines)});node.addEventListener('pointerleave',tipHide);node.addEventListener('focus',function(e){tipShow(e,lines)});node.addEventListener('blur',tipHide);node.setAttribute('aria-label',lines.join('، '));return node}
function tableOf(head,rows){return el('details',{class:'dtable'},[el('summary',{text:'نمایش جدول'}),el('table',{},[el('thead',{},[el('tr',{},head.map(function(x){return el('th',{text:x})}))]),el('tbody',{},rows.map(function(r){return el('tr',{},r.map(function(x){return el('td',{text:String(x)})}))}))])])}
// Ranked horizontal bars: one hue, value at the tip, 24px max thickness.
function hbars(items,opts){
 opts=opts||{};var max=Math.max(1,...items.map(function(i){return i.count}));
 var list=el('div',{class:'hbars'});
 items.forEach(function(it){
  var w=it.count/max*100;
  var row=el('div',{class:'hbar'},[el('span',{class:'hbar__label'},[it.swatch?el('span',{class:'hbar__sw',style:'background:'+it.swatch}):null,document.createTextNode(it.label)]),el('span',{class:'hbar__track'},[el('span',{class:'hbar__fill'+(opts.tone?' hbar__fill--'+opts.tone:''),style:'width:'+Math.max(w,it.count?2:0)+'%'})]),el('span',{class:'hbar__val',text:opts.fmt?opts.fmt(it):fa(it.count)})]);
  list.append(hoverable(row,[opts.tip?opts.tip(it):opts.fmt?opts.fmt(it):fa(it.count),it.label]));
 });
 if(!items.length)list.append(h('p','هنوز داده‌ای نیست.','empty-note'));
 return list;
}
// Daily columns with a clean axis: max tick rounded, first/middle/last day labelled.
function columns(daily,key,label,tone){
 var max=Math.max(1,...daily.map(function(d){return d[key]}));var step=Math.pow(10,Math.floor(Math.log10(max)));var top=Math.max(2,Math.ceil(max/step)*step);if(top%2)top+=1;
 var plot=el('div',{class:'cols'});
 daily.forEach(function(d,i){var v=d[key],hgt=v/top*100,last=i===daily.length-1;
  plot.append(hoverable(el('span',{class:'col'+(last?' is-today':'')},[el('span',{class:'col__bar col__bar--'+tone,style:'height:'+(v?Math.max(hgt,2):0)+'%'})]),[fa(v)+' '+label,pday(d.day)]))});
 var ticks=el('div',{class:'cols__y'},[h('span',compact(top)),h('span',compact(top/2)),h('span','۰')]);
 var xs=el('div',{class:'cols__x'},[h('span',pday(daily[0].day)),h('span',pday(daily[Math.floor(daily.length/2)].day)),h('span','امروز')]);
 var chart=el('div',{class:'colchart'},[ticks,el('div',{class:'cols__grid'},[plot,xs])]);if(tone!=='muted')return chart;return el('div',{},[chart,el('div',{class:'legend'},[el('span',{},[el('i',{style:'background:#9fb0a9'}),document.createTextNode('روزهای قبل')]),el('span',{},[el('i',{style:'background:var(--ink-2)'}),document.createTextNode('امروز')])])]);
}
function pday(iso){try{return new Intl.DateTimeFormat('fa-IR-u-ca-persian',{day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(iso+'T12:00:00Z'))}catch(e){return iso}}
function mins(m){if(m==null)return '—';if(m<60)return fa(Math.round(m))+' دقیقه';if(m<1440)return fa(Math.round(m/60))+' ساعت';return fa(Math.round(m/1440))+' روز'}
function card(title,sub,body,table){return el('section',{class:'card dcard'},[h('h2',title),sub?h('p',sub,'lead'):null,body,table||null])}
function dashboard(salons){
 var root=el('section',{class:'dash','aria-label':'آمار'});
 var range=el('div',{class:'seg-ctl',role:'group','aria-label':'بازه'});
 [[7,'۷ روز'],[30,'۳۰ روز'],[90,'۹۰ روز']].forEach(function(o){range.append(el('button',{type:'button','aria-pressed':dashState.days===o[0]?'true':'false',text:o[1],onclick:function(){dashState.days=o[0];draw()}}))});
 var pick=el('select',{'aria-label':'مزون'},(MGR?[]:[el('option',{value:'',text:'همهٔ مزون‌ها'})]).concat(salons.map(function(s){return el('option',{value:s.slug,text:s.name})})));pick.value=dashState.salon;pick.addEventListener('change',function(){dashState.salon=pick.value;draw()});
 var body=el('div',{class:'dash__body'},[el('div',{class:'loading',text:'در حال آوردن آمار…'})]);
 root.append(el('div',{class:'dash__filters'},[range,(MGR||salons.length<=1)?null:pick]),body);
 function draw(){
  Array.prototype.forEach.call(range.children,function(b,i){b.setAttribute('aria-pressed',[7,30,90][i]===dashState.days?'true':'false')});
  body.classList.add('is-refreshing');
  api('/api/owner/stats?days='+dashState.days+(dashState.salon?'&salon='+encodeURIComponent(dashState.salon):'')).then(function(d){body.classList.remove('is-refreshing');body.replaceChildren.apply(body,render(d));if(MGR){Array.prototype.slice.call(body.querySelectorAll('.card')).forEach(function(c){var t=(c.querySelector('h2,h3')||{}).textContent||'';if(/پاسخ مزون‌ها|کیفیت فنی|مقایسهٔ مزون‌ها|رفرال|معرف|درخت|در معرض ریسک/.test(t))c.remove()});Array.prototype.forEach.call(body.querySelectorAll('.dgrid'),function(g){if(g.children.length===1)g.classList.add('dgrid--1')});return}var slot=el('div',{class:'dgrid dgrid--1'},[el('div',{class:'loading',text:'در حال آوردن رفرال‌ها…'})]);body.append(slot);return api('/api/owner/referrals'+(dashState.salon?'?salon='+encodeURIComponent(dashState.salon):'')).then(function(r){slot.replaceChildren.apply(slot,referrals(r))},function(e){slot.replaceChildren(el('p',{class:'notice notice--warn',text:e.message}))})}).catch(function(e){body.classList.remove('is-refreshing');body.replaceChildren(el('p',{class:'notice notice--warn',text:e.message}))});
 }
 function render(d){
  var k=d.kpi,p=d.prev,out=[];
  out.push(el('div',{class:'kpis'},[tile('بازدیدکننده',compact(k.visitors),delta(k.visitors,p.visitors)),tile('عکس گذاشتند',compact(k.photos),delta(k.photos,p.photos)),tile('شبیه‌سازی',compact(k.simulations),delta(k.simulations,p.simulations)),tile('برای مزون فرستادند',compact(k.sent),delta(k.sent,p.sent)),tile('نرخ تبدیل',pct(k.conversion),delta(k.conversion,p.conversion,true),'از هر ۱۰۰ بازدیدکننده چند نفر درخواست فرستادند')]));
  if([[k.visitors,p.visitors],[k.photos,p.photos],[k.simulations,p.simulations],[k.sent,p.sent]].some(function(x){return x[0]&&!x[1]}))out.push(h('p','برای بعضی شاخص‌ها در دورهٔ قبل داده‌ای ثبت نشده بود، پس مقایسه نشان داده نمی‌شود.','kpi__delta'));
  var top=d.funnel[0]?.count||0;
  out.push(el('div',{class:'dgrid'},[
   card('قیف مشتری','چند نفر از بازدیدکننده‌ها به هر قدم رسیدند.',hbars(d.funnel.map(function(f){return {label:f.label,count:f.count}}),{fmt:function(it){return fa(it.count)+(top?' ('+pct(it.count/top)+')':'')}}),tableOf(['قدم','نفر','از بازدید'],d.funnel.map(function(f){return [f.label,fa(f.count),top?pct(f.count/top):'—']}))),
   card('پاسخ مزون‌ها','بعد از ارسال، مزون چه کرد (درخواست‌های '+fa(d.response.windowDays)+' روز اخیر).',el('div',{class:'kpis kpis--small'},[tile('پاسخ داده‌اند',d.response.total?pct(d.response.handled/d.response.total):'—',null,fa(d.response.handled)+' از '+fa(d.response.total)),tile('میانهٔ زمان پاسخ',mins(d.response.medianMinutes)),tile('بی‌پاسخ بیش از ۲۴ ساعت',fa(d.response.overdue),null,d.response.overdue?'یادآوری خودکار رفته':'')]),tableOf(['وضعیت','تعداد'],[['تماس گرفتند',fa(d.response.called)],['نوبت دادند',fa(d.response.booked)],['قابل اجرا نبود',fa(d.response.declined)],['منتظر',fa(d.response.waiting)]]))
  ]));
  out.push(el('div',{class:'dgrid'},[
   card('بازدیدکننده در روز','',columns(d.daily,'visitors','بازدیدکننده','muted'),tableOf(['روز','بازدیدکننده'],d.daily.map(function(x){return [pday(x.day),fa(x.visitors)]}))),
   d.daily.some(function(x){return x.sent})?card('درخواست در روز','',columns(d.daily,'sent','درخواست','accent'),tableOf(['روز','درخواست'],d.daily.map(function(x){return [pday(x.day),fa(x.sent)]}))):null
  ]));
  out.push(el('div',{class:'dgrid'},[
   card('لباس‌های پرطرفدار','بیشترین انتخاب مشتری‌ها.',hbars(d.looks),tableOf(['لباس','انتخاب'],d.looks.map(function(x){return [x.label,fa(x.count)]})))
  ]));
  out.push(el('div',{class:'dgrid dgrid--1'},[card('عملکرد هر لباس','چند بار امتحان شد، ذخیره شد و «می‌خواهم» خورد؛ تبدیل یعنی از هر امتحان چند درخواست آمد.',
   (d.dresses||[]).length?el('div',{class:'stable'},[el('table',{},[el('thead',{},[el('tr',{},['لباس'].concat((d.salons&&d.salons.length)?['مزون']:[]).concat(['امتحان','ذخیره','می‌خواهم','تبدیل']).map(function(x){return el('th',{text:x})}))]),el('tbody',{},d.dresses.map(function(x){return el('tr',{},[el('td',{text:x.name})].concat((d.salons&&d.salons.length)?[el('td',{text:x.salon||''})]:[]).concat([el('td',{text:fa(x.tryons)}),el('td',{text:fa(x.saves)}),el('td',{text:fa(x.wants)}),el('td',{text:x.tryons?pct(x.conversion):'—'})]))}))])]):h('p','هنوز لباسی امتحان نشده.','empty-note'))]));
  var r=d.rating,g=d.generation,x=d.extra;
  out.push(el('div',{class:'dgrid'},[
   card('رضایت از شبیه‌سازی',r.count?'میانگین '+fa(r.avg.toFixed(1))+' از ۵، از '+fa(r.count)+' امتیاز':'هنوز امتیازی ثبت نشده.',hbars([5,4,3,2,1].map(function(v,i){return {label:fa(v)+' ستاره',count:r.dist[i]}}),{tone:'honey'}),tableOf(['امتیاز','تعداد'],[5,4,3,2,1].map(function(v,i){return [fa(v),fa(r.dist[i])]}))),
   card('کیفیت فنی و رفتار','',el('div',{class:'kpis kpis--small'},[tile('شبیه‌سازی موفق',g.total?pct(g.rate):'—',null,fa(g.success)+' از '+fa(g.total)),tile('تور آموزشی',x.tourStart?pct(x.tourDone/x.tourStart):'—',null,'کامل دیدند ('+fa(x.tourDone)+' از '+fa(x.tourStart)+')'),tile('نمای سه‌زاویه',fa(x.view360)),tile('خبرم کن',fa(x.follow),null,'مشتری ربات را باز کرد'),tile('دربارهٔ مزون',fa(x.about))]))
  ]));
  if(d.atRisk&&d.atRisk.length)out.splice(1,0,card('مزون‌های در معرض ریسک','هر کدام را زودتر پیگیری کنید.',el('ul',{class:'risk'},d.atRisk.map(function(a){return el('li',{},[el('a',{href:'/admin/'+a.slug,text:a.name}),el('span',{text:' — '+a.reasons.join('؛ ')})])}))));
  var U=d.usage||null,L=d.lost||{no_credit:0,visitors:0,byKind:{}},SR=d.sources||[],RX=d.reactions||{down:0,refunded:0,reasons:{},rate:0,refundRate:0};
  var srcItems=SR.map(function(x){return {label:SRC_FA[x.src]||SRC_FA.direct,count:x.visitors,sent:x.sent,conv:x.conversion}}),rsItems=Object.keys(RX.reasons||{}).map(function(k){return {label:RSN_FA[k]||RSN_FA.other,count:RX.reasons[k]}}).sort(function(a,b){return b.count-a.count});
  out.push(el('div',{class:'dgrid'},[
   card('مشتری‌ها از کجا آمدند','QR، اینستاگرام، واتساپ، تلگرام، لینک یا تبلت مزون. برای هر لینک آخرش src=ig یا wa یا tg بگذارید.',srcItems.length?hbars(srcItems.map(function(x){return {label:x.label,count:x.count}}),{fmt:function(it){var x=srcItems.filter(function(y){return y.label===it.label})[0];return fa(it.count)+' نفر · '+fa(x.sent)+' درخواست'}}):empty('results','هنوز بازدیدی ثبت نشده','با اولین بازدید، منبع آن اینجا دیده می‌شود.'),tableOf(['منبع','بازدیدکننده','درخواست','تبدیل'],srcItems.map(function(x){return [x.label,fa(x.count),fa(x.sent),pct(x.conv)]}))),
   card('نتیجه‌هایی که عروس‌ها نپسندیدند','وقتی عروس «خوشم نیامد» را می‌زند، دلیلش و بازگشت اعتبار اینجا شمرده می‌شود.',el('div',{class:'stack'},[el('div',{class:'kpis kpis--small'},[tile('نرخ نارضایتی',pct(RX.rate),null,fa(RX.down)+' نتیجه'),tile('اعتبار برگشتی',fa(RX.refunded),null,pct(RX.refundRate)+' نتیجه‌ها')]),rsItems.length?hbars(rsItems,{tone:'honey'}):h('p','هنوز دلیلی ثبت نشده.','empty-note')]),tableOf(['دلیل','تعداد'],rsItems.map(function(x){return [x.label,fa(x.count)]})))
  ]));
  out.push(el('div',{class:'dgrid'},[
   card('اعتبار مصرف‌شده در این بازه','هر نوع درخواست تصویر به اندازهٔ «وزن» خودش اعتبار برمی‌دارد.',el('div',{class:'stack'},[d.credits?el('div',{class:'kpis kpis--small'},[tile('اعتبار مانده',fa(d.credits.left),null,'از '+fa(d.credits.limit)+' اعتبار'),tile('مصرف تا امروز',fa(d.credits.used))]):null,usageBlock(U)||h('p','هنوز اعتباری مصرف نشده.','empty-note')])),
   card('درخواست‌های ازدست‌رفته','عروس‌هایی که چون اعتبار تمام شده بود، تصویر نگرفتند و پیشنهاد «ارسال بدون تصویر» دیدند.',el('div',{class:'stack'},[el('div',{class:'kpis kpis--small'},[tile('بار رد شد',fa(L.no_credit)),tile('عروس متفاوت',fa(L.visitors))]),L.no_credit?h('p','با شارژ به‌موقع اعتبار این عدد صفر می‌ماند.','muted'):h('p','در این بازه هیچ عروسی به‌خاطر تمام شدن اعتبار برنگشته.','muted')]),tableOf(['نوع','تعداد'],Object.keys(L.byKind||{}).map(function(k){return [KIND_FA[k]||k,fa(L.byKind[k])]})))
  ]));
  var sh=d.share||{opened:0,sent:0,visitors:0,byApp:[]},APP={telegram:'تلگرام',whatsapp:'واتساپ',sms:'پیامک',instagram:'اینستاگرام',copy:'کپی لینک',native:'سایر برنامه‌ها (بله، ایتا…)'};
  var apps=sh.byApp.map(function(a){return {label:APP[a.label]||a.label,count:a.count}});
  if(d.salons&&d.salons.length)out.push(card('مقایسهٔ مزون‌ها','',el('div',{class:'stable'},[el('table',{},[el('thead',{},[el('tr',{},['مزون','بازدیدکننده','درخواست','نرخ تبدیل','پاسخ مزون'].map(function(t){return el('th',{text:t})}))]),el('tbody',{},d.salons.map(function(s){return el('tr',{},[el('td',{},[el('a',{href:'/admin/'+s.slug,text:s.name})]),el('td',{text:fa(s.visitors)}),el('td',{text:fa(s.sent)}),el('td',{text:pct(s.conversion)}),el('td',{text:pct(s.handledRate)})])}))])])));
  return out;
 }
 draw();
 return root;
}
// Staff referrals: per member totals and generations (table), visitors per member (ranked bars),
// top referrers (ranked bars) and the who-brought-whom tree (collapsible, capped by the server).
function referrals(r){
 var rows=r.staff.concat(r.unowned||[]),out=[];
 if(!rows.length)return [card('رفرال نیروها','هنوز نیرویی ثبت نشده. از صفحهٔ هر مزون («تیم مزون») یا در ربات با /team نیرو اضافه کنید.',h('p','هر نیرو یک لینک اختصاصی می‌گیرد و اینجا می‌بینید هر لینک چند نفر و چند نسل آورده است.','empty-note'))];
 var t=r.totals,multi=rows.map(function(x){return x.salon_id}).filter(function(v,i,a){return a.indexOf(v)===i}).length>1;
 var nm=function(x){return x.name+(multi&&x.salon?' — '+x.salon:'')};
 out.push(card('رفرال نیروها','هر مشتری برای همیشه مال نیرویی است که لینکش را آورده؛ دوستانی که او دعوت می‌کند هم همین‌طور. «مستقیم» یعنی از لینک خود نیرو، «دوستِ دوست» نسل دوم، و بعد نسل سوم و بیشتر.',
  el('div',{},[el('div',{class:'kpis kpis--small'},[tile('بازدیدکنندهٔ ثبت‌شده',fa(t.visitors)),tile('آمده با لینک',fa(t.referred),null,t.visitors?pct(t.referred/t.visitors):''),tile('درخواست',fa(t.requests))]),
   el('div',{style:'margin-top:18px'},[hbars(rows.filter(function(x){return x.visitors}).sort(function(a,b){return b.visitors-a.visitors}).map(function(x){return {label:nm(x),count:x.visitors,x:x}}),{fmt:function(it){return fa(it.count)+' نفر'},tip:function(it){var x=it.x;return fa(x.visitors)+' نفر · مستقیم '+fa(x.id?x.gen1:x.gen0)+'، نسل ۲: '+fa(x.gen2)+'، نسل ۳+: '+fa(x.gen3)+' · '+fa(x.requests)+' درخواست'}})])]),
  tableOf(['نیرو','تخصص','بازدیدکننده','مستقیم','دوستِ دوست','نسل ۳+','درخواست','نوبت','نرخ تبدیل','ربات'],rows.map(function(x){return [nm(x)+(x.active?'':' (حذف‌شده)'),x.specialty||'—',fa(x.visitors),fa(x.id?x.gen1:x.gen0),fa(x.gen2),fa(x.gen3),fa(x.requests),fa(x.booked),pct(x.conversion),x.id?(x.linked?'وصل':'وصل نیست'):'—']}))));
 var top=r.top||[];
 out.push(card('بهترین معرف‌ها','مشتری‌هایی که لینک را برای دیگران فرستادند (فقط اسم کسانی که درخواست داده‌اند).',top.length?hbars(top.map(function(x){return {label:x.name+' ('+x.staff+')',count:x.brought,x:x}}),{tone:'honey',fmt:function(it){return fa(it.x.brought)+' نفر'},tip:function(it){return fa(it.x.brought)+' نفر آورد، '+fa(it.x.sent)+' نفرشان درخواست دادند'}}):h('p','هنوز معرفی ثبت نشده.','empty-note'),top.length?tableOf(['معرف','نیرو','مزون','آورد','درخواست دادند'],top.map(function(x){return [x.name,x.staff,x.salon,fa(x.brought),fa(x.sent)]})):null));
 var trees=r.trees||[];
 if(trees.length){
  var view=el('div',{class:'rtree'}),pick=el('div',{class:'tree-pick',role:'group','aria-label':'درخت کدام نیرو'});
  var show=function(i){Array.prototype.forEach.call(pick.children,function(b,j){b.setAttribute('aria-pressed',i===j?'true':'false')});var tr=trees[i];
   var node=function(n){var lab=el('span',{class:'node'+(n.sent?' node--sent':'')},[document.createTextNode(n.label),n.size?h('small','+'+fa(n.size)):null,n.sent?h('small','درخواست داد'):null]);
    if(!n.kids.length)return el('li',{},[lab]);return el('li',{},[el('details',{open:n.kids.length<=6&&n.gen<=1},[el('summary',{},[lab]),el('ul',{},n.kids.map(node))])])};
   view.replaceChildren(el('p',{class:'tiny muted',text:tr.owner+(multi?' — '+tr.salon:'')+': '+fa(tr.total)+' نفر'+(tr.shown<tr.total?' (اولین '+fa(tr.shown)+' نفر نشان داده شده)':'')}),el('ul',{},tr.nodes.map(node)))};
  trees.forEach(function(tr,i){pick.append(el('button',{class:'btn btn--ghost btn--sm',type:'button',text:tr.owner+(multi?' — '+tr.salon:'')+' ('+fa(tr.total)+')',onclick:function(){show(i)}}))});
  show(0);
  out.push(card('درخت معرفی','چه کسی چه کسی را آورد. پررنگ‌ها درخواست داده‌اند؛ بقیه فقط صفحه را دیده‌اند و ناشناس‌اند. «+n» یعنی چند نفر زیر این نفر آمده‌اند.',el('div',{},[pick,view])));
 }
 return out;
}


// Leads of one boutique: status filter, a status select per request (same effect as the bot buttons),
// delivery state with a retry for failed ones, and a CSV export.
// Pictures brides allowed the boutique to post on its social media (answered "yes" on the page or in the bot).
function socialCard(slug){
 var box=el('section',{class:'card'},[h('h2','تصاویر مجاز برای سوشال'),h('p','عروس‌هایی که اجازه دادند تصویرشان در سوشال مزون منتشر شود. این عکس‌ها پاک نمی‌شوند؛ دانلود کنید و با ذکر اسم عروس منتشر کنید.','lead')]),list=el('div',{class:'grid grid--3'});
 box.append(list);
 api('/api/s/'+slug+'/owner/social').then(function(r){
  if(!r.items.length){list.replaceWith(h('p','هنوز کسی اجازه نداده.','lead'));return}
  r.items.forEach(function(x){
   var src='/api/s/'+slug+'/media/'+x.media;
   list.append(el('figure',{class:'sc'},[el('img',{src:src,alt:x.name||'عروس',loading:'lazy',style:'width:100%;border-radius:12px;aspect-ratio:2/3;object-fit:cover'}),el('figcaption',{style:'font-size:13px;line-height:1.8'},[document.createTextNode((x.name||'عروس')+(x.dress?' · '+x.dress:'')+' ')]),el('a',{class:'btn btn--ghost btn--sm',href:src,download:'bride-'+x.id.slice(0,8)+'.jpg',text:'دانلود'})]));
  });
 }).catch(function(){list.replaceWith(h('p','بارگیری نشد.','lead'))});
 return box;
}
var LSTATUS=[['new','جدید'],['called','تماس گرفته شد'],['booked','رزرو شد'],['cancelled','لغو'],['declined','فعلاً امکان‌پذیر نیست']];
function leadsCard(slug){
 var box=el('section',{class:'card'},[h('h2','درخواست‌ها و مشتریان علاقه‌مند'),h('p','هر کس «این لباس را می‌خواهم» یا فرستادن را زده اینجاست. وضعیت را از اینجا یا از دکمه‌های ربات عوض کنید؛ مشتری هم خبردار می‌شود.','lead')]);
 var chips=el('div',{class:'seg-ctl seg-ctl--wrap',role:'group','aria-label':'فیلتر وضعیت'}),list=el('div',{class:'log'}),csv=el('a',{class:'btn btn--soft btn--sm',href:'#',download:'leads.csv',html:'<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11"/><path d="m7.5 11 4.5 4.5 4.5-4.5"/><path d="M4.5 19.5h15"/></svg><span>خروجی CSV</span>'});
 var cur='all',tone={sent:'ok',queued:'',sending:'accent',retry:'warn',failed:'danger'},label={sent:'رسید',queued:'در صف',sending:'در حال ارسال',retry:'تلاش دوباره',failed:'ناموفق'};
 function paintChips(counts){
  var total=0;Object.keys(counts||{}).forEach(function(k){total+=counts[k]});
  chips.replaceChildren.apply(chips,[['all','همه']].concat(LSTATUS).map(function(x){var n=x[0]==='all'?total:(counts&&counts[x[0]])||0;return el('button',{type:'button','aria-pressed':cur===x[0]?'true':'false',text:x[1]+' ('+fa(n)+')',onclick:function(){cur=x[0];load()}})}));
 }
 function load(){
  csv.href='/api/s/'+slug+'/owner/leads.csv?status='+cur;
  list.classList.add('is-refreshing');
  return api('/api/s/'+slug+'/owner/leads?status='+cur).then(function(r){
   list.classList.remove('is-refreshing');paintChips(r.counts);
   if(!r.leads.length){list.replaceChildren(empty('leads','درخواستی با این وضعیت نیست','وقتی مشتری «این لباس را می‌خواهم» را بزند، اینجا دیده می‌شود.'));return}
   list.replaceChildren.apply(list,r.leads.map(function(l){
    var sel=el('select',{'aria-label':'وضعیت '+l.name},LSTATUS.map(function(x){return el('option',{value:x[0],text:x[1]})}));sel.value=l.salon_status;
    sel.addEventListener('change',function(){sel.disabled=true;api('/api/s/'+slug+'/owner/leads/status',{id:l.id,status:sel.value}).then(function(){toast('وضعیت عوض شد.');return load()},function(e){toast(e.message,true);sel.value=l.salon_status}).then(function(){sel.disabled=false})});
    var tel='0'+String(l.phone).replace(/^\+98/,'');
    return el('div',{class:'log__row log__row--lead'},[
     el('div',{class:'grow'},[h('b',l.name),el('br'),el('a',{href:'tel:'+tel,dir:'ltr',class:'tel',text:tel.replace(/\d/g,function(c){return '۰۱۲۳۴۵۶۷۸۹'[c]})}),el('br'),h('small',[l.intent==='want'?'می‌خواهم · ':'',l.look||'بدون لباس',' · ',fmt(l.created_at),l.staff?' · '+l.staff:''].join('')),l.visit_note?el('div',{class:'ic-row'},[el('span',{class:'ic-line',html:IC.cal}),h('small',l.visit_note)]):null]),
     l.waiting?badge('منتظر وصل شدن '+(l.staff||'نیرو'),'warn'):badge(label[l.status]||l.status,tone[l.status]),
     el('button',{class:'btn btn--ghost btn--sm tbl-btn',type:'button',text:'حذف درخواست','aria-label':'حذف درخواست '+l.name,onclick:act(function(){if(!confirm('درخواست «'+l.name+'» و عکس‌هایی که فقط برای همین درخواست بود برای همیشه پاک شود؟'))return;return api('/api/s/'+slug+'/owner/leads/delete',{id:l.id}).then(function(r){toast('درخواست حذف شد'+(r.photos?' ('+fa(r.photos)+' عکس پاک شد)':'')+'.');return load()})})}),
     l.status==='failed'?el('button',{class:'btn btn--ghost btn--sm',type:'button',text:'ارسال دوباره',onclick:act(function(){return api('/api/s/'+slug+'/owner/leads/retry',{id:l.id}).then(load)})}):null,
     sel]);
   }));
  }).catch(function(e){list.classList.remove('is-refreshing');list.replaceChildren(el('p',{class:'notice notice--warn',text:e.message}))});
 }
 box.append(el('div',{class:'dash__filters'},[chips,csv]),list);load();return box;
}
// Setup progress of a salon page: how many fields are filled and which are missing.
function setupLine(s){var st=s.setup||{filled:0,total:11,missing:[]};var done=st.filled>=st.total;
 return el('div',{class:'setup'},[el('span',{class:'setup__bar'},[el('span',{style:'width:'+Math.round(st.filled/st.total*100)+'%'})]),h('small',(done?'صفحه کامل است':'صفحه '+fa(st.filled)+' از '+fa(st.total)+' — مانده: '+st.missing.join('، ')))])}
// The owner's own alerts: link a Telegram chat, preview tonight's digest, and the activity log.
var LEVEL={info:[IC.info,''],good:[IC.ok,'ok'],warn:[IC.warn,'warn'],error:[IC.bad,'danger']},KIND={setup:'راه‌اندازی',team:'تیم',stuck:'گیرکرده',credit:'اعتبار',noanswer:'بی‌جواب',error:'خطا'};
function alertsCard(d){
 var a=d.alerts||{chats:[]},on=a.chats.length>0,out=el('div');
 var c=el('section',{class:'card'},[h('h2','گزارش‌ها و هشدارها'),h('p','هشدار فوری (وصل شدن یا نشدن مزون و مدیر مزون، صفحهٔ نیمه‌کاره، درخواست بی‌جواب یا گیرکرده، خطای ربات) و هر شب ساعت ۲۱ خلاصهٔ روز در گفتگوی تلگرام خودت با ربات.','lead'),
  el('div',{class:'tg-state tg-state--'+(on?'on':'off')},[el('span',{html:TG}),el('div',{},[h('b',on?'گزارش‌ها به تلگرام خودت می‌آید':'هنوز به تلگرام خودت وصل نیست'),h('span',on?'در ربات /report خلاصهٔ همین الان را می‌دهد.':'دکمه را بزن، لینک را در تلگرام خودت باز کن و Start بزن.')])])]);
 c.append(el('div',{class:'row',style:'gap:8px;flex-wrap:wrap'},[
  el('button',{class:'btn btn--primary btn--sm',type:'button',text:on?'وصل کردن یک گفتگوی دیگر':'وصل کردن تلگرام من',onclick:act(function(){return api('/api/owner/alerts-link',{}).then(function(r){var L=r.links||{};out.replaceChildren.apply(out,[L.telegram?copyLink('تلگرام',L.telegram):null,L.bale?copyLink('بله',L.bale):null,el('p',{class:'tiny muted',text:'یک‌بار مصرف، ۲۴ ساعت اعتبار.'})].filter(Boolean))})})}),
  el('button',{class:'btn btn--ghost btn--sm',type:'button',text:'پیش‌نمایش گزارش امشب',onclick:act(function(){return api('/api/owner/digest').then(function(r){out.replaceChildren(el('pre',{class:'digest',text:r.text}))})})}),
  on?el('button',{class:'btn btn--danger btn--sm',type:'button',text:'قطع گزارش‌ها',onclick:act(function(){if(!confirm('گزارش‌ها دیگر به تلگرام نیاید؟'))return;return api('/api/owner/alerts-unlink',{}).then(home)})}):null
 ]),out);
 var acts=d.activity||[],list=el('div',{class:'acts'});
 acts.forEach(function(x){var l=LEVEL[x.level]||LEVEL.info;list.append(el('div',{class:'act act--'+(l[1]||'info')},[el('span',{class:'act__ic',html:l[0]}),el('div',{class:'grow'},[h('span',x.text),el('br'),h('small',(KIND[x.kind]||x.kind)+' · '+fmt(x.created_at))])]))});
 c.append(h('h3','رویدادهای اخیر','sub'),acts.length?list:h('p','هنوز رویدادی ثبت نشده.','empty-note'));
 return c;
}
function copyLink(label,url){return el('div',{class:'linkbox'},[h('b',label,'linkbox__label'),el('code',{text:url}),el('button',{class:'btn btn--soft btn--sm',type:'button',text:'کپی',onclick:function(){navigator.clipboard&&navigator.clipboard.writeText(url).then(function(){toast('لینک کپی شد.')})}})])}

function botCard(bot){
 var st=function(ok,on,off){return el('li',{class:ok?'on':'off'},[el('span',{class:'dot',html:ok?IC.check:IC.dash}),h('span',ok?on:off)])};
 var t=bot.telegram||{},b=bot.bale||{};
 var c=el('section',{class:'card'},[h('h2','ربات‌ها'),h('p','همهٔ مزون‌ها از یک ربات تلگرام و یک ربات بله استفاده می‌کنند. هر مزون می‌تواند یکی یا هر دو را وصل کند و درخواست‌ها در هر دو می‌رسد.','lead'),el('ul',{class:'status'},[
  st(t.ready&&!!t.username,'تلگرام: @'+t.username,'تلگرام: TELEGRAM_BOT_TOKEN و TELEGRAM_BOT_USERNAME تنظیم نشده.'),
  st(bot.secret,'رمز وبهوک تنظیم شده است.','TELEGRAM_WEBHOOK_SECRET تنظیم نشده (برای هر دو ربات لازم است).'),
  st(b.ready&&!!b.username,'بله: @'+b.username,'بله: BALE_BOT_TOKEN و BALE_BOT_USERNAME تنظیم نشده (اختیاری؛ راهنما در SETUP-BALE.md).')
 ])]);
 if((t.ready||b.ready)&&bot.secret)c.append(el('button',{class:'btn btn--ghost',type:'button',style:'margin-top:12px',text:'اتصال ربات‌ها به این سایت',onclick:act(function(){return api('/api/owner/webhook',{}).then(function(d){toast('وصل شد: '+Object.keys(d.bots||{}).map(function(k){return (k==='bale'?'بله':'تلگرام')+' @'+d.bots[k]}).join('، '))})})}));
 return c;
}
// Accounts: approval, image credit and recharge requests per salon (the project owner's side of /m/<token>).
function quotaCard(S){
 var cur=Number(S.settings&&S.settings.quota_per_line)||4,st=S.settings||{};
 var f=field('s-quota','تعداد امتحان هر عروس در هر بخش',String(cur),'number','عددی بین ۱ تا ۲۰؛ پیش‌فرض ۴. وقتی عروسی همهٔ امتحان‌هایش را انجام دهد، به شما خبر می‌دهیم.');
 var i=f.querySelector('input');i.min='1';i.max='20';i.step='1';i.setAttribute('inputmode','numeric');
 return el('section',{class:'card'},[h('h2','سهم امتحان عروس‌ها'),f,el('button',{class:'btn btn--primary',type:'button',text:'ذخیره',onclick:act(function(){var n=parseInt(i.value,10);if(!(n>=1&&n<=20))throw new Error('عددی بین ۱ تا ۲۰ بنویسید');return api('/api/s/'+slug+'/owner/settings',{quota_per_line:n,generation_enabled:!!st.generation_enabled,reference_verified:!!st.reference_verified,catalog:st.catalog,allow_own_dress:st.allow_own_dress,image_model:st.image_model==='fast'?'fast':'pro',daily_limit:st.daily_limit,retention_days:st.retention_days}).then(function(){toast('ذخیره شد.')})})})]);
}
function passwordCard(){
 var cur=field('pw-cur','رمز فعلی','', 'password'),nw=field('pw-new','رمز تازه (حداقل ۸ نویسه)','', 'password'),nw2=field('pw-new2','تکرار رمز تازه','', 'password');
 [cur,nw,nw2].forEach(function(f,k){var i=f.querySelector('input');i.dir='ltr';i.setAttribute('autocomplete',k?'new-password':'current-password')});
 return el('section',{class:'card'},[h('h2','تغییر رمز عبور'),h('p','برای ورود به پنل. بعد از تغییر، همین مرورگر وارد می‌ماند و ورود قبلی در جاهای دیگر باطل می‌شود.','lead'),cur,nw,nw2,el('button',{class:'btn btn--primary',type:'button',text:'تغییر رمز',onclick:act(function(){var a=$('#pw-new').value;if(a!==$('#pw-new2').value)throw new Error('تکرار رمز با رمز تازه یکی نیست');return api('/api/s/'+slug+'/manager/password',{current:$('#pw-cur').value,password:a}).then(function(){['#pw-cur','#pw-new','#pw-new2'].forEach(function(q){$(q).value=''});toast('رمز عوض شد.')})})})]);
}
function rotateCard(){
 var out=el('div',{});
 return el('section',{class:'card'},[h('h2','لینک پنل شارژ'),h('p','اگر لینک پنل را به کسی داده‌اید که نباید داشته باشد، لینک تازه بسازید. لینک قبلی همان لحظه از کار می‌افتد.','lead'),el('button',{class:'btn btn--ghost',type:'button',text:'ساخت لینک پنل تازه',onclick:act(function(){if(!confirm('لینک فعلی پنل از کار می‌افتد. لینک تازه ساخته شود؟'))return;return api('/api/s/'+slug+'/manager/rotate-token',{}).then(function(r){out.replaceChildren(copyLink('لینک تازهٔ پنل',r.panel));toast('لینک تازه ساخته شد.')})})}),out]);
}
function accountsCard(){
 var AQ={q:'',filter:'',sort:'new',offset:0,limit:20};
 var box=el('section',{class:'card'},[h('h2','حساب مزون‌ها و اعتبار'),h('p','هر مزون ۱۰۰ اعتبار دارد. تا وقتی حساب تأیید نشود، مدیر مزون همه‌چیز را می‌بیند و کار می‌کند اما ساخت تصویر بسته است. لینک پنل شارژ را برای مدیر مزون بفرست.','lead')]),body=el('div',{class:'stack'}),pager=el('div',{class:'pager'});
 var qi=el('input',{type:'search',placeholder:'جست‌وجوی نام، نشانی، موبایل یا مدیر','aria-label':'جست‌وجو'}),sortSel=el('select',{'aria-label':'مرتب‌سازی'},[['new','تازه‌ترین'],['name','نام'],['left','کمترین اعتبار مانده'],['used','بیشترین مصرف']].map(function(o){return el('option',{value:o[0],text:o[1]})})),chips=el('div',{class:'chips',role:'group','aria-label':'فیلتر'});
 var FL=[['','همه'],['pending','در انتظار تأیید'],['approved','فعال'],['trial','آزمایشی'],['low','اعتبار کم'],['exhausted','اعتبار تمام'],['nobot','بدون ربات']],qt=0,CN={};
 function paintChips(){chips.replaceChildren.apply(chips,FL.map(function(f){var n=f[0]===''?CN.all:CN[f[0]];return el('button',{class:'chip',type:'button','aria-pressed':AQ.filter===f[0]?'true':'false',text:f[1]+(n===undefined?'':' ('+fa(n)+')'),onclick:function(){AQ.filter=f[0];AQ.offset=0;paintChips();load()}})}))}
 qi.addEventListener('input',function(){clearTimeout(qt);qt=setTimeout(function(){AQ.q=qi.value.trim();AQ.offset=0;load()},300)});sortSel.addEventListener('change',function(){AQ.sort=sortSel.value;AQ.offset=0;load()});paintChips();
 box.append(el('div',{class:'tools'},[qi,sortSel]),chips,body,pager);
 function load(){body.classList.add('is-refreshing');return api('/api/owner/accounts?q='+encodeURIComponent(AQ.q)+'&filter='+AQ.filter+'&sort='+AQ.sort+'&limit='+AQ.limit+'&offset='+AQ.offset).then(function(d){body.classList.remove('is-refreshing');CN=d.counts||{};paintChips();
  body.replaceChildren();
  if(d.requests.length){body.append(h('b','درخواست‌های شارژ در انتظار'));d.requests.forEach(function(r){body.append(el('div',{class:'salon'},[el('div',{class:'grow'},[h('strong',r.name+' · '+fa(r.amount)+' تصویر'),h('small',r.note||'بدون توضیح')]),el('button',{class:'btn btn--primary btn--sm',type:'button',text:'تأیید و شارژ',onclick:act(function(){return api('/api/owner/recharge',{id:r.id,action:'approve'}).then(function(){toast('اعتبار اضافه شد');return load()})})}),el('button',{class:'btn btn--ghost btn--sm',type:'button',text:'رد',onclick:act(function(){return api('/api/owner/recharge',{id:r.id,action:'reject'}).then(load)})})]))})}
  d.accounts.forEach(function(a){
   var line=a.approved?(a.left>0?badge('فعال','ok'):badge('اعتبار تمام','warn')):badge('در انتظار تأیید','warn');
   body.append(el('div',{class:'salon'},[el('div',{class:'grow'},[h('strong',a.name+(a.trial?' (آزمایشی)':'')),h('small','/s/'+a.slug+' · '+fa(a.used)+' از '+fa(a.limit)+' اعتبار مصرف شده'+(a.by_kind?' ('+['single','views','spin'].map(function(k){return KIND_FA[k]+' '+fa(a.by_kind[k].count)}).join('، ')+')':'')),h('small',(a.host?a.host+' · ':'')+(a.manager?'کاربر مدیر: '+a.manager:'مدیر هنوز نام کاربری ندارد')+(!a.subdomain&&a.desired?' · زیردامنهٔ درخواستی: '+a.desired:''))]),line,
    el('button',{class:'btn btn--ghost btn--sm',type:'button',text:a.approved?'تعلیق':'تأیید حساب',onclick:act(function(){if(a.approved)return api('/api/owner/account',{slug:a.slug,approved:false}).then(load);var sub=a.subdomain||prompt('زیردامنهٔ انگلیسی مزون (مثلاً rose برای rose.'+location.hostname.replace(/^www\./,'')+'):',a.desired||(a.trial?'':a.slug));if(!sub)return;return api('/api/owner/account',{slug:a.slug,approved:true,subdomain:sub}).then(function(r){toast('تأیید شد'+(r.subdomain?' · زیردامنه: '+r.subdomain:''));return load()})})}),el('button',{class:'btn btn--ghost btn--sm',type:'button',text:'نام کاربری/رمز مدیر',onclick:act(function(){var u=prompt('نام کاربری مدیر (انگلیسی):',a.manager||'');if(!u)return;var pw=prompt('رمز عبور (حداقل ۸ نویسه):');if(!pw)return;return api('/api/owner/manager',{slug:a.slug,username:u,password:pw}).then(function(){toast('اطلاعات ورود مدیر ذخیره شد');return load()})})}),
    el('button',{class:'btn btn--ghost btn--sm',type:'button',text:'+۱۰۰ اعتبار',onclick:act(function(){return api('/api/owner/account',{slug:a.slug,add:100}).then(function(){toast('۱۰۰ اعتبار اضافه شد');return load()})})}),
    el('button',{class:'btn btn--ghost btn--sm',type:'button',text:'لینک پنل تازه',onclick:act(function(){if(!confirm('لینک فعلی پنل «'+a.name+'» از کار می‌افتد. لینک تازه ساخته شود؟'))return;return api('/api/owner/rotate-token',{slug:a.slug}).then(function(r){return navigator.clipboard.writeText(r.panel).catch(function(){}).then(function(){toast('لینک تازه ساخته و کپی شد.');return load()})})})}),
    el('button',{class:'btn btn--ghost btn--sm',type:'button',text:'کپی لینک پنل',onclick:act(function(){return navigator.clipboard.writeText(a.panel).then(function(){toast('لینک پنل کپی شد')})})})]))});
   if(!d.accounts.length)body.append(empty('leads',AQ.q||AQ.filter?'حسابی با این فیلتر نیست':'هنوز حسابی برای نمایش نیست',AQ.q||AQ.filter?'جست‌وجو یا فیلتر را عوض کنید.':'بعد از ساخت مزون اینجا دیده می‌شود.'));
  var tot=d.total||0,from=tot?AQ.offset+1:0,to=Math.min(tot,AQ.offset+AQ.limit);
  pager.replaceChildren(el('button',{class:'btn btn--ghost btn--sm',type:'button',text:'قبلی',disabled:AQ.offset<=0,onclick:function(){AQ.offset=Math.max(0,AQ.offset-AQ.limit);load()}}),h('span',fa(from)+' تا '+fa(to)+' از '+fa(tot)),el('button',{class:'btn btn--ghost btn--sm',type:'button',text:'بعدی',disabled:to>=tot,onclick:function(){AQ.offset+=AQ.limit;load()}}));
  pager.hidden=tot<=AQ.limit&&!AQ.offset;
  })}
 load().catch(function(e){body.classList.remove('is-refreshing');body.append(h('p',e.message,'empty-note'))});
 return box;
}
var MTH_FA={admin:'تنظیم دستی',recharge:'شارژ',refund:'بازگشت اعتبار',opening:'اعتبار اولیه'};
function weightsCard(){
 var box=el('section',{class:'card'},[h('h2','وزن اعتبار هر درخواست'),h('p','هر نوع تصویر چند اعتبار از مزون کم کند. عدد صحیح بین ۰ تا ۵۰.','lead')]),body=el('div',{class:'stack'});box.append(body);
 api('/api/owner/credit-weights').then(function(d){
  var fs=[['single','تصویر تکی'],['views','نمای سه‌زاویه'],['spin','چرخش ۳۶۰']].map(function(k){var f=field('w-'+k[0],k[1],String(d.weights[k[0]]),'number');var i=f.querySelector('input');i.min='0';i.max='50';i.step='1';i.setAttribute('inputmode','numeric');return f});
  body.replaceChildren(d.placeholder?h('p','این وزن‌ها فعلاً آزمایشی‌اند و بعد از مشخص‌شدن هزینهٔ واقعی تصویر باید دوباره تنظیم شوند.','notice notice--warn'):'',el('div',{class:'grid grid--2'},fs),el('button',{class:'btn btn--primary',type:'button',text:'ذخیرهٔ وزن‌ها',onclick:act(function(){var b={};['single','views','spin'].forEach(function(k){b[k]=parseInt($('#w-'+k).value,10)});return api('/api/owner/credit-weights',b).then(function(){toast('وزن‌ها ذخیره شد.')})})}));
 }).catch(function(e){body.append(h('p',e.message,'empty-note'))});
 return box;
}
var REF_FA={create:'ساخت مزون',migration:'اعتبار اولیه',system:'سیستم',owner:'مدیر پروژه',opening:'اعتبار اولیه'};
function ledgerCard(salons){
 var Q={salon:'',method:'',q:'',from:'',to:'',offset:0,limit:50};
 var box=el('section',{class:'card'},[h('h2','دفتر اعتبار'),h('p','هر شارژ، تنظیم دستی و بازگشت اعتبار با تاریخ و کسی که انجامش داده.','lead')]),body=el('div',{class:'stack'}),pager=el('div',{class:'pager'});
 var sel=el('select',{'aria-label':'مزون'},[el('option',{value:'',text:'همهٔ مزون‌ها'})].concat((salons||[]).map(function(x){return el('option',{value:x.slug,text:x.name})})));
 var mth=el('select',{'aria-label':'روش'},[el('option',{value:'',text:'همهٔ روش‌ها'})].concat(Object.keys(MTH_FA).map(function(k){return el('option',{value:k,text:MTH_FA[k]})})));
 var qi=el('input',{type:'search',placeholder:'جست‌وجوی مرجع یا نام','aria-label':'جست‌وجو'}),per=el('select',{'aria-label':'بازه'},[['','همهٔ زمان‌ها'],['7','۷ روز اخیر'],['30','۳۰ روز اخیر'],['90','۹۰ روز اخیر']].map(function(o){return el('option',{value:o[0],text:o[1]})}));
 var csv=el('a',{class:'btn btn--soft btn--sm',href:'#',download:'credit-ledger.csv',text:'خروجی CSV'}),qt=0;
 function qs(extra){var a=['salon','method','q','from','to'].filter(function(k){return Q[k]}).map(function(k){return k+'='+encodeURIComponent(Q[k])});return a.concat(extra||[]).join('&')}
  function load(){csv.href='/api/owner/ledger.csv?'+qs();body.classList.add('is-refreshing');
  return api('/api/owner/ledger?'+qs(['limit='+Q.limit,'offset='+Q.offset])).then(function(d){
   body.classList.remove('is-refreshing');
   if(!d.entries.length)body.replaceChildren(empty('leads','ردیفی نیست','با شارژ یا تنظیم اعتبار، اینجا ثبت می‌شود.'));
   else body.replaceChildren(el('div',{class:'stable'},[el('table',{},[el('thead',{},[el('tr',{},['تاریخ','مزون','مقدار','روش','مرجع','توسط','سقف بعد از تغییر'].map(function(t){return el('th',{text:t})}))]),el('tbody',{},d.entries.map(function(r){return el('tr',{},[el('td',{text:fmt(r.created_at)}),el('td',{text:r.name}),el('td',{text:(r.amount>0?'+':'')+fa(r.amount),dir:'ltr'}),el('td',{text:MTH_FA[r.method]||r.method}),el('td',{text:REF_FA[r.ref]||r.ref||'—'}),el('td',{text:REF_FA[r.by]||r.by||'—'}),el('td',{text:fa(r.limit_after)})])}))])]));
   var from=d.total?Q.offset+1:0,to=Math.min(d.total,Q.offset+Q.limit);
   pager.replaceChildren(el('button',{class:'btn btn--ghost btn--sm',type:'button',text:'قبلی',disabled:Q.offset<=0,onclick:function(){Q.offset=Math.max(0,Q.offset-Q.limit);load()}}),h('span',fa(from)+' تا '+fa(to)+' از '+fa(d.total)),el('button',{class:'btn btn--ghost btn--sm',type:'button',text:'بعدی',disabled:to>=d.total,onclick:function(){Q.offset+=Q.limit;load()}}));
  }).catch(function(e){body.classList.remove('is-refreshing');body.replaceChildren(h('p',e.message,'empty-note'))});
 }
 function change(){Q.salon=sel.value;Q.method=mth.value;Q.from=per.value?String(Date.now()-Number(per.value)*86400000):'';Q.offset=0;load()}
 [sel,mth,per].forEach(function(x){x.addEventListener('change',change)});qi.addEventListener('input',function(){clearTimeout(qt);qt=setTimeout(function(){Q.q=qi.value.trim();Q.offset=0;load()},300)});
 box.append(el('div',{class:'tools'},[qi,sel,mth,per,csv]),body,pager);load();return box;
}
function pendingCard(){
 var box=el('section',{class:'card'},[h('h2','درخواست‌های ثبت‌نام مزون'),h('p','مدیرهای مزون که ثبت‌نام کرده‌اند و منتظر تأیید شما هستند. با تأیید، زیردامنه ساخته می‌شود، پنل مدیریت باز می‌شود و برای مدیر پیامک و پیام ربات می‌رود.','lead')]),body=el('div',{class:'stack'});box.hidden=true;box.append(body);
 function report(a,r){
  var n=r.notified||{},bits=[];
  bits.push((n.bot&&n.bot.length)?'پیام ربات ('+n.bot.join('، ')+') فرستاده شد':'ربات مدیر وصل نیست؛ پیام ربات نرفت');
  bits.push(n.sms===true?'پیامک فرستاده شد':n.sms===false?'پیامک نرفت':'پیامک فعال نیست (متن تأییدشدهٔ پیامک تنظیم نشده)');
  (n.errors||[]).forEach(function(x){bits.push('هشدار: '+x)});
  return el('div',{class:'salon'},[el('div',{class:'grow'},[h('strong',a.name+' فعال شد'),h('small','https://'+r.subdomain+'.'+location.hostname.replace(/^www\./,'')+'  ·  /manager'),h('small',bits.join(' | '))])])
 }
 function load(){return api('/api/owner/accounts').then(function(d){
  var list=d.accounts.filter(function(a){return !a.approved});
  box.hidden=!list.length&&!body.children.length;
  Array.prototype.slice.call(body.querySelectorAll('.pend')).forEach(function(n){n.remove()});
  list.forEach(function(a){
   var sub=el('input',{type:'text',value:a.desired||'',placeholder:'زیردامنه، مثلاً rose'});sub.setAttribute('dir','ltr');sub.setAttribute('autocapitalize','off');
   sub.addEventListener('input',function(){sub.value=sub.value.toLowerCase().replace(/[^a-z0-9-]/g,'')});
   var row=el('div',{class:'salon pend'},[el('div',{class:'grow'},[h('strong',a.name),h('small',(a.phone?'تلفن \u2066'+a.phone+'\u2069 · ':'')+(a.manager?'کاربر: '+a.manager:'بدون نام کاربری')),badge(a.bot?'ربات مدیر وصل است':'ربات مدیر هنوز وصل نشده',a.bot?'ok':'warn'),sub]),
    el('button',{class:'btn btn--primary btn--sm',type:'button',text:'تأیید و فعال‌سازی',onclick:act(function(){
     var v=sub.value.trim();if(!v)throw new Error('زیردامنه را بنویسید');
     return api('/api/owner/account',{slug:a.slug,approved:true,subdomain:v}).then(function(r){toast('مزون فعال شد');row.replaceWith(report(a,r));return load()})})})]);
   body.append(row)});
 })}
 load().catch(function(e){box.hidden=false;body.append(h('p',e.message,'empty-note'))});
 return box;
}
function tabsView(defs,key){
 var bar=el('div',{class:'tabs',role:'tablist'}),box=el('div',{class:'tabpanels'}),btns=[],panes=[];
 function pick(i){btns.forEach(function(b,k){b.classList.toggle('is-on',k===i);b.setAttribute('aria-selected',k===i?'true':'false');b.tabIndex=k===i?0:-1});panes.forEach(function(x,k){x.hidden=k!==i});try{sessionStorage.setItem('tab:'+key,String(i))}catch(e){}}
 defs.forEach(function(t,i){var b=el('button',{class:'tab',type:'button',role:'tab',id:'tab-'+key+'-'+i,'aria-controls':'pn-'+key+'-'+i,text:t[0],onclick:function(){pick(i)}});b.addEventListener('keydown',function(e){var n=e.key==='ArrowLeft'?i+1:e.key==='ArrowRight'?i-1:e.key==='Home'?0:e.key==='End'?defs.length-1:-1;if(n<0||n>=defs.length)return;e.preventDefault();pick(n);btns[n].focus()});btns.push(b);bar.append(b);var pn=el('div',{class:'stack',role:'tabpanel',id:'pn-'+key+'-'+i,'aria-labelledby':'tab-'+key+'-'+i},t[1]);pn.hidden=true;panes.push(pn);box.append(pn)});
 var start=0;try{start=Math.min(defs.length-1,Number(sessionStorage.getItem('tab:'+key))||0)}catch(e){}
 pick(start);return el('div',{},[bar,box]);
}

function home(){return api('/api/owner').then(function(d){
 var head=el('div',{class:'page-head'},[el('div',{},[h('h1','داشبورد'),h('p','مشتری‌ها چطور از صفحه‌ها استفاده می‌کنند و مزون‌ها چقدر جواب می‌دهند. با تب‌های زیر بین مزون‌ها، آمار و تنظیمات جابه‌جا شوید.')])]);
 var list=el('div',{class:'salons'});
 d.salons.forEach(function(s){list.append(el('div',{class:'salon'},[el('div',{class:'grow'},[h('strong',s.name),h('small','/s/'+s.slug)]),badge(s.telegram&&s.bale?'تلگرام و بله وصل':s.telegram?'تلگرام وصل':s.bale?'بله وصل':'ربات وصل نیست',s.telegram||s.bale?'ok':'warn'),h('small',fa(s.portfolio)+' نمونه‌کار، '+fa(s.leads)+' درخواست'+(s.team?'، تیم '+fa(s.team_linked)+'/'+fa(s.team)+' وصل':'')),setupLine(s),(s.waiting||s.overdue)?el('div',{class:'row',style:'gap:6px'},[s.waiting?badge(fa(s.waiting)+' درخواست منتظر وصل شدن','warn'):null,s.overdue?badge(fa(s.overdue)+' بی‌جواب بیش از ۲۴ ساعت','danger'):null]):null,el('a',{class:'btn btn--ghost btn--sm',href:'/s/'+s.slug,target:'_blank',rel:'noopener',text:'صفحهٔ مشتری'}),el('a',{class:'btn btn--primary btn--sm',href:'/admin/'+s.slug,text:'تنظیمات'})]))});
 if(!d.salons.length)list.append(empty('dresses','هنوز مزونی ثبت نشده','از فرم «مزون تازه» اولین مزون را بسازید.'));
 var create=el('section',{class:'card'},[h('h2','مزون تازه'),field('name','نام مزون'),field('slug','نشانی انگلیسی صفحه','', 'text','فقط حروف انگلیسی، عدد و خط تیره؛ حروف بزرگ و فاصله خودکار درست می‌شوند.'),el('button',{class:'btn btn--primary',type:'button',text:'ساخت مزون',onclick:act(function(){return api('/api/salons',{name:$('#name').value,slug:$('#slug').value.trim()}).then(function(s){location.href='/admin/'+s.slug})})})]);
 // The page address is cleaned as it is typed: lowercase, spaces become dashes, nothing else allowed.
 (function(){var si=create.querySelector('#slug');if(!si)return;si.setAttribute('dir','ltr');si.setAttribute('autocapitalize','off');si.setAttribute('autocorrect','off');si.setAttribute('spellcheck','false');si.setAttribute('inputmode','url');si.setAttribute('placeholder','aliadli-salon');
  var prev=el('span',{class:'hint slug-preview'});si.closest('.field').append(prev);
  function show(){var v=si.value;prev.textContent=v?'صفحهٔ مشتری: '+location.host+'/s/'+v:''}
  si.addEventListener('input',function(){var c=si.value.toLowerCase().replace(/[\s_]+/g,'-').replace(/[^a-z0-9-]/g,'').replace(/-+/g,'-');if(c!==si.value)si.value=c;show()});show()})();
 $('#app').replaceChildren(head,pendingCard(),tabsView([['مزون‌ها',[el('div',{class:'grid grid--2'},[el('div',{class:'stack'},[list,create]),el('div',{class:'stack'},[accountsCard()])])]],['آمار',[dashboard(d.salons)]],['اعتبار',[weightsCard(),ledgerCard(d.salons)]],['هشدار و ربات',[alertsCard(d),botCard(d.bot)]],['سرویس‌ها',[smsCard(d.sms||{}),imageCard(d.image)]]],'admin')) ;
})}
function smsCard(sms){
 var st=function(ok,on,off){return el('li',{class:ok?'on':'off'},[el('span',{class:'dot',html:ok?IC.check:IC.dash}),h('span',ok?on:off)])};
 return el('section',{class:'card'},[h('h2','پیامک (ملی پیامک)'),h('p','کد تأیید موبایل مشتری، و لینک مزون که مدیر مزون از ربات برای مشتری می‌فرستد.','lead'),el('ul',{class:'status'},[
  st(sms.otp,'کد تأیید فعال است؛ مشتری قبل از ساخت شبیه‌سازی شمارهٔ خودش را تأیید می‌کند.','MELIPAYAMAK_TOKEN تنظیم نشده؛ تأیید شمارهٔ مشتری خاموش است.'),
  st(sms.invite,'پیامک لینک مزون از ربات فعال است.','MELIPAYAMAK_BODY_ID تنظیم نشده (شمارهٔ متن پیش‌فرض تأییدشده)؛ مدیر مزون هنوز نمی‌تواند لینک را پیامک کند.')
 ])]);
}
function imageCard(on){return el('section',{class:'card'},[h('h2','شبیه‌سازی تصویر'),el('ul',{class:'status'},[el('li',{class:on?'on':'off'},[el('span',{class:'dot',html:on?IC.check:IC.dash}),h('span',on?'کلید KIE تنظیم شده؛ مشتری‌ها می‌توانند مدل را روی عکس خودشان ببینند.':'KIE_API_KEY تنظیم نشده؛ مشتری فقط عکس و مدل را برای مزون می‌فرستد.')])])])}

function uploadBox(id,title,current,onDone){
 var input=el('input',{type:'file',accept:'image/jpeg,image/png,image/webp',id:id,class:'sr-only'});
 var img=el('span',{class:'uploadbox__img',html:current?'':'+'});if(current)img.append(el('img',{src:'/api/s/'+slug+'/media/'+current,alt:''}));
 var hint=h('small',current?'برای تعویض بزنید':'انتخاب عکس');
 var box=el('label',{class:'uploadbox',for:id},[img,el('span',{class:'uploadbox__txt'},[h('strong',title),hint]),input]);
 input.addEventListener('change',function(){var f=input.files&&input.files[0];if(!f)return;box.classList.add('is-busy');hint.textContent='در حال بارگذاری…';
  shrink(f).then(function(b){return api('/api/s/'+slug+'/upload?kind=brand',b,true)}).then(function(d){onDone(d.id);img.replaceChildren(el('img',{src:'/api/s/'+slug+'/media/'+d.id,alt:''}));hint.textContent='بارگذاری شد؛ «ذخیره» را بزنید'}).catch(function(e){toast(e.message,true);hint.textContent='دوباره امتحان کنید'}).then(function(){box.classList.remove('is-busy');input.value=''})});
 return box;
}
function shrink(file){return createImageBitmap(file).then(function(b){var c=document.createElement('canvas'),s=Math.min(1,1600/Math.max(b.width,b.height));c.width=Math.round(b.width*s);c.height=Math.round(b.height*s);c.getContext('2d').drawImage(b,0,0,c.width,c.height);b.close();return new Promise(function(r){c.toBlob(r,'image/jpeg',.85)})})}

function salonPage(){return api('/api/s/'+slug+'/owner').then(function(d){
 var S=d.salon,p=S.profile||{},images={logo:p.logo,cover:p.cover,portrait:p.portrait};
 document.title=S.name+' | مدیریت مزون آینه';
 var head=el('div',{class:'page-head'},[el('div',{},[MGR?null:el('a',{class:'back',href:'/admin',html:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg><span>همهٔ مزون‌ها</span>'}),h('h1',S.name),h('p','اطلاعاتی که اینجا وارد می‌کنید در بخش «دربارهٔ مزون» صفحهٔ مشتری دیده می‌شود.'),setupLine({setup:d.setup})]),el('div',{class:'row'},[MGR?null:el('a',{class:'btn btn--ghost',href:'/admin?salon='+encodeURIComponent(S.slug),text:'آمار این مزون'}),el('a',{class:'btn btn--ghost',href:MGR?'/':'/s/'+S.slug,target:'_blank',rel:'noopener',text:'دیدن صفحهٔ مشتری'})])]);

 // Telegram
 var linked=[S.telegram?'تلگرام':'',S.bale?'بله':''].filter(Boolean),on=linked.length>0;
 var tg=el('section',{class:'card'},[h('h2','ربات مزون')]);
 tg.append(el('div',{class:'tg-state tg-state--'+(on?'on':'off')},[el('span',{html:TG}),el('div',{},[h('b',on?'وصل است: '+linked.join(' و '):'هنوز وصل نیست'),h('span',on?'درخواست مشتری‌ها برای مزون می‌رود؛ مزون زیرش یک دکمه می‌زند و مشتری خبردار می‌شود. هر عکسی که مزون بفرستد نمونه‌کار می‌شود.':'تا وصل نشود، مشتری‌ها نمی‌توانند درخواست آنلاین بفرستند و فقط اطلاعات تماس مزون را می‌بینند.')])]));
 var linkOut=el('div');
 var copyRow=function(label,url){return el('div',{class:'linkbox'},[h('b',label,'linkbox__label'),el('code',{text:url}),el('button',{class:'btn btn--soft btn--sm',type:'button',text:'کپی',onclick:function(){navigator.clipboard&&navigator.clipboard.writeText(url).then(function(){toast('لینک کپی شد.')})}})])};
 function pollBot(){var n=0,t=setInterval(function(){api('/api/s/'+slug+'/owner').then(function(x){if(x.salon.telegram||x.salon.bale){clearInterval(t);toast('ربات وصل شد');salonPage()}}).catch(function(){});if(++n>60)clearInterval(t)},3000)}
 function connectBot(pl){var w=window.open('about:blank','_blank');return api('/api/s/'+slug+'/owner/telegram-link',{}).then(function(r){var url=(r.links||{})[pl];if(!url){if(w)w.close();throw new Error('ربات هنوز تنظیم نشده')}if(w)w.location.href=url;else location.href=url;toast('در برنامه دکمهٔ Start را بزنید؛ اتصال خودکار انجام می‌شود…');pollBot()})}
 [['telegram',d.bot.telegram,'تلگرام'],['bale',d.bot.bale,'بله']].forEach(function(x){if(x[1]&&x[1].ready&&x[1].username)tg.append(el('button',{class:'btn btn--primary',type:'button',style:'margin-inline-end:8px;margin-top:8px',text:(on?'اتصال دوباره به ':'اتصال به ')+x[2],onclick:act(function(){return connectBot(x[0])})}))});
 if(!(d.bot.telegram&&d.bot.telegram.ready&&d.bot.telegram.username)&&!(d.bot.bale&&d.bot.bale.ready&&d.bot.bale.username))tg.append(el('p',{class:'notice notice--warn',text:'ربات هنوز روی سایت تنظیم نشده است.'}));
 if(!on)tg.append(el('p',{class:'tiny muted',style:'margin-top:8px',text:'روی دکمه بزنید تا برنامه باز شود؛ آنجا فقط «Start» را بزنید و همه‌چیز خودکار وصل می‌شود.'}));

 tg.append(linkOut);
 [['telegram','تلگرام',S.telegram],['bale','بله',S.bale]].forEach(function(x){if(x[2])tg.append(el('button',{class:'btn btn--danger btn--sm',type:'button',style:'margin-top:12px;margin-inline-end:8px',text:'قطع '+x[1],onclick:act(function(){if(!confirm('اتصال '+x[1]+' این مزون قطع شود؟'))return;return api('/api/s/'+slug+'/owner/telegram-unlink',{platform:x[0]}).then(salonPage)})}))});

 // Team: members with their own bot chat and permanent referral link
 var teamList=el('div',{class:'team'});
 (d.team||[]).forEach(function(t){
  var out=el('div',{class:'team__out'});
  var links=[t.telegram?'تلگرام':'',t.bale?'بله':''].filter(Boolean);
  var others=(d.team||[]).filter(function(x){return x.id!==t.id});
  teamList.append(el('div',{class:'team__row'},[
   el('div',{},[h('b',t.name),el('br'),h('small',(t.specialty?t.specialty+' · ':'')+(links.length?'وصل در '+links.join(' و '):'هنوز ربات را وصل نکرده'))]),
   el('div',{class:'team__acts'},[
    el('button',{class:'btn btn--soft btn--sm',type:'button',text:'لینک‌ها',onclick:act(function(){return api('/api/s/'+slug+'/owner/team/link',{id:t.id}).then(function(r){var L=r.links||{};out.replaceChildren.apply(out,[copyRow('لینک اختصاصی (برای مشتری‌ها)',r.ref),L.telegram?copyRow('دعوت در تلگرام',L.telegram):null,L.bale?copyRow('دعوت در بله',L.bale):null,el('p',{class:'tiny muted',text:'لینک دعوت را برای خود '+t.name+' بفرستید (یک‌بار مصرف، ۷ روز). لینک اختصاصی همیشگی است و هر کس با آن بیاید، و هر کس که او برایش بفرستد، مشتری '+t.name+' می‌شود.'})].filter(Boolean))})})}),
    el('button',{class:'btn btn--danger btn--sm',type:'button',text:'حذف',onclick:function(){
     var sel=el('select',{},[el('option',{value:'',text:'خود مزون (مدیر)'})].concat(others.map(function(x){return el('option',{value:x.id,text:x.name})})));
     out.replaceChildren(el('div',{class:'field'},[el('span',{class:'lbl',text:'مشتری‌ها و لینک‌های '+t.name+' به چه کسی برسند؟'}),sel,el('span',{class:'hint',text:'نمونه‌کارهای '+t.name+' از صفحه برداشته می‌شود.'})]),el('button',{class:'btn btn--danger btn--sm',type:'button',text:'حذف '+t.name,onclick:act(function(){return api('/api/s/'+slug+'/owner/team/remove',{id:t.id,to:sel.value||null}).then(function(){toast(t.name+' حذف شد.');return salonPage()})})}));
    }})
   ]),out
  ]));
 });
 var nName=el('input',{id:'t-name',type:'text',maxlength:'60',placeholder:'مثلاً مریم محمدی'}),nSpec=el('select',{id:'t-spec'},(d.specialties||[]).map(function(x){return el('option',{value:x,text:x})}));
 var addOut=el('div');
 var teamC=el('section',{class:'card'},[h('h2','تیم مزون'),h('p','هر مدیر مزون ربات را با گفتگوی خودش وصل می‌کند و یک لینک اختصاصی همیشگی می‌گیرد. هر کس با لینک او بیاید و هر کس که او لینک را برایش بفرستد، مشتری همان مدیر مزون می‌شود و درخواستش فقط به خود او می‌رسد. مدیر مزون هم می‌تواند در ربات با /team نیرو اضافه کند.','lead'),
  (d.team||[]).length?teamList:h('p','هنوز نیرویی اضافه نشده.','empty-note'),
  el('div',{class:'team__add'},[el('label',{class:'field'},[el('span',{class:'lbl',text:'اسم نیرو'}),nName]),el('label',{class:'field'},[el('span',{class:'lbl',text:'تخصص'}),nSpec]),el('button',{class:'btn btn--primary',type:'button',text:'افزودن',onclick:act(function(){return api('/api/s/'+slug+'/owner/team',{name:nName.value,specialty:nSpec.value}).then(function(r){var L=r.links||{};return salonPage().then(function(){toast(r.member.name+' اضافه شد؛ لینک‌هایش را از «لینک‌ها» بفرستید.')})})})})]),addOut]);

 // Profile
 var prof=el('section',{class:'card'},[h('h2','دربارهٔ مزون'),h('p','همهٔ این‌ها اختیاری است جز نام.','lead'),
  el('div',{class:'uploads'},[uploadBox('up-logo','لوگو',p.logo,function(id){images.logo=id}),uploadBox('up-cover','عکس کاور',p.cover,function(id){images.cover=id}),uploadBox('up-portrait','عکس مدیر',p.portrait,function(id){images.portrait=id})]),
  field('f-name','نام مزون',S.name),field('f-bio','معرفی کوتاه',p.bio,'area'),
  el('div',{class:'two'},[field('f-manager','نام مدیر مزون',p.manager),field('f-hours','ساعات کاری',p.hours,'text','مثل شنبه تا پنج‌شنبه ۱۰ تا ۲۰'),field('f-phone','شمارهٔ تماس',p.phone?p.phone.replace(/^\+98/,'0'):'','tel'),field('f-city','شهر',p.city),field('f-address','آدرس',p.address)]),
  el('div',{class:'two'},[field('f-map','لینک نقشه',p.map,'url'),field('f-instagram','لینک اینستاگرام',p.instagram,'url'),field('f-telegram','لینک کانال یا آیدی تلگرام',p.telegram,'url'),field('f-website','وب‌سایت',p.website,'url')]),
  el('button',{class:'btn btn--primary',type:'button',text:'ذخیره',onclick:act(function(){var out={};['bio','manager','hours','phone','city','address','map','instagram','telegram','website'].forEach(function(k){out[k]=$('#f-'+k).value.trim()});if(out.telegram&&!/^https?:/.test(out.telegram))out.telegram='https://t.me/'+out.telegram.replace(/^@/,'');if(out.instagram&&!/^https?:/.test(out.instagram))out.instagram='https://instagram.com/'+out.instagram.replace(/^@/,'');Object.assign(out,images);return api('/api/s/'+slug+'/owner/profile',{name:$('#f-name').value,profile:out}).then(function(){toast('ذخیره شد.')})})})]);

 // Settings
 var model=el('select',{id:'s-model'},[el('option',{value:'pro',text:'بهترین کیفیت (Nano Banana Pro، حدود ۱۸ هزار تومان)'}),el('option',{value:'fast',text:'معمولی (Nano Banana 2، حدود ۱۲ هزار تومان برای هر تصویر)'})]);model.value=S.settings.image_model==='fast'?'fast':'pro';
 var set=el('section',{class:'card'},[h('h2','شبیه‌سازی'),el('label',{class:'field'},[el('span',{class:'lbl',text:'مدل ساخت تصویر'}),model,el('span',{class:'hint',text:'Pro طبیعی‌تر است و چهره را بهتر نگه می‌دارد، ولی هر تصویر حدود دو برابر هزینه دارد.'})]),check('s-gen','مشتری بتواند مدل را روی عکس خودش ببیند'+(d.image?'':' (کلید KIE هنوز تنظیم نشده)'),S.settings.generation_enabled),check('s-cat','نمایش لباس‌های نمونهٔ آماده به مشتری (پیش‌فرض خاموش: فقط لباس‌های خود مزون)',S.settings.catalog),check('s-own','مشتری بتواند عکس لباس دلخواه خودش را بارگذاری کند',S.settings.allow_own_dress),check('s-ref','انتقال از «عکس مدل من» و نمونه‌کارها آزمایش شده و کیفیتش تأیید شده است',S.settings.reference_verified),el('label',{class:'field'},[el('span',{class:'lbl',text:'سقف تصویر روزانهٔ این مزون'}),el('input',{id:'s-cap',type:'number',min:'0',step:'1',inputmode:'numeric',value:String(Number.isInteger(S.settings.daily_limit)?S.settings.daily_limit:50)}),el('span',{class:'hint',text:'جمع تصویرهایی که همهٔ مشتری‌ها در یک روز می‌سازند. ۰ یعنی بدون سقف. هر نفر جدا از این، در هر بخش ۳ تصویر دارد.'})]),(function(){var f=field('s-quota','تعداد امتحان هر عروس در هر بخش',String(S.settings.quota_per_line||4),'number','عددی بین ۱ تا ۲۰؛ پیش‌فرض ۴.');var i=f.querySelector('input');i.min='1';i.max='20';return f})(),el('label',{class:'field'},[el('span',{class:'lbl',text:'پاک شدن خودکار عکس مشتری‌ها (روز)'}),el('input',{id:'s-keep',type:'number',min:'0',max:'3650',step:'1',inputmode:'numeric',value:String(Number.isInteger(S.settings.retention_days)?S.settings.retention_days:30)}),el('span',{class:'hint',text:'عکس و نتیجه‌ای که مشتری برای مزون نفرستاده بعد از این تعداد روز پاک می‌شود. عکس درخواست‌ها تا بسته شدن درخواست و این تعداد روز بعدش می‌ماند. ۰ یعنی هیچ‌وقت پاک نشود.'})]),el('button',{class:'btn btn--ghost',type:'button',text:'ذخیرهٔ تنظیمات',onclick:act(function(){return api('/api/s/'+slug+'/owner/settings',{daily_limit:(function(v){return isNaN(v)?50:Math.max(0,v)})(parseInt($('#s-cap').value,10)),generation_enabled:$('#s-gen').checked,reference_verified:$('#s-ref').checked,catalog:$('#s-cat').checked,allow_own_dress:$('#s-own').checked,image_model:$('#s-model').value,quota_per_line:(function(v){return v>=1&&v<=20?v:4})(parseInt($('#s-quota').value,10)),retention_days:(function(v){return isNaN(v)?30:Math.max(0,v)})(parseInt($('#s-keep').value,10))}).then(function(){toast('تنظیمات ذخیره شد.')})})})]);

 // Portfolio
 var ports=el('div',{class:'ports'});
 function pinfo(it){var mode=el('select',{'aria-label':'نوع'},[['','نوع عرضه'],['sale','فروش'],['rent','اجاره'],['both','فروش و اجاره']].map(function(o){return el('option',{value:o[0],text:o[1]})})),stock=el('select',{'aria-label':'موجودی'},[['','موجودی'],['available','موجود'],['ask','بپرسید']].map(function(o){return el('option',{value:o[0],text:o[1]})})),price=el('input',{type:'text',maxlength:'60',placeholder:'قیمت (مثلاً ۱۲ تا ۱۵ میلیون)',value:it.price||''});mode.value=it.mode||'';stock.value=it.stock||'';var save=function(){return api('/api/s/'+slug+'/owner/portfolio/info',{id:it.id,mode:mode.value,price:price.value,stock:stock.value})};[mode,stock,price].forEach(function(x){x.addEventListener('change',function(){save().catch(function(){})})});var inq=el('button',{class:'btn btn--sm',type:'button',text:'استعلام',title:'قیمت نمایش داده نشود؛ مشتری برای استعلام تماس بگیرد',onclick:function(){price.value='استعلام قیمت: تماس بگیرید';save().catch(function(){})}});return el('div',{class:'row'},[mode,stock,price,inq])}
 d.portfolio.forEach(function(it){var ids=[];try{ids=JSON.parse(it.images)}catch(e){}ports.append(el('div',{class:'port'},[ids[0]?el('img',{src:'/api/s/'+slug+'/media/'+ids[0],alt:'',loading:'lazy'}):null,h('b',it.title),it.stylist?h('small','کار '+it.stylist):null,ids.length<2?h('small','فقط '+ids.length+' عکس؛ برای ویدیوی ۳۶۰ حداقل نمای جلو و پشت لازم است'):null,pinfo(it),el('button',{class:'btn btn--danger btn--sm',type:'button',text:'حذف',onclick:act(function(){if(!confirm('«'+it.title+'» از صفحهٔ مزون حذف شود؟'))return;return api('/api/s/'+slug+'/owner/portfolio/delete',{id:it.id}).then(salonPage)})})]))});
 // Add from here too: pick photos, a title for each (the file name by default) and the section.
 var addFiles=el('input',{type:'file',accept:'image/jpeg,image/png,image/webp',multiple:'multiple'}),addList=el('div',{class:'port-add__list'});
 addFiles.addEventListener('change',function(){addList.replaceChildren.apply(addList,Array.prototype.map.call(addFiles.files,function(f){return el('input',{type:'text',maxlength:'150',value:f.name.replace(/\.[a-z]+$/i,'').replace(/[-_]+/g,' '),'aria-label':'اسم کار '+f.name})}))});
 var addBtn=el('button',{class:'btn btn--primary',type:'button',text:'افزودن به صفحه',onclick:act(function(){var fs=Array.prototype.slice.call(addFiles.files);if(!fs.length){toast('اول عکس انتخاب کنید',true);return}var names=Array.prototype.map.call(addList.querySelectorAll('input'),function(i){return i.value.trim()});
  return fs.reduce(function(p,f,i){return p.then(function(){return api('/api/s/'+slug+'/upload?kind=portfolio',f,true).then(function(m){return api('/api/s/'+slug+'/owner/portfolio/add',{media_id:m.id,title:names[i]||'نمونه‌کار',line:'dress'})})})},Promise.resolve()).then(function(){toast(fs.length+' نمونه‌کار اضافه شد.');salonPage()})})});
 // Quick dress intake: 4 real photos of ONE dress from different angles. They feed the try-on image and the 360 video.
 var SLOTS=[['جلو','لباس را از روبه‌رو، تمام‌قد و روی مانکن یا آویز بگیرید',true],['کنار','نمای کنار برای حجم و دامن',false],['پشت','پشت لباس: بستن، چین و دنبالهٔ لباس',true],['جزئیات','نمای نزدیک از پارچه، گیپور یا کار دست',false]];
 var dTitle=el('input',{type:'text',maxlength:'150',placeholder:'اسم لباس (مثلاً پرنسسی آستین‌دار)','aria-label':'اسم لباس'}),dFiles=[],dBox=el('div',{class:'ports'});
 var slotEls=SLOTS.map(function(s,i){var inp=el('input',{type:'file',accept:'image/jpeg,image/png,image/webp','aria-label':'عکس '+s[0]}),pv=el('img',{alt:'',style:'display:none;max-width:100%;max-height:110px;border-radius:8px'});
  inp.addEventListener('change',function(){var f=inp.files[0];dFiles[i]=f||null;if(f){pv.src=URL.createObjectURL(f);pv.style.display='block'}else pv.style.display='none'});
  return el('label',{class:'field'},[el('span',{class:'lbl',text:'نمای '+s[0]+(s[2]?' (لازم)':' (اختیاری)')}),el('span',{class:'hint',text:s[1]}),inp,pv])});
 var dBtn=el('button',{class:'btn btn--primary',type:'button',text:'ثبت لباس با عکس‌های زاویه‌دار',onclick:act(function(){
  if(!dFiles[0]||!dFiles[2]){toast('عکس جلو و پشت لباس لازم است',true);return}
  var title=dTitle.value.trim();if(!title){toast('اسم لباس را بنویسید',true);return}
  var ids=[];return dFiles.reduce(function(p,f,i){return p.then(function(){if(!f)return;return api('/api/s/'+slug+'/upload?kind=portfolio',f,true).then(function(m){ids.push(m.id)})})},Promise.resolve())
   .then(function(){return api('/api/s/'+slug+'/owner/portfolio/add',{media_ids:ids,title:title,line:'dress'})}).then(function(){toast('لباس با '+ids.length+' عکس ثبت شد.');salonPage()})})});
 var intake=el('div',{class:'port-add'},[h('b','ثبت سریع لباس (۴ زاویه)'),h('p','برای ساخت عکس و ویدیوی درست، از هر لباس واقعی ۴ نما بگیرید: جلو، کنار، پشت و جزئیات. نور یکنواخت و پس‌زمینهٔ ساده؛ لباس کامل در کادر.','lead'),dTitle].concat(slotEls,[dBtn]));
 var add=el('div',{class:'port-add'},[h('b','افزودن نمونه‌کار از همین‌جا'),el('label',{class:'field'},[el('span',{class:'lbl',text:'عکس‌ها'}),addFiles]),addList,addBtn]);
 var port=el('section',{class:'card'},[h('h2','نمونه‌کارها'),h('p','مزون عکس را برای ربات تلگرام می‌فرستد و همان لحظه اینجا و روی صفحهٔ مشتری می‌نشیند. از همین‌جا هم می‌توانید اضافه کنید.','lead'),d.portfolio.length?ports:empty('dresses','هنوز نمونه‌کاری نیامده','اولین لباس را با فرم «ثبت لباس با عکس» پایین همین کارت اضافه کنید.'),intake,add]);

 var leads=leadsCard(slug),social=socialCard(slug);


 // SMS: the manager texts the page link to a customer from the approved shared-line text
 var smsIn=el('textarea',{rows:'2',placeholder:'۰۹۱۲۱۲۳۴۵۶۷  ۰۹۳۵۱۲۳۴۵۶۷'}),smsOut=el('div',{class:'stack'});smsIn.setAttribute('dir','ltr');
 var smsC=el('section',{class:'card'},[h('h2','پیامک لینک برای مشتری'),h('p','شمارهٔ موبایل مشتری را بنویسید (تا ۵ شماره، با فاصله یا ویرگول جدا)؛ لینک صفحهٔ مزون برایش پیامک می‌شود تا لباس را روی خودش امتحان کند.','lead')]);
 if(d.sms_invite)smsC.append(smsIn,el('button',{class:'btn btn--primary',type:'button',text:'ارسال پیامک',onclick:act(function(){return api('/api/s/'+slug+'/owner/invite',{numbers:smsIn.value}).then(function(r){smsOut.replaceChildren.apply(smsOut,r.results.map(function(x){return h('small',(x.ok?'ارسال شد: ':'نرفت: ')+x.phone+(x.msg?' — '+x.msg:' — فرستاده شد'))}));if(r.results.some(function(x){return x.ok}))smsIn.value=''})})}),smsOut);
 else smsC.append(h('p','ارسال پیامک هنوز فعال نشده است. تا آن موقع می‌توانید لینک صفحه را از ربات یا پیام‌رسان‌ها برای مشتری بفرستید.','notice notice--warn'));
 var pageUrl=location.origin+(MGR&&location.hostname.split('.').length>2?'/':'/s/'+slug);
 var share=el('section',{class:'card'},[h('h2','لینک صفحهٔ مزون'),h('p','این لینک را به مشتری‌ها بدهید یا در اینستاگرام بگذارید.','lead'),copyRow('صفحهٔ مشتری‌ها',pageUrl),(function(){var q=qrcode(0,'M');q.addData(pageUrl);q.make();var svg=q.createSvgTag({cellSize:6,margin:2,scalable:true});var wrap=el('div',{class:'qrbox',dir:'ltr',html:svg,style:'width:180px;max-width:100%;margin:14px auto 6px;background:#fff;padding:8px;border-radius:14px'});var row=el('div',{class:'row',style:'display:flex;gap:8px;flex-wrap:wrap;justify-content:center'},[el('button',{class:'btn btn--soft btn--sm',type:'button',text:'اشتراک‌گذاری',onclick:function(){if(navigator.share)navigator.share({title:'امتحان لباس عروس',url:pageUrl}).catch(function(){});else{navigator.clipboard&&navigator.clipboard.writeText(pageUrl);toast('لینک کپی شد.')}}}),el('button',{class:'btn btn--soft btn--sm',type:'button',text:'چاپ QR',onclick:function(){var w=window.open('','_blank');if(!w)return;w.document.write('<!doctype html><meta charset=utf-8><title>QR</title><body style="text-align:center;font-family:sans-serif;padding:40px"><div style="width:320px;margin:auto">'+svg+'</div><p>برای امتحان لباس، کد را با گوشی اسکن کنید</p>');w.document.close();w.focus();w.print()}})]);return el('div',{},[wrap,row])})()]);
 var SK='shared:'+slug;share.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('button,a')){try{localStorage.setItem(SK,'1')}catch(x){}}});
 function checklistCard(){
  var shared=false;try{shared=!!localStorage.getItem(SK)}catch(x){}
  var items=[['بارگذاری ۳ لباس',(d.portfolio||[]).length>=3,'نمونه‌کارها'],['وصل کردن ربات',!!(S.telegram||S.bale),'ارتباط با مشتری'],['اشتراک‌گذاری لینک یا QR',shared,null],['اولین درخواست مشتری',(d.leads||[]).length>0,'درخواست‌ها']];
  if(items.every(function(x){return x[1]}))return null;
  var done=items.filter(function(x){return x[1]}).length;
  var ol=el('ol',{});
  items.forEach(function(x,i){ol.append(el('li',{class:x[1]?'is-done':''},[el('b',{html:x[1]?IC.check:'',text:x[1]?undefined:fa(i+1)}),el('span',{text:x[0]}),x[2]&&!x[1]?el('button',{class:'btn btn--soft btn--sm',type:'button',style:'margin-inline-start:auto',text:'برو',onclick:function(){var t=Array.prototype.filter.call(document.querySelectorAll('button.tab'),function(b){return b.textContent===x[2]})[0];if(t)t.click();window.scrollTo({top:0,behavior:'smooth'})}}):null]))});
  return el('section',{class:'card checklist'},[h('h2','شروع سریع'),h('p',fa(done)+' از '+fa(items.length)+' قدم انجام شده. با این چهار قدم مزون آمادهٔ دریافت مشتری می‌شود.','lead'),ol]);
 }
 var cl=MGR?checklistCard():null;
 function tabs(defs){return tabsView(defs,slug)}
 var defs=MGR?[['نمای کلی',[cl,dashboard([{slug:MGR,name:S.name}]),share,mgrCredits()]],['درخواست‌ها',[leads]],['نمونه‌کارها',[port,social]],['مشخصات مزون',[prof]],['تیم',[teamC]],['ارتباط با مشتری',[tg,smsC]],['تنظیمات',[quotaCard(S),passwordCard(),rotateCard()]]]
  :[['نمای کلی',[share]],['درخواست‌ها',[leads]],['نمونه‌کارها',[port,social]],['مشخصات مزون',[prof]],['تیم',[teamC]],['ارتباط با مشتری',[tg,smsC]],['تنظیمات',[set]]];
 if(MGR)dashState.salon=MGR;
 $('#app').replaceChildren(head,tabs(defs));
})}
$('#logout').addEventListener('click',function(){(MGR?api('/api/s/'+MGR+'/manager/logout',{}):api('/api/logout',{})).then(function(){location.href='/'})});
`;

export const appHTML=String.raw`<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#e8edeb"><meta name="robots" content="noindex"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/manifest.webmanifest"><link rel="preload" href="/fonts/vazirmatn-arabic.woff2" as="font" type="font/woff2" crossorigin><title>مزون آینه | مدیریت مزون‌ها</title><style>__CSS__</style></head><body>
<a class="skip" href="#app">پرش به محتوای اصلی</a>
<header class="appbar"><a href="/admin" class="appbar__brand">__MARKHTML__<span>مزون آینه</span></a><button class="btn btn--ghost btn--sm" id="logout" type="button" hidden>خروج</button></header>
<main id="app"><div class="loading">در حال باز کردن…</div></main>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
<footer class="foot">مزون آینه: شبیه‌سازی پیشنهادی برای انتخاب لباس عروس.</footer>
<script>__JS__</script>
</body></html>`
 .replace('__CSS__',()=>baseCSS+css)
 .replace('__MARKHTML__',()=>markSVG)
 .replace('__JS__',()=>clientJS.replace('/*__QR__*/',()=>QR_JS).replace('__MARK__',()=>JSON.stringify(markSVG)).replace('__ILLO__',()=>JSON.stringify(illos)));
