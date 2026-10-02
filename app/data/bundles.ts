export type Bundle = {
  slug: string;
  name: string;
  headline: string;
  idealClient: string;
  problemSolved: string;
  price: string;
  timeline: string;
  deliverables: string[];
  inclusions: {
    title: string;
    summary: string;
    items: string[];
  }[];
  notIncluded: string[];
  bestFor: string[];
  notFor: string[];
  goodFitWhen: string[];
  relatedProjectSlug: string;
  continuation: string;
  scopeNote: string;
};

export const bundles: Bundle[] = [
  {
    "slug": "starter-business-launch",
    "name": "Starter Business Launch",
    "headline": "For a new business that needs a clear identity, a credible website and an active first social channel.",
    "idealClient": "New businesses launching a defined offer.",
    "problemSolved": "A brand, business website and first social channel need to launch together.",
    "price": "₹35,000 / $799",
    "timeline": "Brand + website build · 1 month of social management",
    "deliverables": [
      "Business Website · one-time",
      "Brand Starter · one-time",
      "Social Starter · 1 month"
    ],
    "inclusions": [
      {
        "title": "Business Website · one-time",
        "summary": "Business Website · one-time",
        "items": [
          "Five responsive pages",
          "On-page launch SEO across the five pages",
          "WhatsApp integration, contact form and email enquiry capture",
          "Google Search Console setup"
        ]
      },
      {
        "title": "Brand Starter · one-time",
        "summary": "Brand Starter · one-time",
        "items": [
          "Audience, competitor research and positioning",
          "Primary, secondary and icon logo suite",
          "Colour palette, typography, brand voice and tone"
        ]
      },
      {
        "title": "Social Starter · 1 month",
        "summary": "Social Starter · 1 month",
        "items": [
          "15 posts and 10 stories per month on one platform",
          "Strategy, content guidance, captions, design and posting",
          "Engagement, comment replies and monthly performance report"
        ]
      }
    ],
    "notIncluded": [
      "Third-party subscriptions, hosting, platform fees and advertising budgets are separate.",
      "Client information, access, approvals and operational responsibilities are confirmed in the proposal.",
      "Work beyond the listed package components is separately scoped."
    ],
    "bestFor": [
      "New service businesses",
      "Founder-led launches",
      "Businesses with one clear offer"
    ],
    "notFor": [
      "Large catalogues requiring a full store",
      "Businesses needing only one service"
    ],
    "goodFitWhen": [
      "New businesses launching a defined offer.",
      "A brand, business website and first social channel need to launch together.",
      "A written proposal can confirm the required inputs and review stages."
    ],
    "relatedProjectSlug": "elixir-beverages",
    "continuation": "Optional continuation: Social Starter at ₹12,000 / $299 per month.",
    "scopeNote": "Social delivery begins on the agreed calendar date. Website and brand milestones are confirmed after discovery."
  },
  {
    "slug": "d2c-brand-launch-kit",
    "name": "D2C Brand Launch Kit",
    "headline": "For product businesses ready to bring their brand, Shopify store and launch materials together.",
    "idealClient": "Product businesses preparing a coordinated brand and Shopify launch.",
    "problemSolved": "The identity, store and launch material need one coherent direction.",
    "price": "₹80,000 / $1,799",
    "timeline": "Brand + store + creative kit · 1 month of SEO",
    "deliverables": [
      "Growth Store · one-time",
      "Brand Identity · one-time",
      "Launch Creative Kit · one-time",
      "SEO Starter for the store · 1 month"
    ],
    "inclusions": [
      {
        "title": "Growth Store · one-time",
        "summary": "Growth Store · one-time",
        "items": [
          "Shopify theme customisation, collections and product pages",
          "Up to 50 product uploads with reviewed descriptions",
          "Launch SEO, Search Console, WhatsApp, email capture and basic automation"
        ]
      },
      {
        "title": "Brand Identity · one-time",
        "summary": "Brand Identity · one-time",
        "items": [
          "Audience, competitor research and positioning",
          "Primary, secondary and icon logo suite",
          "Colour palette, typography, brand voice and tone",
          "Usage rules, packaging concept, business card and letterhead",
          "Brand guidelines PDF"
        ]
      },
      {
        "title": "Launch Creative Kit · one-time",
        "summary": "Launch Creative Kit · one-time",
        "items": [
          "15 ad creative assets; static / suitable AI-motion mix agreed before production",
          "10 product mockups + 10 simulated product images",
          "Six-email copy sequence + landing-page copy",
          "Five social post designs; ongoing posting is not included"
        ]
      },
      {
        "title": "SEO Starter for the store · 1 month",
        "summary": "SEO Starter for the store · 1 month",
        "items": [
          "Search Console monitoring and keyword reporting",
          "On-page optimisation for up to 10 pages per month; existing pages can be revisited",
          "One researched and reviewed SEO article per month",
          "Relevant location-search work where suitable; monthly progress report"
        ]
      }
    ],
    "notIncluded": [
      "Third-party subscriptions, hosting, platform fees and advertising budgets are separate.",
      "Client information, access, approvals and operational responsibilities are confirmed in the proposal.",
      "Work beyond the listed package components is separately scoped.",
      "The client handles inventory, orders, shipping, returns and customer support; marketplace setup is separate."
    ],
    "bestFor": [
      "D2C product launches",
      "Brands with a ready catalogue",
      "Teams able to provide product facts"
    ],
    "notFor": [
      "Businesses without a product catalogue",
      "Teams needing marketplace operations"
    ],
    "goodFitWhen": [
      "Product businesses preparing a coordinated brand and Shopify launch.",
      "The identity, store and launch material need one coherent direction.",
      "A written proposal can confirm the required inputs and review stages."
    ],
    "relatedProjectSlug": "kiraq-jewellery",
    "continuation": "Optional continuation: SEO Starter at ₹12,000 / $299 per month.",
    "scopeNote": "Creative production is a bundle inclusion, not campaign management. Client provides accurate product information and handles inventory, orders, shipping, returns and customer support. Marketplace setup is separate."
  },
  {
    "slug": "full-digital-presence",
    "name": "Full Digital Presence",
    "headline": "For established businesses ready to align their brand, website, search presence and social communication.",
    "idealClient": "Established businesses whose current digital presentation undersells their work.",
    "problemSolved": "Brand, website, search and social communication need a coordinated rebuild.",
    "price": "₹110,000 / $2,499",
    "timeline": "Brand + website build · 3 months of social and SEO",
    "deliverables": [
      "Growth Website · one-time",
      "Brand Identity · one-time",
      "Social Growth · 3 months",
      "SEO Starter · 3 months"
    ],
    "inclusions": [
      {
        "title": "Growth Website · one-time",
        "summary": "Growth Website · one-time",
        "items": [
          "Eight to ten responsive pages and blog section setup",
          "Agreed launch SEO, JSON-LD and content structure for search discovery",
          "Google Search Console, WhatsApp and email enquiry paths"
        ]
      },
      {
        "title": "Brand Identity · one-time",
        "summary": "Brand Identity · one-time",
        "items": [
          "Audience, competitor research and positioning",
          "Primary, secondary and icon logo suite",
          "Colour palette, typography, brand voice and tone",
          "Usage rules, packaging concept, business card and letterhead",
          "Brand guidelines PDF"
        ]
      },
      {
        "title": "Social Growth · 3 months",
        "summary": "Social Growth · 3 months",
        "items": [
          "21 shared posts + 15 stories per month across two selected platforms",
          "Three-month totals: 63 original posts and 45 stories; posts shared across both platforms",
          "Strategy, monthly calendars, captions, design, publishing and profile integration",
          "Engagement, comment replies and a report each month"
        ]
      },
      {
        "title": "SEO Starter · 3 months",
        "summary": "SEO Starter · 3 months",
        "items": [
          "Search Console monitoring and keyword reporting",
          "On-page optimisation for up to 10 pages per month; existing pages can be revisited",
          "One researched and reviewed SEO article per month",
          "Relevant location-search work where suitable; monthly progress report"
        ]
      }
    ],
    "notIncluded": [
      "Third-party subscriptions, hosting, platform fees and advertising budgets are separate.",
      "Client information, access, approvals and operational responsibilities are confirmed in the proposal.",
      "Work beyond the listed package components is separately scoped."
    ],
    "bestFor": [
      "Established service firms",
      "Manufacturers",
      "Businesses ready for three months of management"
    ],
    "notFor": [
      "Businesses needing only one focused deliverable",
      "Teams unable to provide access and approvals"
    ],
    "goodFitWhen": [
      "Established businesses whose current digital presentation undersells their work.",
      "Brand, website, search and social communication need a coordinated rebuild.",
      "A written proposal can confirm the required inputs and review stages."
    ],
    "relatedProjectSlug": "shree-hari-spintex",
    "continuation": "Optional continuation: Social Growth ₹22,000 / $599 per month + SEO Starter ₹12,000 / $299 per month. Both together: ₹34,000 / $898 per month.",
    "scopeNote": "SEO is tailored to the business website. Three months means the included service period, not a ranking or sales deadline. Custom CRM development is separately scoped."
  },
  {
    "slug": "local-business-dominator",
    "name": "Business Visibility & Enquiries",
    "headline": "For Indian service businesses that need stronger search visibility, clearer proof of their work and easier contact through their website and WhatsApp.",
    "idealClient": "Indian service businesses serving a defined geographic market.",
    "problemSolved": "People need to find the business, assess its work and enquire easily.",
    "price": "₹55,000 · India only",
    "timeline": "India only · Website build + 2 months of social and SEO",
    "deliverables": [
      "Business Website · one-time",
      "Social Starter · 2 months",
      "SEO Starter · 2 months",
      "Supporting Creative Pack · one-time"
    ],
    "inclusions": [
      {
        "title": "Business Website · one-time",
        "summary": "Business Website · one-time",
        "items": [
          "Five responsive pages",
          "On-page launch SEO across the five pages",
          "WhatsApp integration, contact form and email enquiry capture",
          "Google Search Console setup"
        ]
      },
      {
        "title": "Social Starter · 2 months",
        "summary": "Social Starter · 2 months",
        "items": [
          "15 posts and 10 stories per month on one platform",
          "Strategy, content guidance, captions, design and posting",
          "Engagement, comment replies and monthly performance report",
          "Two-month totals: 30 posts, 20 stories and two reports"
        ]
      },
      {
        "title": "SEO Starter · 2 months",
        "summary": "SEO Starter · 2 months",
        "items": [
          "Search Console monitoring and keyword reporting",
          "On-page optimisation for up to 10 pages per month; existing pages can be revisited",
          "One researched and reviewed SEO article per month",
          "Relevant location-search work where suitable; monthly progress report",
          "Two-month allowance: up to 20 page-optimisation tasks and two articles"
        ]
      },
      {
        "title": "Supporting Creative Pack · one-time",
        "summary": "Supporting Creative Pack · one-time",
        "items": [
          "Five static ad creatives + five product or service mockup images",
          "Ten product or service descriptions + three email drafts"
        ]
      }
    ],
    "notIncluded": [
      "Third-party subscriptions, hosting, platform fees and advertising budgets are separate.",
      "Client information, access, approvals and operational responsibilities are confirmed in the proposal.",
      "Work beyond the listed package components is separately scoped.",
      "Brand identity is not included."
    ],
    "bestFor": [
      "Service businesses in India",
      "Practices serving defined areas",
      "Teams ready for two months of SEO and social work"
    ],
    "notFor": [
      "Businesses outside India",
      "Teams needing only a standalone service"
    ],
    "goodFitWhen": [
      "Indian service businesses serving a defined geographic market.",
      "People need to find the business, assess its work and enquire easily.",
      "A written proposal can confirm the required inputs and review stages."
    ],
    "relatedProjectSlug": "mittal-architect",
    "continuation": "Optional continuation: Social Starter ₹12,000/month + SEO Starter ₹12,000/month. Both together: ₹24,000/month.",
    "scopeNote": "Designed for businesses serving a defined geographic market. The wider Kraftt offer remains available across India and internationally. Brand identity is not included in this bundle."
  }
];

export const bundleBySlug = (slug: string) => bundles.find((bundle) => bundle.slug === slug);
