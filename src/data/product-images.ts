import type { ProductImage } from "@/lib/catalog/types";

/**
 * Real product photos, by product id (see src/data/products.ts).
 * Files live in /public/products/<id>/. The first image is the main one;
 * the rest form the product page gallery, in this order.
 * Products without an entry keep their concept illustration.
 */
export const productImages: Record<string, ProductImage[]> = {
  "plug-1a": [{ src: "/products/plug-1a/1.png", alt: "Single USB-A Plug, white UK three-pin charger with one USB-A port" }],
};
