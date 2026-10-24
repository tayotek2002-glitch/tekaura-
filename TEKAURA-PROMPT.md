TEKAURA — Website Build Prompt

You are a senior full-stack developer, creative director and e-commerce architect. BUILD the website, don't just describe it.

PROJECT
TEKAURA is a UK phone-accessories and consumer-tech brand. Currency GBP (£). Positioning: premium-looking, accessible everyday technology. Build an Awwwards-quality, cinematic, scroll-interactive e-commerce site with Apple-style product presentation that is also a fully usable shop. This is phase one: design, categories, animations and an editable catalogue. Real products, photos, prices and checkout come later.

EXISTING CODE
A working first version already exists at github.com/tayotek2002-glitch/tekaura- (Next.js 15, React 19, TypeScript, Tailwind CSS 4, GSAP ScrollTrigger, Lenis). If you can access it, continue from that code instead of starting again. Read README.md first; it maps every file.

TECH
Next.js (App Router) + React + TypeScript + Tailwind CSS + GSAP ScrollTrigger + Lenis smooth scroll. Static generation where possible, good SEO metadata, sitemap and robots, accessible and keyboard-navigable, mobile-first (most customers are on iPhone), no horizontal overflow, touch-friendly buttons.

COLOURS — "Graphite & Emerald"
Near-black graphite backgrounds for cinematic sections (#070b09, #0e1411, #151d19), soft grey-green light sections for shopping (#f3f6f3, #e4eae5), white product cards, emerald accent #17845a (bright #3fd19a for highlights on dark; keep white text on the accent at 4.5:1 contrast or better). Typography: Geist Sans and Geist Mono, huge tight uppercase editorial headlines, generous whitespace, short confident copy, no marketing jargon. Put all colours in design tokens so the scheme can be switched in one place.

HOMEPAGE — SCROLL-DRIVEN CINEMATIC SEQUENCE (most important feature)
A sticky full-screen canvas whose animation is controlled by scroll position (forwards and backwards), not autoplaying video. One unbranded graphite smartphone is upgraded with accessories as you scroll:
1. REVEAL: phone rotates into view in a dark studio with a light sweep. "YOUR PHONE. REIMAGINED." Small text: "Discover a better everyday experience." Supporting: "Protect it. Power it. Make it yours." CTAs: Explore Accessories, Shop All Products.
2. PROTECTION: a glass screen protector descends and bonds to the screen with a light sweep (no bubbles). "PROTECT WHAT MATTERS." / "Everyday protection, made simple." Callouts: Clear Glass, Privacy Glass, Self-Installation Glass. CTA: Shop Screen Protectors.
3. CASE: phone turns to show its back; a clear case slides on and snaps into place. "MAKE IT YOURS." / "Find the case that fits your everyday." Callouts: Clear Cases, Black Silicone Cases. CTA: Shop Phone Cases.
4. POWER: camera moves to the bottom edge; a USB-C cable plugs in; a charging ring appears on screen; emerald light accents. "POWER YOUR EVERYDAY." / "Find your perfect charging setup." Callouts: Charging Plugs, Charging Cables, Travel Adapters. CTA: Explore Charging.
5. COMPLETE: camera pulls back as the upgraded phone rotates in studio light. "THE COMPLETE REFRESH." / "Protection. Power. Style. All in one place." CTAs: Shop All Accessories, Explore Bundles.
Build it with a procedural canvas renderer first, so it works with no video assets. Also support swapping each scene for an image-frame sequence extracted from video clips (desktop and mobile frame sets, progressive loading, crossfades between scenes), plus a script that turns an .mp4 into WebP frames. Include a scene progress rail, "Skip to shop", a "Concept visualisation" label, scroll-linked text reveals, and keyboard-reachable CTAs. Reduced-motion users and low-power devices get a static, fully shoppable version. Animation must never block shopping.

NAVIGATION
Sticky header: wordmark, Home, Shop All (mega menu of every category), Charging Plugs, Charging Cables, Screen Protectors, Phone Cases, Headphones, Travel Accessories, Bundles (dropdowns of subcategories), search (live results, "/" shortcut, search page), account placeholder, basket with count. Full-screen mobile menu with expandable categories.

CATALOGUE (editable data files, never hard-coded in the UI; adapter layer so Shopify or another backend can be plugged in later)
Product fields: id, slug, title, category, subcategory, description, images, options, variants (options, offered, price in pence, stock), compatibility, verified specifications, attributes for filters, status (draft / coming_soon / active / archived), featured, tags, related products, optional 360° spin frames, reviews (genuine only).
A. Charging Plugs (UK three-pin): Single USB-A; Dual USB-A; Single USB-C; Dual USB-C; USB-A + USB-C; Dual USB-A + USB-C; USB-A + Dual USB-C; Triple USB-C; Dual USB-A + Dual USB-C; Triple USB-C + USB-A. Filters: connector type, number of ports, verified wattage. Collections: Standard, Fast, GaN.
B. Charging Cables: USB-A→Lightning, USB-A→USB-C, USB-C→Lightning, USB-C→USB-C. Lengths 1 m / 2 m / 3 m, Standard or Braided finish, optional colours, independent price and stock per variant. Only show combinations marked as offered.
C. Screen Protectors: Clear, Privacy, 9H Tempered Glass, Magic Self-Installation Clear, Magic Self-Installation Privacy. Packs: Single, Pack of 2, Pack of 3. Phone-model selector (iPhone 11 to iPhone 17 families plus future models), with compatibility configured PER PRODUCT.
D. Phone Cases: Clear, Black Silicone, each with a model selector. Leave room for future MagSafe, protective and coloured silicone collections.
E. Headphones: White / Black Wireless Earbuds, Black / White Over-Ear Headphones.
F. Travel Accessories: Universal, USB, USB-C and Multi-Port travel adapters.
G. Bundles: 3-Pack Screen Protectors, Plug + Cable, Case + Screen Protector, Phone Essentials, Travel Essentials. Configurable components, model compatibility and individual pricing; not purchasable until configured.
Until real photos exist, use neutral SVG product illustrations driven by the data (e.g. a plug draws its actual ports), clearly labelled "Concept illustration".

PAGES
Shop All and category pages: dark hero, collection chips, filters (side panel on desktop, bottom sheet on mobile), sorting (featured, newest, price low to high, price high to low, A–Z), filter state kept in the URL.
Product page: gallery, title, price, option chips, model selector, quantity, Add to Basket, live stock status, verified specs only, delivery and returns, related accessories, reviews only when real ones exist.
Also: basket page, checkout page, account placeholder, help and policy pages (Delivery, Returns, Contact, Installation, Privacy, Terms, Cookies) awaiting my copy, and a 404 page.

HOMEPAGE SECTIONS AFTER THE FILM
Shop by Category (bento grid with hover motion); Popular Products (shows featured items as "launching soon" until products are purchasable); Build Your Own Phone Refresh (pick model, then screen protector, case, optional charger and optional cable; only show products confirmed for that model; live itemised preview using real configured prices; no discount claims); The TEKAURA Experience (editorial brand section); FAQ accordion (compatibility, delivery, returns, installation); email signup; footer with shop links, customer service, policies, social links and copyright.

SHOPPING
Working basket drawer: add, adjust quantity, remove, subtotal, empty state, saved in browser storage, only purchasable items allowed. Checkout must stay modular and unconfigured. No fake payments, never collect card details, show a clear "checkout not yet available" message. Email signup must say addresses are not saved until a provider is connected. Include a demo-data mode switched on by an environment variable, clearly bannered, for testing the basket without inventing real prices.

ESSENTIAL RULES
- Never invent prices, stock, ratings, reviews, testimonials, specifications, wattages, certifications or warranties. Use honest placeholders such as "Price to be confirmed".
- Clearly label concept imagery.
- Keep the TEKAURA name consistent.
- Make every link, filter, selector and basket action actually work.
- Test on mobile and desktop in a real browser and fix any issues you find.
- At the end, explain what is implemented, what is a placeholder, and what I need to provide next.

OPTIONAL: HIGGSFIELD ASSETS (only if connected, and only after I approve the credit cost)
Generate one master image of an unbranded graphite smartphone in a dark studio, then five silent 16:9 Seedance 2.0 clips (Reveal, Protector, Case, Charging, Final). Each clip starts from the previous clip's last frame for continuity. Extract frames and connect them to the scroll sequence. Quote the exact cost before generating anything.
