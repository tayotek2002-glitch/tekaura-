import type { FrameSet } from "@/config/cinematic";

/**
 * Progressive image-sequence loader. Loads frames in a coarse-to-fine order
 * (every 8th, then 4th, 2nd, all) so scrubbing works almost immediately and
 * sharpens as more frames arrive.
 */
export class FrameSequence {
  readonly urls: string[];
  readonly images: (HTMLImageElement | null)[];
  private started = false;
  loaded = 0;

  constructor(set: FrameSet) {
    this.urls = Array.from({ length: set.count }, (_, i) => `${set.path}/${String(i + 1).padStart(4, "0")}.${set.ext}`);
    this.images = new Array(set.count).fill(null);
  }

  load(concurrency = 6) {
    if (this.started) return;
    this.started = true;
    const order: number[] = [];
    const seen = new Set<number>();
    for (const step of [8, 4, 2, 1])
      for (let i = 0; i < this.urls.length; i += step) {
        if (seen.has(i)) continue;
        seen.add(i);
        order.push(i);
      }
    // fetch the final frame early so scene-to-scene crossfades have it
    const last = this.urls.length - 1;
    const at = order.indexOf(last);
    if (at > 1) {
      order.splice(at, 1);
      order.splice(1, 0, last);
    }
    let cursor = 0;
    const next = () => {
      if (cursor >= order.length) return;
      const i = order[cursor++];
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        this.images[i] = img;
        this.loaded++;
        next();
      };
      img.onerror = () => next();
      img.src = this.urls[i];
    };
    for (let k = 0; k < concurrency; k++) next();
  }

  /** Nearest loaded frame to fractional position t (0..1). */
  frameAt(t: number): HTMLImageElement | null {
    const n = this.images.length;
    const target = Math.round(Math.min(1, Math.max(0, t)) * (n - 1));
    for (let d = 0; d < n; d++) {
      const a = this.images[target - d];
      if (a) return a;
      const b = this.images[target + d];
      if (b) return b;
    }
    return null;
  }
}

export function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, W: number, H: number, alpha = 1) {
  const s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
  const w = img.naturalWidth * s;
  const h = img.naturalHeight * s;
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
  ctx.globalAlpha = 1;
}
