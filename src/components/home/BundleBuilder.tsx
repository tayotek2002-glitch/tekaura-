"use client";

import { useMemo, useState } from "react";
import type { Product, ProductVariant } from "@/lib/catalog/types";
import {
  availableOptionValues,
  getProductsByCategory,
  isVariantPurchasable,
  offeredVariants,
} from "@/lib/catalog";
import { groupModelsByFamily, phoneModelName } from "@/data/phone-models";
import { useBasket } from "@/context/basket";
import { ProductVisual } from "@/components/product/ProductVisual";
import { formatGBP, cn } from "@/lib/format";
import { CheckIcon } from "@/components/ui/icons";

type Pick = { product: Product; selection: Record<string, string> } | null;

interface Step {
  key: "protector" | "case" | "charger" | "cable";
  title: string;
  optional: boolean;
  modelSpecific: boolean;
  products: Product[];
}

function variantFor(product: Product, selection: Record<string, string>, model?: string): ProductVariant | undefined {
  const sel: Record<string, string> = { ...selection, ...(model && product.requiresModel ? { Model: model } : {}) };
  return offeredVariants(product).find((v) => Object.entries(v.options).every(([k, val]) => sel[k] === val));
}

export function BundleBuilder() {
  const { add, open } = useBasket();
  const [model, setModel] = useState("");
  const [picks, setPicks] = useState<Record<Step["key"], Pick>>({ protector: null, case: null, charger: null, cable: null });
  const [message, setMessage] = useState<string | null>(null);

  const steps: Step[] = useMemo(
    () => [
      { key: "protector", title: "Screen protector", optional: false, modelSpecific: true, products: getProductsByCategory("screen-protectors") },
      { key: "case", title: "Phone case", optional: false, modelSpecific: true, products: getProductsByCategory("phone-cases") },
      { key: "charger", title: "Charger", optional: true, modelSpecific: false, products: getProductsByCategory("charging-plugs") },
      { key: "cable", title: "Charging cable", optional: true, modelSpecific: false, products: getProductsByCategory("charging-cables") },
    ],
    [],
  );

  const fitsModel = (p: Product) => !p.requiresModel || (!!model && availableOptionValues(p, "Model").includes(model));

  function choose(step: Step["key"], product: Product) {
    setMessage(null);
    setPicks((prev) => {
      if (prev[step]?.product.id === product.id) return { ...prev, [step]: null };
      const first = offeredVariants(product).find((v) => !product.requiresModel || v.options.Model === model);
      const selection = { ...(first?.options ?? {}) };
      delete selection.Model;
      return { ...prev, [step]: { product, selection } };
    });
  }

  function setOption(step: Step["key"], name: string, value: string) {
    setPicks((prev) => {
      const p = prev[step];
      if (!p) return prev;
      return { ...prev, [step]: { ...p, selection: { ...p.selection, [name]: value } } };
    });
  }

  const lines = steps
    .map((s) => {
      const pick = picks[s.key];
      if (!pick) return null;
      const variant = variantFor(pick.product, pick.selection, model);
      return { step: s, product: pick.product, variant, purchasable: isVariantPurchasable(pick.product, variant) };
    })
    .filter((l): l is NonNullable<typeof l> => !!l);

  const priced = lines.filter((l) => l.purchasable);
  const total = priced.reduce((n, l) => n + (l.variant?.price ?? 0), 0);

  return (
    <section id="build-your-refresh" className="bg-white py-24 md:py-36">
      <div className="container-x">
        <div className="mb-14 max-w-3xl">
          <p className="eyebrow mb-4 text-slate">Build your own phone refresh</p>
          <h2 className="display text-[clamp(2.5rem,6vw,5.5rem)]">Your setup, your way.</h2>
          <p className="mt-5 max-w-[48ch] text-[17px] text-slate">Choose your phone, then pick the protection and power to go with it. Only products confirmed for your model are shown.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <ol className="space-y-4">
            {/* 1. Model */}
            <li className="rounded-[28px] bg-mist p-6 md:p-8">
              <StepHeader n={1} title="Your phone model" done={!!model} />
              <label htmlFor="builder-model" className="sr-only">Phone model</label>
              <select
                id="builder-model"
                value={model}
                onChange={(e) => {
                  setModel(e.target.value);
                  setPicks((p) => ({ ...p, protector: null, case: null }));
                }}
                className="mt-5 h-14 w-full rounded-2xl border border-black/10 bg-white px-4 text-[15px] outline-none focus:border-ink md:max-w-sm"
              >
                <option value="">Select your phone model</option>
                {groupModelsByFamily().map((g) => (
                  <optgroup key={g.family} label={g.family}>
                    {g.models.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </li>

            {steps.map((s, idx) => {
              const list = s.modelSpecific ? s.products.filter(fitsModel) : s.products;
              const locked = s.modelSpecific && !model;
              const pick = picks[s.key];
              return (
                <li key={s.key} className={cn("rounded-[28px] bg-mist p-6 transition-opacity md:p-8", locked && "opacity-60")}>
                  <StepHeader n={idx + 2} title={s.title} optional={s.optional} done={!!pick} />
                  {locked ? (
                    <p className="mt-4 text-[14px] text-slate">Select your phone model first.</p>
                  ) : list.length === 0 ? (
                    <p className="mt-4 text-[14px] text-slate">
                      No {s.title.toLowerCase()}s are confirmed for {phoneModelName(model)} yet.
                    </p>
                  ) : (
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4" role="group" aria-label={s.title}>
                      {list.map((p) => {
                        const selected = pick?.product.id === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => choose(s.key, p)}
                            className={cn(
                              "group relative flex flex-col overflow-hidden rounded-2xl bg-white p-3 text-left ring-2 transition",
                              selected ? "ring-ink" : "ring-transparent hover:ring-black/10",
                            )}
                          >
                            {selected && (
                              <span className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white">
                                <CheckIcon width={14} height={14} />
                              </span>
                            )}
                            <ProductVisual product={p} className="aspect-square w-full rounded-xl transition-transform duration-700 group-hover:scale-105" />
                            <span className="mt-2 text-[13px] font-medium leading-tight">{p.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {pick && (
                    <OptionChips product={pick.product} selection={pick.selection} model={model} onChange={(n, v) => setOption(s.key, n, v)} />
                  )}
                </li>
              );
            })}
          </ol>

          {/* Live basket preview */}
          <aside className="h-fit rounded-[28px] bg-ink p-6 text-white md:p-8 lg:sticky lg:top-[calc(var(--header-h)+24px)]" aria-live="polite">
            <p className="eyebrow text-white/45">Your refresh</p>
            <p className="mt-2 text-[22px] font-semibold tracking-tight">{model ? phoneModelName(model) : "No phone selected"}</p>
            <ul className="mt-6 divide-y divide-white/10 border-y border-white/10">
              {lines.length === 0 && <li className="py-5 text-[14px] text-white/50">Items you choose will appear here.</li>}
              {lines.map((l) => (
                <li key={l.step.key} className="flex justify-between gap-4 py-4 text-[14px]">
                  <span>
                    <span className="block">{l.product.title}</span>
                    {l.variant && Object.keys(l.variant.options).filter((k) => k !== "Model").length > 0 && (
                      <span className="block text-[12px] text-white/45">
                        {Object.entries(l.variant.options).filter(([k]) => k !== "Model").map(([, v]) => v).join(" · ")}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 tabular-nums text-white/80">
                    {l.purchasable ? formatGBP(l.variant!.price!) : l.variant?.price != null ? "Out of stock" : "Price TBC"}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-baseline justify-between">
              <span className="text-[15px] text-white/70">Total</span>
              <span className="text-[26px] font-semibold tabular-nums tracking-tight">{formatGBP(total)}</span>
            </div>
            <p className="mt-1 text-[12px] text-white/40">
              Items are charged at their individual prices.
              {lines.length > priced.length && " Items without a confirmed price can't be added yet."}
            </p>
            <button
              type="button"
              disabled={priced.length === 0}
              onClick={() => {
                let n = 0;
                for (const l of priced) if (add(l.product.id, l.variant!.id, 1)) n++;
                setMessage(`${n} item${n === 1 ? "" : "s"} added to your basket.`);
                if (n) open();
              }}
              className="btn btn-light mt-6 w-full"
            >
              Add {priced.length || ""} to basket
            </button>
            {message && <p className="mt-3 text-center text-[13px] text-white/60">{message}</p>}
          </aside>
        </div>
      </div>
    </section>
  );
}

function StepHeader({ n, title, optional, done }: { n: number; title: string; optional?: boolean; done?: boolean }) {
  return (
    <div className="flex items-center gap-4">
      <span className={cn("flex h-9 w-9 items-center justify-center rounded-full font-mono text-[12px] transition", done ? "bg-ink text-white" : "bg-white text-slate ring-1 ring-black/10")}>
        {done ? <CheckIcon /> : n}
      </span>
      <h3 className="text-[18px] font-semibold tracking-tight">
        {title} {optional && <span className="text-[14px] font-normal text-slate">— optional</span>}
      </h3>
    </div>
  );
}

function OptionChips({ product, selection, model, onChange }: { product: Product; selection: Record<string, string>; model: string; onChange: (name: string, value: string) => void }) {
  const opts = product.options.filter((o) => o.name !== "Model");
  const variants = offeredVariants(product).filter((v) => !product.requiresModel || v.options.Model === model);
  if (!opts.length || !variants.length) return null;
  return (
    <div className="mt-5 flex flex-wrap gap-6 border-t border-black/[0.06] pt-5">
      {opts.map((o) => {
        const values = o.values.filter((v) => variants.some((x) => x.options[o.name] === v));
        if (!values.length) return null;
        return (
          <div key={o.name} role="radiogroup" aria-label={`${product.title} ${o.name}`}>
            <p className="mb-2 text-[12px] text-slate">{o.name}</p>
            <div className="flex flex-wrap gap-2">
              {values.map((v) => (
                <button key={v} type="button" role="radio" aria-checked={selection[o.name] === v} onClick={() => onChange(o.name, v)} className="chip !min-h-9 !px-3 text-[13px]">
                  {v}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
