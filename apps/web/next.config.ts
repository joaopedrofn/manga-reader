import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {remotePatterns: [
    new URL(`${process.env.MANGADEX_UPLOADS_URL}/**` || ""),
    new URL("https://**.mangadex.network/**"),
  ]}
};

export default nextConfig;
