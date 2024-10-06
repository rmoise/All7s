/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns:[
      {
        protocol:'https',
        hostname:'ik.imagekit.io',
      }
    ],
    domains: ['ik.imagekit.io'],


  }
}

module.exports = nextConfig
