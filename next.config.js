/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',

  // Turbopack configuration
  turbopack: {
    resolveAlias: {
      '@': path.resolve(__dirname, 'src'),
      '@root': path.resolve(__dirname, '.'),
    },
  },

  // Webpack configuration for non-turbopack builds
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@root': path.resolve(__dirname, '.'),
    }
    return config
  },

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
