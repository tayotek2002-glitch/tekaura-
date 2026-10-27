/**
 * TEKAURA catalogue types.
 *
 * These types are deliberately backend-agnostic. The local seed data in
 * `src/data/` implements them today; a Shopify / headless-commerce adapter can
 * map its own products onto the same shape later (see `src/lib/catalog/source.ts`).
 *
 * Prices are stored as integer PENCE (GBP) to avoid floating-point errors.
 * `null` always means "not yet supplied" — the UI shows an honest placeholder
 * and never invents a value.
 */

export type CategorySlug =
  | "charging-plugs"
  | "charging-cables"
  | "screen-protectors"
  | "phone-cases"
  | "headphones"
  | "travel-accessories"
  | "bundles";

/**
 * draft        – hidden from the storefront entirely
 * coming_soon  – visible, but cannot be purchased (default for phase one)
 * active       – visible and purchasable when a variant has price + stock
 * archived     – hidden, kept for records
 */
export type ProductStatus = "draft" | "coming_soon" | "active" | "archived";

export interface ProductImage {
  src: string;
  alt: string;
  /** true for AI / concept visuals that are NOT photographs of the real product */
  isConcept?: boolean;
}

export interface ProductOption {
  /** e.g. "Length", "Finish", "Colour", "Pack", "Model" */
  name: string;
  /** All values this option may take. Only values used by OFFERED variants are shown to shoppers. */
  values: string[];
}

export interface ProductVariant {
  id: string;
  sku?: string;
  /** e.g. { Length: "2 m", Finish: "Braided" } */
  options: Record<string, string>;
  /** Whether this combination is sold at all. Combinations with offered=false are never displayed. */
  offered: boolean;
  /** Price in pence (GBP). null = not yet set. */
  price: number | null;
  /** Units in stock. null = stock not yet set (treated as unavailable). */
  stock: number | null;
  images?: ProductImage[];
}

export interface Specification {
  label: string;
  value: string;
  /** Only verified specifications are displayed on the storefront. */
  verified: boolean;
}

/** Drives the built-in placeholder illustration until real photography exists. */
export type PlaceholderArt =
  /** compact: tapered charger, ports on the edge · cube: square body, ports on the front face */
  | { kind: "plug"; usbA: number; usbC: number; style?: "compact" | "cube" }
  | { kind: "cable"; from: "USB-A" | "USB-C"; to: "Lightning" | "USB-C"; braided?: boolean }
  | { kind: "protector"; variant: "clear" | "privacy" | "tempered" | "magic-clear" | "magic-privacy" }
  | { kind: "case"; finish: "clear" | "black" }
  | { kind: "earbuds"; colour: "white" | "black" }
  | { kind: "overear"; colour: "white" | "black" }
  | { kind: "adapter"; variant: "universal" | "usb" | "usb-c" | "multi" }
  | { kind: "bundle"; items: PlaceholderArt["kind"][] };

export interface BundleComponent {
  label: string;
  category: CategorySlug;
  subcategory?: string;
  quantity: number;
  /** Specific products allowed in this slot. Empty = any product in the category/subcategory. */
  productIds: string[];
}

export interface BundleConfig {
  components: BundleComponent[];
  /** A bundle cannot be purchased until this is true AND it has a priced, stocked variant. */
  configured: boolean;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  category: CategorySlug;
  /** Must match a subcategory slug defined on the category. */
  subcategory?: string;
  description: string | null;
  images: ProductImage[];
  placeholder: PlaceholderArt;
  options: ProductOption[];
  variants: ProductVariant[];
  /**
   * When true the shopper must choose a phone model before adding to basket.
   * The model list comes from the "Model" option values of offered variants,
   * so compatibility is always configured per individual product.
   */
  requiresModel: boolean;
  specifications: Specification[];
  /** Free-form attributes used by category filters, e.g. { connectors: ["USB-A","USB-C"], ports: 2 } */
  attributes: Record<string, string | number | string[]>;
  status: ProductStatus;
  featured: boolean;
  tags: string[];
  relatedProductIds?: string[];
  bundle?: BundleConfig;
  /** Optional 360° rotation: ordered frame URLs (e.g. 36 frames). Enables drag-to-rotate in the gallery. */
  spin?: { frames: string[] };
  /** Only genuine, verified customer reviews. Section is hidden while empty. */
  reviews?: Review[];
  /** ISO date, used for "Newest" sorting */
  createdAt: string;
}

export interface Review {
  id: string;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title?: string;
  body: string;
  date: string;
  verifiedPurchase: boolean;
}

export interface Subcategory {
  slug: string;
  name: string;
  description?: string;
}

export interface FacetDefinition {
  /** attribute key, or option name when source = "option" */
  key: string;
  label: string;
  source: "attribute" | "option";
  /** optional explicit ordering of values */
  order?: string[];
}

export interface Category {
  slug: CategorySlug;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  subcategories: Subcategory[];
  facets: FacetDefinition[];
  placeholder: PlaceholderArt;
  /** Room for future collections (e.g. MagSafe cases) without code changes */
  futureCollections?: string[];
}

export interface PhoneModel {
  id: string;
  name: string;
  family: string;
}
