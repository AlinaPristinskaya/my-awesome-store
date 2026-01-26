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
    ],
  },
  // Игнорируем ошибки линтера при билде
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Игнорируем ошибки TypeScript при билде
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;