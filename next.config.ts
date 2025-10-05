import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.bmkg.go.id',
        port: '',
        pathname: '/web/bmkg_upload/cuaca/icon-cuaca/**',
      },
    ],
  },
};

export default nextConfig;
