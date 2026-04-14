/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Opt out of Turbopack in Next.js 16+ to avoid webpack config conflict
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
};

module.exports = nextConfig;
