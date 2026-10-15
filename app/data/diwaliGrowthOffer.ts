import { formatInr, type Offer } from './offers';

const regularPrice = 45000;
const offerPrice = 40000;
const maintenanceMonths = 3;
const maintenanceMonthlyValue = 1500;

export const diwaliGrowthSlots = 10;
// Update this count only when a proposal is accepted and the advance is paid.
export const diwaliGrowthSlotsAvailable = 10;
export const diwaliGrowthDelivery = '10–12 days after complete content, access and approvals';

export const diwaliGrowthBenefits = [
  { label: 'Website offer reduction', detail: `A ${formatInr(regularPrice - offerPrice)} reduction is already reflected in the ${formatInr(offerPrice)} campaign price.`, value: regularPrice - offerPrice },
  { label: 'Analytics tools setup', detail: 'Traffic and enquiry measurement configured at launch.', value: 1500 },
  { label: 'Three months maintenance, support and reporting', detail: `${maintenanceMonths} months at ${formatInr(maintenanceMonthlyValue)}/month, including a monthly analytics report during each month.`, value: maintenanceMonths * maintenanceMonthlyValue },
  { label: '.in domain for the first year', detail: 'First-year .in domain registration. Renewal and hosting are separate.', value: 2000 },
  { label: 'Five static AI ad creatives', detail: 'Five static creatives for your own campaigns. Ad spend and management are separate.', value: 3000 },
] as const;

export const diwaliGrowthBenefitTotal = diwaliGrowthBenefits.reduce((total, benefit) => total + benefit.value, 0);

export const diwaliGrowthOffer: Offer = {
  id: 'diwali-10-growth-website-2026',
  slug: 'diwali-growth-website',
  pagePath: '/offers/diwali-growth-website',
  name: 'Diwali Growth Website Offer',
  campaignLine: 'Website Growth – Full Build',
  supportingLine: 'An eight-to-ten-page responsive website built around clear information, search foundations and working enquiry paths.',
  offerPrice,
  regularBundlePrice: regularPrice,
  individualServiceValue: offerPrice + diwaliGrowthBenefitTotal,
  currency: 'INR',
  status: diwaliGrowthSlotsAvailable > 0 ? 'active' : 'paused',
  expiresAt: '2026-11-08T23:59:59+05:30',
  expiryLabel: 'Diwali · 8 November 2026 (India time)',
  formEndpoint: 'https://formspree.io/f/mkjnyrpe',
  inclusions: [{
    id: 'growth-website',
    title: 'Website Growth – Full Build',
    summary: 'The complete website scope listed in Kraftt’s Growth tier.',
    items: [
      'Basic branding for your business',
      '8–10 page responsive website',
      'Agreed launch SEO and JSON-LD schema markup',
      'GEO and AEO implemented',
      'Google Search Console setup',
      'WhatsApp and email enquiry system',
      'Blog section setup',
    ],
  }],
  bestFor: [],
  notFor: [],
  terms: [
    'The .in domain is included for the first year. Renewal, hosting and other third-party costs are paid by the client.',
    'Five static AI ad creatives are for the client’s own campaigns. Ad spend and ad campaign management are not included.',
    'Monthly analytics reports are included within the three maintenance months, with no separate report value counted in the benefit total.',
    'Search rankings, AI-search citations and lead volumes are not guaranteed.',
    'A project slot is held only after the proposal is accepted and the advance is paid.',
  ],
  proofProjectSlugs: ['elixir-beverages', 'kiraq-jewellery', 'mittal-architect'],
};
