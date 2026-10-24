import type { PhoneModel } from "@/lib/catalog/types";

/**
 * Editable list of phone models the store can reference.
 *
 * Adding a model here does NOT make any product compatible with it —
 * compatibility is configured per product via its "Model" variant option
 * (see src/data/products.ts). Add future models to the end of the list.
 */
export const phoneModels: PhoneModel[] = [
  { id: "iphone-11", name: "iPhone 11", family: "iPhone 11" },
  { id: "iphone-11-pro", name: "iPhone 11 Pro", family: "iPhone 11" },
  { id: "iphone-11-pro-max", name: "iPhone 11 Pro Max", family: "iPhone 11" },

  { id: "iphone-12-mini", name: "iPhone 12 mini", family: "iPhone 12" },
  { id: "iphone-12", name: "iPhone 12", family: "iPhone 12" },
  { id: "iphone-12-pro", name: "iPhone 12 Pro", family: "iPhone 12" },
  { id: "iphone-12-pro-max", name: "iPhone 12 Pro Max", family: "iPhone 12" },

  { id: "iphone-13-mini", name: "iPhone 13 mini", family: "iPhone 13" },
  { id: "iphone-13", name: "iPhone 13", family: "iPhone 13" },
  { id: "iphone-13-pro", name: "iPhone 13 Pro", family: "iPhone 13" },
  { id: "iphone-13-pro-max", name: "iPhone 13 Pro Max", family: "iPhone 13" },

  { id: "iphone-14", name: "iPhone 14", family: "iPhone 14" },
  { id: "iphone-14-plus", name: "iPhone 14 Plus", family: "iPhone 14" },
  { id: "iphone-14-pro", name: "iPhone 14 Pro", family: "iPhone 14" },
  { id: "iphone-14-pro-max", name: "iPhone 14 Pro Max", family: "iPhone 14" },

  { id: "iphone-15", name: "iPhone 15", family: "iPhone 15" },
  { id: "iphone-15-plus", name: "iPhone 15 Plus", family: "iPhone 15" },
  { id: "iphone-15-pro", name: "iPhone 15 Pro", family: "iPhone 15" },
  { id: "iphone-15-pro-max", name: "iPhone 15 Pro Max", family: "iPhone 15" },

  { id: "iphone-16", name: "iPhone 16", family: "iPhone 16" },
  { id: "iphone-16-plus", name: "iPhone 16 Plus", family: "iPhone 16" },
  { id: "iphone-16-pro", name: "iPhone 16 Pro", family: "iPhone 16" },
  { id: "iphone-16-pro-max", name: "iPhone 16 Pro Max", family: "iPhone 16" },
  { id: "iphone-16e", name: "iPhone 16e", family: "iPhone 16" },

  { id: "iphone-17", name: "iPhone 17", family: "iPhone 17" },
  { id: "iphone-air", name: "iPhone Air", family: "iPhone 17" },
  { id: "iphone-17-pro", name: "iPhone 17 Pro", family: "iPhone 17" },
  { id: "iphone-17-pro-max", name: "iPhone 17 Pro Max", family: "iPhone 17" },
];

export const phoneModelById = new Map(phoneModels.map((m) => [m.id, m]));

export function phoneModelName(id: string): string {
  return phoneModelById.get(id)?.name ?? id;
}

export function groupModelsByFamily(ids?: string[]): { family: string; models: PhoneModel[] }[] {
  const list = ids ? phoneModels.filter((m) => ids.includes(m.id)) : phoneModels;
  const groups = new Map<string, PhoneModel[]>();
  for (const m of list) {
    if (!groups.has(m.family)) groups.set(m.family, []);
    groups.get(m.family)!.push(m);
  }
  return [...groups.entries()].map(([family, models]) => ({ family, models }));
}
