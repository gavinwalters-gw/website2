import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // AVIF where the browser takes it (most phones), WebP otherwise: the paintings and photos are most of
  // what the site weighs.
  images: { formats: ["image/avif", "image/webp"] },
};

export default nextConfig;
