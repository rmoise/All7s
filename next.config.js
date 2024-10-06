/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  env: {
    // Making sure these environment variables are passed down to the client
    NEXT_PUBLIC_SANITY_DATASET:
      process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging'
        ? process.env.NEXT_STAGING_SANITY_DATASET
        : process.env.NEXT_PUBLIC_SANITY_DATASET,
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    NEXT_PUBLIC_SANITY_TOKEN:
      process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging'
        ? process.env.NEXT_STAGING_SANITY_TOKEN
        : process.env.NEXT_PUBLIC_SANITY_TOKEN,
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
