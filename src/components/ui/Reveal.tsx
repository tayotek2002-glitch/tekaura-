"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/format";

/** Fades + lifts children into view once. Content is visible without JS. */
export function Reveal({ children, className, delay = 0, as: Tag = "div" }: { children: React.ReactNode; className?: string; delay?: number; as?: "div" | "li" | "section" }) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<"idle" | "hidden" | "shown">("idle");
  useEffect(() => {
    const el = ref.current!;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.95) return setState("shown");
    setState("hidden");
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setState("shown");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref as never}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-[opacity,transform] duration-[1100ms] ease-[var(--ease-out-expo)]",
        state === "hidden" && "translate-y-8 opacity-0",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
