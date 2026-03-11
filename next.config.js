/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { domains: ['raw.githubusercontent.com', 'arweave.net', 'ipfs.io'] },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
};

module.exports = nextConfig;
