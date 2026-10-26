"""THE REFRESH — typography, light flashes, beam, white flood + end card, fades.

Renders straight-alpha RGBA frames for FFmpeg's overlay filter.
  python3 overlay.py stream FPS VARIANT       -> raw rgba frames on stdout (VARIANT: main | web)
  python3 overlay.py stills OUT_DIR BG.png    -> sample frames composited on a background, for review
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

sys.path.insert(0, str(Path(__file__).parent))
from timeline import CUTS_WITH_FLASH, DURATION, END_CARD, H, TITLES, W  # noqa: E402

FONT_DIR = Path(__file__).parent / "fonts"
WHITE = np.array([1.0, 1.0, 1.0], np.float32)
INK = np.array([0.02, 0.02, 0.02], np.float32)          # logo black on white
GREY = np.array([0.40, 0.40, 0.40], np.float32)
SILVER = np.array([0.77, 0.77, 0.77], np.float32)       # #C5C5C5
WARM = np.array([1.0, 0.96, 0.90], np.float32)
BLACK = np.array([0.0, 0.0, 0.0], np.float32)

SAFE_W = 820  # keeps lines clear of TikTok / Reels side UI


def font(weight, size):
    return ImageFont.truetype(str(FONT_DIR / f"Geist-{weight}.ttf"), size)


def text_mask(text, weight, size, tracking_em, max_w=None, blur=0.0):
    """Alpha mask (float32 0..1) for tracked uppercase text; auto-shrinks to max_w."""
    while True:
        f = font(weight, size)
        track = tracking_em * size
        widths = [f.getlength(ch) for ch in text]
        total = sum(widths) + track * (len(text) - 1)
        if not max_w or total <= max_w or size <= 18:
            break
        size -= 1
    asc, desc = f.getmetrics()
    pad = int(8 + blur * 3)
    img = Image.new("L", (int(total) + 2 * pad, asc + desc + 2 * pad), 0)
    d = ImageDraw.Draw(img)
    x = pad
    for ch, w in zip(text, widths):
        d.text((x, pad), ch, font=f, fill=255)
        x += w + track
    if blur > 0:
        img = img.filter(ImageFilter.GaussianBlur(blur))
    return np.asarray(img, np.float32) / 255.0


def ease_out(u):
    u = min(max(u, 0.0), 1.0)
    return 1 - (1 - u) ** 3


def ease_in_out(u):
    u = min(max(u, 0.0), 1.0)
    return u * u * (3 - 2 * u)


class Frame:
    def __init__(self):
        self.C = np.zeros((H, W, 3), np.float32)  # premultiplied colour
        self.A = np.zeros((H, W), np.float32)
        self.used = False

    def sprite(self, mask, color, cx, cy, opacity):
        if opacity <= 0.002:
            return
        h, w = mask.shape
        x0, y0 = int(round(cx - w / 2)), int(round(cy - h / 2))
        xs, ys = max(0, x0), max(0, y0)
        xe, ye = min(W, x0 + w), min(H, y0 + h)
        if xe <= xs or ye <= ys:
            return
        a = mask[ys - y0 : ye - y0, xs - x0 : xe - x0] * opacity
        self.C[ys:ye, xs:xe] = color * a[..., None] + self.C[ys:ye, xs:xe] * (1 - a[..., None])
        self.A[ys:ye, xs:xe] = a + self.A[ys:ye, xs:xe] * (1 - a)
        self.used = True

    def fill(self, color, a):
        if np.max(a) <= 0.002:
            return
        if np.ndim(a) == 2:
            self.C = color * a[..., None] + self.C * (1 - a[..., None])
        else:
            self.C = color * a + self.C * (1 - a)
        self.A = a + self.A * (1 - a)
        self.used = True

    def rgba(self):
        out = np.zeros((H, W, 4), np.uint8)
        if not self.used:
            return out
        a = np.clip(self.A, 0, 1)
        rgb = self.C / np.maximum(a, 1e-6)[..., None]
        out[..., :3] = np.clip(rgb * 255 + 0.5, 0, 255)
        out[..., 3] = np.clip(a * 255 + 0.5, 0, 255)
        return out


class Overlay:
    BLUR_STEPS = (0.0, 1.5, 3.0, 5.0, 8.0)

    def __init__(self, variant="main"):
        self.variant = variant
        self.titles = []
        if variant == "main":
            for text, t_in, t_out, style in TITLES:
                if style == "line":
                    spec = ("Medium", 56, 0.2, SAFE_W, 1490)
                else:
                    spec = ("SemiBold", 124, 0.05, SAFE_W, 1470)
                weight, size, tr, mw, cy = spec
                masks = [text_mask(text, weight, size, tr, mw, b) for b in self.BLUR_STEPS]
                shadow = text_mask(text, weight, size, tr, mw, 14)
                self.titles.append(dict(t_in=t_in, t_out=t_out, masks=masks, shadow=shadow, cy=cy, style=style))
        ec = END_CARD
        self.wordmark = [text_mask(ec["wordmark"], "SemiBold", 150, tr, 780, b)
                         for tr in np.linspace(0.16, 0.07, 10) for b in (0.0,)]
        self.wordmark_blur = [text_mask(ec["wordmark"], "SemiBold", 150, 0.16, 780, b) for b in (6.0, 3.0)]
        self.tagline = [text_mask(ec["tagline"], "Medium", 44, 0.24, SAFE_W, b) for b in self.BLUR_STEPS]
        self.subline = [text_mask(ec["subline"], "Regular", 27, 0.2, SAFE_W, b) for b in self.BLUR_STEPS]
        self.hairline = np.ones((2, 140), np.float32)
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        self._diag = (xx * 0.8 + yy * 0.6)  # beam travels along this axis
        self._diag_max = float(self._diag.max())

    def _blur_pick(self, masks, blur01):
        i = int(round(blur01 * (len(masks) - 1)))
        return masks[min(max(i, 0), len(masks) - 1)]

    def _title(self, f, tt, t):
        if not (tt["t_in"] <= t <= tt["t_out"]):
            return
        din, dout = (0.5, 0.35) if tt["style"] == "line" else (0.32, 0.22)
        u_in = (t - tt["t_in"]) / din
        u_out = (tt["t_out"] - t) / dout
        if u_in < 1:
            k = ease_out(u_in)
            alpha, blur, dy = k, 1 - k, 18 * (1 - k)
        elif u_out < 1:
            k = ease_in_out(u_out)
            alpha, blur, dy = k, (1 - k) * 0.6, -10 * (1 - k)
        else:
            alpha, blur, dy = 1.0, 0.0, 0.0
        f.sprite(tt["shadow"], BLACK, W / 2, tt["cy"] + dy + 4, alpha * 0.45)
        f.sprite(self._blur_pick(tt["masks"], blur), WHITE, W / 2, tt["cy"] + dy, alpha)

    def frame(self, t):
        f = Frame()
        ec = END_CARD
        # opening fade from black (main), loop-friendly fade in (web)
        f_in = 0.5 if self.variant == "main" else 0.6
        if t < f_in:
            f.fill(BLACK, 1 - ease_in_out(t / f_in))
        for tt in self.titles:
            self._title(f, tt, t)
        # motivated light flashes on cuts
        for c in CUTS_WITH_FLASH:
            d = t - c
            if -0.10 <= d <= 0.18:
                a = (1 + d / 0.10) if d < 0 else (1 - d / 0.18)
                f.fill(WARM, 0.26 * ease_in_out(a))
        # beam of light crossing the frame before the reveal
        b0, b1 = ec["beam"]
        if b0 <= t <= b1:
            u = ease_in_out((t - b0) / (b1 - b0))
            centre = -300 + u * (self._diag_max + 600)
            band = np.exp(-0.5 * ((self._diag - centre) / 170.0) ** 2).astype(np.float32)
            f.fill(WARM, band * 0.55 * np.sin(np.pi * (t - b0) / (b1 - b0)) ** 0.5)
        # white flood and end card
        fl0, fl1 = ec["flood"]
        if t >= fl0:
            f.fill(WHITE, ease_in_out((t - fl0) / (fl1 - fl0)))
        if t >= ec["wordmark_in"]:
            u = (t - ec["wordmark_in"]) / 0.7
            k = ease_out(u)
            if u < 0.25:
                m = self.wordmark_blur[0] if u < 0.12 else self.wordmark_blur[1]
            else:
                m = self.wordmark[min(9, int(k * 9.999))]
            f.sprite(m, INK, W / 2, 880 + 10 * (1 - k), min(1.0, k * 1.3))
        if t >= ec["tagline_in"]:
            u = (t - ec["tagline_in"]) / 0.5
            k = ease_out(u)
            hl = self.hairline[:, : max(1, int(140 * k))]
            f.sprite(hl, SILVER, W / 2, 985, k)
            f.sprite(self._blur_pick(self.tagline, 1 - k), INK, W / 2, 1040 + 12 * (1 - k), k)
        if t >= ec["subline_in"] and self.variant == "main":
            u = (t - ec["subline_in"]) / 0.5
            k = ease_out(u)
            f.sprite(self._blur_pick(self.subline, 1 - k), GREY, W / 2, 1100 + 10 * (1 - k), k)
        fb0, fb1 = ec["fade_black"]
        if t >= fb0:
            f.fill(BLACK, ease_in_out((t - fb0) / (fb1 - fb0)))
        return f


def stream(fps, variant):
    ov = Overlay(variant)
    n = int(round(DURATION * fps))
    out = sys.stdout.buffer
    empty = np.zeros((H, W, 4), np.uint8).tobytes()
    for i in range(n):
        f = ov.frame(i / fps)
        out.write(f.rgba().tobytes() if f.used else empty)
    out.flush()


def stills(out_dir, bg_path):
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    bg = np.asarray(Image.open(bg_path).convert("RGB").resize((W, H)), np.float32) / 255
    ov = Overlay("main")
    for t in (1.6, 6.0, 8.6, 13.0, 14.9, 18.2, 18.5, 19.0, 20.2):
        f = ov.frame(t)
        a = f.rgba().astype(np.float32) / 255
        comp = a[..., :3] * a[..., 3:] + bg * (1 - a[..., 3:])
        Image.fromarray((comp * 255).astype(np.uint8)).save(out / f"t{t:05.2f}.png")
        print("wrote", t)


if __name__ == "__main__":
    if sys.argv[1] == "stream":
        stream(float(sys.argv[2]), sys.argv[3])
    else:
        stills(sys.argv[2], sys.argv[3])
