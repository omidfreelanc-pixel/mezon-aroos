// Manager identity.
// On Sites/ChatGPT hosting the platform supplies `oai-authenticated-*` headers.
// On any other host (Cloudflare Workers, a VPS) the owner signs in with a password and
// receives an HMAC-signed, HttpOnly cookie. The two paths never weaken each other:
// the password path needs SESSION_SECRET plus OWNER_PASSWORD or OWNER_PASSWORD_HASH.
const enc=new TextEncoder();
const b64u=b=>btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
async function mac(secret,data){const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return b64u(await crypto.subtle.sign('HMAC',key,enc.encode(data)))}
export function same(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let out=0;for(let i=0;i<a.length;i++)out|=a.charCodeAt(i)^b.charCodeAt(i);return out===0}
export const passwordLoginEnabled=env=>!!(env?.OWNER_PASSWORD||env?.OWNER_PASSWORD_HASH)&&!!env?.SESSION_SECRET;
export async function issueCookie(env,user,email,secure=true){const exp=Date.now()+7*86400000;const body=encodeURIComponent(user)+'|'+encodeURIComponent(email||'')+'|'+exp;const value=body+'|'+await mac(env.SESSION_SECRET,body);return 'ayneh_admin='+value+'; HttpOnly'+(secure?'; Secure':'')+'; SameSite=Lax; Path=/; Max-Age=604800'}
export const clearCookie=secure=>'ayneh_admin=; HttpOnly'+(secure?'; Secure':'')+'; SameSite=Lax; Path=/; Max-Age=0';
export async function identity(req,env){
 // Hosting identity headers are only trusted when the deployment explicitly says a trusted
 // gateway strips and sets them. Otherwise anyone could send the header themselves.
 const supplied=env?.TRUST_PLATFORM_IDENTITY==='true'?req.headers.get('oai-authenticated-user-id'):'';
 if(supplied)return {user:supplied,email:req.headers.get('oai-authenticated-user-email')||'',via:'sites'};
 if(!env?.SESSION_SECRET)return null;
 const raw=(req.headers.get('cookie')||'').match(/(?:^|; )ayneh_admin=([^;]+)/)?.[1];
 if(!raw)return null;
 const parts=raw.split('|');
 if(parts.length!==4)return null;
 const body=parts.slice(0,3).join('|');
 if(!same(parts[3],await mac(env.SESSION_SECRET,body)))return null;
 if(!Number.isFinite(Number(parts[2]))||Number(parts[2])<Date.now())return null;
 return {user:decodeURIComponent(parts[0]),email:decodeURIComponent(parts[1]),via:'password'};
}
