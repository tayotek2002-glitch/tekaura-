import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BasketProvider } from "@/context/basket";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BasketDrawer } from "@/components/basket/BasketDrawer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { site } from "@/config/site";
import { defaultTheme, themeBootScript } from "@/config/theme";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — Your Phone. Reimagined.`, template: `%s · ${site.name}` },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: site.name,
    title: `${site.name} — Your Phone. Reimagined.`,
    description: site.description,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#070b09",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" data-theme={defaultTheme} className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>
        <BasketProvider>
          <SmoothScroll />
          <DemoBanner />
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <BasketDrawer />
        </BasketProvider>
      </body>
    </html>
  );
}
