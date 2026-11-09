// Rule-based photo precheck, run on the server when a bride uploads her photo (before any paid generate call).
// Reads the image size from the file header (PNG, JPEG, WebP); no extra paid call. If the size cannot be read
// the photo is let through (the provider decides), so a odd-but-valid file is never blocked by this check.
import {Problem} from './domain.js';

export const PHOTO_RULES={minSide:400,maxSide:10000,maxPixels:60e6,maxRatio:3,maxPerSession:12};

export function imageInfo(b){
 try{
  if(b[0]===137&&b[1]===80&&b[2]===78&&b[3]===71&&b.length>=24)return {w:((b[16]<<24)|(b[17]<<16)|(b[18]<<8)|b[19])>>>0,h:((b[20]<<24)|(b[21]<<16)|(b[22]<<8)|b[23])>>>0};
  if(b[0]===255&&b[1]===216){
   let i=2;
   while(i+9<b.length){
    if(b[i]!==255){i++;continue}
    const m=b[i+1];if(m===255){i++;continue}
    if(m>=0xC0&&m<=0xCF&&m!==0xC4&&m!==0xC8&&m!==0xCC)return {h:(b[i+5]<<8)|b[i+6],w:(b[i+7]<<8)|b[i+8]};
    if(m===0xD8||m===0x01||(m>=0xD0&&m<=0xD7)){i+=2;continue}
    i+=2+((b[i+2]<<8)|b[i+3]);
   }
   return null;
  }
  if(String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP'){
   const t=String.fromCharCode(...b.slice(12,16));
   if(t==='VP8 '&&b.length>=30)return {w:(b[26]|(b[27]<<8))&0x3fff,h:(b[28]|(b[29]<<8))&0x3fff};
   if(t==='VP8L'&&b.length>=25)return {w:1+(((b[22]&0x3f)<<8)|b[21]),h:1+(((b[24]&0x0f)<<10)|(b[23]<<2)|((b[22]&0xc0)>>6))};
   if(t==='VP8X'&&b.length>=30)return {w:1+(b[24]|(b[25]<<8)|(b[26]<<16)),h:1+(b[27]|(b[28]<<8)|(b[29]<<16))};
  }
 }catch{}
 return null;
}

// Returns {width,height,warnings:[{code,message}]} or throws a 400 with a message the bride can act on.
export function precheck(bytes,kind='original'){
 const info=imageInfo(bytes),out={width:info?.w||null,height:info?.h||null,warnings:[]};
 if(!info||!info.w||!info.h)return out;
 const {w,h}=info,R=PHOTO_RULES,short=Math.min(w,h),long=Math.max(w,h);
 if(short<R.minSide)throw new Problem(400,'عکس خیلی کوچک است ('+w+'×'+h+'). یک عکس واضح‌تر بفرست؛ ضلع کوتاه عکس حداقل '+R.minSide+' پیکسل باشد.');
 if(long>R.maxSide||w*h>R.maxPixels)throw new Problem(400,'ابعاد عکس بیش از حد بزرگ است. یک عکس معمولی از دوربین گوشی بفرست یا کوچک‌ترش کن.');
 if(long/short>R.maxRatio)throw new Problem(400,'قاب عکس خیلی کشیده است (مثل پانوراما). یک عکس تمام‌قد معمولی بفرست.');
 if(kind==='original'&&w>h*1.15)out.warnings.push({code:'landscape',message:'عکس تمام‌قد را ایستاده (عمودی) بگیر تا نتیجه بهتر شود؛ این عکس افقی است.'});
 return out;
}
