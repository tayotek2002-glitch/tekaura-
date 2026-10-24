import type { Category } from "@/lib/catalog/types";

/**
 * Editable category definitions. Order here = order in navigation and grids.
 * `facets` define which filters appear on the category page.
 */
export const categories: Category[] = [
  {
    slug: "charging-plugs",
    name: "Charging Plugs",
    shortName: "Plugs",
    tagline: "Power, wherever the wall is.",
    description: "UK three-pin wall chargers with USB-A and USB-C configurations.",
    placeholder: { kind: "plug", usbA: 1, usbC: 2 },
    subcategories: [
      { slug: "standard", name: "Standard Charging" },
      { slug: "fast", name: "Fast Charging" },
      { slug: "gan", name: "GaN" },
    ],
    facets: [
      { key: "connectors", label: "Connector type", source: "attribute", order: ["USB-A", "USB-C"] },
      { key: "ports", label: "Number of ports", source: "attribute" },
      { key: "wattage", label: "Verified wattage", source: "attribute" },
    ],
  },
  {
    slug: "charging-cables",
    name: "Charging Cables",
    shortName: "Cables",
    tagline: "The right connection, every time.",
    description: "USB-A, USB-C and Lightning cables in multiple lengths and finishes.",
    placeholder: { kind: "cable", from: "USB-C", to: "USB-C", braided: true },
    subcategories: [
      { slug: "usb-a-to-lightning", name: "USB-A to Lightning" },
      { slug: "usb-a-to-usb-c", name: "USB-A to USB-C" },
      { slug: "usb-c-to-lightning", name: "USB-C to Lightning" },
      { slug: "usb-c-to-usb-c", name: "USB-C to USB-C" },
    ],
    facets: [
      { key: "Length", label: "Length", source: "option", order: ["1 m", "2 m", "3 m"] },
      { key: "Finish", label: "Finish", source: "option", order: ["Standard", "Braided"] },
      { key: "Colour", label: "Colour", source: "option" },
    ],
  },
  {
    slug: "screen-protectors",
    name: "Screen Protectors",
    shortName: "Protection",
    tagline: "Everyday protection, made simple.",
    description: "Clear, privacy, tempered and self-installation glass.",
    placeholder: { kind: "protector", variant: "clear" },
    subcategories: [
      { slug: "clear", name: "Clear Screen Protectors" },
      { slug: "privacy", name: "Privacy Screen Protectors" },
      { slug: "tempered-9h", name: "9H Tempered Glass" },
      { slug: "magic-clear", name: "Magic Self-Installation Clear" },
      { slug: "magic-privacy", name: "Magic Self-Installation Privacy" },
    ],
    facets: [
      { key: "Model", label: "Phone model", source: "option" },
      { key: "Pack", label: "Pack size", source: "option", order: ["Single", "Pack of 2", "Pack of 3"] },
    ],
  },
  {
    slug: "phone-cases",
    name: "Phone Cases",
    shortName: "Cases",
    tagline: "Find the case that fits your everyday.",
    description: "Clear and black silicone cases, made for your exact model.",
    placeholder: { kind: "case", finish: "clear" },
    subcategories: [
      { slug: "clear", name: "Clear Phone Cases" },
      { slug: "black-silicone", name: "Black Silicone Cases" },
    ],
    futureCollections: ["MagSafe Cases", "Protective Cases", "Coloured Silicone Cases"],
    facets: [{ key: "Model", label: "Phone model", source: "option" }],
  },
  {
    slug: "headphones",
    name: "Headphones",
    shortName: "Audio",
    tagline: "Sound for the in-between moments.",
    description: "Wireless earbuds and over-ear headphones in black and white.",
    placeholder: { kind: "earbuds", colour: "white" },
    subcategories: [
      { slug: "earbuds", name: "Wireless Earbuds" },
      { slug: "over-ear", name: "Over-Ear Headphones" },
    ],
    facets: [{ key: "colour", label: "Colour", source: "attribute", order: ["White", "Black"] }],
  },
  {
    slug: "travel-accessories",
    name: "Travel Accessories",
    shortName: "Travel",
    tagline: "Ready for every socket on the map.",
    description: "Universal, USB and multi-port travel adapters.",
    placeholder: { kind: "adapter", variant: "universal" },
    subcategories: [
      { slug: "universal", name: "Universal Travel Adapters" },
      { slug: "usb", name: "USB Travel Adapters" },
      { slug: "usb-c", name: "USB-C Travel Adapters" },
      { slug: "multi-port", name: "Multi-Port Travel Adapters" },
    ],
    facets: [],
  },
  {
    slug: "bundles",
    name: "Bundles",
    shortName: "Bundles",
    tagline: "Everything you need, together.",
    description: "Curated sets of protection, power and style.",
    placeholder: { kind: "bundle", items: ["case", "protector", "plug"] },
    subcategories: [],
    facets: [],
  },
];

export const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
