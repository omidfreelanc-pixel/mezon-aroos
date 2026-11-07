// Checks whether the configured KIE key is accepted, without ever printing it.
// Reads KIE_API_KEY from the environment or from git-ignored .dev.vars / .env files.
// Usage: npm run check:kie
import {existsSync,readFileSync} from 'node:fs';
function fromFile(name){for(const file of ['.dev.vars','.env']){if(!existsSync(file))continue;for(const line of readFileSync(file,'utf8').split('\n')){const m=line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);if(m&&m[1]===name&&m[2])return m[2].replace(/^['"]|['"]$/g,'')}}return ''}
const key=process.env.KIE_API_KEY||fromFile('KIE_API_KEY');
if(!key){console.log('KIE_API_KEY تنظیم نشده است. آن را در .dev.vars (محلی، داخل .gitignore) یا در تنظیمات امن میزبانی بگذارید، نه در چت و نه در گیت.');process.exit(2)}
console.log('KIE_API_KEY تنظیم شده است (طول '+key.length+' کاراکتر). مقدار کلید هرگز چاپ نمی‌شود.');
let res,body;
try{res=await fetch('https://api.kie.ai/api/v1/jobs/recordInfo?taskId=ayneh-connectivity-check',{headers:{Authorization:'Bearer '+key},signal:AbortSignal.timeout(20000)})}
catch{console.log('اتصال به api.kie.ai برقرار نشد؛ شبکه یا فیلترینگ را بررسی کنید. کلید نامعتبر اعلام نمی‌شود.');process.exit(3)}
try{body=await res.json()}catch{body={}}
const code=Number(body?.code??0);
if(res.status===401||res.status===403||code===401||code===403){console.log('کلید پذیرفته نشد (HTTP '+res.status+'). کلید را در سرویس بررسی کنید.');process.exit(1)}
console.log('کلید پذیرفته شد (HTTP '+res.status+', code '+code+'). این درخواست برای یک شناسهٔ ساختگی است، پس پیام «task یافت نشد» طبیعی است.');
