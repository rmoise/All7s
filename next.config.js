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
    SANITY_STUDIO_PATH: 'fresh_sanity_studio',
    SANITY_PREVIEW_SECRET: process.env.SANITY_PREVIEW_SECRET || '',
    NEXT_PUBLIC_PREVIEW_SECRET: process.env.SANITY_PREVIEW_SECRET || '',
  },

  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    domains: ['cdn.sanity.io', 'i.scdn.co'],
    formats: ['image/avif', 'image/webp'],
  },

  webpack: (config, { isServer, dev }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@components': path.join(__dirname, 'components'),
      '@utils': path.join(__dirname, 'utils'),
      '@pages': path.join(__dirname, 'pages'),
      '@styles': path.join(__dirname, 'styles'),
      '@lib': path.join(__dirname, 'lib'),
      '@context': path.join(__dirname, 'context'),
    };

    if (dev && !isServer) {
      config.optimization = {
        minimize: false,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
          },
        },
      };
    }

    return config;
  },

  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'all7z.com'],
      bodySizeLimit: '2mb'
    },
    optimizePackageImports: ['@sanity/ui', '@headlessui/react', 'lodash']
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
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://*.youtube.com http://*.youtube.com https://*.stripe.com https://*.typekit.net",
              // Styles
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.typekit.net",
              "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.typekit.net",
              // Images
              "img-src 'self' data: blob: https: http:",
              // Media
              "media-src 'self' https://*.scdn.co https://*.spotify.com https://*.ytimg.com https://*.imagekit.io blob:",
              // Fonts
              "font-src 'self' data: https://fonts.gstatic.com https://*.typekit.net",
              // Connect
              "connect-src 'self' https: wss:",
              // Frames
              [
                "frame-src 'self'",
                "https://www.youtube.com",
                "https://youtube.com",
                "https://*.youtube.com",
                "http://*.youtube.com",
                "https://open.spotify.com",
                "https://*.stripe.com",
                "https://js.stripe.com",
                "https://w.soundcloud.com",
                "https://*.soundcloud.com"
              ].join(' '),
              // Objects
              "object-src 'none'",
              // Manifests
              "manifest-src 'self'"
            ].join('; ')
          }
        ]
      }
    ]
  },

  compiler: {
    styledComponents: true,
  },

  devServer: {
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
};

module.exports = nextConfig;

