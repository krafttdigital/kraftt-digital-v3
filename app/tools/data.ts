export type ToolGroup = 'Digital Growth Tools' | 'Business Utility Tools';

export type ToolDefinition = {
  slug: string;
  name: string;
  description: string;
  value: string;
  group: ToolGroup;
  time: string;
};

export const tools: ToolDefinition[] = [
  {
    slug: 'digital-presence-score',
    name: 'Digital Presence Score',
    description: 'Check brand clarity, search visibility, enquiry flow and ownership in two minutes.',
    value: 'See where your digital presence is strong—and where enquiries may be leaking.',
    group: 'Digital Growth Tools',
    time: '2 minutes',
  },
  {
    slug: 'website-cost-calculator',
    name: 'Website Cost Calculator',
    description: 'Estimate website cost in India from Kraftt’s published website and store starting prices.',
    value: 'Compare website prices in India and turn your brief into a clear starting estimate.',
    group: 'Digital Growth Tools',
    time: '1 minute',
  },
  {
    slug: 'social-media-cost-calculator',
    name: 'Social Media Cost Calculator',
    description: 'Find the social management tier that fits your platform and content needs.',
    value: 'Translate your monthly content needs into the closest Kraftt social tier.',
    group: 'Digital Growth Tools',
    time: '1 minute',
  },
  {
    slug: 'seo-roi-calculator',
    name: 'SEO ROI Calculator',
    description: 'Model conservative, moderate and strong organic-growth scenarios side by side.',
    value: 'Explore three illustrative SEO growth scenarios without turning a projection into a promise.',
    group: 'Digital Growth Tools',
    time: '2 minutes',
  },
  {
    slug: 'roas-calculator',
    name: 'ROAS Calculator',
    description: 'Compare ad revenue, spend, break-even return and profit after advertising.',
    value: 'See whether ad performance clears your margin-based break-even point.',
    group: 'Digital Growth Tools',
    time: '1 minute',
  },
  {
    slug: 'gst-calculator',
    name: 'GST Calculator',
    description: 'Add GST, reverse an inclusive amount and split CGST/SGST or IGST.',
    value: 'Calculate inclusive or exclusive GST amounts with the correct tax split.',
    group: 'Business Utility Tools',
    time: 'Instant',
  },
  {
    slug: 'gst-invoice-generator',
    name: 'GST Invoice Generator',
    description: 'Create line items, calculate GST live and download a neutral professional PDF.',
    value: 'Format and download a professional GST invoice without an account or server storage.',
    group: 'Business Utility Tools',
    time: '3–5 minutes',
  },
  {
    slug: 'discount-profit-calculator',
    name: 'Discount Profit Calculator',
    description: 'Find the extra sales a discount would need to preserve your total contribution.',
    value: 'Try a discount and see how many more units you would need to sell to match the original contribution.',
    group: 'Business Utility Tools',
    time: 'Instant',
  },
  {
    slug: 'cod-rto-cost-calculator',
    name: 'COD & RTO Cost Calculator',
    description: 'Estimate the shipping, packaging and product losses from failed cash-on-delivery orders.',
    value: 'See what returned cash-on-delivery orders cost across a month of dispatches.',
    group: 'Business Utility Tools',
    time: 'Instant',
  },
  {
    slug: 'instagram-engagement-calculator',
    name: 'Instagram Engagement Calculator',
    description: 'Measure Instagram engagement using your reach or follower count and four interaction counts.',
    value: 'Enter the counts from your content and see how its engagement rate changes with the audience you measure.',
    group: 'Digital Growth Tools',
    time: 'Instant',
  },
  {
    slug: 'project-pricing-calculator',
    name: 'Project Pricing Calculator',
    description: 'Estimate a project quote from your hours, expenses, overhead and desired profit margin.',
    value: 'Build a quote that covers the cost of delivery and leaves room for your chosen profit margin.',
    group: 'Business Utility Tools',
    time: 'Instant',
  },
  {
    slug: 'marketplace-settlement-calculator',
    name: 'Marketplace Settlement Calculator',
    description: 'Estimate the payout on a marketplace statement and the contribution left after operating costs.',
    value: 'Follow your marketplace sales through refunds, deductions and product costs to see what you keep.',
    group: 'Business Utility Tools',
    time: 'Instant',
  },
  {
    slug: 'website-quote-comparison',
    name: 'Website Quote Comparison',
    description: 'Compare two website proposals over time, including recurring charges, maintenance, scope and ownership.',
    value: 'Check what each proposal costs over the same period and which details to clarify before signing.',
    group: 'Digital Growth Tools',
    time: 'Instant',
  },
];

export const toolBySlug = (slug: string) => tools.find((tool) => tool.slug === slug);
