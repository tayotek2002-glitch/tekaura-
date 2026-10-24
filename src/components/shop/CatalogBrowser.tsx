"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { CategorySlug, FacetDefinition } from "@/lib/catalog/types";
import {
  collectFacetOptions,
  facetValues,
  getCategories,
  getCategory,
  getProducts,
  isProductPurchasable,
  sortOptions,
  sortProducts,
  type SortKey,
} from "@/lib/catalog";
import { ProductGrid } from "@/components/product/ProductCard";
import { CloseIcon, FilterIcon } from "@/components/ui/icons";
import { phoneModelName } from "@/data/phone-models";
import { cn } from "@/lib/format";

const AVAILABILITY: FacetDefinition = { key: "__availability", label: "Availability", source: "attribute" };

export function CatalogBrowser({ category }: { category?: CategorySlug }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const cat = category ? getCategory(category) : undefined;
  const baseProducts = useMemo(() => (category ? getProducts().filter((p) => p.category === category) : getProducts()), [category]);

  const sub = params.get("sub");
  const catFilter = !category ? params.get("category") : null;
  const sort = (params.get("sort") as SortKey) || "featured";
  const facets = useMemo(() => [...(cat?.facets ?? []), AVAILABILITY], [cat]);

  const active: Record<string, string[]> = {};
  for (const f of facets) {
    const v = params.getAll(f.key);
    if (v.length) active[f.key] = v;
  }

  const valuesFor = (p: (typeof baseProducts)[number], f: FacetDefinition) =>
    f.key === AVAILABILITY.key ? [isProductPurchasable(p) ? "Available now" : "Coming soon"] : facetValues(p, f);

  const scoped = baseProducts.filter((p) => (!sub || p.subcategory === sub) && (!catFilter || p.category === catFilter));
  const filtered = scoped.filter((p) =>
    Object.entries(active).every(([key, vals]) => {
      const f = facets.find((x) => x.key === key)!;
      const pv = valuesFor(p, f);
      return vals.some((v) => pv.includes(v));
    }),
  );
  const results = sortProducts(filtered, sort);

  function update(mut: (p: URLSearchParams) => void) {
    const next = new URLSearchParams(params.toString());
    mut(next);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function toggle(key: string, value: string) {
    update((p) => {
      const cur = p.getAll(key);
      p.delete(key);
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      next.forEach((v) => p.append(key, v));
    });
  }

  const activeCount = Object.values(active).reduce((n, v) => n + v.length, 0);

  const facetPanel = (
    <div className="space-y-8">
      {facets.map((f) => {
        const opts =
          f.key === AVAILABILITY.key
            ? (["Available now", "Coming soon"] as const).map((value) => ({
                value,
                count: scoped.filter((p) => valuesFor(p, f).includes(value)).length,
              }))
            : collectFacetOptions(scoped, f);
        return (
          <fieldset key={f.key}>
            <legend className="mb-3 text-[13px] font-medium">{f.label}</legend>
            {opts.length === 0 ? (
              <p className="text-[13px] text-slate">Available once products are configured.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {opts.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    aria-pressed={active[f.key]?.includes(o.value) ?? false}
                    onClick={() => toggle(f.key, o.value)}
                    className="chip !min-h-9 !px-3 text-[13px]"
                  >
                    {f.key === "Model" ? phoneModelName(o.value) : o.value}
                    <span className="opacity-50">{o.count}</span>
                  </button>
                ))}
              </div>
            )}
          </fieldset>
        );
      })}
      {activeCount > 0 && (
        <button
          type="button"
          className="text-[13px] text-slate underline underline-offset-4 hover:text-ink"
          onClick={() => update((p) => facets.forEach((f) => p.delete(f.key)))}
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  // collection chips: subcategories on a category page, categories on Shop All
  const chips = cat
    ? cat.subcategories.map((s) => ({ key: s.slug, label: s.name, count: baseProducts.filter((p) => p.subcategory === s.slug).length }))
    : getCategories().map((c) => ({ key: c.slug, label: c.name, count: baseProducts.filter((p) => p.category === c.slug).length }));
  const chipParam = cat ? "sub" : "category";
  const chipValue = cat ? sub : catFilter;

  return (
    <div className="container-x pb-28">
      {chips.length > 0 && (
        <div className="-mx-[clamp(1.25rem,4vw,3.5rem)] mb-8 overflow-x-auto px-[clamp(1.25rem,4vw,3.5rem)] [scrollbar-width:none]">
          <div className="flex w-max gap-2" role="group" aria-label="Collections">
            <button type="button" className="chip" aria-pressed={!chipValue} onClick={() => update((p) => p.delete(chipParam))}>
              All
            </button>
            {chips.map((c) => (
              <button
                key={c.key}
                type="button"
                className="chip"
                aria-pressed={chipValue === c.key}
                onClick={() => update((p) => p.set(chipParam, c.key))}
              >
                {c.label}
                <span className="opacity-50">{c.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between gap-4 border-b border-black/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setFiltersOpen(true)} className="chip lg:hidden" aria-haspopup="dialog">
            <FilterIcon /> Filters {activeCount > 0 && <span className="rounded-full bg-volt px-1.5 text-[11px] text-white">{activeCount}</span>}
          </button>
          <p className="text-[14px] text-slate" aria-live="polite">
            {results.length} product{results.length === 1 ? "" : "s"}
          </p>
        </div>
        <label className="flex items-center gap-2 text-[14px]">
          <span className="hidden text-slate sm:inline">Sort by</span>
          <select
            value={sort}
            onChange={(e) => update((p) => (e.target.value === "featured" ? p.delete("sort") : p.set("sort", e.target.value)))}
            className="h-10 rounded-full border border-black/10 bg-white px-4 text-[14px] outline-none focus:border-ink"
          >
            {sortOptions.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-[calc(var(--header-h)+24px)]">{facetPanel}</div>
        </aside>
        <div>
          <ProductGrid products={results} emptyText={activeCount || chipValue ? "No products match these filters yet." : undefined} />
          {cat?.futureCollections && (
            <p className="mt-10 text-[13px] text-slate">
              Coming later: {cat.futureCollections.join(" · ")}
            </p>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[75] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button aria-label="Close filters" className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] animate-fade-up overflow-y-auto rounded-t-[28px] bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-[18px] font-semibold">Filters</h2>
              <button onClick={() => setFiltersOpen(false)} aria-label="Close filters" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-mist">
                <CloseIcon />
              </button>
            </div>
            {facetPanel}
            <button onClick={() => setFiltersOpen(false)} className={cn("btn btn-dark mt-8 w-full")}>
              Show {results.length} product{results.length === 1 ? "" : "s"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function CategoryLinks() {
  return (
    <div className="flex flex-wrap gap-2">
      {getCategories().map((c) => (
        <Link key={c.slug} href={`/shop/${c.slug}`} className="chip">
          {c.name}
        </Link>
      ))}
    </div>
  );
}
