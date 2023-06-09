/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['chainlist.org', 'icon-library.com', 'icons.llamao.fi'],
  },
};

module.exports = nextConfig;
