import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Hides the dev-only "Rendering..." indicator pill. Purely cosmetic —
  // has no effect on the production build or real site visitors either way.
  devIndicators: false,
};

export default nextConfig;
