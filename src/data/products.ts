import type { Product, ProductVariant } from "@/lib/catalog/types";
import { productImages } from "./product-images";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  TEKAURA PRODUCT CATALOGUE — SEED DATA (phase one)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Every product below is a STRUCTURAL PLACEHOLDER. No prices, stock levels,
 *  specifications or model compatibility have been invented:
 *
 *    price: null          → shows "Price to be confirmed"
 *    stock: null          → treated as unavailable
 *    status: "coming_soon"→ visible, cannot be purchased
 *    specifications: []   → only `verified: true` specs are ever displayed
 *
 *  TO MAKE A PRODUCT PURCHASABLE
 *    1. set `status: "active"`
 *    2. give at least one variant `offered: true`, a `price` (in pence) and `stock > 0`
 *    3. add real `images` (put files in /public/products/...) — set `isConcept: false`
 *
 *  PHONE-MODEL COMPATIBILITY (protectors, cases, model-specific bundles)
 *    Compatibility is configured PER PRODUCT through the "Model" option.
 *    Add each compatible model id (see src/data/phone-models.ts) to the
 *    Model option values, then add a variant for every Model × other-option
 *    combination you actually sell. Example:
 *
 *      options: [
 *        { name: "Model", values: ["iphone-15", "iphone-15-pro"] },
 *        { name: "Pack",  values: ["Single", "Pack of 2"] },
 *      ],
 *      variants: [
 *        { id: "cp-15-1", options: { Model: "iphone-15", Pack: "Single" }, offered: true, price: 999, stock: 40 },
 *        ...
 *      ]
 * ─────────────────────────────────────────────────────────────────────────────
 */

const SEED_DATE = "2026-10-24";

/** One unpriced, unstocked default variant for products without options. */
function defaultVariant(id: string): ProductVariant[] {
  return [{ id: `${id}-default`, options: {}, offered: true, price: null, stock: null }];
}

/** Cartesian product helper for seeding option combinations. Prices/stock stay null. */
function combos(id: string, axes: Record<string, string[]>): ProductVariant[] {
  const keys = Object.keys(axes);
  let rows: Record<string, string>[] = [{}];
  for (const k of keys) rows = rows.flatMap((r) => axes[k].map((v) => ({ ...r, [k]: v })));
  return rows.map((options) => ({
    id: `${id}-${Object.values(options).join("-").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    options,
    offered: true,
    price: null,
    stock: null,
  }));
}

const base = {
  images: [],
  specifications: [],
  status: "coming_soon" as const,
  featured: false,
  description: null,
  createdAt: SEED_DATE,
};

/* ── A. Charging plugs ─────────────────────────────────────────────────────── */
// `chargingType` (standard / fast / gan) and `wattage` are left for you to fill in
// once verified. Set `subcategory` to "standard" | "fast" | "gan" to place a plug
// in that collection, and add `wattage: "20 W"` (verified only) to enable the filter.
const plugDefs: [string, string, number, number][] = [
  ["plug-1a", "Single USB-A Plug", 1, 0],
  ["plug-2a", "Dual USB-A Plug", 2, 0],
  ["plug-1c", "Single USB-C Plug", 0, 1],
  ["plug-2c", "Dual USB-C Plug", 0, 2],
  ["plug-1a1c", "USB-A + USB-C Dual Plug", 1, 1],
  ["plug-2a1c", "Dual USB-A + USB-C Plug", 2, 1],
  ["plug-1a2c", "USB-A + Dual USB-C Plug", 1, 2],
  ["plug-3c", "Triple USB-C Plug", 0, 3],
  ["plug-2a2c", "Dual USB-A + Dual USB-C Plug", 2, 2],
  ["plug-1a3c", "Triple USB-C + USB-A Plug", 1, 3],
];

const plugs: Product[] = plugDefs.map(([id, title, a, c], i) => {
  const ports = a + c;
  const connectors = [...(a ? ["USB-A"] : []), ...(c ? ["USB-C"] : [])];
  return {
    ...base,
    id,
    slug: title.toLowerCase().replace(/\+/g, "plus").replace(/[^a-z0-9]+/g, "-").replace(/-$/, ""),
    title,
    category: "charging-plugs",
    placeholder: { kind: "plug", usbA: a, usbC: c },
    options: [],
    variants: defaultVariant(id),
    requiresModel: false,
    attributes: { connectors, ports: `${ports} port${ports > 1 ? "s" : ""}` },
    featured: i === 4 || i === 7,
    tags: ["plug", "charger", "wall", "uk", ...connectors.map((x) => x.toLowerCase())],
    relatedProductIds: ["cable-c-c", "cable-a-c"],
  };
});

/* ── B. Charging cables ────────────────────────────────────────────────────── */
// Lengths and finishes are seeded as offered combinations. Set `offered: false`
// on any combination you don't sell; it disappears from the storefront.
// To add colours: add { name: "Colour", values: [...] } and include Colour in each variant.
const cableDefs: [string, string, string, "USB-A" | "USB-C", "Lightning" | "USB-C"][] = [
  ["cable-a-l", "USB-A to Lightning Cable", "usb-a-to-lightning", "USB-A", "Lightning"],
  ["cable-a-c", "USB-A to USB-C Cable", "usb-a-to-usb-c", "USB-A", "USB-C"],
  ["cable-c-l", "USB-C to Lightning Cable", "usb-c-to-lightning", "USB-C", "Lightning"],
  ["cable-c-c", "USB-C to USB-C Cable", "usb-c-to-usb-c", "USB-C", "USB-C"],
];

const cables: Product[] = cableDefs.map(([id, title, sub, from, to], i) => ({
  ...base,
  id,
  slug: sub + "-cable",
  title,
  category: "charging-cables",
  subcategory: sub,
  placeholder: { kind: "cable", from, to, braided: i % 2 === 1 },
  options: [
    { name: "Length", values: ["1 m", "2 m", "3 m"] },
    { name: "Finish", values: ["Standard", "Braided"] },
  ],
  variants: combos(id, { Length: ["1 m", "2 m", "3 m"], Finish: ["Standard", "Braided"] }),
  requiresModel: false,
  attributes: { connectors: [from, to] },
  featured: i === 3,
  tags: ["cable", "charging", from.toLowerCase(), to.toLowerCase()],
  relatedProductIds: ["plug-1c", "plug-2c"],
}));

/* ── C. Screen protectors ──────────────────────────────────────────────────── */
const protectorDefs: [string, string, string, Extract<Product["placeholder"], { kind: "protector" }>["variant"]][] = [
  ["sp-clear", "Clear Screen Protector", "clear", "clear"],
  ["sp-privacy", "Privacy Screen Protector", "privacy", "privacy"],
  ["sp-9h", "9H Tempered Glass Screen Protector", "tempered-9h", "tempered"],
  ["sp-magic-clear", "Magic Self-Installation Clear Protector", "magic-clear", "magic-clear"],
  ["sp-magic-privacy", "Magic Self-Installation Privacy Protector", "magic-privacy", "magic-privacy"],
];

const protectors: Product[] = protectorDefs.map(([id, title, sub, art], i) => ({
  ...base,
  id,
  slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  title,
  category: "screen-protectors",
  subcategory: sub,
  placeholder: { kind: "protector", variant: art },
  // Model values intentionally empty — add the models THIS product fits.
  options: [
    { name: "Model", values: [] },
    { name: "Pack", values: ["Single", "Pack of 2", "Pack of 3"] },
  ],
  variants: [],
  requiresModel: true,
  attributes: {},
  featured: i === 1 || i === 3,
  tags: ["screen protector", "glass", "iphone", sub.replace("-", " ")],
  relatedProductIds: ["case-clear", "case-black-silicone"],
}));

/* ── D. Phone cases ────────────────────────────────────────────────────────── */
const cases: Product[] = [
  ["case-clear", "Clear Phone Case", "clear", "clear"],
  ["case-black-silicone", "Black Silicone Phone Case", "black-silicone", "black"],
].map(([id, title, sub, finish]) => ({
  ...base,
  id,
  slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  title,
  category: "phone-cases" as const,
  subcategory: sub,
  placeholder: { kind: "case" as const, finish: finish as "clear" | "black" },
  options: [{ name: "Model", values: [] }],
  variants: [],
  requiresModel: true,
  attributes: {},
  featured: true,
  tags: ["case", "cover", "iphone", finish],
  relatedProductIds: ["sp-clear", "sp-privacy"],
}));

/* ── E. Headphones ─────────────────────────────────────────────────────────── */
const headphones: Product[] = [
  ["hp-earbuds-white", "White Wireless Earbuds", "earbuds", "White"],
  ["hp-earbuds-black", "Black Wireless Earbuds", "earbuds", "Black"],
  ["hp-overear-black", "Black Over-Ear Headphones", "over-ear", "Black"],
  ["hp-overear-white", "White Over-Ear Headphones", "over-ear", "White"],
].map(([id, title, sub, colour], i) => ({
  ...base,
  id,
  slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  title,
  category: "headphones" as const,
  subcategory: sub,
  placeholder:
    sub === "earbuds"
      ? { kind: "earbuds" as const, colour: colour.toLowerCase() as "white" | "black" }
      : { kind: "overear" as const, colour: colour.toLowerCase() as "white" | "black" },
  options: [],
  variants: defaultVariant(id),
  requiresModel: false,
  attributes: { colour },
  featured: i === 0,
  tags: ["headphones", "audio", "wireless", colour.toLowerCase(), sub],
}));

/* ── F. Travel accessories ─────────────────────────────────────────────────── */
const travel: Product[] = [
  ["tr-universal", "Universal Travel Adapter", "universal", "universal"],
  ["tr-usb", "USB Travel Adapter", "usb", "usb"],
  ["tr-usb-c", "USB-C Travel Adapter", "usb-c", "usb-c"],
  ["tr-multi", "Multi-Port Travel Adapter", "multi-port", "multi"],
].map(([id, title, sub, art]) => ({
  ...base,
  id,
  slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  title,
  category: "travel-accessories" as const,
  subcategory: sub,
  placeholder: { kind: "adapter" as const, variant: art as "universal" | "usb" | "usb-c" | "multi" },
  options: [],
  variants: defaultVariant(id),
  requiresModel: false,
  attributes: {},
  tags: ["travel", "adapter", sub],
}));

/* ── G. Bundles ────────────────────────────────────────────────────────────── */
// Bundles stay unpurchasable until `bundle.configured = true` AND a variant is priced + stocked.
const bundles: Product[] = [
  {
    ...base,
    id: "bundle-3-pack-protectors",
    slug: "3-pack-screen-protectors",
    title: "3-Pack Screen Protectors",
    category: "bundles",
    placeholder: { kind: "bundle", items: ["protector", "protector", "protector"] },
    options: [{ name: "Model", values: [] }],
    variants: [],
    requiresModel: true,
    attributes: {},
    tags: ["bundle", "screen protector", "multipack"],
    bundle: {
      configured: false,
      components: [{ label: "Screen protector", category: "screen-protectors", quantity: 3, productIds: [] }],
    },
  },
  {
    ...base,
    id: "bundle-plug-cable",
    slug: "charging-plug-and-cable",
    title: "Charging Plug + Cable",
    category: "bundles",
    placeholder: { kind: "bundle", items: ["plug", "cable"] },
    options: [],
    variants: defaultVariant("bundle-plug-cable"),
    requiresModel: false,
    attributes: {},
    tags: ["bundle", "charging", "plug", "cable"],
    bundle: {
      configured: false,
      components: [
        { label: "Charging plug", category: "charging-plugs", quantity: 1, productIds: [] },
        { label: "Charging cable", category: "charging-cables", quantity: 1, productIds: [] },
      ],
    },
  },
  {
    ...base,
    id: "bundle-case-protector",
    slug: "phone-case-and-screen-protector",
    title: "Phone Case + Screen Protector",
    category: "bundles",
    placeholder: { kind: "bundle", items: ["case", "protector"] },
    options: [{ name: "Model", values: [] }],
    variants: [],
    requiresModel: true,
    attributes: {},
    tags: ["bundle", "case", "screen protector"],
    bundle: {
      configured: false,
      components: [
        { label: "Phone case", category: "phone-cases", quantity: 1, productIds: [] },
        { label: "Screen protector", category: "screen-protectors", quantity: 1, productIds: [] },
      ],
    },
  },
  {
    ...base,
    id: "bundle-phone-essentials",
    slug: "phone-essentials-bundle",
    title: "Phone Essentials Bundle",
    category: "bundles",
    featured: true,
    placeholder: { kind: "bundle", items: ["case", "protector", "plug", "cable"] },
    options: [{ name: "Model", values: [] }],
    variants: [],
    requiresModel: true,
    attributes: {},
    tags: ["bundle", "essentials", "case", "screen protector", "charging"],
    bundle: {
      configured: false,
      components: [
        { label: "Phone case", category: "phone-cases", quantity: 1, productIds: [] },
        { label: "Screen protector", category: "screen-protectors", quantity: 1, productIds: [] },
        { label: "Charging plug", category: "charging-plugs", quantity: 1, productIds: [] },
        { label: "Charging cable", category: "charging-cables", quantity: 1, productIds: [] },
      ],
    },
  },
  {
    ...base,
    id: "bundle-travel-essentials",
    slug: "travel-essentials-bundle",
    title: "Travel Essentials Bundle",
    category: "bundles",
    placeholder: { kind: "bundle", items: ["adapter", "cable", "plug"] },
    options: [],
    variants: defaultVariant("bundle-travel-essentials"),
    requiresModel: false,
    attributes: {},
    tags: ["bundle", "travel", "adapter"],
    bundle: {
      configured: false,
      components: [
        { label: "Travel adapter", category: "travel-accessories", quantity: 1, productIds: [] },
        { label: "Charging cable", category: "charging-cables", quantity: 1, productIds: [] },
      ],
    },
  },
];

export const seedProducts: Product[] = [
  ...plugs,
  ...cables,
  ...protectors,
  ...cases,
  ...headphones,
  ...travel,
  ...bundles,
].map((p) => (productImages[p.id] ? { ...p, images: productImages[p.id] } : p));
