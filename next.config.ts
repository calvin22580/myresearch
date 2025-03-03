import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  experimental: {
    // Disable static generation for problematic pages
    ppr: false,
    // Workaround for CSS loading issues
    optimizePackageImports: ['@clerk/nextjs']
  }
};

export default nextConfig;
