/**
 * Site-wide editable settings. Social links are left empty until real
 * accounts exist — empty entries are not rendered.
 */
export const site = {
  name: "TEKAURA",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description: "Premium-looking, accessible everyday technology. Phone protection, charging and accessories for the UK.",
  tagline: "Protect it. Power it. Make it yours.",
  social: [
    { name: "Instagram", href: "" },
    { name: "TikTok", href: "" },
    { name: "X", href: "" },
    { name: "YouTube", href: "" },
  ],
  /** Shown on product pages. Replace with your confirmed policy summary. */
  deliverySummary: null as string | null,
  returnsSummary: null as string | null,
};

export const helpPages = [
  { slug: "delivery", title: "Delivery" },
  { slug: "returns", title: "Returns & Refunds" },
  { slug: "contact", title: "Contact Us" },
  { slug: "installation", title: "Installation Guides" },
  { slug: "privacy", title: "Privacy Policy" },
  { slug: "terms", title: "Terms & Conditions" },
  { slug: "cookies", title: "Cookie Policy" },
] as const;
