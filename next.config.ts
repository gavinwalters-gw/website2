import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // AVIF where the browser takes it (most phones), WebP otherwise: the paintings and photos are most of
  // what the site weighs.
  images: { formats: ["image/avif", "image/webp"] },
  // RSVPs can carry a wedding photo. The browser shrinks it to a 1600px JPEG first, but leave room for
  // the odd one it can't.
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
};

export default nextConfig;
