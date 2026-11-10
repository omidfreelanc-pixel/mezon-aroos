// Pure helpers for the waiting scene («پردهٔ آینه»), kept as source text: the customer page includes it verbatim and
// the tests evaluate the very same text in Node, so there is one copy of the logic. Written in ES5 on purpose: old phones must parse it.
// (A Worker may not eval, so only the tests build functions from it.)
export const SCENE_JS=String.raw`
// sRGB 0..255 -> [hue 0..360, saturation 0..1, lightness 0..1]
function rgbToHsl(r,g,b){
 r/=255;g/=255;b/=255;
 var mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,s=0,h=0,d=mx-mn;
 if(d>1e-9){
  s=l>.5?d/(2-mx-mn):d/(mx+mn);
  if(mx===r)h=(g-b)/d+(g<b?6:0);else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;
  h*=60;
 }
 return [h,s,l];
}
function hslToRgb(h,s,l){
 h=((h%360)+360)%360/360;
 function f(p,q,t){if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p}
 if(s<=0){var v=Math.round(l*255);return [v,v,v]}
 var q=l<.5?l*(1+s):l+s-l*s,p=2*l-q;
 return [Math.round(f(p,q,h+1/3)*255),Math.round(f(p,q,h)*255),Math.round(f(p,q,h-1/3)*255)];
}
function mixRGB(a,b,t){return [Math.round(a[0]+(b[0]-a[0])*t),Math.round(a[1]+(b[1]-a[1])*t),Math.round(a[2]+(b[2]-a[2])*t)]}

// The palette used when the dress image is missing, slow, or cannot be read (tainted canvas): ivory and gold.
function neutralPalette(){
 return {ok:false,tone:'neutral',dom:[236,226,206],acc:[201,169,106],luma:.9,sat:0};
}

// Names a dominant colour: white, ivory, champagne, blush, deep (dark) or just colour. (chroma, not HSL saturation:
// HSL saturation of a near-white is meaningless.)
function toneOf(r,g,b){
 var x=rgbToHsl(r,g,b),h=x[0],l=x[2],c=(Math.max(r,g,b)-Math.min(r,g,b))/255;
 if(l>=.84&&c<.05)return 'white';
 if(l>=.78&&c<.17&&h>=28&&h<=72)return 'ivory';
 if(l>=.52&&l<.80&&c>=.10&&h>=22&&h<=55)return 'champagne';
 if(l>=.58&&c>=.06&&(h>=325||h<=22))return 'blush';
 if(l<.26)return 'deep';
 return 'color';
}

// d: RGBA bytes of a small (about 32px) copy of the dress image. Returns the dress's dominant and accent colours (sceneAccent turns them into a faint tint).
// The picture's background (a uniform border) is ignored; a white dress on white keeps its own colour.
function dressPalette(d,w,h){
 if(!d||!(w>0)||!(h>0)||d.length<w*h*4)return neutralPalette();
 var i,x,y,n=w*h,bs=0,br=0,bg=0,bb=0,bn=0,ring=Math.max(1,Math.round(Math.min(w,h)/16));
 for(y=0;y<h;y++)for(x=0;x<w;x++){
  if(x<ring||y<ring||x>=w-ring||y>=h-ring){i=(y*w+x)*4;if(d[i+3]<128)continue;br+=d[i];bg+=d[i+1];bb+=d[i+2];bn++}
 }
 var bgm=bn?[br/bn,bg/bn,bb/bn]:null,vr=0;
 if(bgm){
  for(y=0;y<h;y++)for(x=0;x<w;x++){
   if(x<ring||y<ring||x>=w-ring||y>=h-ring){i=(y*w+x)*4;if(d[i+3]<128)continue;vr+=Math.abs(d[i]-bgm[0])+Math.abs(d[i+1]-bgm[1])+Math.abs(d[i+2]-bgm[2])}
  }
  vr/=bn*3;
 }
 var uniform=!!bgm&&vr<14;
 function collect(skipBg){
  var B={},tot=0,kept=0;
  for(y=0;y<h;y++)for(x=0;x<w;x++){
   i=(y*w+x)*4;if(d[i+3]<128)continue;
   var fx=x/w,fy=y/h,wt=(fx>.18&&fx<.82&&fy>.08&&fy<.96)?1:.35;
   tot+=wt;
   if(skipBg&&uniform){var dist=Math.abs(d[i]-bgm[0])+Math.abs(d[i+1]-bgm[1])+Math.abs(d[i+2]-bgm[2]);if(dist<20)continue}
   var lum=(d[i]*.299+d[i+1]*.587+d[i+2]*.114)/255;if(lum<.12)wt*=.5;
   var k=(d[i]>>5)*64+(d[i+1]>>5)*8+(d[i+2]>>5),o=B[k]||(B[k]={w:0,r:0,g:0,b:0});
   o.w+=wt;o.r+=d[i]*wt;o.g+=d[i+1]*wt;o.b+=d[i+2]*wt;kept+=wt;
  }
  return {B:B,tot:tot,kept:kept};
 }
 var c=collect(true);
 if(!c.tot)return neutralPalette();
 if(c.kept<c.tot*.06)c=collect(false);
 var best=null,bestScore=-1,k2;
 for(k2 in c.B){var o2=c.B[k2],m=[o2.r/o2.w,o2.g/o2.w,o2.b/o2.w],sat=rgbToHsl(m[0],m[1],m[2])[1],sc=o2.w*(1+.5*sat);if(sc>bestScore){bestScore=sc;best={m:m,w:o2.w}}}
 if(!best)return neutralPalette();
 var dom=[Math.round(best.m[0]),Math.round(best.m[1]),Math.round(best.m[2])],dh=rgbToHsl(dom[0],dom[1],dom[2]),acc=null,accScore=0;
 for(k2 in c.B){
  var o3=c.B[k2];if(o3.w<c.kept*.04)continue;
  var m3=[o3.r/o3.w,o3.g/o3.w,o3.b/o3.w],hs=rgbToHsl(m3[0],m3[1],m3[2]);
  var dd=Math.abs(m3[0]-dom[0])+Math.abs(m3[1]-dom[1])+Math.abs(m3[2]-dom[2]);
  var dh2=Math.abs(hs[0]-dh[0]);if(dh2>180)dh2=360-dh2;
  if(dd<90&&!(dh2>25&&hs[1]>.2))continue;
  var s3=o3.w*(hs[1]+.15);if(s3>accScore){accScore=s3;acc=[Math.round(m3[0]),Math.round(m3[1]),Math.round(m3[2])]}
 }
 var GOLD=[201,169,106];
 if(!acc)acc=mixRGB(dom,GOLD,.5);
 return {ok:true,tone:toneOf(dom[0],dom[1],dom[2]),dom:dom,acc:acc,luma:(dom[0]*.299+dom[1]*.587+dom[2]*.114)/255,sat:dh[1]};
}
function rgbCss(c){return c[0]+','+c[1]+','+c[2]}

// The dress's only influence on the scene: a faint tint, 12% at most, in the glow behind the mirror and in the progress dot.
// The more colourful of the dress's two colours is lifted to a mid lightness first, so a dark dress tints without dimming; an ivory
// or white dress (hardly any colour) barely tints at all. Never used as a surface colour.
var ACCENT_MAX=.12;
function sceneAccent(pal){
 var GLOW=[255,247,226],GOLD=[201,169,106];
 if(!pal||!pal.ok)return {t:0,glow:GLOW,dot:GOLD,hue:null};
 var a=rgbToHsl(pal.dom[0],pal.dom[1],pal.dom[2]),b=rgbToHsl(pal.acc[0],pal.acc[1],pal.acc[2]),c=b[1]>a[1]*1.25?b:a;
 var t=ACCENT_MAX*Math.max(0,Math.min(1,(c[1]-.05)/.3)),v=hslToRgb(c[0],Math.max(.45,c[1]),.55);
 return {t:t,glow:mixRGB(GLOW,v,t),dot:mixRGB(GOLD,v,t),hue:Math.round(c[0])};
}

// Where the veil's lower edge and the sharp (in-focus) part of her photo are, for a progress p in 0..1.
// The veil is 135% as tall as the photo and lifts by u of its own height; the sharp part starts a little above
// the veil's edge, so the photo comes into focus from the hem upward as the veil rises.
function sceneGeom(p){
 p=Math.max(0,Math.min(1,+p||0));
 var edge=1.35*(1-p),sharp=Math.max(0,Math.min(1,edge-.17));
 return {u:p,edge:edge,sharp:sharp};
}
// Real time -> progress while the job runs. It climbs smoothly to .8 and then rests there (the «hold» state).
function buildProgress(elapsedMs,totalMs){
 var x=Math.max(0,Math.min(1,elapsedMs/(totalMs||42000)));
 return .8*(1-Math.pow(1-x,1.7));
}
function holdNote(elapsedMs){
 return elapsedMs>85000?'کمی بیشتر از همیشه طول کشید؛ هنوز در حال ساخت است. صفحه را نبند.':elapsedMs>45000?'دارد تمام می‌شود… معمولاً حدود یک دقیقه طول می‌کشد.':'این صفحه را نبند؛ معمولاً حدود یک دقیقه طول می‌کشد.';
}

// What this browser can do -> how rich the scene is. feat: {css, filter, ctxFilter, canvas, raf, reduce, lowEnd}
//   mode  'full' (veil, focus pull, moving light), 'lite' (veil + focus pull only), 'still' (no motion at all)
//   blur  how the out-of-focus copy of her photo is made: 'ctx' (canvas filter), 'down' (down/up-scaling), 'css' (static blur), 'none'
function sceneCaps(f){
 f=f||{};
 var mode=(!f.css||!f.raf||f.reduce)?'still':f.lowEnd?'lite':'full';
 var blur=f.ctxFilter?'ctx':f.canvas!==false?'down':f.filter?'css':'none';
 return {mode:mode,blur:blur,light:mode==='full'};
}

// The state machine of one generation. A pure reducer: (state, event) -> state (the same object when the event does nothing).
// phases: idle, build, hold, offline, climax, done, failed, unknown, timeout, lost
// events: start, tick{elapsed}, poll{state}, neterr{online}, online, retry, finished, leave
var GEN_TOTAL_MS=42000,GEN_GIVEUP_MS=360000,GEN_MAX_NETFAILS=8;
function genReduce(s,e){
 s=s||{phase:'idle',fails:0,from:'build'};
 var p=s.phase;
 function to(phase,extra){var n={phase:phase,fails:s.fails,from:s.from};if(extra)for(var k in extra)n[k]=extra[k];return n}
 var live=(p==='build'||p==='hold'||p==='offline');
 switch(e&&e.type){
  case 'start':return (p==='idle'||p==='done'||p==='failed'||p==='unknown'||p==='timeout'||p==='lost')?{phase:'build',fails:0,from:'build'}:s;
  case 'tick':
   if(p==='build'&&e.elapsed>=GEN_TOTAL_MS)return to('hold');
   if(live&&e.elapsed>=GEN_GIVEUP_MS)return to('timeout');
   return s;
  case 'poll':
   if(!live)return s;
   if(e.state==='success')return to('climax',{fails:0});
   if(e.state==='fail')return to('failed');
   if(e.state==='unknown')return to('unknown');
   // still running: a good answer ends any offline spell
   if(p==='offline')return to(s.from==='hold'?'hold':'build',{fails:0});
   return s.fails?to(p,{fails:0}):s;
  case 'neterr':
   if(!live)return s;
   if(e.online===false)return p==='offline'?s:to('offline',{from:p==='hold'?'hold':'build'});
   if(s.fails+1>=GEN_MAX_NETFAILS)return to('lost',{fails:s.fails+1});
   return to(p,{fails:s.fails+1,from:p==='offline'?s.from:s.from});
  case 'online':return p==='offline'?to(s.from==='hold'?'hold':'build',{fails:0}):s;
  case 'retry':return (p==='failed'||p==='unknown'||p==='timeout'||p==='lost')?{phase:'build',fails:0,from:'build'}:s;
  case 'finished':return p==='climax'?to('done'):s;
  case 'leave':return p==='idle'?s:{phase:'idle',fails:0,from:'build'};
 }
 return s;
}

// The calm sentence that goes with each stopped phase. Neutral: nothing about money or credit that may not be true.
function phaseCopy(phase){
 return {
  failed:'این بار ساخته نشد. با عکسی تمام‌قد، روشن و روبه‌رو دوباره امتحان کن؛ معمولاً درست می‌شود.',
  unknown:'نتیجهٔ این درخواست هنوز معلوم نیست. کمی بعد دوباره بررسی کن؛ نیازی به ساختن دوباره نیست.',
  timeout:'هنوز آماده نشده. با «بررسی دوباره» همان درخواست پیگیری می‌شود.',
  lost:'ارتباطت قطع شد. نگران نباش؛ اگر ساخت شروع شده باشد، با «بررسی دوباره» نتیجه را می‌بینی.',
  offline:'اینترنتت قطع شده؛ به‌محض وصل‌شدن ادامه می‌دهیم.'
 }[phase]||'';
}
function retryLabel(phase){return phase==='failed'?'تلاش دوباره':'بررسی دوباره'}
`;
