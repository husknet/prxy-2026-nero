/** @type {import('next').NextConfig} */
const nextConfig = {
  // Generates a self-contained Node server (needed for Docker)
  output: 'standalone',

  // Enable the App Router (your [[...path]] lives here)
  experimental: {
    appDir: true,
  },

  // Global CORS headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: '*' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
