"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/catalog/types";
import {
  availableOptionValues,
  findVariant,
  isVariantPurchasable,
  offeredVariants,
  priceFrom,
  variantAvailability,
} from "@/lib/catalog";
import { groupModelsByFamily, phoneModelName } from "@/data/phone-models";
import { useBasket } from "@/context/basket";
import { formatGBP, cn } from "@/lib/format";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { CheckIcon } from "@/components/ui/icons";

export function PurchasePanel({ product }: { product: Product }) {
  const { add, open } = useBasket();
  const offered = offeredVariants(product);
  const configured = offered.length > 0;
  const optionNames = product.options.map((o) => o.name);

  const [selection, setSelection] = useState<Record<string, string>>(() => {
    const first = offered[0];
    if (!first) return {};
    const s = { ...first.options };
    if (product.requiresModel) delete s.Model; // shopper must choose their model
    return s;
  });
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = useMemo(() => {
    const allChosen = Object.keys(offered[0]?.options ?? {}).every((k) => selection[k]);
    return allChosen ? findVariant(product, selection) : undefined;
  }, [product, selection, offered]);

  const availability = variantAvailability(product, variant);
  const purchasable = isVariantPurchasable(product, variant);
  const range = priceFrom(product);
  const maxQty = Math.max(1, Math.min(10, variant?.stock ?? 1));

  function choose(name: string, value: string) {
    setAdded(false);
    setQty(1);
    setSelection((prev) => {
      const next = { ...prev, [name]: value };
      if (findVariant(product, next)) return next;
      // keep the new choice, then fill the remaining options from the first matching variant
      const fallback = offered.find((v) => v.options[name] === value);
      if (!fallback) return next;
      const filled = { ...fallback.options };
      if (product.requiresModel && name !== "Model") filled.Model = prev.Model ?? filled.Model;
      return findVariant(product, filled) ? filled : { ...fallback.options };
    });
  }

  function isValueSelectable(name: string, value: string) {
    // value is selectable if some offered variant matches it together with the other current choices
    return offered.some(
      (v) =>
        v.options[name] === value &&
        Object.entries(selection).every(([k, val]) => k === name || v.options[k] === undefined || v.options[k] === val),
    );
  }

  return (
    <div>
      <div className="flex items-baseline gap-3">
        {variant?.price != null ? (
          <span className="text-[26px] font-semibold tabular-nums tracking-tight">{formatGBP(variant.price)}</span>
        ) : range ? (
          <span className="text-[26px] font-semibold tabular-nums tracking-tight">
            {range.min !== range.max && <span className="text-[16px] font-normal text-slate">From </span>}
            {formatGBP(range.min)}
          </span>
        ) : (
          <span className="text-[18px] text-slate">Price to be confirmed</span>
        )}
      </div>

      {!configured && (
        <div className="mt-6 rounded-2xl bg-white p-5 text-[14px] leading-relaxed text-slate ring-1 ring-black/[0.06]">
          <p className="font-medium text-ink">This product is being prepared.</p>
          <p className="mt-1">
            {product.requiresModel
              ? "Compatible phone models, options and prices will appear here once they have been confirmed for this product."
              : "Options, pricing and availability will appear here once confirmed."}
          </p>
        </div>
      )}

      {/* Options */}
      <div className="mt-8 space-y-7">
        {product.options.map((opt) => {
          const values = configured ? availableOptionValues(product, opt.name) : opt.values;
          if (opt.name === "Model") {
            const models = configured ? values : [];
            return (
              <div key={opt.name}>
                <label htmlFor={`opt-model-${product.id}`} className="mb-3 flex justify-between text-[14px] font-medium">
                  Phone model
                  {selection.Model && <span className="font-normal text-slate">{phoneModelName(selection.Model)}</span>}
                </label>
                <div className="relative">
                  <select
                    id={`opt-model-${product.id}`}
                    value={selection.Model ?? ""}
                    disabled={!models.length}
                    onChange={(e) => choose("Model", e.target.value)}
                    className="h-14 w-full appearance-none rounded-2xl border border-black/10 bg-white px-4 pr-10 text-[15px] outline-none transition focus:border-ink disabled:cursor-not-allowed disabled:bg-mist disabled:text-slate"
                  >
                    <option value="" disabled>
                      {models.length ? "Select your phone model" : "Compatible models to be confirmed"}
                    </option>
                    {groupModelsByFamily(models).map((g) => (
                      <optgroup key={g.family} label={g.family}>
                        {g.models.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <span aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate">▾</span>
                </div>
                {models.length > 0 && (
                  <p className="mt-2 text-[12px] text-slate">Only models confirmed for this exact product are listed.</p>
                )}
              </div>
            );
          }
          if (!values.length) return null;
          return (
            <fieldset key={opt.name}>
              <legend className="mb-3 flex w-full justify-between text-[14px] font-medium">
                {opt.name}
                {!configured && <span className="font-normal text-slate">Being configured</span>}
              </legend>
              <div role="radiogroup" aria-label={opt.name} className="flex flex-wrap gap-2">
                {values.map((v) => {
                  const checked = selection[opt.name] === v;
                  const selectable = configured && isValueSelectable(opt.name, v);
                  return (
                    <button
                      key={v}
                      type="button"
                      role="radio"
                      aria-checked={checked}
                      disabled={!configured}
                      onClick={() => choose(opt.name, v)}
                      className={cn("chip min-w-[72px] justify-center", !selectable && configured && !checked && "opacity-50", !configured && "cursor-not-allowed opacity-50")}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          );
        })}
      </div>

      {/* Availability */}
      <div className="mt-8 flex items-center gap-2 text-[14px]" aria-live="polite">
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            availability === "in_stock" && "bg-emerald-500",
            availability === "low_stock" && "bg-amber-500",
            availability === "out_of_stock" && "bg-rose-500",
            availability === "unavailable" && "bg-black/20",
          )}
        />
        {availability === "in_stock" && "In stock"}
        {availability === "low_stock" && `Low stock — ${variant?.stock} left`}
        {availability === "out_of_stock" && "Out of stock"}
        {availability === "unavailable" &&
          (configured && optionNames.some((n) => !selection[n]) && product.requiresModel && !selection.Model
            ? "Select your phone model to check availability"
            : product.bundle && !product.bundle.configured
              ? "This bundle is not yet available"
              : "Not yet available to buy")}
      </div>

      {/* Add to basket */}
      <div className="mt-5 flex gap-3">
        <QuantityStepper value={qty} max={maxQty} onChange={setQty} />
        <button
          type="button"
          disabled={!purchasable}
          onClick={() => {
            if (variant && add(product.id, variant.id, qty)) {
              setAdded(true);
              open();
            }
          }}
          className="btn btn-dark flex-1"
        >
          {added ? (
            <>
              <CheckIcon /> Added
            </>
          ) : purchasable ? (
            "Add to Basket"
          ) : availability === "out_of_stock" ? (
            "Out of stock"
          ) : (
            "Not yet available"
          )}
        </button>
      </div>
    </div>
  );
}
