/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  env: {
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'default-project-id',
    NEXT_PUBLIC_SANITY_DATASET:
      process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging'
        ? process.env.NEXT_STAGING_SANITY_DATASET || 'staging'
        : process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    NEXT_PUBLIC_SANITY_TOKEN:
      process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging'
        ? process.env.NEXT_STAGING_SANITY_TOKEN || 'staging-token'
        : process.env.NEXT_PUBLIC_SANITY_TOKEN || 'production-token',
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
