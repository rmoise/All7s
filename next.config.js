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
  generateBuildId: async () => {
    return process.env.BUILD_ID || 'development'
  },
  webpack: (config) => {
    config.resolve = {
      ...config.resolve,
      alias: {
        '@': path.resolve(__dirname),
        '@components': path.resolve(__dirname, 'components'),
        '@components/common': path.resolve(__dirname, 'components/common'),
        '@components/blog': path.resolve(__dirname, 'components/blog'),
        '@components/blocks': path.resolve(__dirname, 'components/blocks'),
        '@components/shop': path.resolve(__dirname, 'components/shop'),
        '@lib': path.resolve(__dirname, 'lib'),
        '@utils': path.resolve(__dirname, 'utils'),
        '@context': path.resolve(__dirname, 'context'),
        '@blocks': path.resolve(__dirname, 'components/blocks'),
        '@blog': path.resolve(__dirname, 'components/blog'),
        '@app': path.resolve(__dirname, 'app'),
        '@types': path.resolve(__dirname, 'types'),
        '@styles': path.resolve(__dirname, 'styles'),
        '@fresh_sanity_studio': path.resolve(__dirname, 'fresh_sanity_studio')
      },
      modules: [
        path.resolve(__dirname),
        path.resolve(__dirname, 'components'),
        'node_modules'
      ]
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
  },

  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    domains: ['cdn.sanity.io', 'i.scdn.co', 'i1.sndcdn.com', 'i2.sndcdn.com', 'i3.sndcdn.com', 'i4.sndcdn.com'],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.sndcdn.com',
        pathname: '/artworks-**',
      },
    ],
    loader: 'custom',
    loaderFile: './netlify/image-loader.js',
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
              "media-src 'self' https://*.scdn.co https://*.spotify.com https://*.ytimg.com https://*.imagekit.io https://*.sanity.io blob:",
              // Fonts
              "font-src 'self' data: https://fonts.gstatic.com https://*.typekit.net",
              // Connect
              "connect-src 'self' https: wss: https://*.sanity.io https://*.apicdn.sanity.io",
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
      },
      {
        source: '/studio/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: 'https://all7z.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
      {
        source: '/api/sanity/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ]
  },

  compiler: {
    styledComponents: true,
  },

  publicRuntimeConfig: {
    SANITY_PREVIEW_SECRET: process.env.SANITY_PREVIEW_SECRET
  },

  async redirects() {
    return [
      {
        source: '/store',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/blog',
        destination: '/blog/posts',
        permanent: true,
      },
    ]
  },

  rewrites: async () => {
    return [
      {
        source: '/studio/:path*',
        destination: '/studio/[[...index]]/page',
      },
    ]
  },

  distDir: '.next',

  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
};

module.exports = nextConfig;

