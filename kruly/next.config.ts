import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tambahkan blok experimental ini
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000', 
        '*.app.github.dev', 
        '*.github.dev'
      ],
    },
  },
  // (Jika sebelumnya ada pengaturan lain di sini, biarkan saja / jangan dihapus)
};

export default nextConfig;