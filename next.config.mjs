/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // Ignorar warnings glob EPERM
    config.ignoreWarnings = [
      {
        message: /Configurações Locais|Ambiente de Rede/,
      },
    ];
    return config;
  },
};

export default nextConfig;
