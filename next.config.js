const withNextIntl = require('next-intl/plugin')(
  // Specify the path to the i18n configuration
  './i18n.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = withNextIntl(nextConfig);
