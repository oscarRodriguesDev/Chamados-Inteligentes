/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.watchOptions = {
      ignored: [
        '**/node_modules',
        '**/C:/Users/oskha/Ambiente de Impressão/**',
        '**/C:/Users/oskha/Ambiente de Rede/**'
      ],
    };
    return config;
  },
};

module.exports = nextConfig;
