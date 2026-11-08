// Owner console (/ and /admin). Salons have no panel: they use the Telegram bot.
// Only the project owner signs in here to create salons, fill in their details and hand
// each salon its one-time Telegram link.
import {baseCSS,markSVG} from './design.js';

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
.act small{color:var(--muted);font-size:11.5px}.act--warn{background:#fbf1de}.act--danger{background:#f8e3e0}.act--ok{background:#e2f1ea}
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
.rtree details>summary .node::before{content:'▸';font-size:11px;color:var(--muted)}
.rtree details[open]>summary .node::before{content:'▾'}
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
.cols__y{display:flex;flex-direction:column;justify-content:space-between;font-size:11.5px;color:var(--muted);padding-bottom:22px;text-align:left}
.cols__grid{display:grid;grid-template-rows:1fr auto;min-width:0}
.cols{display:flex;align-items:flex-end;gap:2px;border-bottom:1px solid var(--line);background:linear-gradient(var(--line-2),var(--line-2)) 0 0/100% 1px no-repeat,linear-gradient(var(--line-2),var(--line-2)) 0 50%/100% 1px no-repeat;direction:ltr}
.col{flex:1;height:100%;display:flex;align-items:flex-end;justify-content:center;outline-offset:1px}
.col__bar{display:block;width:100%;max-width:24px;border-radius:4px 4px 0 0}
.col__bar--muted{background:#9fb0a9}.col__bar--accent{background:var(--accent)}
.col.is-today .col__bar--muted{background:var(--ink-2)}
.col:hover .col__bar,.col:focus .col__bar{filter:brightness(1.12)}
.cols__x{display:flex;justify-content:space-between;font-size:11.5px;color:var(--muted);padding-top:6px;direction:ltr}
.dtip{position:fixed;left:0;top:0;z-index:200;background:var(--ink);color:#fff;padding:8px 12px;border-radius:10px;font-size:13px;pointer-events:none;box-shadow:var(--float)}
.dtip__main{font-weight:700}.dtip__sub{opacity:.75;font-size:12px}
.dtable{font-size:13px}
.dtable summary{cursor:pointer;color:var(--accent-ink);font-weight:600;font-size:12.5px}
.dtable table,.stable table{width:100%;border-collapse:collapse;margin-top:8px}
.dtable th,.dtable td,.stable th,.stable td{padding:7px 8px;border-bottom:1px solid var(--line-2);text-align:right}
.dtable td:not(:first-child),.stable td:not(:first-child){font-variant-numeric:tabular-nums}
.stable{overflow-x:auto}
.stable th{font-size:12.5px;color:var(--muted);font-weight:600}
.linkbox__label{font-size:12.5px;flex:none}

.appbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 20px;max-width:1080px;margin:0 auto}
.appbar__brand{display:inline-flex;align-items:center;gap:9px;color:var(--ink);font-family:var(--display);font-weight:800;font-size:22px}
.appbar__brand svg{width:22px;height:28px}
main#app{max-width:1080px;margin:0 auto;padding:6px 20px 80px;min-height:70vh}
.page-head{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;flex-wrap:wrap;margin:10px 0 22px}
.page-head h1{font-family:var(--display);font-weight:800;font-size:clamp(26px,6vw,34px)}
.page-head p{color:var(--muted);margin-top:4px;max-width:60ch;line-height:1.9}
.back{display:inline-flex;align-items:center;gap:6px;font-size:13.5px;font-weight:600;margin-bottom:6px}
.grid{display:grid;gap:16px}
@media(min-width:900px){.grid--2{grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);align-items:start}}
.card{background:var(--surface);border:1px solid var(--line-2);border-radius:22px;padding:22px;box-shadow:0 1px 2px rgba(35,23,15,.05)}
.card>h2{font-family:var(--display);font-weight:800;font-size:21px;margin-bottom:6px}
.card>.lead{color:var(--muted);font-size:13.5px;line-height:1.9;margin-bottom:16px}
.stack{display:grid;gap:16px}
.salons{display:grid;gap:12px}
.salon{display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:16px 18px;border-radius:18px;background:var(--surface);border:1px solid var(--line-2)}
.salon strong{font-size:17px;display:block}
.salon small{color:var(--muted);font-size:12.5px;direction:ltr;display:inline-block}
.salon .grow{min-width:160px}
.status{list-style:none;margin:0;padding:0;display:grid;gap:4px}
.status li{display:flex;gap:10px;align-items:flex-start;font-size:13.5px;line-height:1.75;padding:5px 0}
.status .dot{width:22px;height:22px;border-radius:50%;flex:none;display:grid;place-items:center;font-size:12px;font-weight:700;margin-top:1px}
.status .on .dot{background:var(--ok-soft);color:var(--ok)}
.status .off{color:var(--muted)}
.status .off .dot{background:var(--glass-2)}
.linkbox{display:flex;gap:8px;align-items:center;margin-top:12px;padding:10px 10px 10px 14px;border-radius:14px;background:var(--glass)}
.linkbox code{flex:1;min-width:0;direction:ltr;text-align:left;font-size:13px;overflow-wrap:anywhere}
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
.field input[type=url],.field input[type=tel],#slug{direction:ltr;text-align:right}
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
.empty-note{color:var(--muted);font-size:13.5px;line-height:1.9;padding:8px 0}
.login{max-width:420px;margin:30px auto 0}
.login .mirror{width:120px;margin:0 auto 18px}
.login .mirror__glass{aspect-ratio:3/4;display:grid;place-items:center}
.login .mirror__glass span{display:block;width:40%;position:relative;z-index:1}
.login h1{font-family:var(--display);font-weight:800;font-size:28px;text-align:center}
.login p{text-align:center;color:var(--muted);margin:6px 0 18px;line-height:1.9}
.loading{padding:60px 20px;text-align:center;color:var(--muted)}
.foot{padding:26px 20px 34px;text-align:center;color:var(--muted);font-size:12px}
`;

const clientJS=String.raw`
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
var path=location.pathname.split('/').filter(Boolean),slug=path[0]==='admin'?path[1]||'':'';
var TG='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.4 4.2 2.9 11.3c-1.2.5-1.2 1.2-.2 1.5l4.7 1.5 1.8 5.6c.2.6.1.9.8.9.5 0 .7-.2 1-.5l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.9-1.4-1.5zM9.2 14.6l8.6-5.4c.4-.2.8-.1.5.2l-7.3 6.6-.3 3z"/></svg>';

(function boot(){api('/api/me').then(function(me){
 if(!me.owner){return login(me)}
 $('#logout').hidden=false;
 return slug?salonPage():home();
}).catch(function(e){$('#app').replaceChildren(el('div',{class:'loading',text:e.message}))})})();

function login(me){
 var box=el('section',{class:'card login'},[el('div',{class:'mirror'},[el('div',{class:'mirror__glass'},[el('span',{html:MARK})])]),h('h1','مدیریت مزون آینه'),h('p','اینجا فقط برای مدیر مزون آینه است. مزون‌ها با ربات تلگرام کار می‌کنند و مشتری‌ها از لینک اختصاصی مزون وارد می‌شوند.')]);
 if(me.passwordLogin){var f=field('pw','رمز مدیر','', 'password');var go=el('button',{class:'btn btn--primary btn--block',type:'button',text:'ورود',onclick:act(function(){return api('/api/login',{password:$('#pw').value}).then(function(){location.reload()})})});f.querySelector('input').addEventListener('keydown',function(e){if(e.key==='Enter')go.click()});box.append(f,go)}
 else box.append(el('p',{class:'notice notice--warn',text:'ورود با رمز روی این میزبان تنظیم نشده است (OWNER_PASSWORD و SESSION_SECRET).'}));
 $('#app').replaceChildren(box);
}

/* ---------- dashboard ---------- */
// Forms follow the dataviz method: KPI tiles for headline numbers, ranked horizontal bars for
// the funnel and top lists (one hue), columns for days (one hue, today emphasised), stat tiles
// for the salon response. Every chart has a table view and per-mark tooltips.
var dashState={days:30,salon:new URLSearchParams(location.search).get('salon')||''};
function pct(x){return x==null?'—':fa(Math.round(x*100))+'٪'}
function compact(n){n=Number(n)||0;return n>=10000?fa(Math.round(n/1000))+'هزار':fa(n)}
function delta(cur,prev,isRate){if(!prev&&!cur)return null;if(!prev)return {t:'دورهٔ قبل داده‌ای نبود',up:true,plain:true};var d=isRate?(cur-prev)*100:(cur-prev)/prev*100;var r=Math.round(d);return {t:(r>0?'+':'')+fa(r)+(isRate?' واحد':'٪'),up:r>=0}}
function tile(label,value,dl,hint){return el('div',{class:'kpi'},[h('span',label,'kpi__label'),h('b',value,'kpi__value'),dl?h('span',dl.plain?dl.t:dl.t+' نسبت به دورهٔ قبل','kpi__delta '+(dl.plain?'':(dl.up?'is-up':'is-down'))):(hint?h('span',hint,'kpi__delta'):null)])}
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
 return el('div',{class:'colchart'},[ticks,el('div',{class:'cols__grid'},[plot,xs])]);
}
function pday(iso){try{return new Intl.DateTimeFormat('fa-IR-u-ca-persian',{day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(iso+'T12:00:00Z'))}catch(e){return iso}}
function mins(m){if(m==null)return '—';if(m<60)return fa(Math.round(m))+' دقیقه';if(m<1440)return fa(Math.round(m/60))+' ساعت';return fa(Math.round(m/1440))+' روز'}
function card(title,sub,body,table){return el('section',{class:'card dcard'},[h('h2',title),sub?h('p',sub,'lead'):null,body,table||null])}
function dashboard(salons){
 var root=el('section',{class:'dash','aria-label':'آمار'});
 var range=el('div',{class:'seg-ctl',role:'group','aria-label':'بازه'});
 [[7,'۷ روز'],[30,'۳۰ روز'],[90,'۹۰ روز']].forEach(function(o){range.append(el('button',{type:'button','aria-pressed':dashState.days===o[0]?'true':'false',text:o[1],onclick:function(){dashState.days=o[0];draw()}}))});
 var pick=el('select',{'aria-label':'مزون'},[el('option',{value:'',text:'همهٔ مزون‌ها'})].concat(salons.map(function(s){return el('option',{value:s.slug,text:s.name})})));pick.value=dashState.salon;pick.addEventListener('change',function(){dashState.salon=pick.value;draw()});
 var body=el('div',{class:'dash__body'},[el('div',{class:'loading',text:'در حال آوردن آمار…'})]);
 root.append(el('div',{class:'dash__filters'},[range,pick]),body);
 function draw(){
  Array.prototype.forEach.call(range.children,function(b,i){b.setAttribute('aria-pressed',[7,30,90][i]===dashState.days?'true':'false')});
  body.classList.add('is-refreshing');
  api('/api/owner/stats?days='+dashState.days+(dashState.salon?'&salon='+encodeURIComponent(dashState.salon):'')).then(function(d){body.classList.remove('is-refreshing');body.replaceChildren.apply(body,render(d));var slot=el('div',{class:'dgrid dgrid--1'},[el('div',{class:'loading',text:'در حال آوردن رفرال‌ها…'})]);body.append(slot);return api('/api/owner/referrals'+(dashState.salon?'?salon='+encodeURIComponent(dashState.salon):'')).then(function(r){slot.replaceChildren.apply(slot,referrals(r))},function(e){slot.replaceChildren(el('p',{class:'notice notice--warn',text:e.message}))})}).catch(function(e){body.classList.remove('is-refreshing');body.replaceChildren(el('p',{class:'notice notice--warn',text:e.message}))});
 }
 function render(d){
  var k=d.kpi,p=d.prev,out=[];
  out.push(el('div',{class:'kpis'},[tile('بازدیدکننده',compact(k.visitors),delta(k.visitors,p.visitors)),tile('عکس گذاشتند',compact(k.photos),delta(k.photos,p.photos)),tile('شبیه‌سازی',compact(k.simulations),delta(k.simulations,p.simulations)),tile('برای مزون فرستادند',compact(k.sent),delta(k.sent,p.sent)),tile('نرخ تبدیل',pct(k.conversion),delta(k.conversion,p.conversion,true),'فرستاده ÷ بازدیدکننده')]));
  var top=d.funnel[0]?.count||0;
  out.push(el('div',{class:'dgrid'},[
   card('قیف مشتری','چند نفر از بازدیدکننده‌ها به هر قدم رسیدند.',hbars(d.funnel.map(function(f){return {label:f.label,count:f.count}}),{fmt:function(it){return fa(it.count)+(top?' ('+pct(it.count/top)+')':'')}}),tableOf(['قدم','نفر','از بازدید'],d.funnel.map(function(f){return [f.label,fa(f.count),top?pct(f.count/top):'—']}))),
   card('پاسخ مزون‌ها','بعد از ارسال، مزون چه کرد (درخواست‌های '+fa(d.response.windowDays)+' روز اخیر).',el('div',{class:'kpis kpis--small'},[tile('پاسخ داده‌اند',d.response.total?pct(d.response.handled/d.response.total):'—',null,fa(d.response.handled)+' از '+fa(d.response.total)),tile('میانهٔ زمان پاسخ',mins(d.response.medianMinutes)),tile('بی‌پاسخ بیش از ۲۴ ساعت',fa(d.response.overdue),null,d.response.overdue?'یادآوری خودکار رفته':'')]),tableOf(['وضعیت','تعداد'],[['تماس گرفتند',fa(d.response.called)],['نوبت دادند',fa(d.response.booked)],['قابل اجرا نبود',fa(d.response.declined)],['منتظر',fa(d.response.waiting)]]))
  ]));
  out.push(el('div',{class:'dgrid'},[
   card('بازدیدکننده در روز','',columns(d.daily,'visitors','بازدیدکننده','muted'),tableOf(['روز','بازدیدکننده'],d.daily.map(function(x){return [pday(x.day),fa(x.visitors)]}))),
   card('درخواست در روز','',columns(d.daily,'sent','درخواست','accent'),tableOf(['روز','درخواست'],d.daily.map(function(x){return [pday(x.day),fa(x.sent)]})))
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
  var sh=d.share||{opened:0,sent:0,visitors:0,byApp:[]},APP={telegram:'تلگرام',whatsapp:'واتساپ',sms:'پیامک',instagram:'اینستاگرام',copy:'کپی لینک',native:'سایر برنامه‌ها (بله، ایتا…)'};
  var apps=sh.byApp.map(function(a){return {label:APP[a.label]||a.label,count:a.count}});
  out.push(card('معرفی به دوستان','بنر پایین صفحهٔ مزون: چند نفر لینک را برای دوستشان فرستادند و چند نفر از همین لینک آمدند.',el('div',{},[el('div',{class:'kpis kpis--small'},[tile('بنر را باز کردند',fa(sh.opened)),tile('فرستادند',fa(sh.sent)),tile('آمده از لینک معرفی',fa(sh.visitors),null,'بازدیدکنندهٔ تازه')]),apps.length?el('div',{style:'margin-top:16px'},[hbars(apps)]):el('p',{class:'lead',style:'margin-top:14px',text:'هنوز کسی لینک را نفرستاده.'})]),apps.length?tableOf(['برنامه','دفعه'],apps.map(function(x){return [x.label,fa(x.count)]})):null));
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
var LSTATUS=[['new','جدید'],['called','تماس گرفته شد'],['booked','رزرو شد'],['cancelled','لغو'],['declined','قابل اجرا نیست']];
function leadsCard(slug){
 var box=el('section',{class:'card'},[h('h2','درخواست‌ها و مشتریان علاقه‌مند'),h('p','هر کس «این لباس را می‌خواهم» یا فرستادن را زده اینجاست. وضعیت را از اینجا یا از دکمه‌های ربات عوض کنید؛ مشتری هم خبردار می‌شود.','lead')]);
 var chips=el('div',{class:'seg-ctl seg-ctl--wrap',role:'group','aria-label':'فیلتر وضعیت'}),list=el('div',{class:'log'}),csv=el('a',{class:'btn btn--ghost btn--sm',href:'#',text:'خروجی CSV'});
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
   if(!r.leads.length){list.replaceChildren(h('p','درخواستی با این وضعیت نیست.','empty-note'));return}
   list.replaceChildren.apply(list,r.leads.map(function(l){
    var sel=el('select',{'aria-label':'وضعیت '+l.name},LSTATUS.map(function(x){return el('option',{value:x[0],text:x[1]})}));sel.value=l.salon_status;
    sel.addEventListener('change',function(){sel.disabled=true;api('/api/s/'+slug+'/owner/leads/status',{id:l.id,status:sel.value}).then(function(){toast('وضعیت عوض شد.');return load()},function(e){toast(e.message,true);sel.value=l.salon_status}).then(function(){sel.disabled=false})});
    var tel='0'+String(l.phone).replace(/^\+98/,'');
    return el('div',{class:'log__row log__row--lead'},[
     el('div',{class:'grow'},[h('b',l.name),el('br'),el('a',{href:'tel:'+tel,dir:'ltr',class:'tel',text:tel.replace(/\d/g,function(c){return '۰۱۲۳۴۵۶۷۸۹'[c]})}),el('br'),h('small',[l.intent==='want'?'می‌خواهم · ':'',l.look||'بدون لباس',' · ',fmt(l.created_at),l.staff?' · '+l.staff:''].join('')),l.visit_note?el('div',{},[h('small','🗓 '+l.visit_note)]):null]),
     l.waiting?badge('منتظر وصل شدن '+(l.staff||'نیرو'),'warn'):badge(label[l.status]||l.status,tone[l.status]),
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
var LEVEL={info:['ℹ️',''],good:['✅','ok'],warn:['⚠️','warn'],error:['❌','danger']},KIND={setup:'راه‌اندازی',team:'تیم',stuck:'گیرکرده',noanswer:'بی‌جواب',error:'خطا'};
function alertsCard(d){
 var a=d.alerts||{chats:[]},on=a.chats.length>0,out=el('div');
 var c=el('section',{class:'card'},[h('h2','گزارش‌ها و هشدارها'),h('p','هشدار فوری (وصل شدن یا نشدن مزون و مزون‌دار، صفحهٔ نیمه‌کاره، درخواست بی‌جواب یا گیرکرده، خطای ربات) و هر شب ساعت ۲۱ خلاصهٔ روز در گفتگوی تلگرام خودت با ربات.','lead'),
  el('div',{class:'tg-state tg-state--'+(on?'on':'off')},[el('span',{html:TG}),el('div',{},[h('b',on?'گزارش‌ها به تلگرام خودت می‌آید':'هنوز به تلگرام خودت وصل نیست'),h('span',on?'در ربات /report خلاصهٔ همین الان را می‌دهد.':'دکمه را بزن، لینک را در تلگرام خودت باز کن و Start بزن.')])])]);
 c.append(el('div',{class:'row',style:'gap:8px;flex-wrap:wrap'},[
  el('button',{class:'btn btn--primary btn--sm',type:'button',text:on?'وصل کردن یک گفتگوی دیگر':'وصل کردن تلگرام من',onclick:act(function(){return api('/api/owner/alerts-link',{}).then(function(r){var L=r.links||{};out.replaceChildren.apply(out,[L.telegram?copyLink('تلگرام',L.telegram):null,L.bale?copyLink('بله',L.bale):null,el('p',{class:'tiny muted',text:'یک‌بار مصرف، ۲۴ ساعت اعتبار.'})].filter(Boolean))})})}),
  el('button',{class:'btn btn--ghost btn--sm',type:'button',text:'پیش‌نمایش گزارش امشب',onclick:act(function(){return api('/api/owner/digest').then(function(r){out.replaceChildren(el('pre',{class:'digest',text:r.text}))})})}),
  on?el('button',{class:'btn btn--danger btn--sm',type:'button',text:'قطع گزارش‌ها',onclick:act(function(){if(!confirm('گزارش‌ها دیگر به تلگرام نیاید؟'))return;return api('/api/owner/alerts-unlink',{}).then(home)})}):null
 ]),out);
 var acts=d.activity||[],list=el('div',{class:'acts'});
 acts.forEach(function(x){var l=LEVEL[x.level]||LEVEL.info;list.append(el('div',{class:'act act--'+(l[1]||'info')},[el('span',{class:'act__ic',text:l[0]}),el('div',{class:'grow'},[h('span',x.text),el('br'),h('small',(KIND[x.kind]||x.kind)+' · '+fmt(x.created_at))])]))});
 c.append(h('h3','رویدادهای اخیر','sub'),acts.length?list:h('p','هنوز رویدادی ثبت نشده.','empty-note'));
 return c;
}
function copyLink(label,url){return el('div',{class:'linkbox'},[h('b',label,'linkbox__label'),el('code',{text:url}),el('button',{class:'btn btn--soft btn--sm',type:'button',text:'کپی',onclick:function(){navigator.clipboard&&navigator.clipboard.writeText(url).then(function(){toast('لینک کپی شد.')})}})])}

function botCard(bot){
 var st=function(ok,on,off){return el('li',{class:ok?'on':'off'},[h('span',ok?'✓':'–','dot'),h('span',ok?on:off)])};
 var t=bot.telegram||{},b=bot.bale||{};
 var c=el('section',{class:'card'},[h('h2','ربات‌ها'),h('p','همهٔ مزون‌ها از یک ربات تلگرام و یک ربات بله استفاده می‌کنند. هر مزون می‌تواند یکی یا هر دو را وصل کند و درخواست‌ها در هر دو می‌رسد.','lead'),el('ul',{class:'status'},[
  st(t.ready&&!!t.username,'تلگرام: @'+t.username,'تلگرام: TELEGRAM_BOT_TOKEN و TELEGRAM_BOT_USERNAME تنظیم نشده.'),
  st(bot.secret,'رمز وبهوک تنظیم شده است.','TELEGRAM_WEBHOOK_SECRET تنظیم نشده (برای هر دو ربات لازم است).'),
  st(b.ready&&!!b.username,'بله: @'+b.username,'بله: BALE_BOT_TOKEN و BALE_BOT_USERNAME تنظیم نشده (اختیاری؛ راهنما در SETUP-BALE.md).')
 ])]);
 if((t.ready||b.ready)&&bot.secret)c.append(el('button',{class:'btn btn--ghost',type:'button',style:'margin-top:12px',text:'اتصال ربات‌ها به این سایت',onclick:act(function(){return api('/api/owner/webhook',{}).then(function(d){toast('وصل شد: '+Object.keys(d.bots||{}).map(function(k){return (k==='bale'?'بله':'تلگرام')+' @'+d.bots[k]}).join('، '))})})}));
 return c;
}
function home(){return api('/api/owner').then(function(d){
 var head=el('div',{class:'page-head'},[el('div',{},[h('h1','داشبورد'),h('p','مشتری‌ها چطور از صفحه‌ها استفاده می‌کنند و مزون‌ها چقدر جواب می‌دهند. پایین صفحه، فهرست مزون‌ها و تنظیمات ربات است.')])]);
 var list=el('div',{class:'salons'});
 d.salons.forEach(function(s){list.append(el('div',{class:'salon'},[el('div',{class:'grow'},[h('strong',s.name),h('small','/s/'+s.slug)]),badge(s.telegram&&s.bale?'تلگرام و بله وصل':s.telegram?'تلگرام وصل':s.bale?'بله وصل':'ربات وصل نیست',s.telegram||s.bale?'ok':'warn'),h('small',fa(s.portfolio)+' نمونه‌کار، '+fa(s.leads)+' درخواست'+(s.team?'، تیم '+fa(s.team_linked)+'/'+fa(s.team)+' وصل':'')),setupLine(s),(s.waiting||s.overdue)?el('div',{class:'row',style:'gap:6px'},[s.waiting?badge(fa(s.waiting)+' درخواست منتظر وصل شدن','warn'):null,s.overdue?badge(fa(s.overdue)+' بی‌جواب بیش از ۲۴ ساعت','danger'):null]):null,el('a',{class:'btn btn--ghost btn--sm',href:'/s/'+s.slug,target:'_blank',rel:'noopener',text:'صفحهٔ مشتری'}),el('a',{class:'btn btn--primary btn--sm',href:'/admin/'+s.slug,text:'تنظیمات'})]))});
 if(!d.salons.length)list.append(h('p','هنوز مزونی نساخته‌اید.','empty-note'));
 var create=el('section',{class:'card'},[h('h2','مزون تازه'),field('name','نام مزون'),field('slug','نشانی انگلیسی صفحه','', 'text','فقط حروف انگلیسی، عدد و خط تیره؛ حروف بزرگ و فاصله خودکار درست می‌شوند.'),el('button',{class:'btn btn--primary',type:'button',text:'ساخت مزون',onclick:act(function(){return api('/api/salons',{name:$('#name').value,slug:$('#slug').value.trim()}).then(function(s){location.href='/admin/'+s.slug})})})]);
 // The page address is cleaned as it is typed: lowercase, spaces become dashes, nothing else allowed.
 (function(){var si=create.querySelector('#slug');if(!si)return;si.setAttribute('dir','ltr');si.setAttribute('autocapitalize','off');si.setAttribute('autocorrect','off');si.setAttribute('spellcheck','false');si.setAttribute('inputmode','url');si.setAttribute('placeholder','aliadli-salon');
  var prev=el('span',{class:'hint slug-preview'});si.closest('.field').append(prev);
  function show(){var v=si.value;prev.textContent=v?'صفحهٔ مشتری: '+location.host+'/s/'+v:''}
  si.addEventListener('input',function(){var c=si.value.toLowerCase().replace(/[\s_]+/g,'-').replace(/[^a-z0-9-]/g,'').replace(/-+/g,'-');if(c!==si.value)si.value=c;show()});show()})();
 $('#app').replaceChildren(head,dashboard(d.salons),el('h2',{class:'section-title',text:'مزون‌ها'}),el('div',{class:'grid grid--2'},[el('div',{class:'stack'},[list,create]),el('div',{class:'stack'},[alertsCard(d),botCard(d.bot),smsCard(d.sms||{}),imageCard(d.image)])]));
})}
function smsCard(sms){
 var st=function(ok,on,off){return el('li',{class:ok?'on':'off'},[h('span',ok?'✓':'–','dot'),h('span',ok?on:off)])};
 return el('section',{class:'card'},[h('h2','پیامک (ملی پیامک)'),h('p','کد تأیید موبایل مشتری، و لینک مزون که مزون‌دار از ربات برای مشتری می‌فرستد.','lead'),el('ul',{class:'status'},[
  st(sms.otp,'کد تأیید فعال است؛ مشتری قبل از ساخت شبیه‌سازی شمارهٔ خودش را تأیید می‌کند.','MELIPAYAMAK_TOKEN تنظیم نشده؛ تأیید شمارهٔ مشتری خاموش است.'),
  st(sms.invite,'پیامک لینک مزون از ربات فعال است.','MELIPAYAMAK_BODY_ID تنظیم نشده (شمارهٔ متن پیش‌فرض تأییدشده)؛ مزون‌دار هنوز نمی‌تواند لینک را پیامک کند.')
 ])]);
}
function imageCard(on){return el('section',{class:'card'},[h('h2','شبیه‌سازی تصویر'),el('ul',{class:'status'},[el('li',{class:on?'on':'off'},[h('span',on?'✓':'–','dot'),h('span',on?'کلید KIE تنظیم شده؛ مشتری‌ها می‌توانند مدل را روی عکس خودشان ببینند.':'KIE_API_KEY تنظیم نشده؛ مشتری فقط عکس و مدل را برای مزون می‌فرستد.')])])])}

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
 var head=el('div',{class:'page-head'},[el('div',{},[el('a',{class:'back',href:'/admin',text:'→ همهٔ مزون‌ها'}),h('h1',S.name),h('p','اطلاعاتی که اینجا وارد می‌کنید در بخش «دربارهٔ مزون» صفحهٔ مشتری دیده می‌شود.'),setupLine({setup:d.setup})]),el('div',{class:'row'},[el('a',{class:'btn btn--ghost',href:'/admin?salon='+encodeURIComponent(S.slug),text:'آمار این مزون'}),el('a',{class:'btn btn--ghost',href:'/s/'+S.slug,target:'_blank',rel:'noopener',text:'دیدن صفحهٔ مشتری'})])]);

 // Telegram
 var linked=[S.telegram?'تلگرام':'',S.bale?'بله':''].filter(Boolean),on=linked.length>0;
 var tg=el('section',{class:'card'},[h('h2','ربات مزون')]);
 tg.append(el('div',{class:'tg-state tg-state--'+(on?'on':'off')},[el('span',{html:TG}),el('div',{},[h('b',on?'وصل است: '+linked.join(' و '):'هنوز وصل نیست'),h('span',on?'درخواست مشتری‌ها برای مزون می‌رود؛ مزون زیرش یک دکمه می‌زند و مشتری خبردار می‌شود. هر عکسی که مزون بفرستد نمونه‌کار می‌شود.':'تا وصل نشود، مشتری‌ها نمی‌توانند درخواست آنلاین بفرستند و فقط اطلاعات تماس مزون را می‌بینند.')])]));
 var linkOut=el('div');
 var copyRow=function(label,url){return el('div',{class:'linkbox'},[h('b',label,'linkbox__label'),el('code',{text:url}),el('button',{class:'btn btn--soft btn--sm',type:'button',text:'کپی',onclick:function(){navigator.clipboard&&navigator.clipboard.writeText(url).then(function(){toast('لینک کپی شد.')})}})])};
 if((d.bot.telegram&&d.bot.telegram.ready&&d.bot.telegram.username)||(d.bot.bale&&d.bot.bale.ready&&d.bot.bale.username))tg.append(el('button',{class:'btn btn--primary',type:'button',text:on?'ساخت لینک تازه':'ساخت لینک اتصال',onclick:act(function(){return api('/api/s/'+slug+'/owner/telegram-link',{}).then(function(r){var L=r.links||{};linkOut.replaceChildren.apply(linkOut,[L.telegram?copyRow('تلگرام',L.telegram):null,L.bale?copyRow('بله',L.bale):null,el('p',{class:'tiny muted',style:'margin-top:8px',text:'یکی از این لینک‌ها را برای آرایشگاه بفرستید (هر کدام که استفاده می‌کند). با باز کردن و زدن «Start»، گفتگو به مزون وصل می‌شود و ربات قدم‌به‌قدم اطلاعات صفحه را می‌پرسد. یک‌بار مصرف است و ۷ روز اعتبار دارد.'})].filter(Boolean))})})}));
 else tg.append(el('p',{class:'notice notice--warn',text:'اول ربات را در صفحهٔ «همهٔ مزون‌ها» تنظیم کنید.'}));
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
 var teamC=el('section',{class:'card'},[h('h2','تیم مزون'),h('p','هر مزون‌دار ربات را با گفتگوی خودش وصل می‌کند و یک لینک اختصاصی همیشگی می‌گیرد. هر کس با لینک او بیاید و هر کس که او لینک را برایش بفرستد، مشتری همان مزون‌دار می‌شود و درخواستش فقط به خود او می‌رسد. مدیر مزون هم می‌تواند در ربات با /team نیرو اضافه کند.','lead'),
  (d.team||[]).length?teamList:h('p','هنوز نیرویی اضافه نشده.','empty-note'),
  el('div',{class:'team__add'},[el('label',{class:'field'},[el('span',{class:'lbl',text:'اسم نیرو'}),nName]),el('label',{class:'field'},[el('span',{class:'lbl',text:'تخصص'}),nSpec]),el('button',{class:'btn btn--primary',type:'button',text:'افزودن',onclick:act(function(){return api('/api/s/'+slug+'/owner/team',{name:nName.value,specialty:nSpec.value}).then(function(r){var L=r.links||{};return salonPage().then(function(){toast(r.member.name+' اضافه شد؛ لینک‌هایش را از «لینک‌ها» بفرستید.')})})})})]),addOut]);

 // Profile
 var prof=el('section',{class:'card'},[h('h2','دربارهٔ مزون'),h('p','همهٔ این‌ها اختیاری است جز نام.','lead'),
  el('div',{class:'uploads'},[uploadBox('up-logo','لوگو',p.logo,function(id){images.logo=id}),uploadBox('up-cover','عکس کاور',p.cover,function(id){images.cover=id}),uploadBox('up-portrait','عکس مدیر',p.portrait,function(id){images.portrait=id})]),
  field('f-name','نام مزون',S.name),field('f-bio','معرفی کوتاه',p.bio,'area'),
  el('div',{class:'two'},[field('f-manager','نام مدیر یا مزون‌دار',p.manager),field('f-hours','ساعات کاری',p.hours,'text','مثل شنبه تا پنج‌شنبه ۱۰ تا ۲۰'),field('f-phone','شمارهٔ تماس',p.phone?p.phone.replace(/^\+98/,'0'):'','tel'),field('f-address','آدرس',p.address)]),
  el('div',{class:'two'},[field('f-map','لینک نقشه',p.map,'url'),field('f-instagram','لینک اینستاگرام',p.instagram,'url'),field('f-telegram','لینک کانال یا آیدی تلگرام',p.telegram,'url'),field('f-website','وب‌سایت',p.website,'url')]),
  el('button',{class:'btn btn--primary',type:'button',text:'ذخیره',onclick:act(function(){var out={};['bio','manager','hours','phone','address','map','instagram','telegram','website'].forEach(function(k){out[k]=$('#f-'+k).value.trim()});if(out.telegram&&!/^https?:/.test(out.telegram))out.telegram='https://t.me/'+out.telegram.replace(/^@/,'');if(out.instagram&&!/^https?:/.test(out.instagram))out.instagram='https://instagram.com/'+out.instagram.replace(/^@/,'');Object.assign(out,images);return api('/api/s/'+slug+'/owner/profile',{name:$('#f-name').value,profile:out}).then(function(){toast('ذخیره شد.')})})})]);

 // Settings
 var model=el('select',{id:'s-model'},[el('option',{value:'pro',text:'بهترین کیفیت (Nano Banana Pro)'}),el('option',{value:'fast',text:'سریع‌تر و ارزان‌تر (Nano Banana 2.1)'})]);model.value=S.settings.image_model==='fast'?'fast':'pro';
 var set=el('section',{class:'card'},[h('h2','شبیه‌سازی'),el('label',{class:'field'},[el('span',{class:'lbl',text:'مدل ساخت تصویر'}),model,el('span',{class:'hint',text:'Pro طبیعی‌تر است و چهره را بهتر نگه می‌دارد، ولی هر تصویر حدود دو برابر هزینه دارد.'})]),check('s-gen','مشتری بتواند مدل را روی عکس خودش ببیند'+(d.image?'':' (کلید KIE هنوز تنظیم نشده)'),S.settings.generation_enabled),check('s-cat','نمایش لباس‌های نمونهٔ آماده به مشتری (پیش‌فرض خاموش: فقط لباس‌های خود مزون)',S.settings.catalog),check('s-own','مشتری بتواند عکس لباس دلخواه خودش را بارگذاری کند',S.settings.allow_own_dress),check('s-ref','انتقال از «عکس مدل من» و نمونه‌کارها آزمایش شده و کیفیتش تأیید شده است',S.settings.reference_verified),el('label',{class:'field'},[el('span',{class:'lbl',text:'سقف تصویر روزانهٔ این مزون'}),el('input',{id:'s-cap',type:'number',min:'0',step:'1',inputmode:'numeric',value:String(Number.isInteger(S.settings.daily_limit)?S.settings.daily_limit:50)}),el('span',{class:'hint',text:'جمع تصویرهایی که همهٔ مشتری‌ها در یک روز می‌سازند. ۰ یعنی بدون سقف. هر نفر جدا از این، در هر بخش ۳ تصویر دارد.'})]),el('label',{class:'field'},[el('span',{class:'lbl',text:'پاک شدن خودکار عکس مشتری‌ها (روز)'}),el('input',{id:'s-keep',type:'number',min:'0',max:'3650',step:'1',inputmode:'numeric',value:String(Number.isInteger(S.settings.retention_days)?S.settings.retention_days:30)}),el('span',{class:'hint',text:'عکس و نتیجه‌ای که مشتری برای مزون نفرستاده بعد از این تعداد روز پاک می‌شود. عکس درخواست‌ها تا بسته شدن درخواست و این تعداد روز بعدش می‌ماند. ۰ یعنی هیچ‌وقت پاک نشود.'})]),el('button',{class:'btn btn--ghost',type:'button',text:'ذخیرهٔ تنظیمات',onclick:act(function(){return api('/api/s/'+slug+'/owner/settings',{daily_limit:(function(v){return isNaN(v)?50:Math.max(0,v)})(parseInt($('#s-cap').value,10)),generation_enabled:$('#s-gen').checked,reference_verified:$('#s-ref').checked,catalog:$('#s-cat').checked,allow_own_dress:$('#s-own').checked,image_model:$('#s-model').value,retention_days:(function(v){return isNaN(v)?30:Math.max(0,v)})(parseInt($('#s-keep').value,10))}).then(function(){toast('تنظیمات ذخیره شد.')})})})]);

 // Portfolio
 var ports=el('div',{class:'ports'});
 function pinfo(it){var mode=el('select',{'aria-label':'نوع'},[['','نوع عرضه'],['sale','فروش'],['rent','اجاره'],['both','فروش و اجاره']].map(function(o){return el('option',{value:o[0],text:o[1]})})),stock=el('select',{'aria-label':'موجودی'},[['','موجودی'],['available','موجود'],['ask','بپرسید']].map(function(o){return el('option',{value:o[0],text:o[1]})})),price=el('input',{type:'text',maxlength:'60',placeholder:'قیمت (مثلاً ۱۲ تا ۱۵ میلیون)',value:it.price||''});mode.value=it.mode||'';stock.value=it.stock||'';var save=function(){return api('/api/s/'+slug+'/owner/portfolio/info',{id:it.id,mode:mode.value,price:price.value,stock:stock.value})};[mode,stock,price].forEach(function(x){x.addEventListener('change',function(){save().catch(function(){})})});var inq=el('button',{class:'btn btn--sm',type:'button',text:'استعلام',title:'قیمت نمایش داده نشود؛ مشتری برای استعلام تماس بگیرد',onclick:function(){price.value='استعلام قیمت: تماس بگیرید';save().catch(function(){})}});return el('div',{class:'row'},[mode,stock,price,inq])}
 d.portfolio.forEach(function(it){var ids=[];try{ids=JSON.parse(it.images)}catch(e){}ports.append(el('div',{class:'port'},[ids[0]?el('img',{src:'/api/s/'+slug+'/media/'+ids[0],alt:'',loading:'lazy'}):null,h('b',it.title),it.stylist?h('small','کار '+it.stylist):null,pinfo(it),el('button',{class:'btn btn--danger btn--sm',type:'button',text:'حذف',onclick:act(function(){if(!confirm('«'+it.title+'» از صفحهٔ مزون حذف شود؟'))return;return api('/api/s/'+slug+'/owner/portfolio/delete',{id:it.id}).then(salonPage)})})]))});
 // Add from here too: pick photos, a title for each (the file name by default) and the section.
 var addFiles=el('input',{type:'file',accept:'image/jpeg,image/png,image/webp',multiple:'multiple'}),addList=el('div',{class:'port-add__list'});
 addFiles.addEventListener('change',function(){addList.replaceChildren.apply(addList,Array.prototype.map.call(addFiles.files,function(f){return el('input',{type:'text',maxlength:'150',value:f.name.replace(/\.[a-z]+$/i,'').replace(/[-_]+/g,' '),'aria-label':'اسم کار '+f.name})}))});
 var addBtn=el('button',{class:'btn btn--primary',type:'button',text:'افزودن به صفحه',onclick:act(function(){var fs=Array.prototype.slice.call(addFiles.files);if(!fs.length){toast('اول عکس انتخاب کنید',true);return}var names=Array.prototype.map.call(addList.querySelectorAll('input'),function(i){return i.value.trim()});
  return fs.reduce(function(p,f,i){return p.then(function(){return api('/api/s/'+slug+'/upload?kind=portfolio',f,true).then(function(m){return api('/api/s/'+slug+'/owner/portfolio/add',{media_id:m.id,title:names[i]||'نمونه‌کار',line:'dress'})})})},Promise.resolve()).then(function(){toast(fs.length+' نمونه‌کار اضافه شد.');salonPage()})})});
 var add=el('div',{class:'port-add'},[h('b','افزودن نمونه‌کار از همین‌جا'),el('label',{class:'field'},[el('span',{class:'lbl',text:'عکس‌ها'}),addFiles]),addList,addBtn]);
 var port=el('section',{class:'card'},[h('h2','نمونه‌کارها'),h('p','مزون عکس را برای ربات تلگرام می‌فرستد و همان لحظه اینجا و روی صفحهٔ مشتری می‌نشیند. از همین‌جا هم می‌توانید اضافه کنید.','lead'),d.portfolio.length?ports:h('p','هنوز نمونه‌کاری نیامده.','empty-note'),add]);

 var leads=leadsCard(slug),social=socialCard(slug);

 $('#app').replaceChildren(head,el('div',{class:'grid grid--2'},[el('div',{class:'stack'},[prof,port]),el('div',{class:'stack'},[tg,teamC,set,leads,social])]));
})}
$('#logout').addEventListener('click',function(){api('/api/logout',{}).then(function(){location.href='/'})});
`;

export const appHTML=String.raw`<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#e8edeb"><meta name="robots" content="noindex"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="preload" href="/fonts/vazirmatn-arabic.woff2" as="font" type="font/woff2" crossorigin><title>مزون آینه | مدیریت مزون‌ها</title><style>__CSS__</style></head><body>
<a class="skip" href="#app">پرش به محتوای اصلی</a>
<header class="appbar"><a href="/admin" class="appbar__brand">__MARKHTML__<span>مزون آینه</span></a><button class="btn btn--ghost btn--sm" id="logout" type="button" hidden>خروج</button></header>
<main id="app"><div class="loading">در حال باز کردن…</div></main>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
<footer class="foot">مزون آینه: شبیه‌سازی پیشنهادی برای انتخاب لباس عروس.</footer>
<script>__JS__</script>
</body></html>`
 .replace('__CSS__',()=>baseCSS+css)
 .replace('__MARKHTML__',()=>markSVG)
 .replace('__JS__',()=>clientJS.replace('__MARK__',()=>JSON.stringify(markSVG)));
