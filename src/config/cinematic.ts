/**
 * Homepage cinematic sequence configuration.
 *
 * Each scene can be backed by an image-frame sequence extracted from a video
 * clip (see scripts/extract-frames.sh). While `frames` is null, the scene is
 * rendered by the built-in procedural canvas renderer, so the experience is
 * fully functional before final assets exist.
 *
 * Frame files live in /public/cinematic/<scene>/<set>/0001.webp …
 */
export interface FrameSet {
  /** public path prefix, e.g. "/cinematic/reveal/desktop" */
  path: string;
  count: number;
  ext: "webp" | "jpg";
}

export interface SceneLink {
  label: string;
  href: string;
}

export interface CinematicScene {
  id: string;
  /** relative scroll length of this scene */
  weight: number;
  label: string;
  title: string[];
  kicker?: string;
  body?: string;
  callouts?: SceneLink[];
  ctas: (SceneLink & { variant: "primary" | "secondary" })[];
  layout: "split" | "left" | "center";
  frames: { desktop: FrameSet; mobile: FrameSet } | null;
}

export const cinematicScenes: CinematicScene[] = [
  {
    id: "reveal",
    weight: 1.15,
    label: "Reveal",
    title: ["Your phone.", "Reimagined."],
    kicker: "Discover a better everyday experience.",
    body: "Protect it. Power it. Make it yours.",
    ctas: [
      { label: "Explore Accessories", href: "#shop-by-category", variant: "primary" },
      { label: "Shop All Products", href: "/shop", variant: "secondary" },
    ],
    layout: "split",
    frames: null,
  },
  {
    id: "protection",
    weight: 1.35,
    label: "Protection",
    title: ["Protect", "what matters."],
    body: "Everyday protection, made simple.",
    callouts: [
      { label: "Clear Glass", href: "/shop/screen-protectors?sub=clear" },
      { label: "Privacy Glass", href: "/shop/screen-protectors?sub=privacy" },
      { label: "Self-Installation Glass", href: "/shop/screen-protectors?sub=magic-clear" },
    ],
    ctas: [{ label: "Shop Screen Protectors", href: "/shop/screen-protectors", variant: "primary" }],
    layout: "left",
    frames: null,
  },
  {
    id: "case",
    weight: 1.35,
    label: "Case",
    title: ["Make it", "yours."],
    body: "Find the case that fits your everyday.",
    callouts: [
      { label: "Clear Cases", href: "/shop/phone-cases?sub=clear" },
      { label: "Black Silicone Cases", href: "/shop/phone-cases?sub=black-silicone" },
    ],
    ctas: [{ label: "Shop Phone Cases", href: "/shop/phone-cases", variant: "primary" }],
    layout: "left",
    frames: null,
  },
  {
    id: "power",
    weight: 1.35,
    label: "Power",
    title: ["Power your", "everyday."],
    body: "Find your perfect charging setup.",
    callouts: [
      { label: "Charging Plugs", href: "/shop/charging-plugs" },
      { label: "Charging Cables", href: "/shop/charging-cables" },
      { label: "Travel Adapters", href: "/shop/travel-accessories" },
    ],
    ctas: [{ label: "Explore Charging", href: "/shop/charging-plugs", variant: "primary" }],
    layout: "left",
    frames: null,
  },
  {
    id: "complete",
    weight: 1.2,
    label: "Complete",
    title: ["The complete", "refresh."],
    body: "Protection. Power. Style. All in one place.",
    ctas: [
      { label: "Shop All Accessories", href: "/shop", variant: "primary" },
      { label: "Explore Bundles", href: "/shop/bundles", variant: "secondary" },
    ],
    layout: "center",
    frames: null,
  },
];
