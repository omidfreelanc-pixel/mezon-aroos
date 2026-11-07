// Staff referrals. Every salon page link can carry ?r=<code>:
//  - a member's code ("s" + 7 chars) makes the visitor that member's customer (generation 1);
//  - a visitor's tag ("v" + 8 chars) makes the new visitor a child of that visitor and inherits the
//    member, so a link stays that member's however many times it is passed on;
//  - no or an unknown code makes the visitor the salon's own (the manager assigns them later).
// The first link wins for good; only the manager moves a customer. Once a mobile is known it is
// locked to the same member (keyed hash only), so another phone or browser keeps the owner.
import {must,hash} from './domain.js';

const one=(db,sql,...a)=>db.prepare(sql).bind(...a).first();
const run=(db,sql,...a)=>db.prepare(sql).bind(...a).run();
const all=async(db,sql,...a)=>(await db.prepare(sql).bind(...a).all()).results;
const ALPH='abcdefghjkmnpqrstuvwxyz23456789';
export const code=(prefix,n)=>prefix+Array.from(crypto.getRandomValues(new Uint8Array(n)),b=>ALPH[b%ALPH.length]).join('');
export const validVisitor=v=>/^[a-f0-9]{16,32}$/.test(String(v||''));
export const STAFF_CODE=/^s[a-z2-9]{7}$/,VISITOR_TAG=/^v[a-z2-9]{8}$/;
export const SPECIALTIES=['کوتاهی','رنگ و مش','شینیون','صافی و کراتین','ناخن','مژه و ابرو','سایر'];
export const phoneKey=(env,number)=>hash('ref-phone:'+(env?.SESSION_SECRET||'')+':'+number);

// An inactive member hands over to whoever replaced them (a short chain at most).
export async function liveStaff(db,salonId,id){
 for(let i=0;i<8&&id;i++){const t=await one(db,'SELECT id,active,replaced_by FROM team WHERE id=? AND salon_id=?',id,salonId);if(!t)return null;if(t.active)return t.id;id=t.replaced_by}
 return null;
}
export async function createStaff(db,salon,name,specialty){
 const n=String(name||'').trim().slice(0,60),sp=String(specialty||'').trim().slice(0,40);
 must(n.length>=2,'اسم نیرو کوتاه است');
 for(let i=0;i<5;i++){
  const row={id:code('t',8),ref_code:code('s',7)};
  try{await run(db,'INSERT INTO team(id,salon_id,name,specialty,ref_code,created_at) VALUES(?,?,?,?,?,?)',row.id,salon.id,n,sp,row.ref_code,Date.now());return {...row,salon_id:salon.id,name:n,specialty:sp,active:1}}
  catch(e){if(i===4)throw e}
 }
}
export const team=(db,salonId,activeOnly=true)=>all(db,'SELECT * FROM team WHERE salon_id=?'+(activeOnly?' AND active=1':'')+' ORDER BY created_at',salonId);

// Called by the customer page on every visit. Returns the visitor's own share tag and owner.
export async function attribute(db,salon,visitor,r){
 must(validVisitor(visitor),'شناسهٔ بازدید معتبر نیست');
 r=String(r||'').slice(0,20);
 let row=await one(db,'SELECT * FROM ref_visitors WHERE salon_id=? AND visitor=?',salon.id,visitor);
 if(!row){
  let staff=null,parent=null,gen=0,came='';
  if(STAFF_CODE.test(r)){const t=await one(db,'SELECT id FROM team WHERE salon_id=? AND ref_code=?',salon.id,r);if(t){staff=await liveStaff(db,salon.id,t.id);gen=1;came=r}}
  else if(VISITOR_TAG.test(r)){const p=await one(db,'SELECT * FROM ref_visitors WHERE salon_id=? AND tag=?',salon.id,r);if(p&&p.visitor!==visitor){parent=p.visitor;gen=(p.gen||0)+1;staff=p.staff_id?await liveStaff(db,salon.id,p.staff_id):null;came=r}}
  for(let i=0;i<5&&!row;i++){
   await run(db,'INSERT OR IGNORE INTO ref_visitors(salon_id,visitor,tag,staff_id,parent_visitor,gen,came_with,created_at) VALUES(?,?,?,?,?,?,?,?)',salon.id,visitor,code('v',8),staff,parent,gen,came,Date.now());
   row=await one(db,'SELECT * FROM ref_visitors WHERE salon_id=? AND visitor=?',salon.id,visitor);
  }
  must(row,'ثبت بازدید ممکن نشد',500);
 }else if(r&&r!==row.came_with){
  // A later visit through another member's link: remembered, never applied automatically.
  let other=null;
  if(STAFF_CODE.test(r)){const t=await one(db,'SELECT id FROM team WHERE salon_id=? AND ref_code=?',salon.id,r);other=t?await liveStaff(db,salon.id,t.id):null}
  else if(VISITOR_TAG.test(r)){const p=await one(db,'SELECT staff_id FROM ref_visitors WHERE salon_id=? AND tag=?',salon.id,r);other=p?.staff_id?await liveStaff(db,salon.id,p.staff_id):null}
  const mine=row.staff_id?await liveStaff(db,salon.id,row.staff_id):null;
  if(other&&other!==mine)await run(db,'UPDATE ref_visitors SET conflict_staff=? WHERE salon_id=? AND visitor=?',other,salon.id,visitor);
 }
 return {tag:row.tag,mine:row.staff_id?await liveStaff(db,salon.id,row.staff_id):null};
}

// Who owns a request: the mobile's lock if it has an owner, else the visitor's, and the lock is
// created or filled in. Also reports a pending conflict (a visit through another member's link).
export async function ownerFor(db,env,salon,visitor,number){
 const v=validVisitor(visitor)?await one(db,'SELECT * FROM ref_visitors WHERE salon_id=? AND visitor=?',salon.id,visitor):null;
 const key=number?await phoneKey(env,number):null;
 const ph=key?await one(db,'SELECT * FROM ref_phones WHERE salon_id=? AND phone_hash=?',salon.id,key):null;
 let staff=null;
 const fromPhone=ph?.staff_id?await liveStaff(db,salon.id,ph.staff_id):null;
 const fromVisitor=v?.staff_id?await liveStaff(db,salon.id,v.staff_id):null;
 staff=fromPhone||fromVisitor||null;
 if(key){
  if(!ph)await run(db,'INSERT OR IGNORE INTO ref_phones(salon_id,phone_hash,staff_id,visitor,created_at) VALUES(?,?,?,?,?)',salon.id,key,staff,v?v.visitor:'',Date.now());
  else if(!fromPhone&&staff)await run(db,'UPDATE ref_phones SET staff_id=? WHERE salon_id=? AND phone_hash=?',staff,salon.id,key);
 }
 if(v&&staff&&v.staff_id!==staff)await run(db,'UPDATE ref_visitors SET staff_id=? WHERE salon_id=? AND visitor=?',staff,salon.id,v.visitor);
 const conflict=v?.conflict_staff&&v.conflict_staff!==staff?await liveStaff(db,salon.id,v.conflict_staff):null;
 if(v?.conflict_staff)await run(db,'UPDATE ref_visitors SET conflict_staff=NULL WHERE salon_id=? AND visitor=?',salon.id,v.visitor);
 return {staff,conflict:conflict&&conflict!==staff?conflict:null};
}

// The manager gives a customer (and everyone under them who followed the old owner or had none)
// to a member. staffId=null gives them back to the salon.
export async function assign(db,env,salon,{visitor,number},staffId){
 const before=validVisitor(visitor)?(await one(db,'SELECT staff_id FROM ref_visitors WHERE salon_id=? AND visitor=?',salon.id,visitor))?.staff_id||null:null;
 if(number){const key=await phoneKey(env,number);await run(db,'INSERT INTO ref_phones(salon_id,phone_hash,staff_id,visitor,created_at) VALUES(?,?,?,?,?) ON CONFLICT(salon_id,phone_hash) DO UPDATE SET staff_id=excluded.staff_id',salon.id,key,staffId,visitor||'',Date.now())}
 if(validVisitor(visitor)){
  await run(db,'WITH RECURSIVE sub(v) AS (SELECT ? UNION SELECT r.visitor FROM ref_visitors r JOIN sub ON r.parent_visitor=sub.v WHERE r.salon_id=?) UPDATE ref_visitors SET staff_id=? WHERE salon_id=? AND visitor IN (SELECT v FROM sub) AND (visitor=? OR staff_id IS NULL OR staff_id=?)',visitor,salon.id,staffId,salon.id,visitor,before||'');
 }
}

// A member leaves: everything of theirs goes to `to` (a member id, or null for the salon).
export async function transfer(db,salonId,from,to){
 must(from!==to,'نیروی جایگزین باید فرد دیگری باشد');
 if(to)must(await one(db,'SELECT 1 FROM team WHERE id=? AND salon_id=? AND active=1',to,salonId),'نیروی جایگزین پیدا نشد',404);
 await run(db,'UPDATE team SET active=0,replaced_by=?,telegram_chat_id=NULL,bale_chat_id=NULL,invite_hash=NULL WHERE id=? AND salon_id=?',to,from,salonId);
 await run(db,'UPDATE team SET replaced_by=? WHERE replaced_by=? AND salon_id=?',to,from,salonId);
 await run(db,'UPDATE ref_visitors SET staff_id=? WHERE staff_id=? AND salon_id=?',to,from,salonId);
 await run(db,'UPDATE ref_visitors SET conflict_staff=NULL WHERE conflict_staff=? AND salon_id=?',from,salonId);
 await run(db,'UPDATE ref_phones SET staff_id=? WHERE staff_id=? AND salon_id=?',to,from,salonId);
 await run(db,'UPDATE portfolio SET published=0 WHERE staff_id=? AND salon_id=?',from,salonId);
 // Untouched requests move to the new owner and are delivered to them again.
 const open=await all(db,"SELECT id FROM leads WHERE staff_id=? AND salon_id=? AND salon_status='new'",from,salonId);
 await run(db,"UPDATE leads SET staff_id=?,waiting=0,messages='{}',status='retry',attempts=0,reminders=0 WHERE staff_id=? AND salon_id=? AND salon_status='new'",to,from,salonId);
 await run(db,'UPDATE leads SET staff_id=? WHERE staff_id=? AND salon_id=?',to,from,salonId);
 return open.map(x=>x.id);
}

// Owner report: per member totals and generations, top referrers and the who-brought-whom tree.
export async function report(db,{salonId=null,maxNodes=300}={}){
 const where=salonId?' WHERE salon_id=?':'',args=salonId?[salonId]:[];
 const salons=await all(db,'SELECT id,name,slug FROM salons'+(salonId?' WHERE id=?':''),...args);
 const members=await all(db,'SELECT id,salon_id,name,specialty,active,ref_code,telegram_chat_id IS NOT NULL OR bale_chat_id IS NOT NULL AS linked FROM team'+where+' ORDER BY created_at',...args);
 const vis=await all(db,'SELECT salon_id,visitor,staff_id,parent_visitor,gen,name,created_at FROM ref_visitors'+where+' ORDER BY created_at LIMIT 20000',...args);
 const leads=await all(db,"SELECT salon_id,visitor,staff_id,salon_status FROM leads"+where,...args);
 const sentBy=new Set(leads.filter(l=>l.visitor).map(l=>l.salon_id+':'+l.visitor));
 const key=v=>v.salon_id+':'+v.visitor,kids=new Map(),byKey=new Map();
 for(const v of vis){byKey.set(key(v),v);if(v.parent_visitor){const k=v.salon_id+':'+v.parent_visitor;if(!kids.has(k))kids.set(k,[]);kids.get(k).push(v)}}
 // Subtree sizes (iterative, so a deep chain cannot overflow the stack).
 const size=new Map(),sent=new Map();
 for(const v of [...vis].reverse()){const k=key(v);let s=0,q=0;for(const c of kids.get(k)||[]){s+=1+(size.get(key(c))||0);q+=(sentBy.has(key(c))?1:0)+(sent.get(key(c))||0)}size.set(k,s);sent.set(k,q)}
 const salonName=Object.fromEntries(salons.map(s=>[s.id,s.name]));
 const row=(salon_id,id,name,specialty,active,linked)=>{
  const mine=vis.filter(v=>v.salon_id===salon_id&&(v.staff_id||null)===id),ls=leads.filter(l=>l.salon_id===salon_id&&(l.staff_id||null)===id);
  const g=n=>mine.filter(v=>n===3?v.gen>=3:v.gen===n).length;
  return {id,salon_id,salon:salonName[salon_id]||'',name,specialty,active:!!active,linked:!!linked,visitors:mine.length,gen0:g(0),gen1:g(1),gen2:g(2),gen3:g(3),requests:ls.length,booked:ls.filter(l=>l.salon_status==='booked').length,conversion:mine.length?ls.length/mine.length:0};
 };
 const staff=members.map(m=>row(m.salon_id,m.id,m.name,m.specialty,m.active,m.linked));
 const unowned=salons.map(s=>row(s.id,null,'خود مزون (بدون نیرو)','',1,1)).filter(r=>r.visitors||r.requests);
 const top=vis.filter(v=>v.name&&(size.get(key(v))||0)>0).map(v=>({name:v.name,salon:salonName[v.salon_id]||'',staff:members.find(m=>m.id===v.staff_id)?.name||'خود مزون',brought:size.get(key(v))||0,sent:sent.get(key(v))||0,gen:v.gen})).sort((a,b)=>b.brought-a.brought||b.sent-a.sent).slice(0,15);
 // Trees: one per member (and one per salon for its own visitors), roots are visitors with no parent.
 const trees=[];
 for(const owner of [...members.map(m=>({salon_id:m.salon_id,id:m.id,name:m.name})),...salons.map(s=>({salon_id:s.id,id:null,name:'خود مزون'}))]){
  const roots=vis.filter(v=>v.salon_id===owner.salon_id&&!v.parent_visitor&&(v.staff_id||null)===owner.id);
  if(!roots.length)continue;let count=0;
  const build=v=>{if(count>=maxNodes)return null;count++;const k=key(v);return {label:v.name||'بازدیدکننده',sent:sentBy.has(k),gen:v.gen,size:size.get(k)||0,kids:(kids.get(k)||[]).map(build).filter(Boolean)}};
  const nodes=[];for(const r of roots){const n=build(r);if(n)nodes.push(n)}
  trees.push({salon:salonName[owner.salon_id]||'',owner:owner.name,staff_id:owner.id,total:roots.reduce((s,r)=>s+1+(size.get(key(r))||0),0),shown:count,nodes});
 }
 return {staff,unowned,top,trees,totals:{visitors:vis.length,referred:vis.filter(v=>v.parent_visitor||v.gen>=1).length,requests:leads.length}};
}
