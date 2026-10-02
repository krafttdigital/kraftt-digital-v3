import Image from 'next/image';

const animatedServiceIcons: Record<string, string> = {
  'web-design-development': '/assets/animation%20icons/website.gif',
  'brand-identity': '/assets/animation%20icons/branding.gif',
  'ecommerce-store-development': '/assets/animation%20icons/stores.gif',
  'marketplace-catalogue-building': '/assets/animation%20icons/marketplace.gif',
  'ecommerce-seo': '/assets/animation%20icons/seo.gif',
  'social-media-management': '/assets/animation%20icons/socialmedia.gif',
  'landing-pages': '/assets/animation%20icons/landing%20page.gif',
  'app-development': '/assets/animation%20icons/appdev.gif',
  'dashboards-internal-tools': '/assets/animation%20icons/dashobard.gif',
  'content-copywriting': '/assets/animation%20icons/landing%20page.gif',
  'ai-powered-creative': '/assets/animation%20icons/branding.gif',
};

export function AnimatedServiceIcon({ slug, size = 40 }: { slug: string; size?: number }) {
  const src = animatedServiceIcons[slug] ?? animatedServiceIcons['dashboards-internal-tools'];

  return (
    <Image
      className="animated-service-icon"
      src={src}
      alt=""
      width={size}
      height={size}
      unoptimized
      aria-hidden="true"
    />
  );
}
