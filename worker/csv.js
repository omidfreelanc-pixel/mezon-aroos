// CSV cells for spreadsheets. A cell that starts with = + - @ would run as a formula, so it gets a leading apostrophe.
export const cell=v=>{let x=String(v??'').replace(/\r?\n/g,' ');if(/^[=+\-@\t]/.test(x))x="'"+x;return '"'+x.replace(/"/g,'""')+'"'};
export const csvResponse=(rows,filename)=>new Response('﻿'+rows.map(r=>r.map(cell).join(',')).join('\r\n'),{headers:{'Content-Type':'text/csv;charset=utf-8','Content-Disposition':'attachment; filename="'+filename+'"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
