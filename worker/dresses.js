// Per-dress numbers, lead statuses and the photo-retention job (Step 3).
// A dress is 'p:<portfolio id>' (one of the boutique's own dresses) or 'd:<n>' (a ready-made
// catalogue dress). Try-ons come from the generations table, saves from events_log (save_look),
// «می‌خواهم» requests from leads with intent='want'.
import {DRESS_STYLES} from './lines.js';
import {bucketFor} from './storage.js';

const DAY=86400000;
const all=async(db,sql,...a)=>(await db.prepare(sql).bind(...a).all()).results;
const run=(db,sql,...a)=>db.prepare(sql).bind(...a).run();
const parse=s=>{try{return JSON.parse(s||'{}')}catch{return {}}};

export const DRESS_KEY=/^(d:\d{1,3}|p:[a-f0-9-]{36})$/;
export const cleanDressKey=v=>DRESS_KEY.test(String(v||''))?String(v):'';
export const LEAD_STATUSES=['new','called','booked','cancelled','declined'];
export const CLOSED=['booked','cancelled','declined'];
export const STATUS_FA={new:'جدید',called:'تماس گرفته شد',booked:'رزرو شد',cancelled:'لغو',declined:'بسته شد'};
export const DEFAULT_RETENTION_DAYS=30;
export const retentionDays=cfg=>{const n=Number(cfg?.retention_days);return Number.isInteger(n)&&n>=0&&n<=3650?n:DEFAULT_RETENTION_DAYS}; // 0 = keep everything

// media id -> {id,title} for every dress of one boutique (deleted dresses simply are not found).
export async function portfolioIndex(db,salonId){
 const byMedia=new Map(),byId=new Map();
 for(const p of await all(db,'SELECT id,title,images FROM portfolio WHERE salon_id=?',salonId)){
  byId.set(p.id,p.title);
  let imgs=[];try{imgs=JSON.parse(p.images||'[]')}catch{}
  for(const m of imgs)byMedia.set(m,p.id);
 }
 return {byMedia,byId};
}
// The dress a generation (or a lead's chosen result) is about; '' for a customer's own photo.
export function dressKeyOf(g,index){
 if(g.reference_id){const pid=index.byMedia.get(g.reference_id);return pid?'p:'+pid:''}
 return Number.isInteger(g.style)&&g.style>=0&&DRESS_STYLES[g.style]?'d:'+g.style:'';
}
export function dressName(key,index){
 if(key.startsWith('d:'))return DRESS_STYLES[Number(key.slice(2))]?.[0]||'لباس آماده';
 if(key.startsWith('p:'))return index?.byId.get(key.slice(2))||'لباس حذف‌شدهٔ مزون';
 return 'نامشخص';
}

// Try-ons, saves and requests per dress in [from,to). Rows are per boutique; a boutique's dress
// with no activity is not listed. conversion = requests / try-ons (0 when nothing was tried).
export async function dressStats(db,{salonId=null,from,to,limit=12}){
 const bySalon=salonId?[salonId]:(await all(db,'SELECT id FROM salons')).map(r=>r.id);
 const names=Object.fromEntries((await all(db,'SELECT id,name FROM salons')).map(r=>[r.id,r.name]));
 const rows=[];
 for(const sid of bySalon){
  const index=await portfolioIndex(db,sid),acc={};
  const add=(key,field,n)=>{if(!key)return;(acc[key]??={tryons:0,saves:0,wants:0})[field]+=Number(n)};
  for(const r of await all(db,"SELECT reference_id,style,COUNT(*) n FROM generations WHERE salon_id=? AND kind='single' AND state='success' AND line='dress' AND created_at>=? AND created_at<? GROUP BY reference_id,style",sid,from,to))add(dressKeyOf(r,index),'tryons',r.n);
  for(const r of await all(db,"SELECT meta,COUNT(*) n FROM events_log WHERE salon_id=? AND kind='save_look' AND created_at>=? AND created_at<? GROUP BY meta",sid,from,to))add(cleanDressKey(r.meta),'saves',r.n);
  for(const r of await all(db,"SELECT dress_key,COUNT(*) n FROM leads WHERE salon_id=? AND intent='want' AND dress_key<>'' AND created_at>=? AND created_at<? GROUP BY dress_key",sid,from,to))add(cleanDressKey(r.dress_key),'wants',r.n);
  for(const [key,v] of Object.entries(acc))rows.push({salon:salonId?undefined:names[sid],key,name:dressName(key,index),...v,conversion:v.tryons?Math.min(1,v.wants/v.tryons):0});
 }
 rows.sort((a,b)=>b.wants-a.wants||b.tryons-a.tryons||b.saves-a.saves);
 return rows.slice(0,limit);
}

// One place that changes a request's status (bot buttons and the admin panel). `closed_at` is set
// when the boutique closes it and cleared when it is reopened; the retention job reads it.
export async function setLeadStatus(db,lead,status){
 if(!LEAD_STATUSES.includes(status))return {changed:false};
 const now=Date.now(),closed=CLOSED.includes(status);
 await run(db,'UPDATE leads SET salon_status=?,handled_at=CASE WHEN ?<>\'new\' THEN COALESCE(handled_at,?) ELSE handled_at END,closed_at=? WHERE id=?',status,status,now,closed?now:null,lead.id);
 return {changed:lead.salon_status!==status};
}

// Photo retention: a boutique's customers' photos and results that never became a request are
// deleted after N days (owner setting retention_days, default 30, 0 = keep). Photos of a request
// stay while it is open and for N days after it is closed. Portfolio and brand photos are never touched.
export async function purgePhotos(env,now=Date.now(),batch=200){
 const db=env.DB;let n=0;
 for(const s of await all(db,'SELECT id,settings FROM salons')){
  const cfg=parse(s.settings),days=retentionDays(cfg),mins=Number(cfg.retention_minutes),span=Number.isInteger(mins)&&mins>=10&&mins<=1440?mins*60000:(cfg.retention_days===undefined?15*60000:days*DAY);
  if(!span||n>=batch)continue; // 0 days and no minutes = keep everything
  const cut=now-span,fast=!(Number.isInteger(mins)&&mins>=10&&mins<=1440)&&cfg.retention_days===undefined,leadCut=fast?(days?now-days*DAY:0):cut; // unsent photos: 15 min by default; requests keep the days rule
  const rows=await all(db,"SELECT m.id,m.object_key FROM media m WHERE m.salon_id=? AND m.kind IN('original','reference','simulation','spin') AND m.session_id IS NOT NULL AND m.created_at<? AND NOT EXISTS(SELECT 1 FROM generations sg WHERE sg.result_id=m.id AND sg.social_consent=1) AND NOT EXISTS(SELECT 1 FROM leads l WHERE (l.original_id=m.id OR l.reference_id=m.id OR l.preview_id=m.id) AND (l.closed_at IS NULL OR l.closed_at>=?)) ORDER BY m.created_at LIMIT ?",s.id,cut,leadCut,batch-n);
  for(const m of rows){
   try{await bucketFor(env).delete(m.object_key)}catch(e){console.error('purge object',e?.message);continue}
   await run(db,'DELETE FROM media WHERE id=?',m.id);n++;
  }
 }
 return n;
}

// What the bride is told about her request (salon-facing labels are STATUS_FA). `declined` is never shown as a refusal.
export const BRIDE_STATUS_FA={new:'منتظر تماس مزون',called:'مزون با تو تماس گرفته',booked:'نوبت هماهنگ شد',cancelled:'درخواست بسته شد',declined:'فعلاً امکان‌پذیر نیست؛ مزون با تو در تماس است'};

// «Bad result» reasons the bride can pick (kept for evals). 'other' may carry a short free note.
export const REACTION_REASONS={face:'چهره شبیه من نیست',body:'اندام یا قد تغییر کرده',dress:'لباس شبیه مدل مزون نیست',artifact:'خطای تصویر (دست، لبه، پارچه)',other:'دلیل دیگر'};

// Deletes one request and the photos that only it needed: the bride's own photos and the result. Photos another request,
// a dress of the portfolio or a shared post still uses stay. Returns how many photos were deleted.
export async function deleteLead(env,db,salonId,leadId){
 const lead=await db.prepare('SELECT * FROM leads WHERE id=? AND salon_id=?').bind(leadId,salonId).first();
 if(!lead)return null;
 await run(db,'DELETE FROM leads WHERE id=?',lead.id);
 let n=0;
 for(const id of new Set([lead.original_id,lead.reference_id,lead.preview_id].filter(Boolean))){
  const m=await db.prepare("SELECT id,object_key FROM media WHERE id=? AND salon_id=? AND session_id IS NOT NULL AND kind IN('original','reference','simulation','spin') AND NOT EXISTS(SELECT 1 FROM leads l WHERE l.original_id=media.id OR l.reference_id=media.id OR l.preview_id=media.id) AND NOT EXISTS(SELECT 1 FROM portfolio p WHERE p.salon_id=media.salon_id AND EXISTS(SELECT 1 FROM json_each(p.images) WHERE value=media.id)) AND NOT EXISTS(SELECT 1 FROM generations sg WHERE sg.result_id=media.id AND sg.social_consent=1)").bind(id,salonId).first();
  if(!m)continue;
  try{await bucketFor(env).delete(m.object_key)}catch(e){console.error('delete lead object',e?.message);continue}
  await run(db,'DELETE FROM media WHERE id=?',m.id);n++;
 }
 return {deleted:true,photos:n};
}
