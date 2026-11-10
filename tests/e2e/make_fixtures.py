# Test pictures for the browser checks: a bride photo and dresses in different colours and patterns (PIL only).
# Run from the repository root:  python3 tests/e2e/make_fixtures.py
import os, random, math
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
OUT='tests/e2e/out'; os.makedirs(OUT,exist_ok=True); random.seed(3)
W,H=900,1500; im=Image.new('RGB',(W,H)); d=ImageDraw.Draw(im)
for y in range(H): t=y/H; d.line([(0,y),(W,y)],fill=(int(200-40*t),int(190-30*t),int(180-20*t)))
for x in range(0,W,60): d.line([(x,0),(x,H)],fill=(185,178,168),width=3)
for y in range(1100,H,40): d.line([(0,y),(W,y)],fill=(120,100,80),width=2)
d.ellipse([360,130,540,250],fill=(60,40,30)); d.ellipse([385,190,515,330],fill=(228,192,162))
d.polygon([(330,340),(570,340),(600,820),(300,820)],fill=(235,232,226)); d.polygon([(300,820),(600,820),(760,1380),(140,1380)],fill=(240,238,232))
for i in range(30): x=random.randint(150,750); d.line([(x,830),(x+random.randint(-60,60),1370)],fill=(215,210,200),width=3)
d.ellipse([430,235,450,250],fill=(40,30,30)); d.ellipse([470,235,490,250],fill=(40,30,30)); d.arc([440,275,490,305],0,180,fill=(150,60,60),width=4)
im=im.filter(ImageFilter.GaussianBlur(0.6)); im.save(OUT+'/bride.jpg',quality=92)
ImageEnhance.Color(im).enhance(1.6).save(OUT+'/result.jpg',quality=90)
def dress(name,base,acc,pattern,bg=(246,244,241)):
    im=Image.new('RGB',(600,900),bg); d=ImageDraw.Draw(im)
    mask=Image.new('L',im.size,0); ImageDraw.Draw(mask).polygon([(250,120),(350,120),(380,360),(520,860),(80,860),(220,360)],fill=255)
    fab=Image.new('RGB',im.size,base); fd=ImageDraw.Draw(fab)
    if pattern=='lace':
        for y in range(0,900,26):
            for x in range(0,600,26): fd.ellipse([x+6,y+6,x+16,y+16],outline=acc,width=2)
    elif pattern=='stripes':
        for x in range(0,600,18): fd.line([(x,0),(x+80,900)],fill=acc,width=4)
    elif pattern=='sequin':
        for _ in range(6000): x,y=random.randint(0,599),random.randint(0,899); fd.ellipse([x,y,x+3,y+3],fill=acc)
    elif pattern=='floral':
        for _ in range(120):
            x,y=random.randint(0,599),random.randint(0,899)
            for a in range(0,360,72): fd.ellipse([x+12*math.cos(math.radians(a))-6,y+12*math.sin(math.radians(a))-6,x+12*math.cos(math.radians(a))+6,y+12*math.sin(math.radians(a))+6],fill=acc)
    im.paste(fab,(0,0),mask); im.filter(ImageFilter.GaussianBlur(0.5)).save(OUT+'/'+name,quality=92)
dress('dress_ivory.jpg',(246,238,220),(222,208,176),'lace'); dress('dress_blush.jpg',(244,196,204),(226,150,168),'stripes')
dress('dress_champagne.jpg',(222,196,150),(246,226,176),'sequin'); dress('dress_white.jpg',(252,252,252),(232,236,242),'plain',bg=(250,250,250))
dress('dress_emerald.jpg',(24,112,84),(120,200,160),'floral'); print('fixtures in',OUT)
