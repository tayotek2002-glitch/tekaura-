import type { Product } from "@/lib/catalog/types";

/**
 * DEMO MODE — for development and QA only.
 *
 * Enabled ONLY when NEXT_PUBLIC_TEKAURA_DEMO=1. It fills the catalogue with
 * clearly-labelled SAMPLE prices, stock and model compatibility so the basket,
 * variant selectors and bundle builder can be tested end-to-end before real
 * product data exists. A banner is shown site-wide while it is on.
 *
 * Never enable this in production. None of these values are real.
 */
export const DEMO_MODE = process.env.NEXT_PUBLIC_TEKAURA_DEMO === "1";

const SAMPLE_PRICES = [499, 799, 999, 1299, 1499, 1999, 2499];
const SAMPLE_MODELS = [
  ["iphone-13", "iphone-13-pro", "iphone-14", "iphone-15", "iphone-15-pro", "iphone-16", "iphone-16-pro", "iphone-17", "iphone-17-pro"],
  ["iphone-14-pro", "iphone-14-pro-max", "iphone-15-pro-max", "iphone-16-pro-max", "iphone-17-pro-max"],
  ["iphone-12", "iphone-13", "iphone-14", "iphone-15", "iphone-16", "iphone-16e", "iphone-17", "iphone-air"],
];

function hash(s: string): number {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export function applyDemoData(products: Product[]): Product[] {
  return products.map((p) => {
    const h = hash(p.id);
    const basePrice = SAMPLE_PRICES[h % SAMPLE_PRICES.length];
    const copy: Product = structuredClone(p);
    copy.status = "active";

    const modelOpt = copy.options.find((o) => o.name === "Model");
    if (modelOpt && copy.variants.length === 0) {
      modelOpt.values = SAMPLE_MODELS[h % SAMPLE_MODELS.length];
      const other = copy.options.filter((o) => o.name !== "Model");
      let rows: Record<string, string>[] = modelOpt.values.map((m) => ({ Model: m }));
      for (const o of other) rows = rows.flatMap((r) => o.values.map((v) => ({ ...r, [o.name]: v })));
      copy.variants = rows.map((options, i) => ({
        id: `${p.id}-demo-${i}`,
        options,
        offered: true,
        price: basePrice + (options.Pack === "Pack of 2" ? 500 : options.Pack === "Pack of 3" ? 900 : 0),
        stock: (h + i) % 7 === 0 ? 0 : 12,
      }));
    } else {
      copy.variants = copy.variants.map((v, i) => ({
        ...v,
        price: basePrice + (v.options.Length === "2 m" ? 200 : v.options.Length === "3 m" ? 400 : 0) + (v.options.Finish === "Braided" ? 300 : 0),
        stock: (h + i) % 9 === 0 ? 0 : 25,
      }));
      // demonstrate "only offered combinations are shown"
      if (p.id === "cable-a-l") copy.variants.forEach((v) => v.options.Length === "3 m" && (v.offered = false));
    }
    if (copy.bundle) copy.bundle.configured = false; // bundles stay unconfigured even in demo
    return copy;
  });
}
