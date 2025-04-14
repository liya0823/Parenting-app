/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    domains: ['localhost'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Configure the baby-page to be client-side rendered
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Disable server-side rendering for specific pages
  async rewrites() {
    return [
      {
        source: '/features/baby-page',
        destination: '/features/baby-page?ssr=false',
      },
    ];
  },
};

module.exports = nextConfig; 