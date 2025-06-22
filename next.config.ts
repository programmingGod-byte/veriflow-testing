import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['lh3.googleusercontent.com', 'res.cloudinary.com'],
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

module.exports = nextConfig;

export default nextConfig;