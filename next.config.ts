import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    localPatterns: [{ pathname: "/uploads/**" }],
  },
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
