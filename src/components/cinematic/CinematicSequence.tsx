"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cinematicScenes, type CinematicScene } from "@/config/cinematic";
import { P, c, clamp, computeState, loadPalette, renderScene } from "./renderer";
import { FrameSequence, drawCover } from "./frames";
import { cn } from "@/lib/format";

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

type Mode = "pending" | "cinematic" | "static";

export function CinematicSequence() {
  const [mode, setMode] = useState<Mode>("pending");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const lowPower = (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) || nav.connection?.saveData === true || (navigator.hardwareConcurrency ?? 8) <= 2;
    setMode(reduce || lowPower ? "static" : "cinematic");
  }, []);

  if (mode === "static") return <StaticSequence />;
  return <ScrollSequence pending={mode === "pending"} />;
}

/* ── Scroll-driven version ─────────────────────────────────────────────── */

function ScrollSequence({ pending }: { pending: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const railRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (pending) return;
    gsap.registerPlugin(ScrollTrigger);
    loadPalette();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: false })!;
    let W = 0;
    let H = 0;
    let portrait = false;
    let target = 0;
    let current = 0;
    let raf = 0;
    let visible = true;
    let lastActive = -1;

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const sequences = cinematicScenes.map((s) => (s.frames ? new FrameSequence(isMobile ? s.frames.mobile : s.frames.desktop) : null));
    sequences[0]?.load();
    // load the rest once the first scene is under way
    const idle = window.setTimeout(() => sequences.forEach((s) => s?.load(3)), 1200);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.75 : 2);
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      portrait = W / H < 0.9;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const st = ScrollTrigger.create({
      trigger: wrapRef.current!,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => (target = self.progress),
      onRefresh: (self) => (target = self.progress),
    });

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(wrapRef.current!);

    function draw(p: number, time: number) {
      const { i, t } = locate(p);
      const seq = sequences[i];
      const img = seq?.frameAt(t);
      if (img) {
        ctx.fillStyle = c(P.bg);
        ctx.fillRect(0, 0, W, H);
        drawCover(ctx, img, W, H);
        // crossfade into the next clip over the last 6% of a scene
        const nextSeq = sequences[i + 1];
        if (t > 0.94 && nextSeq) {
          const nimg = nextSeq.frameAt(0);
          if (nimg) drawCover(ctx, nimg, W, H, (t - 0.94) / 0.06);
        }
      } else {
        renderScene(ctx, W, H, computeState(i, t, portrait), { time, portrait });
      }
    }

    function updateOverlay(p: number) {
      const { i, t } = locate(p);
      cinematicScenes.forEach((_, k) => {
        const el = panelRefs.current[k];
        if (!el) return;
        let v = 0;
        let o = 0;
        if (k === i) {
          const inn = k === 0 ? 1 : clamp((t - 0.03) / 0.17);
          const out = k === cinematicScenes.length - 1 ? 1 : 1 - clamp((t - 0.84) / 0.12);
          v = inn;
          o = Math.min(1, inn * 1.4) * out;
        }
        el.style.setProperty("--v", v.toFixed(3));
        el.style.opacity = o.toFixed(3);
        el.style.pointerEvents = o > 0.5 ? "auto" : "none";
        el.setAttribute("aria-hidden", o > 0.05 ? "false" : "true");
      });
      if (railRef.current) railRef.current.style.setProperty("--p", p.toFixed(4));
      if (cueRef.current) cueRef.current.style.opacity = String(1 - clamp(p / 0.03));
      if (i !== lastActive) {
        lastActive = i;
        setActive(i);
      }
    }

    function frame(time: number) {
      raf = 0;
      current += (target - current) * 0.14;
      if (Math.abs(target - current) < 0.0002) current = target;
      draw(current, time);
      updateOverlay(current);
      if (visible) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(idle);
      ro.disconnect();
      io.disconnect();
      st.kill();
    };
  }, [pending]);

  function scrollToScene(k: number, offset = 0.4) {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const top = wrap.getBoundingClientRect().top + window.scrollY;
    const len = wrap.offsetHeight - window.innerHeight;
    const y = top + len * (BOUNDS[k] + (BOUNDS[k + 1] - BOUNDS[k]) * offset);
    const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number, o?: object) => void } }).__lenis;
    if (lenis) lenis.scrollTo(y, { duration: 1.6 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  }

  return (
    <section
      ref={wrapRef}
      aria-label="TEKAURA — your phone, reimagined"
      className="relative -mt-[var(--header-h)] bg-ink text-white"
      style={{ height: `${(TOTAL + 1) * 100}svh` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />

        {/* legibility scrims */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/80 via-black/30 to-transparent md:hidden" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 hidden w-[55%] bg-gradient-to-r from-black/60 to-transparent md:block" />

        {cinematicScenes.map((scene, k) => (
          <ScenePanel
            key={scene.id}
            scene={scene}
            index={k}
            ref={(el) => {
              panelRefs.current[k] = el;
            }}
            onFocusWithin={() => k !== active && scrollToScene(k, 0.5)}
          />
        ))}

        {/* scene rail */}
        <div
          ref={railRef}
          className="absolute right-[clamp(1rem,3vw,2.5rem)] top-1/2 hidden -translate-y-1/2 flex-col items-end gap-4 lg:flex"
          style={{ ["--p" as string]: 0 }}
        >
          {cinematicScenes.map((s, k) => (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollToScene(k)}
              className="group flex items-center gap-3"
              aria-label={`Go to scene: ${s.label}`}
              aria-current={active === k ? "step" : undefined}
            >
              <span className={cn("eyebrow text-[10px] transition-all duration-500", active === k ? "text-white opacity-100" : "text-white/40 opacity-0 group-hover:opacity-100")}>
                {s.label}
              </span>
              <span className={cn("block h-[2px] rounded-full transition-all duration-500", active === k ? "w-8 bg-volt" : "w-3 bg-white/30 group-hover:bg-white/60")} />
            </button>
          ))}
        </div>

        {/* scroll cue + skip */}
        <div ref={cueRef} className="pointer-events-none absolute inset-x-0 bottom-8 hidden justify-center md:flex">
          <div className="flex flex-col items-center gap-2 text-white/50">
            <span className="eyebrow text-[10px]">Scroll</span>
            <span className="relative block h-10 w-px overflow-hidden bg-white/15">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[cue_1.8s_ease-in-out_infinite] bg-white/80" />
            </span>
          </div>
        </div>
        <a
          href="#after-cinematic"
          className="absolute bottom-6 right-5 rounded-full border border-white/15 px-4 py-2 text-[12px] text-white/60 backdrop-blur hover:border-white/40 hover:text-white md:bottom-8 md:right-[clamp(1rem,3vw,2.5rem)]"
        >
          Skip to shop
        </a>
        <p className="pointer-events-none absolute bottom-7 left-5 hidden font-mono text-[9px] uppercase tracking-[0.18em] text-white/30 md:left-[clamp(1.25rem,4vw,3.5rem)] md:bottom-9 md:block">
          Concept visualisation · not an actual TEKAURA product
        </p>
      </div>
      <style>{`@keyframes cue{0%{transform:translateY(-100%)}100%{transform:translateY(200%)}}`}</style>
    </section>
  );
}

/* ── Overlay text for one scene ────────────────────────────────────────── */

const ScenePanel = ({
  scene,
  index,
  ref,
  onFocusWithin,
}: {
  scene: CinematicScene;
  index: number;
  ref: (el: HTMLDivElement | null) => void;
  onFocusWithin: () => void;
}) => {
  const line = (text: string, i: number, className?: string) => (
    <span key={i} className={cn("block overflow-hidden pb-[0.06em]", className)}>
      <span
        className="block will-change-transform"
        style={{
          transform: `translateY(calc((1 - clamp(0, var(--v) * 1.7 - ${i * 0.32}, 1)) * 110%))`,
        }}
      >
        {text}
      </span>
    </span>
  );

  const fade = (i: number): React.CSSProperties => ({
    opacity: `clamp(0, calc(var(--v) * 2 - ${0.6 + i * 0.25}), 1)`,
    transform: `translateY(calc((1 - clamp(0, calc(var(--v) * 2 - ${0.6 + i * 0.25}), 1)) * 16px))`,
  });

  const ctas = (
    <div className="flex flex-wrap gap-3" style={fade(2)}>
      {scene.ctas.map((c) => (
        <Link key={c.label} href={c.href} className={cn("btn", c.variant === "primary" ? "btn-light" : "btn-ghost-light")}>
          {c.label}
        </Link>
      ))}
    </div>
  );

  const callouts = scene.callouts && (
    <ul className="flex flex-wrap gap-2" style={fade(1)}>
      {scene.callouts.map((c) => (
        <li key={c.label}>
          <Link
            href={c.href}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 text-[13px] text-white/85 backdrop-blur-md transition hover:border-white/40 hover:bg-white/10"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-volt" />
            {c.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  const Title = index === 0 ? "h1" : "h2";

  return (
    <div
      ref={ref}
      onFocus={onFocusWithin}
      className="absolute inset-0"
      style={{ opacity: index === 0 ? 1 : 0, ["--v" as string]: index === 0 ? 1 : 0 }}
    >
      {scene.layout === "split" && (
        <div className="container-x relative flex h-full flex-col justify-between pb-24 pt-[calc(var(--header-h)+2rem)] md:pb-28 md:pt-[calc(var(--header-h)+3rem)]">
          <div>
            <p className="eyebrow mb-4 text-white/55" style={fade(0)}>{scene.kicker}</p>
            <Title className="display uppercase text-[clamp(3rem,10.5vw,10.5rem)]">
              {line(scene.title[0], 0)}
              <span className="sr-only"> </span>
              {line(scene.title[1], 1, "text-right md:-mt-[0.05em] md:pr-[4vw] lg:mt-[22vh] max-md:mt-[38svh] bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent")}
            </Title>
          </div>
          <div className="flex flex-col items-start gap-5 md:flex-row md:items-end md:justify-between">
            <p className="max-w-[30ch] text-[17px] text-white/70" style={fade(1)}>{scene.body}</p>
            {ctas}
          </div>
        </div>
      )}

      {scene.layout === "left" && (
        <div className="container-x flex h-full flex-col justify-end pb-24 md:justify-center md:pb-0">
          <div className="max-w-[560px] space-y-6">
            <p className="eyebrow text-volt-bright" style={fade(0)}>
              {String(index).padStart(2, "0")} — {scene.label}
            </p>
            <Title className="display uppercase text-[clamp(2.6rem,6.4vw,6.25rem)]">
              {scene.title.map((t, i) => line(t, i))}
            </Title>
            <p className="text-[17px] text-white/70 md:text-[19px]" style={fade(0)}>{scene.body}</p>
            {callouts}
            {ctas}
          </div>
        </div>
      )}

      {scene.layout === "center" && (
        <div className="container-x flex h-full flex-col items-center justify-end pb-24 text-center md:pb-28">
          <Title className="display uppercase text-[clamp(2.6rem,6vw,6rem)]">
            {scene.title.map((t, i) => line(t, i))}
          </Title>
          <p className="mb-8 mt-5 text-[17px] text-white/70 md:text-[19px]" style={fade(0)}>{scene.body}</p>
          {ctas}
        </div>
      )}
    </div>
  );
};

/* ── Reduced-motion / low-power version ────────────────────────────────── */

function StaticSequence() {
  return (
    <section aria-label="TEKAURA — your phone, reimagined" className="-mt-[var(--header-h)] bg-ink pt-[var(--header-h)] text-white">
      {cinematicScenes.map((scene, k) => (
        <div key={scene.id} className="container-x grid items-center gap-8 border-b border-white/[0.06] py-16 md:grid-cols-2 md:py-24">
          <div className={cn(k % 2 === 1 && "md:order-2")}>
            <StaticFrame scene={k} />
          </div>
          <div className="space-y-5">
            {scene.kicker && <p className="eyebrow text-white/55">{scene.kicker}</p>}
            {k === 0 ? (
              <h1 className="display uppercase text-[clamp(2.75rem,7vw,6rem)]">{scene.title.join(" ")}</h1>
            ) : (
              <h2 className="display uppercase text-[clamp(2.25rem,5vw,4.5rem)]">{scene.title.join(" ")}</h2>
            )}
            {scene.body && <p className="text-[17px] text-white/70">{scene.body}</p>}
            {scene.callouts && (
              <ul className="flex flex-wrap gap-2">
                {scene.callouts.map((c) => (
                  <li key={c.label}>
                    <Link href={c.href} className="inline-flex min-h-10 items-center rounded-full border border-white/15 px-4 text-[13px] text-white/85 hover:border-white/40">
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              {scene.ctas.map((c) => (
                <Link key={c.label} href={c.href} className={cn("btn", c.variant === "primary" ? "btn-light" : "btn-ghost-light")}>
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

function StaticFrame({ scene }: { scene: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const cfg = cinematicScenes[scene];
  useEffect(() => {
    loadPalette();
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    const rect = cv.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = rect.width * dpr;
    cv.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const poster = cfg.frames ? new FrameSequence(window.innerWidth < 768 ? cfg.frames.mobile : cfg.frames.desktop) : null;
    if (poster) {
      const idx = Math.round((poster.urls.length - 1) * 0.85);
      const img = new Image();
      img.onload = () => drawCover(ctx, img, rect.width, rect.height);
      img.src = poster.urls[idx];
    }
    renderScene(ctx, rect.width, rect.height, computeState(scene, 0.92, false, true), { time: 0, portrait: false, idle: false });
  }, [scene, cfg]);
  return <canvas ref={ref} className="aspect-[4/3] w-full rounded-[28px]" aria-hidden />;
}
