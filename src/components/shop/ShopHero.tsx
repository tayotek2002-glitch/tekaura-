import type { PlaceholderArt } from "@/lib/catalog/types";
import { ProductArt } from "@/components/product/ProductArt";

export function ShopHero({ eyebrow, title, tagline, art }: { eyebrow: string; title: string; tagline: string; art?: PlaceholderArt }) {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_80%_at_80%_20%,rgba(47,123,255,0.18),transparent_60%),radial-gradient(50%_60%_at_10%_100%,rgba(255,255,255,0.06),transparent_70%)]" />
      <div className="container-x relative grid min-h-[340px] items-end gap-8 py-14 md:min-h-[420px] md:grid-cols-[1.4fr_1fr] md:py-20">
        <div className="animate-fade-up">
          <p className="eyebrow mb-5 text-white/50">{eyebrow}</p>
          <h1 className="display text-balance text-[clamp(2.75rem,8vw,6.5rem)]">{title}</h1>
          <p className="mt-5 max-w-[40ch] text-[17px] text-white/60">{tagline}</p>
        </div>
        {art && (
          <div className="hidden justify-end md:flex">
            <ProductArt art={art} className="h-[300px] w-[300px] animate-fade-up drop-shadow-[0_40px_60px_rgba(0,0,0,0.6)] [animation-delay:150ms]" />
          </div>
        )}
      </div>
    </section>
  );
}

export function GridSkeleton() {
  return (
    <div className="container-x grid grid-cols-2 gap-5 pb-28 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="aspect-[4/5] animate-shimmer rounded-[28px] bg-[linear-gradient(90deg,#ececf0,#f7f7f9,#ececf0)] bg-[length:200%_100%]" />
      ))}
    </div>
  );
}
