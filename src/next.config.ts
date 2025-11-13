import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "maps.googleapis.com",
      "lh3.googleusercontent.com",
    ],
  },
  devIndicators: {
    position: "bottom-right"
  }
};

export default nextConfig;
