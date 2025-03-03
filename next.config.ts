import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  
  // Skip type checking during build to speed it up
  typescript: {
    // Don't run type checking during build, this is handled separately
    ignoreBuildErrors: true,
  },
  
  // Skip any ESLint errors during build
  eslint: {
    // Don't run eslint during build, this is handled separately
    ignoreDuringBuilds: true,
  },
  
  // Force dynamic rendering for all pages (no static generation)
  experimental: {
    // Disable partial prerendering
    ppr: false,
    // Workaround for CSS loading issues
    optimizePackageImports: ['@clerk/nextjs']
  },
  
  // Environment variables that will be available at build time
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_placeholder',
  }
};

export default nextConfig;
