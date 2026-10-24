# TEKAURA — storefront (phase one)

Next.js 15 · React 19 · TypeScript · Tailwind CSS 4 · GSAP ScrollTrigger · Lenis

```bash
npm install
npm run dev                         # http://localhost:3000 (real catalogue: unpriced placeholders)
NEXT_DIST_DIR=.next-demo NEXT_PUBLIC_TEKAURA_DEMO=1 npx next dev -p 3001   # demo data for testing basket flows
npm run build && npm start          # production
```

## Where things live

| What | File |
|---|---|
| Products, variants, stock, prices, compatibility | `src/data/products.ts` (instructions at top of file) |
| Categories, subcategories, filters | `src/data/categories.ts` |
| Phone models list | `src/data/phone-models.ts` |
| FAQ copy | `src/data/faq.ts` |
| Site name, socials, delivery/returns summaries, help pages | `src/config/site.ts` |
| Cinematic scenes (copy, CTAs, frame sequences) | `src/config/cinematic.ts` |
| Catalogue backend adapter (swap for Shopify etc.) | `src/lib/catalog/source.ts` |
| Checkout provider (unconfigured) | `src/lib/commerce/checkout.ts` |
| Mailing-list provider (unconfigured) | `src/lib/commerce/newsletter.ts` |
| Demo data (dev/QA only) | `src/data/demo.ts` |

Prices are integer **pence**. `null` = not yet supplied and the UI says so — nothing is invented.
A product is purchasable only when `status: "active"` and a variant has `offered: true`, a `price` and `stock > 0`.

## Cinematic sequence

`src/components/cinematic/` — a sticky canvas driven by scroll progress (ScrollTrigger + Lenis).
Colour schemes: `src/config/theme.ts` (default: Graphite & Emerald; preview others with `?theme=graphite|titanium|aurora`).

Each scene draws an image-frame sequence when configured, otherwise a procedural canvas render
of the same story. Reduced-motion and low-power devices get a static, fully shoppable layout.

To connect a video clip to a scene:

```bash
scripts/extract-frames.sh path/to/clip.mp4 protection   # reveal | protection | case | power | complete
```

then paste the printed `frames: {...}` line into that scene in `src/config/cinematic.ts`.
