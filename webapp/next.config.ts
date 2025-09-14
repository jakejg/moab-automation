import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'moonflower.coop',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
