/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  transpilePackages: [
    '@icc/shared-types',
    '@icc/shared-validation',
    '@icc/shared-utils',
    '@icc/design-tokens',
  ],
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'api.qrserver.com' },
      { protocol: 'https', hostname: 'gshjxcoyfrskxnpdqooy.supabase.co' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async redirects() {
    return [
      { source: '/students', destination: '/admin/students', permanent: true },
      { source: '/payments', destination: '/admin/payments', permanent: true },
      { source: '/live-classes', destination: '/admin/live-classes', permanent: true },
      { source: '/recorded-lectures', destination: '/admin/recorded-lectures', permanent: true },
      { source: '/study-materials', destination: '/admin/study-materials', permanent: true },
      { source: '/examinations', destination: '/admin/examinations', permanent: true },
      { source: '/batches', destination: '/admin/courses', permanent: true },
      { source: '/admin/batches', destination: '/admin/courses', permanent: true },
      { source: '/academics', destination: '/admin/academics', permanent: true },
      { source: '/reports', destination: '/admin/reports', permanent: true },
      { source: '/settings', destination: '/admin/settings', permanent: true },
      { source: '/whatsapp', destination: '/admin/whatsapp', permanent: true },
      { source: '/teacher/:path*', destination: '/admin', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
