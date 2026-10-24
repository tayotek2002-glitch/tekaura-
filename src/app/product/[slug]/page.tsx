import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategory, getProductBySlug, getProducts, getRelatedProducts } from "@/lib/catalog";
import { ProductGallery } from "@/components/product/ProductGallery";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import { ProductGrid, StatusBadge } from "@/components/product/ProductCard";
import { site } from "@/config/site";

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProductBySlug(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.description ?? `${p.title} from TEKAURA — ${getCategory(p.category)?.tagline ?? ""}`,
    alternates: { canonical: `/product/${p.slug}` },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  const category = getCategory(product.category)!;
  const sub = category.subcategories.find((s) => s.slug === product.subcategory);
  const specs = product.specifications.filter((s) => s.verified);
  const related = getRelatedProducts(product);

  return (
    <div className="bg-mist">
      <div className="container-x pb-24 pt-6 md:pt-10">
        <nav aria-label="Breadcrumb" className="mb-6 text-[13px] text-slate">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link href="/shop" className="hover:text-ink">Shop</Link></li>
            <li aria-hidden>/</li>
            <li><Link href={`/shop/${category.slug}`} className="hover:text-ink">{category.name}</Link></li>
            {sub && (
              <>
                <li aria-hidden>/</li>
                <li><Link href={`/shop/${category.slug}?sub=${sub.slug}`} className="hover:text-ink">{sub.name}</Link></li>
              </>
            )}
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <ProductGallery product={product} />

          <div className="lg:pt-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="eyebrow text-slate">{sub?.name ?? category.name}</span>
              <StatusBadge product={product} />
            </div>
            <h1 className="text-balance text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.035em]">{product.title}</h1>
            <p className="mt-4 max-w-[52ch] text-[16px] leading-relaxed text-slate">
              {product.description ?? "Full product details are on the way."}
            </p>

            <div className="mt-8">
              <PurchasePanel product={product} />
            </div>

            {product.bundle && (
              <Section title="What's included">
                <ul className="space-y-2">
                  {product.bundle.components.map((c, i) => (
                    <li key={i} className="flex justify-between text-[14px]">
                      <span>{c.label}</span>
                      <span className="text-slate">× {c.quantity}</span>
                    </li>
                  ))}
                </ul>
                {!product.bundle.configured && (
                  <p className="mt-3 text-[13px] text-slate">Bundle contents and pricing are still being configured.</p>
                )}
              </Section>
            )}

            <Section title="Specifications">
              {specs.length ? (
                <dl className="divide-y divide-black/[0.06]">
                  {specs.map((s) => (
                    <div key={s.label} className="flex justify-between gap-6 py-3 text-[14px]">
                      <dt className="text-slate">{s.label}</dt>
                      <dd className="text-right">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-[14px] text-slate">Specifications will be published once they have been verified.</p>
              )}
            </Section>

            <Section title="Delivery & returns">
              <p className="text-[14px] leading-relaxed text-slate">
                {site.deliverySummary ?? "Delivery options will be confirmed before launch."}{" "}
                {site.returnsSummary ?? ""}
              </p>
              <div className="mt-3 flex gap-4 text-[14px]">
                <Link href="/help/delivery" className="link-underline">Delivery information</Link>
                <Link href="/help/returns" className="link-underline">Returns</Link>
              </div>
            </Section>
          </div>
        </div>

        {product.reviews && product.reviews.length > 0 && (
          <section className="mt-24" aria-labelledby="reviews">
            <h2 id="reviews" className="mb-8 text-[28px] font-semibold tracking-tight">Customer reviews</h2>
            <ul className="grid gap-4 md:grid-cols-2">
              {product.reviews.map((r) => (
                <li key={r.id} className="rounded-3xl bg-white p-6">
                  <p aria-label={`${r.rating} out of 5`}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                  {r.title && <p className="mt-2 font-medium">{r.title}</p>}
                  <p className="mt-2 text-[14px] text-slate">{r.body}</p>
                  <p className="mt-3 text-[12px] text-slate">{r.author}{r.verifiedPurchase && " · Verified purchase"}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-28" aria-labelledby="related">
            <h2 id="related" className="mb-8 text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-[-0.03em]">Goes well with</h2>
            <ProductGrid products={related} />
          </section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 border-t border-black/[0.08] pt-6">
      <h2 className="mb-4 text-[15px] font-medium">{title}</h2>
      {children}
    </section>
  );
}

