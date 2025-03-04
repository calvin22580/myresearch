/** @type {import('next').NextConfig} */
const nextConfig = {
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
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || 'sk_placeholder',
    DATABASE_URL: process.env.DATABASE_URL,
  },

  // Enhanced webpack configuration for Node.js module fallbacks
  webpack: (config, { isServer }) => {
    // Provide fallbacks for Node.js built-in modules
    config.resolve.fallback = { 
      fs: false,
      path: false,
      os: false,
      crypto: false,
      net: false,
      tls: false,
      perf_hooks: false,
      stream: require.resolve('stream-browserify')
    };
    
    // Handle node: protocol imports
    config.resolve.alias = {
      ...config.resolve.alias,
      'node:stream': require.resolve('stream-browserify'),
      'node:buffer': require.resolve('buffer/'),
      'node:util': require.resolve('util/'),
      'node:events': require.resolve('events/'),
      'node:string_decoder': require.resolve('string_decoder/'),
      'node:process': require.resolve('process/browser'),
    };
    
    // Add polyfill plugins if not in server context
    if (!isServer) {
      config.plugins.push(
        new (require('webpack')).ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        })
      );
    }
    
    return config;
  }
};

module.exports = nextConfig; 