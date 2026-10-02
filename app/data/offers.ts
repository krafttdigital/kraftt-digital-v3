export type OfferStatus = 'active' | 'paused' | 'archived';

export type OfferInclusion = {
  id: string;
  title: string;
  summary: string;
  items: string[];
};

export type Offer = {
  id: string;
  slug: string;
  pagePath: string;
  name: string;
  campaignLine: string;
  supportingLine: string;
  offerPrice: number;
  regularBundlePrice: number;
  individualServiceValue: number;
  currency: 'INR';
  status: OfferStatus;
  expiresAt: string;
  expiryLabel: string;
  formEndpoint: string;
  inclusions: OfferInclusion[];
  bestFor: string[];
  notFor: string[];
  terms: string[];
  proofProjectSlugs: string[];
};

export const offers: Offer[] = [
  {
    id: 'festive-starter-launch-2026',
    slug: 'starter-business-launch-festive-2026',
    pagePath: '/offers/campaign-festive-season-offer',
    name: 'Starter Business Launch',
    campaignLine: 'Website. Brand. Social. One clear launch.',
    supportingLine: 'Launch with a coordinated website, brand identity and first month of social media—planned as one clear system.',
    offerPrice: 30000,
    regularBundlePrice: 35000,
    individualServiceValue: 49000,
    currency: 'INR',
    status: 'active',
    expiresAt: '2026-11-08T23:59:59+05:30',
    expiryLabel: 'Diwali · 8 November 2026',
    formEndpoint: 'https://formspree.io/f/mkjnyrpe',
    inclusions: [
      {
        id: 'website',
        title: 'Website',
        summary: 'A credible five-page website ready to explain the offer and capture enquiries.',
        items: [
          'Five responsive pages',
          'Complete on-page SEO',
          'WhatsApp and contact form',
          'Basic lead capture',
          'Google Search Console setup',
        ],
      },
      {
        id: 'branding',
        title: 'Branding',
        summary: 'The core identity system needed to launch with one recognisable look and voice.',
        items: [
          'Primary, secondary and icon logos',
          'Colour palette',
          'Typography system',
          'Brand voice and tone guide',
        ],
      },
      {
        id: 'social',
        title: 'Social',
        summary: 'A complete first month of brand-aligned content for one social platform.',
        items: [
          '15 designed posts',
          '10 stories',
          'Captions and hashtags',
          'Profile setup',
        ],
      },
    ],
    bestFor: [
      'A new service business or professional practice',
      'A local business preparing its first credible launch',
      'A founder-led business with one defined offer',
      'A team that needs website, brand and social to launch together',
    ],
    notFor: [
      'A large product catalogue that needs a full e-commerce store',
      'An established business needing a complete multi-channel rebuild',
      'A business looking for only one standalone service',
    ],
    terms: [
      'Third-party costs are excluded.',
      'Final scope and timeline are confirmed in the proposal.',
      'The offer is valid through Diwali, 8 November 2026, India time.',
      'The ₹5,000 saving is measured against the regular ₹35,000 bundle price.',
    ],
    proofProjectSlugs: ['elixir-beverages', 'kiraq-jewellery', 'mittal-architect'],
  },
];

export function formatInr(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function isOfferClaimable(offer: Offer, now = new Date()) {
  return offer.status === 'active' && now.getTime() <= new Date(offer.expiresAt).getTime();
}

export function getFeaturedOffer() {
  return offers[0];
}
