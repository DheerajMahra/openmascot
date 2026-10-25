import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  // The editor steps only exist for a mascot id; without one, go pick a mascot.
  redirects: async () =>
    ["/make", "/animate", "/share"].map(source => ({ source, destination: "/", permanent: false })),
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
