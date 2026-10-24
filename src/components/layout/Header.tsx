"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { primaryNav } from "@/config/navigation";
import { categories } from "@/data/categories";
import { useBasket } from "@/context/basket";
import { BagIcon, ChevronDown, CloseIcon, MenuIcon, SearchIcon, UserIcon } from "@/components/ui/icons";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { ProductArt } from "@/components/product/ProductArt";
import { cn } from "@/lib/format";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-[0.32em]", className)}>
      <span aria-hidden className="relative inline-block h-[14px] w-[14px]">
        <span className="absolute inset-0 rounded-full border border-current opacity-70" />
        <span className="absolute inset-[4px] rounded-full bg-volt" />
      </span>
      TEKAURA
    </span>
  );
}

export function Header() {
  const pathname = usePathname();
  const { count, open } = useBasket();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!count) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 450);
    return () => clearTimeout(t);
  }, [count]);

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  // "/" opens search from anywhere (except while typing)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !/input|textarea|select/i.test(t.tagName)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0]));

  return (
    <>
      <header className="sticky top-0 z-50 text-white">
        {/* blur lives on its own layer so fixed-position menus aren't trapped by backdrop-filter */}
        <div aria-hidden className="glass-dark absolute inset-0 -z-10 border-b border-white/[0.06]" />
        <div className="container-x flex h-[var(--header-h)] items-center gap-6">
          <Link href="/" className="shrink-0 text-[15px]" aria-label="TEKAURA home">
            <Wordmark />
          </Link>

          <nav aria-label="Primary" className="hidden flex-1 justify-center xl:flex">
            <ul className="flex items-center gap-[clamp(0.75rem,1.4vw,1.6rem)]">
              {primaryNav.map((item) => (
                <li key={item.href} className={cn("group", !item.mega && "relative")}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "flex h-[var(--header-h)] items-center gap-1 text-[13px] tracking-[-0.005em] text-white/70 transition-colors hover:text-white",
                      isActive(item.href) && "text-white",
                    )}
                  >
                    {item.label}
                    {(item.children || item.mega) && (
                      <ChevronDown className="opacity-50 transition-transform duration-300 group-hover:rotate-180" />
                    )}
                  </Link>
                  {item.mega && <MegaMenu />}
                  {item.children && (
                    <div className="invisible absolute left-1/2 top-full z-10 -translate-x-1/2 translate-y-2 opacity-0 transition-all duration-300 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                      <ul className="glass-dark min-w-[240px] rounded-2xl border border-white/10 p-2 shadow-2xl">
                        {item.children.map((c) => (
                          <li key={c.href}>
                            <Link
                              href={c.href}
                              className="block rounded-xl px-3 py-2.5 text-[13px] text-white/70 hover:bg-white/[0.06] hover:text-white"
                            >
                              {c.label}
                            </Link>
                          </li>
                        ))}
                        <li className="mt-1 border-t border-white/10 pt-1">
                          <Link href={item.href} className="block rounded-xl px-3 py-2.5 text-[13px] text-volt-bright hover:bg-white/[0.06]">
                            View all {item.label}
                          </Link>
                        </li>
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1 xl:ml-0">
            <IconButton label="Search products" onClick={() => setSearchOpen(true)}>
              <SearchIcon />
            </IconButton>
            <Link href="/account" aria-label="Account" className="hidden h-11 w-11 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white sm:flex">
              <UserIcon />
            </Link>
            <IconButton label={`Basket, ${count} item${count === 1 ? "" : "s"}`} onClick={open}>
              <span className="relative">
                <BagIcon />
                {count > 0 && (
                  <span
                    className={cn(
                      "absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-volt px-1 text-[10px] font-semibold tabular-nums transition-transform",
                      bump && "scale-125",
                    )}
                  >
                    {count}
                  </span>
                )}
              </span>
            </IconButton>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full text-white/80 hover:bg-white/10 xl:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile / tablet menu */}
        <div
          id="mobile-menu"
          hidden={!menuOpen}
          className="fixed inset-x-0 bottom-0 top-[var(--header-h)] overflow-y-auto overscroll-contain bg-ink xl:hidden"
        >
          <nav aria-label="Mobile" className="container-x pb-16 pt-4">
            <ul>
              {primaryNav.map((item, i) => (
                <li key={item.href} className="border-b border-white/[0.08]" style={{ animationDelay: `${i * 35}ms` }}>
                  <div className="flex items-center">
                    <Link href={item.href} className="flex-1 py-4 text-[22px] font-medium tracking-tight" onClick={() => setMenuOpen(false)}>
                      {item.label}
                    </Link>
                    {item.children && (
                      <button
                        type="button"
                        aria-label={`Show ${item.label} collections`}
                        aria-expanded={expanded === item.href}
                        className="flex h-12 w-12 items-center justify-center rounded-full text-white/60 hover:bg-white/10"
                        onClick={() => setExpanded((e) => (e === item.href ? null : item.href))}
                      >
                        <ChevronDown width={18} height={18} className={cn("transition-transform", expanded === item.href && "rotate-180")} />
                      </button>
                    )}
                  </div>
                  {item.children && expanded === item.href && (
                    <ul className="pb-4 pl-1">
                      {item.children.map((c) => (
                        <li key={c.href}>
                          <Link href={c.href} className="block py-2.5 text-[15px] text-white/60 hover:text-white" onClick={() => setMenuOpen(false)}>
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
              <li>
                <Link href="/account" className="flex items-center gap-3 py-5 text-[15px] text-white/70" onClick={() => setMenuOpen(false)}>
                  <UserIcon /> Account
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
    >
      {children}
    </button>
  );
}

function MegaMenu() {
  return (
    <div className="invisible absolute inset-x-0 top-full z-10 translate-y-2 opacity-0 transition-all duration-300 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
      <div className="glass-dark border-b border-white/10 shadow-2xl">
        <div className="container-x grid grid-cols-7 gap-4 py-8">
          {categories.map((c) => (
            <div key={c.slug}>
              <Link href={`/shop/${c.slug}`} className="group/card block">
                <div className="mb-3 aspect-square overflow-hidden rounded-2xl bg-gradient-to-b from-white/[0.09] to-white/[0.02]">
                  <ProductArt art={c.placeholder} className="h-full w-full p-3 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover/card:scale-[1.06]" />
                </div>
                <span className="text-[13px] font-medium text-white">{c.name}</span>
              </Link>
              <ul className="mt-2 space-y-1">
                {c.subcategories.slice(0, 5).map((s) => (
                  <li key={s.slug}>
                    <Link href={`/shop/${c.slug}?sub=${s.slug}`} className="text-[12px] leading-5 text-white/50 hover:text-white">
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="container-x flex justify-end pb-6">
          <Link href="/shop" className="text-[13px] text-volt-bright hover:underline">
            Shop all products →
          </Link>
        </div>
      </div>
    </div>
  );
}
