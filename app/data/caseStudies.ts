export type CaseStudyImage = {
  src: string;
  alt: string;
  caption: string;
  shape?: 'portrait' | 'landscape';
};

export type CaseStudyContent = {
  title: string;
  lead: string;
  location: string;
  projectDate: string;
  overviewTitle: string;
  overview: string;
  facts: readonly { label: string; value: string }[];
  challengeTitle: string;
  challenge: string;
  challengePoints: readonly string[];
  beforeAfter?: readonly [CaseStudyImage, CaseStudyImage];
  decisions: readonly { title: string; reason: string; result: string }[];
  showcaseTitle: string;
  showcaseIntro: string;
  showcase: readonly CaseStudyImage[];
  outcomesTitle: string;
  outcomes: readonly { title: string; detail: string }[];
  proof: CaseStudyImage;
  proofNote: string;
  takeaway: string;
};

const asset = (slug: string, name: string) => `/assets/case-studies/${slug}/${name}.webp`;

export const caseStudies: Record<string, CaseStudyContent> = {
  'shree-hari-spintex': {
    title: 'A clearer digital home for Shree Hari Spintex',
    lead: 'Bringing a cotton yarn manufacturer’s products, mill capabilities and enquiry route into one buyer-friendly experience.',
    location: 'Maur Mandi, Bathinda',
    projectDate: 'Project began 15 July 2026',
    overviewTitle: 'Make the mill easier to understand—and easier to contact.',
    overview: 'Shree Hari Spintex manufactures cotton yarn. We organised its online presentation around a sourcing buyer’s practical questions: which yarn is available, how it is produced, what standards support it and how to make an enquiry.',
    facts: [
      { label: 'Client', value: 'Shree Hari Spintex Ltd.' },
      { label: 'Industry', value: 'Cotton yarn manufacturing' },
      { label: 'Scope', value: 'Website redesign · search setup · LinkedIn' },
      { label: 'Audience', value: 'Textile sourcing and procurement buyers' },
    ],
    challengeTitle: 'The previous site did not tell the full factory story.',
    challenge: 'The client brief described an outdated layout and problems with the enquiry form, contact email and Maps location. The archived page also shows a much older structure and dense machinery copy. The reported contact problems were not independently retested on the old live site.',
    challengePoints: [
      'Yarn types and mill capabilities needed distinct, easy-to-find routes.',
      'Production, quality and sustainability evidence was difficult to assess together.',
      'Buyers needed a visible path from product research to a direct enquiry.',
    ],
    beforeAfter: [
      { src: asset('shree-hari-spintex', 'before-home'), alt: 'Archived Shree Hari Spintex homepage from March 2025', caption: 'Before · archived homepage capture, 26 March 2025' },
      { src: asset('shree-hari-spintex', 'after-home'), alt: 'Rebuilt Shree Hari Spintex homepage', caption: 'After · published homepage capture, 18 October 2026' },
    ],
    decisions: [
      { title: 'Give each yarn a route', reason: 'A sourcing buyer needs to reach the relevant product without decoding one long overview.', result: 'Combed, carded, TFO double and slub yarn gained clearer product navigation.' },
      { title: 'Make the operation visible', reason: 'Real production and quality context matters in a B2B buying decision.', result: 'Machinery, quality, sustainability and company information gained dedicated space.' },
      { title: 'Connect research to enquiry', reason: 'The website needed to help buyers act once they understood the capability.', result: 'Product and quote calls to action lead to contact details and a direct conversation.' },
    ],
    showcaseTitle: 'From product range to factory proof.',
    showcaseIntro: 'The delivered pages let visitors move from yarn options into the manufacturing context behind them.',
    showcase: [
      { src: asset('shree-hari-spintex', 'products'), alt: 'Shree Hari Spintex yarn product page', caption: 'Product navigation gives each yarn type its own place.' },
      { src: asset('shree-hari-spintex', 'machinery'), alt: 'Shree Hari Spintex machinery page', caption: 'Manufacturing capability is documented beyond the homepage.' },
    ],
    outcomesTitle: 'A finished site with clearer discovery routes.',
    outcomes: [
      { title: 'Published website', detail: 'Product, machinery, quality, sustainability and contact information now work as a connected buyer journey.' },
      { title: 'Visible enquiry path', detail: 'Visitors can move from product information toward a quote or direct contact.' },
      { title: 'Search and social presence', detail: 'Supplied captures document the business website, Maps listing and LinkedIn company page at a point in time.' },
    ],
    proof: { src: asset('shree-hari-spintex', 'brand-search'), alt: 'Supplied Google search screenshot showing the Shree Hari Spintex website and business listing', caption: 'Supplied branded-search capture · original capture date not provided' },
    proofNote: 'The search capture shows one view, not a sustained ranking trend. Dated Search Console evidence was not supplied, so no measured traffic, ranking or revenue result is claimed.',
    takeaway: 'Show the products, the mill and the next step in the order a buyer needs them.',
  },
  'mittal-architect': {
    title: 'A digital presence worthy of the work',
    lead: 'Years of architecture experience and a luxury-focused portfolio became easier to discover, explore and enquire about online.',
    location: 'Tapa Mandi, Punjab',
    projectDate: 'Project date 3 July 2026',
    overviewTitle: 'From reputation to a clear online portfolio.',
    overview: 'Led by architect Neeraj Mittal, the practice has worked across residential, commercial, exterior and interior design since 2011. The website gives local and remote clients a structured way to understand its approach and review the work before making contact.',
    facts: [
      { label: 'Client', value: 'Mittal Architect' },
      { label: 'Founder', value: 'Arch. Neeraj Mittal' },
      { label: 'Scope', value: 'Website · SEO foundations' },
      { label: 'Audience', value: 'Residential and commercial clients, including NRIs' },
    ],
    challengeTitle: 'A strong practice without a central website.',
    challenge: 'The firm was known through referrals, WhatsApp and Instagram, but prospective clients had no dedicated place to see services, selected projects and the thinking behind them together.',
    challengePoints: [
      'The portfolio and services needed a searchable home.',
      'Experience, design focus and Vastu expertise needed a clear introduction.',
      'Clients beyond the local referral network needed a direct consultation route.',
    ],
    decisions: [
      { title: 'Lead with the practice', reason: 'New visitors needed to understand the firm before browsing individual projects.', result: 'The homepage introduces its premium focus, founder and experience.' },
      { title: 'Let projects carry the proof', reason: 'Architecture clients evaluate the spaces, not just service claims.', result: 'A selected-project gallery and project detail pages show work with context.' },
      { title: 'Explain services and process', reason: 'Clients arrive with different project types and levels of familiarity.', result: 'Service and process content makes the scope and first conversation clearer.' },
      { title: 'Make discovery actionable', reason: 'Remote visitors needed a route from regional searches to an enquiry.', result: 'Location-aware content, FAQs and consultation calls to action connect discovery to contact.' },
    ],
    showcaseTitle: 'Projects give the story substance.',
    showcaseIntro: 'The website presents the practice through real spaces, project categories and a restrained visual system.',
    showcase: [
      { src: asset('mittal-architect', 'website-home'), alt: 'Mittal Architect website homepage', caption: 'A premium introduction to the practice.' },
      { src: asset('mittal-architect', 'project-gallery'), alt: 'Mittal Architect selected project gallery', caption: 'Residential and commercial projects are organised for exploration.' },
      { src: asset('mittal-architect', 'goyal-residence'), alt: 'Goyal Residence project image from Mittal Architect website', caption: 'Selected residential work · Goyal Residence.' },
      { src: asset('mittal-architect', 'ss-square-market'), alt: 'SS Square Market project image from Mittal Architect website', caption: 'Selected commercial work · SS Square Market.' },
      { src: asset('mittal-architect', 'services-mobile'), alt: 'Mittal Architect service page on a mobile viewport', caption: 'Service detail remains usable on mobile.', shape: 'portrait' },
    ],
    outcomesTitle: 'A clearer way to present and discover the firm.',
    outcomes: [
      { title: 'Defined positioning', detail: 'Experience, design approach and services now share one consistent introduction.' },
      { title: 'Work on display', detail: 'Selected residential and commercial projects have a dedicated portfolio.' },
      { title: 'Paths to enquire', detail: 'Visitors can move from projects or services to consultation and contact options.' },
    ],
    proof: { src: asset('mittal-architect', 'search-example'), alt: 'Supplied Google search screenshot for architects in Mansa', caption: 'Supplied regional search example · capture date not visible' },
    proofNote: 'This screenshot records one local search view. The source folder does not contain dated analytics supporting the impression and click-through figures in the project brief, so they are not stated as verified results.',
    takeaway: 'A considered portfolio helps the right client judge the work before the first conversation.',
  },
  'elixir-beverages': {
    title: 'A focused first impression for a new botanical drink',
    lead: 'Elixir asked for a premium 3D website. Together, we shaped a clearer launch presence: a distinct product story, a focused website and ways for early customers and trade partners to get in touch.',
    location: 'Gurugram, NCR',
    projectDate: 'Project date 10 July 2026',
    overviewTitle: 'From an idea to a place people can explore.',
    overview: 'Elixir Beverages is a pre-launch botanical sparkling refreshment brand. With no established website, its early logo and product references lived in conversations and concept images. The work connected the product story and first enquiries in one online experience.',
    facts: [
      { label: 'Client', value: 'Ayushman Mithal and Yash Khandelwal' },
      { label: 'Business', value: 'Elixir Beverages' },
      { label: 'Scope', value: 'Website · branding' },
      { label: 'Starting point', value: 'Pre-launch; no earlier website' },
    ],
    challengeTitle: 'Make the product memorable before launch.',
    challenge: 'The founders initially wanted a luxurious multi-page 3D website. At this stage, the more immediate need was a coherent brand presentation and a simple path for people interested in the product or distribution.',
    challengePoints: [
      'The drink needed a clear identity and product story.',
      'Visitors needed to understand the can and botanical ingredients.',
      'Consumer interest and trade enquiries needed different next steps.',
    ],
    decisions: [
      { title: 'Build one focused page', reason: 'At pre-launch, the brand had one lead product and a small set of visitor questions.', result: 'A single scroll journey moves from the product promise to botanicals, the can and contact options.' },
      { title: 'Use restrained motion', reason: 'A full 3D build would add complexity before launch and obscure the essential message.', result: 'Layered product imagery, typography and scroll motion create a premium feel without a heavy 3D scene.' },
      { title: 'Follow the chosen mark', reason: 'Kraftt explored an alternative X-mark, but the founders preferred their E/leaf/water direction.', result: 'The published site and brand rules use the approved identity.' },
      { title: 'Split the enquiry routes', reason: 'Consumers and trade partners arrive with different intent.', result: 'The website presents early-access interest alongside trade and WhatsApp contact paths.' },
    ],
    showcaseTitle: 'The idea made visible.',
    showcaseIntro: 'Deep green, warm ivory and the chosen mark carry the same product story across desktop and mobile.',
    showcase: [
      { src: asset('elixir-beverages', 'website-desktop'), alt: 'Elixir Beverages website desktop homepage', caption: 'The product promise opens the published website.' },
      { src: asset('elixir-beverages', 'website-mobile'), alt: 'Elixir Beverages website mobile homepage', caption: 'The brand story adapts to a narrow screen.', shape: 'portrait' },
      { src: asset('elixir-beverages', 'ingredients'), alt: 'Elixir Beverages botanical ingredients section', caption: 'Ingredients support the product narrative.' },
      { src: asset('elixir-beverages', 'trade-enquiry'), alt: 'Elixir Beverages trade enquiry section', caption: 'Interested trade contacts have a separate next step.' },
    ],
    outcomesTitle: 'A visible starting point before launch.',
    outcomes: [
      { title: 'Brand foundation', detail: 'The chosen logo, colours and typography gained practical rules for digital use.' },
      { title: 'Published experience', detail: 'The product story and enquiry paths are available in one focused website.' },
      { title: 'Early search presence', detail: 'Supplied Search Console and branded-search captures show initial visibility, without establishing a sustained ranking.' },
    ],
    proof: { src: asset('elixir-beverages', 'search-console'), alt: 'Supplied Elixir Search Console screenshot with the three-month selector visible', caption: 'Supplied Search Console capture · exact start and end dates are not visible' },
    proofNote: 'The source screenshot has no absolute reporting dates. A separate supplied branded-search view shows the site appearing for its name once. Neither image supports a claim about ongoing rank, sales, orders or lead growth.',
    takeaway: 'A launch website should make the product understandable and give interest somewhere useful to go.',
  },
  'gate-seeds': {
    title: 'Giving Gate Seeds a clearer digital presence',
    lead: 'A website built to explain the company’s experience, present its wheat and paddy seed varieties, and make it easier for customers to enquire.',
    location: 'Maur Mandi, Punjab',
    projectDate: 'Project date 23 September 2026',
    overviewTitle: 'A stronger story for a seed manufacturer.',
    overview: 'Gate Seeds develops and manufactures wheat and paddy seed varieties for farmers and other seed businesses. The redesign brings its products, research work and more than 20 years of industry experience into a clearer presentation.',
    facts: [
      { label: 'Client', value: 'Gate Seeds' },
      { label: 'Location', value: 'Maur Mandi, Punjab' },
      { label: 'Scope', value: 'Website redesign · SEO foundations · basic branding' },
      { label: 'Audience', value: 'Farmers and seed businesses' },
    ],
    challengeTitle: 'The experience needed clarity.',
    challenge: 'Customers mainly found Gate Seeds through referrals and WhatsApp. The earlier website did not give visitors an equally clear way to understand its products or start an enquiry, especially on smaller screens.',
    challengePoints: [
      'Product information had no clear catalogue to browse.',
      'Copy and visuals did not consistently explain the company’s research and product value.',
      'The mobile layout and WhatsApp enquiry path needed attention.',
    ],
    beforeAfter: [
      { src: asset('gate-seeds', 'before-home'), alt: 'Previous Gate Seeds homepage captured from supplied source files', caption: 'Before · fresh capture of the supplied old-site files' },
      { src: asset('gate-seeds', 'after-home'), alt: 'Redesigned Gate Seeds homepage', caption: 'After · current published homepage' },
    ],
    decisions: [
      { title: 'Lead with experience and research', reason: 'Gate Seeds wanted its established work on varieties understood immediately.', result: 'The homepage gives its experience and research-led products a prominent introduction.' },
      { title: 'Make products easier to explore', reason: 'Visitors should see the range without first having to ask for it.', result: 'A structured catalogue and product pages organise wheat and paddy varieties.' },
      { title: 'Keep WhatsApp within reach', reason: 'The channel was already familiar to the business and its customers.', result: 'Calls to action lead from product information toward a direct enquiry.' },
      { title: 'Build for mobile and search', reason: 'The earlier site was difficult to use across devices and the client wanted clearer discovery.', result: 'Responsive pages, clearer content, on-page SEO and structured data support the new experience.' },
    ],
    showcaseTitle: 'From a first impression to a product enquiry.',
    showcaseIntro: 'The revised journey puts the company story, seed varieties and contact choices in an order visitors can use.',
    showcase: [
      { src: asset('gate-seeds', 'products'), alt: 'Gate Seeds product catalogue page', caption: 'The catalogue makes wheat and paddy varieties easier to browse.' },
      { src: asset('gate-seeds', 'paddy-product'), alt: 'Gate Seeds paddy seed product pack', caption: 'Product imagery gives the catalogue a concrete reference.' },
      { src: asset('gate-seeds', 'contact-mobile'), alt: 'Gate Seeds contact page on mobile', caption: 'The enquiry path remains available on a mobile screen.', shape: 'portrait' },
    ],
    outcomesTitle: 'A more useful foundation.',
    outcomes: [
      { title: 'Clearer positioning', detail: 'Experience, research and product value now form one coherent introduction.' },
      { title: 'Better product discovery', detail: 'Visitors can browse an organised catalogue and open individual products.' },
      { title: 'Direct enquiry route', detail: 'Prominent calls to action connect browsing to a WhatsApp conversation.' },
    ],
    proof: { src: asset('gate-seeds', 'after-home'), alt: 'Published Gate Seeds website homepage after redesign', caption: 'Published website capture · visible delivery evidence' },
    proofNote: 'Dated analytics and enquiry evidence were not supplied. The case study documents the delivered website and does not claim increased traffic, orders, sales or leads.',
    takeaway: 'For seed buyers, the varieties and their practical value need to be visible before the first call.',
  },
};
