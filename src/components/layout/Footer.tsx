import Link from "next/link";
import { categories } from "@/data/categories";
import { helpPages, site } from "@/config/site";
import { Wordmark } from "@/components/layout/Header";

export function Footer() {
  const socials = site.social.filter((s) => s.href);
  return (
    <footer className="bg-ink text-white">
      <div className="container-x grid gap-12 py-20 md:grid-cols-12">
        <div className="md:col-span-4">
          <Wordmark className="text-[15px]" />
          <p className="mt-5 max-w-[30ch] text-[15px] leading-relaxed text-white/50">{site.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {(socials.length ? socials : site.social).map((s) =>
              s.href ? (
                <a key={s.name} href={s.href} target="_blank" rel="noreferrer" className="chip !border-white/15 !bg-transparent !text-white/70 hover:!text-white">
                  {s.name}
                </a>
              ) : (
                <span key={s.name} title="Link coming soon" className="chip cursor-default !border-white/10 !bg-transparent !text-white/30">
                  {s.name}
                </span>
              ),
            )}
          </div>
        </div>

        <FooterCol title="Shop" className="md:col-span-3">
          <FooterLink href="/shop">Shop All</FooterLink>
          {categories.map((c) => (
            <FooterLink key={c.slug} href={`/shop/${c.slug}`}>
              {c.name}
            </FooterLink>
          ))}
        </FooterCol>

        <FooterCol title="Customer service" className="md:col-span-3">
          {helpPages.slice(0, 4).map((p) => (
            <FooterLink key={p.slug} href={`/help/${p.slug}`}>
              {p.title}
            </FooterLink>
          ))}
          <FooterLink href="/#faq">FAQ</FooterLink>
          <FooterLink href="/account">Account</FooterLink>
        </FooterCol>

        <FooterCol title="Policies" className="md:col-span-2">
          {helpPages.slice(4).map((p) => (
            <FooterLink key={p.slug} href={`/help/${p.slug}`}>
              {p.title}
            </FooterLink>
          ))}
        </FooterCol>
      </div>

      <div className="container-x flex flex-col gap-3 border-t border-white/[0.08] py-8 text-[12px] text-white/40 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} TEKAURA. All rights reserved.</p>
        <p>Product imagery shown is concept artwork unless stated otherwise. Prices in GBP (£).</p>
      </div>
    </footer>
  );
}

function FooterCol({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <h3 className="eyebrow mb-5 text-white/40">{title}</h3>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="link-underline text-[14px] text-white/70 hover:text-white">
        {children}
      </Link>
    </li>
  );
}
