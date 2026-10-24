import { categories } from "@/data/categories";

export interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
  mega?: boolean;
}

const catNav: NavItem[] = categories.map((c) => ({
  label: c.name,
  href: `/shop/${c.slug}`,
  children: c.subcategories.length
    ? c.subcategories.map((s) => ({ label: s.name, href: `/shop/${c.slug}?sub=${s.slug}` }))
    : undefined,
}));

/** Primary navigation — order matches the brief. */
export const primaryNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Shop All", href: "/shop", mega: true },
  ...catNav,
];
