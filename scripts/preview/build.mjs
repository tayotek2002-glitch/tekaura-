/**
 * Builds a static, self-contained preview of the site for hosting as a
 * claude.ai Artifact (or any static host). Requires the production server:
 *
 *   npm run build && npx next start -p 3000
 *   node scripts/preview/build.mjs <out-dir> [http://localhost:3000]
 *
 * Output: <out>/index.html (homepage content, no <html>/<head> wrapper — the
 * artifact host adds one), <out>/pages/*.html (full documents), styles.css,
 * app.js and media/ (fonts).
 */
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// Playwright is used from the machine's global install (not a project dependency)
const { chromium } = createRequire(import.meta.url)("playwright");

const OUT = path.resolve(process.argv[2] ?? "preview-out");
const BASE = process.argv[3] ?? "http://localhost:3000";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, "pages"), { recursive: true });
fs.mkdirSync(path.join(OUT, "media"), { recursive: true });

// ── routes ────────────────────────────────────────────────────────────────
const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
const fromSitemap = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const helpSlugs = ["delivery", "returns", "contact", "installation", "privacy", "terms", "cookies"];
const routes = [...new Set([...fromSitemap, ...helpSlugs.map((s) => `/help/${s}`), "/account", "/basket", "/checkout"])];

const fileFor = (route) => (route === "/" ? null : `${route.slice(1).replace(/\//g, "-")}.html`);
const known = new Set(routes);

function rewriteLinks(html, fromMain) {
  html = html.replace(/src="\/products\//g, `src="${fromMain ? "" : "../"}products/`);
  return html.replace(/href="(\/[^"]*)"/g, (_, href) => {
    const u = new URL(href, BASE);
    let route = u.pathname.replace(/\/$/, "") || "/";
    if (!known.has(route)) route = "/shop"; // e.g. /search
    const hash = u.hash;
    if (route === "/") return `href="${fromMain ? "./" : "../"}${hash}"`;
    return `href="${fromMain ? "pages/" : ""}${fileFor(route)}${hash}"`;
  });
}

// ── capture ───────────────────────────────────────────────────────────────
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
let cssHrefs = new Set();
let bodyClass = "";

for (const route of routes) {
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const snap = await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.querySelectorAll("script, next-route-announcer, template, link[rel=preload]").forEach((n) => n.remove());
    return {
      title: document.title,
      bodyClass: document.body.className,
      css: [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href),
      body: document.body.innerHTML,
    };
  });
  snap.css.forEach((h) => cssHrefs.add(h));
  bodyClass = snap.bodyClass;
  // reveal-on-scroll items captured mid-state should rest visible
  const body = snap.body.replace(/ translate-y-8 opacity-0/g, "");
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

  if (route === "/") {
    fs.writeFileSync(
      path.join(OUT, "index.html"),
      `<title>TEKAURA</title>\n<link rel="stylesheet" href="styles.css">\n` +
        `<div class="${snap.bodyClass}">${rewriteLinks(body, true)}</div>\n<script src="app.js"></script>\n`,
    );
  } else {
    fs.writeFileSync(
      path.join(OUT, "pages", fileFor(route)),
      `<!doctype html><html lang="en-GB"><head><meta charset="utf-8">` +
        `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` +
        `<title>${esc(snap.title)}</title><link rel="stylesheet" href="../styles.css"></head>` +
        `<body class="${snap.bodyClass}">${rewriteLinks(body, false)}<script src="../app.js"></script></body></html>\n`,
    );
  }
}
await browser.close();

// ── stylesheet + fonts ────────────────────────────────────────────────────
let css = "";
for (const href of cssHrefs) css += (await (await fetch(href)).text()) + "\n";
const fonts = new Set([...css.matchAll(/url\((\/_next\/static\/media\/[^)]+)\)/g)].map((m) => m[1]));
for (const f of fonts) {
  const buf = Buffer.from(await (await fetch(BASE + f)).arrayBuffer());
  fs.writeFileSync(path.join(OUT, "media", path.basename(f)), buf);
}
css = css.replace(/url\(\/_next\/static\/media\/([^)]+)\)/g, "url(media/$1)");
// the host page sets its own data-theme (light/dark), so pin the brand scheme to :root
css = css.replace(/html\[data-theme=["']?emerald["']?\]/g, ":root");
// font variables normally sit on <body>; also expose them on :root for the host-wrapped homepage
const vars = [...css.matchAll(/\.__variable_[\w-]+\{([^}]*)\}/g)].map((m) => m[1]).join(";");
css += `\n:root{${vars}}\n`;
fs.writeFileSync(path.join(OUT, "styles.css"), css);

// ── product photos ────────────────────────────────────────────────────────
const photos = path.join(ROOT, "public/products");
if (fs.existsSync(photos)) fs.cpSync(photos, path.join(OUT, "products"), { recursive: true });

// ── runtime ───────────────────────────────────────────────────────────────
execFileSync("npx", ["--yes", "esbuild@0.24.0", path.join(ROOT, "scripts/preview/app.ts"), "--bundle", "--minify", "--format=iife", "--target=es2019", `--outfile=${path.join(OUT, "app.js")}`], { stdio: "inherit" });

console.log(`preview: ${routes.length} pages, ${fonts.size} fonts, bodyClass="${bodyClass}" → ${OUT}`);
