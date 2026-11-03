import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy all /api/* requests to the Express backend on port 4000
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:4000/api/:path*",
      },
      {
        source: "/api/unsubscribe",
        destination: "http://localhost:4000/unsubscribe",
      },
    ];
  },
};

export default nextConfig;
