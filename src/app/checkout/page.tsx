"use client";

import Link from "next/link";
import { useState } from "react";
import { useBasket } from "@/context/basket";
import { checkoutProvider } from "@/lib/commerce/checkout";
import { formatGBP } from "@/lib/format";

/**
 * Checkout hand-off page. This site never collects card details: once a
 * provider is configured in src/lib/commerce/checkout.ts, the button below
 * redirects to that provider's hosted checkout.
 */
export default function CheckoutPage() {
  const { lines, subtotal } = useBasket();
  const [message, setMessage] = useState<string | null>(null);

  async function begin() {
    const res = await checkoutProvider.beginCheckout(
      lines.map((l) => ({ productId: l.productId, variantId: l.variantId, quantity: l.quantity })),
    );
    if (res.status === "redirect") window.location.href = res.url;
    else setMessage(res.reason);
  }

  return (
    <div className="bg-mist">
      <div className="container-x max-w-3xl pb-28 pt-12 md:pt-20">
        <h1 className="display text-[clamp(2.5rem,6vw,4.5rem)]">Checkout</h1>
        <div className="mt-10 rounded-[28px] bg-white p-8">
          {!checkoutProvider.configured && (
            <div className="mb-6 rounded-2xl bg-amber-50 p-5 text-[14px] text-amber-900 ring-1 ring-amber-200">
              <p className="font-medium">Checkout is not yet available.</p>
              <p className="mt-1">Online payment hasn&apos;t been set up yet, so orders can&apos;t be placed. No payment details are collected on this site.</p>
            </div>
          )}
          {lines.length === 0 ? (
            <p className="text-slate">Your basket is empty. <Link href="/shop" className="underline">Continue shopping</Link></p>
          ) : (
            <>
              <ul className="divide-y divide-black/[0.06]">
                {lines.map((l) => (
                  <li key={l.key} className="flex justify-between py-3 text-[15px]">
                    <span>{l.product.title} <span className="text-slate">× {l.quantity}</span></span>
                    <span className="tabular-nums">{formatGBP(l.lineTotal)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between border-t border-black/[0.08] pt-4 text-[18px] font-semibold">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatGBP(subtotal)}</span>
              </div>
              <button onClick={begin} disabled={!checkoutProvider.configured} className="btn btn-dark mt-8 w-full">
                Continue to secure payment
              </button>
              {message && <p role="status" className="mt-4 text-[14px] text-slate">{message}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
