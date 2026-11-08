import {appHTML} from './ui.js';
import {customerHTML} from './customer.js';
import {api,errorResponse,tick} from './server.js';
import {must} from './domain.js';
import {fontResponse} from './fonts.js';
import {webhook,baleWebhook,setWebhook} from './telegram.js';
import {favicon,baseCSS} from './design.js';
import {sharePage} from './share.js';
const htmlHeaders={'Content-Type':'text/html;charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; font-src 'self' data:; media-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",'Permissions-Policy':'camera=(self), geolocation=(), microphone=()'};
// Only real pages are served the app shell; everything else is a 404, never a blank app page.
const pages=[/^\/admin\/?$/,/^\/admin\/[a-z0-9-]{1,64}\/?$/,/^\/s\/[a-z0-9-]{1,64}\/?$/,/^\/i\/[a-z0-9-]{1,64}\/?$/,/^\/signin-with-chatgpt(\/.*)?$/];
const notFound='<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#e8edeb"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><title>صفحه پیدا نشد | مزون عروس</title><style>'+baseCSS+'.nf{min-height:100vh;display:grid;place-items:center;padding:32px 20px;text-align:center}.nf main{display:grid;justify-items:center;gap:18px;max-width:420px}.nf .mirror{width:150px}.nf .mirror__glass{aspect-ratio:3/4}.nf h1{font-family:var(--display);font-weight:800;font-size:32px}.nf p{color:var(--muted);line-height:2}</style></head><body class="nf"><main><div class="mirror"><div class="mirror__glass"></div></div><h1>این صفحه پیدا نشد</h1><p>نشانی اشتباه است یا صفحهٔ مزون برداشته شده. لینک اختصاصی مزون را دوباره باز کنید.</p><a class="btn btn--primary" href="/">صفحهٔ اصلی مزون عروس</a></main></body></html>';
// Link previews (Telegram, WhatsApp, Instagram, iMessage) read these tags, so each salon page
// carries its own name, description and cover instead of generic ones.
const attr=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function salonPage(u,env){
 const slug=u.pathname.split('/')[2];let salon=null;
 let failed=!env.DB;try{salon=env.DB?await env.DB.prepare('SELECT slug,name,profile FROM salons WHERE slug=?').bind(slug).first():null}catch{failed=true}
 // A database hiccup still serves the page (it shows its own error); only a missing salon is a 404.
 if(!salon)return failed||slug==='demo'?customerHTML:null;
 let p={};try{p=JSON.parse(salon.profile||'{}')}catch{}
 const origin=env.APP_ORIGIN||u.origin,url=origin+'/s/'+salon.slug;
 const title=salon.name+' | لباس عروس را روی اندام خودت ببین';
 const desc=(p.bio?String(p.bio).slice(0,150)+' ':'')+'لباس عروس را روی عکس تمام‌قد خودت امتحان کن؛ سایز و فرم بدنت همان می‌ماند. بعد برای مزون بفرست.';
 const img=p.cover||p.logo?origin+'/api/s/'+salon.slug+'/media/'+(p.cover||p.logo):'';
 const tags='<title>'+attr(title)+'</title>\n<meta name="description" content="'+attr(desc)+'">\n<meta property="og:title" content="'+attr(title)+'">\n<meta property="og:description" content="'+attr(desc)+'">\n<meta property="og:type" content="website">\n<meta property="og:url" content="'+attr(url)+'">\n<meta property="og:site_name" content="مزون عروس">\n<meta property="og:locale" content="fa_IR">\n'+(img?'<meta property="og:image" content="'+attr(img)+'">\n<meta property="og:image:alt" content="'+attr(salon.name)+'">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:image" content="'+attr(img)+'">\n':'<meta name="twitter:card" content="summary">\n')+'<link rel="canonical" href="'+attr(url)+'">';
 return customerHTML.replace(/<meta name="description"[^>]*>\n?/,'').replace(/<meta property="og:[a-z:]+"[^>]*>\n?/g,'').replace(/<title>[^<]*<\/title>/,tags);
}
const homeHTML='<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#e8edeb"><title>مزون عروس | لباس عروس را روی اندام خودت ببین</title><meta name="description" content="پرو مجازی لباس عروس روی عکس تمام‌قد خودت، با حفظ سایز و فرم بدن."><link rel="icon" href="/favicon.svg"><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#e8edeb;color:#2b2118;font:16px/1.9 Vazirmatn,Tahoma,sans-serif}main{max-width:460px;padding:32px 24px;text-align:center}h1{font-size:28px;margin:0 0 8px}p{margin:0 0 20px;color:#5b5148}a{display:inline-block;padding:14px 26px;border-radius:999px;background:#1f6f6b;color:#fff;text-decoration:none;font-weight:700}</style></head><body><main><h1>مزون عروس</h1><p>لباس عروس را روی اندام خودت ببین؛ قد و سایز بدنت همان می‌ماند. مزون‌داران لباس‌هایشان را در تلگرام می‌گذارند و عروس‌ها در یک دقیقه پرو می‌کنند.</p><a href="/s/demo">نمونه را ببین</a></main></body></html>';
export default {
 async fetch(request,env){try{const u=new URL(request.url);
  if(u.pathname==='/api/internal/webhook'){must(request.method==='POST','متد مجاز نیست',405);must(env.JOB_TOKEN&&request.headers.get('Authorization')==='Bearer '+env.JOB_TOKEN,'دسترسی مجاز نیست',403);return Response.json(await setWebhook(env,env.APP_ORIGIN||u.origin));}
  if(u.pathname==='/api/internal/tick'){must(request.method==='POST','متد مجاز نیست',405);must(env.JOB_TOKEN&&request.headers.get('Authorization')==='Bearer '+env.JOB_TOKEN,'دسترسی مجاز نیست',403);return Response.json(await tick(env,u.origin));}
  if(u.pathname==='/api/telegram/webhook')return await webhook(request,env);
  if(u.pathname.startsWith('/api/bale/webhook/'))return await baleWebhook(request,env,decodeURIComponent(u.pathname.slice(18)));
  if(u.pathname.startsWith('/api/'))return await api(request,env);
  if(u.pathname==='/favicon.ico')return new Response(null,{status:204,headers:{'Cache-Control':'public,max-age=86400'}});
  if(u.pathname==='/favicon.svg')return new Response(favicon,{headers:{'Content-Type':'image/svg+xml','Cache-Control':'public,max-age=86400'}});
  if(u.pathname.startsWith('/fonts/')){const f=fontResponse(u.pathname.slice(7));if(f)return f;}
  if(u.pathname==='/')return new Response(homeHTML,{headers:{...htmlHeaders,'Cache-Control':'public,max-age=300'}});
  if(!pages.some(r=>r.test(u.pathname)))return new Response(notFound,{status:404,headers:htmlHeaders});
  if(/^\/i\/[a-z0-9-]{1,64}\/?$/.test(u.pathname)){const html=await sharePage(u,env);return new Response(html||notFound,{status:html?200:404,headers:htmlHeaders});}
  if(/^\/s\/[a-z0-9-]{1,64}\/?$/.test(u.pathname)){const html=await salonPage(u,env);return html?new Response(html,{headers:htmlHeaders}):new Response(notFound,{status:404,headers:htmlHeaders});}
  return new Response(appHTML,{headers:htmlHeaders});
 }catch(e){return errorResponse(e)}},
 async scheduled(event,env,ctx){ctx.waitUntil(tick(env,env.APP_ORIGIN||''))}
};
