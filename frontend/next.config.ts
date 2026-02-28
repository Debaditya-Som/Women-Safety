import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const isAndroidBuild = process.env.BUILD_ANDROID === "true";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      // OpenStreetMap tiles – cache-first, 1 week TTL
      {
        urlPattern: /^https?:\/\/[a-c]\.tile\.openstreetmap\.org\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "osm-tiles",
          expiration: {
            maxEntries: 1000,
            maxAgeSeconds: 7 * 24 * 60 * 60,
          },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // Unsplash images – cache-first, 30 days TTL
      {
        urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "unsplash-images",
          expiration: {
            maxEntries: 60,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // Backend API – network-first, fall back to cache (1 h TTL)
      {
        urlPattern: /\/api\//i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-responses",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60,
          },
          cacheableResponse: { statuses: [0, 200] },
          networkTimeoutSeconds: 10,
        },
      },
    ],
  },
  fallbacks: {
    document: "/offline",
  },
});

const nextConfig: NextConfig = {
  images: {
    domains: ["images.unsplash.com"],
    // Required for static export used by Capacitor Android build
    unoptimized: isAndroidBuild,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Static export settings – only applied when building for Android
  ...(isAndroidBuild && {
    output: "export",
    trailingSlash: true,
  }),
};

export default withPWA(nextConfig);
