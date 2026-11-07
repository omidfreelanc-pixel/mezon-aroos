// Service lines: hairstyle (مدل مو), hair colour (رنگ مو), nails (ناخن) and lashes (مژه). Each line
// has a catalog of looks (names Iranian salons use), photo guidance and its own image prompt; nails
// and lashes also have options (shape and length, mapping and length) and a colour list. Hairstyle
// keeps its catalog in legacy.js and its prompt in domain.js (transferPrompt, style only); hair
// colour keeps the haircut and changes only the colour (colorPrompt below).
// Catalog entries: [Persian name, English name, filter tag, English description for the model].
// Option and colour entries: [Persian name, English for the model] (+ swatch for colours).

import {colorText} from './domain.js';

export const LINE_KEYS=['dress'];
export const DEFAULT_LINE='dress';
export const LINE_LABEL={dress:'لباس عروس'};
// Lines tried on a face photo: one photo serves all three.
export const FACE_LINES=[];

// Hair colours Iranian salons are asked for most (1405 trends: smoky olive, coffee-with-milk,
// espresso, cherry cola, butter blonde, honey balayage, babylights) with the classics.
export const COLOR_STYLES=[
 ['مشکی کلاغی','Raven black','تیره','raven black: hair that is clearly BLACK, the deepest jet black, very glossy, with only a faint cool blue-black reflection in the brightest highlights; it must read as black, never navy or blue'],
 ['قهوه‌ای اسپرسو','Espresso brown','تیره','espresso brown: a very dark, rich brown that looks almost black in shadow and warm dark brown in the light, one even colour'],
 ['شکلاتی','Chocolate brown','قهوه‌ای','rich chocolate brown: a deep warm medium-dark brown, one even glossy colour'],
 ['نسکافه‌ای','Coffee-with-milk brown','قهوه‌ای','coffee-with-milk brown (نسکافه‌ای): a soft warm light-medium brown like milky coffee, one even colour'],
 ['دودی زیتونی','Smoky olive brown','قهوه‌ای','smoky olive brown (دودی زیتونی): a medium-dark BROWN that is cool and muted, with a smoky ash veil and only a subtle olive undertone and no red, orange or gold; it must clearly read as brown hair, never green or grey, one even colour'],
 ['فندقی','Hazelnut brown','قهوه‌ای','hazelnut brown: a medium golden-warm brown, one even colour'],
 ['کاراملی','Caramel','قهوه‌ای','caramel: a warm light golden brown, one even colour'],
 ['عسلی','Honey brown','روشن و بلوند','honey brown: a warm golden light brown that glows amber in the light, one even colour'],
 ['بلوند شامپاینی','Champagne blonde','روشن و بلوند','champagne blonde: a soft pale beige-gold blonde, neither yellow nor ashy, one even colour'],
 ['بلوند کره‌ای','Butter blonde','روشن و بلوند','butter blonde: a soft creamy warm golden blonde with a buttery glow, one even colour'],
 ['بلوند یخی (پلاتینه)','Icy platinum blonde','روشن و بلوند','icy platinum blonde: a very pale, cool, almost white blonde with no yellow at all, one even colour'],
 ['مسی','Copper','قرمز و مسی','copper: a bright warm copper-orange red, one even glossy colour'],
 ['شرابی','Burgundy','قرمز و مسی','burgundy wine red: a deep red-violet wine colour, one even glossy colour'],
 ['آلبالویی (چری کولا)','Cherry cola','قرمز و مسی','cherry cola: a dark brown-black base with a deep cherry-red glow that shows clearly in the light, one even colour'],
 ['بالیاژ عسلی','Honey balayage','بالیاژ و مش','hand-painted honey-blonde balayage on a dark brown base: the roots and top stay dark brown, soft honey ribbons start around cheek level and get lighter toward the ends, blended with no hard lines'],
 ['بالیاژ کاراملی','Caramel balayage','بالیاژ و مش','hand-painted caramel balayage on a dark brown base: dark roots, soft caramel ribbons from mid-length to the ends, seamlessly blended'],
 ['مش دودی','Smoky ash highlights','بالیاژ و مش','smoky ash highlights: many fine cool ash-grey-beige streaks woven evenly through medium-brown hair from the roots to the ends'],
 ['آمبره قهوه‌ای به بلوند','Brown-to-blonde ombré','بالیاژ و مش','ombré: dark brown from the roots to about chin level, then a smooth gradual fade to light golden blonde ends'],
 ['بیبی لایت','Babylights','بالیاژ و مش','babylights: very fine, delicate, soft golden-blonde highlights spread evenly through light-brown hair, sun-kissed and natural'],
 ['رزگلد','Rose gold','فانتزی','rose gold: a soft metallic pinkish-peach blonde, one even colour'],
 ['یاسی پاستلی','Pastel lilac','فانتزی','pastel lilac: a soft light lavender-purple, one even pastel colour']
];
// Card swatch for each colour (shown until its photo loads): one hex, or "root,ends" for balayage.
export const COLOR_SWATCHES=['#0f1420','#2a1b14','#4b2b1c','#8d6646','#6b6450','#8b5a2b','#a86c34','#b8803a','#e2cfa5','#e7cf8f','#ece8dc','#b5602f','#6b1f2e','#4a1a22','#3b2518,#c8913f','#4b2b1c,#b9864f','#5e4a3e,#b6aa96','#3b2518,#ddc28c','#8b5a2b,#ddc28c','#c98c7a','#b8a1d6'];
// Lookbook photo of each colour: the same long soft-waved cut seen from behind, so only the colour changes.
export const COLOR_SHOTS=COLOR_STYLES.map(c=>c[3]);

export const NAIL_STYLES=[
 ['ژلیش ساده یکدست','Solid gel polish','ساده','a flawless glossy one-colour gel polish manicure with even coverage and clean cuticles'],
 ['فرنچ کلاسیک','Classic French','فرنچ','a classic French manicure: sheer natural pink base with crisp white tips following the smile line'],
 ['میکرو فرنچ','Micro French','فرنچ','a micro French manicure: a very thin delicate tip line on a sheer nude base'],
 ['فرنچ رنگی','Coloured French','فرنچ','a modern French manicure with coloured tips on a sheer nude base'],
 ['بیبی بومر','Baby boomer ombré','ساده','baby boomer ombré nails: a soft seamless fade from nude pink at the base to milky white at the tip'],
 ['نود روسی','Russian nude manicure','ساده','a clean Russian manicure with a natural nude-pink gel finish, very neat cuticles and a healthy natural look'],
 ['کروم آینه‌ای','Chrome mirror','براق','mirror chrome nails with a high-shine metallic reflective finish'],
 ['مرواریدی (گلیزد)','Glazed pearl','براق','glazed-donut pearl nails: a sheer milky base with a soft pearlescent shimmer'],
 ['کت‌آی (چشم گربه‌ای)','Magnetic cat eye','براق','magnetic cat-eye gel nails with a glowing shifting band of light across each nail'],
 ['ژله‌ای','Jelly nails','براق','translucent jelly nails: glossy see-through tinted colour like stained glass'],
 ['مات','Matte','ساده','matte nails with a velvety non-shiny surface'],
 ['اکلیلی','Glitter','نگین','sparkling fine-glitter nails with an even shimmer'],
 ['مرمری','Marble','طرح‌دار','marble nail art with soft natural veins on a light base'],
 ['مینیمال گل و خط','Minimal art','طرح‌دار','minimal nail art: tiny hand-painted flowers, dots and thin lines on a nude base, on a few accent nails'],
 ['هندسی و خطی','Geometric lines','طرح‌دار','geometric nail art with clean thin lines and small colour blocks'],
 ['نگین و سنگ','Rhinestones','نگین','elegant nails with small rhinestones and crystals placed near the cuticle on a few accent nails'],
 ['آئورا (هاله‌ای)','Aura nails','طرح‌دار','aura nails: a soft airbrushed glow of colour in the centre of each nail fading outwards'],
 ['ابری (اسموکی)','Smoky clouds','طرح‌دار','smoky nail art with soft cloudy swirls of colour']
];
export const LASH_STYLES=[
 ['کلاسیک (یک‌به‌یک)','Classic','طبیعی','classic eyelash extensions: one extension on each natural lash, a natural defined look like perfect mascara'],
 ['هیبریدی','Hybrid','طبیعی','hybrid eyelash extensions mixing classic lashes and light volume fans: a soft, textured, fuller look'],
 ['والیوم (روسی)','Volume','پرحجم','volume (Russian) eyelash extensions: soft fluffy fans and a full dense lash line'],
 ['مگاوالیوم','Mega volume','پرحجم','mega volume eyelash extensions: a very dense, dark, dramatic lash line'],
 ['وت لش (خیس)','Wet look','پرحجم','wet-look eyelash extensions: glossy, spiky closed fans that look like wet lashes'],
 ['کیم (ویسپی)','Wispy (Kim)','پرحجم','wispy "Kim K" eyelash extensions: longer textured spikes mixed through a fluffy base'],
 ['اسپایکی (انیمه)','Spiky anime','پرحجم','anime-style eyelash extensions with defined, separated spikes and a doll-like look'],
 ['لیفت و لمینت','Lash lift and tint','بدون کاشت','a lash lift and tint on her own natural lashes: curled up from the root, darker and more visible, no extensions'],
 ['رگهٔ رنگی','Colour accents','پرحجم','black volume lashes with a few subtle coloured strands near the outer corners']
];
// Lookbook photo of each catalog entry (scripts/generate-catalog.mjs). Every detail that defines the
// look is spelled out (colour, finish, shape, length, placement) and everything else is excluded, so
// the photo shows exactly the named style and nothing a customer could confuse it with.
export const NAIL_SHOTS=[
 'a solid one-colour gel manicure: every nail painted in the same single glossy classic cherry red, smooth even coverage, NO French tips, NO nail art, NO glitter, NO gems; medium-length almond nails',
 'a classic French manicure on every nail: sheer pale natural pink base and a crisp opaque bright white tip of even width with a clean curved smile line; no other colour, no art, no glitter; medium-length squoval nails',
 'a micro French manicure on every nail: sheer nude-pink base and an ultra-thin white line about 1 mm wide only along the very edge of the tip; no other art; short natural rounded nails',
 'a coloured French manicure: sheer nude base on every nail and pastel tips in different soft colours (lilac, mint green, baby blue, peach, pink) with a clean curved smile line; no other art; medium-length almond nails',
 'baby boomer ombré on every nail: a seamless vertical fade from soft nude pink at the cuticle to milky white at the tip with no visible line between them; no art; medium-length almond nails',
 'a Russian manicure: very neat clean cuticle area and every nail coated in one sheer natural nude-pink gel that looks like perfect healthy bare nails, glossy; no colour, no art; short soft-square nails',
 'silver mirror chrome on every nail: a solid, highly reflective metallic silver finish that looks like a mirror with bright reflections; no other colour or art; medium-length almond nails',
 'glazed pearl nails: every nail a milky white translucent base with an iridescent pearly chrome sheen, like a glazed doughnut; no art; short-medium rounded almond nails',
 'magnetic cat-eye gel nails: every nail deep burgundy with a bright diagonal shimmering band of light across the middle of the nail, like a cat\'s eye gemstone; no other art; medium-length almond nails',
 'jelly nails: every nail a translucent see-through glossy soft-pink tinted gel, the nail tip visible through the colour like stained glass; no art; medium-length oval nails',
 'matte nails: every nail one solid dusty-rose colour with a completely flat, velvety, non-shiny matte finish and no gloss or reflections at all; no art; medium-length squoval nails',
 'full glitter nails: every nail densely and evenly covered in fine sparkling champagne-gold glitter from cuticle to tip; no other art; medium-length almond nails',
 'white marble nail art: every nail a glossy white base with thin soft grey marble veins and a few fine gold vein lines, like Carrara marble; medium-length almond nails',
 'minimal nail art: all nails a sheer nude base; the ring-finger and middle-finger nails each carry one tiny white hand-painted daisy and two small dots; the other nails are plain nude with one thin white diagonal line; medium-length oval nails',
 'geometric nail art: all nails a nude base with thin crisp black lines forming triangles and stripes, plus small solid blocks of black and white; clean graphic design; medium-length square nails',
 'rhinestone nails: every nail a glossy nude-pink gel with a neat row of small clear rhinestones along the cuticle; the ring-finger nail also has a small cluster of larger crystals; medium-length almond nails',
 'aura nails: every nail a soft nude base with a blurred, airbrushed glowing circle of pink and violet in the centre that fades outwards to the edges, no hard lines; medium-length almond nails',
 'smoky cloud nails: every nail glossy with soft grey, white and charcoal swirls blended together like smoke; no other art; medium-length almond nails'
];
export const LASH_SHOTS=[
 'classic eyelash extensions: exactly one extension on each natural upper lash, about 10 mm, black; the lashes are clearly separated so individual lashes can be counted, with small even gaps between them; natural and light, like perfect mascara, NOT dense, NO fans',
 'hybrid eyelash extensions: a visible mix of single separated lashes and small soft fans of 2–3 fine lashes; medium density with texture and a few small gaps, clearly fuller than classic but lighter than volume, about 11 mm',
 'Russian volume eyelash extensions: soft fluffy fans of many very fine lashes forming a full, dense, dark lash line with no gaps at all, about 11–12 mm, soft even C curl, uniform smooth edge',
 'mega volume eyelash extensions: an extremely dense, very dark, thick lash line that looks like a black eyeliner band at the base, about 13–14 mm, heavy and dramatic',
 'wet-look eyelash extensions: shiny lashes grouped into closed, pointed, glossy spikes as if wet, the spikes clearly separated with small gaps between them, about 11 mm',
 'wispy "Kim K" eyelash extensions: a soft fluffy base of medium lashes with distinctly longer, thicker spikes standing out every few millimetres along the lash line, giving an uneven, textured, spiky top edge',
 'anime-style eyelash extensions: thick, separated, triangular spikes with clear gaps between them along the upper lashes, plus a few small spikes on the lower lash line, doll-like',
 'a lash lift and tint on her own short natural lashes only: her real lashes curled sharply straight up from the root and tinted dark black, natural short length, sparse as real lashes are, absolutely NO extensions and NO false lashes',
 'black volume eyelash extensions with several bright violet and blue coloured strands mixed in, mostly at the outer corners, clearly visible colour'
];

// Extra choices shown as chips under the catalog. Index 0 of each list is never forced: no pick
// means "what suits her" in the prompt.
export const LINE_OPTIONS={
 nails:[
  {key:'shape',label:'فرم ناخن',items:[['مربعی','square: straight parallel sidewalls and a perfectly flat, straight-across free edge with crisp corners'],['مربع‌بیضی','squoval: straight sidewalls and a straight free edge with softly rounded corners'],['گرد','round: the free edge follows a gentle semicircle that mirrors the fingertip'],['بیضی','oval: sidewalls taper slightly into a smooth egg-shaped curved tip'],['بادامی','almond: slim sidewalls tapering to a soft rounded point, like an almond'],['تابوتی (بالرین)','coffin / ballerina: sidewalls taper toward the tip, which is cut flat and straight across'],['استیلتو','stiletto: sidewalls taper sharply to a single fine point']]},
  {key:'length',label:'طول',items:[['کوتاه','short: the free edge extends only about 1–2 mm past the fingertip'],['متوسط','medium: the free edge extends about 4–6 mm past the fingertip (roughly a third of the nail-bed length), clearly not long'],['بلند','long extensions: the free edge is longer than half the nail-bed length']]}
 ],
 lashes:[
  {key:'map',label:'حالت',items:[['طبیعی','natural: even length across the eye'],['گربه‌ای','cat eye: longer toward the outer corners, lifted and elongated'],['عروسکی','doll eye: longest at the centre, opening the eye round'],['سنجابی','squirrel: peak length a little before the outer corner, lifted'],['روباهی','fox eye: dramatic upswept outer corners']]},
  {key:'length',label:'طول',items:[['کوتاه','short and subtle (about 8–10 mm)'],['متوسط','medium (about 10–12 mm)'],['بلند','long (about 12–15 mm)']]}
 ]
};
// Wedding dresses (Ayneh Mezon). Catalog entries: [Persian name, English name, filter tag, English description].
// Every detail that defines the dress is spelled out so a text-only try-on and the lookbook photo agree.
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
export const LINE_COLORS={
 nails:[['نود','#d9b8a3','nude beige'],['صورتی ملایم','#efc3c8','soft baby pink'],['صورتی نود','#e2b2a8','nude pink'],['شیری','#f2ece2','milky white'],['سفید','#fafafa','pure white'],['قرمز','#c0182b','classic red'],['قرمز آلبالویی','#8e1b2c','cherry red'],['زرشکی','#6d1a2a','deep burgundy'],['شرابی','#5a1730','wine red'],['مشکی','#141414','black'],['قهوه‌ای شکلاتی','#4a2a1c','chocolate brown'],['کرم کاراملی','#c08a5b','caramel'],['مرجانی','#f07a62','coral'],['هلویی','#f4b49a','peach'],['یاسی','#b9a3d6','lilac'],['بنفش','#5b3a78','purple'],['آبی نفتی','#1f3a54','navy blue'],['آبی آسمانی','#9cc6e8','baby blue'],['سبز زیتونی','#6b6a3f','olive green'],['سبز یشمی','#3c7a64','jade green'],['نقره‌ای','#c4c4c2','silver'],['طلایی','#c9a14a','gold'],['رزگلد','#c98c7a','rose gold'],['خاکستری','#8d8d8d','grey']],
 lashes:[['مشکی','#111111','jet black'],['مشکی قهوه‌ای','#2a1d16','soft brown-black'],['قهوه‌ای','#4a2e1e','brown'],['رگه قهوه‌ای','#111111,#7a5233','black with a few brown accents'],['رگه رنگی','#111111,#8a5bd0','black with a few coloured accents']]
};
export const LINE_POPULAR={nails:['نود','صورتی ملایم','شیری','قرمز','زرشکی','کرم کاراملی','مشکی','یاسی'],lashes:['مشکی','مشکی قهوه‌ای','قهوه‌ای','رگه رنگی']};
export const LINE_FILTERS={dress:['همه','ساده','پفی','ماهی','پوشیده','دانتل','دنباله‌دار','سنگ‌دوزی'],color:['همه','تیره','قهوه‌ای','روشن و بلوند','قرمز و مسی','بالیاژ و مش','فانتزی'],nails:['همه','ساده','فرنچ','براق','طرح‌دار','نگین'],lashes:['همه','طبیعی','پرحجم','بدون کاشت']};
export const lineStyles=line=>line==='dress'?DRESS_STYLES:line==='nails'?NAIL_STYLES:line==='lashes'?LASH_STYLES:line==='color'?COLOR_STYLES:null;

const norm=s=>String(s||'').replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/[‌\s]/g,'');
function colourEn(line,color){
 if(!color)return '';
 const hit=(LINE_COLORS[line]||[]).find(c=>norm(c[0])===norm(color));
 return hit?hit[2]+' (requested in Persian as "'+color+'")':'"'+color+'" (a Persian colour name; render it as a salon artist would)';
}
const optEn=(line,key,i)=>{const o=(LINE_OPTIONS[line]||[]).find(x=>x.key===key);return Number.isInteger(i)&&o?.items[i]?o.items[i][1]:''};
// Validated option indexes for a line, from the client's {key:index} object.
export function cleanOptions(line,opts){
 const out={};for(const o of LINE_OPTIONS[line]||[]){const i=Number(opts?.[o.key]);if(Number.isInteger(i)&&i>=0&&i<o.items.length)out[o.key]=i}
 return out;
}
export function optionText(line,opts){return (LINE_OPTIONS[line]||[]).map(o=>Number.isInteger(opts?.[o.key])?o.items[opts[o.key]][0]:'').filter(Boolean).join('، ')}

// Salon and Instagram photos often carry a caption banner or watermark; it must never reach the result.
const NOTEXT=' Photo 2 shows a DIFFERENT person: never use her face, facial features, skin, makeup or body; the result keeps the person of photo 1 exactly. Photo 2 may carry an overlaid caption, label, frame, logo or watermark: ignore it and never copy any text, banner or frame into the result.';
const OUT='\nOUTPUT: one photorealistic photo with the same composition and aspect ratio as Photo 1, high detail. No text, watermark, border, collage or before/after split.';
// mode: 'catalog' (style = English description) or 'reference' (photo 2 is the design reference).
// Hair colour: 'catalog' (style = description), 'reference' (copy the colour of photo 2) or
// 'text' (only the colour the customer typed). The haircut of photo 1 never changes.
export function colorPrompt(mode,style,color){
 const what=mode==='reference'?'Photo 2 is ONLY a hair-colour reference: ignore its face, skin, haircut, clothing and background completely.'+NOTEXT+'\nHAIR COLOR: copy ONLY the hair colour, tones, roots, highlights and colour placement from photo 2 onto her hair.'
  :mode==='text'?'HAIR COLOR: '+colorText(color)+'.':'HAIR COLOR: '+style+'.';
 return 'Professional hair-colour consultation preview. Photo 1 is the client. Change ONLY the colour of her hair.\n'+
  'IDENTITY LOCK: keep her exact face and facial features, skin tone and texture, makeup, age, expression, head angle, ears, neck, clothing, jewelry, background, framing and lighting unchanged. It must be clearly the same person in the same photo. Do not beautify, retouch, slim, redraw or swap the face; every facial feature stays exactly as in photo 1.\n'+
  'HAIRCUT LOCK: keep her exact haircut, length, layers, parting, volume, texture and styling from photo 1, strand for strand. Do not cut, lengthen, curl, straighten or restyle her hair. If she wears a headscarf or hat, keep it exactly as it is and recolour only the hair that is visible.\n'+
  what+
  '\nREALISM: salon-quality colour with natural dimension, believable roots and shine, the colour following every strand and wave, light and shadow matching the original photo\'s light direction and colour temperature. Keep brows and lashes their natural colour. Seamless edges, no halo, no wig look, no painted or plastic texture.'+OUT;
}
const DRESS_OUT='\nOUTPUT: one photorealistic full-body photo with the same composition, framing and aspect ratio as Photo 1, high detail. The whole figure stays in the frame. No text, watermark, border, collage or before/after split.';
const DRESS_BODY='BODY LOCK (the most important rule): keep her EXACT body: height, body proportions, shoulder width, bust, waist, hips, thighs, arm and leg length, posture and pose, exactly as in photo 1. Never slim, enlarge, lengthen, reshape, smooth or idealise her body. The dress is fitted to HER body size and shape, never to a model\'s: if the dress is cut for a slimmer or fuller figure it still takes her real measurements, so her real silhouette shows through it.\n'+
 'IDENTITY LOCK: keep her exact face, facial features, skin tone and texture, age, expression, hair and hairstyle, headscarf if she wears one, hands, nails, jewellery, and the background, floor and lighting of photo 1 unchanged. Do not beautify, retouch or redraw her face. It must clearly be the same woman with the same body in the same photo.';
export function dressPrompt(mode,style){
 const what=mode==='reference'
  ?'Photo 2 shows a wedding dress, possibly worn by a DIFFERENT person or displayed on a mannequin: take ONLY the dress from it and never her face, hair, skin, body, pose, shoes, jewellery or background.'+NOTEXT+'\nDRESS: dress her in the exact dress of photo 2: the same neckline, straps and sleeves, bodice, waist seam, skirt shape and volume, length, train, fabric, lace, beading, embroidery and colour, copied faithfully with every detail. Do not simplify it or change its design.'
  :'DRESS: '+style+'.';
 return 'Professional bridal boutique virtual fitting. Photo 1 is the bride in a full-body photo. Replace ONLY her current clothing with the wedding dress; nothing else changes.\n'+
  DRESS_BODY+'\n'+what+
  '\nFIT: the dress follows her real body: it sits on her real shoulders, bust, waist and hips, the skirt starts at her real waist and falls to the floor in front of her real legs and feet. Floor-length hems reach the floor and hide or touch her shoes; a train lies on the floor behind her. If a dress has sleeves or straps they sit on her real arms. Natural fabric folds, weight and drape, shadows matching the photo\'s light direction and colour temperature, correct perspective, clean seamless edges around her neck, arms and hands, no halo or pasted look.'+DRESS_OUT;
}
export function linePrompt(line,mode,style,opts,color){
 if(line==='dress')return dressPrompt(mode,style);
 if(line==='color')return colorPrompt(mode,style,color);
 if(line==='nails'){
  const shape=optEn('nails','shape',opts.shape),len=optEn('nails','length',opts.length);
  return 'Professional nail-salon consultation preview. Photo 1 is the client\'s hand. Edit ONLY her fingernails.\n'+
   'IDENTITY LOCK: keep the exact hand and fingers, skin tone and texture, pose, rings and jewellery, sleeves, background, framing and lighting unchanged. Do not change finger length or shape and never add or remove fingers. Keep the cuticles and nail beds natural.\n'+
   (mode==='reference'?'Photo 2 is ONLY a nail design reference: ignore its hand, skin, jewellery and background.'+NOTEXT+'\nNAILS: copy the nail design, finish and colours from photo 2 onto all of her visible nails.':'NAILS: '+style+' on all of her visible nails.')+
   '\nNAIL SHAPE: '+(shape?shape+'. This exact shape on every nail'+(mode==='reference'?', overriding the shape in photo 2':''):(mode==='reference'?'as in photo 2, adapted to her fingers':mode==='salon'?'exactly as described in NAILS above':'keep the shape of her own nails in photo 1'))+'.'+
   '\nNAIL LENGTH: '+(len?len+'. Measure against her own fingertips in photo 1 and keep this exact length on every nail; never longer'+(mode==='reference'?', even if photo 2 shows longer nails':''):(mode==='reference'?'as in photo 2':mode==='salon'?'exactly as described in NAILS above, measured against her own fingertips':'keep her own nail length from photo 1 exactly; do not lengthen'))+'.'+
   (color?'\nNAIL COLOUR: '+colourEn('nails',color)+'.'+(mode==='reference'?' This overrides the colour in photo 2.':''):'')+
   '\nDo not add any nail art, glitter, gems or colours that are not described.'+
   '\nREALISM: real gel gloss and reflections matching the photo\'s light, each nail sitting naturally on its finger with correct perspective and curvature, clean edges along the cuticles and sidewalls, every visible nail done consistently.'+OUT;
 }
 if(line==='lashes'){
  const map=optEn('lashes','map',opts.map),len=optEn('lashes','length',opts.length);
  return 'Professional lash-studio consultation preview. Photo 1 is the client. Edit ONLY her upper eyelashes.\n'+
   'IDENTITY LOCK: keep her exact face, eye shape and size, eye colour, eyelids, brows, skin, makeup, expression, head angle, hair, headscarf, clothing, background, framing and lighting unchanged. Do not enlarge the eyes, beautify, retouch, redraw or regenerate her face; every facial feature stays exactly as in photo 1.\n'+
   (mode==='reference'?'Photo 2 is ONLY a lash reference: ignore its face, eyes, makeup and background.'+NOTEXT+'\nLASHES: copy the lash style, density, curl and mapping from photo 2 onto both of her eyes.':'LASHES: '+style+' on both eyes.')+
   (map?'\nLASH MAPPING: '+map+'.':'')+(len?'\nLASH LENGTH: '+len+'.':'')+
   (color?'\nLASH COLOUR: '+colourEn('lashes',color)+'.':'')+
   '\nKeep the lash type exactly as described; do not change her brows or add eyeliner.'+
   '\nREALISM: individual lash fibres rooted along the lash line, natural curl and spacing, correct perspective and symmetry on both eyes, soft believable shadow on the eyelid; lower lashes stay natural.'+OUT;
 }
 return '';
}

// Photo guidance per line for the customer page (step 1) and the catalog generator.
export const LINE_PHOTO={
 dress:{head:'اول، عکس تمام‌قدت',sub:'یک عکس ایستاده از سر تا پا، روبه‌رو. لباس عروس روی همین عکس و همین اندام امتحان می‌شود.',drop:'عکس تمام‌قدت را اینجا بگذار',ready:'اگر از سر تا پایت کامل و روشن دیده می‌شوی، برو سراغ انتخاب لباس.',tips:[['user','ایستاده، سر تا پا. ','کل بدنت از سر تا کفش در قاب باشد، دست‌ها کنار بدن.'],['sun','نور روز. ','پشت‌به‌پنجره نه؛ رو به نور و بدون فلاش.'],['spark','لباس ساده و اندازه. ','لباس چسبان یا ساده بپوش تا اندامت واقعی دیده شود. لباس گشاد اندازه را مخفی می‌کند.']],ref:'فقط لباس این عکس استفاده می‌شود؛ مدل و بدنش نه.',noun:'لباس',demo:'یک نمونهٔ قبل و بعد. با عکس تمام‌قد خودت، لباس را روی اندام خودت می‌بینی و بعد برای مزون می‌فرستی.'},
 hair:{head:'اول، عکس خودت',sub:'یک عکس روبه‌رو با صورت کامل. مدل انتخابی روی همین عکس امتحان می‌شود.',drop:'عکس چهره‌ات را اینجا بگذار',ready:'اگر صورتت کامل و روشن دیده می‌شود، برو سراغ انتخاب مدل.',tips:[['sun','نور روبه‌رو. ','کنار پنجره بایست، نه زیر لامپ سقف.'],['user','صورت کامل. ','بدون کلاه و عینک آفتابی، موها در قاب.'],['spark','بدون فیلتر. ','چهره و موهایت همان‌طور که هست.']],ref:'فقط مدل موی این عکس استفاده می‌شود؛ رنگ و چهره‌اش نه.',noun:'مدل مو',demo:'یک نمونهٔ قبل و بعد. با عکس خودت، مدل را روی صورت خودت می‌بینی و بعد برای آرایشگر می‌فرستی.'},
 color:{head:'اول، عکس خودت',sub:'یک عکس روبه‌رو یا سه‌رخ که موهایت کامل و واضح دیده شود. رنگ انتخابی روی همین عکس امتحان می‌شود.',drop:'عکس خودت را اینجا بگذار',ready:'اگر موهایت کامل و روشن دیده می‌شود، برو سراغ انتخاب رنگ.',tips:[['sun','نور روز. ','کنار پنجره، نه زیر نور زرد لامپ؛ رنگ واقعی مهم است.'],['user','موها در قاب. ','بدون کلاه، موها باز و تا جای ممکن کامل.'],['spark','بدون فیلتر. ','فیلتر رنگ موها را عوض می‌کند.']],ref:'فقط رنگ موی این عکس استفاده می‌شود؛ مدل و چهره‌اش نه.',noun:'رنگ',demo:'یک نمونهٔ قبل و بعد. با عکس خودت، رنگ را روی موهای خودت می‌بینی و بعد برای رنگ‌کار می‌فرستی.'},
 nails:{head:'اول، عکس دستت',sub:'پشت دست، انگشت‌ها کنار هم و ناخن‌ها کامل در قاب. طرح انتخابی روی همین عکس امتحان می‌شود.',drop:'عکس دستت را اینجا بگذار',ready:'اگر ناخن‌هایت واضح و کامل دیده می‌شوند، برو سراغ انتخاب طرح.',tips:[['sun','نور روز. ','کنار پنجره، بدون فلاش.'],['user','پشت دست. ','انگشت‌ها صاف و کنار هم، همهٔ ناخن‌ها در قاب.'],['spark','بدون فیلتر. ','لاک قبلی هم اشکالی ندارد.']],ref:'فقط طرح ناخن این عکس استفاده می‌شود؛ دستش نه.',noun:'ناخن',demo:'یک نمونهٔ قبل و بعد. با عکس دست خودت، طرح را روی ناخن‌های خودت می‌بینی و بعد برای ناخن‌کار می‌فرستی.'},
 lashes:{head:'اول، عکس چشم‌هایت',sub:'از نزدیک و روبه‌رو، چشم‌ها باز و رو به دوربین، بدون عینک. مدل انتخابی روی همین عکس امتحان می‌شود.',drop:'عکس چشم‌هایت را اینجا بگذار',ready:'اگر مژه‌ها و هر دو چشم واضح دیده می‌شوند، برو سراغ انتخاب مدل.',tips:[['sun','نور روبه‌رو. ','کنار پنجره، بدون سایهٔ تند.'],['user','از نزدیک. ','هر دو چشم کامل در قاب، بدون عینک.'],['spark','بدون فیلتر. ','ریمل و آرایش سنگین نداشته باش.']],ref:'فقط مدل مژهٔ این عکس استفاده می‌شود؛ چهره‌اش نه.',noun:'مژه',demo:'یک نمونهٔ قبل و بعد. با عکس خودت، مدل مژه را روی چشم‌های خودت می‌بینی و بعد برای مژه‌کار می‌فرستی.'}
};

// Bot: guess a portfolio photo's line from its caption (null if unclear).
// "مو" alone is weak: «رنگ مو» is colour, «کوتاهی مو» is a haircut.
const WORDS={nails:['ناخن','ژلیش','لاک','فرنچ','مانیکور','پدیکور','بیبی بومر','کروم','کت آی','کت‌آی','نیل'],lashes:['مژه','اکستنشن','لیفت','لمینت','والیوم','هیبرید','وت لش','ریمل','لش'],
 color:['رنگ','مش','بالیاژ','لایت','هایلایت','آمبره','سامبره','بلوند','دکلره','تونر','آمبر','شرابی','عسلی','دودی','نسکافه','شکلاتی','مسی','پلاتینه'],
 hair:['کوتاهی','شینیون','کراتین','براشینگ','فر ','فر‌','صافی','چتری','ویو','پروانه','ولف','باب','لیر','دم اسبی','گوجه','بافت','کات']};
export function guessLine(caption){
 return 'dress';
}
function guessLineOld(caption){
 const c=String(caption||'')+' ';const has=k=>WORDS[k].some(w=>c.includes(w));
 // "ناخن"/"مژه" are decisive even when a hair word also appears (e.g. «رنگ ناخن»).
 const n=has('nails'),l=has('lashes');
 if(n!==l)return n?'nails':'lashes';
 if(n&&l)return null;
 const col=has('color'),cut=has('hair');
 if(col!==cut)return col?'color':'hair';
 if(!col&&!cut&&c.includes('مو'))return 'hair';
 return null;
}
export function lineFromSpecialty(sp){return 'dress';}
function lineFromSpecialtyOld(sp){const s=String(sp||'');return s.includes('ناخن')?'nails':s.includes('مژه')?'lashes':/رنگ|مش|بالیاژ|لایت/.test(s)?'color':null}
