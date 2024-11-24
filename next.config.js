const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from all possible locations
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.development' });
dotenv.config({ path: '.env.development.local' });

// Initialize token with fallbacks
const token = process.env.SANITY_AUTH_TOKEN ||
              process.env.SANITY_STUDIO_API_TOKEN ||
              process.env.NEXT_PUBLIC_SANITY_TOKEN;

console.log('Next.js Config Token Status:', {
  hasToken: !!token,
  tokenLength: token?.length,
  environment: process.env.NODE_ENV,
  envVars: {
    SANITY_AUTH_TOKEN: !!process.env.SANITY_AUTH_TOKEN,
    SANITY_STUDIO_API_TOKEN: !!process.env.SANITY_STUDIO_API_TOKEN,
    NEXT_PUBLIC_SANITY_TOKEN: !!process.env.NEXT_PUBLIC_SANITY_TOKEN,
  }
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'all7z.com', '*.netlify.app']
    }
  },
  serverExternalPackages: [],
  generateBuildId: async () => {
    return process.env.BUILD_ID || 'development'
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
      '@components': path.resolve(__dirname, 'components'),
      '@lib': path.resolve(__dirname, 'lib'),
      '@utils': path.resolve(__dirname, 'utils'),
      '@context': path.resolve(__dirname, 'context'),
      '@blocks': path.resolve(__dirname, 'components/blocks'),
      '@blog': path.resolve(__dirname, 'components/blog'),
      '@app': path.resolve(__dirname, 'app'),
      '@types': path.resolve(__dirname, 'types'),
      '@styles': path.resolve(__dirname, 'styles')
    };
    return config;
  },
  // Add output configuration
  output: 'standalone',

  env: {
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
    NEXT_PUBLIC_SANITY_PROJECT_ID: '1gxdk71x',
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    NEXT_PUBLIC_SANITY_STUDIO_URL: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || 'http://localhost:3333',
    SANITY_TOKEN: token,
    NEXT_PUBLIC_NETLIFY: process.env.NEXT_PUBLIC_NETLIFY || 'false',
    SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN || token,
    SANITY_STUDIO_PATH: 'fresh_sanity_studio',
    SANITY_PREVIEW_SECRET: process.env.SANITY_PREVIEW_SECRET || '',
    SANITY_AUTH_TOKEN: process.env.SANITY_AUTH_TOKEN || '',
    SANITY_STUDIO_API_TOKEN: process.env.SANITY_STUDIO_API_TOKEN || '',
    NEXT_PUBLIC_SANITY_TOKEN: process.env.NEXT_PUBLIC_SANITY_TOKEN || '',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    NEXT_USE_NETLIFY_EDGE: process.env.NEXT_USE_NETLIFY_EDGE || 'true',
    NEXT_FORCE_EDGE_IMAGES: process.env.NEXT_FORCE_EDGE_IMAGES || 'true',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
  },
  transpilePackages: ['@sanity/client', '@sanity/preview-kit'],
};

module.exports = nextConfig;

