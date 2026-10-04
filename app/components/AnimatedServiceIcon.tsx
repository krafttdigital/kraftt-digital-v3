import iconAssets from '../data/service-icon-assets.json';

const animatedServiceIcons: Record<string, keyof typeof iconAssets> = {
  'web-design-development': 'website',
  'brand-identity': 'branding',
  'ecommerce-store-development': 'stores',
  'marketplace-catalogue-building': 'marketplace',
  'ecommerce-seo': 'seo',
  'social-media-management': 'socialmedia',
  'landing-pages': 'landing page',
  'app-development': 'appdev',
  'dashboards-internal-tools': 'dashobard',
  'content-copywriting': 'landing page',
  'ai-powered-creative': 'branding',
};

export function AnimatedServiceIcon({ slug, size = 40 }: { slug: string; size?: number }) {
  const assets = iconAssets[animatedServiceIcons[slug] ?? 'dashobard'];

  return (
    // Pre-encoded animation variants bypass Next's static-image optimizer.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="animated-service-icon"
      src={assets['160']}
      srcSet={`${assets['160']} 160w, ${assets['640']} 640w`}
      sizes={`${Math.max(size, 48)}px`}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      aria-hidden="true"
    />
  );
}
