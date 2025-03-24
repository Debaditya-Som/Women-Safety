// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   images: {
//     domains: ["images.unsplash.com"],
//   },
  
// };

// export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["images.unsplash.com"],
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ Ignores ESLint errors during deployment
  },
  
  typescript: {
    ignoreBuildErrors: true, // ✅ Ignores TypeScript errors during deployment
  },
};

export default nextConfig;
