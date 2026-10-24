"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useBasket } from "@/context/basket";
import { formatGBP } from "@/lib/format";
import { ProductArt } from "@/components/product/ProductArt";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { BagIcon, CloseIcon } from "@/components/ui/icons";
import { phoneModelName } from "@/data/phone-models";

export function variantLabel(options: Record<string, string>): string {
  return Object.entries(options)
    .map(([k, v]) => (k === "Model" ? phoneModelName(v) : v))
    .join(" · ");
}

export function BasketDrawer() {
  const { isOpen, close, lines, subtotal, setQuantity, remove, count } = useBasket();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-labelledby="basket-title">
      <button aria-label="Close basket" className="absolute inset-0 animate-[fade-up_0.4s_both] bg-black/50 backdrop-blur-[2px]" onClick={close} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-[440px] animate-drawer-in flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-5">
          <h2 id="basket-title" className="text-[18px] font-semibold tracking-tight">
            Your basket {count > 0 && <span className="font-normal text-slate">({count})</span>}
          </h2>
          <button ref={closeRef} onClick={close} aria-label="Close basket" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-mist">
            <CloseIcon />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-mist text-slate">
              <BagIcon width={26} height={26} />
            </span>
            <p className="text-[18px] font-medium tracking-tight">Your basket is empty</p>
            <p className="mt-2 max-w-[28ch] text-[14px] text-slate">Protection, power and style — start with what your phone needs most.</p>
            <Link href="/shop" onClick={close} className="btn btn-dark mt-7">
              Shop all products
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-black/[0.06] overflow-y-auto overscroll-contain px-6">
              {lines.map((l) => (
                <li key={l.key} className="flex gap-4 py-5">
                  <Link href={`/product/${l.product.slug}`} onClick={close} className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-b from-mist to-cloud">
                    {l.product.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={l.product.images[0].src} alt={l.product.images[0].alt} className="h-full w-full object-cover" />
                    ) : (
                      <ProductArt art={l.product.placeholder} className="h-full w-full" />
                    )}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <Link href={`/product/${l.product.slug}`} onClick={close} className="text-[15px] font-medium leading-snug hover:underline">
                        {l.product.title}
                      </Link>
                      <span className="text-[15px] tabular-nums">{formatGBP(l.lineTotal)}</span>
                    </div>
                    {Object.keys(l.variant.options).length > 0 && (
                      <p className="mt-1 text-[13px] text-slate">{variantLabel(l.variant.options)}</p>
                    )}
                    {l.quantity > 1 && <p className="text-[12px] text-slate">{formatGBP(l.unitPrice)} each</p>}
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <QuantityStepper size="sm" value={l.quantity} max={l.maxQuantity} onChange={(n) => setQuantity(l.key, n)} label={`Quantity for ${l.product.title}`} />
                      <button onClick={() => remove(l.key)} className="text-[13px] text-slate underline-offset-4 hover:text-ink hover:underline">
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-black/[0.06] bg-mist/60 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5">
              <div className="flex items-baseline justify-between">
                <span className="text-[15px]">Subtotal</span>
                <span className="text-[20px] font-semibold tabular-nums tracking-tight">{formatGBP(subtotal)}</span>
              </div>
              <p className="mt-1 text-[12px] text-slate">Delivery calculated at checkout. Prices include VAT where applicable.</p>
              <Link href="/checkout" onClick={close} className="btn btn-dark mt-5 w-full">
                Checkout
              </Link>
              <Link href="/basket" onClick={close} className="mt-3 block text-center text-[13px] text-slate hover:text-ink">
                View full basket
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
