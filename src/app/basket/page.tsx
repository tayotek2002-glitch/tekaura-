"use client";

import Link from "next/link";
import { useBasket } from "@/context/basket";
import { formatGBP } from "@/lib/format";
import { ProductVisual } from "@/components/product/ProductVisual";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { variantLabel } from "@/components/basket/BasketDrawer";

export default function BasketPage() {
  const { lines, subtotal, setQuantity, remove, count } = useBasket();
  return (
    <div className="bg-mist">
      <div className="container-x pb-28 pt-12 md:pt-20">
        <h1 className="display text-[clamp(2.5rem,6vw,4.5rem)]">Basket</h1>
        {lines.length === 0 ? (
          <div className="mt-10 rounded-[28px] bg-white px-6 py-20 text-center">
            <p className="text-[18px] font-medium">Your basket is empty.</p>
            <Link href="/shop" className="btn btn-dark mt-6">Shop all products</Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
            <ul className="divide-y divide-black/[0.06] rounded-[28px] bg-white px-6">
              {lines.map((l) => (
                <li key={l.key} className="flex gap-5 py-6">
                  <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-b from-mist to-cloud">
                    <ProductVisual product={l.product} className="h-full w-full" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-4">
                      <Link href={`/product/${l.product.slug}`} className="font-medium hover:underline">{l.product.title}</Link>
                      <span className="tabular-nums">{formatGBP(l.lineTotal)}</span>
                    </div>
                    <p className="mt-1 text-[13px] text-slate">{variantLabel(l.variant.options)}</p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <QuantityStepper size="sm" value={l.quantity} max={l.maxQuantity} onChange={(n) => setQuantity(l.key, n)} />
                      <button onClick={() => remove(l.key)} className="text-[13px] text-slate hover:text-ink hover:underline">Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <aside className="h-fit rounded-[28px] bg-white p-6 lg:sticky lg:top-[calc(var(--header-h)+24px)]">
              <div className="flex justify-between text-[15px]"><span>Items</span><span>{count}</span></div>
              <div className="mt-3 flex justify-between text-[18px] font-semibold"><span>Subtotal</span><span className="tabular-nums">{formatGBP(subtotal)}</span></div>
              <p className="mt-2 text-[12px] text-slate">Delivery calculated at checkout.</p>
              <Link href="/checkout" className="btn btn-dark mt-6 w-full">Checkout</Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
