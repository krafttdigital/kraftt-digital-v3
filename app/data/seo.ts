import type { Metadata } from 'next';
import { contactEmail, contactPhone, siteUrl } from './site';
import type { ClientReview } from './reviews';

export const brandName = 'Kraftt Digital';
export const siteOrigin = siteUrl.replace(/\/$/, '');
export const organizationId = `${siteOrigin}/#organization`;
export const websiteId = `${siteOrigin}/#website`;

export function absoluteUrl(path = '/') {
  const normalisedPath = path === '' ? '/' : path.startsWith('/') ? path : `/${path}`;
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
  const canonical = absoluteUrl(path);
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
      title,
      description,
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
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
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
      ...entities,
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
        url: siteOrigin,
        logo: absoluteUrl('/favicon/android-chrome-512x512.png'),
        email: contactEmail,
        telephone: contactPhone,
        description: 'Kraftt Digital builds brand identities, websites and online stores, with marketplace, SEO and social media services for businesses in India and international markets.',
        sameAs: [
          'https://www.instagram.com/krafttdigital',
          'https://www.linkedin.com/company/krafttdigital',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: siteOrigin,
        name: brandName,
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
  return {
    '@type': 'Service',
    '@id': `${url}#service`,
    name,
    description,
    url,
    provider: { '@id': organizationId },
    ...(areaServed ? { areaServed } : {}),
    ...(serviceType ? { serviceType } : {}),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[], path: string): Record<string, unknown> {
  return {
    '@type': 'FAQPage',
    '@id': `${absoluteUrl(path)}#faq`,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
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
