/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Ensure environment variables are exposed if needed
  env: {
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
};

export default nextConfig;
