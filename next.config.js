/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  // This is important for CapRover deployment
  output: 'standalone',
}

module.exports = nextConfig 