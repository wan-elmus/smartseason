/** @type {import('next').NextConfig} */

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const backendUrl = process.env.BACKEND_URL;
const url = new URL(backendUrl);

const nextConfig = {
  reactStrictMode: true,

  outputFileTracingRoot: path.join(__dirname, '../../'),

  images: {
    remotePatterns: [
      {
        protocol: url.protocol.replace(':', ''),
        hostname: url.hostname,
        port: url.port,
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/proxy/**',
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: '/v4/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_ENABLE_AI: process.env.NEXT_PUBLIC_ENABLE_AI,
    NEXT_PUBLIC_BACKEND_HOSTNAME: process.env.NEXT_PUBLIC_BACKEND_HOSTNAME || url.hostname,
  },
};

export default nextConfig;
