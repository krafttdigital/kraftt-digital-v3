export type MarketplacePackage = { name: string; price: number; timeline: string; includes: string[] };

export const marketplacePackages: MarketplacePackage[] = [
  {
    "name": "Starter",
    "price": 15000,
    "timeline": "8–10 days",
    "includes": [
      "Account setup and verification assistance",
      "Product and Niche Research",
      "Up to 30 products uploaded",
      "Pricing calculation support",
      "Platform Working Tutorial"
    ]
  },
  {
    "name": "Intermediate",
    "price": 25000,
    "timeline": "14–15 days",
    "includes": [
      "Account setup and verification assistance",
      "Detailed Product and Niche Research",
      "Up to 50 products uploaded",
      "Pricing calculation support",
      "Platform Working Tutorial",
      "Basic structured SEO Title and descriptions for Product"
    ]
  },
  {
    "name": "Growth",
    "price": 50000,
    "timeline": "18–20 days",
    "includes": [
      "Account setup and verification assistance",
      "Detailed product, niche and competitor research",
      "Up to 100 products uploaded",
      "Pricing calculation support",
      "Platform Working Tutorial",
      "Proper structured SEO Titles and descriptions for Product",
      "Search-readable listing content within available platform fields; no AI placement guarantee"
    ]
  }
];
export const marketplaceScopeNotes = [
  "India only. All three packages cover Amazon, Flipkart, Myntra and Meesho. Starter starts at ₹15,000.",
  "Product allowances are 30 / 50 / 100. Allocation across platforms and variant counting must be written into the quotation.",
  "Platform verification and listing approval are outside Kraftt’s control. Timelines depend on documents and platform processing.",
  "Client handles stock, orders, fulfilment, returns and customer support. Kraftt does not manage ad campaigns.",
  "Mockup quantities and ongoing listing optimisation allowances are defined in the proposal."
];
