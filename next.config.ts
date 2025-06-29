import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com', // Google profile images
      'avatars.githubusercontent.com', // GitHub avatars (if needed)
      'graph.facebook.com', // Facebook avatars (if needed)
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
