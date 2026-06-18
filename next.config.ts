import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.ctu.edu.vn',
      },
    ],
  },
};

export default nextConfig;
