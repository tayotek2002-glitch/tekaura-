import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/catalog";
import { site } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string) => `${site.url}${p}`;
  return [
    { url: u("/"), priority: 1 },
    { url: u("/shop"), priority: 0.9 },
    ...getCategories().map((c) => ({ url: u(`/shop/${c.slug}`), priority: 0.8 })),
    ...getProducts().map((p) => ({ url: u(`/product/${p.slug}`), priority: 0.6 })),
  ];
}
