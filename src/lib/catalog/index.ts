import { activeSource } from "./source";
import type { Category, CategorySlug, FacetDefinition, Product, ProductVariant } from "./types";

export * from "./types";

let productCache: Product[] | null = null;

export function getProducts(): Product[] {
  if (!productCache) productCache = activeSource.getProducts();
  return productCache;
}

export function getCategories(): Category[] {
  return activeSource.getCategories();
}

export function getCategory(slug: string): Category | undefined {
  return getCategories().find((c) => c.slug === slug);
}

export function getProductBySlug(slug: string): Product | undefined {
  return getProducts().find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return getProducts().find((p) => p.id === id);
}

export function getProductsByCategory(slug: CategorySlug): Product[] {
  return getProducts().filter((p) => p.category === slug);
}

export function getFeaturedProducts(): Product[] {
  return getProducts().filter((p) => p.featured);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const explicit = (product.relatedProductIds ?? [])
    .map(getProductById)
    .filter((p): p is Product => !!p);
  const sameCat = getProducts().filter(
    (p) => p.category === product.category && p.id !== product.id && !explicit.includes(p),
  );
  return [...explicit, ...sameCat].slice(0, limit);
}

/* ── Variants & availability ─────────────────────────────────────────────── */

export function offeredVariants(product: Product): ProductVariant[] {
  return product.variants.filter((v) => v.offered);
}

export function isVariantPurchasable(product: Product, variant: ProductVariant | undefined): boolean {
  if (!variant) return false;
  if (product.status !== "active") return false;
  if (product.bundle && !product.bundle.configured) return false;
  return variant.offered && variant.price !== null && variant.stock !== null && variant.stock > 0;
}

export type Availability = "in_stock" | "low_stock" | "out_of_stock" | "unavailable";

export function variantAvailability(product: Product, variant: ProductVariant | undefined): Availability {
  if (!variant || product.status !== "active" || variant.price === null || variant.stock === null) return "unavailable";
  if (product.bundle && !product.bundle.configured) return "unavailable";
  if (variant.stock <= 0) return "out_of_stock";
  if (variant.stock <= 5) return "low_stock";
  return "in_stock";
}

/** Lowest configured price across offered variants (pence), or null. */
export function priceFrom(product: Product): { min: number; max: number } | null {
  const prices = offeredVariants(product)
    .map((v) => v.price)
    .filter((p): p is number => p !== null);
  if (!prices.length) return null;
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function isProductPurchasable(product: Product): boolean {
  return offeredVariants(product).some((v) => isVariantPurchasable(product, v));
}

/** Option values actually used by offered variants (what the shopper may choose). */
export function availableOptionValues(product: Product, optionName: string): string[] {
  const opt = product.options.find((o) => o.name === optionName);
  const used = new Set(offeredVariants(product).map((v) => v.options[optionName]).filter(Boolean));
  const ordered = (opt?.values ?? []).filter((v) => used.has(v));
  for (const v of used) if (!ordered.includes(v)) ordered.push(v);
  return ordered;
}

export function findVariant(product: Product, selection: Record<string, string>): ProductVariant | undefined {
  return offeredVariants(product).find((v) =>
    Object.entries(v.options).every(([name, value]) => selection[name] === value),
  );
}

export function compatibleModels(product: Product): string[] {
  return availableOptionValues(product, "Model");
}

/* ── Facets, filtering, sorting, search ──────────────────────────────────── */

export function facetValues(product: Product, facet: FacetDefinition): string[] {
  if (facet.source === "option") return availableOptionValues(product, facet.key);
  const raw = product.attributes[facet.key];
  if (raw === undefined || raw === null || raw === "") return [];
  return Array.isArray(raw) ? raw.map(String) : [String(raw)];
}

export function collectFacetOptions(products: Product[], facet: FacetDefinition): { value: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of products) for (const v of new Set(facetValues(p, facet))) counts.set(v, (counts.get(v) ?? 0) + 1);
  const values = [...counts.keys()];
  const order = facet.order ?? [];
  values.sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    return a.localeCompare(b, "en", { numeric: true });
  });
  return values.map((value) => ({ value, count: counts.get(value)! }));
}

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "name";

export const sortOptions: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "name", label: "Name A–Z" },
];

export function sortProducts(products: Product[], key: SortKey): Product[] {
  const list = [...products];
  const price = (p: Product) => priceFrom(p)?.min ?? null;
  switch (key) {
    case "featured":
      return list.sort((a, b) => Number(b.featured) - Number(a.featured));
    case "newest":
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "name":
      return list.sort((a, b) => a.title.localeCompare(b.title));
    case "price-asc":
    case "price-desc": {
      const dir = key === "price-asc" ? 1 : -1;
      // products without a configured price always sort last
      return list.sort((a, b) => {
        const pa = price(a);
        const pb = price(b);
        if (pa === null && pb === null) return 0;
        if (pa === null) return 1;
        if (pb === null) return -1;
        return (pa - pb) * dir;
      });
    }
  }
}

export function searchProducts(query: string, products: Product[] = getProducts()): Product[] {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const cats = new Map(getCategories().map((c) => [c.slug, c]));
  const scored = products
    .map((p) => {
      const cat = cats.get(p.category);
      const sub = cat?.subcategories.find((s) => s.slug === p.subcategory);
      const hay = [p.title, cat?.name, sub?.name, ...p.tags, p.description ?? ""].join(" ").toLowerCase();
      const title = p.title.toLowerCase();
      let score = 0;
      for (const t of terms) {
        if (!hay.includes(t)) return null;
        score += title.includes(t) ? 3 : 1;
      }
      return { p, score };
    })
    .filter((x): x is { p: Product; score: number } => !!x);
  return scored.sort((a, b) => b.score - a.score).map((x) => x.p);
}
