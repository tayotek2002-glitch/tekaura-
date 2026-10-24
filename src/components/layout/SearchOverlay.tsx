"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCategory, priceFrom, searchProducts } from "@/lib/catalog";
import { formatGBP } from "@/lib/format";
import { ProductArt } from "@/components/product/ProductArt";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";
import { categories } from "@/data/categories";

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const results = useMemo(() => searchProducts(q).slice(0, 6), [q]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Search">
      <button aria-label="Close search" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mx-auto mt-0 w-full max-w-3xl animate-fade-up px-3 sm:mt-[10vh]">
        <div className="overflow-hidden rounded-b-3xl bg-white shadow-2xl sm:rounded-3xl">
          <form
            role="search"
            className="flex items-center gap-3 border-b border-black/[0.06] px-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
            }}
          >
            <SearchIcon className="shrink-0 text-slate" />
            <label htmlFor="site-search" className="sr-only">
              Search TEKAURA
            </label>
            <input
              id="site-search"
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search cables, cases, screen protectors…"
              className="h-16 flex-1 bg-transparent text-[17px] outline-none placeholder:text-slate/70"
              autoComplete="off"
              enterKeyHint="search"
            />
            <button type="button" onClick={onClose} aria-label="Close search" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-mist">
              <CloseIcon width={18} height={18} />
            </button>
          </form>

          <div className="max-h-[60vh] overflow-y-auto p-3">
            {!q.trim() && (
              <div className="p-3">
                <p className="eyebrow mb-3 text-slate">Browse</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <Link key={c.slug} href={`/shop/${c.slug}`} className="chip" onClick={onClose}>
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {q.trim() && results.length === 0 && (
              <p className="p-6 text-center text-slate">No products match “{q}”.</p>
            )}
            {results.length > 0 && (
              <ul>
                {results.map((p) => {
                  const price = priceFrom(p);
                  return (
                    <li key={p.id}>
                      <Link href={`/product/${p.slug}`} onClick={onClose} className="flex items-center gap-4 rounded-2xl p-2 hover:bg-mist">
                        <span className="h-14 w-14 shrink-0 rounded-xl bg-gradient-to-b from-mist to-cloud">
                          <ProductArt art={p.placeholder} className="h-full w-full" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-medium">{p.title}</span>
                          <span className="block text-[13px] text-slate">{getCategory(p.category)?.name}</span>
                        </span>
                        <span className="text-[13px] text-slate">{price ? formatGBP(price.min) : "Coming soon"}</span>
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <Link
                    href={`/search?q=${encodeURIComponent(q.trim())}`}
                    onClick={onClose}
                    className="mt-1 block rounded-2xl p-3 text-center text-[14px] text-volt hover:bg-mist"
                  >
                    See all results
                  </Link>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
