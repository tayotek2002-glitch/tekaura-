import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategories, getCategory } from "@/lib/catalog";
import { CatalogBrowser } from "@/components/shop/CatalogBrowser";
import { GridSkeleton, ShopHero } from "@/components/shop/ShopHero";

export function generateStaticParams() {
  return getCategories().map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const c = getCategory(category);
  if (!c) return {};
  return { title: c.name, description: `${c.description} ${c.tagline}`, alternates: { canonical: `/shop/${c.slug}` } };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const c = getCategory(category);
  if (!c) notFound();
  return (
    <div className="bg-mist">
      <ShopHero eyebrow={c.description} title={c.name} tagline={c.tagline} art={c.placeholder} />
      <div className="pt-10">
        <Suspense fallback={<GridSkeleton />}>
          <CatalogBrowser category={c.slug} />
        </Suspense>
      </div>
    </div>
  );
}
