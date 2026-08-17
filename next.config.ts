import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // picsum.photos backs the seeded listing photos (prisma/seed.ts) until
    // real listing images exist.
    remotePatterns: [{ hostname: "picsum.photos" }],
  },
};

export default nextConfig;
