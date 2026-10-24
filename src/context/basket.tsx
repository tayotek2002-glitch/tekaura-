"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProductById, isVariantPurchasable } from "@/lib/catalog";
import type { Product, ProductVariant } from "@/lib/catalog/types";

export interface BasketItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface ResolvedLine extends BasketItem {
  key: string;
  product: Product;
  variant: ProductVariant;
  unitPrice: number;
  lineTotal: number;
  maxQuantity: number;
}

interface BasketContextValue {
  lines: ResolvedLine[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  lastAdded: string | null;
  open: () => void;
  close: () => void;
  add: (productId: string, variantId: string, quantity?: number) => boolean;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

const BasketContext = createContext<BasketContextValue | null>(null);
const STORAGE_KEY = "tekaura.basket.v1";
const MAX_PER_LINE = 10;

const keyOf = (i: BasketItem) => `${i.productId}::${i.variantId}`;

export function BasketProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* storage unavailable — basket stays in memory */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, hydrated]);

  // Resolve against the live catalogue; drop anything no longer purchasable.
  const lines = useMemo<ResolvedLine[]>(() => {
    const out: ResolvedLine[] = [];
    for (const item of items) {
      const product = getProductById(item.productId);
      const variant = product?.variants.find((v) => v.id === item.variantId);
      if (!product || !variant || !isVariantPurchasable(product, variant)) continue;
      const maxQuantity = Math.min(MAX_PER_LINE, variant.stock ?? 0);
      const quantity = Math.min(item.quantity, maxQuantity);
      out.push({
        ...item,
        quantity,
        key: keyOf(item),
        product,
        variant,
        unitPrice: variant.price!,
        lineTotal: variant.price! * quantity,
        maxQuantity,
      });
    }
    return out;
  }, [items]);

  const add = useCallback((productId: string, variantId: string, quantity = 1) => {
    const product = getProductById(productId);
    const variant = product?.variants.find((v) => v.id === variantId);
    if (!product || !isVariantPurchasable(product, variant)) return false;
    setItems((prev) => {
      const k = `${productId}::${variantId}`;
      const max = Math.min(MAX_PER_LINE, variant!.stock ?? 0);
      const existing = prev.find((i) => keyOf(i) === k);
      if (existing) return prev.map((i) => (keyOf(i) === k ? { ...i, quantity: Math.min(max, i.quantity + quantity) } : i));
      return [...prev, { productId, variantId, quantity: Math.min(max, quantity) }];
    });
    setLastAdded(`${productId}::${variantId}`);
    return true;
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0 ? prev.filter((i) => keyOf(i) !== key) : prev.map((i) => (keyOf(i) === key ? { ...i, quantity } : i)),
    );
  }, []);

  const remove = useCallback((key: string) => setItems((prev) => prev.filter((i) => keyOf(i) !== key)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<BasketContextValue>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: lines.reduce((n, l) => n + l.lineTotal, 0),
      isOpen,
      lastAdded,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add,
      setQuantity,
      remove,
      clear,
    }),
    [lines, isOpen, lastAdded, add, setQuantity, remove, clear],
  );

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}

export function useBasket() {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error("useBasket must be used inside BasketProvider");
  return ctx;
}
