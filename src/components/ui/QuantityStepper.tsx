"use client";

import { MinusIcon, PlusIcon } from "@/components/ui/icons";
import { cn } from "@/lib/format";

export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  label = "Quantity",
  size = "md",
  dark,
}: {
  value: number;
  min?: number;
  max: number;
  onChange: (n: number) => void;
  label?: string;
  size?: "sm" | "md";
  dark?: boolean;
}) {
  const h = size === "sm" ? "h-9" : "h-12";
  const w = size === "sm" ? "w-9" : "w-12";
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex items-center rounded-full border", dark ? "border-white/15" : "border-black/10 bg-white", h)}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={cn("flex items-center justify-center rounded-full disabled:opacity-30", h, w)}
      >
        <MinusIcon />
      </button>
      <span aria-live="polite" className="min-w-6 text-center text-[14px] font-medium tabular-nums">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={cn("flex items-center justify-center rounded-full disabled:opacity-30", h, w)}
      >
        <PlusIcon />
      </button>
    </div>
  );
}
