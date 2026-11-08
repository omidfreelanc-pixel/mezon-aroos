// Venue backgrounds the bride can be placed in. The picture files live in public/bg/<id>.jpg (portrait 2:3, no people).
export const BACKGROUNDS=[
 {id:'hall-gold',name:'تالار کلاسیک طلایی'},
 {id:'garden-night',name:'باغ‌تالار شبانه'},
 {id:'hall-white',name:'تالار سفید و قوسی'},
 {id:'rose-arch',name:'تالار گل و پرده'},
 {id:'palace',name:'کاخ ایرانی'},
 {id:'terrace-sunset',name:'تراس غروب'}
];
export const bgOf=id=>BACKGROUNDS.find(x=>x.id===id)||null;
// Replaces the "keep the original background" rule: the same woman is placed inside the venue photo, as one real photograph.
export const venuePrompt=n=>'\nVENUE (this overrides the background rule above, for the background only): photo '+n+' is an empty wedding venue. Place the SAME woman, with the SAME body, face, skin, hair and pose, standing naturally on the floor of that venue, in the free space in the middle, full body visible from head to the floor. Replace the original background of photo 1 completely with the venue. It must look like ONE real photograph taken there by a professional wedding photographer: match the venue\'s perspective and camera height, scale her correctly to the room, light her with the venue\'s light direction, colour temperature and softness, add soft realistic contact shadows and subtle floor reflections under the dress and train, use the same colour grade, grain and depth of field as the venue photo, and keep clean natural edges around her hair, veil and hands with no cut-out halo or glow. Keep the venue itself unchanged and add no other people, text or objects. Never change her face or body to suit the scene.';
