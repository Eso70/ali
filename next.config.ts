import type { NextConfig } from "next";

// Get allowed CORS origins from environment variable (comma-separated)
const getAllowedCorsOrigins = (): string[] => {
  const corsOrigins = process.env.CORS_ALLOWED_ORIGINS || process.env.ALLOWED_DEV_ORIGINS;
  if (corsOrigins) {
    return corsOrigins.split(',').map(origin => origin.trim()).filter(Boolean);
  }
  // Default: allow localhost with PORT from env
  const port = process.env.PORT || 3001;
  return [`http://localhost:${port}`];
};

// Get allowed origins for Next.js dev server
const getAllowedDevOrigins = (): string[] => {
  const origins = process.env.ALLOWED_DEV_ORIGINS;
  if (origins) {
    return origins.split(',').map(origin => origin.trim()).filter(Boolean);
  }
  // Default fallback
  return ["192.168.1.2", "localhost", "127.0.0.1", "0.0.0.0"];
};

const nextConfig: NextConfig = {
  // Standard Next.js configuration
  reactStrictMode: true,
  
  // Production optimizations
  compress: process.env.NODE_ENV === 'production',
  poweredByHeader: false, // Remove X-Powered-By header for security
  
  // Allow cross-origin requests in development (for network access)
  // Origins are read from ALLOWED_DEV_ORIGINS environment variable
  allowedDevOrigins: getAllowedDevOrigins(),
  
  // Enable SWC minification for better performance (Next.js 16+ uses SWC by default)
  // SWC is faster than Terser and produces smaller bundles
  
  // Image optimization - NO CACHING - Browser compatible
  images: {
    // Browser compatibility: WebP is widely supported, AVIF for modern browsers
    // Next.js automatically serves appropriate format based on browser support
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 85], // Add quality 85 to fix the warning
    minimumCacheTTL: 0, // NO CACHE - always fetch fresh images
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Safari/iOS: Ensure images load properly
    unoptimized: true, // Disable Next.js optimization to prevent 400 errors
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        pathname: '/**',
      },
    ],
  },
  
  // Experimental features for performance
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'react-icons',
    ],
  },
  
  // Rewrite /images/upload/ to API route for serving uploaded images
  // This is needed because Next.js doesn't serve files added to public/ after build
  async rewrites() {
    return [
      {
        source: '/images/upload/:path*',
        destination: '/api/images/:path*',
      },
    ];
  },
  
  // Headers for security, CORS, and NO CACHING
  async headers() {
    const allowedOrigins = getAllowedCorsOrigins();
    // Use first allowed origin (restricted CORS - not wildcard)
    // Fallback to localhost if no origins configured
    const port = process.env.PORT || 3001;
    const corsOrigin = allowedOrigins.length > 0 ? allowedOrigins[0] : `http://localhost:${port}`;
    
    const securityHeaders = [
      // CORS - Allow specific origin (restricted, not wildcard)
      {
        key: 'Access-Control-Allow-Origin',
        value: corsOrigin
      },
      {
        key: 'Access-Control-Allow-Methods',
        value: 'GET, POST, PUT, DELETE, OPTIONS, PATCH'
      },
      {
        key: 'Access-Control-Allow-Headers',
        value: 'Content-Type, Authorization, X-Requested-With'
      },
      {
        key: 'Access-Control-Allow-Credentials',
        value: 'true'
      },
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on'
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY'
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block'
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin'
      },
      {
        key: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://analytics.tiktok.com https://*.tiktok.com https://vercel.live https://*.vercel.live https://*.vercel.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data: https://analytics.tiktok.com https://*.tiktok.com; connect-src 'self' https://analytics.tiktok.com https://*.tiktok.com https://*.tiktokw.us https://*.tiktokcdn.com https://*.byteoversea.com https://*.ibyteimg.com https://*.snssdk.com https://*.muscdn.com https://ads.tiktok.com https://vercel.live https://*.vercel.live https://*.vercel.com https://*.vercel.app wss://*.vercel.live wss://*.vercel.com; frame-src 'self' https://vercel.live https://*.vercel.live https://*.vercel.com; frame-ancestors 'none';"
      },
      // NO CACHING - Always fetch fresh
      {
        key: 'Cache-Control',
        value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      },
      {
        key: 'Pragma',
        value: 'no-cache',
      },
      {
        key: 'Expires',
        value: '0',
      },
    ];

    // Add HSTS only in production
    if (process.env.NODE_ENV === 'production') {
      securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload'
      });
    }
    
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      // Cache static assets for performance (reduces function invocations on free hosting)
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
};

export default nextConfig;
