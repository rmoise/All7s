/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  env: {
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'default-project-id',
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging'
      ? process.env.NEXT_STAGING_SANITY_DATASET || 'staging'
      : process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    SANITY_TOKEN: process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging'
      ? process.env.NEXT_STAGING_SANITY_TOKEN || 'staging-token'
      : process.env.SANITY_TOKEN || 'production-token',
    NEXT_PUBLIC_NETLIFY: process.env.NEXT_PUBLIC_NETLIFY || process.env.NETLIFY || 'false',
  },

  images: {
    domains: ['i.scdn.co', 'cdn.sanity.io'], // Add any other domains you're using
    formats: ['image/avif', 'image/webp'],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), compute-pressure=*',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
