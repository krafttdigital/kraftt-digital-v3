export type StoryImage = {
  src: string;
  alt: string;
  caption: string;
  portrait?: boolean;
};

export type CaseStudyFlow = {
  start: {
    before?: StoryImage;
    beforeMobile?: StoryImage;
    empty?: string;
  };
  identity: {
    sells: string;
    buyers: string;
    discovery: string;
    image: StoryImage;
    photo?: StoryImage;
    logo?: { src: string; alt: string };
  };
  brief: { headline: string; asked: string; needed: string };
  callouts?: readonly { x: number; y: number; problem: number }[];
  decisionImages: readonly StoryImage[];
  process?: StoryImage;
  reveal: {
    desktop: StoryImage;
    mobile?: StoryImage;
    clip?: { src: string; poster: string; description: string };
  };
  ledger: {
    built: readonly string[];
    intended: readonly string[];
    note: string;
    measured?: { value: string; source: string; period: string };
  };
  results: readonly (StoryImage & { title: string; kind: 'Published work' | 'Search result' | 'Maps listing' | 'AI Overview'; query?: string; mobileSrc?: string })[];
  feedback?: {
    text: string;
    attribution: string;
    note: string;
    permission: boolean;
  };
  improvement: string;
};

const image = (slug: string, name: string, alt: string, caption: string, portrait = false): StoryImage => ({
  src: `/assets/case-studies/${slug}/${name}.webp`,
  alt,
  caption,
  portrait,
});

const searchResult = (slug: string, file: string, title: string, alt: string, caption: string, kind: 'Search result' | 'Maps listing' | 'AI Overview', query?: string) => ({
  src: `/assets/case-studies/${slug}/results/${file}.png`, title, alt, caption, kind, query,
});

export const caseStudyFlow: Record<string, CaseStudyFlow> = {
  'gate-seeds': {
    start: {
      before: image('gate-seeds', 'before-home', 'Previous Gate Seeds homepage with a simple navigation and seed-slider introduction', 'Old site · capture date not supplied'),
      beforeMobile: image('gate-seeds', 'before-mobile', 'Previous Gate Seeds homepage on a phone', 'Old mobile homepage · capture date not supplied', true),
    },
    identity: {
      sells: 'Wheat and paddy seed varieties developed and manufactured by Gate Seeds.',
      buyers: 'Farmers and other seed businesses.',
      discovery: 'The business was known through referrals and WhatsApp; its earlier site gave less help to a new visitor.',
      image: image('gate-seeds', 'paddy-product', 'Gate Seeds Kranti paddy seed pack', 'Product image from the published Gate Seeds work', true),
      photo: image('gate-seeds', 'client-photo', 'Gate Seeds facility photograph from the client website', 'Gate Seeds facility · photograph from the published site'),
      logo: { src: '/assets/case-studies/gate-seeds/client-logo.webp', alt: 'Gate Seeds logo' },
    },
    brief: {
      headline: 'Make the seed range easier to understand.',
      asked: 'Present the company and its seed range more clearly online.',
      needed: 'Make the varieties, research story and enquiry path understandable without a phone call first.',
    },
    callouts: [
      { x: 59, y: 18, problem: 0 },
      { x: 48, y: 70, problem: 1 },
      { x: 40, y: 86, problem: 2 },
    ],
    decisionImages: [
      image('gate-seeds', 'after-home', 'Gate Seeds redesigned homepage introduces its experience and research', 'The company story leads the redesigned homepage.'),
      image('gate-seeds', 'products', 'Gate Seeds products page with wheat and paddy catalogue routes', 'Wheat and paddy varieties have a catalogue.'),
      image('gate-seeds', 'contact-mobile', 'Gate Seeds mobile contact page with WhatsApp enquiry route', 'The enquiry path is visible on mobile.', true),
      image('gate-seeds', 'after-mobile', 'Gate Seeds redesigned homepage at mobile width', 'Responsive layout on a phone.', true),
    ],
    process: image('gate-seeds', 'process', 'Gate Seeds site-flow sketch', 'Early site-flow sketch'),
    reveal: {
      desktop: image('gate-seeds', 'after-home', 'Redesigned Gate Seeds homepage', 'Published homepage · after redesign'),
      mobile: image('gate-seeds', 'after-mobile', 'Redesigned Gate Seeds homepage on a phone', 'Published mobile homepage', true),
      clip: { src: '/assets/case-studies/gate-seeds/home-scroll.webm', poster: '/assets/case-studies/gate-seeds/after-home.webp', description: 'Silent screen recording of the Gate Seeds homepage scroll, limited to its first ten seconds.' },
    },
    ledger: {
      built: ['Responsive website', 'Wheat and paddy catalogue', 'WhatsApp enquiry routes'],
      intended: ['Explain the research and product range', 'Make product exploration and contact easier'],
      note: 'The published pages document delivery. No dated traffic or enquiry record has been supplied to quantify results.',
    },
    results: [
      { ...image('gate-seeds', 'after-home', 'Published Gate Seeds homepage', 'The redesigned homepage introduces the company and its seed range.'), mobileSrc: '/assets/case-studies/gate-seeds/after-mobile.webp', title: 'The company story, up front', kind: 'Published work' },
      { ...image('gate-seeds', 'products', 'Gate Seeds wheat and paddy catalogue', 'Product routes help visitors explore the seed varieties.'), title: 'A clearer product route', kind: 'Published work' },
      { ...image('gate-seeds', 'contact-mobile', 'Gate Seeds mobile contact page', 'The mobile page presents a direct enquiry route.', true), title: 'A path to enquiry on mobile', kind: 'Published work' },
    ],
    improvement: 'Next, we would collect a dated enquiry baseline and learn which product pages lead visitors to contact the team.',
  },
  'shree-hari-spintex': {
    start: {
      before: image('shree-hari-spintex', 'before-home-supplied', 'Client-supplied previous Shree Hari Spintex homepage showing a large mill photograph and top navigation', 'Old homepage · as supplied; capture date not supplied'),
    },
    identity: {
      sells: 'Cotton yarn made at the Shree Hari Spintex mill.',
      buyers: 'Textile sourcing and procurement teams.',
      discovery: 'Buyers reached the business through existing relationships, its website and local discovery.',
      image: image('shree-hari-spintex', 'machinery', 'Shree Hari Spintex machinery page showing the production facility', 'Published machinery page and facility imagery'),
      photo: image('shree-hari-spintex', 'client-photo', 'Blowroom machinery at Shree Hari Spintex', 'Production equipment · photograph from the published site'),
      logo: { src: '/assets/projects/shree-hari-spintex/shsl-logo.jpg', alt: 'Shree Hari Spintex logo' },
    },
    brief: {
      headline: 'Help buyers evaluate the mill faster.',
      asked: 'Bring the older website, product information and contact route up to date.',
      needed: 'Help a sourcing buyer find the right yarn, understand the mill and take a clear next step.',
    },
    callouts: [
      { x: 65, y: 15, problem: 0 },
      { x: 89, y: 15, problem: 2 },
    ],
    decisionImages: [
      image('shree-hari-spintex', 'products', 'Shree Hari Spintex product navigation for yarn types', 'Separate routes for yarn types.'),
      image('shree-hari-spintex', 'machinery', 'Shree Hari Spintex machinery page', 'Dedicated production context.'),
      image('shree-hari-spintex', 'after-home', 'Published Shree Hari Spintex homepage with enquiry calls to action', 'Clearer path to a quote.'),
    ],
    process: image('shree-hari-spintex', 'process', 'Shree Hari Spintex buyer-journey sketch', 'Buyer-journey sketch'),
    reveal: {
      desktop: image('shree-hari-spintex', 'after-home', 'Rebuilt Shree Hari Spintex homepage', 'Published homepage · 18 October 2026'),
      mobile: image('shree-hari-spintex', 'after-mobile', 'Rebuilt Shree Hari Spintex homepage on a phone', 'Published mobile homepage', true),
      clip: { src: '/assets/case-studies/shree-hari-spintex/home-scroll.webm', poster: '/assets/case-studies/shree-hari-spintex/after-home.webp', description: 'Silent screen recording of the Shree Hari Spintex homepage scroll, limited to its first ten seconds.' },
    },
    ledger: {
      built: ['Yarn product routes', 'Machinery and quality pages', 'Contact and quote paths'],
      intended: ['Help buyers assess the mill', 'Connect product research to an enquiry'],
      note: 'The supplied search and Maps captures show visibility in those views. Dated analytics would be needed to quantify enquiries or sales.',
    },
    results: [
      searchResult('shree-hari-spintex', 'brand-search-as-supplied', 'Website and business listing together', 'Supplied Google search screenshot for Shree Hari Spintex with site links and business panel', 'The supplied brand search shows website pages and the business listing in the same view.', 'Search result', 'shree hari spintex'),
      searchResult('shree-hari-spintex', 'google-maps-listing-as-supplied', 'The mill in Maps', 'Supplied Google Maps listing screenshot for Shree Hari Spintex', 'The listing displays facility photos, contact details and directions in the supplied view.', 'Maps listing'),
      searchResult('shree-hari-spintex', 'spinning-mills-punjab-search-as-supplied', 'A broader category search', 'Supplied Google search screenshot for spinning mills in Punjab showing a Shree Hari Spintex organic listing', 'The company website appears as an organic result beneath other results in this supplied search view.', 'Search result', 'spinning mills in punjab'),
    ],
    feedback: {
      text: 'Our Google Maps listing was set up, but we were not getting a response. After adding proper images, About and Services information, the website URL and the correct location, visibility improved and customers could find us more easily.',
      attribution: 'Deepak Garg · Shree Hari Spintex',
      note: 'Client-reported feedback, translated from the supplied review; no independent ranking or enquiry figures are claimed.',
      permission: true,
    },
    improvement: 'Next, we would test the full contact journey and collect dated analytics before making any performance claim.',
  },
  'mittal-architect': {
    start: { empty: 'The practice had no central website. Its work was shared through referrals, WhatsApp and Instagram.' },
    identity: {
      sells: 'Residential, commercial, exterior and interior architecture services.',
      buyers: 'Local and remote clients, including NRIs.',
      discovery: 'The practice was primarily introduced through referrals, WhatsApp and Instagram.',
      image: image('mittal-architect', 'goyal-residence', 'Goyal Residence project featured in the Mittal Architect portfolio', 'Selected residential project from the published portfolio'),
      photo: image('mittal-architect', 'client-photo', 'Architect Neeraj Mittal portrait from the practice website', 'Neeraj Mittal · portrait from the published practice website', true),
      logo: { src: '/assets/case-studies/mittal-architect/client-logo.webp', alt: 'Mittal Architect logo' },
    },
    brief: {
      headline: 'Give the practice one clear home.',
      asked: 'Give the firm an online home for its services and projects.',
      needed: 'Let a new visitor judge the spaces, understand the process and find a consultation route.',
    },
    decisionImages: [
      image('mittal-architect', 'website-home', 'Mittal Architect homepage introducing the practice', 'Positioning on the homepage.'),
      image('mittal-architect', 'project-gallery', 'Mittal Architect project gallery', 'Selected projects with context.'),
      image('mittal-architect', 'services-mobile', 'Mittal Architect services page on a phone', 'Services remain readable on mobile.', true),
      image('mittal-architect', 'website-home', 'Mittal Architect homepage with consultation route', 'A direct path to consultation.'),
    ],
    process: image('mittal-architect', 'process', 'Mittal Architect visitor-flow sketch', 'Visitor-flow sketch'),
    reveal: {
      desktop: image('mittal-architect', 'website-home', 'Published Mittal Architect homepage', 'Published website homepage'),
      mobile: image('mittal-architect', 'after-mobile', 'Published Mittal Architect homepage on a phone', 'Published mobile homepage', true),
      clip: { src: '/assets/case-studies/mittal-architect/home-scroll.webm', poster: '/assets/case-studies/mittal-architect/website-home.webp', description: 'Silent screen recording of the Mittal Architect homepage scroll, limited to its first ten seconds.' },
    },
    ledger: {
      built: ['Practice website', 'Selected-project gallery', 'Service and consultation paths'],
      intended: ['Make the work easier to review', 'Help new visitors decide whether to enquire'],
      note: 'The supplied Google and AI search captures show appearances in those views. They do not establish lasting placement or traffic gains.',
    },
    results: [
      searchResult('mittal-architect', '01-brand-ai-overview', 'A brand description in AI Overview', 'Supplied Google AI Overview screenshot for the Mittal Architect brand search', 'The supplied view names the practice and links to its website. AI summaries can change.', 'AI Overview', 'mittal architect'),
      searchResult('mittal-architect', '02-brand-organic-results', 'The practice and projects in search', 'Supplied Google brand search screenshot showing Mittal Architect pages', 'The supplied brand search shows the About and Projects pages.', 'Search result', 'mittal architect'),
      searchResult('mittal-architect', '03-architect-in-mansa', 'A Mansa service-page result', 'Supplied Google search screenshot showing Mittal Architect in a Mansa query', 'The Mansa service page appears in this supplied search view.', 'Search result', 'architect in mansa'),
      searchResult('mittal-architect', '04-architect-in-tapa', 'The practice in a Tapa search', 'Supplied Google search screenshot for architects in Tapa', 'The practice homepage appears in this supplied search view.', 'Search result', 'architect in tapa'),
      searchResult('mittal-architect', '05-architect-in-bathinda', 'A Bathinda service-page result', 'Supplied Google search screenshot for architects in Bathinda', 'The Bathinda service page appears in this supplied search view.', 'Search result', 'architect in bathinda'),
      searchResult('mittal-architect', '06-architect-in-barnala', 'A Barnala service-page result', 'Supplied Google search screenshot for architects in Barnala', 'The Barnala service page appears in this supplied search view.', 'Search result', 'architect in barnala'),
      searchResult('mittal-architect', '07-architect-in-faridkot', 'A Faridkot service-page result', 'Supplied Google search screenshot for architects in Faridkot', 'The Faridkot service page appears in this supplied search view.', 'Search result', 'architect in faridkot'),
      searchResult('mittal-architect', '08-neeraj-mittal-ai-overview', 'The founder in AI Overview', 'Supplied Google AI Overview screenshot for architect Neeraj Mittal', 'The supplied view links the founder and practice. It does not establish a permanent AI citation.', 'AI Overview', 'arch neeraj mittal'),
    ],
    feedback: {
      text: 'They translated my creativity and luxury-focused thinking into a premium website.',
      attribution: 'Neeraj Mittal · Founder',
      note: 'Excerpt from the client testimonial supplied for publication.',
      permission: true,
    },
    improvement: 'Next, we would collect dated search and enquiry data to understand which project pages help visitors start a consultation.',
  },
  'elixir-beverages': {
    start: { empty: 'Elixir was preparing to launch. There was no earlier website to compare with the finished one.' },
    identity: {
      sells: 'A botanical sparkling refreshment brand at pre-launch.',
      buyers: 'Early customers and potential trade partners.',
      discovery: 'Before launch, the product story and logo directions lived in conversations and concept images.',
      image: image('elixir-beverages', 'website-desktop', 'Elixir Beverages published website introducing its original drink', 'Published product presentation; not a client portrait'),
      logo: { src: '/assets/case-studies/elixir-beverages/client-logo.webp', alt: 'Elixir Beverages logo' },
    },
    brief: {
      headline: 'Build the brand before the effects.',
      asked: 'A premium multi-page 3D website with scroll effects.',
      needed: 'A clear brand foundation, one focused launch page and separate ways for consumers and trade partners to get in touch.',
    },
    decisionImages: [
      image('elixir-beverages', 'website-desktop', 'Elixir Beverages focused one-page website', 'A single product story.'),
      image('elixir-beverages', 'ingredients', 'Elixir Beverages botanical ingredients website section', 'Restrained motion and product imagery.'),
      image('elixir-beverages', 'website-mobile', 'Elixir Beverages brand presentation on a phone', 'Approved identity on mobile.', true),
      image('elixir-beverages', 'trade-enquiry', 'Elixir Beverages trade enquiry section', 'Separate trade enquiry route.'),
    ],
    process: image('elixir-beverages', 'process', 'Elixir Beverages visitor-flow sketch', 'Early visitor-flow sketch'),
    reveal: {
      desktop: image('elixir-beverages', 'website-desktop', 'Published Elixir Beverages launch website', 'Published launch website · 18 October 2026'),
      mobile: image('elixir-beverages', 'website-mobile', 'Published Elixir Beverages launch website on a phone', 'Published mobile experience', true),
      clip: { src: '/assets/projects/elixir-beverages/elixir-design-in-practice.mp4', poster: '/assets/case-studies/elixir-beverages/website-desktop.webp', description: 'Silent ten-second view of the Elixir Beverages website design in practice.' },
    },
    ledger: {
      built: ['Approved brand rules', 'Focused launch website', 'Consumer and trade contact paths'],
      intended: ['Introduce the product before launch', 'Make early interest actionable'],
      note: 'The supplied brand-search capture shows the launch site in one view. A dated report would be needed to assess traffic or enquiries.',
    },
    results: [
      searchResult('elixir-beverages', 'brand-search-google', 'The launch site in brand search', 'Supplied Google search screenshot for Elixir Beverages showing elixirbeverages.in', 'The supplied view from Maur, Punjab shows the launch site for the brand-name search. This is one observed search result.', 'Search result', 'elixir beverages'),
      { ...image('elixir-beverages', 'trade-enquiry', 'Published Elixir Beverages trade enquiry section', 'The published page gives potential trade partners a separate route to enquire.'), title: 'A route for trade interest', kind: 'Published work' },
    ],
    feedback: {
      text: 'Handled my project very professionally ... Really appreciate!',
      attribution: 'Ayushman Mithal · Elixir Beverages',
      note: 'Excerpt from the client testimonial supplied for publication.',
      permission: true,
    },
    improvement: 'Next, we would compare the consumer and trade enquiry routes against a dated baseline after launch.',
  },
};
