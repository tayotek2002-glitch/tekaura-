import { Suspense } from "react";
import type { Metadata } from "next";
import { CatalogBrowser } from "@/components/shop/CatalogBrowser";
import { GridSkeleton, ShopHero } from "@/components/shop/ShopHero";

export const metadata: Metadata = {
  title: "Shop All",
  description: "Charging, protection, cases, audio and travel accessories from TEKAURA.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return (
    <div className="bg-mist">
      <ShopHero eyebrow="Shop all" title="Everything your phone needs." tagline="Protection, power and style — all in one place." art={{ kind: "bundle", items: ["case", "cable", "plug"] }} />
      <div className="pt-10">
        <Suspense fallback={<GridSkeleton />}>
          <CatalogBrowser />
        </Suspense>
      </div>
    </div>
  );
}
