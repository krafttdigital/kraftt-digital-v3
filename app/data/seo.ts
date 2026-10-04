import type { Metadata } from 'next';
import { contactEmail, contactPhone, siteUrl } from './site';
import type { ClientReview } from './reviews';
import metadataMaster from './metadata-master.json';
import { services, coreServices } from './services';
import { bundles } from './bundles';
import { projects } from './projects';
import { tools } from '../tools/data';

type MasterMetadata = { title: string; description: string; ogTitle: string; ogDescription: string };
export const metadataByPath: Record<string, MasterMetadata> = metadataMaster;

export const brandName = 'Kraftt Digital';
export const siteOrigin = siteUrl.replace(/\/$/, '');
export const organizationId = `${siteOrigin}/#organization`;
export const websiteId = `${siteOrigin}/#website`;

export function absoluteUrl(path = '/') {
  const normalisedPath = path === '' ? '/' : path.startsWith('/') ? path : `/${path}`;
  // Next normalizes origin-only metadata URLs without a trailing slash.
  if (normalisedPath === '/') return siteOrigin;
  return `${siteOrigin}${normalisedPath}`;
}

function socialImage(path: string, title: string, label: string) {
  const params = new URLSearchParams({ path, title, label });
  return absoluteUrl(`/api/og?${params.toString()}`);
}

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  label: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
  languages?: Record<string, string>;
  locale?: string;
};

export function createPageMetadata({
  title,
  description,
  path,
  label,
  image,
  imageAlt,
  type = 'website',
  noIndex = false,
  languages,
  locale = 'en_IN',
}: PageMetadataInput): Metadata {
  const master = metadataByPath[path];
  title = master?.title ?? title;
  description = master?.description ?? description;
  languages ??= noIndex ? undefined : { 'en-IN': path, 'x-default': path };
  const isHomepage = path === '/';
  const canonical = isHomepage ? `${siteOrigin}/` : absoluteUrl(path);
  const ogImage = image ? absoluteUrl(image) : socialImage(path, title, label);
  const robots = noIndex
    ? { index: false, follow: false }
    : {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large' as const,
          'max-snippet': -1,
          'max-video-preview': -1,
        },
      };

  return {
    // All social/alternate URLs are absolute. Avoid Next stripping the root slash.
    ...(isHomepage ? { metadataBase: null } : {}),
    title,
    description,
    alternates: {
      canonical,
      ...(languages ? { languages: Object.fromEntries(Object.entries(languages).map(([key, value]) => [key, absoluteUrl(value)])) } : {}),
    },
    robots,
    openGraph: {
      type,
      siteName: brandName,
      locale,
      title: master?.ogTitle ?? title,
      description: master?.ogDescription ?? description,
      url: canonical,
      images: [{
        url: ogImage,
        ...(!image ? { width: 1200, height: 630, type: 'image/png' } : {}),
        alt: imageAlt ?? `${title} — ${brandName}`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export type Breadcrumb = { name: string; path: string };

export function createPageSchema({
  name,
  description,
  path,
  breadcrumbs,
  entities = [],
}: {
  name: string;
  description: string;
  path: string;
  breadcrumbs: Breadcrumb[];
  entities?: Record<string, unknown>[];
}): Record<string, unknown> {
  const url = absoluteUrl(path);
  const breadcrumbId = `${url}#breadcrumb`;
  const master = metadataByPath[path];
  name = master?.title ?? name;
  description = master?.description ?? description;
  const pageType = path === '/about' ? 'AboutPage' : path === '/contact' ? 'ContactPage'
    : ['/services', '/work', '/tools'].includes(path) ? 'CollectionPage' : 'WebPage';
  const collection = path === '/services'
    ? [...coreServices, ...services.filter(s => ['landing-pages', 'app-development', 'dashboards-internal-tools'].includes(s.slug))].map(s => ({ name: s.name, path: `/services/${s.slug}` }))
    : path === '/work' ? projects.map(p => ({ name: p.name, path: `/work/${p.slug}` }))
    : path === '/tools' ? tools.map(t => ({ name: t.name, path: `/tools/${t.slug}` })) : [];
  const tool = tools.find(t => path === `/tools/${t.slug}`);
  const additional: Record<string, unknown>[] = [];
  if (collection.length) additional.push({ '@type': 'ItemList', '@id': `${url}#list`, itemListElement: collection.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, url: absoluteUrl(item.path) })) });
  if (tool) additional.push({ '@type': 'WebApplication', '@id': `${url}#application`, name: tool.name, description: tool.description, url, operatingSystem: 'Web', applicationCategory: tool.slug.startsWith('gst-') ? 'FinanceApplication' : 'BusinessApplication', offers: { '@type': 'Offer', price: 0, priceCurrency: 'INR' }, publisher: { '@id': organizationId } });
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': pageType,
        '@id': `${url}#webpage`,
        url,
        name,
        description,
        isPartOf: { '@id': websiteId },
        about: { '@id': organizationId },
        breadcrumb: { '@id': breadcrumbId },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': breadcrumbId,
        itemListElement: breadcrumbs.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: absoluteUrl(item.path),
        })),
      },
      // Agency testimonials remain visible but are not self-serving review markup.
      ...entities.filter(entity => !['Review', 'AggregateRating'].includes(String(entity['@type']))),
      ...additional,
    ],
  };
}

export function organizationAndWebsiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: brandName,
        alternateName: ['Kraftt', 'Kraftt.Digital'],
        url: `${siteOrigin}/`,
        logo: absoluteUrl('/favicon/android-chrome-512x512.png'),
        email: contactEmail,
        telephone: contactPhone,
        address: { '@type': 'PostalAddress', addressLocality: 'Bathinda', addressRegion: 'Punjab', addressCountry: 'IN' },
        contactPoint: { '@type': 'ContactPoint', telephone: contactPhone, email: contactEmail, contactType: 'customer service' },
        description: 'Kraftt Digital builds brand identities, websites and online stores, with marketplace, SEO and social media services for businesses in India and international markets.',
        sameAs: [
          'https://www.instagram.com/krafttdigital',
          'https://www.linkedin.com/company/krafttdigital',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: `${siteOrigin}/`,
        name: brandName,
        alternateName: ['Kraftt', 'Kraftt.Digital', 'krafttdigital.in'],
        publisher: { '@id': organizationId },
        inLanguage: 'en-IN',
      },
    ],
  };
}

export function serviceSchema({
  name,
  description,
  path,
  areaServed,
  serviceType,
}: {
  name: string;
  description: string;
  path: string;
  areaServed?: Record<string, unknown>;
  serviceType?: string;
}): Record<string, unknown> {
  const url = absoluteUrl(path);
  const service = services.find(s => path === `/services/${s.slug}`);
  const bundle = bundles.find(b => path === `/services/bundles/${b.slug}`);
  const scopes = service?.tiers.map(t => ({ name: t.name, description: t.deliverables.join('; ') }))
    ?? (bundle ? [{ name: bundle.name, description: bundle.deliverables.join('; ') }] : []);
  return {
    '@type': 'Service',
    ...(scopes.length ? { offers: scopes.map(scope => ({ '@type': 'Offer', ...scope, url, seller: { '@id': organizationId } })) } : {}),
    '@id': `${url}#service`,
    name,
    description,
    url,
    provider: { '@id': organizationId },
    ...(areaServed ? { areaServed } : {}),
    ...(serviceType ? { serviceType } : {}),
  };
}

export function faqSchema(
  faqs: readonly { question: string; answer: string }[],
  path: string
): Record<string, unknown> {
  return {
    '@type': 'FAQPage',
    '@id': `${absoluteUrl(path)}#faq`,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function articleSchema({
  name,
  description,
  path,
  industry,
}: {
  name: string;
  description: string;
  path: string;
  industry: string;
}): Record<string, unknown> {
  const url = absoluteUrl(path);
  return {
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: name,
    description,
    url,
    mainEntityOfPage: { '@id': `${url}#webpage` },
    author: { '@id': organizationId },
    publisher: { '@id': organizationId },
    about: industry,
  };
}

export function reviewSchema(review: ClientReview): Record<string, unknown> {
  const projectUrl = absoluteUrl(`/work/${review.projectSlug}`);

  return {
    '@type': 'Review',
    '@id': `${projectUrl}#review-${review.id}`,
    author: {
      '@type': 'Person',
      name: review.clientName,
      jobTitle: review.role,
      worksFor: {
        '@type': 'Organization',
        name: review.company,
      },
    },
    reviewBody: review.review,
    ...(review.rating === null
      ? {}
      : {
          reviewRating: {
            '@type': 'Rating',
            ratingValue: review.rating,
            bestRating: 5,
            worstRating: 1,
          },
        }),
    itemReviewed: {
      '@type': 'Service',
      '@id': `${projectUrl}#project-service`,
      name: `${review.company} digital project`,
      url: projectUrl,
      provider: { '@id': organizationId },
    },
  };
}

export function reviewSchemas(pageReviews: ClientReview[]): Record<string, unknown>[] {
  return pageReviews.map(reviewSchema);
}
