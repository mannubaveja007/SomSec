/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',

  // Turbopack configuration (empty to silence warnings)
  turbopack: {},

  // Environment variables
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    TOGETHER_API_KEY: process.env.TOGETHER_API_KEY,
  },

  // API route timeout (10 minutes for AI processing)
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
}

module.exports = nextConfig
