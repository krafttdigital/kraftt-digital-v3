import type { RegionMarket } from './types';

export const regions = [
  {
    slug: 'usa',
    name: 'United States',
    shortName: 'USA',
    languageRegion: 'en-US',
    ogLocale: 'en_US',
    eyebrow: 'Research-led digital presence · India → USA',
    heroIntro: 'We connect brand, websites, content and digital systems for US businesses through a clear, accountable digital partnership delivered from India.',
    metaTitle: 'Digital Agency in India for US Businesses | Kraftt Digital',
    metaDescription: 'Work with Kraftt Digital, an India-based digital agency serving US businesses through web design, Shopify, branding and e-commerce SEO.',
    ogLabel: 'Digital partner · USA',
    localContext: {
      eyebrow: 'India → USA',
      title: 'A clear digital partnership across borders.',
      body: 'Kraftt supports US businesses that want strategy, design and development handled as one documented engagement. Begin with a free introductory call; scope, feedback and delivery stay visible through handover.',
    },
    communication: {
      timezone: 'Calls are scheduled around practical overlap between India and the client’s US working hours.',
      terminology: 'Scope, milestones, ownership and approvals are documented in clear business language.',
    },
    currencyLabel: 'USD',
    schemaCountry: { '@type': 'Country', name: 'United States' },
  },
  {
    slug: 'uk',
    name: 'United Kingdom',
    shortName: 'UK',
    languageRegion: 'en-GB',
    ogLocale: 'en_GB',
    eyebrow: 'Research-led digital presence · India → UK',
    heroIntro: 'We connect brand, websites, content and digital systems for UK businesses through a structured remote partnership delivered from India.',
    metaTitle: 'Indian Digital Agency for UK Businesses | Kraftt Digital',
    metaDescription: 'Kraftt Digital is an India-based web, Shopify and branding partner for UK businesses that value clear scope, documented reviews and accountable delivery.',
    ogLabel: 'Digital partner · UK',
    localContext: {
      eyebrow: 'India → UK',
      title: 'Research-led work with a documented handoff.',
      body: 'Kraftt works remotely with UK businesses that need the thinking, design and build to stay connected. Each stage has a purpose, a review point and a written next step.',
    },
    communication: {
      timezone: 'Scheduled calls use practical overlap between India and UK working hours.',
      terminology: 'Project communication, scope and approvals remain concise, documented and easy to revisit.',
    },
    currencyLabel: 'USD',
    schemaCountry: { '@type': 'Country', name: 'United Kingdom' },
  },
  {
    slug: 'uae',
    name: 'United Arab Emirates',
    shortName: 'UAE',
    languageRegion: 'en-AE',
    ogLocale: 'en_AE',
    eyebrow: 'Research-led digital presence · India → UAE',
    heroIntro: 'We connect brand, websites, commerce and digital systems for UAE businesses through a clear digital partnership delivered from India.',
    metaTitle: 'Indian Digital Agency for UAE Businesses | Kraftt Digital',
    metaDescription: 'Kraftt Digital supports UAE businesses from India with web design, Shopify development, brand identity and e-commerce SEO.',
    ogLabel: 'Digital partner · UAE',
    localContext: {
      eyebrow: 'India → UAE',
      title: 'One connected presence for a cross-border market.',
      body: 'Kraftt helps UAE businesses align the brand, website, store and enquiry path without fragmenting the work across separate vendors. Decisions and deliverables remain documented throughout.',
    },
    communication: {
      timezone: 'India and UAE working hours provide practical overlap, with calls scheduled around the client’s availability.',
      terminology: 'Feedback, approvals and commercial terms are kept in shared written stages.',
    },
    currencyLabel: 'USD',
    schemaCountry: { '@type': 'Country', name: 'United Arab Emirates' },
  },
  {
    slug: 'canada',
    name: 'Canada',
    shortName: 'Canada',
    languageRegion: 'en-CA',
    ogLocale: 'en_CA',
    eyebrow: 'Research-led digital presence · India → Canada',
    heroIntro: 'We connect brand, websites, commerce and digital systems for Canadian businesses through a documented remote engagement delivered from India.',
    metaTitle: 'Indian Digital Agency for Canadian Businesses | Kraftt Digital',
    metaDescription: 'Kraftt Digital works remotely from India with Canadian businesses on web design, Shopify, branding and e-commerce SEO.',
    ogLabel: 'Digital partner · Canada',
    localContext: {
      eyebrow: 'India → Canada',
      title: 'Remote collaboration without unclear ownership.',
      body: 'Kraftt gives Canadian businesses one accountable path from research and proposal to review and handover. The work stays structured even when teams operate in different time zones.',
    },
    communication: {
      timezone: 'Calls are planned around practical overlap between India and the client’s Canadian working hours.',
      terminology: 'Written stages keep decisions, feedback and ownership clear between scheduled conversations.',
    },
    currencyLabel: 'USD',
    schemaCountry: { '@type': 'Country', name: 'Canada' },
  },
  {
    slug: 'australia',
    name: 'Australia',
    shortName: 'Australia',
    languageRegion: 'en-AU',
    ogLocale: 'en_AU',
    eyebrow: 'Research-led digital presence · India → Australia',
    heroIntro: 'We connect brand, websites, commerce and digital systems for Australian businesses through a clear remote partnership delivered from India.',
    metaTitle: 'Indian Digital Agency for Australian Businesses | Kraftt Digital',
    metaDescription: 'Kraftt Digital partners remotely with Australian businesses on web design, Shopify development, branding and e-commerce SEO.',
    ogLabel: 'Digital partner · Australia',
    localContext: {
      eyebrow: 'India → Australia',
      title: 'A practical digital partnership built around clarity.',
      body: 'Kraftt connects strategic thinking and execution for Australian businesses that prefer one documented engagement. The result is a consistent presence with clear stages and ownership.',
    },
    communication: {
      timezone: 'Calls are scheduled around practical India–Australia working-hour overlap.',
      terminology: 'Reviews and approvals move through documented stages so progress does not depend on constant meetings.',
    },
    currencyLabel: 'USD',
    schemaCountry: { '@type': 'Country', name: 'Australia' },
  },
] as const satisfies readonly RegionMarket[];

export type RegionSlug = (typeof regions)[number]['slug'];

export function regionBySlug(slug: string) {
  return regions.find((region) => region.slug === slug);
}
