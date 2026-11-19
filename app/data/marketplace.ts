import type { PriceId } from './pricing-catalogue';

export type MarketplacePackage = { name: string; id: PriceId; timeline: string; productAllowance: number; includes: string[] };

const packages: MarketplacePackage[] = [
  {
    "name": "Starter",
    "id": "marketplace-1",
    "timeline": "8–10 days",
    "productAllowance": 30,
    "includes": [
      "Account setup and verification assistance",
      "Product and Niche Research",
      "Pricing calculation support",
      "Platform Working Tutorial"
    ]
  },
  {
    "name": "Intermediate",
    "id": "marketplace-2",
    "timeline": "14–15 days",
    "productAllowance": 50,
    "includes": [
      "Account setup and verification assistance",
      "Detailed Product and Niche Research",
      "Pricing calculation support",
      "Platform Working Tutorial",
      "Basic structured SEO Title and descriptions for Product"
    ]
  },
  {
    "name": "Growth",
    "id": "marketplace-3",
    "timeline": "18–20 days",
    "productAllowance": 100,
    "includes": [
      "Account setup and verification assistance",
      "Detailed product, niche and competitor research",
      "Pricing calculation support",
      "Platform Working Tutorial",
      "Proper structured SEO Titles and descriptions for Product",
      "Search-readable listing content within available platform fields; no AI placement guarantee"
    ]
  }
];

export const marketplacePackages = packages.map(pkg => ({
  ...pkg,
  includes: [
    ...pkg.includes.slice(0, 2),
    `Up to ${pkg.productAllowance} products uploaded`,
    ...pkg.includes.slice(2),
  ],
}));

export const marketplaceScopeNotes = [
  "Published marketplace rates are for India. All three packages cover Amazon, Flipkart, Myntra and Meesho.",
  `Product allowances are ${marketplacePackages.map(pkg => pkg.productAllowance).join(' / ')}. Allocation across platforms and variant counting must be written into the quotation.`,
  "Platform verification and listing approval are outside Kraftt’s control. Timelines depend on documents and platform processing.",
  "Client handles stock, orders, fulfilment, returns and customer support. Kraftt does not manage ad campaigns.",
  "Mockup quantities and ongoing listing optimisation allowances are defined in the proposal."
];
