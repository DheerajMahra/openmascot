import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A static marketing page: `next build` writes plain HTML to out/ for any static host.
  // No cacheComponents (unlike the studio): partial prerendering can't run in export mode.
  output: "export",
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css"
      }
    }
  }
};

export default nextConfig;
