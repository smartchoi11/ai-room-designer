import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.219.100",
    "192.168.219.100:3002",
    "localhost:3002",
    "resulted-trace-boxing-functions.trycloudflare.com",
    "*.trycloudflare.com",
  ],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
