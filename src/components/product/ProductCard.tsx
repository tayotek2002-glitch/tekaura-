import Link from "next/link";
import type { Product } from "@/lib/catalog/types";
import { getCategory, isProductPurchasable, priceFrom } from "@/lib/catalog";
import { formatGBP, cn } from "@/lib/format";
import { ProductArt } from "./ProductArt";

export function PriceLabel({ product, className }: { product: Product; className?: string }) {
  const price = priceFrom(product);
  if (!price) return <span className={cn("text-slate", className)}>Price to be confirmed</span>;
  return (
    <span className={cn("tabular-nums", className)}>
      {price.min !== price.max && <span className="text-slate">From </span>}
      {formatGBP(price.min)}
    </span>
  );
}

export function StatusBadge({ product }: { product: Product }) {
  if (product.bundle && !product.bundle.configured)
    return <Badge tone="neutral">Being configured</Badge>;
  if (product.status === "coming_soon") return <Badge tone="neutral">Coming soon</Badge>;
  if (!isProductPurchasable(product)) return <Badge tone="neutral">Unavailable</Badge>;
  return null;
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "neutral" | "volt" }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px] font-medium tracking-tight backdrop-blur",
        tone === "volt" ? "bg-volt text-white" : "bg-white/80 text-ink ring-1 ring-black/[0.06]",
      )}
    >
      {children}
    </span>
  );
}

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const cat = getCategory(product.category);
  const sub = cat?.subcategories.find((s) => s.slug === product.subcategory);
  const image = product.images[0];
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-[28px] bg-white ring-1 ring-black/[0.04] transition-[box-shadow,transform] duration-700 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-[#fafafb] to-[#ececf0]">
        <div className="absolute left-4 top-4 z-10 flex gap-2">
          <StatusBadge product={product} />
        </div>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.src}
            alt={image.alt}
            loading={priority ? "eager" : "lazy"}
            className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
          />
        ) : (
          <ProductArt
            art={product.placeholder}
            className="h-full w-full p-[12%] transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:-rotate-2 group-hover:scale-[1.07]"
          />
        )}
        {(!image || image.isConcept) && (
          <span className="absolute bottom-3 right-4 font-mono text-[9px] uppercase tracking-[0.16em] text-black/30">Concept illustration</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-5">
        <span className="eyebrow text-slate">{sub?.name ?? cat?.name}</span>
        <h3 className="text-[16px] font-medium leading-snug tracking-tight">{product.title}</h3>
        <PriceLabel product={product} className="mt-auto pt-2 text-[14px]" />
      </div>
    </Link>
  );
}

export function ProductGrid({ products, emptyText }: { products: Product[]; emptyText?: string }) {
  if (!products.length)
    return (
      <div className="rounded-[28px] border border-dashed border-black/15 bg-white/50 px-6 py-20 text-center">
        <p className="text-[17px] font-medium tracking-tight">{emptyText ?? "No products here yet."}</p>
        <p className="mt-2 text-[14px] text-slate">New products are being added. Check back soon.</p>
      </div>
    );
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < 4} />
      ))}
    </div>
  );
}
