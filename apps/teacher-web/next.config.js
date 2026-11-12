/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@icc/shared-types',
    '@icc/shared-validation',
    '@icc/shared-utils',
    '@icc/design-tokens',
  ],
};

module.exports = nextConfig;
