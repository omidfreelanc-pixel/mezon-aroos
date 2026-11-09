import {appHTML} from './ui.js';
import {customerHTML} from './customer.js';
import {api,errorResponse,tick} from './server.js';
import {must,hash} from './domain.js';
import {setting,setSetting} from './alerts.js';
import {fontResponse} from './fonts.js';
import {webhook,baleWebhook,setWebhook} from './telegram.js';
import {favicon,baseCSS} from './design.js';
import {sharePage} from './share.js';
import {postPage} from './social.js';
import {resultPage,resultImage} from './resultlinks.js';
import {pairPage,pairUpload} from './pairing.js';
import {landingFor} from './landing.js';
import {panelPage} from './credits.js';
import {subOf} from './manager.js';
import {registerHTML} from './register.js';
const htmlHeaders={'Content-Type':'text/html;charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; font-src 'self' data:; media-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",'Permissions-Policy':'camera=(self), geolocation=(), microphone=()'};
// Only real pages are served the app shell; everything else is a 404, never a blank app page.
const pages=[/^\/admin\/?$/,/^\/admin\/[a-z0-9-]{1,64}\/?$/,/^\/s\/[a-z0-9-]{1,64}\/?$/,/^\/i\/[a-z0-9-]{1,64}\/?$/,/^\/p\/[a-f0-9]{32}\/?$/,/^\/m\/[a-f0-9]{32}\/?$/,/^\/signin-with-chatgpt(\/.*)?$/];
const notFound='<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#e8edeb"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><title>صفحه پیدا نشد | مزون آینه</title><style>'+baseCSS+'.nf{min-height:100vh;display:grid;place-items:center;padding:32px 20px;text-align:center}.nf main{display:grid;justify-items:center;gap:18px;max-width:420px}.nf .mirror{width:150px}.nf .mirror__glass{aspect-ratio:3/4}.nf h1{font-family:var(--display);font-weight:800;font-size:32px}.nf p{color:var(--muted);line-height:2}</style></head><body class="nf"><main><div class="mirror"><div class="mirror__glass"></div></div><h1>این صفحه پیدا نشد</h1><p>نشانی اشتباه است یا صفحهٔ مزون برداشته شده. لینک اختصاصی مزون را دوباره باز کنید.</p><a class="btn btn--primary" href="/">صفحهٔ اصلی مزون آینه</a></main></body></html>';
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
 const tags='<title>'+attr(title)+'</title>\n<meta name="description" content="'+attr(desc)+'">\n<meta property="og:title" content="'+attr(title)+'">\n<meta property="og:description" content="'+attr(desc)+'">\n<meta property="og:type" content="website">\n<meta property="og:url" content="'+attr(url)+'">\n<meta property="og:site_name" content="مزون آینه">\n<meta property="og:locale" content="fa_IR">\n'+(img?'<meta property="og:image" content="'+attr(img)+'">\n<meta property="og:image:alt" content="'+attr(salon.name)+'">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:image" content="'+attr(img)+'">\n':'<meta name="twitter:card" content="summary">\n')+'<link rel="canonical" href="'+attr(url)+'">';
 const pre=p.cover?'<link rel="preload" as="image" href="/api/s/'+attr(salon.slug)+'/media/'+attr(p.cover)+'">\n':'';
 const skelName='<div class="hero__name" style="height:auto">'+attr(salon.name)+'</div>';
 return customerHTML.replace('<div class="skel" style="width:70%;height:38px"></div>',()=>skelName).replace(/<meta name="description"[^>]*>\n?/,'').replace(/<meta property="og:[a-z:]+"[^>]*>\n?/g,'').replace(/<title>[^<]*<\/title>/,()=>pre+tags);
}
// Registers the bot webhook once per (origin, secret, token) so a fresh deploy or rotated secret
// needs no manual step. Failures are swallowed; the admin button and /api/internal/webhook still work.
async function ensureWebhook(env,origin){try{
 if(!env.DB||!env.TELEGRAM_BOT_TOKEN||!env.TELEGRAM_WEBHOOK_SECRET)return;
 const sig=await hash((env.APP_ORIGIN||origin)+'|'+env.TELEGRAM_WEBHOOK_SECRET+'|'+env.TELEGRAM_BOT_TOKEN);
 if(await setting(env.DB,'webhook_sig')===sig)return;
 await setWebhook(env,env.APP_ORIGIN||origin);
 await setSetting(env.DB,'webhook_sig',sig);
}catch{}}
export default {
 async fetch(request,env,ctx){try{const u=new URL(request.url);
  if(u.pathname==='/api/internal/webhook'){must(request.method==='POST','متد مجاز نیست',405);must(env.JOB_TOKEN&&request.headers.get('Authorization')==='Bearer '+env.JOB_TOKEN,'دسترسی مجاز نیست',403);return Response.json(await setWebhook(env,env.APP_ORIGIN||u.origin));}
  if(u.pathname==='/api/internal/tick'){must(request.method==='POST','متد مجاز نیست',405);must(env.JOB_TOKEN&&request.headers.get('Authorization')==='Bearer '+env.JOB_TOKEN,'دسترسی مجاز نیست',403);return Response.json(await tick(env,u.origin));}
  if(u.pathname==='/api/telegram/webhook')return await webhook(request,env);
  if(u.pathname.startsWith('/api/bale/webhook/'))return await baleWebhook(request,env,decodeURIComponent(u.pathname.slice(18)));
  if(u.pathname.startsWith('/api/'))return await api(request,env);
  if(u.pathname==='/favicon.ico')return new Response(null,{status:204,headers:{'Cache-Control':'public,max-age=86400'}});
  if(u.pathname==='/favicon.svg')return new Response(favicon,{headers:{'Content-Type':'image/svg+xml','Cache-Control':'public,max-age=86400'}});
  if(u.pathname.startsWith('/fonts/')){const f=fontResponse(u.pathname.slice(7));if(f)return f;}
  {const sub=subOf(u,env);if(sub&&(u.pathname==='/'||/^\/manager\/?$/.test(u.pathname))){
   const sl=env.DB?await env.DB.prepare('SELECT slug,approved FROM salons WHERE subdomain=?').bind(sub).first().catch(()=>null):null;
   if(!sl||!sl.approved)return new Response(notFound,{status:404,headers:htmlHeaders});
   const tag=v=>'<head><script>window.__'+v+'='+JSON.stringify(sl.slug)+'</script>';
   if(u.pathname==='/'){const html=await salonPage(new URL('/s/'+sl.slug,u),{...env,APP_ORIGIN:u.origin});return new Response((html||customerHTML).replace('<head>',()=>tag('SLUG')),{headers:htmlHeaders});}
   return new Response(appHTML.replace('<head>',()=>tag('MGR')),{headers:htmlHeaders});
  }}
  if(u.pathname==='/register'||u.pathname==='/register/')return new Response(registerHTML,{headers:{...htmlHeaders,'Cache-Control':'public,max-age=300'}});
  if(u.pathname==='/robots.txt'){const o=env.APP_ORIGIN||u.origin;return new Response('User-agent: *\nAllow: /\nAllow: /s/\nDisallow: /api/\nDisallow: /admin\nDisallow: /manager\nDisallow: /register\nDisallow: /r/\n\nSitemap: '+o+'/sitemap.xml\n',{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'public,max-age=3600'}})}
  if(u.pathname==='/sitemap.xml'){const o=env.APP_ORIGIN||u.origin;return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+['/','/s/demo'].map(p=>'<url><loc>'+o+p+'</loc></url>').join('')+'</urlset>',{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public,max-age=3600'}})}
  if(u.pathname==='/'){ctx?.waitUntil(ensureWebhook(env,u.origin));return new Response(landingFor(env.APP_ORIGIN||u.origin),{headers:{...htmlHeaders,'Cache-Control':'public,max-age=300'}})}
  {const m=/^\/u\/([a-f0-9]{12})(\/photo)?$/.exec(u.pathname);if(m){if(m[2]){if(request.method!=='POST')return new Response('Method not allowed',{status:405});return await pairUpload(env,request,m[1])}return await pairPage(env,m[1],notFound)}}
  {const m=/^\/r\/([a-f0-9]{48})(\/img)?$/.exec(u.pathname);if(m){if(m[2]){return (await resultImage(env,m[1],request))||new Response('Not found',{status:404,headers:{'Cache-Control':'no-store'}})}return await resultPage(env,m[1],notFound)}}
  if(!pages.some(r=>r.test(u.pathname)))return new Response(notFound,{status:404,headers:htmlHeaders});
  {const m=/^\/m\/([a-f0-9]{32})\/?$/.exec(u.pathname);if(m)return await panelPage(env,m[1],notFound,htmlHeaders);}
  if(/^\/p\/[a-f0-9]{32}\/?$/.test(u.pathname)){const html=await postPage(u,env);return new Response(html||notFound,{status:html?200:404,headers:htmlHeaders});}
  if(/^\/i\/[a-z0-9-]{1,64}\/?$/.test(u.pathname)){const html=await sharePage(u,env);return new Response(html||notFound,{status:html?200:404,headers:htmlHeaders});}
  if(/^\/s\/[a-z0-9-]{1,64}\/?$/.test(u.pathname)){const html=await salonPage(u,env);return html?new Response(html,{headers:htmlHeaders}):new Response(notFound,{status:404,headers:htmlHeaders});}
  return new Response(appHTML,{headers:htmlHeaders});
 }catch(e){return errorResponse(e)}},
 async scheduled(event,env,ctx){ctx.waitUntil(tick(env,env.APP_ORIGIN||''))}
};
