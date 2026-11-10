# Test pictures for the browser checks, all photographic: a bride photo and its result (tests/e2e/photos), and dress photos taken from
# the catalogue (public/catalog/dress) and re-coloured with PIL so that the lace and satin textures stay real.
# Run from the repository root:  python3 tests/e2e/make_fixtures.py
import os
from PIL import Image, ImageOps
OUT='tests/e2e/out'; os.makedirs(OUT,exist_ok=True)
for n in ('bride','result'): Image.open(f'tests/e2e/photos/{n}.jpg').convert('RGB').resize((960,1440),Image.LANCZOS).save(f'{OUT}/{n}.jpg',quality=92)
def cat(i): return Image.open(f'public/catalog/dress/{i:02d}.webp').convert('RGB')
def tone(im,dark,mid,light):
    g=ImageOps.autocontrast(ImageOps.grayscale(im),cutoff=1)
    return ImageOps.colorize(g,black=dark,mid=mid,white=light)
cat(2).save(f'{OUT}/dress_ivory.jpg',quality=92)                                                   # ivory lace (as shot)
tone(cat(3),(120,62,72),(232,170,182),(255,236,238)).save(f'{OUT}/dress_blush.jpg',quality=92)      # blush satin
tone(cat(6),(110,82,40),(214,180,124),(252,238,206)).save(f'{OUT}/dress_champagne.jpg',quality=92)  # champagne lace
tone(cat(5),(6,52,40),(30,122,92),(196,236,216)).save(f'{OUT}/dress_emerald.jpg',quality=92)        # emerald satin
print('fixtures in',OUT)
