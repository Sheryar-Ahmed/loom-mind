/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 's3.amazonaws.com'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
    ],
  },
}

module.exports = nextConfig
