// Generates the Mezon Aroos lookbook: one full-length photo per ready-made wedding dress
// (worker/lines.js DRESS_STYLES) → public/catalog/dress/NN.webp, plus a demo before/after pair.
// ONLY limits a run: dress numbers (3,7) or 'demo'. Existing files are skipped unless FORCE=1.
// Needs KIE_API_KEY in the environment and `sharp` installed.
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {DRESS_STYLES,DRESS_SHOTS,linePrompt} from '../worker/lines.js';

const key=process.env.KIE_API_KEY;
if(!key){console.log('KIE_API_KEY is not set; nothing generated.');process.exit(0)}
const force=process.env.FORCE==='1';
const only=(process.env.ONLY||'').split(',').map(x=>x.trim()).filter(Boolean);
const out='public/catalog/dress';mkdirSync(out,{recursive:true});
const sharp=(await import('sharp')).default;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

// Out of credit: stop the whole run at once (every further call would fail the same way).
class NoCredit extends Error{}
let lastCall=0;
async function kie(path,body){
 const wait=lastCall+1500-Date.now();if(wait>0)await sleep(wait);lastCall=Date.now();const r=await fetch('https://api.kie.ai'+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const d=await r.json();if(!r.ok||d.code!==200){const msg=(d.msg||JSON.stringify(d)).slice(0,200);if(/credit|balance|top up/i.test(msg))throw new NoCredit('KIE credit is used up: '+msg);throw new Error('KIE '+r.status+' '+msg)}return d.data}
// Best model first; if the account does not have it, fall back once.
async function generate(input){
 let task;
 try{task=await kie('/api/v1/jobs/createTask',{model:'nano-banana-pro',input})}
 catch(e){if(e instanceof NoCredit)throw e;console.log('  nano-banana-pro rejected ('+e.message+'), using nano-banana-2');task=await kie('/api/v1/jobs/createTask',{model:'nano-banana-2',input})}
 for(let t=0;t<72;t++){await sleep(5000);const d=await kie('/api/v1/jobs/recordInfo?taskId='+encodeURIComponent(task.taskId));if(d.state==='success')return JSON.parse(d.resultJson).resultUrls?.[0];if(d.state==='fail')throw new Error('task failed: '+(d.failMsg||''))}
 throw new Error('timed out');
}
async function save(url,file,w,h){const img=Buffer.from(await (await fetch(url)).arrayBuffer());writeFileSync(file,await sharp(img).resize(w,h,{fit:'cover',position:'top'}).webp({quality:80}).toBuffer())}

const brides=[
 'an Iranian woman in her late twenties with olive skin, dark brown eyes and long dark brown hair styled in a soft low bun, a medium build with natural curves',
 'an Iranian woman in her thirties with fair skin and hazel eyes, hair in loose waves, a slim build',
 'an Iranian woman in her early twenties with light-brown skin, dark eyes and hair in an elegant updo, an average build',
 'an Iranian woman in her thirties with warm beige skin and a kind smile, hair softly curled over one shoulder, a fuller figure with wide hips',
 'an Iranian woman in her late twenties with medium olive skin and green-brown eyes, hair in a sleek half-up style, a tall slender build'
];
const shot=(d,i)=>'Professional bridal boutique lookbook photograph, FULL-LENGTH from head to the floor including the whole hem and any train, of '+brides[i%brides.length]+' standing relaxed and facing the camera in a bright, elegant boutique with a soft neutral backdrop. She wears: '+d+'. The dress must match this description exactly. Soft even daylight, sharp focus on the dress fabric and details, natural skin texture, light natural makeup, no veil and no tiara. No text, no logo, no watermark.';

let made=0,failed=0;
const stop=e=>{if(e instanceof NoCredit){console.log(e.message+' — top up KIE and run this workflow again.');process.exit(1)}};
for(const [i,s] of DRESS_STYLES.entries()){
 const n=String(i+1).padStart(2,'0'),file=out+'/'+n+'.webp';
 if(only.length&&!only.includes(String(i+1)))continue;
 if(existsSync(file)&&!force){console.log(n,'exists, skipped');continue}
 try{await save(await generate({prompt:shot(DRESS_SHOTS[i],i),image_input:[],aspect_ratio:'2:3',resolution:'1K',output_format:'jpg'}),file,480,720);console.log(n,s[0],'✓');made++}
 catch(e){stop(e);console.log(n,s[0],'failed:',e.message);failed++}
}

// Demo pair: a casual full-body photo in everyday clothes, then the same photo through the pipeline customers use.
const b1=out+'/demo-before.webp',a1=out+'/demo-after.webp';
if((!existsSync(b1)||!existsSync(a1)||force)&&(!only.length||only.includes('demo'))){
 try{
  const before=await generate({prompt:'Photorealistic casual smartphone photo, FULL-LENGTH from head to feet, of an Iranian woman in her thirties with olive skin and a medium build with natural curves, standing straight facing the camera in a bright boutique fitting room, wearing a plain fitted grey knit top and long dark trousers, hair in a loose low bun, feet visible on the floor. Soft daylight, natural skin, no filter. No text or watermark.',image_input:[],aspect_ratio:'2:3',resolution:'1K',output_format:'jpg'});
  const after=await generate({prompt:linePrompt('dress','catalog',DRESS_SHOTS[0]),image_input:[before],aspect_ratio:'2:3',resolution:'1K',output_format:'jpg'});
  await save(before,b1,480,720);await save(after,a1,480,720);console.log('demo ✓');made+=2;
 }catch(e){stop(e);console.log('demo failed:',e.message);failed++}
}
console.log('done: '+made+' made, '+failed+' failed');
if(failed&&!made)process.exit(1);
