/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `https://github-alarm.vercel.app/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
