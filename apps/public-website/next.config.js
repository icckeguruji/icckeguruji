/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@icc/shared-types',
    '@icc/shared-validation',
    '@icc/shared-utils',
    '@icc/design-tokens',
  ],
  images: {
    domains: ['images.unsplash.com', 'api.qrserver.com'],
  },
};

module.exports = nextConfig;
