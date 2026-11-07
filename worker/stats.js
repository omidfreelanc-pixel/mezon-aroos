import {NAIL_STYLES,LASH_STYLES,COLOR_STYLES} from './lines.js';
// Numbers for the owner dashboard. Everything comes from anonymous events (events_log), the
// generations table and, for the salon response figures, the last 30 days of submissions.
// Days are Tehran calendar days.
const DAY=86400000,TEHRAN_SHIFT=12600; // +03:30 in seconds
const all=async(db,sql,...a)=>(await db.prepare(sql).bind(...a).all()).results;
const one=(db,sql,...a)=>db.prepare(sql).bind(...a).first();
const dayOf=ms=>new Date(ms+TEHRAN_SHIFT*1000).toISOString().slice(0,10);

export async function stats(db,{days=30,salonId=null,styles=[],now=Date.now()}={}){
 now+=1; // the window ends after this millisecond, so an event logged just now is counted
 const from=now-days*DAY,prevFrom=from-days*DAY;
 const w=(alias='')=>(alias?alias+'.':'')+'created_at>=? AND '+(alias?alias+'.':'')+'created_at<?'+(salonId?' AND '+(alias?alias+'.':'')+'salon_id=?':'');
 const args=(a,b)=>salonId?[a,b,salonId]:[a,b];
 const distinct=async(kind,a,b)=>Number((await one(db,"SELECT COUNT(DISTINCT visitor) n FROM events_log WHERE kind=? AND visitor<>'' AND "+w(),kind,...args(a,b)))?.n||0);
 const count=async(kind,a,b)=>Number((await one(db,'SELECT COUNT(*) n FROM events_log WHERE kind=? AND '+w(),kind,...args(a,b)))?.n||0);
 const sims=async(a,b)=>{const r=await one(db,"SELECT COUNT(*) total,SUM(CASE WHEN state='success' THEN 1 ELSE 0 END) ok,SUM(CASE WHEN state IN('fail','unknown') THEN 1 ELSE 0 END) bad FROM generations WHERE kind='single' AND "+w(),...args(a,b));return {total:Number(r?.total||0),success:Number(r?.ok||0),failed:Number(r?.bad||0)}};
 async function kpi(a,b){const visitors=await distinct('view',a,b),photos=await distinct('photo',a,b),g=await sims(a,b),sent=await count('sent',a,b);return {visitors,photos,simulations:g.total,sent,conversion:visitors?sent/visitors:0}}
 const cur=await kpi(from,now),prev=await kpi(prevFrom,from);

 const funnel=[['view','بازدید صفحه'],['photo','عکس گذاشتند'],['look','مدل انتخاب کردند'],['result','نتیجه را دیدند'],['sent','برای مزون فرستادند']];
 for(const f of funnel)f.push(await distinct(f[0],from,now));
 // Sent submissions without a visitor id (very old pages) still count in the KPI, not the funnel.

 const dayRows=await all(db,"SELECT date((created_at/1000)+"+TEHRAN_SHIFT+",'unixepoch') d,COUNT(DISTINCT CASE WHEN kind='view' AND visitor<>'' THEN visitor END) visitors,SUM(CASE WHEN kind='sent' THEN 1 ELSE 0 END) sent FROM events_log WHERE "+w()+" GROUP BY d",...args(from,now));
 const byDay=Object.fromEntries(dayRows.map(r=>[r.d,r]));const daily=[];
 for(let t=from+DAY;t<=now+1;t+=DAY){const d=dayOf(t);daily.push({day:d,visitors:Number(byDay[d]?.visitors||0),sent:Number(byDay[d]?.sent||0)})}

 const lookRows=await all(db,"SELECT meta,COUNT(*) n FROM events_log WHERE kind='look' AND "+w()+" GROUP BY meta ORDER BY n DESC LIMIT 12",...args(from,now));
 const lookName=m=>{const s=String(m||'');if(s.startsWith('c:')){const i=Number(s.slice(2));return styles[i]?.[0]||'مدل آماده'}if(s.startsWith('n:')){const i=Number(s.slice(2));return 'ناخن: '+(NAIL_STYLES[i]?.[0]||'طرح آماده')}if(s.startsWith('r:')){const i=Number(s.slice(2));return 'رنگ: '+(COLOR_STYLES[i]?.[0]||'رنگ آماده')}if(s.startsWith('l:')){const i=Number(s.slice(2));return 'مژه: '+(LASH_STYLES[i]?.[0]||'مدل آماده')}if(s.startsWith('s:'))return 'کار مزون: '+s.slice(2);if(s==='u')return 'عکس مدل دلخواه';return s||'نامشخص'};
 const lookMap={};for(const r of lookRows){const k=lookName(r.meta);lookMap[k]=(lookMap[k]||0)+Number(r.n)}
 const looks=Object.entries(lookMap).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([label,n])=>({label,count:n}));
 const colors=(await all(db,"SELECT meta label,COUNT(*) n FROM events_log WHERE kind='color' AND meta<>'' AND "+w()+" GROUP BY meta ORDER BY n DESC LIMIT 8",...args(from,now))).map(r=>({label:r.label,count:Number(r.n)}));

 const ratingRows=await all(db,"SELECT substr(meta,1,1) v,COUNT(*) n FROM events_log WHERE kind='rating' AND "+w()+" GROUP BY v",...args(from,now));
 const dist=[5,4,3,2,1].map(v=>Number(ratingRows.find(r=>Number(r.v)===v)?.n||0));const rc=dist.reduce((a,b)=>a+b,0);
 const rating={count:rc,avg:rc?dist.reduce((s,n,i)=>s+n*(5-i),0)/rc:0,dist};

 const g=await sims(from,now);
 const generation={...g,rate:g.total?g.success/g.total:0};

 const respFrom=Math.max(from,now-30*DAY);
 const leads=await all(db,'SELECT salon_status,created_at,handled_at FROM leads WHERE '+w()+" AND status='sent'",...args(respFrom,now));
 const durations=leads.filter(l=>l.handled_at).map(l=>(l.handled_at-l.created_at)/60000).sort((a,b)=>a-b);
 const st=k=>leads.filter(l=>l.salon_status===k).length;
 const response={total:leads.length,handled:durations.length,called:st('called'),booked:st('booked'),declined:st('declined'),waiting:st('new'),overdue:leads.filter(l=>l.salon_status==='new'&&l.created_at<now-DAY).length,medianMinutes:durations.length?durations[Math.floor(durations.length/2)]:null,windowDays:Math.round((now-respFrom)/DAY)};

 const extra={tourStart:await count('tour_start',from,now),tourDone:await count('tour_done',from,now),tourSkip:await count('tour_skip',from,now),view360:await count('view360',from,now),about:await count('about',from,now),follow:await count('follow',from,now),demo:await count('demo',from,now)};
 const byLine=(await all(db,'SELECT line,COUNT(*) n FROM leads WHERE '+w()+' GROUP BY line',...args(from,now))).reduce((o,r)=>(o[r.line||'dress']=Number(r.n),o),{hair:0,color:0,nails:0,lashes:0});
 const lineLooks=(await all(db,"SELECT meta,COUNT(*) n FROM events_log WHERE kind='line' AND "+w()+" GROUP BY meta",...args(from,now))).reduce((o,r)=>(o[r.meta]=Number(r.n),o),{});
 const share={opened:await count('share_open',from,now),sent:await count('share',from,now),visitors:Number((await one(db,"SELECT COUNT(DISTINCT visitor) n FROM events_log WHERE kind='view' AND meta='share' AND "+w(),...args(from,now)))?.n||0),byApp:(await all(db,"SELECT meta label,COUNT(*) n FROM events_log WHERE kind='share' AND "+w()+" GROUP BY meta ORDER BY n DESC",...args(from,now))).map(r=>({label:r.label,count:Number(r.n)}))};

 let salons=[];
 if(!salonId){
  const rows=await all(db,'SELECT id,slug,name FROM salons ORDER BY created_at DESC LIMIT 100');
  for(const s of rows){
   const v=Number((await one(db,"SELECT COUNT(DISTINCT visitor) n FROM events_log WHERE kind='view' AND visitor<>'' AND salon_id=? AND created_at>=?",s.id,from))?.n||0);
   const sent=Number((await one(db,"SELECT COUNT(*) n FROM events_log WHERE kind='sent' AND salon_id=? AND created_at>=?",s.id,from))?.n||0);
   const l=await one(db,"SELECT COUNT(*) total,SUM(CASE WHEN handled_at IS NOT NULL THEN 1 ELSE 0 END) handled FROM leads WHERE salon_id=? AND status='sent' AND created_at>=?",s.id,respFrom);
   salons.push({slug:s.slug,name:s.name,visitors:v,sent,conversion:v?sent/v:0,handledRate:l?.total?Number(l.handled||0)/Number(l.total):null});
  }
  salons.sort((a,b)=>b.visitors-a.visitors||b.sent-a.sent);
 }
 return {days,kpi:cur,prev,funnel:funnel.map(([key,label,count])=>({key,label,count})),daily,looks,colors,rating,generation,response,extra,share,lines:{requests:byLine,switches:lineLooks},salons};
}
