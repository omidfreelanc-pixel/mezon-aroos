// Wedding-dress catalog and prompts. Catalog entries: [Persian name, English name, filter tag, English description].
// Every detail that defines the dress is spelled out so a text-only try-on and the lookbook photo agree.
export const LINE_KEYS=['dress'];
export const DEFAULT_LINE='dress';
export const LINE_LABEL={dress:'لباس عروس'};
export const DRESS_STYLES=[
 ['آ‌لاین ساده','Simple A-line','ساده','a simple A-line wedding gown in smooth ivory crepe: a fitted bodice with a modest V neckline, thin straps, a clean waist seam and a skirt that flares gently from the waist to the floor, no lace, no beading, no train'],
 ['پرنسسی پفی','Ball gown','پفی','a princess ball-gown wedding dress in ivory: a fitted strapless sweetheart bodice and a very full, voluminous multi-layer tulle skirt that falls to the floor, with a short sweep train, no beading'],
 ['ماهی (مرمید)','Mermaid','ماهی','a mermaid wedding dress in ivory satin: a body-hugging bodice and skirt fitted through the hips and thighs, flaring out into a fishtail from the knees to the floor, sweetheart neckline, no lace'],
 ['فیت‌اند‌فلر','Trumpet','ماهی','a trumpet (fit-and-flare) wedding dress in ivory crepe: fitted through the bodice and hips, flaring gently from mid-thigh to the floor, V neckline, thin straps, no embellishment'],
 ['ساده و ستونی','Sheath column','ساده','a sleek column (sheath) wedding dress in ivory satin: a straight body-skimming silhouette from shoulders to floor, a high square neckline, no waist seam, no embellishment, minimal and modern'],
 ['پوشیده آستین‌دار با دانتل','Modest long-sleeve lace','پوشیده','a modest long-sleeve wedding dress: ivory floral lace covering the high neckline, the full arms to the wrists and the bodice, over an opaque lining, with a smooth A-line skirt to the floor'],
 ['یقه هفت تور','V-neck tulle','ساده','an ivory A-line wedding dress with a deep V neckline, a soft tulle bodice with fine lace edges, a fitted waist and a soft layered tulle skirt to the floor'],
 ['یقه دلبری','Sweetheart','پفی','an ivory wedding dress with a structured sweetheart neckline, a corset-style boned bodice and an A-line satin skirt to the floor with a small train'],
 ['آف‌شولدر','Off-the-shoulder','ساده','an ivory off-the-shoulder wedding dress: a soft draped neckline sitting below the shoulders with short sleeves, a fitted bodice and a flowing A-line crepe skirt to the floor'],
 ['دانتل بوهو','Boho lace','دانتل','a bohemian ivory lace wedding dress: sheer lace sleeves, a plunging V neckline, an all-over floral lace bodice and a soft flowing lace-edged skirt to the floor'],
 ['ساتن مینیمال','Minimal satin','ساده','a minimal ivory satin wedding dress: a clean asymmetric one-shoulder neckline, a smooth fitted bodice and a fluid satin skirt to the floor with a small train, no embellishment'],
 ['دنباله‌دار کلاسیک','Cathedral train','دنباله‌دار','a classic ivory wedding dress with a long cathedral train: a fitted lace bodice with a bateau neckline and long sheer sleeves, a full skirt and a very long train spread out behind her on the floor'],
 ['سنگ‌دوزی و کریستال','Crystal beaded','سنگ‌دوزی','an ivory wedding dress heavily hand-beaded with crystals and pearls on the bodice and the upper skirt, fitted bodice with a sweetheart neckline, a flared skirt to the floor, sparkling'],
 ['تور چندلایه','Layered tulle','پفی','an ivory wedding dress with a fitted strapless bodice and a skirt of many soft layered tulle ruffles, a dreamy volume from the waist to the floor, no beading'],
 ['هالتر','Halter','ساده','an ivory halter-neck wedding dress: a high halter neckline with bare shoulders and back, a fitted bodice and a smooth A-line crepe skirt to the floor']
];
export const DRESS_SHOTS=DRESS_STYLES.map(d=>d[3]);
export const LINE_FILTERS={dress:['همه','ساده','پفی','ماهی','پوشیده','دانتل','دنباله‌دار','سنگ‌دوزی']};
export const lineStyles=line=>line==='dress'?DRESS_STYLES:null;

// Boutique and Instagram photos often carry a caption banner or watermark; it must never reach the result.
const NOTEXT=' Photo 2 shows a DIFFERENT person: never use her face, facial features, skin, makeup or body; the result keeps the person of photo 1 exactly. Photo 2 may carry an overlaid caption, label, frame, logo or watermark: ignore it and never copy any text, banner or frame into the result.';
const DRESS_OUT='\nOUTPUT: one photorealistic full-body photo with the same composition, framing and aspect ratio as Photo 1, high detail. The whole figure stays in the frame. No text, watermark, border, collage or before/after split.';
const DRESS_BODY='BODY LOCK (the most important rule): keep her EXACT body: height, body proportions, shoulder width, bust, waist, hips, thighs, arm and leg length, posture and pose, exactly as in photo 1. Never slim, enlarge, lengthen, reshape, smooth or idealise her body. The dress is fitted to HER body size and shape, never to a model\'s: if the dress is cut for a slimmer or fuller figure it still takes her real measurements, so her real silhouette shows through it.\n'+
 'IDENTITY LOCK: keep her exact face, facial features, skin tone and texture, age, expression, hair and hairstyle, headscarf if she wears one, hands, nails, jewellery, and the background, floor and lighting of photo 1 unchanged: the wall and floor colour, brightness and white balance stay exactly as in photo 1, never darken, grey or restyle the background. Do not beautify, retouch or redraw her face. It must clearly be the same woman with the same body in the same photo.';
export function dressPrompt(mode,style){
 const what=mode==='reference'
  ?'Photo 2 shows a wedding dress, possibly worn by a DIFFERENT person or displayed on a mannequin: take ONLY the dress from it and never her face, hair, skin, body, pose, shoes, jewellery or background.'+NOTEXT+'\nDRESS: dress her in the exact dress of photo 2: the same neckline, straps and sleeves, bodice, waist seam, skirt shape and volume, length, train, fabric, lace, beading, embroidery and colour, copied faithfully with every detail. Do not simplify it or change its design.'
  :'DRESS: '+style+'.';
 return 'Professional bridal boutique virtual fitting. Photo 1 is the bride in a full-body photo. Replace ONLY her current clothing with the wedding dress; nothing else changes.\n'+
  DRESS_BODY+'\n'+what+
  '\nFIT: the dress follows her real body: it sits on her real shoulders, bust, waist and hips, MODESTY: if she wears a headscarf or covered clothing in photo 1, keep her at least as covered: give the dress matching sheer long sleeves and a high illusion neckline in the same fabric, never exposing shoulders, arms, back or chest that photo 1 does not show. The skirt starts at her real waist and falls to the floor in front of her real legs and feet. Floor-length hems reach the floor and hide or touch her shoes; a train lies on the floor behind her. If a dress has sleeves or straps they sit on her real arms. Natural fabric folds, weight and drape, shadows matching the photo\'s light direction and colour temperature, correct perspective, clean seamless edges around her neck, arms and hands, no halo or pasted look.'+DRESS_OUT;
}
export const linePrompt=(line,mode,style)=>line==='dress'?dressPrompt(mode,style):'';

// Photo guidance for the customer page (step 1) and the catalog generator.
export const LINE_PHOTO={
 dress:{head:'اول، عکس تمام‌قدت',sub:'یک عکس ایستاده از سر تا پا، روبه‌رو. لباس عروس روی همین عکس و همین اندام امتحان می‌شود.',drop:'عکس تمام‌قدت را اینجا بگذار',ready:'اگر از سر تا پایت کامل و روشن دیده می‌شوی، برو سراغ انتخاب لباس.',tips:[['user','ایستاده، سر تا پا. ','کل بدنت از سر تا کفش در قاب باشد، دست‌ها کنار بدن.'],['sun','نور روز. ','پشت‌به‌پنجره نه؛ رو به نور و بدون فلاش.'],['spark','لباس ساده و اندازه. ','لباس چسبان یا ساده بپوش تا اندامت واقعی دیده شود. لباس گشاد اندازه را مخفی می‌کند.']],ref:'فقط لباس این عکس استفاده می‌شود؛ مدل و بدنش نه.',noun:'لباس',demo:'یک نمونهٔ قبل و بعد. با عکس تمام‌قد خودت، لباس را روی اندام خودت می‌بینی و بعد برای مزون می‌فرستی.'},
};
