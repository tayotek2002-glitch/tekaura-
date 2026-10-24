import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // lets a demo-mode server run alongside a production build without clobbering it
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
