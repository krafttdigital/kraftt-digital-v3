export const articleDiagrams = {
  'website-plan': {
    title: 'A clear route from brief to launch',
    description: 'Each stage ends with something you can review.',
    steps: [
      { title: 'Plan', detail: 'Agree the audience, enquiry goal and page list.' },
      { title: 'Prepare', detail: 'Collect copy, images, product details and access.' },
      { title: 'Build', detail: 'Approve the design, then develop the agreed pages.' },
      { title: 'Review', detail: 'Test the mobile experience, content and enquiry delivery.' },
      { title: 'Launch', detail: 'Connect the domain, check indexing and hand over access.' },
    ],
    caption: 'A planning sequence. The written scope determines the work and timeline.',
  },
  'identity-system': {
    title: 'One identity, across the business',
    description: 'Start with a shared direction, then make it usable in everyday work.',
    steps: [
      { title: 'Direction', detail: 'Audience, positioning and a clear promise.' },
      { title: 'Identity', detail: 'Logo variations, type, colour, imagery and voice.' },
      { title: 'Applications', detail: 'Website, packaging, social posts and listings.' },
      { title: 'Handover', detail: 'Files, licences, templates and practical guidelines.' },
    ],
    caption: 'An illustrative workflow. Applications and production files depend on the agreed scope.',
  },
} as const;
