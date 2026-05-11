/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['formidable', 'openai'],
  },
}
module.exports = nextConfig