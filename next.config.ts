import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dove-well-officially.ngrok-free.app",
        pathname: '/**'
      }
    ]
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '2xd0xqpd-3000.euw.devtunnels.ms']
    }
  }
};

export default nextConfig;
