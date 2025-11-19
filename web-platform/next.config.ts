import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Allow access from network for mobile testing
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
