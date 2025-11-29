/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/forms/:path*',
        destination: 'http://localhost:5173/forms/:path*',
      },
    ];
  },
};

export default nextConfig;
