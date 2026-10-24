const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

/** Format integer pence as GBP, e.g. 1299 → "£12.99" */
export function formatGBP(pence: number): string {
  return gbp.format(pence / 100);
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
