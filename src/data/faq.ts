/**
 * Editable FAQ content. Answers avoid committing to delivery times, return
 * windows or guarantees — replace them with your confirmed policies.
 */
export const faq: { group: string; items: { q: string; a: string }[] }[] = [
  {
    group: "Compatibility",
    items: [
      {
        q: "How do I know a case or screen protector fits my phone?",
        a: "Every case and screen protector lists the exact phone models it has been confirmed for. Choose your model on the product page — if your model isn't listed, that product hasn't been confirmed to fit it.",
      },
      {
        q: "Which iPhone models do you support?",
        a: "We're building our range across the iPhone 11 to iPhone 17 families. Compatibility is confirmed product by product, so check each product page for your model.",
      },
      {
        q: "Will your chargers work with my phone?",
        a: "Our plugs use standard USB-A and USB-C ports. Verified power output for each plug will be listed on its product page.",
      },
    ],
  },
  {
    group: "Delivery",
    items: [
      { q: "Where do you deliver?", a: "TEKAURA serves customers in the United Kingdom. Full delivery options will be published before launch." },
      { q: "How much does delivery cost?", a: "Delivery pricing will be confirmed before launch and shown at checkout." },
    ],
  },
  {
    group: "Returns",
    items: [
      { q: "Can I return an item?", a: "Our returns policy will be published on the Returns page before launch. Your statutory rights are not affected." },
    ],
  },
  {
    group: "Installation",
    items: [
      { q: "How do I fit a screen protector without bubbles?", a: "Installation guidance will be provided for every screen protector, including our self-installation range, which is designed to make alignment simpler." },
      { q: "What is the difference between clear and privacy glass?", a: "Clear glass keeps your display looking as it does now. Privacy glass narrows the viewing angle so your screen is harder to read from the side." },
    ],
  },
];
