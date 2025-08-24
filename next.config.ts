import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true, // Now stable!
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Turbopack optimizations
  experimental: {
    // Optimize package imports for Turbopack
    optimizePackageImports: ["lucide-react", "radix-ui"],
  },

  // Compression settings
  compress: true,

  // Image optimization
  images: {
    remotePatterns: [{ hostname: "zm-deals-local.s3.us-east-1.amazonaws.com" }],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
