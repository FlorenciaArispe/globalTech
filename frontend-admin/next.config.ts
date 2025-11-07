/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  async rewrites() {
    return [
      // ✅ proxy interno hacia el backend dentro del compose
      { source: '/api/:path*',  destination: 'http://backend:8080/api/:path*' },
      { source: '/auth/:path*', destination: 'http://backend:8080/auth/:path*' },
    ];
  },
};

export default nextConfig;
