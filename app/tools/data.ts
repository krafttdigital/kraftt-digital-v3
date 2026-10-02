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
    description: 'Match your site requirements to a published Kraftt package and starting estimate.',
    value: 'Turn a rough website brief into a clear package and starting investment.',
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
];

export const toolBySlug = (slug: string) => tools.find((tool) => tool.slug === slug);
