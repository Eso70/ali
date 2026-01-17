import type { Metadata, Viewport } from "next";
import { Background } from "@/components/ui/background";
import { TikTokPixel } from "@/components/analytics/TikTokPixel";
import { AnimatedGradientOverlay } from "@/components/ui/animated-gradient-overlay";
import "./globals.css";

// Get base URL for metadata
// In production behind Nginx reverse proxy, we use NEXT_PUBLIC_APP_URL (localhost:PORT) for internal use
// Nginx handles domain routing (domain -> localhost:PORT)
// For metadata, we'll use the domain from request headers when available
const getMetadataBase = (): string => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    return appUrl;
  }
  // Default fallback
  if (process.env.NODE_ENV === "production") {
    // In production with Nginx, use localhost since Nginx handles domain routing
    const port = process.env.PORT || 3001;
    return `http://localhost:${port}`;
  }
  // Development fallback
  const port = process.env.PORT || 3001;
  return `http://localhost:${port}`;
};

export const metadata: Metadata = {
  metadataBase: new URL(getMetadataBase()),
  title: "Ali Network",
  description:
    "Ali Network connects communities with networking opportunities tailored for growth and support.",
  icons: {
    icon: "/favicon.ico",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#4b5563",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover", // For devices with notches
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ku" dir="rtl">
      <head>
        <link rel="dns-prefetch" href="https://analytics.tiktok.com" />
        <link rel="preconnect" href="https://analytics.tiktok.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#4b5563" />
        {/* Prevent browser caching of HTML pages */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        {/* Safari/iOS specific meta tags - Required for proper iPhone functionality */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="format-detection" content="telephone=no" />
        {/* Browser compatibility meta tags */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body className="antialiased">
        <div 
          data-theme-background
          className="relative min-h-screen w-full overflow-hidden text-white"
          style={{
            background: `linear-gradient(to bottom right, var(--theme-bg-from, #0b1224), var(--theme-bg-via, #1c2d52), var(--theme-bg-to, #b7791f))`,
            backgroundAttachment: 'scroll', // Safari/iOS: Use scroll instead of fixed for better performance
            backgroundSize: '200% 200%',
            contain: 'layout style paint', // Performance optimization
            isolation: 'isolate', // Create new stacking context
          }}
          suppressHydrationWarning
        >
          {/* Animated gradient overlay */}
          <AnimatedGradientOverlay />
          <Background />
          <div className="relative z-10" suppressHydrationWarning>
            {children}
          </div>
        </div>
        <TikTokPixel />
      </body>
    </html>
  );
}
