import Link from "next/link";
import { getFeaturedProducts, isProductPurchasable } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Shows featured products (product.featured = true). Until any are purchasable
 * the section is framed as a "first look" rather than claiming popularity.
 */
export function PopularProducts() {
  const featured = getFeaturedProducts();
  const live = featured.filter(isProductPurchasable);
  const list = (live.length ? live : featured).slice(0, 8);
  if (!list.length) return null;
  return (
    <section className="bg-white py-24 md:py-36">
      <div className="container-x">
        <Reveal className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow mb-4 text-slate">{live.length ? "Popular products" : "Popular products · launching soon"}</p>
            <h2 className="display text-[clamp(2.5rem,6vw,5.5rem)]">{live.length ? "Most wanted." : "First to arrive."}</h2>
          </div>
          <Link href="/shop" className="link-underline self-start text-[15px] md:self-auto">View everything</Link>
        </Reveal>
        <div className="-mx-[clamp(1.25rem,4vw,3.5rem)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[clamp(1.25rem,4vw,3.5rem)] pb-4 [scrollbar-width:none]">
          {list.map((p, i) => (
            <Reveal key={p.id} delay={i * 70} className="w-[72vw] max-w-[340px] shrink-0 snap-start sm:w-[42vw] lg:w-[23%]">
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
