import Link from "next/link";
import { getCategories, getProductsByCategory } from "@/lib/catalog";
import { ProductArt } from "@/components/product/ProductArt";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRight } from "@/components/ui/icons";
import { cn } from "@/lib/format";

// bento layout: [col-span, row-span, tone]
const LAYOUT: Record<string, { span: string; dark?: boolean }> = {
  "screen-protectors": { span: "md:col-span-2 md:row-span-2", dark: true },
  "phone-cases": { span: "md:col-span-2" },
  "charging-plugs": { span: "" },
  "charging-cables": { span: "" },
  headphones: { span: "md:col-span-2", dark: true },
  "travel-accessories": { span: "" },
  bundles: { span: "" },
};

export function ShopByCategory() {
  const cats = getCategories();
  return (
    <section id="shop-by-category" className="scroll-mt-[var(--header-h)] bg-mist py-24 md:py-36">
      <div className="container-x">
        <Reveal className="mb-12 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end">
          <div>
            <p className="eyebrow mb-4 text-slate">Shop by category</p>
            <h2 className="display max-w-[14ch] text-[clamp(2.5rem,6vw,5.5rem)]">Everything it needs.</h2>
          </div>
          <Link href="/shop" className="btn btn-ghost-dark self-start md:self-auto">
            Shop all products <ArrowRight />
          </Link>
        </Reveal>

        <div className="grid auto-rows-[minmax(220px,auto)] grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:auto-rows-[280px]">
          {cats.map((c, i) => {
            const l = LAYOUT[c.slug] ?? { span: "" };
            const big = l.span.includes("row-span-2");
            const n = getProductsByCategory(c.slug).length;
            return (
              <Reveal key={c.slug} delay={i * 60} className={cn(l.span, big ? "col-span-2 row-span-2 min-h-[440px]" : l.span.includes("col-span-2") ? "col-span-2" : "")}>
                <Link
                  href={`/shop/${c.slug}`}
                  className={cn(
                    "group relative flex h-full flex-col justify-between overflow-hidden rounded-[28px] p-6 md:p-8",
                    l.dark ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-black/[0.04]",
                  )}
                >
                  {l.dark && (
                    <div aria-hidden className="absolute inset-0 bg-[radial-gradient(70%_60%_at_70%_70%,color-mix(in_srgb,var(--color-volt)_22%,transparent),transparent_70%)] opacity-60 transition-opacity duration-700 group-hover:opacity-100" />
                  )}
                  <div className="relative z-10">
                    <p className={cn("eyebrow mb-2", l.dark ? "text-white/45" : "text-slate")}>{n} product types</p>
                    <h3 className={cn("font-semibold tracking-[-0.03em]", big ? "text-[clamp(2rem,3.5vw,3.25rem)] leading-none" : "text-[clamp(1.25rem,1.8vw,1.6rem)] leading-tight")}>{c.name}</h3>
                    {big && <p className="mt-3 max-w-[28ch] text-white/60">{c.tagline}</p>}
                  </div>
                  <ProductArt
                    art={c.placeholder}
                    className={cn(
                      "pointer-events-none absolute transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:-translate-y-2 group-hover:scale-[1.06] group-hover:-rotate-3",
                      big ? "-bottom-6 -right-6 h-[78%] w-[78%]" : "-bottom-4 -right-4 h-[70%] w-[70%] md:h-[78%] md:w-[60%]",
                    )}
                  />
                  <span className={cn("relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500 group-hover:w-24", l.dark ? "bg-white text-ink" : "bg-ink text-white")}>
                    <ArrowRight />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
