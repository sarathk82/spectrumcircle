import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@spectrumcircle/shared', '@spectrumcircle/ui'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3002'],
    },
  },
}

export default nextConfig
