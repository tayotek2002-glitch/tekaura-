/**
 * Runtime for the static preview build (scripts/preview/build.mjs).
 * The preview is a snapshot of the rendered site without React, so this
 * re-attaches the few behaviours a visitor needs to look around: the
 * scroll-driven cinematic sequence, the mobile menu and the FAQ.
 * Shopping actions (search, filters, basket) only work on the real site.
 */
import { clamp, computeState, loadPalette, renderScene } from "../../src/components/cinematic/renderer";
import { cinematicScenes } from "../../src/config/cinematic";

const TOTAL = cinematicScenes.reduce((n, s) => n + s.weight, 0);
const BOUNDS = cinematicScenes.reduce<number[]>((acc, s) => [...acc, acc[acc.length - 1] + s.weight / TOTAL], [0]);

function locate(p: number) {
  for (let i = 0; i < cinematicScenes.length; i++) {
    if (p <= BOUNDS[i + 1] || i === cinematicScenes.length - 1) {
      return { i, t: clamp((p - BOUNDS[i]) / (BOUNDS[i + 1] - BOUNDS[i])) };
    }
  }
  return { i: 0, t: 0 };
}

function initCinematic() {
  const section = document.querySelector<HTMLElement>('section[aria-label^="TEKAURA"]');
  const canvas = section?.querySelector("canvas");
  if (!section || !canvas) return;
  const sticky = canvas.parentElement!;
  const panels = [...sticky.children].filter((el): el is HTMLElement => !!el.getAttribute("style")?.includes("--v")) as HTMLElement[];
  const rail = [...section.querySelectorAll<HTMLButtonElement>('button[aria-label^="Go to scene"]')];
  const cue = [...section.querySelectorAll<HTMLElement>(".eyebrow")].find((e) => e.textContent === "Scroll")?.closest<HTMLElement>(".pointer-events-none");
  const ctx = canvas.getContext("2d", { alpha: false })!;
  loadPalette();

  let W = 0;
  let H = 0;
  let portrait = false;
  let current = 0;
  let lastActive = -1;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    W = r.width;
    H = r.height;
    portrait = W / H < 0.9;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  new ResizeObserver(resize).observe(canvas);

  const progress = () => {
    const r = section.getBoundingClientRect();
    return clamp(-r.top / Math.max(1, section.offsetHeight - window.innerHeight));
  };

  rail.forEach((btn, k) =>
    btn.addEventListener("click", () => {
      const top = section.getBoundingClientRect().top + window.scrollY;
      const len = section.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + len * (BOUNDS[k] + (BOUNDS[k + 1] - BOUNDS[k]) * 0.4), behavior: "smooth" });
    }),
  );

  const frame = (time: number) => {
    const target = progress();
    current += (target - current) * 0.16;
    if (Math.abs(target - current) < 0.0002) current = target;
    const { i, t } = locate(current);
    renderScene(ctx, W, H, computeState(i, t, portrait), { time, portrait });

    panels.forEach((el, k) => {
      let v = 0;
      let o = 0;
      if (k === i) {
        const inn = k === 0 ? 1 : clamp((t - 0.03) / 0.17);
        const out = k === panels.length - 1 ? 1 : 1 - clamp((t - 0.84) / 0.12);
        v = inn;
        o = Math.min(1, inn * 1.4) * out;
      }
      el.style.setProperty("--v", v.toFixed(3));
      el.style.opacity = o.toFixed(3);
      el.style.pointerEvents = o > 0.5 ? "auto" : "none";
    });
    if (cue) cue.style.opacity = String(1 - clamp(current / 0.03));
    if (i !== lastActive) {
      lastActive = i;
      rail.forEach((btn, k) => {
        const [label, bar] = btn.children as unknown as HTMLElement[];
        const on = k === i;
        if (label) label.style.opacity = on ? "1" : "0";
        if (bar) {
          bar.style.width = on ? "2rem" : "0.75rem";
          bar.style.background = on ? "var(--color-volt)" : "rgb(255 255 255 / 0.3)";
        }
      });
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function initMenu() {
  const toggle = document.querySelector<HTMLButtonElement>('button[aria-controls="mobile-menu"]');
  const menu = document.getElementById("mobile-menu");
  if (!toggle || !menu) return;
  // sub-collection lists aren't part of the snapshot; category links still work
  menu.querySelectorAll('button[aria-label$="collections"]').forEach((b) => b.remove());
  toggle.addEventListener("click", () => {
    const open = menu.hidden;
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    toggle.innerHTML = open
      ? '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>'
      : '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 8h16M4 16h16"/></svg>';
    document.documentElement.style.overflow = open ? "hidden" : "";
  });
}

function initFaq() {
  document.querySelectorAll<HTMLButtonElement>('button[aria-controls^="faq-"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const region = document.getElementById(btn.getAttribute("aria-controls")!);
      const open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      region?.classList.toggle("grid-rows-[1fr]", open);
      region?.classList.toggle("grid-rows-[0fr]", !open);
      btn.querySelector("svg")?.classList.toggle("rotate-45", open);
    });
  });
}

/** Any other button belongs to a shopping feature that needs the real site. */
function initPreviewNotice() {
  const toast = document.createElement("div");
  toast.setAttribute("role", "status");
  toast.style.cssText =
    "position:fixed;left:50%;bottom:calc(16px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:200;max-width:calc(100% - 32px);padding:10px 16px;border-radius:999px;background:var(--color-ink);color:#fff;font:500 13px/1.3 var(--font-sans);box-shadow:0 10px 30px rgb(0 0 0 / .3);opacity:0;transition:opacity .3s;pointer-events:none;text-align:center";
  document.body.appendChild(toast);
  let timer = 0;
  document.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest("button");
    if (!btn || btn.matches('[aria-controls="mobile-menu"],[aria-controls^="faq-"],[aria-label^="Go to scene"]')) return;
    toast.textContent = "Preview only — search, filters and the basket work on the live site.";
    toast.style.opacity = "1";
    clearTimeout(timer);
    timer = window.setTimeout(() => (toast.style.opacity = "0"), 2600);
  });
}

initCinematic();
initMenu();
initFaq();
initPreviewNotice();
