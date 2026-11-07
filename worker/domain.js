export class Problem extends Error {constructor(status,message){super(message);this.status=status;}}
export function must(test,message='درخواست معتبر نیست',status=400){if(!test)throw new Problem(status,message);}
export const digits=s=>String(s??'').replace(/[۰-۹]/g,x=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(x)).replace(/[٠-٩]/g,x=>'٠١٢٣٤٥٦٧٨٩'.indexOf(x));
export function phone(s){let n=digits(s).replace(/[\s()-]/g,'').replace(/^0098/,'+98');if(/^09\d{9}$/.test(n))n='+98'+n.slice(1);if(/^9\d{9}$/.test(n))n='+98'+n;must(/^\+989\d{9}$/.test(n),'شماره موبایل ایران معتبر نیست');return n;}
export function text(s,max=500){must(typeof s==='string'&&s.length<=max,'متن بیش از حد مجاز است');return s.trim();}
export function safeLink(s){if(!s)return '';try{const u=new URL(s);must(['https:','http:'].includes(u.protocol),'لینک معتبر نیست');return u.href;}catch{throw new Problem(400,'لینک معتبر نیست');}}
// What each ready-made style actually looks like, so the image model is not guessing from a
// two-word name. Keys are the English names in legacy.js `styles`.
export const STYLE_DETAILS={
 'Long layered haircut':'long hair well past the shoulders with long cascading layers and soft face-framing pieces from the cheekbones, bouncy blow-dried finish',
 'Butterfly haircut':'a butterfly haircut: long hair with short face-framing layers starting at the chin and long layers below, big bouncy blow-out volume',
 'Wolf cut':'a wolf cut: shaggy, choppy layers concentrated at the crown, wispy face-framing pieces, mullet-like shape, tousled texture, shoulder length',
 'Hush cut':'a hush cut: soft feathery layers throughout, wispy ends, airy light movement, shoulder length, with see-through bangs',
 'Long bob':'a lob: collarbone-length bob, ends just above the shoulders, soft subtle layers, gentle movement',
 'Short bob':'a short chin-length bob, blunt even ends at jaw level, sleek and smooth, slight inward bend at the ends',
 'A-line bob, longer in front':'an A-line bob: short at the nape and gradually longer toward the face, front pieces reaching the collarbone, sleek angled line',
 'Pixie cut':'a pixie cut: very short on the back and sides, slightly longer textured top, soft side-swept fringe',
 'Curtain bangs':'curtain bangs parted in the middle, sweeping to both sides and framing the face at cheekbone level, with medium-long hair',
 'Butterfly bangs':'butterfly bangs: long, layered, voluminous bangs that sweep outward from a center part like wings and blend into face-framing layers',
 'Side-swept bangs':'long side-swept bangs falling diagonally across the forehead from a side part, blending into long layered hair',
 'Long hair with blunt bangs':'long straight hair with thick blunt bangs cut straight across at eyebrow level',
 'Voluminous blowout':'a voluminous salon blowout (براشینگ): big round-brush volume at the roots, smooth glossy lengths and bouncy curled-under ends',
 'Sleek straight keratin-smoothed hair':'long sleek straight hair after a keratin treatment: frizz-free, glass-like shine, perfectly smooth from root to tip',
 'Big soft waves':'big soft loose waves from mid-length to ends, glossy and full, polished but natural',
 'Natural curly hair':'natural defined curls, voluminous rounded shape, springy ringlets, shoulder length to below',
 'Big spiral curls':'big defined spiral curls (bouncy corkscrew ringlets) from the roots to the ends, lots of volume',
 'Messy top bun':'a messy top bun (مدل گوجه‌ای) high on the crown, loose and voluminous, with a few soft strands framing the face',
 'Low bun updo':'an elegant low bun at the nape, smooth sides, a few soft face-framing tendrils',
 'High ponytail':'a sleek high ponytail at the crown, smooth pulled-back sides, long flowing tail'
};
// Persian colour names from the colour box, described precisely for the model.
export const COLOR_EN={
 'مشکی':'natural jet black','مشکی کلاغی':'blue-black raven','مشکی آبی':'blue-black with a cool blue sheen',
 'قهوه‌ای تیره':'dark brown','قهوه‌ای متوسط':'medium brown','قهوه‌ای روشن':'light brown',
 'شکلاتی':'rich chocolate brown','شکلاتی تلخ':'deep dark-chocolate brown','شکلاتی گرم':'warm chocolate brown',
 'موکا':'mocha brown','نسکافه‌ای':'warm coffee-with-milk brown','فندقی':'hazelnut brown','قهوه‌ای دودی':'smoky ash brown','قهوه‌ای سرد':'cool ash brown',
 'کاراملی':'caramel','عسلی':'honey brown','عسلی طلایی':'golden honey','بلوند عسلی':'honey blonde','بلوند کاراملی':'caramel blonde',
 'بلوند طلایی':'golden blonde','بلوند شامپاینی':'champagne blonde','بلوند بژ':'beige blonde','بلوند روشن':'light blonde','بلوند خیلی روشن':'very light blonde',
 'بلوند تیره':'dark blonde','بلوند دودی':'smoky ash blonde','بلوند خاکستری':'ash blonde','بلوند نقره‌ای':'silver blonde','بلوند یخی':'icy blonde',
 'پلاتینه':'platinum blonde','بلوند توت‌فرنگی':'strawberry blonde','بلوند رزگلد':'rose-gold blonde',
 'مسی':'copper','مسی روشن':'light copper','قرمز مسی':'copper red','حنایی':'henna red-orange','دارچینی':'cinnamon auburn','ماهاگونی':'mahogany',
 'قرمز آتشین':'vivid fire red','شرابی':'burgundy wine red','آلبالویی':'black-cherry red','زرشکی':'deep crimson','یاقوتی':'ruby red','بادمجانی':'aubergine plum',
 'بنفش':'purple','یاسی':'pastel lilac','رزگلد':'rose gold','صورتی پاستلی':'pastel pink','آبی دودی':'smoky blue','آبی نفتی':'deep petrol blue',
 'نقره‌ای':'silver','خاکستری':'grey','سفید یخی':'icy white',
 'بالیاژ عسلی':'hand-painted honey balayage on a darker brown base, soft blended root','بالیاژ کاراملی':'caramel balayage on a brown base, soft root',
 'بالیاژ شامپاینی':'champagne-blonde balayage on a brown base, soft root','بالیاژ سرد':'cool ash balayage on a dark base, soft root','بالیاژ مسی':'copper balayage on a brown base',
 'آمبره قهوه‌ای به بلوند':'ombre from brown roots to blonde ends','آمبره شرابی':'ombre from dark roots to burgundy ends','آمبره دودی':'ombre from dark roots to smoky ash ends',
 'سامبره':'subtle sombre, gentle brown-to-honey fade','هایلایت طلایی':'fine golden highlights through brown hair','هایلایت نقره‌ای':'fine silver highlights',
 'لایت عسلی':'honey babylights','دودی زیتونی':'smoky olive brown (muted ash-olive brown)','زیتونی':'olive brown','شکلاتی دودی':'smoky ash-chocolate brown','نسکافه‌ای دودی':'smoky coffee-with-milk brown','مش دودی':'smoky ash highlights on a brown base','مش عسلی':'honey highlights on a brown base','بالیاژ دودی':'smoky ash balayage on a dark base, soft root','لایت دودی':'smoky ash babylights','بیبی لایت':'very fine natural babylights'
};
const norm=s=>String(s||'').replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/[‌\s]/g,'');
export function colorText(color){
 if(!color)return '';
 const exact=Object.keys(COLOR_EN).find(k=>norm(k)===norm(color));
 return exact?COLOR_EN[exact]+' (requested in Persian as "'+color+'")':'"'+color+'" (a Persian hair-color name; render it as a salon colorist would interpret it)';
}
export function transferPrompt(mode,style,color){
 const lock='Professional hair-salon consultation preview. Photo 1 is the client. Edit ONLY her hair.\n'+
  'IDENTITY LOCK: keep her exact face and facial features, skin tone and texture, makeup, age, expression, head angle, ears, neck, clothing, jewelry, background, framing and lighting unchanged. It must be clearly the same person in the same photo: do not redraw, regenerate or reshape her face; keep every facial feature exactly as in photo 1. Do not beautify, retouch, slim or swap the face.\n'+
  'If she wears a headscarf or hat, keep it exactly as it is and change only the hair that is visible.\n';
 const realism='\nREALISM: real hair density and individual strand detail, a natural hairline and parting that fit her head shape and face, believable volume and fall under gravity, light and shadow matching the original photo\'s light direction and color temperature, soft natural shadows where hair meets skin and clothing. Seamless edges, no halo, no wig look, no painted or plastic texture.\n'+
  'OUTPUT: one photorealistic photo with the same composition and aspect ratio as Photo 1, high detail. No text, watermark, border, collage or before/after split.';
 const ref='Photo 2 is ONLY a hair reference and shows a DIFFERENT woman: never use her face, facial features, eyes, nose, lips, brows, skin, makeup, age, expression, body, clothing or background. The face in the result must stay exactly the face of photo 1. Photo 2 may carry an overlaid caption, label, frame, logo or watermark: ignore it and never copy any text, banner or frame into the result.\n';
 const tint=color?'\nHAIR COLOR: '+colorText(color)+'. This overrides any hair color in photo 2.':'';
 if(mode==='style')return lock+ref+'HAIR: copy ONLY the haircut, length, layers, texture and styling from photo 2.'+(color?tint:'\nHAIR COLOR: ignore the hair colour of photo 2 completely. Keep her exact hair colour from photo 1: the same shade, roots, highlights and tone, unchanged.')+realism;
 if(mode==='color')return lock+ref+'HAIR: copy ONLY the hair color, tones, roots, highlights and color placement from photo 2. Keep her exact haircut, length, part and styling from photo 1.'+tint+realism;
 if(mode==='both')return lock+ref+'HAIR: transfer the hairstyle AND hair color from photo 2, adapted naturally to her head and face. Never take the face from photo 2.'+tint+realism;
 // A catalog name maps to its description; a salon work arrives already as a description.
 const detail=STYLE_DETAILS[style]?STYLE_DETAILS[style]+' ('+style+')':style;
 return lock+'HAIR: give her '+detail+'. Change only the cut, length, shape and styling of her hair.'+(color?'\nHAIR COLOR: '+colorText(color)+'.':'\nHAIR COLOR: keep her exact hair colour from photo 1: the same shade, roots, highlights and tone, unchanged.')+realism;
}
export const uid=()=>crypto.randomUUID();
export const token=()=>{let a=crypto.getRandomValues(new Uint8Array(32));return Array.from(a,x=>x.toString(16).padStart(2,'0')).join('');};
export const hash=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),x=>x.toString(16).padStart(2,'0')).join('');
export const formatTime=ms=>new Intl.DateTimeFormat('fa-IR',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Tehran'}).format(ms);
// Rolling 24-hour counter kept in D1 `limits`; throws 429 once `key` has been hit more than `max` times.
export async function limited(db,key,max,message='سقف استفادهٔ روزانه پر شده است'){const n=Date.now(),k=await hash(key);await db.prepare('INSERT INTO limits(key,count,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires_at<? THEN 1 ELSE count+1 END,expires_at=CASE WHEN expires_at<? THEN excluded.expires_at ELSE expires_at END').bind(k,n+86400000,n,n).run();const row=await db.prepare('SELECT count FROM limits WHERE key=?').bind(k).first();must(row.count<=max,message,429);}
