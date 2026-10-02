import { marketplacePackages, marketplaceScopeNotes } from './marketplace';
import { serviceHighIntentFaqs } from './serviceHighIntentFaqs';

export type ServiceTier = {
  name: string;
  price: string;
  timeline: string;
  deliverables: string[];
  addOns?: string[];
  notIncluded: string[];
};

export type Service = {
  slug: string;
  name: string;
  category: string;
  headline: string;
  idealClient: string;
  problemSolved: string;
  tiers: ServiceTier[];
  mainDeliverables: string[];
  notIncluded: string[];
  goodFitWhen: string[];
  workflow: { title: string; detail: string }[];
  faqs: { question: string; answer: string }[];
  relatedProjectSlug: string;
  productProof?: {
    name: string;
    eyebrow: string;
    description: string;
    href: string;
    linkLabel: string;
    logoSrc: string;
    image: { src: string; alt: string; width: number; height: number };
    signals: string[];
  };
};

const tier = (
  name: string,
  price: string,
  timeline: string,
  deliverables: string[],
  addOns: string[] = [],
  notIncluded: string[] = [],
): ServiceTier => ({ name, price, timeline, deliverables, addOns, notIncluded });

export const coreServiceSlugs = [
  "web-design-development",
  "brand-identity",
  "ecommerce-store-development",
  "marketplace-catalogue-building",
  "ecommerce-seo",
  "social-media-management"
] as const;

export const services: Service[] = [
  {
    "slug": "web-design-development",
    "name": "Web Design & Development",
    "category": "Websites & Commerce",
    "headline": "Websites that explain your value, showcase your work and make enquiries straightforward.",
    "idealClient": "Founders launching a service, established businesses replacing a dated website, and professionals who need a credible online presence.",
    "problemSolved": "An absent or outdated website, weak search visibility, or enquiry paths that fail to qualify the right visitors.",
    "tiers": [
      {
        "name": "Starter — Single Page",
        "price": "₹12,000 / $299",
        "timeline": "3–4 days",
        "deliverables": [
          "Single page responsive website",
          "Basic on-page SEO",
          "WhatsApp chat button integration",
          "Mobile optimised"
        ],
        "addOns": [
          "GEO & AEO optimisation — ₹4,000 / $79",
          "JSON-LD schema markup — ₹2,500 / $49",
          "Google Search Console setup — ₹1,000 / $19",
          "Analytics tools setup — ₹1,500 / $29",
          "Monthly maintenance / support — ₹1,500/month / $29/month",
          "Annual maintenance / support — ₹12,000/year / $249/year"
        ],
        "notIncluded": []
      },
      {
        "name": "Business — Multi Page",
        "price": "₹25,000 / $599",
        "timeline": "6–8 days",
        "deliverables": [
          "5-page responsive website",
          "Full on-page SEO (all pages)",
          "WhatsApp integration",
          "Contact form + basic lead capture through mail",
          "Google Search Console setup"
        ],
        "addOns": [
          "GEO & AEO optimisation — ₹4,000 / $79",
          "JSON-LD schema markup — ₹2,500 / $49",
          "Analytics tools setup — ₹1,500 / $29",
          "Monthly maintenance / support — ₹1,500/month / $29/month",
          "Annual maintenance / support — ₹12,000/year / $249/year"
        ],
        "notIncluded": []
      },
      {
        "name": "Growth — Full Build",
        "price": "₹45,000 / $999",
        "timeline": "10–12 days",
        "deliverables": [
          "8–10 page responsive website",
          "Agreed launch SEO + JSON-LD schema markup",
          "GEO + AEO implemented",
          "Google Search Console included",
          "WhatsApp + Mail Inquiry System",
          "Blog section setup"
        ],
        "addOns": [
          "Analytics tools setup — ₹1,500 / $29",
          "Monthly maintenance / support — ₹1,500/month / $29/month",
          "Annual maintenance / support — ₹12,000/year / $249/year"
        ],
        "notIncluded": []
      }
    ],
    "mainDeliverables": [
      "Business discovery and page structure",
      "Responsive website design and development",
      "Launch SEO: titles, descriptions, headings, indexing checks and applicable structured data within scope",
      "Agreed contact, WhatsApp or booking paths and functional checks",
      "Handover guidance; ongoing maintenance quoted separately"
    ],
    "notIncluded": [
      "Domain, hosting and third-party subscriptions are separate.",
      "Ongoing monthly SEO and optional maintenance are separate unless named in the proposal.",
      "Content production and features beyond the chosen tier are separately scoped."
    ],
    "goodFitWhen": [
      "No website yet, or one built years ago that no longer represents the business",
      "Existing site is slow, hard to update, or invisible on Google",
      "Enquiries arrive by phone or WhatsApp with no way to qualify them first"
    ],
    "workflow": [
      {
        "title": "Discovery",
        "detail": "A short brief call to understand the business, the audience, and what the site needs to achieve."
      },
      {
        "title": "Structure",
        "detail": "Sitemap and page-by-page content plan, so every page has a clear job before any design starts."
      },
      {
        "title": "Design & build",
        "detail": "Pages are designed and built together — no static mockup handed off and rebuilt later."
      },
      {
        "title": "Review",
        "detail": "A working link is shared for feedback before anything goes live."
      },
      {
        "title": "Launch",
        "detail": "Domain connection, Search Console configuration, and a final pass on speed and mobile rendering."
      }
    ],
    "faqs": [
      {
        "question": "How much does a business website cost at Kraftt Digital?",
        "answer": "Kraftt Digital websites start at ₹12,000 for a single page, ₹25,000 for a five-page business website, and ₹45,000 for an eight-to-ten-page website. International starting prices are $299, $599 and $999 respectively. Final pricing depends on the agreed pages, features, content and integrations. 3D websites require a custom quotation."
      },
      {
        "question": "Which website package is right for my business?",
        "answer": "A single-page website suits one focused offer or an early-stage introduction. A five-page website suits businesses needing separate pages for their company, services, work and contact details. The Growth package suits a broader website with eight to ten pages and a blog section. Kraftt helps you choose based on your actual requirements during discovery."
      },
      {
        "question": "How long will it take to build my website?",
        "answer": "Kraftt's current estimates are 3–4 days for Starter, 6–8 days for Business, and 10–12 days for Growth. The agreed schedule depends on receiving the required content, access and approvals. Additional features, delayed feedback or changes to the approved scope can affect delivery."
      },
      {
        "question": "Are domain, hosting and other subscriptions included?",
        "answer": "Domain, hosting and third-party subscriptions are separate from Kraftt's website development fee. The client pays applicable provider charges. Your quotation should identify the services needed, who owns each account and any recurring costs before the project begins."
      },
      {
        "question": "Does the website package include SEO and Google Search Console?",
        "answer": "Starter includes basic on-page SEO, with Google Search Console available as an add-on. Business includes on-page SEO across its five pages and Search Console setup. Growth includes agreed launch SEO, relevant JSON-LD markup, GEO/AEO work and Search Console. Ongoing monthly SEO and analytics setup are separate unless explicitly included."
      },
      {
        "question": "Can customers send enquiries through WhatsApp and email?",
        "answer": "Yes. All three website packages include WhatsApp integration. Business adds a contact form with email lead capture, while Growth includes WhatsApp and email enquiry paths. The receiving number, email address and form fields are agreed during setup. CRM, automated messaging and other advanced integrations require a defined additional scope."
      },
      {
        "question": "What does website maintenance cost after launch?",
        "answer": "Optional website maintenance costs ₹1,500 per month or ₹12,000 per year for India, and $29 per month or $249 per year internationally. The proposal defines the support and routine update allowance. New features, additional pages and larger integrations are quoted separately. Domain, hosting and third-party renewal charges remain separate."
      },
      {
        "question": "Will a new website guarantee enquiries or a first-page Google ranking?",
        "answer": "No. Kraftt builds the website to explain your business, support search visibility and make enquiries easier. Rankings and enquiries also depend on competition, demand, your offer, content and ongoing activity. We agree measurable implementation work rather than promise a particular ranking or number of leads."
      }
    ],
    "relatedProjectSlug": "mittal-architect"
  },
  {
    "slug": "brand-identity",
    "name": "Brand Identity & System",
    "category": "Brand & Content",
    "headline": "Clarify what your business stands for and give it a consistent identity.",
    "idealClient": "New businesses building an identity, established businesses rebranding, and teams that need consistent brand guidance.",
    "problemSolved": "An absent or mismatched logo, inconsistent visual and verbal identity, or no practical brand reference for the team.",
    "tiers": [
      {
        "name": "Brand Starter",
        "price": "₹12,000 / $299",
        "timeline": "7–8 days",
        "deliverables": [
          "Competitor Research",
          "Positioning and Target Audience",
          "Logo suite (primary, secondary, icon)",
          "Primary colour palette",
          "Typography",
          "Brand voice and tone guide"
        ],
        "addOns": [
          "Brand guidelines document — ₹4,000 / $99",
          "Social media profile kit — ₹3,000 / $79",
          "Packaging design concept — ₹3,000 / $79"
        ],
        "notIncluded": []
      },
      {
        "name": "Brand Identity",
        "price": "₹30,000 / $699",
        "timeline": "8–12 days",
        "deliverables": [
          "Competitor Research",
          "Positioning and Target Audience",
          "Logo suite (primary, secondary, icon)",
          "Full colour palette(Primary + Secondary) + usage rules",
          "Typography system",
          "Brand voice & tone guide",
          "Packaging design concept",
          "Business card + letterhead design",
          "Brand guidelines PDF"
        ],
        "addOns": [
          "3 custom brand illustrations — ₹6,500 / $149",
          "Social media profile kit — ₹3,000 / $79"
        ],
        "notIncluded": []
      },
      {
        "name": "Full Brand System",
        "price": "₹55,000 / $1,299",
        "timeline": "15–20 days",
        "deliverables": [
          "Competitor Research",
          "Positioning and Target Audience",
          "Logo suite (primary, secondary, icon) + usage rules",
          "Full colour palette(Primary + Secondary) + usage rules",
          "Typography system + usage rules",
          "Brand voice & tone guide",
          "Brand illustrations (up to 5)",
          "Business card + letterhead design",
          "Social media profile kit",
          "Packaging design concept",
          "Pitch deck template (For ppt's/Pdf's)",
          "Brand guidelines (PDF File)"
        ],
        "addOns": [],
        "notIncluded": []
      }
    ],
    "mainDeliverables": [
      "Business and audience discovery",
      "Positioning and core messaging at the agreed depth",
      "Logo, colour and typography system where required",
      "Brand voice, application guidance and handover"
    ],
    "notIncluded": [
      "Printing, manufacturing and legal trademark work are separate.",
      "Website, store and ongoing social management are not included unless bundled.",
      "Revisions and final files are confirmed in the proposal."
    ],
    "goodFitWhen": [
      "No logo yet, or one that no longer matches the business",
      "Inconsistent colours and fonts across the website, social and packaging",
      "No reference document for how the brand should look and sound"
    ],
    "workflow": [
      {
        "title": "Discovery",
        "detail": "Positioning, audience and competitors reviewed before any visual direction is explored."
      },
      {
        "title": "Concept",
        "detail": "Logo concepts developed and presented for review."
      },
      {
        "title": "Refine",
        "detail": "Selected direction refined through the included revision rounds."
      },
      {
        "title": "System & guidelines",
        "detail": "Colour, typography and usage rules documented into a guidelines file."
      }
    ],
    "faqs": [
      {
        "question": "How much do Kraftt Digital's branding packages cost?",
        "answer": "Brand Starter starts at ₹12,000/$299, Brand Identity at ₹30,000/$699, and Full Brand System at ₹55,000/$1,299. All three include competitor research, positioning and target-audience work. The packages differ in the depth of the identity system, applications and documentation. Your proposal confirms the final deliverables and price."
      },
      {
        "question": "What is the difference between logo design and branding?",
        "answer": "A logo is one visual identifier. Branding also defines who the business serves, what it stands for, how it communicates and how its identity appears across different materials. Kraftt's branding packages connect positioning, a logo suite, colours, typography and voice so the business can present itself consistently."
      },
      {
        "question": "Do I need a new logo if my existing logo is already good?",
        "answer": "Not necessarily. Kraftt first reviews what is working and what needs improvement. Your business may need clearer positioning, messaging or usage guidance while keeping its existing logo. In that situation, we can scope the required work instead of automatically recommending a full visual redesign."
      },
      {
        "question": "What is included in the Brand Starter package?",
        "answer": "Brand Starter includes competitor research, positioning and target-audience work, primary/secondary/icon logo variations, a primary colour palette, typography, and a brand voice and tone guide. A separate brand guidelines document, social profile kit and packaging concept are available as add-ons. The proposal defines the depth of research and revisions."
      },
      {
        "question": "What is the difference between Brand Identity and Full Brand System?",
        "answer": "Brand Identity adds a broader colour system, packaging concept, business card and letterhead designs, and a guidelines PDF. Full Brand System extends the scope with more usage rules, up to five illustrations, a social profile kit and a presentation template. Voice and tone remain included in the Full Brand System."
      },
      {
        "question": "How long does a branding project take?",
        "answer": "The current estimates are 7–8 days for Brand Starter, 8–12 days for Brand Identity, and 15–20 days for Full Brand System. Research depth, applications, feedback and approvals affect the schedule. Kraftt confirms the delivery plan and revision allowance in the proposal before work begins."
      },
      {
        "question": "Are printing and finished product packaging included?",
        "answer": "The listed branding packages cover design work. A packaging concept is not the same as a production-ready packaging system or manufactured packaging. Printing, production, supplier coordination and final artwork preparation beyond the agreed design scope must be discussed separately. Kraftt's proposal identifies exactly which files and applications are included."
      },
      {
        "question": "What are brand guidelines, and why does my business need them?",
        "answer": "Brand guidelines explain how to apply your identity consistently across your website, social profiles, proposals, packaging and other materials. They help your staff and vendors use the right logo variations, colours, typography and voice. A guidelines PDF is included in Brand Identity and Full Brand System, and is an add-on for Brand Starter."
      }
    ],
    "relatedProjectSlug": "elixir-beverages"
  },
  {
    "slug": "ecommerce-store-development",
    "name": "E-commerce Store Development",
    "category": "Websites & Commerce",
    "headline": "Shopify, Wix and WooCommerce stores with clear products and a usable buying journey.",
    "idealClient": "Product businesses launching or improving a store, moving platforms, or needing catalogue setup and platform guidance.",
    "problemSolved": "A missing or unfinished store, unconfigured theme, incomplete product data, or missing launch search foundations.",
    "tiers": [
      {
        "name": "Launch Store",
        "price": "₹22,000 / $499",
        "timeline": "7–8 days",
        "deliverables": [
          "Domain connection",
          "Brand theme setup & customisation",
          "Home, Collections, About and  Product pages",
          "Checkout page Flow configuration",
          "Up to 30 products uploaded",
          "Basic Google SEO for store"
        ],
        "addOns": [
          "Product mockup images — quantity scoped — ₹4,000 / $79",
          "Extra product upload — per product — ₹150 / $2",
          "Monthly maintenance / support — ₹1,500/month / $29/month",
          "Annual maintenance / support — ₹12,000/year / $249/year"
        ],
        "notIncluded": []
      },
      {
        "name": "Growth Store",
        "price": "₹40,000 / $899",
        "timeline": "8–12 days",
        "deliverables": [
          "Full Brand theme setup + custom sections",
          "All collections & product pages",
          "Up to 50 products uploaded",
          "Product descriptions drafted with AI assistance and reviewed for accuracy",
          "Google SEO + Search Console",
          "WhatsApp chat widget",
          "Email capture + basic automation"
        ],
        "addOns": [
          "Product mockup images — quantity scoped — ₹4,000 / $79",
          "Extra product upload — per product — ₹150",
          "Blog content setup — ₹6,500 / $149",
          "Monthly maintenance / support — ₹1,500/month / $29/month",
          "Annual maintenance / support — ₹12,000/year / $249/year"
        ],
        "notIncluded": []
      },
      {
        "name": "Complete Store",
        "price": "₹70,000 / $1,499",
        "timeline": "18–21 days",
        "deliverables": [
          "Full Shopify build",
          "Landing pages designed around a clear purchase action",
          "Up to 100 products uploaded",
          "AI product descriptions + SEO",
          "Google e-commerce launch SEO within the agreed store scope",
          "Search Console + Analytics",
          "Product concept visuals & mockups within scope",
          "Email automations",
          "GEO + AEO optimisation",
          "SEO Blog content setup"
        ],
        "addOns": [
          "Weekly SEO blog content — monthly fee — ₹6,500/month / $149/month",
          "Ongoing store SEO — foundations already set up — ₹8,000/month / $199/month",
          "Monthly maintenance / support — ₹1,500/month / $29/month",
          "Annual maintenance / support — ₹12,000/year / $249/year"
        ],
        "notIncluded": []
      }
    ],
    "mainDeliverables": [
      "Platform recommendation and store setup",
      "Navigation, collections, product pages and purchase-path configuration",
      "Agreed product listings, descriptions and image preparation",
      "Launch SEO and testing within scope",
      "Owner training and separately scoped ongoing platform management"
    ],
    "notIncluded": [
      "Platform subscriptions, paid apps and transaction charges are separate.",
      "The client manages inventory, orders, shipping, returns and customer support.",
      "Ongoing catalogue management and monthly SEO are separate unless named in the proposal."
    ],
    "goodFitWhen": [
      "No store yet, or a partially-built Shopify account that never launched",
      "Existing store has an unconfigured theme, missing product data, or no SEO setup",
      "Product descriptions and images need to be created before launch"
    ],
    "workflow": [
      {
        "title": "Discovery & platform choice",
        "detail": "Understand products, buyers, budget, existing assets and operational responsibilities."
      },
      {
        "title": "Theme & structure",
        "detail": "Theme selected and customised; collections and navigation mapped to how customers actually shop."
      },
      {
        "title": "Product loading",
        "detail": "Products uploaded with descriptions, pricing and images, following the package scope."
      },
      {
        "title": "Checkout & integrations",
        "detail": "Checkout, payment and (where included) email automation configured and tested."
      },
      {
        "title": "Launch & training",
        "detail": "Test the agreed customer journey, connect the domain and explain how to manage the store."
      }
    ],
    "faqs": [
      {
        "question": "How much does an e-commerce website cost at Kraftt Digital?",
        "answer": "Launch Store starts at ₹22,000/$499, Growth Store at ₹40,000/$899, and Complete Store at ₹70,000/$1,499. Catalogue allowances are up to 30, 50 and 100 products respectively. Platform subscriptions, paid themes, apps and provider charges are separate. Complex functionality and catalogue requirements can change the final quotation."
      },
      {
        "question": "Do you build stores on Shopify, Wix and WooCommerce?",
        "answer": "Yes. Kraftt works with Shopify, Wix and WooCommerce and helps you assess the platform against your catalogue, budget and operating requirements. The listed Complete Store package specifically describes a Shopify build. Scope and pricing for another platform are confirmed in the quotation rather than assumed to be identical."
      },
      {
        "question": "How many products will you upload, and can I add more?",
        "answer": "Launch Store includes up to 30 products, Growth Store up to 50, and Complete Store up to 100. Additional uploads can be scoped separately; the listed extra-product rate is ₹150, with $2 specified for Launch Store. Variants, image preparation and description writing must be defined alongside the upload count in your proposal."
      },
      {
        "question": "Do you write product descriptions and create product images?",
        "answer": "Growth Store includes AI-assisted product descriptions reviewed for accuracy. Complete Store includes descriptions and agreed product mockup work. Product mockups are also available as add-ons. You provide accurate specifications, pricing and reference assets; Kraftt confirms image quantities and description scope before starting. Mockups are digitally created visuals, not a physical photography shoot."
      },
      {
        "question": "How long does it take to launch an online store?",
        "answer": "Current estimates are 7–8 days for Launch Store, 8–12 days for Growth Store, and 18–21 days for Complete Store. Delivery depends on complete product information, access, client approvals and required third-party setup. Payment-provider reviews or missing catalogue details may affect the launch date."
      },
      {
        "question": "Will Kraftt handle orders, stock, shipping and returns?",
        "answer": "No. The client handles inventory, orders, shipping, returns and customer support. Kraftt handles the store build, catalogue work, training and any agreed platform support. Configuring checkout or shipping settings does not mean Kraftt takes responsibility for day-to-day fulfilment or customer service."
      },
      {
        "question": "Can you teach me how to manage my store?",
        "answer": "Yes. Platform guidance and training can be included in the agreed store scope so you understand how to manage your catalogue and use the platform. Your proposal should specify the training format, sessions and topics. Ongoing support is available at ₹1,500/month or ₹12,000/year, and $29/month or $249/year internationally, within an agreed allowance."
      },
      {
        "question": "Is ongoing SEO included with the store build?",
        "answer": "The store build includes the launch SEO specified in the selected package. Ongoing SEO is separate. The ₹8,000/$199 monthly store SEO add-on is intended for stores where foundational SEO is already set up; its work allowance is confirmed in the proposal. Weekly SEO blog content is listed separately at ₹6,500/$149 per month."
      }
    ],
    "relatedProjectSlug": "kiraq-jewellery"
  },
  {
    "slug": "ecommerce-seo",
    "name": "SEO Services",
    "category": "Search & Social",
    "headline": "Ongoing search work for business websites and online stores, with clear priorities and monthly reporting.",
    "idealClient": "Service businesses and online stores that need ongoing page, content, local or technical search improvements.",
    "problemSolved": "Useful pages are hard to discover, search data is not guiding improvements, or launch SEO has not been followed by regular work.",
    "tiers": [
      {
        "name": "SEO Starter",
        "price": "₹12,000/month / $299/month",
        "timeline": "Ongoing monthly",
        "deliverables": [
          "Google Search Console setup + monitoring",
          "On-page SEO (10 pages/month)",
          "Local SEO",
          "Keyword tracking report",
          "1 researched and human-reviewed SEO article/month"
        ],
        "addOns": [
          "GEO & AEO layer — ₹3,500/month / $79/month"
        ],
        "notIncluded": []
      },
      {
        "name": "SEO Growth",
        "price": "₹22,000/month / $549/month",
        "timeline": "Ongoing monthly",
        "deliverables": [
          "Full Search Console management",
          "On-page SEO across the agreed monthly page scope",
          "GEO + AEO optimisation included",
          "4 SEO blog posts/month",
          "Relevant outreach: activity target agreed; placements not guaranteed",
          "Monthly performance report"
        ],
        "addOns": [
          "Product description rewrites — ₹8,200/month / $199/month"
        ],
        "notIncluded": []
      },
      {
        "name": "SEO Comprehensive",
        "price": "₹40,000/month / $999/month",
        "timeline": "Ongoing monthly",
        "deliverables": [
          "Complete SEO management",
          "GEO + AEO fully managed",
          "8 blog posts/month",
          "Technical SEO audit + fixes",
          "Competitor analysis monthly",
          "Relevant outreach: activity target agreed; placements not guaranteed",
          "Ranking + traffic growth focus",
          "Product description rewrites"
        ],
        "addOns": [],
        "notIncluded": []
      }
    ],
    "mainDeliverables": [
      "Search Console setup and monitoring",
      "Prioritised on-page SEO",
      "Research and content at the selected tier",
      "Technical and outreach work where included"
    ],
    "notIncluded": [
      "A store build includes launch SEO only; monthly optimisation is a separate service.",
      "Outreach placements, rankings, traffic and sales are not guaranteed.",
      "Paid apps, major development and third-party charges are separate."
    ],
    "goodFitWhen": [
      "The site is live but relevant pages rarely appear in Google search results",
      "No one is tracking rankings, traffic or what is actually working",
      "Service, product or collection pages need clearer structure and content"
    ],
    "workflow": [
      {
        "title": "Audit",
        "detail": "Search Console connected and current rankings, indexing and technical issues reviewed."
      },
      {
        "title": "Plan",
        "detail": "A prioritised monthly plan covering on-page fixes, content and (on higher tiers) outreach."
      },
      {
        "title": "Execute",
        "detail": "On-page changes shipped, blog content published, and links built according to the tier scope."
      },
      {
        "title": "Report",
        "detail": "A monthly report covering rankings, traffic direction and what is planned next."
      }
    ],
    "faqs": [
      {
        "question": "How much do Kraftt Digital's SEO services cost per month?",
        "answer": "SEO Starter costs ₹12,000/$299 per month, SEO Growth ₹22,000/$549, and SEO Comprehensive ₹40,000/$999. Packages vary in page work, content, technical support and research. The separate ₹8,000/$199 store SEO add-on is intended for stores with foundational SEO already in place and has its own agreed scope."
      },
      {
        "question": "What is the difference between website SEO setup and ongoing SEO?",
        "answer": "Website SEO setup covers the agreed search foundations during a build, such as page titles, descriptions, headings and relevant technical setup. Ongoing SEO reviews performance, improves prioritised pages, addresses issues and develops content over time. Paying for a website with launch SEO does not automatically include a monthly SEO service."
      },
      {
        "question": "Can you improve my business's visibility in city-based searches?",
        "answer": "Yes. Kraftt offers location-focused SEO, included in SEO Starter, for businesses where city or service-area searches are relevant. The work can cover accurate business information, relevant website content and an agreed Google Business Profile scope. Eligibility, competition and search location influence visibility; a particular Maps position cannot be guaranteed."
      },
      {
        "question": "How long does SEO take to produce results?",
        "answer": "SEO has no fixed result date. Progress depends on the site's starting condition, competition, content, technical issues and the work completed. Some implementation changes can be made quickly, while meaningful search growth may take longer. Kraftt agrees priorities and reviews performance without promising a ranking or lead count by a particular deadline."
      },
      {
        "question": "Do you guarantee first-page rankings or a fixed number of leads?",
        "answer": "No. Google rankings, traffic and leads depend on factors beyond an agency's control. Kraftt commits to the agreed research, implementation, content and review work. We use relevant performance information to assess progress and adjust priorities rather than guarantee a first-page position or a fixed number of enquiries."
      },
      {
        "question": "What are AEO and GEO, and will they make AI recommend my business?",
        "answer": "AEO and GEO refer to work intended to help answer engines and generative search systems understand useful information about your business. This can involve clear answers, reliable content and appropriate technical SEO. It does not guarantee an AI recommendation or citation. Google states that no special schema markup is required for its generative AI search features."
      },
      {
        "question": "How much SEO content is included each month?",
        "answer": "SEO Starter includes one researched, human-reviewed article per month, Growth includes four, and Comprehensive includes eight. Topics should support the business and the search needs of its customers. Article scope, approvals and publishing responsibilities are agreed in advance. Store packages also list a separate weekly-content add-on at ₹6,500/$149 per month."
      },
      {
        "question": "What does backlink outreach include?",
        "answer": "Where included, outreach involves identifying relevant opportunities and contacting suitable publishers or organisations. Activity targets are agreed in the scope. A third party decides whether to publish or link, so a fixed number of placements is not guaranteed. Outreach should support relevant discovery and credibility rather than promise rankings from a link quota."
      }
    ],
    "relatedProjectSlug": "mittal-architect"
  },
  {
    "slug": "social-media-management",
    "name": "Social Media Strategy & Management",
    "category": "Search & Social",
    "headline": "Planned content that communicates your work, expertise and offers consistently.",
    "idealClient": "Brands needing consistent monthly content, teams working across platforms, and businesses that want useful reporting alongside publishing.",
    "problemSolved": "Quiet or inconsistent profiles, no shared content calendar, and outdated profile details that make the business harder to understand.",
    "tiers": [
      {
        "name": "Social Starter",
        "price": "₹12,000/month / $299/month",
        "timeline": "Ongoing monthly",
        "deliverables": [
          "Social media strategy",
          "Social Media Branding (If applicable)",
          "Social Media Content Guide by Kraftt Digital",
          "Competitor Research",
          "Profile setup",
          "15 posts/month — shared content set published to 1 platform",
          "10 stories/month — distribution agreed in the calendar",
          "SEO captions + hashtags",
          "1 platform",
          "Engagement and comment replies",
          "Monthly performance report"
        ],
        "addOns": [
          "Additional platform — ₹4,000/month / $99/month",
          "AI-generated reel/short — per reel — ₹1,000 / $19"
        ],
        "notIncluded": []
      },
      {
        "name": "Social Growth",
        "price": "₹22,000/month / $599/month",
        "timeline": "Ongoing monthly",
        "deliverables": [
          "Social media strategy",
          "Social Media Branding (If applicable)",
          "Social media content guidance (personal brand)",
          "Competitor Research",
          "21 posts/month — shared content set published to 2 platforms",
          "15 stories/month — distribution agreed in the calendar",
          "2 platforms managed",
          "Monthly content calendar",
          "SEO Captions + hashtags",
          "Profile integration",
          "Engagement and comment replies",
          "Monthly performance report"
        ],
        "addOns": [],
        "notIncluded": []
      },
      {
        "name": "Social Presence Management",
        "price": "₹40,000/month / $999/month",
        "timeline": "Ongoing monthly",
        "deliverables": [
          "Social media strategy",
          "Social Media Branding (If applicable)",
          "Social media content guidance (personal brand)",
          "Competitor Research",
          "30 posts/month — shared content set published to 3 platforms",
          "20 stories/month — distribution agreed in the calendar",
          "3 platforms managed",
          "5 AI-generated Reels",
          "SEO Captions + hashtags",
          "Profile integration",
          "Engagement and comment replies",
          "Monthly performance report"
        ],
        "addOns": [],
        "notIncluded": []
      }
    ],
    "mainDeliverables": [
      "Social strategy, competitor research and content guidance",
      "One monthly post set published across the selected platforms",
      "Captions, hashtags, profile work, engagement and comment replies",
      "Monthly performance report",
      "AI reels where included or purchased as an add-on"
    ],
    "notIncluded": [
      "Direct-message handling is separately scoped.",
      "Conventional video shooting and reel or video editing are excluded.",
      "Paid advertising campaign management and media spend are excluded."
    ],
    "goodFitWhen": [
      "Social profiles are inconsistent or have gone quiet",
      "No time internally to plan and write a content calendar every month",
      "Profile bios, links and highlights are outdated or unoptimised"
    ],
    "workflow": [
      {
        "title": "Audit",
        "detail": "Existing profiles, audience and past performance reviewed."
      },
      {
        "title": "Calendar",
        "detail": "A monthly content calendar planned around your offers and key dates."
      },
      {
        "title": "Create & schedule",
        "detail": "Posts, stories and captions produced and scheduled for the month."
      },
      {
        "title": "Manage & report",
        "detail": "Publish approved content, engage and reply to comments within the agreed scope, and provide a monthly performance report."
      }
    ],
    "faqs": [
      {
        "question": "How much does Kraftt charge for social media management?",
        "answer": "Social Starter costs ₹12,000/$299 per month for one platform, Social Growth ₹22,000/$599 for two, and Social Presence Management ₹40,000/$999 for three. Packages include the listed strategy, content work, publishing, engagement, comment replies and monthly reporting. Paid advertising campaign management is excluded."
      },
      {
        "question": "Does a three-platform package include 90 different posts?",
        "answer": "No. Social Presence Management includes one set of 30 posts each month, published across all three selected platforms. Social Growth similarly uses one set of 21 posts across two platforms, while Starter includes 15 posts on one platform. Story distribution and necessary format adaptations are agreed in the calendar."
      },
      {
        "question": "Which social media platforms can Kraftt manage?",
        "answer": "Kraftt can scope work for Instagram, LinkedIn, YouTube, Facebook, Threads and Pinterest. We help select platforms based on the audience, content requirements and your business goals. Deliverables must fit each platform; a package built around static posts is not automatically a full YouTube video-production service."
      },
      {
        "question": "Do you provide social media strategy or only create posts?",
        "answer": "Strategy and competitor research are included in all three packages. Kraftt also provides the listed content guidance and relevant social branding work. The purpose is to help your business communicate its work, expertise and offers consistently. The selected package determines the platform count and production allowance."
      },
      {
        "question": "Do you shoot or edit conventional reels and videos?",
        "answer": "Conventional video shooting and reel/video editing are not included in the listed social packages. AI-generated reels are a separate specified deliverable: Social Starter lists an add-on at ₹1,000/$19 per reel, and Social Presence Management includes five AI-generated reels. Their duration, style, revisions and platform allocation are agreed before production."
      },
      {
        "question": "Do you run Meta ads, Google ads or paid social campaigns?",
        "answer": "No. Kraftt does not manage paid advertising campaigns. Ad creatives and landing pages can be commissioned separately to support campaigns run by you or your appointed advertiser. Campaign setup, targeting, media buying, bidding and advertising optimisation are outside Kraftt's service scope."
      },
      {
        "question": "Will social media management guarantee followers, viral posts or sales?",
        "answer": "No. Kraftt's social service focuses on planned communication and consistent presentation of your business. Reach, follower growth and sales also depend on audience interest, the offer, platform distribution and other factors. We do not sell followers or promise virality or a fixed number of sales."
      },
      {
        "question": "Are engagement, comment replies and monthly reports included?",
        "answer": "Yes. Kraftt manages engagement and comment replies and provides a monthly performance report. Response guidance, coverage and issues requiring client input are agreed during onboarding. Direct-message handling is separate and is not included unless specifically agreed."
      }
    ],
    "relatedProjectSlug": "shree-hari-spintex"
  },
  {
    slug: 'marketplace-catalogue-building',
    name: 'Marketplace Catalogue Building',
    category: 'Stores & Marketplaces',
    headline: 'Structured product catalogues for Amazon, Flipkart, Myntra and Meesho, with setup support and platform training.',
    idealClient: 'Indian product businesses preparing to sell through Amazon, Flipkart, Myntra or Meesho and teams that need an organised catalogue before launch.',
    problemSolved: 'Incomplete product information, inconsistent listings and unfamiliar marketplace setup steps that delay a confident launch.',
    tiers: marketplacePackages.map((pack) => tier(
      `${pack.name} Catalogue`,
      `₹${pack.price.toLocaleString('en-IN')} · India only`,
      pack.timeline,
      pack.includes,
      [],
      [marketplaceScopeNotes[2], marketplaceScopeNotes[3]],
    )),
    mainDeliverables: [
      'Account setup and verification assistance',
      'Product and niche research for the selected package',
      'Structured listings across the agreed marketplaces',
      'Pricing calculation support and platform working tutorial',
    ],
    notIncluded: [
      marketplaceScopeNotes[2],
      marketplaceScopeNotes[3],
      'Marketplace advertising, media spend and ongoing catalogue management unless separately agreed.',
    ],
    goodFitWhen: [
      'Product information is available but listings are incomplete or inconsistent',
      'The team needs help understanding Amazon, Flipkart, Myntra or Meesho setup',
      'Product allowances and marketplace allocation can be agreed in writing',
    ],
    workflow: [
      { title: 'Catalogue audit', detail: 'Products, variants, documents and marketplace readiness are reviewed.' },
      { title: 'Research & structure', detail: 'Categories, listing fields, pricing inputs and search wording are prepared.' },
      { title: 'Build & review', detail: 'The agreed product allowance is uploaded and shared for factual review.' },
      { title: 'Training & handover', detail: 'Your team receives a platform walkthrough and the agreed catalogue handover.' },
    ],
    faqs: [
      { question: 'Which marketplaces does Kraftt support?', answer: 'The published packages cover Amazon, Flipkart, Myntra and Meesho in India. The proposal confirms how the product allowance is allocated across platforms.' },
      { question: 'How many products are included?', answer: 'Starter includes up to 30 products, Intermediate up to 50 and Growth up to 100. Variant counting and allocation are confirmed before work begins.' },
      { question: 'Does Kraftt guarantee marketplace approval?', answer: 'No. Verification, listing approval and processing times are controlled by each marketplace. Kraftt provides the agreed setup and documentation assistance.' },
      { question: 'Will Kraftt manage orders and inventory?', answer: 'No. Your team remains responsible for stock, orders, fulfilment, returns and customer support unless a separate written scope says otherwise.' },
      { question: 'Is marketplace advertising included?', answer: 'No. Advertising campaign management and media spend are outside the published catalogue-building packages.' },
    ],
    relatedProjectSlug: 'kiraq-jewellery',
  },
  {
    slug: 'landing-pages',
    name: 'Landing Pages',
    category: 'Websites & Campaign Support',
    headline: 'Focused landing pages built around one offer, audience and next action.',
    idealClient: 'Businesses launching an offer, campaign, event or product that needs a focused page outside the main website journey.',
    problemSolved: 'Campaign traffic arriving on a general website page with too many choices, weak message continuity or no clear conversion path.',
    tiers: [
      tier('Custom landing-page scope', 'Custom quote', 'Agreed after discovery', ['Offer and audience review', 'Page structure and responsive design', 'Development on the agreed platform', 'Enquiry or conversion path setup', 'Launch checks and handover']),
    ],
    mainDeliverables: ['Landing-page structure', 'Responsive page design and build', 'Clear call-to-action journey', 'Agreed form, WhatsApp or checkout connection'],
    notIncluded: ['Advertising campaign management or media spend', 'Unlisted integrations or automation', 'Ongoing testing and optimisation unless separately agreed'],
    goodFitWhen: ['One offer needs a focused destination', 'Campaign visitors should not land on a general home page', 'The required action and traffic source are already understood'],
    workflow: [
      { title: 'Brief', detail: 'The offer, audience, traffic source and desired action are confirmed.' },
      { title: 'Structure', detail: 'The message order, proof and conversion path are mapped.' },
      { title: 'Design & build', detail: 'The responsive page is created on the agreed platform.' },
      { title: 'Review & launch', detail: 'Content, links and conversion paths are approved before launch.' },
    ],
    faqs: [
      { question: 'Which platforms can Kraftt use for a landing page?', answer: 'Landing pages can be scoped for Shopify, Wix, WooCommerce or a custom-coded website. The platform is agreed after reviewing the campaign and existing setup.' },
      { question: 'Does Kraftt run the advertising campaign?', answer: 'No. Kraftt can build the landing page and supporting creative, while campaign setup, targeting, bidding and media spend remain outside the service.' },
      { question: 'Can the page connect to WhatsApp or a form?', answer: 'Yes. The agreed enquiry route can include WhatsApp, a contact form, email capture or another supported connection.' },
    ],
    relatedProjectSlug: 'elixir-beverages',
  },
  {
    slug: 'app-development',
    name: 'App Development',
    category: 'Digital Systems',
    headline: 'Android and iOS applications planned around a defined user journey and useful feature set.',
    idealClient: 'Businesses with a validated app requirement, known users and a clear operational or customer-facing problem to solve.',
    problemSolved: 'An app idea without prioritised features, user flows, data requirements or a realistic delivery scope.',
    tiers: [
      tier('Custom application scope', 'Custom quote', 'Agreed after discovery', ['Requirements and feature mapping', 'User journeys and interface design', 'Application development for agreed platforms', 'Testing, release preparation and handover', 'Support terms defined in the proposal']),
    ],
    mainDeliverables: ['Prioritised application scope', 'User flows and interface system', 'Android, iOS or cross-platform build as agreed', 'Testing and release preparation'],
    notIncluded: ['App-store fees and third-party subscriptions', 'Unlisted features or integrations', 'Guaranteed approval by Apple, Google or another platform'],
    goodFitWhen: ['The user and problem are clearly defined', 'A first useful feature set can be prioritised', 'Required data, integrations and platform responsibilities can be confirmed'],
    workflow: [
      { title: 'Discovery', detail: 'Users, objectives, features and constraints are documented.' },
      { title: 'Product scope', detail: 'Flows, screens, architecture and release priorities are agreed.' },
      { title: 'Build & test', detail: 'Working increments are reviewed and tested against the approved scope.' },
      { title: 'Release & handover', detail: 'Release preparation, access and support terms are completed.' },
    ],
    faqs: [
      { question: 'Does Kraftt build Android and iOS apps?', answer: 'Yes. The proposal confirms whether the project uses native or cross-platform delivery and which devices and operating-system versions are supported.' },
      { question: 'Can the app connect to our current software?', answer: 'Potential integrations are scoped after reviewing the available APIs, documentation, access and data responsibilities.' },
      { question: 'Is app-store approval guaranteed?', answer: 'No. Kraftt prepares the agreed release materials and technical build, while final review and approval remain with Apple, Google or the relevant platform.' },
    ],
    relatedProjectSlug: 'employee-os',
  },
  {
    slug: 'content-copywriting',
    name: 'Content & Copywriting',
    category: 'Brand & Content',
    headline: 'Landing pages, product copy and email sequences written to explain the offer and earn the next action.',
    idealClient: 'Websites, stores and launches that need customer-facing copy, brands building a reusable content library, and teams without an in-house copywriter.',
    problemSolved: 'A launch with no copy, generic product descriptions, weak offer clarity, or no welcome and nurture sequence.',
    tiers: [
      tier('Custom content scope', 'Custom quote', 'Agreed after discovery', ['Landing or sales-page copy', 'Product descriptions', 'Email sequences as scoped', 'Review and handover of approved copy']),
    ],
    mainDeliverables: ['Landing or sales-page copy', 'Search- and conversion-aware product descriptions', 'Email sequence drafts', 'Ad creative copy when included in the agreed scope'],
    notIncluded: ['Website or store build unless paired with a build package', 'Paid media spend and campaign management', 'Claims or technical statements that the client cannot substantiate'],
    goodFitWhen: ['Visitors ask questions the site should already answer', 'Your offer is difficult to explain consistently', 'A launch needs one voice across web, email and product copy'],
    workflow: [
      { title: 'Brief', detail: 'Audience, offer and tone are agreed before writing starts.' },
      { title: 'Draft', detail: 'The first draft is produced and shared for review.' },
      { title: 'Edit', detail: 'Feedback is incorporated into a clear final version.' },
      { title: 'Handover', detail: 'Copy is delivered ready for the site, store or email tool.' },
    ],
    faqs: [
      { question: 'Can you write in our brand voice?', answer: 'Yes. Kraftt works from your existing guide or establishes a clear working tone during the brief.' },
      { question: 'Can you add the copy to our site?', answer: 'When paired with Web Design or Shopify, the copy can be built directly into the pages. Otherwise it is delivered in a ready-to-use document.' },
      { question: 'How many product descriptions are included?', answer: 'The quantity, product information needed and review rounds are confirmed in a written proposal.' },
    ],
    relatedProjectSlug: 'elixir-beverages',
  },
  {
    slug: 'dashboards-internal-tools',
    name: 'Custom Software & Internal Tools',
    category: 'Digital Systems',
    headline: 'Custom software, admin panels, reporting and automation built around the way your team actually works.',
    idealClient: 'Operations and e-commerce teams managing inventory or orders manually, and businesses ready to replace ad-hoc spreadsheets with one focused tool.',
    problemSolved: 'Disconnected spreadsheets, repetitive data entry, and no central view for inventory, orders, accounts or reporting.',
    tiers: [
      tier('Custom software scope', 'Custom quote', 'Agreed after discovery', ['Requirements and workflow mapping', 'User roles and data model', 'Prioritised modules and integrations', 'Testing, handover and support terms defined in the proposal']),
    ],
    mainDeliverables: ['Custom admin panel or internal tool', 'Login and role-based access control', 'Operational dashboards and reports', 'API integrations where included'],
    notIncluded: ['Ongoing hosting and provider charges', 'Third-party subscription or transaction fees', 'Unlisted integrations or modules outside the agreed architecture'],
    goodFitWhen: ['The same information is entered more than once', 'Status reporting is manual and unreliable', 'A focused tool can remove a known operating bottleneck'],
    workflow: [
      { title: 'Requirements', detail: 'We map the job, users, permissions and decisions the tool must support.' },
      { title: 'Architecture', detail: 'The data model, modules and roles are defined before screens are built.' },
      { title: 'Build', detail: 'Working increments are shared so the team can test the system as it develops.' },
      { title: 'Handover & support', detail: 'Access, operating notes and the included support scope are handed over.' },
    ],
    faqs: [
      { question: 'Can it integrate with our existing software?', answer: 'Potential integrations are scoped after reviewing the APIs, documentation, data access and operating requirements.' },
      { question: 'Who hosts the tool?', answer: 'Kraftt configures and recommends the hosting setup. Ongoing provider charges are paid separately by the client.' },
      { question: 'Is post-launch support included?', answer: 'The support period and ongoing options are written into the proposal.' },
    ],
    productProof: {
      name: 'Employee OS',
      eyebrow: 'Kraftt-built product proof',
      description: 'From operational dashboards to complete desktop systems, we design internal tools around the workflows teams actually use. Employee OS is our local-first Windows product for employee records, attendance, payroll, salary slips and reporting.',
      href: 'https://employeeos.krafttdigital.in',
      linkLabel: 'See Employee OS',
      logoSrc: '/assets/projects/employee-os/employee-os-wordmark.webp',
      image: {
        src: '/assets/projects/employee-os/employee-os-dashboard.webp',
        alt: 'Employee OS dashboard showing local employee, attendance and payroll summaries using dummy records',
        width: 1440,
        height: 900,
      },
      signals: ['Windows desktop', 'Offline-first', 'Payroll workflows', 'PDF & Excel reports'],
    },
    relatedProjectSlug: 'employee-os',
  },
  {
    slug: 'ai-powered-creative',
    name: 'AI-Powered Creative',
    category: 'Creative Production',
    headline: 'Ad creatives, product mockups and copy produced faster with AI, then directed and finished by people.',
    idealClient: 'D2C brands testing creative variations, founders visualising products before manufacturing, and teams that need more platform-ready assets quickly.',
    problemSolved: 'Creative demand outpacing production capacity, limited shoot budgets, or products that need visualisation before physical samples exist.',
    tiers: [
      tier('Custom creative scope', 'Custom quote', 'Agreed after discovery', ['Creative brief and brand references', 'Agreed image, copy or video asset counts', 'Human review and refinement', 'Final files in agreed formats']),
    ],
    mainDeliverables: ['Static and motion ad creative', 'Product mockups and shoot simulations', 'AI-assisted product and email copy', 'Social designs'],
    notIncluded: ['Paid advertising budget or media buying', 'A permanent replacement for real product photography', 'Unreviewed AI output — every delivered asset receives human curation'],
    goodFitWhen: ['A real campaign or launch brief already exists', 'The brand system is clear enough to guide production', 'Creative volume is constrained by production time or shoot access'],
    workflow: [
      { title: 'Brief', detail: 'The product, brand assets and target platforms are confirmed.' },
      { title: 'Generate', detail: 'AI tools create initial directions and copy variations.' },
      { title: 'Curate & finish', detail: 'The strongest outputs are selected, edited and brought on-brand.' },
      { title: 'Delivery', detail: 'Final files are supplied in the formats and sizes required by the chosen platforms.' },
    ],
    faqs: [
      { question: 'Is everything generated without human input?', answer: 'No. AI creates a first pass; Kraftt directs, reviews, curates and finishes every delivered output.' },
      { question: 'Can mockups replace a real product shoot?', answer: 'They are useful for testing and early launches, but are not positioned as a permanent substitute once the brand scales.' },
      { question: 'What formats are delivered?', answer: 'Files are prepared for the ad and social platforms named in the brief.' },
      { question: 'Is this fixed or monthly?', answer: 'We quote the agreed output and timeline. Ongoing production is scoped separately when needed.' },
    ],
    relatedProjectSlug: 'elixir-beverages',
  }
];

export const serviceBySlug = (slug: string) => {
  const service = services.find((item) => item.slug === slug);
  if (!service) return undefined;
  return { ...service, faqs: serviceHighIntentFaqs[slug] ?? service.faqs };
};
export const coreServices = services.filter((service) => (coreServiceSlugs as readonly string[]).includes(service.slug));
