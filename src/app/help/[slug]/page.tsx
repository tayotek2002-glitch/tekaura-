import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { helpPages } from "@/config/site";

export function generateStaticParams() {
  return helpPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = helpPages.find((p) => p.slug === slug);
  return page ? { title: page.title } : {};
}

/**
 * Policy and help pages. Content is intentionally NOT written for you —
 * delivery terms, returns policy and legal text must come from the business.
 * Replace the placeholder below with your approved copy (or a CMS source).
 */
export default async function HelpPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = helpPages.find((p) => p.slug === slug);
  if (!page) notFound();
  return (
    <div className="bg-mist">
      <div className="container-x grid max-w-5xl gap-10 pb-28 pt-12 md:grid-cols-[200px_1fr] md:pt-20">
        <nav aria-label="Help" className="order-2 md:order-1">
          <ul className="space-y-2 text-[14px]">
            {helpPages.map((p) => (
              <li key={p.slug}>
                <Link href={`/help/${p.slug}`} aria-current={p.slug === slug ? "page" : undefined} className="text-slate hover:text-ink aria-[current=page]:font-medium aria-[current=page]:text-ink">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <article className="order-1 md:order-2">
          <h1 className="display text-[clamp(2.25rem,5vw,4rem)]">{page.title}</h1>
          <div className="mt-8 rounded-[28px] border border-dashed border-black/15 bg-white/60 p-8 text-[15px] text-slate">
            This page is awaiting TEKAURA&apos;s confirmed {page.title.toLowerCase()} content.
          </div>
        </article>
      </div>
    </div>
  );
}
