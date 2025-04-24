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
  }
};

export default nextConfig;
