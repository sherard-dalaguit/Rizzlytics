import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL('https://KkqVFlzUBRB188NO.public.blob.vercel-storage.com/**'),
    ],
  },
};

export default nextConfig;
