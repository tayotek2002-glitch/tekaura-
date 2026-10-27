"use client";

import { useRef, useState } from "react";
import type { Product } from "@/lib/catalog/types";
import { ProductArt } from "./ProductArt";
import { cn } from "@/lib/format";

export function ProductGallery({ product }: { product: Product }) {
  const images = product.images;
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<"photo" | "spin">("photo");
  const hasSpin = !!product.spin?.frames.length;

  return (
    <div className="lg:sticky lg:top-[calc(var(--header-h)+24px)]">
      <div className="relative aspect-square overflow-hidden rounded-[32px] bg-gradient-to-b from-tile-a to-tile-b ring-1 ring-black/[0.04]">
        {mode === "spin" && hasSpin ? (
          <SpinViewer frames={product.spin!.frames} alt={product.title} />
        ) : images.length ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={images[active].src} alt={images[active].alt} className="h-full w-full bg-white object-contain" />
        ) : (
          <ProductArt art={product.placeholder} className="h-full w-full animate-fade-up p-[14%]" />
        )}
        {(!images.length || images[active]?.isConcept) && mode === "photo" && (
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/80 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-black/45 backdrop-blur">
            Concept illustration — not the final product
          </span>
        )}
        {hasSpin && (
          <div className="absolute right-4 top-4 flex rounded-full bg-white/80 p-1 text-[12px] backdrop-blur">
            {(["photo", "spin"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={cn("rounded-full px-3 py-1.5", mode === m && "bg-ink text-white")}
              >
                {m === "photo" ? "Photos" : "360°"}
              </button>
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1" role="tablist" aria-label="Product images">
          {images.map((img, i) => (
            <button
              key={img.src}
              role="tab"
              aria-selected={i === active}
              aria-label={`Image ${i + 1}`}
              onClick={() => {
                setActive(i);
                setMode("photo");
              }}
              className={cn(
                "h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-2 transition",
                i === active ? "ring-ink" : "ring-transparent opacity-70 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.src} alt="" className="h-full w-full bg-white object-contain" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Drag / swipe / arrow-key product rotation from an ordered frame sequence. */
function SpinViewer({ frames, alt }: { frames: string[]; alt: string }) {
  const [i, setI] = useState(0);
  const start = useRef<{ x: number; i: number } | null>(null);
  const step = (d: number) => setI((v) => (v + d + frames.length) % frames.length);
  return (
    <div
      className="h-full w-full cursor-grab touch-pan-y select-none active:cursor-grabbing"
      tabIndex={0}
      role="slider"
      aria-label={`Rotate ${alt}`}
      aria-valuemin={0}
      aria-valuemax={frames.length - 1}
      aria-valuenow={i}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") step(-1);
        if (e.key === "ArrowRight") step(1);
      }}
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        start.current = { x: e.clientX, i };
      }}
      onPointerMove={(e) => {
        if (!start.current) return;
        const d = Math.round((e.clientX - start.current.x) / 8);
        setI(((start.current.i - d) % frames.length + frames.length) % frames.length);
      }}
      onPointerUp={() => (start.current = null)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={frames[i]} alt={alt} draggable={false} className="pointer-events-none h-full w-full object-contain" />
    </div>
  );
}
