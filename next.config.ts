import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
         {
        protocol: "https",
        hostname: "0dpp0x-v0.myshopify.com",
      }
    ],
  },
};

export default nextConfig;
