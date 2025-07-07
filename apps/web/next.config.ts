import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {remotePatterns: [
    new URL("https://uploads.mangadex.org/**"),
    new URL("https://**.mangadex.network/**"),
  ]}
};

export default nextConfig;
