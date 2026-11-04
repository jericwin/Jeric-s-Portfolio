"""Build the web-ready images the site actually loads.

Usage: python scripts/optimize-images.py   (needs Pillow)

Sources stay where they are (large PNG/JPG masters in assets/); outputs go to assets/opt/:
  assets/opt/projects/<slug>-960.webp    project previews for the Orbit and Constellation views
  assets/opt/projects/<slug>-1600.webp   project screenshot in the details window
  assets/opt/certs-full/<n>.webp         full-size certificate for the lightbox
Re-run it after adding or replacing a project screenshot or certificate. Existing outputs that are
newer than their source are skipped.
"""
import os
import re
import glob
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(ROOT, 'assets')


def slug(name):
    return re.sub(r'[^a-z0-9]+', '-', os.path.splitext(name)[0].lower()).strip('-')


def fresh(src, dst):
    return os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src)


def save(img, dst, width, quality):
    if img.width > width:
        img = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    img.save(dst, 'WEBP', quality=quality, method=6)


def main():
    before = after = 0
    # Project screenshots: assets/*.png
    for src in sorted(glob.glob(os.path.join(A, '*.png'))):
        img = Image.open(src).convert('RGB')
        for width, q in ((960, 78), (1600, 80)):
            dst = os.path.join(A, 'opt', 'projects', f'{slug(os.path.basename(src))}-{width}.webp')
            if not fresh(src, dst):
                save(img, dst, width, q)
            after += os.path.getsize(dst)
        before += os.path.getsize(src)
    # Certificates: assets/<n>.jpg
    for src in sorted(glob.glob(os.path.join(A, '*.jpg'))):
        n = os.path.splitext(os.path.basename(src))[0]
        if not n.isdigit():
            continue
        dst = os.path.join(A, 'opt', 'certs-full', f'{n}.webp')
        if not fresh(src, dst):
            save(Image.open(src).convert('RGB'), dst, 2000, 80)
        before += os.path.getsize(src)
        after += os.path.getsize(dst)
    print(f'masters {before / 1e6:.1f} MB -> web images {after / 1e6:.1f} MB')


if __name__ == '__main__':
    main()
