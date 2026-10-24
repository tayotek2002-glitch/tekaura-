import type { Metadata } from "next";
import { searchProducts } from "@/lib/catalog";
import { ProductGrid } from "@/components/product/ProductCard";
import { CategoryLinks } from "@/components/shop/CatalogBrowser";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const results = searchProducts(q);
  return (
    <div className="bg-mist">
      <div className="container-x pb-28 pt-12 md:pt-20">
        <p className="eyebrow mb-4 text-slate">Search</p>
        <form action="/search" role="search" className="mb-10 flex max-w-2xl items-center gap-3 border-b-2 border-ink pb-2">
          <label htmlFor="q" className="sr-only">Search products</label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="What are you looking for?"
            className="h-14 flex-1 bg-transparent text-[clamp(1.5rem,3vw,2.25rem)] font-medium tracking-tight outline-none placeholder:text-black/25"
          />
          <button className="btn btn-dark">Search</button>
        </form>
        {q && (
          <p className="mb-6 text-[14px] text-slate" aria-live="polite">
            {results.length} result{results.length === 1 ? "" : "s"} for “{q}”
          </p>
        )}
        {q ? (
          <ProductGrid products={results} emptyText={`Nothing matches “${q}” yet.`} />
        ) : (
          <div>
            <p className="mb-4 text-[15px] text-slate">Or browse a category</p>
            <CategoryLinks />
          </div>
        )}
      </div>
    </div>
  );
}
