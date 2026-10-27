import type { Product } from "@/lib/catalog/types";
import { ProductArt } from "./ProductArt";
import { cn } from "@/lib/format";

/** The product's main photo, shown whole on white; the concept illustration if it has none. */
export function ProductVisual({ product, className, eager }: { product: Product; className?: string; eager?: boolean }) {
  const image = product.images[0];
  if (!image) return <ProductArt art={product.placeholder} className={className} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={image.src} alt={image.alt} loading={eager ? "eager" : "lazy"} className={cn("bg-white object-contain", className)} />
  );
}
