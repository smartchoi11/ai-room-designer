import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.219.100", "192.168.219.100:3002", "localhost:3002"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
