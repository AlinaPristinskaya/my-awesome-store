/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // ДОДАЄМО НОВІ ДОМЕНИ:
      {
        protocol: 'https',
        hostname: 'garnagospodynya.com.ua',
      },
      {
        protocol: 'https',
        hostname: 'images.ua.prom.st',
      },
      {
        protocol: 'https',
        hostname: 'images.prom.ua',
      },
    ],
  },
  // Ігноруємо помилки лінтера при білді
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ігноруємо помилки TypeScript при білді
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;