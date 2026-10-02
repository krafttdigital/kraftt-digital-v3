import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Public project imagery is deploy-versioned. Keep optimized variants at
    // the CDN so repeat visits do not trigger another expensive transform.
    minimumCacheTTL: 2_678_400,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'motion'],
  },
};

export default nextConfig;
