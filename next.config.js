/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: false,
  images: {
    domains: ['lh3.googleusercontent.com', 'storage.googleapis.com'],
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}