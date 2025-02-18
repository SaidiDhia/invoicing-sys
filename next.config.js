const { i18n } = require('./next-i18next.config.js');
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  i18n
};

module.exports = nextConfig;
