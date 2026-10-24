/**
 * Procedural canvas renderer for the TEKAURA cinematic sequence.
 *
 * Renders an unbranded graphite smartphone with a pseudo-3D turntable rotation,
 * a screen protector that descends and bonds to the display, a clear case that
 * slides on and snaps into place, and a USB-C cable that plugs in and starts a
 * charging animation. Everything is a pure function of scroll progress, so it
 * scrubs forwards and backwards perfectly.
 *
 * Used as the default visual until Higgsfield frame sequences are connected,
 * and as the fallback while frames load or if they fail.
 */


/* ── palette (follows the active colour scheme's CSS variables) ─────────── */
type RGB = [number, number, number];
export const P = {
  bg: [6, 6, 7] as RGB,
  graphite: [30, 31, 36] as RGB,
  steel: [78, 82, 94] as RGB,
  silver: [210, 220, 240] as RGB,
  accent: [47, 123, 255] as RGB,
  bright: [92, 155, 255] as RGB,
  deep: [20, 80, 200] as RGB,
  glow2: [120, 80, 255] as RGB,
  glow3: [0, 200, 220] as RGB,
};
export const c = (rgb: RGB, a = 1) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;

function parseColor(v: string): RGB | null {
  v = v.trim();
  const hex = v.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const nums = v.match(/-?[\d.]+/g);
  return nums && nums.length >= 3 ? [Number(nums[0]), Number(nums[1]), Number(nums[2])] : null;
}

/** Read the current colour scheme from CSS custom properties. */
export function loadPalette() {
  if (typeof window === "undefined") return;
  const cs = getComputedStyle(document.documentElement);
  const read = (name: string, key: keyof typeof P) => {
    const rgb = parseColor(cs.getPropertyValue(name));
    if (rgb) P[key] = rgb;
  };
  read("--color-ink", "bg");
  read("--color-graphite", "graphite");
  read("--color-steel", "steel");
  read("--color-silver", "silver");
  read("--color-volt", "accent");
  read("--color-volt-bright", "bright");
  read("--color-volt-deep", "deep");
  read("--scene-glow-2", "glow2");
  read("--scene-glow-3", "glow3");
  // keep the studio background very dark whatever the scheme
  P.bg = P.bg.map((v) => Math.round(v * 0.6)) as RGB;
}

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const bump = (t: number, a: number, b: number) => {
  const x = seg(t, a, b);
  return Math.sin(x * Math.PI);
};

export interface SceneState {
  x: number; // 0..1 of width
  y: number; // 0..1 of height (centre)
  s: number; // scale multiplier
  rot: number; // radians around vertical axis (0 = front)
  protector: number; // 0 = floating above, 1 = bonded
  protectorAlpha: number;
  bond: number; // 0..1 bonding light sweep
  casep: number; // 0 = away, 1 = fitted
  caseAlpha: number;
  snap: number; // snap flash
  cable: number; // 0 = away, 1 = plugged in
  cableAlpha: number;
  charge: number; // charging UI 0..1
  blue: number; // electric-blue ambience
  studio: number; // final studio lighting
  sweep: number; // light sweep position
}

/** Scene-local state. `scene` is the index, `t` local progress 0..1. */
export function computeState(scene: number, t: number, portrait: boolean, centered = false): SceneState {
  const side = centered || portrait ? 0.5 : 0.67;
  const baseY = portrait ? 0.36 : 0.53;
  const st: SceneState = {
    x: 0.5, y: baseY, s: 1, rot: 0,
    protector: 0, protectorAlpha: 0, bond: 0,
    casep: 0, caseAlpha: 0, snap: 0,
    cable: 0, cableAlpha: 0, charge: 0,
    blue: 0, studio: 0, sweep: -1,
  };

  if (scene === 0) {
    const e = easeInOut(t);
    st.rot = lerp(-1.1, 0, e);
    st.s = lerp(0.84, 1, e);
    st.sweep = lerp(-0.8, 1.8, t);
    st.y = baseY + (portrait ? 0.02 : 0);
    return st;
  }

  // scene ≥ 1 : protector bonded
  if (scene === 1) {
    const m = easeInOut(seg(t, 0, 0.3));
    st.x = lerp(0.5, side, m);
    st.s = lerp(1, portrait ? 1.08 : 1.16, m);
    st.protector = easeOut(seg(t, 0.14, 0.72));
    st.protectorAlpha = seg(t, 0.04, 0.2);
    st.bond = seg(t, 0.72, 0.95);
    st.sweep = lerp(-0.5, 1.5, seg(t, 0.7, 1));
    return st;
  }
  st.protector = 1;
  st.protectorAlpha = 1;
  st.bond = 1;

  if (scene === 2) {
    st.x = side;
    st.s = lerp(portrait ? 1.08 : 1.16, 1, easeInOut(seg(t, 0, 0.35)));
    st.rot = lerp(0, Math.PI, easeInOut(seg(t, 0.02, 0.4)));
    const c = seg(t, 0.4, 0.82);
    st.casep = c < 1 ? easeOutBack(c) : 1;
    st.caseAlpha = seg(t, 0.32, 0.48);
    st.snap = bump(t, 0.8, 0.95);
    st.sweep = lerp(-0.6, 1.6, seg(t, 0.82, 1));
    return st;
  }
  st.casep = 1;
  st.caseAlpha = 1;

  if (scene === 3) {
    st.x = side;
    st.rot = lerp(Math.PI, Math.PI * 2, easeInOut(seg(t, 0, 0.32)));
    const z = easeInOut(seg(t, 0.22, 0.55));
    st.s = lerp(1, portrait ? 1.3 : 1.5, z);
    // move the camera towards the bottom edge of the phone
    st.y = lerp(baseY, portrait ? 0.24 : 0.2, z);
    st.cable = easeOut(seg(t, 0.42, 0.76));
    st.cableAlpha = seg(t, 0.36, 0.48);
    st.charge = seg(t, 0.78, 0.98);
    st.blue = seg(t, 0.35, 0.85);
    return st;
  }

  // scene 4 : complete
  const m = easeInOut(seg(t, 0, 0.5));
  st.x = lerp(side, 0.5, m);
  st.y = lerp(portrait ? 0.24 : 0.2, portrait ? 0.33 : 0.4, m);
  st.s = lerp(portrait ? 1.3 : 1.5, portrait ? 0.86 : 0.76, m);
  st.rot = Math.PI * 2 + lerp(0, -0.75, easeInOut(seg(t, 0.15, 1)));
  st.cable = 1;
  st.cableAlpha = 1 - seg(t, 0, 0.22);
  st.charge = 1 - seg(t, 0.2, 0.5) * 0.6;
  st.blue = lerp(1, 0.35, seg(t, 0, 0.5));
  st.studio = easeOut(seg(t, 0.1, 0.7));
  st.sweep = lerp(-0.6, 1.6, seg(t, 0.35, 0.9));
  return st;
}

/* ── drawing ─────────────────────────────────────────────────────────────── */

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const PARTICLES = Array.from({ length: 46 }, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  return { x: r(1), y: r(2), z: 0.3 + r(3) * 0.7, sp: 0.2 + r(4) };
});

export interface RenderOptions {
  time: number;
  portrait: boolean;
  idle?: boolean;
}

export function renderScene(ctx: CanvasRenderingContext2D, W: number, H: number, st: SceneState, opts: RenderOptions) {
  const { time, portrait } = opts;
  const ph0 = portrait ? Math.min(H * 0.44, W * 0.95) : Math.min(H * 0.64, W * 0.42);
  const ph = ph0 * st.s;
  const pw = ph * 0.486;
  const r = pw * 0.16;
  const float = opts.idle === false ? 0 : Math.sin(time * 0.0011) * ph0 * 0.006;
  const cx = W * st.x;
  const cy = H * st.y + (portrait ? 0 : 0) + float;

  drawBackground(ctx, W, H, cx, cy, ph, st, time);

  const cosR = Math.cos(st.rot);
  const sn = Math.sin(st.rot);
  const front = cosR >= 0;
  const fx = Math.max(Math.abs(cosR), 0.002);
  const depth = pw * 0.1 * (st.casep > 0.98 ? 1.25 : 1);
  const band = depth * Math.abs(sn);
  const totalW = pw * fx + band;
  const left = cx - totalW / 2;
  const faceCx = sn > 0 ? left + band + (pw * fx) / 2 : left + (pw * fx) / 2;
  const top = cy - ph / 2;

  // floor shadow
  const sh = ctx.createRadialGradient(cx, cy + ph * 0.56, 0, cx, cy + ph * 0.56, pw * 1.1);
  sh.addColorStop(0, `rgba(0,0,0,${0.55 + st.studio * 0.1})`);
  sh.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save();
  ctx.translate(cx, cy + ph * 0.56);
  ctx.scale(1, 0.12);
  ctx.translate(-cx, -(cy + ph * 0.56));
  ctx.fillStyle = sh;
  ctx.fillRect(cx - pw * 1.2, cy + ph * 0.56 - pw * 1.2, pw * 2.4, pw * 2.4);
  ctx.restore();

  // case rim behind the phone when facing front with case fitted
  if (front && st.casep > 0.98) drawCaseRim(ctx, faceCx, cy, pw, ph, r, fx);

  // body / side band
  ctx.save();
  const bodyGrad = ctx.createLinearGradient(left, 0, left + totalW, 0);
  bodyGrad.addColorStop(0, "#2b2c30");
  bodyGrad.addColorStop(sn > 0 ? 0.15 : 0.85, "#a9acb3");
  bodyGrad.addColorStop(0.5, "#4a4c52");
  bodyGrad.addColorStop(1, "#1a1b1e");
  ctx.beginPath();
  rr(ctx, left, top, totalW, ph, Math.min(r, totalW / 2));
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  ctx.restore();

  // face
  ctx.save();
  ctx.translate(faceCx, cy);
  ctx.scale(fx, 1);
  if (front) drawFront(ctx, pw, ph, r, st, time);
  else drawBack(ctx, pw, ph, r);
  // light sweep
  if (st.sweep > -0.9 && st.sweep < 1.9) {
    ctx.save();
    ctx.beginPath();
    rr(ctx, -pw / 2, -ph / 2, pw, ph, r);
    ctx.clip();
    const sx = lerp(-pw * 1.2, pw * 1.2, st.sweep);
    const g = ctx.createLinearGradient(sx - pw * 0.4, -ph / 2, sx + pw * 0.4, ph / 2);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.5, "rgba(255,255,255,0.16)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
    ctx.restore();
  }
  // edge highlight
  ctx.beginPath();
  rr(ctx, -pw / 2 + 0.5, -ph / 2 + 0.5, pw - 1, ph - 1, r);
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 1 / fx;
  ctx.stroke();

  // protector (front)
  if (front && st.protectorAlpha > 0) drawProtector(ctx, pw, ph, r, st, fx);
  ctx.restore();

  // case shell (seen from the back while fitting)
  if (!front && st.caseAlpha > 0) drawCaseShell(ctx, faceCx, cy, pw, ph, r, fx, st);

  // cable
  if (front && st.cableAlpha > 0.01) drawCable(ctx, faceCx, cy + ph / 2, pw, H, st);

  // snap flash ring
  if (st.snap > 0.01) {
    ctx.save();
    ctx.globalAlpha = st.snap * 0.6;
    ctx.beginPath();
    rr(ctx, faceCx - (pw * fx) / 2 - 10 * st.snap, top - 10 * st.snap, pw * fx + 20 * st.snap, ph + 20 * st.snap, r + 10);
    ctx.strokeStyle = c(P.bright);
    ctx.lineWidth = 2;
    ctx.shadowColor = c(P.accent);
    ctx.shadowBlur = 30;
    ctx.stroke();
    ctx.restore();
  }

  drawParticles(ctx, W, H, time, st);
  drawVignette(ctx, W, H);
}

function drawBackground(ctx: CanvasRenderingContext2D, W: number, H: number, cx: number, cy: number, ph: number, st: SceneState, time: number) {
  ctx.fillStyle = c(P.bg);
  ctx.fillRect(0, 0, W, H);

  // overhead studio light
  const spot = ctx.createRadialGradient(cx, cy - ph * 0.9, 0, cx, cy - ph * 0.2, Math.max(W, H) * 0.75);
  spot.addColorStop(0, c(P.steel, 0.55 + st.studio * 0.35));
  spot.addColorStop(0.45, c(P.graphite, 0.5 + st.studio * 0.2));
  spot.addColorStop(1, c(P.bg, 0));
  ctx.fillStyle = spot;
  ctx.fillRect(0, 0, W, H);

  // electric blue accent
  if (st.blue > 0.01) {
    const pulse = 0.85 + Math.sin(time * 0.002) * 0.15;
    const b = ctx.createRadialGradient(cx, cy + ph * 0.45, 0, cx, cy + ph * 0.45, Math.max(W, H) * 0.6);
    b.addColorStop(0, c(P.accent, 0.42 * st.blue * pulse));
    b.addColorStop(0.5, c(P.deep, 0.12 * st.blue));
    b.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = b;
    ctx.fillRect(0, 0, W, H);
    // horizon line
    const lg = ctx.createLinearGradient(0, 0, W, 0);
    lg.addColorStop(0, c(P.accent, 0));
    lg.addColorStop(0.5, c(P.bright, 0.35 * st.blue));
    lg.addColorStop(1, c(P.accent, 0));
    ctx.fillStyle = lg;
    ctx.fillRect(0, Math.min(H - 2, cy + ph * 0.56), W, 1);
  }

  // final studio rim lights
  if (st.studio > 0.01) {
    for (const side of [-1, 1]) {
      const x = cx + side * Math.min(W * 0.36, ph * 0.9);
      const g = ctx.createLinearGradient(x - 120, 0, x + 120, 0);
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(0.5, c(P.silver, 0.07 * st.studio));
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - 120, 0, 240, H);
    }
    // floor plane
    const f = ctx.createLinearGradient(0, cy + ph * 0.5, 0, H);
    f.addColorStop(0, c(P.steel, 0.35 * st.studio));
    f.addColorStop(1, c(P.bg, 0));
    ctx.fillStyle = f;
    ctx.fillRect(0, cy + ph * 0.56, W, H);
  }
}

function drawFront(ctx: CanvasRenderingContext2D, pw: number, ph: number, r: number, st: SceneState, time: number) {
  // titanium frame
  const frame = ctx.createLinearGradient(-pw / 2, -ph / 2, pw / 2, ph / 2);
  frame.addColorStop(0, "#8e9198");
  frame.addColorStop(0.3, "#3d3f44");
  frame.addColorStop(0.7, "#5c5f66");
  frame.addColorStop(1, "#2a2b2f");
  ctx.beginPath();
  rr(ctx, -pw / 2, -ph / 2, pw, ph, r);
  ctx.fillStyle = frame;
  ctx.fill();

  const b1 = pw * 0.022;
  ctx.beginPath();
  rr(ctx, -pw / 2 + b1, -ph / 2 + b1, pw - b1 * 2, ph - b1 * 2, r - b1);
  ctx.fillStyle = "#020203";
  ctx.fill();

  // screen — "aura" wallpaper
  const b2 = pw * 0.045;
  const sx = -pw / 2 + b2;
  const sy = -ph / 2 + b2;
  const sw = pw - b2 * 2;
  const shh = ph - b2 * 2;
  ctx.save();
  ctx.beginPath();
  rr(ctx, sx, sy, sw, shh, r - b2);
  ctx.clip();
  const bg = ctx.createLinearGradient(0, sy, 0, sy + shh);
  bg.addColorStop(0, "#05070f");
  bg.addColorStop(1, "#0b1020");
  ctx.fillStyle = bg;
  ctx.fillRect(sx, sy, sw, shh);
  const t = time * 0.00018;
  const blobs: [number, number, number, string][] = [
    [Math.sin(t) * 0.18, -0.18 + Math.cos(t * 1.3) * 0.05, 0.75, c(P.accent, 0.85)],
    [0.28 + Math.cos(t) * 0.1, 0.22, 0.6, c(P.glow2, 0.55)],
    [-0.3, 0.38 + Math.sin(t * 0.8) * 0.06, 0.55, c(P.glow3, 0.35)],
  ];
  for (const [bx, by, br, col] of blobs) {
    const g = ctx.createRadialGradient(bx * sw, by * shh, 0, bx * sw, by * shh, br * sw);
    g.addColorStop(0, col);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(sx, sy, sw, shh);
  }
  // dim screen for charging UI
  if (st.charge > 0) {
    ctx.fillStyle = `rgba(2,3,8,${0.65 * st.charge})`;
    ctx.fillRect(sx, sy, sw, shh);
    const R = sw * 0.24;
    ctx.save();
    ctx.globalAlpha = st.charge;
    ctx.lineWidth = sw * 0.035;
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.arc(0, -shh * 0.04, R, 0, Math.PI * 2);
    ctx.stroke();
    const arc = ctx.createLinearGradient(-R, -R, R, R);
    arc.addColorStop(0, c(P.bright));
    arc.addColorStop(1, c(P.accent));
    ctx.strokeStyle = arc;
    ctx.lineCap = "round";
    ctx.shadowColor = c(P.accent);
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(0, -shh * 0.04, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (0.15 + 0.55 * st.charge));
    ctx.stroke();
    // bolt
    ctx.shadowBlur = 16;
    ctx.fillStyle = "#e8f0ff";
    const k = R * 0.42;
    const oy = -shh * 0.04;
    ctx.beginPath();
    ctx.moveTo(k * 0.15, oy - k);
    ctx.lineTo(-k * 0.55, oy + k * 0.12);
    ctx.lineTo(-k * 0.02, oy + k * 0.12);
    ctx.lineTo(-k * 0.2, oy + k);
    ctx.lineTo(k * 0.55, oy - k * 0.15);
    ctx.lineTo(k * 0.02, oy - k * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  // glass reflection
  const refl = ctx.createLinearGradient(sx, sy, sx + sw, sy + shh * 0.6);
  refl.addColorStop(0, "rgba(255,255,255,0.10)");
  refl.addColorStop(0.35, "rgba(255,255,255,0.02)");
  refl.addColorStop(0.36, "rgba(255,255,255,0)");
  ctx.fillStyle = refl;
  ctx.fillRect(sx, sy, sw, shh);
  ctx.restore();

  // camera island
  ctx.beginPath();
  rr(ctx, -pw * 0.15, -ph / 2 + ph * 0.028, pw * 0.3, ph * 0.026, ph * 0.013);
  ctx.fillStyle = "#000";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(pw * 0.09, -ph / 2 + ph * 0.041, ph * 0.006, 0, Math.PI * 2);
  ctx.fillStyle = "#14182a";
  ctx.fill();
}

function drawBack(ctx: CanvasRenderingContext2D, pw: number, ph: number, r: number) {
  const g = ctx.createLinearGradient(-pw / 2, -ph / 2, pw / 2, ph / 2);
  g.addColorStop(0, "#4a4c52");
  g.addColorStop(0.45, "#26272b");
  g.addColorStop(1, "#38393e");
  ctx.beginPath();
  rr(ctx, -pw / 2, -ph / 2, pw, ph, r);
  ctx.fillStyle = g;
  ctx.fill();

  // camera plateau
  const cs = pw * 0.44;
  const cxp = -pw / 2 + pw * 0.06;
  const cyp = -ph / 2 + pw * 0.06;
  ctx.beginPath();
  rr(ctx, cxp, cyp, cs, cs, pw * 0.12);
  const cg = ctx.createLinearGradient(cxp, cyp, cxp + cs, cyp + cs);
  cg.addColorStop(0, "#55575d");
  cg.addColorStop(1, "#2a2b2f");
  ctx.fillStyle = cg;
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1;
  ctx.stroke();
  const lens = (x: number, y: number) => {
    const R = pw * 0.085;
    ctx.beginPath();
    ctx.arc(x, y, R, 0, Math.PI * 2);
    ctx.fillStyle = "#77797f";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, R * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = "#07080b";
    ctx.fill();
    const lg = ctx.createRadialGradient(x - R * 0.25, y - R * 0.25, 0, x, y, R * 0.8);
    lg.addColorStop(0, "rgba(90,120,200,0.55)");
    lg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = lg;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - R * 0.3, y - R * 0.3, R * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fill();
  };
  lens(cxp + cs * 0.3, cyp + cs * 0.3);
  lens(cxp + cs * 0.3, cyp + cs * 0.72);
  lens(cxp + cs * 0.72, cyp + cs * 0.51);
  ctx.beginPath();
  ctx.arc(cxp + cs * 0.75, cyp + cs * 0.2, pw * 0.025, 0, Math.PI * 2);
  ctx.fillStyle = "#e9e3cf";
  ctx.fill();

  // satin sheen
  const s = ctx.createLinearGradient(-pw / 2, 0, pw / 2, 0);
  s.addColorStop(0, "rgba(255,255,255,0.06)");
  s.addColorStop(0.5, "rgba(255,255,255,0)");
  s.addColorStop(1, "rgba(255,255,255,0.04)");
  ctx.beginPath();
  rr(ctx, -pw / 2, -ph / 2, pw, ph, r);
  ctx.fillStyle = s;
  ctx.fill();
}

function drawProtector(ctx: CanvasRenderingContext2D, pw: number, ph: number, r: number, st: SceneState, fx: number) {
  const p = st.protector;
  const inset = pw * 0.012;
  const offY = -(1 - p) * ph * 0.62;
  const sc = 1 + (1 - p) * 0.14;
  ctx.save();
  ctx.globalAlpha = st.protectorAlpha;
  ctx.translate(0, offY);
  ctx.scale(sc, sc);
  const x = -pw / 2 + inset;
  const y = -ph / 2 + inset;
  const w = pw - inset * 2;
  const h = ph - inset * 2;
  // depth / shadow while hovering
  if (p < 1) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 40 * (1 - p);
    ctx.shadowOffsetY = 30 * (1 - p);
    ctx.beginPath();
    rr(ctx, x, y, w, h, r - inset);
    ctx.fillStyle = "rgba(160,185,220,0.05)";
    ctx.fill();
    ctx.restore();
  }
  ctx.beginPath();
  rr(ctx, x, y, w, h, r - inset);
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, `rgba(255,255,255,${0.16 * (1 - p * 0.6)})`);
  g.addColorStop(0.5, `rgba(200,220,255,${0.04 * (1 - p * 0.5)})`);
  g.addColorStop(1, `rgba(255,255,255,${0.12 * (1 - p * 0.6)})`);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = (p < 1 ? 1.6 : 1) / fx;
  ctx.strokeStyle = `rgba(255,255,255,${p < 1 ? 0.7 : 0.22})`;
  ctx.stroke();
  // camera-island cut-out outline
  ctx.beginPath();
  rr(ctx, -pw * 0.17, -ph / 2 + ph * 0.022, pw * 0.34, ph * 0.038, ph * 0.019);
  ctx.strokeStyle = `rgba(255,255,255,${0.4 * (1 - p)})`;
  ctx.stroke();
  // reflection streak
  ctx.save();
  ctx.beginPath();
  rr(ctx, x, y, w, h, r - inset);
  ctx.clip();
  const sg = ctx.createLinearGradient(x, y + h * 0.1, x + w, y + h * 0.4);
  sg.addColorStop(0.3, "rgba(255,255,255,0)");
  sg.addColorStop(0.5, `rgba(255,255,255,${0.22 * (1 - p * 0.7)})`);
  sg.addColorStop(0.7, "rgba(255,255,255,0)");
  ctx.fillStyle = sg;
  ctx.fillRect(x, y, w, h);
  // bonding sweep (top to bottom, bubble-free)
  if (st.bond > 0 && st.bond < 1) {
    const by = lerp(y - h * 0.2, y + h * 1.2, st.bond);
    const bg = ctx.createLinearGradient(0, by - h * 0.18, 0, by + h * 0.02);
    bg.addColorStop(0, "rgba(140,190,255,0)");
    bg.addColorStop(0.85, "rgba(160,200,255,0.35)");
    bg.addColorStop(1, "rgba(255,255,255,0.0)");
    ctx.fillStyle = bg;
    ctx.fillRect(x, by - h * 0.18, w, h * 0.2);
  }
  ctx.restore();
  ctx.restore();
}

function drawCaseRim(ctx: CanvasRenderingContext2D, cx: number, cy: number, pw: number, ph: number, r: number, fx: number) {
  const m = pw * 0.035;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(fx, 1);
  ctx.beginPath();
  rr(ctx, -pw / 2 - m, -ph / 2 - m, pw + m * 2, ph + m * 2, r + m);
  const g = ctx.createLinearGradient(-pw / 2, -ph / 2, pw / 2, ph / 2);
  g.addColorStop(0, "rgba(235,242,255,0.38)");
  g.addColorStop(0.5, "rgba(200,215,240,0.12)");
  g.addColorStop(1, "rgba(235,242,255,0.3)");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 1.2 / fx;
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.stroke();
  ctx.restore();
}

function drawCaseShell(ctx: CanvasRenderingContext2D, cx: number, cy: number, pw: number, ph: number, r: number, fx: number, st: SceneState) {
  const p = st.casep;
  const m = pw * 0.035;
  ctx.save();
  ctx.globalAlpha = st.caseAlpha;
  ctx.translate(cx, cy + (1 - Math.min(1, p)) * ph * 0.95);
  ctx.rotate((1 - Math.min(1, p)) * 0.22);
  const sc = 1 + (1 - p) * 0.1;
  ctx.scale(fx * sc, sc);
  const x = -pw / 2 - m;
  const y = -ph / 2 - m;
  const w = pw + m * 2;
  const h = ph + m * 2;
  // shell with camera cut-out (even-odd)
  const cs = pw * 0.44 + m * 1.2;
  const cxp = -pw / 2 + pw * 0.06 - m * 0.6;
  const cyp = -ph / 2 + pw * 0.06 - m * 0.6;
  ctx.beginPath();
  rr(ctx, x, y, w, h, r + m);
  rr(ctx, cxp, cyp, cs, cs, pw * 0.13);
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, "rgba(240,246,255,0.30)");
  g.addColorStop(0.45, "rgba(200,215,240,0.08)");
  g.addColorStop(1, "rgba(240,246,255,0.24)");
  ctx.fillStyle = g;
  ctx.fill("evenodd");
  ctx.lineWidth = 1.5 / fx;
  ctx.strokeStyle = "rgba(255,255,255,0.65)";
  ctx.stroke();
  // inner edge thickness highlight
  ctx.beginPath();
  rr(ctx, x + m * 0.45, y + m * 0.45, w - m * 0.9, h - m * 0.9, r + m * 0.55);
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.stroke();
  // vertical reflection
  ctx.save();
  ctx.beginPath();
  rr(ctx, x, y, w, h, r + m);
  ctx.clip();
  const rg = ctx.createLinearGradient(x, 0, x + w, 0);
  rg.addColorStop(0.62, "rgba(255,255,255,0)");
  rg.addColorStop(0.7, "rgba(255,255,255,0.18)");
  rg.addColorStop(0.78, "rgba(255,255,255,0)");
  ctx.fillStyle = rg;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
  ctx.restore();
}

function drawCable(ctx: CanvasRenderingContext2D, x: number, portY: number, pw: number, H: number, st: SceneState) {
  const gap = (1 - st.cable) * pw * 1.6;
  const tipH = pw * 0.075;
  const tipW = pw * 0.13;
  const houseW = pw * 0.2;
  const houseH = pw * 0.42;
  const top = portY + gap; // housing top
  ctx.save();
  ctx.globalAlpha = st.cableAlpha;

  // port glow while charging
  if (st.charge > 0) {
    const g = ctx.createRadialGradient(x, portY, 0, x, portY, pw * 0.6);
    g.addColorStop(0, c(P.bright, 0.55 * st.charge));
    g.addColorStop(1, c(P.accent, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - pw * 0.6, portY - pw * 0.6, pw * 1.2, pw * 1.2);
  }

  // cable
  ctx.beginPath();
  ctx.moveTo(x, top + houseH - 2);
  ctx.bezierCurveTo(x, top + houseH + pw * 0.8, x + pw * 0.5, top + houseH + pw * 1.3, x + pw * 0.4, H + 40);
  ctx.lineWidth = pw * 0.075;
  ctx.lineCap = "round";
  const cg = ctx.createLinearGradient(x - pw * 0.05, 0, x + pw * 0.05, 0);
  cg.addColorStop(0, "#bfc2c8");
  cg.addColorStop(0.5, "#f5f6f8");
  cg.addColorStop(1, "#aeb1b8");
  ctx.strokeStyle = cg;
  ctx.stroke();

  // strain relief + housing
  ctx.beginPath();
  rr(ctx, x - houseW * 0.32, top + houseH * 0.86, houseW * 0.64, houseH * 0.3, houseW * 0.2);
  ctx.fillStyle = "#e9eaee";
  ctx.fill();
  const hg = ctx.createLinearGradient(x - houseW / 2, 0, x + houseW / 2, 0);
  hg.addColorStop(0, "#c9ccd2");
  hg.addColorStop(0.45, "#ffffff");
  hg.addColorStop(1, "#b9bcc3");
  ctx.beginPath();
  rr(ctx, x - houseW / 2, top, houseW, houseH, houseW * 0.22);
  ctx.fillStyle = hg;
  ctx.fill();

  // metal tip, clipped so it disappears into the port
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - pw, portY, pw * 2, H);
  ctx.clip();
  const mg = ctx.createLinearGradient(x - tipW / 2, 0, x + tipW / 2, 0);
  mg.addColorStop(0, "#7d8087");
  mg.addColorStop(0.5, "#e6e8ec");
  mg.addColorStop(1, "#6f7279");
  ctx.beginPath();
  rr(ctx, x - tipW / 2, top - tipH, tipW, tipH + 2, tipH / 2);
  ctx.fillStyle = mg;
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

function drawParticles(ctx: CanvasRenderingContext2D, W: number, H: number, time: number, st: SceneState) {
  ctx.save();
  for (const p of PARTICLES) {
    const y = ((p.y - time * 0.000012 * p.sp) % 1 + 1) % 1;
    const x = p.x + Math.sin(time * 0.0003 * p.sp + p.y * 9) * 0.01;
    const a = 0.05 + p.z * 0.12 + st.blue * 0.08 * p.z;
    ctx.fillStyle = st.blue > 0.3 && p.z > 0.7 ? c(P.bright, a) : `rgba(255,255,255,${a})`;
    ctx.beginPath();
    ctx.arc(x * W, y * H, p.z * 1.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawVignette(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.8);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}
