// Salon owner registration (/register): salon details, the manager's own username and password, and the wanted
// subdomain. It creates the salon page (unapproved: everything works except image generation) via POST /api/trial.
export const registerHTML=String.raw`<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0c6b6b"><title>ثبت‌نام مزون‌دار | مزون آینه</title>
<style>
@font-face{font-family:"Estedad";font-weight:100 900;font-display:swap;src:url(/fonts/estedad-arabic.woff2) format("woff2");unicode-range:U+0600-06FF,U+0750-077F,U+08A0-08FF,U+200C-200D,U+FB50-FDFF,U+FE70-FEFF}
@font-face{font-family:"Vazirmatn";font-weight:100 900;font-display:swap;src:url(/fonts/vazirmatn-arabic.woff2) format("woff2");unicode-range:U+0600-06FF,U+0750-077F,U+08A0-08FF,U+200C-200D,U+FB50-FDFF,U+FE70-FEFF}
*{box-sizing:border-box}body{margin:0;font:16px/1.8 "Vazirmatn",system-ui,Tahoma,sans-serif;background:linear-gradient(180deg,#e8edeb,#fafbfa 38%);color:#23170f;min-height:100vh;padding-bottom:40px}
.top{background:linear-gradient(135deg,#0c6b6b,#074c4d);color:#fff;padding:26px 20px 70px;text-align:center;border-radius:0 0 34px 34px}.top h1{font:800 24px/1.5 "Estedad","Vazirmatn",sans-serif;margin:0}.top p{margin:4px 0 0;opacity:.9;font-size:15px}
main{max-width:520px;margin:-46px auto 0;padding:0 16px}.card{background:#fff;border-radius:24px;padding:20px;box-shadow:0 18px 40px -22px rgba(7,76,77,.45);margin-bottom:14px}
label{display:block;margin:12px 0 0;font-weight:700;font-size:15px}label small{display:block;font-weight:400;color:#6a756f;font-size:13px;line-height:1.7}
input,textarea{width:100%;border:2px solid #d6dfdb;border-radius:14px;padding:11px 14px;font:inherit;background:#fff;margin-top:4px}input:focus{outline:0;border-color:#0c6b6b}.ltr{direction:ltr;text-align:left}
.sub{display:flex;align-items:center;gap:6px;direction:ltr}.sub span{white-space:nowrap;color:#6a756f;font-size:14px}.sub input{margin:0}
.chk{display:flex;gap:10px;align-items:flex-start;margin-top:16px;font-weight:400;font-size:14px}.chk input{width:22px;height:22px;margin:3px 0 0;flex:none}
.btn{display:block;width:100%;border:0;border-radius:16px;padding:15px;font:700 17px "Vazirmatn",sans-serif;background:linear-gradient(135deg,#0c6b6b,#074c4d);color:#fff;margin-top:16px;cursor:pointer}.btn[disabled]{opacity:.5}
.msg{border-radius:14px;padding:10px 14px;margin:12px 0 0;font-size:15px}.bad{background:#fde8e8;color:#8a1c1c}.good{background:#e4f5e8;color:#1d5a2c}.links a{color:#0c6b6b;font-weight:700;word-break:break-all}
h2{font:700 17px/1.6 "Estedad","Vazirmatn",sans-serif;margin:0}
</style></head><body>
<div class="top"><h1>ثبت‌نام مزون‌دار</h1><p>صفحهٔ اختصاصی مزون خودت را بساز و پنل مدیریت بگیر</p></div>
<main>
<form class="card" id="f" autocomplete="off"><h2>مشخصات مزون</h2>
<label>نام و نام خانوادگی مدیر<input id="name" maxlength="60"></label>
<label>نام مزون<input id="salon" maxlength="80"></label>
<label>شهر<input id="city" maxlength="40"></label>
<label>شمارهٔ موبایل<input id="phone" name="tel" type="tel" class="ltr" dir="ltr" autocomplete="tel" inputmode="tel" placeholder="09123456789"></label>
<h2 style="margin-top:22px">ورود به پنل مدیریت</h2>
<label>نام کاربری<small>انگلیسی کوچک، عدد، نقطه یا خط تیره؛ حداقل ۳ کاراکتر</small><input id="username" name="username" class="ltr" dir="ltr" autocapitalize="off" autocorrect="off" spellcheck="false" autocomplete="username" maxlength="30"></label>
<label>رمز عبور<small>حداقل ۸ کاراکتر</small><input id="password" name="password" type="password" class="ltr" dir="ltr" autocomplete="new-password" maxlength="100"></label>
<label>نشانی دلخواه صفحهٔ مزون (اختیاری)<small>بعد از تأیید مدیر مزون آینه، صفحهٔ اختصاصی شما روی این زیردامنه باز می‌شود.</small><div class="sub"><input id="subdomain" class="ltr" autocapitalize="off" placeholder="rose" maxlength="31"><span id="base"></span></div></label>
<div id="codebox" hidden><label>کد پیامک‌شده<input id="code" class="ltr" inputmode="numeric" maxlength="8"></label></div>
<label class="chk"><input type="checkbox" id="consent"><span>با ثبت این فرم موافقم که مزون آینه برای فعال‌سازی حساب با من تماس بگیرد.</span></label>
<input id="website" tabindex="-1" autocomplete="off" style="position:absolute;top:0;inset-inline-start:0;width:1px;height:1px;opacity:0;pointer-events:none" aria-hidden="true">
<button class="btn" id="go" type="submit">ساخت صفحهٔ مزون</button><div class="msg bad" id="err" role="alert" hidden></div></form>
<section class="card" id="done" hidden><h2>صفحهٔ شما ساخته شد 🎉</h2><div class="msg good" id="botbox" style="margin:12px 0" hidden><b>مرحلهٔ مهم:</b> تلگرام خودکار باز می‌شود؛ فقط دکمهٔ <b>Start</b> را بزنید تا ربات وصل شود و خبر فعال‌شدن صفحه به همان‌جا برسد. اگر باز نشد، دکمهٔ زیر را بزنید.<br><a id="botl" class="btn" style="display:block;text-align:center;margin-top:10px" target="_blank" rel="noopener">باز کردن ربات و Start</a><a id="botl2" hidden></a></div><p>تا وقتی مدیر مزون آینه حساب را تأیید نکند، صفحهٔ شما و همهٔ بخش‌ها کار می‌کند اما ساخت تصویر بسته است. بعد از تأیید، پنل مدیریت و زیردامنهٔ اختصاصی شما فعال می‌شود و با همان نام کاربری و رمز وارد می‌شوید.</p><p class="links">صفحهٔ مشتری: <a id="l1" href="#"></a></p><p class="links">پنل اعتبار و شارژ (این لینک را نگه دارید): <a id="l2" href="#"></a></p></section>
</main>
<script>
var $=function(i){return document.getElementById(i)},base=location.hostname.replace(/^www\./,"");$("base").textContent="."+base;
var PD="۰۱۲۳۴۵۶۷۸۹",AD="٠١٢٣٤٥٦٧٨٩";
function lat(v){return v.replace(/[۰-۹٠-٩]/g,function(c){var i=PD.indexOf(c);return String(i<0?AD.indexOf(c):i)})}
function guard(id,bad,sub){var el=$(id),note=document.createElement("small");note.style.cssText="color:#b3261e;display:block;margin-top:4px";note.hidden=true;note.setAttribute("role","status");el.parentNode.appendChild(note);
 el.addEventListener("input",function(e){if(e.isComposing)return;var raw=this.value,v=lat(raw).toLowerCase();if(sub)v=v.replace(/[\s_]+/g,"-");v=v.replace(bad,"");if(v!==raw){var pos=this.selectionStart-(raw.length-v.length);this.value=v;try{this.setSelectionRange(pos,pos)}catch(x){}
  note.textContent="فقط حروف انگلیسی، عدد و . - مجاز است؛ کیبورد را روی انگلیسی بگذارید.";note.hidden=!/[^\x00-\x7f]/.test(raw)}else note.hidden=true})}
guard("subdomain",/[^a-z0-9-]/g,true);guard("username",/[^a-z0-9._-]/g);
$("f").addEventListener("submit",function(e){e.preventDefault();var err=$("err");err.hidden=true;var b=$("go");b.disabled=true;
 var body={name:$("name").value,salon:$("salon").value,city:$("city").value,phone:$("phone").value,username:$("username").value,password:$("password").value,subdomain:$("subdomain").value,consent:$("consent").checked,website:$("website").value,code:$("code").value};
 fetch("/api/trial",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}).then(function(r){return r.json().then(function(d){if(!r.ok)throw new Error(d.error||"خطا");return d})}).then(function(d){
  if(d.code_sent){$("codebox").hidden=false;err.hidden=false;err.className="msg good";err.textContent="کد تأیید به موبایلت پیامک شد؛ آن را وارد کن و دوباره دکمه را بزن.";return}
  if(!d.path){return}
  $("f").hidden=true;$("done").hidden=false;var bl=(d.bot&&(d.bot.telegram||d.bot.bale))||"";if(bl){$("botbox").hidden=false;$("botl").href=bl;var m=/^https:\/\/t\.me\/([^?]+)\?start=(\w+)$/.exec(bl);if(m){var a=document.createElement("a");a.href="tg://resolve?domain="+m[1]+"&start="+m[2];document.body.appendChild(a);setTimeout(function(){a.click()},600)}
  var tk=(d.panel||"").split("/m/")[1]||"",n=0,iv=setInterval(function(){if(!tk||++n>120){clearInterval(iv);return}fetch("/api/m/"+tk+"/bot").then(function(r){return r.json()}).then(function(x){if(x.linked){clearInterval(iv);$("botbox").className="msg good";$("botbox").textContent="✅ ربات وصل شد. بعد از تأیید مدیر مزون آینه، خبر فعال‌شدن صفحه همان‌جا برایتان می‌آید."}}).catch(function(){})},3000)}$("l1").href=$("l1").textContent=d.url;$("l2").href=$("l2").textContent=d.panel;
 }).catch(function(x){err.hidden=false;err.className="msg bad";err.textContent=x.message}).then(function(){b.disabled=false})});
</script></body></html>`;
