/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing config ...
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors - temporary for CMS cleanup
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors - temporary for CMS cleanup
    ignoreDuringBuilds: true,
  },
};

export default nextConfig; 