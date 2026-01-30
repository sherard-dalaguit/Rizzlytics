import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [25, 50, 75, 100],
    remotePatterns: [
      new URL('https://KkqVFlzUBRB188NO.public.blob.vercel-storage.com/**'),
      {
        protocol: 'https',
        hostname: "lh3.googleusercontent.com",
        port: ""
      },
      {
        protocol: 'https',
        hostname: "avatars.githubusercontent.com",
        port: ""
      }
    ],
  },
};

export default nextConfig;
