import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/portfolio', destination: '/work', permanent: true },
      { source: '/portfolio/mittal-architect', destination: '/work/mittal-architect', permanent: true },
      { source: '/portfolio/kiraq', destination: '/work/kiraq-jewellery', permanent: true },
      { source: '/portfolio/the-vibed-vines', destination: '/work/the-vibed-vines', permanent: true },
      { source: '/portfolio/aegis-squad', destination: '/work/aegis-squad', permanent: true },
      { source: '/services/web-design', destination: '/services/web-design-development', permanent: true },
      { source: '/services/dashboards-tools', destination: '/services/dashboards-internal-tools', permanent: true },
      { source: '/assets/ketan-goyal-formal-candid.jif', destination: '/assets/ketan-goyal-candid.jpg', permanent: true },
      { source: '/assets/kraftt-founder-01.png', destination: '/assets/ketan-goyal-about-hero.png', permanent: true },
    ];
  },
  async headers() {
    return [{
      // Content hashes in these filenames make long-lived browser caching safe.
      source: '/assets/animated-service-icons/:path*',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    }];
  },
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
