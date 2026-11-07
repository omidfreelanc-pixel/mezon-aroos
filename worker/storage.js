// Photo storage. R2 is used when the binding exists, otherwise Workers KV (free plan, no
// payment method), otherwise the D1 database itself so a deployment with no object storage
// still works with a smaller per-file limit.
const DEFAULT_MIME='application/octet-stream';
export function maxUpload(env){if(env?.BUCKET)return 5*1024*1024;if(env?.KV)return 5*1024*1024;return 850*1024}
export function bucketFor(env){if(env?.BUCKET)return env.BUCKET;if(env?.KV)return kvBucket(env.KV);return d1Bucket(env.DB)}
function bufferOf(value){const bytes=value instanceof Uint8Array?value:new Uint8Array(value);return bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)}
function kvBucket(kv){return {
 async put(key,value,options){await kv.put(key,bufferOf(value),{metadata:{contentType:options?.httpMetadata?.contentType||DEFAULT_MIME}})},
 async get(key){const {value,metadata}=await kv.getWithMetadata(key,{type:'arrayBuffer'});if(!value)return null;const bytes=new Uint8Array(value);return {httpMetadata:{contentType:metadata?.contentType||DEFAULT_MIME},arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),body:bytes}},
 async delete(key){await kv.delete(key)}
}}
function d1Bucket(db){return {
 async put(key,value,options){const bytes=value instanceof Uint8Array?value:new Uint8Array(value);await db.prepare('INSERT INTO blobs(key,mime,bytes,created_at) VALUES(?,?,?,?) ON CONFLICT(key) DO UPDATE SET mime=excluded.mime,bytes=excluded.bytes').bind(key,options?.httpMetadata?.contentType||DEFAULT_MIME,bytes,Date.now()).run()},
 async get(key){const row=await db.prepare('SELECT mime,bytes FROM blobs WHERE key=?').bind(key).first();if(!row)return null;const bytes=row.bytes instanceof Uint8Array?row.bytes:new Uint8Array(row.bytes);return {httpMetadata:{contentType:row.mime||DEFAULT_MIME},arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),body:bytes}},
 async delete(key){await db.prepare('DELETE FROM blobs WHERE key=?').bind(key).run()}
}}

// Shared by the customer API and the Telegram bot.
import {Problem,must,uid} from './domain.js';
export function imageType(bytes){if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';if(bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71)return 'image/png';if(String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP')return 'image/webp';throw new Problem(400,'فقط تصویر JPG، PNG یا WebP معتبر پذیرفته می‌شود');}
export async function putImage(env,salon,s,bytes,kind){must(bytes.length>100,'فایل عکس خالی یا خیلی کوچک است');const limit=kind==='simulation'&&(env?.BUCKET||env?.KV)?10*1024*1024:maxUpload(env);must(bytes.length<=limit,'حجم عکس بیش از حد مجاز است ('+Math.round(limit/1024)+' کیلوبایت)');const mime=imageType(bytes),id=uid(),key=salon.id+'/'+id;await bucketFor(env).put(key,bytes,{httpMetadata:{contentType:mime}});try{await env.DB.prepare('INSERT INTO media VALUES(?,?,?,?,?,?,?)').bind(id,salon.id,s?.id||null,kind,key,mime,Date.now()).run();}catch(e){await bucketFor(env).delete(key);throw e}return id;}
