import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    workerThreads: true,
    cpus: 1,
  },
};

export default nextConfig;
