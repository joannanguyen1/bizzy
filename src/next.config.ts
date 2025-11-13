import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "maps.googleapis.com",
      "lh3.googleusercontent.com",
    ],
  },
  devIndicators: false
};

export default nextConfig;
