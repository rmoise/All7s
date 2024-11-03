const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  output: 'standalone',

  env: {
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '1gxdk71x',
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging'
      ? process.env.NEXT_PUBLIC_SANITY_DATASET || 'staging'
      : process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    SANITY_TOKEN: process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging'
      ? process.env.NEXT_STAGING_SANITY_TOKEN || 'staging-token'
      : process.env.SANITY_TOKEN || 'production-token',
    NEXT_PUBLIC_NETLIFY: process.env.NEXT_PUBLIC_NETLIFY || process.env.NETLIFY || 'false',
    NEXT_PUBLIC_SANITY_STUDIO_URL: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || 'http://localhost:3333',
    SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN,
  },

  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    domains: ['i.scdn.co', 'cdn.sanity.io', 'i1.sndcdn.com'],
    formats: ['image/avif', 'image/webp'],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.typekit.net https://*.youtube.com https://www.youtube.com https://*.youtu.be https://js.stripe.com",
              // Styles
              "style-src 'self' 'unsafe-inline' https://*.typekit.net https://use.typekit.net https://p.typekit.net",
              // Frames
              "frame-src 'self' https://*.youtube.com https://www.youtube.com https://*.youtu.be https://*.stripe.com",
              // Images
              "img-src 'self' data: https: blob: https://*.typekit.net https://*.youtube.com https://www.youtube.com https://*.youtu.be",
              // Media
              "media-src 'self' https:",
              // Connections
              "connect-src 'self' https: https://*.typekit.net https://*.stripe.com",
              // Fonts
              "font-src 'self' data: https://*.typekit.net https://use.typekit.net https://p.typekit.net",
              // Frame ancestors
              "frame-ancestors 'self' https://*.sanity.studio http://localhost:3333 http://localhost:3000",
            ].join('; '),
          },
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'compute-pressure=*',
              // Allow presentation API
              'presentation-api=*'
            ].join(', '),
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
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

  webpack: (config, { isServer }) => {
    config.resolve.alias['@components'] = path.join(__dirname, 'components');
    config.resolve.alias['@utils'] = path.join(__dirname, 'utils');
    config.resolve.alias['@pages'] = path.join(__dirname, 'pages');
    config.resolve.alias['@styles'] = path.join(__dirname, 'styles');
    config.resolve.alias['@lib'] = path.join(__dirname, 'lib');
    config.resolve.alias['@context'] = path.join(__dirname, 'context');
    // Add other aliases here if needed

    // Optimize CSS
    if (!isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        styles: {
          name: 'styles',
          test: /\.(css|scss)$/,
          chunks: 'all',
          enforce: true,
        },
      }
    }

    return config;
  },

  async rewrites() {
    return [
      {
        source: '/studio/:path*',
        destination: process.env.NODE_ENV === 'development'
          ? 'http://localhost:3333/:path*'
          : 'https://all7z.sanity.studio/:path*',
      },
    ]
  },

  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@sanity/ui', '@headlessui/react', 'lodash'],
  },
};

module.exports = nextConfig;

