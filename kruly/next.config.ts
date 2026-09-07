import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverActions: {
    allowedOrigins: [
      "*.github.dev", 
      "*.app.github.dev", 
      "localhost:3000"
    ]
  }
};

export default nextConfig;