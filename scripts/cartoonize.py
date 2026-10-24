"""Generate assets/opt/me-toon.webp, the cartoon twin of the hero portrait.

Usage: python scripts/cartoonize.py assets/opt/me.webp assets/opt/me-toon.webp  (needs opencv-python, numpy)

Edge-preserving smoothing, cel-shaded lightness bands, a gentle saturation boost and
XDoG ink outlines -- derived pixel-for-pixel from the photo so the two stay aligned."""
import sys
import cv2
import numpy as np

src, dst = sys.argv[1], sys.argv[2]
SS = 2  # work at 2x for cleaner lines
img = cv2.imread(src, cv2.IMREAD_UNCHANGED)
h, w = img.shape[:2]
bgr, alpha = img[:, :, :3], img[:, :, 3]
bgr = cv2.fastNlMeansDenoisingColored(bgr, None, 5, 5, 7, 21)  # strip source compression blocks
big = cv2.resize(bgr, (w * SS, h * SS), interpolation=cv2.INTER_CUBIC)
abig = cv2.resize(alpha, (w * SS, h * SS), interpolation=cv2.INTER_CUBIC)

# 1. Flatten texture but keep structure.
smooth = big.copy()
for _ in range(4):
    smooth = cv2.bilateralFilter(smooth, 9, 40, 9)
smooth = cv2.edgePreservingFilter(smooth, flags=cv2.RECURS_FILTER, sigma_s=40, sigma_r=0.25)

# 2. Cel shading: quantize lightness into soft bands, keep chroma smooth.
lab = cv2.cvtColor(smooth, cv2.COLOR_BGR2LAB).astype(np.float32)
L = lab[:, :, 0] / 255.0
# band shapes follow broad form, not texture, without bleeding across hard edges
Lb = L.astype(np.float32)
for _ in range(3):
    Lb = cv2.bilateralFilter(Lb, 0, 0.06, 4 * SS)
bands = 5
q = np.floor(Lb * bands) / bands
frac = Lb * bands - np.floor(Lb * bands)
# smoothstep edge between bands keeps steps crisp but anti-aliased
t = np.clip((frac - 0.82) / 0.18, 0, 1)
t = t * t * (3 - 2 * t)
Lq = q + t / bands
Lq = 0.6 * Lq + 0.4 * Lb + (L - Lb) * 0.35  # retain a bit of the original modelling
lab[:, :, 0] = np.clip(Lq * 255, 0, 255)
lab[:, :, 1:] = 128 + (lab[:, :, 1:] - 128) * 1.22  # vibrant but natural
cel = cv2.cvtColor(lab.astype(np.uint8), cv2.COLOR_LAB2BGR)

# 3. Ink lines via XDoG on the smoothed luminance.
gray = cv2.cvtColor(cv2.bilateralFilter(big, 9, 30, 9), cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
s = 1.4 * SS
g1 = cv2.GaussianBlur(gray, (0, 0), s)
g2 = cv2.GaussianBlur(gray, (0, 0), s * 1.6)
d = g1 - 0.985 * g2
eps, phi = -0.004, 160
xdog = np.where(d >= eps, 1.0, 1 + np.tanh(phi * (d - eps)))
ink = 1 - np.clip(xdog, 0, 1)
ink = cv2.GaussianBlur(ink, (0, 0), 0.8)
ink = np.clip((ink - 0.28) * 2.4, 0, 1)
# remove speckle: drop tiny components
mask = (ink > 0.35).astype(np.uint8)
n, lbl, stats, _ = cv2.connectedComponentsWithStats(mask, 8)
small = np.isin(lbl, np.where(stats[:, cv2.CC_STAT_AREA] < 60 * SS * SS)[0])
ink[small] = 0

# silhouette outline from alpha
a = abig.astype(np.float32) / 255
edge = cv2.morphologyEx((a > 0.5).astype(np.uint8), cv2.MORPH_GRADIENT, np.ones((3 * SS, 3 * SS), np.uint8)).astype(np.float32)
edge = cv2.GaussianBlur(edge, (0, 0), 0.8)
ink = np.maximum(ink, edge * 0.9)

line_col = np.array([38, 28, 30], np.float32)  # warm dark ink (BGR)
out = cel.astype(np.float32) * (1 - ink[..., None]) + line_col * ink[..., None]
out = cv2.resize(np.clip(out, 0, 255).astype(np.uint8), (w, h), interpolation=cv2.INTER_AREA)
rgba = np.dstack([out, alpha])
cv2.imwrite(dst, rgba, [cv2.IMWRITE_WEBP_QUALITY, 88] if dst.endswith('.webp') else [])
print('ok', dst)
