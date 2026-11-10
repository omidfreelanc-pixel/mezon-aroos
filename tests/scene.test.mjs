import test from 'node:test';import assert from 'node:assert/strict';
import {SCENE_JS} from '../worker/scene.js';import {customerHTML} from '../worker/customer.js';

// The page ships SCENE_JS verbatim; here the very same text is evaluated in Node (a Worker may not eval, a test may).
const S=new Function(SCENE_JS+'\nreturn {rgbToHsl,hslToRgb,mixRGB,neutralPalette,toneOf,dressPalette,rgbCss,sceneGeom,buildProgress,holdNote,sceneCaps,genReduce,phaseCopy,retryLabel,GEN_TOTAL_MS,GEN_GIVEUP_MS,GEN_MAX_NETFAILS}')();
const clientJS=customerHTML.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/)[1];

// A small RGBA picture: background colour bg, and a "dress" rectangle in the middle drawn by fn(x,y) -> [r,g,b].
function pic(w,h,bg,dress,alpha=255){
 const d=new Uint8ClampedArray(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const inside=x>w*.25&&x<w*.75&&y>h*.1&&y<h*.92,c=inside?(typeof dress==='function'?dress(x,y):dress):bg,i=(y*w+x)*4;
  d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];d[i+3]=alpha;
 }
 return d;
}
const W=32,H=48,WHITE=[247,245,242];
const P=(c,bg=WHITE)=>S.dressPalette(pic(W,H,bg,c),W,H);
const dist=(a,b)=>Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2]);

test('dress palette: tones of ivory, champagne, blush, white and a colour are told apart',()=>{
 assert.equal(P([242,234,215]).tone,'ivory');
 assert.equal(P([225,199,154]).tone,'champagne');
 assert.equal(P([239,187,197]).tone,'blush');
 assert.equal(P([253,253,253],[250,250,250]).tone,'white','a white dress on a white picture keeps its own colour');
 assert.equal(P([24,113,85]).tone,'color');
 assert.equal(P([20,20,24]).tone,'deep');
});

test('dress palette: different dresses give clearly different tints, thread and glow',()=>{
 const set={ivory:P([242,234,215]),champagne:P([225,199,154]),blush:P([239,187,197]),emerald:P([24,113,85]),navy:P([30,40,110])};
 const names=Object.keys(set);
 for(let i=0;i<names.length;i++)for(let j=i+1;j<names.length;j++){
  assert(dist(set[names[i]].tint,set[names[j]].tint)>=14,names[i]+' vs '+names[j]+' tint '+set[names[i]].tint+' / '+set[names[j]].tint);
 }
 for(const k of names){
  const p=set[k];
  assert(p.ok,k);
  assert(p.tint.every(v=>v>=140&&v<=255),k+' veil stays airy: '+p.tint);
  assert(p.thread.every(v=>v>=60&&v<=255)&&p.glow.every(v=>v>=150),k);
 }
 assert(set.blush.tint[0]>set.blush.tint[2]-1&&set.blush.tint[0]>set.emerald.tint[0],'blush veil is pink, emerald is not');
 assert(set.emerald.tint[1]>set.emerald.tint[0],'emerald veil leans green');
});

test('dress palette: the picture background is ignored, shading does not hide the colour',()=>{
 const onBlack=S.dressPalette(pic(W,H,[10,10,10],[200,30,40]),W,H),onWhite=P([200,30,40]);
 assert(dist(onBlack.dom,[200,30,40])<30,'red on black '+onBlack.dom);
 assert(dist(onWhite.dom,[200,30,40])<30,'red on white '+onWhite.dom);
 const shaded=S.dressPalette(pic(W,H,WHITE,(x,y)=>{const k=.7+.3*Math.sin(y/3);return [Math.round(239*k),Math.round(187*k),Math.round(197*k)]}),W,H);
 assert.equal(shaded.tone==='blush'||shaded.tone==='color',true,shaded.tone);
});

test('dress palette: unreadable input falls back to the neutral ivory and gold palette without throwing',()=>{
 const n=S.neutralPalette();
 for(const bad of [null,undefined,new Uint8ClampedArray(0),new Uint8ClampedArray(10)]){
  assert.deepEqual(S.dressPalette(bad,32,48),n);
 }
 assert.deepEqual(S.dressPalette(pic(W,H,WHITE,[1,2,3]),0,0),n);
 assert.deepEqual(S.dressPalette(pic(W,H,WHITE,[1,2,3],0),W,H),n,'a fully transparent picture is neutral');
 assert.equal(n.ok,false);assert.equal(n.tone,'neutral');
 assert(n.tint.every(v=>v>=230),'neutral veil is ivory');
});

test('palette helpers: hsl round trip, mix and css',()=>{
 for(const c of [[10,200,90],[255,0,0],[128,128,128],[240,230,210]]){
  const h=S.rgbToHsl(...c),r=S.hslToRgb(...h);assert(dist(r,c)<=3,c+' -> '+r);
 }
 assert.deepEqual(S.mixRGB([0,0,0],[100,200,50],.5),[50,100,25]);
 assert.equal(S.rgbCss([1,2,3]),'1,2,3');
});

test('scene geometry: the veil rises, the sharp part grows from the hem, and everything stays in range',()=>{
 let prev=null;
 for(let i=0;i<=20;i++){
  const g=S.sceneGeom(i/20);
  assert(g.u>=0&&g.u<=1&&g.sharp>=0&&g.sharp<=1,JSON.stringify(g));
  if(prev){assert(g.u>=prev.u&&g.edge<=prev.edge&&g.sharp<=prev.sharp,'monotonic')}
  prev=g;
 }
 assert.equal(S.sceneGeom(0).sharp,1,'nothing in focus at the start');
 assert.equal(S.sceneGeom(1).sharp,0,'all in focus at the end');
 assert.deepEqual(S.sceneGeom(NaN),S.sceneGeom(0));assert.deepEqual(S.sceneGeom(9),S.sceneGeom(1));
 assert(S.sceneGeom(.8).sharp>0,'at the hold the face is still a little veiled');
});

test('build progress: smooth, rests at .8 and never beyond',()=>{
 assert.equal(S.buildProgress(0,42000),0);
 let prev=0;for(let t=0;t<=60000;t+=500){const p=S.buildProgress(t,42000);assert(p>=prev&&p<=.8+1e-9);prev=p}
 assert(Math.abs(S.buildProgress(42000,42000)-.8)<1e-9&&S.buildProgress(1e9,42000)<=.8+1e-9);
 assert.equal(S.buildProgress(-5,42000),0);
 assert(S.buildProgress(1000,100000)<S.buildProgress(1000,42000),'a longer job climbs more slowly');
});

test('hold notes: calm at first, then reassuring, then honest about taking longer (and still not an error)',()=>{
 assert.match(S.holdNote(1000),/نبند/);assert.match(S.holdNote(50000),/دارد تمام می‌شود/);assert.match(S.holdNote(95000),/بیشتر از همیشه/);
 for(const t of [0,50000,95000,300000])assert(!/خطا|ناموفق|شکست/.test(S.holdNote(t)));
});

test('capabilities: older or reduced browsers get a simpler scene, never a broken one',()=>{
 const full={css:true,raf:true,filter:true,ctxFilter:true,canvas:true,reduce:false,lowEnd:false};
 assert.deepEqual(S.sceneCaps(full),{mode:'full',blur:'ctx',loom:true,pattern:true,medallion:true});
 assert.equal(S.sceneCaps({...full,ctxFilter:false}).blur,'down','no canvas filter: scaled-down copy');
 assert.equal(S.sceneCaps({...full,ctxFilter:false,canvas:false}).blur,'css','no canvas at all: static css blur');
 assert.equal(S.sceneCaps({...full,ctxFilter:false,canvas:false,filter:false}).blur,'none');
 assert.equal(S.sceneCaps({...full,lowEnd:true}).mode,'lite');assert.equal(S.sceneCaps({...full,lowEnd:true}).loom,false);
 for(const off of [{css:false},{raf:false},{reduce:true}])assert.equal(S.sceneCaps({...full,...off}).mode,'still',JSON.stringify(off));
 assert.equal(S.sceneCaps().mode,'still','unknown environment: still');
});

// ---------- the state machine ----------
const run=(events,s0)=>events.reduce((s,e)=>S.genReduce(s,e),s0||S.genReduce(null,{type:'leave'}));
const ph=(events,s0)=>run(events,s0).phase;

test('state machine: happy path build -> hold -> climax -> done',()=>{
 let s=S.genReduce(null,{type:'leave'});assert.equal(s.phase,'idle');
 s=S.genReduce(s,{type:'start'});assert.equal(s.phase,'build');
 s=S.genReduce(s,{type:'tick',elapsed:10000});assert.equal(s.phase,'build');
 s=S.genReduce(s,{type:'tick',elapsed:S.GEN_TOTAL_MS});assert.equal(s.phase,'hold');
 s=S.genReduce(s,{type:'poll',state:'running'});assert.equal(s.phase,'hold','running keeps holding');
 s=S.genReduce(s,{type:'tick',elapsed:95000});assert.equal(s.phase,'hold','after 90 s it is still a calm hold, not a failure');
 s=S.genReduce(s,{type:'poll',state:'success'});assert.equal(s.phase,'climax');
 s=S.genReduce(s,{type:'finished'});assert.equal(s.phase,'done');
});

test('state machine: success may arrive before the hold, and only once',()=>{
 let s=run([{type:'start'},{type:'poll',state:'success'}]);assert.equal(s.phase,'climax');
 assert.equal(S.genReduce(s,{type:'poll',state:'success'}),s,'a second success changes nothing');
 assert.equal(S.genReduce(s,{type:'poll',state:'fail'}),s,'once the climax has begun, nothing turns it into a failure');
});

test('state machine: fail and unknown stop the scene; retry starts a fresh build',()=>{
 assert.equal(ph([{type:'start'},{type:'poll',state:'fail'}]),'failed');
 assert.equal(ph([{type:'start'},{type:'poll',state:'unknown'}]),'unknown');
 assert.equal(ph([{type:'start'},{type:'tick',elapsed:50000},{type:'poll',state:'fail'}]),'failed');
 for(const bad of ['failed','unknown']){
  const s=run([{type:'start'},{type:'poll',state:bad==='failed'?'fail':'unknown'}]);
  assert.equal(S.genReduce(s,{type:'poll',state:'running'}),s,'a late poll answer is ignored after a stop');
  assert.equal(S.genReduce(s,{type:'tick',elapsed:99999999}),s);
  const r=S.genReduce(s,{type:'retry'});assert.equal(r.phase,'build');assert.equal(r.fails,0);
 }
 assert.equal(ph([{type:'start'},{type:'retry'}]),'build','retry while running does nothing');
});

test('state machine: offline pauses, online resumes where it was; going offline is not an error',()=>{
 let s=run([{type:'start'},{type:'neterr',online:false}]);assert.equal(s.phase,'offline');
 assert.equal(S.genReduce(s,{type:'online'}).phase,'build');
 s=run([{type:'start'},{type:'tick',elapsed:50000},{type:'neterr',online:false}]);assert.equal(s.phase,'offline');
 assert.equal(S.genReduce(s,{type:'online'}).phase,'hold','back to the hold it left');
 assert.equal(S.genReduce(s,{type:'tick',elapsed:1000}),s,'offline ticks do not change the phase');
 assert.equal(S.genReduce(s,{type:'poll',state:'running'}).phase,'hold','a good answer ends the offline spell');
 assert.equal(S.genReduce(s,{type:'poll',state:'success'}).phase,'climax','the job finished while we were offline');
 assert.equal(S.genReduce(s,{type:'neterr',online:false}),s,'offline twice is one offline');
});

test('state machine: repeated errors while online end in «lost», a good answer resets the count',()=>{
 let s=S.genReduce(null,{type:'start'});
 for(let i=0;i<S.GEN_MAX_NETFAILS-1;i++)s=S.genReduce(s,{type:'neterr',online:true});
 assert.equal(s.phase,'build');
 s=S.genReduce(s,{type:'poll',state:'running'});assert.equal(s.fails,0);
 for(let i=0;i<S.GEN_MAX_NETFAILS;i++)s=S.genReduce(s,{type:'neterr',online:true});
 assert.equal(s.phase,'lost');
 assert.equal(S.genReduce(s,{type:'retry'}).phase,'build');
});

test('state machine: a job that never answers times out calmly, and retry re-checks',()=>{
 let s=run([{type:'start'},{type:'tick',elapsed:50000},{type:'tick',elapsed:S.GEN_GIVEUP_MS}]);assert.equal(s.phase,'timeout');
 assert.equal(S.genReduce(s,{type:'retry'}).phase,'build');
 assert.equal(ph([{type:'start'},{type:'neterr',online:false},{type:'tick',elapsed:S.GEN_GIVEUP_MS}]),'timeout','even while offline');
});

test('state machine is pure, ignores nonsense and survives leaving at any moment',()=>{
 const s0=S.genReduce(null,{type:'start'}),snap=JSON.stringify(s0);
 S.genReduce(s0,{type:'tick',elapsed:99999});S.genReduce(s0,{type:'poll',state:'fail'});assert.equal(JSON.stringify(s0),snap,'input state is never mutated');
 for(const junk of [undefined,null,{},{type:'nope'},{type:'poll'},{type:'tick'}])assert.doesNotThrow(()=>S.genReduce(s0,junk));
 assert.equal(S.genReduce(s0,{type:'poll'}).phase,'build');
 for(const ev of [[],[{type:'start'}],[{type:'start'},{type:'poll',state:'success'}],[{type:'start'},{type:'neterr',online:false}],[{type:'start'},{type:'poll',state:'fail'}]]){
  assert.equal(ph([...ev,{type:'leave'}]),'idle');
 }
 // every phase is reachable and every phase can get out of a stuck state by retry or leave
 const seen=new Set();let s=S.genReduce(null,{type:'start'});seen.add(s.phase);
 for(const e of [{type:'tick',elapsed:50000},{type:'neterr',online:false},{type:'online'},{type:'poll',state:'success'},{type:'finished'}]){s=S.genReduce(s,e);seen.add(s.phase)}
 assert.deepEqual([...seen].sort(),['build','climax','done','hold','offline']);
});

test('failure copy is calm and says nothing about money, credit or quota that may not be true',()=>{
 const BAD=/برگش|بازگرد|پول|اعتبار|سهم|هزینه|ریال|تومان|جریمه|خطا|ناموفق/;
 for(const p of ['failed','unknown','timeout','lost','offline']){
  const t=S.phaseCopy(p);assert(t.length>15,p);assert(!BAD.test(t),p+': '+t);assert(/[؀-ۿ]/.test(t),'Persian: '+p);
 }
 assert.equal(S.phaseCopy('build'),'');
 assert.equal(S.retryLabel('failed'),'تلاش دوباره');
 for(const p of ['unknown','timeout','lost'])assert.equal(S.retryLabel(p),'بررسی دوباره','a lost answer is asked about again, not made again');
});

// ---------- what ships to the browser ----------
test('the page ships no fixed gown outline: nothing in the scene implies a body shape',()=>{
 for(const gone of ['PM_SIL','M152 168','pm__thread','pmst0u','offset-path','offset-distance','getAnimations','دانتل دوخته'])assert(!customerHTML.includes(gone),gone);
 assert(customerHTML.includes('لباس انتخابی تو'),'the real chosen dress is shown');
 for(const need of ['function dressPalette','function sceneGeom','function genReduce','function pmEnv','function dressLook','function swatchTile','function softCopy','PM_LINES','آخرین پرداخت…','function retryStage'])assert(customerHTML.includes(need),need);
 new Function(clientJS);
});

test('the scene animates only transform and opacity, with will-change only while it runs',()=>{
 const css=customerHTML.match(/<style>([\s\S]*?)<\/style>/)[1];
 const frames=[...css.matchAll(/@keyframes\s+(pm\w+)\{([\s\S]*?\})\}/g)];
 assert(frames.length>=2);
 for(const [,name,body] of frames){
  const props=new Set([...body.matchAll(/([a-z-]+)\s*:/g)].map(m=>m[1]));
  const allowed=name==='pmtxt'?['background-position']:['transform'];
  for(const p of props)assert(allowed.includes(p),name+' animates '+p);
 }
 for(const m of css.matchAll(/(^|\n)([^{}\n]*\.pm[^{}\n]*)\{([^}]*will-change[^}]*)\}/g))assert(/\.is-run/.test(m[2]),'will-change outside .is-run: '+m[2]);
 const scene=css.slice(css.indexOf('«پردهٔ آینه»'),css.indexOf('the salon seal'));
 assert(!/backdrop-filter|@property|mix-blend-mode/.test(scene),'no backdrop blur, no registered properties, no blend modes in the scene');
 assert(!/transition:[^;}]*(width|height|top|left|aspect-ratio|inset)/.test(scene),'no layout transitions in the scene');
 assert(/@supports/.test(scene),'feature queries guard the optional parts');
 assert(/prefers-reduced-motion/.test(scene));
});

test('the scene cleans up after itself: listeners, observers, object URLs, hidden tabs',()=>{
 const ctl=clientJS.slice(clientJS.indexOf('function pmCtl'),clientJS.indexOf('var PMC=null'));
 for(const need of ['visibilitychange','removeEventListener','cancelAnimationFrame','clearInterval','disconnect','document.hidden'])assert(ctl.includes(need),'pmCtl: '+need);
 assert(/addEventListener\('visibilitychange'/.test(clientJS.slice(clientJS.indexOf('function poll('))),'poll listens for the tab coming back');
 const poll=clientJS.slice(clientJS.indexOf('function poll('),clientJS.indexOf('/* ---------- three-angle view'));
 for(const need of ['removeEventListener(\'online\'','removeEventListener(\'offline\'','removeEventListener(\'visibilitychange\''])assert(poll.includes(need),'poll: '+need);
 assert(clientJS.includes('URL.revokeObjectURL'),'angle viewer revokes its object URL');
 assert(/['"]close['"]/.test(clientJS.slice(clientJS.indexOf('function openViews'))),'the angle viewer ends its work when the sheet closes');
});

test('retry makes a new job after a failure (new idempotency key) and only re-asks after an unknown answer',()=>{
 const poll=clientJS.slice(clientJS.indexOf('function poll('),clientJS.indexOf('/* ---------- three-angle view'));
 assert(/kind==='failed'\)\{state\.idem=null/.test(poll),'a failed job must not be re-sent with the same key');
 assert(/function recheck\(\)/.test(clientJS)&&/recheckKind\(state\.errKind\)\)recheck\(\);else generate\(\)/.test(clientJS));
});

test('the zoom button sits clear of the frame corner, the labels and the grip',()=>{
 assert(/\.zoomx\{position:absolute;z-index:6;top:27%;inset-inline-end:9%;/.test(customerHTML));
 assert(/\.mirror\.nofx\{filter:none\}/.test(customerHTML),'the animating mirror does not carry the drop-shadow filter');
});
