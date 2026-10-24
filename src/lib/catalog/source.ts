import type { Category, Product } from "./types";
import { categories } from "@/data/categories";
import { seedProducts } from "@/data/products";
import { DEMO_MODE, applyDemoData } from "@/data/demo";

/**
 * Catalogue source adapter.
 *
 * Today this reads local seed data. To connect Shopify (Storefront API),
 * a headless commerce platform or a CMS, implement `CatalogSource` with the
 * same return shapes and swap `activeSource` below. Nothing in the UI reads
 * `src/data/*` directly.
 */
export interface CatalogSource {
  getCategories(): Category[];
  getProducts(): Product[];
}

const localSource: CatalogSource = {
  getCategories: () => categories,
  getProducts: () => {
    const all = DEMO_MODE ? applyDemoData(seedProducts) : seedProducts;
    return all.filter((p) => p.status !== "draft" && p.status !== "archived");
  },
};

export const activeSource: CatalogSource = localSource;
