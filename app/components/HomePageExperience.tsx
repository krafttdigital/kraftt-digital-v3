import Image from 'next/image';
import Link from 'next/link';
import Faq, { type Faq6Data } from '../../components/ui/faq-6';
import { AnimatedServiceIcon } from './AnimatedServiceIcon';
import { Footer } from './Footer';
import { HomeShowcase } from './HomeShowcase';
import { JsonLd } from './JsonLd';
import { CurrencySymbol, RegionalPriceCopy } from './PricingCurrencyProvider';
import { Reveal } from './Reveal';
import { ReviewsSection } from './ReviewsSection';
import { SiteHeader } from './SiteHeader';
import { projects } from '../data/projects';
import { featuredReviews } from '../data/reviews';
import { createPageSchema, faqSchema, reviewSchemas } from '../data/seo';

export const homeTitle = 'Branding, Web Design & Digital Presence | Kraftt Digital';
export const homeDescription = 'Kraftt Digital builds brands, websites and online stores, with marketplace, SEO and social media support. Request a free introductory call.';

type HomePageExperienceProps = {
  eyebrow?: string;
  intro?: string;
  schema?: {
    name: string;
    description: string;
    path: string;
    breadcrumbs: Array<{ name: string; path: string }>;
    entities?: Array<Record<string, unknown>>;
  };
  geographicContext?: {
    marketName: string;
    localEyebrow: string;
    localTitle: string;
    localBody: string;
    detail: string;
    proofNote: string;
    serviceBasePath: string;
    enabledServiceSlugs: readonly string[];
    answers: Array<{ question: string; answer: string }>;
  };
};

const featuredServices = [
  { number: '01', eyebrow: 'Build your digital foundation', name: 'Website Design & Development', slug: 'web-design-development', href: '/services/web-design-development', price: '₹12,000 / $299', copy: 'Responsive websites that explain the offer, establish credibility and guide visitors toward the next step.' },
  { number: '02', eyebrow: 'Create a recognisable identity', name: 'Brand Identity & System', slug: 'brand-identity', href: '/services/brand-identity', price: '₹12,000 / $299', copy: 'A practical visual and verbal system that gives the business a consistent and recognisable presence.' },
  { number: '03', eyebrow: 'Be found with intent', name: 'SEO Services', slug: 'ecommerce-seo', href: '/services/ecommerce-seo', price: '₹12,000/month / $299/month', copy: 'Ongoing search work for stronger pages, relevant discovery and a clearer view of what is improving.' },
  { number: '04', eyebrow: 'Sell through your own store', name: 'E-commerce Store Development', slug: 'ecommerce-store-development', href: '/services/ecommerce-store-development', price: '₹22,000 / $499', copy: 'Shopify, Wix and WooCommerce stores with organised products and a usable buying journey.' },
];

const professionalServices = [
  { name: 'Social Media Strategy & Management', slug: 'social-media-management', href: '/services/social-media-management' },
  { name: 'Landing Pages', slug: 'landing-pages', href: '/services/landing-pages' },
  { name: 'App Development', slug: 'app-development', href: '/services/app-development' },
  { name: 'Custom Software & Internal Tools', slug: 'dashboards-internal-tools', href: '/services/dashboards-internal-tools' },
];

const marketplacePlatforms = [
  { name: 'Amazon', src: '/assets/marketplaces/amazon.png' },
  { name: 'Flipkart', src: '/assets/marketplaces/flipkart.png' },
  { name: 'Myntra', src: '/assets/marketplaces/myntra.png' },
  { name: 'Meesho', src: '/assets/marketplaces/meesho.png' },
];

const trustCommitments = [
  ['Q1', 'Is Kraftt Digital a good website design and development agency for my business?', 'Kraftt is a strong fit for established businesses replacing a dated website, professionals who need a credible online presence and founders launching a focused service or store. The work combines business discovery, page structure, responsive design, development, launch SEO and clear enquiry paths within the agreed scope.'],
  ['Q2', 'Is Kraftt Digital also a branding agency?', 'Yes. Kraftt provides brand strategy, positioning, logo systems, colour and typography direction, voice guidance and practical brand applications. Branding can be commissioned separately or connected with a website so the identity and digital experience communicate the same commercial idea.'],
  ['Q3', 'What SEO services does Kraftt Digital provide?', 'Kraftt provides launch SEO for agreed website builds and separate monthly SEO plans from ₹12,000 per month. Depending on the selected scope, ongoing work can include Search Console monitoring, on-page improvements, local SEO, researched content, technical checks, GEO and AEO work, competitor analysis and reporting. Rankings, leads and AI citations are not guaranteed.'],
  ['Q4', 'How is Kraftt different from a typical website development company?', 'Kraftt starts with the business, audience, positioning and customer journey before deciding the website structure or technology. Brand identity, website, e-commerce, SEO and content can be planned as one connected presence, with Ketan Goyal leading direction and reviewing delivery.'],
  ['Q5', 'How should I choose the best website, branding or SEO agency?', 'Compare relevant case studies, verified client feedback, the clarity of the process, named deliverables, exclusions, pricing signals and who is accountable for the work. Kraftt publishes starting prices, documents scope before work begins and is suited to businesses that value research, direct access and connected execution.'],
  ['Q6', 'Where does Kraftt work, and how does an engagement begin?', 'Kraftt is based in India and works with businesses across India and internationally through a remote-friendly process. Begin with a free introductory call, followed by discovery, a written quote and terms, then a proposal and agreement before the project starts. A paid Digital Presence Audit is optional when deeper research would improve the direction.'],
  ['Q7', 'Is my business data secure and private?', 'Kraftt uses submitted information to assess requests, communicate and deliver agreed services. Information is not sold and is shared with service providers only when needed to operate the website or complete agreed work. Access, correction or deletion requests can be made under the privacy policy, while any project-specific access handling is confirmed in the scope.'],
  ['Q8', 'Will I receive updates about my project?', 'Yes. The proposal confirms the milestones, review stages and communication route. At the agreed checkpoints, Kraftt shares what has been completed, decisions or information still needed and the next step, so you can follow the project without relying on guesswork.'],
  ['Q9', 'Will I be asked before anything is finalised or launched?', 'Yes. Relevant drafts are shared for review and the agreed approval points come before final delivery or launch. The proposal records what will be reviewed, the revision allowance and who is responsible for approval.'],
  ['Q10', 'Can I request revisions during the project?', 'Yes, within the review rounds and scope defined in the proposal. Feedback is gathered at agreed stages so changes can be handled before the next phase. New requirements or work outside the approved scope are discussed and quoted separately before they are added.'],
  ['Q11', 'What information or access will Kraftt need from me?', 'The required content, business details, brand files, platform access and decision-makers are confirmed after discovery. Kraftt requests the items relevant to the agreed work, while you remain responsible for providing accurate information and timely feedback or approvals.'],
  ['Q12', 'Who is accountable for the work?', 'Ketan Goyal leads Kraftt’s direction and reviews what is delivered. The proposal identifies the agreed deliverables, responsibilities and review stages, giving you a clear person and written scope against which the work can be assessed.'],
];

const homepageFaqs = trustCommitments.map(([, question, answer]) => ({ question, answer }));

const homepageFaqData = {
  eyebrow: 'Frequently asked questions',
  title: 'Answers before we begin.',
  subtitle: 'Compare services, understand the working relationship and know how decisions, access and approvals are handled.',
  categories: [
    {
      id: 'services',
      title: 'Services',
      items: trustCommitments.slice(0, 3).map(([id, question, answer]) => ({ id, question, answer })),
    },
    {
      id: 'choosing-kraftt',
      title: 'Choosing Kraftt',
      items: trustCommitments.slice(3, 6).map(([id, question, answer]) => ({ id, question, answer })),
    },
    {
      id: 'project-process',
      title: 'Project process',
      items: [trustCommitments[7], trustCommitments[8], trustCommitments[9]].map(([id, question, answer]) => ({ id, question, answer })),
    },
    {
      id: 'privacy-responsibility',
      title: 'Privacy and responsibility',
      items: [
        trustCommitments[6],
        trustCommitments[10],
        trustCommitments[11],
      ].map(([id, question, answer]) => ({ id, question, answer })),
    },
  ],
} satisfies Faq6Data;

const processJourney = [
  { number: '01', phase: 'Introduce', status: 'Free first call', title: 'Introductory call', copy: 'Share what you want to improve. We listen, ask the useful questions and confirm the best next step.' },
  { number: '02', phase: 'Discover', status: 'Audit optional', title: 'Discovery meeting', copy: 'We clarify your audience, goals and priorities. If deeper research would help, we recommend the optional paid audit.' },
  { number: '03', phase: 'Quote', status: 'Everything in writing', title: 'Quote and terms', copy: 'You receive the deliverables, timeline, fees, required inputs and exclusions in writing.' },
  { number: '04', phase: 'Agree', status: 'Your approval', title: 'Proposal and agreement', copy: 'We answer your questions and finalise the scope, payment stages and review points together.' },
  { number: '05', phase: 'Start', status: 'Visible milestones', title: 'Project starts', copy: 'Once you approve and share the required access, work begins with clear milestones and regular updates.' },
];

const caseStudyBanners: Record<string, { src: string; alt: string }> = {
  'shree-hari-spintex': { src: '/shsl-banner.png', alt: 'Shree Hari Spintex website, search and local discovery project collage' },
  'mittal-architect': { src: '/mittal-banner.png', alt: 'Mittal Architect website, project portfolio and search visibility collage' },
  'kiraq-jewellery': { src: '/kiraq-banner.png', alt: 'Kiraq Jewellery identity, storefront and administration system collage' },
  'elixir-beverages': { src: '/elixir-banner.png', alt: 'Elixir Beverages brand identity and pre-launch website collage' },
  'aegis-squad': { src: '/aegis-banner.png', alt: 'Aegis Squad services website and search presence collage' },
  'ketan-goyal': { src: '/ketan-banner.png', alt: 'Ketan Goyal personal portfolio, writing and builds collage' },
};

const featuredProjectSlugs = ['shree-hari-spintex', 'mittal-architect', 'elixir-beverages', 'kiraq-jewellery'];

const selectedProjects = featuredProjectSlugs
  .map((slug) => projects.find((project) => project.slug === slug))
  .filter((project): project is NonNullable<typeof project> => Boolean(project));

export function HomePageExperience({ eyebrow, intro, schema, geographicContext }: HomePageExperienceProps = {}) {
  const homeReviews = featuredReviews();
  const trustItems = geographicContext
    ? geographicContext.answers.map(({ question, answer }, index) => [`Q${index + 1}`, question, answer])
    : trustCommitments;
  const schemaContext = schema ?? {
    name: homeTitle,
    description: homeDescription,
    path: '/',
    breadcrumbs: [{ name: 'Home', path: '/' }],
    entities: [],
  };

  return (
    <main>
      <JsonLd data={{
        ...createPageSchema({
          name: schemaContext.name,
          description: schemaContext.description,
          path: schemaContext.path,
          breadcrumbs: schemaContext.breadcrumbs,
          entities: [
            ...reviewSchemas(homeReviews),
            ...(!geographicContext ? [faqSchema(homepageFaqs, '/')] : []),
            ...(schemaContext.entities ?? []),
          ],
        }),
      }} />
      <SiteHeader overlay />
      <HomeShowcase eyebrow={eyebrow} intro={intro} />

      <section className="home-services-play section-light" id="what-we-build">
        <div className="home-services-play-inner">
          <Reveal className="home-services-play-heading" direction="scale">
            <div className="home-services-play-count" aria-label="Four featured services">
              <strong>04</strong>
              <span>Featured<br />services</span>
            </div>
            <div className="home-services-play-title">
              <p className="eyebrow eyebrow-dark">What we build</p>
              <h2>Build the essentials.<br /><em>Add what the business needs.</em></h2>
            </div>
            <div className="home-services-play-intro">
              <p>Start with the service that solves the immediate gap, then connect the wider brand, content or system when the business needs it.</p>
              <div><span>Direct service pages</span><span>Published starting prices</span><span>Defined scope</span></div>
            </div>
          </Reveal>

          <div className="home-services-featured-grid home-services-featured-row">
            {featuredServices.map((service, index) => {
              const href = geographicContext?.enabledServiceSlugs.includes(service.slug) ? `${geographicContext.serviceBasePath}/${service.slug}` : service.href;
              return (
                <Reveal className={`home-service-featured home-service-featured-${index + 1}`} key={service.slug} delay={index * .04}>
                  <div className="home-service-featured-top"><span>{service.number}</span><i aria-hidden="true"><AnimatedServiceIcon slug={service.slug} size={38} /></i></div>
                  <div className="home-service-featured-copy"><small>{service.eyebrow}</small><h3>{service.name}</h3><p>{service.copy}</p></div>
                  <div className="home-service-featured-bottom"><span>From <RegionalPriceCopy>{service.price}</RegionalPriceCopy></span><Link href={href}>View service <i aria-hidden="true">↗</i></Link></div>
                </Reveal>
              );
            })}
          </div>

          <div id="marketplace-highlight" className="home-marketplace-row">
            <Reveal className="home-marketplace-feature">
              <div className="home-marketplace-feature-copy">
                <div className="home-marketplace-feature-icon"><AnimatedServiceIcon slug="marketplace-catalogue-building" /></div>
                <div><p>Marketplace catalogue service</p><h3>Register your products directly on e-commerce giants.</h3><span>You handle the orders. We handle the listings, product setup, marketplace SEO and catalogue structure.</span></div>
              </div>
              <Link className="home-marketplace-feature-cta" href={geographicContext?.enabledServiceSlugs.includes('marketplace-catalogue-building') ? `${geographicContext.serviceBasePath}/marketplace-catalogue-building` : '/services/marketplace-catalogue-building'}>View marketplace service <i aria-hidden="true">↗</i></Link>
              <div className="home-marketplace-platforms" aria-label="Marketplace platforms">
                {marketplacePlatforms.map((marketplace) => <div key={marketplace.name}><div><Image src={marketplace.src} alt={`${marketplace.name} marketplace logo`} fill sizes="(max-width: 700px) 40vw, 13vw" /></div></div>)}
              </div>
              
            </Reveal>

            <Reveal className="home-marketplace-all">
              <Link href="/services">View all services <i aria-hidden="true">→</i></Link>
            </Reveal>
          </div>

          {/* <Reveal className="home-professional-services">
            <div className="home-professional-services-heading"><span>Other professional services</span><p>Add a focused capability without losing the wider business context.</p></div>
            <div className="home-professional-services-grid">
              {professionalServices.map((service) => {
                const href = geographicContext?.enabledServiceSlugs.includes(service.slug) ? `${geographicContext.serviceBasePath}/${service.slug}` : service.href;
                return <Link href={href} key={service.slug}><i aria-hidden="true"><AnimatedServiceIcon slug={service.slug} size={30} /></i><strong>{service.name}</strong><span>View service <b aria-hidden="true">↗</b></span></Link>;
              })}
            </div>
          </Reveal> */}

        </div>
      </section>

      <section className="home-case-playground section-light">
        <Reveal className="home-case-playground-heading">
          <div className="home-case-playground-count" aria-label="Four featured projects"><strong>04</strong><span>Featured work</span></div>
          <div className="home-case-playground-title">
            <p className="eyebrow eyebrow-dark">Featured work</p>
            <h2><span>Proof takes</span><span>different shapes.</span></h2>
          </div>
          <div className="home-case-playground-intro">
            <p>{geographicContext?.proofNote ?? 'Selected case studies and projects show the business situation, the work delivered and what the available evidence supports.'}</p>
            <Link className="home-case-playground-all" href="/work">Explore all projects <span aria-hidden="true">↗</span></Link>
          </div>
        </Reveal>

        <div className="home-case-playground-grid">
          {selectedProjects.map((project, index) => {
            const banner = caseStudyBanners[project.slug];
            return (
              <Reveal className={`home-case-play-card home-case-play-card-${index + 1}`} direction={index % 2 ? 'left' : 'right'} delay={index * 0.06} key={project.slug}>
                <Link href={`/work/${project.slug}`} aria-label={`Explore ${project.name} ${project.projectType.toLowerCase()}`}>
                  <div className="home-case-play-media">
                    <Image src={banner.src} alt={banner.alt} fill sizes="(max-width: 760px) 92vw, (max-width: 1100px) 46vw, 58vw" />
                    <strong className="home-case-play-number">0{index + 1}</strong>
                    <span className="home-case-play-arrow" aria-hidden="true">↗</span>
                  </div>
                  <div className="home-case-play-copy">
                    <div><span>{project.projectType}</span><span>{project.industry}</span></div>
                    <h3>{project.name}</h3>
                    <p>{project.context}</p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>

        {/* <Reveal className="home-case-playground-footer">
          <p><span>04</span> featured projects. Real context. No manufactured proof.</p>
          <Link href="/work">View the full evidence <span aria-hidden="true">→</span></Link>
        </Reveal> */}
      </section>

      

      <section className="home-process-journey" aria-labelledby="home-process-title">
        <div className="home-process-journey-inner">
          <div className="home-process-journey-heading">
            <div className="home-process-journey-label">
              <p className="eyebrow">How engagement begins</p>
              <span className="home-process-journey-index">01—05</span>
            </div>
            <div className="home-process-journey-summary">
              <div>
                <h2 id="home-process-title">Know what happens<br /><em>before work begins.</em></h2>
                <p>Five straightforward steps. You see the scope, cost and responsibilities before you commit, and nothing moves forward without your approval.</p>
              </div>
              <Link href="/process" className="home-process-journey-link">Explore the full process <span aria-hidden="true">↗</span></Link>
            </div>
          </div>

          <ol className="home-process-simple-flow" aria-label="Kraftt client engagement journey">
            {processJourney.map((step) => (
              <li className="home-process-simple-step" key={step.number}>
                <div className="home-process-simple-meta">
                  <span>{step.number}</span>
                  <small>{step.phase}</small>
                </div>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
                <strong>{step.status}</strong>
              </li>
            ))}
          </ol>

          <div className="home-process-assurance" aria-label="What stays clear throughout the engagement">
            <span>You stay in control</span>
            <p><i aria-hidden="true">✓</i> Clear scope before commitment</p>
            <p><i aria-hidden="true">✓</i> Costs and terms made visible</p>
            <p><i aria-hidden="true">✓</i> Your approval before finalisation</p>
          </div>
        </div>
      </section>

      <ReviewsSection reviews={homeReviews} variant="home" />


      {/* <section className="home-conversion">
        <Reveal className="home-conversion-heading" direction="left">
          <p className="eyebrow eyebrow-dark">{geographicContext?.localEyebrow ?? 'Built to be chosen'}</p>
          <h2>{geographicTitleLines ? <>{geographicTitleLines[0]}<br />{geographicTitleLines[1]}</> : <>Clarity gets attention.<br />Proof earns action.</>}</h2>
          <p>{geographicContext?.localBody ?? 'A useful digital presence does more than look finished. It helps the right person understand the offer, believe the business and know what to do next.'}</p>
          <Link href="/audit">Start with the real gap <span aria-hidden="true">→</span></Link>
        </Reveal>

        <Reveal className="home-conversion-main-media" direction="scale">
          <Image
            src="/Built to be chosen image.png"
            alt="Kraftt strategist connecting research, structure, brand expression and technology"
            fill
            sizes="(max-width: 900px) 92vw, 54vw"
          />
          <span>Research → structure → visible trust</span>
        </Reveal>

        <Reveal className="home-conversion-detail-media" direction="left">
          <Image
            src="/Built to be chosen image 2.png"
            alt="Kraftt team mapping one commercial idea across connected digital surfaces"
            fill
            sizes="(max-width: 900px) 70vw, 25vw"
          />
          <span>One idea across every surface</span>
        </Reveal>

        <Reveal className="home-conversion-copy" direction="right">
          <p>{geographicContext?.detail ?? 'Between research, structure, brand expression and technology, we reduce the distance between first impression and confident enquiry.'}</p>
          <strong>One idea, consistently expressed across brand, website, content, growth and internal systems.</strong>
        </Reveal>
      </section> */}

      <section className="home-trust">
        <div className="home-trust-inner">
          <Reveal className="home-trust-heading" direction="scale">
            <div>
              <p className="eyebrow">{geographicContext ? 'Frequently asked questions' : 'Why Kraftt'}</p>
              <span>{geographicContext ? `Working with Kraftt · ${geographicContext.marketName}` : 'Trust, made visible'}</span>
            </div>
            <h2>{geographicContext ? <>Questions, answered.<br /><em>Before you enquire.</em></> : <>Be discovered.<br /><em>Be trusted. Be chosen.</em></>}</h2>
            <div className="home-trust-heading-intro">
              <p>{geographicContext ? `Clear, factual answers about working with Kraftt for a business in ${geographicContext.marketName}.` : 'A clearer brand and digital presence help people understand your work and know how to contact you.'}</p>
              <Link href={geographicContext ? '/contact' : '/about'}>{geographicContext ? 'Ask another question' : 'Know about kraftt'} <span aria-hidden="true">↗</span></Link>
            </div>
          </Reveal>

          <div className="home-trust-story">
            {/* <Reveal className="home-trust-vision" direction="left">
              <figure className="home-trust-avatar">
                <Image
                  src="/assets/ketan-goyal-candid.jpg"
                  alt="Ketan Goyal, founder of Kraftt Digital"
                  fill
                  sizes="108px"
                />
              </figure>
              <div className="home-trust-vision-copy">
                <p className="eyebrow">Led by Ketan Goyal</p>
                <h3 className="home-trust-principle-list">
                  <span><small>01</small>Understand the business.</span>
                  <span><small>02</small>Explain the priorities.</span>
                  <span><small>03</small>Review the work before delivery.</span>
                </h3>
              </div>
              <div className="home-trust-vision-detail">
                <p>Ketan leads Kraftt’s direction and reviews what is delivered. Your stage, goals and budget shape the recommendation.</p>
                <Link href="/about">Meet Kraftt <span aria-hidden="true">↗</span></Link>
              </div>
            </Reveal> */}

            {geographicContext ? (
              <div className="home-trust-commitments" aria-label={`Frequently asked questions about working with Kraftt in ${geographicContext.marketName}`}>
                {trustItems.map(([icon, title, copy], index) => (
                  <Reveal delay={index * 0.05} key={title}>
                    <details className="home-trust-faq" open={index === 0}>
                      <summary>
                        <span aria-hidden="true">{icon === '₹' ? <CurrencySymbol /> : icon}</span>
                        <h4>{title}</h4>
                        <i aria-hidden="true">+</i>
                      </summary>
                      <div><p>{copy}</p></div>
                    </details>
                  </Reveal>
                ))}
              </div>
            ) : <Faq data={homepageFaqData} />}
          </div>

          
        </div>
      </section>

      {/* <AuditCTA title="Make the gap clear before choosing what to build." /> */}
      {/* <EmployeeOsFeature /> */}
      <section className="home-trust" id="start-here">
        <div className="home-trust-inner">
      <Reveal className="home-trust-decision" direction="scale">
            {/* <div className="home-trust-decision-lead">
              <span>Choose how to begin</span>
              <strong>Choose the right first step<br /><em>for what you know today.</em></strong>
              <p><RegionalPriceCopy>Use the free call when you know what you want to discuss. Choose the ₹999 audit when you need researched priorities before selecting a service.</RegionalPriceCopy></p>
              <div className="home-trust-decision-note" aria-label="What both options provide">
                <span>Clear recommendation</span>
                <span>Standalone first step</span>
                <span>No project obligation</span>
              </div>
            </div> */}

            {/* <div className="home-trust-decision-choices" aria-label="Choose your starting point"> */}
              <Link className="home-trust-decision-choice" href="/contact#intro-call">
                <div className="home-trust-decision-choice-meta"><span>01</span><small>Free</small></div>
                <p>Best for a defined need</p>
                <strong>Talk it through in a free introductory call.</strong>
                <small>Explain the situation, ask questions and check whether Kraftt is the right fit for the work.</small>
                <span className="home-trust-decision-result">Outcome · a useful next step</span>
                <div className="home-trust-decision-choice-action"><span>Book the call</span><i aria-hidden="true">→</i></div>
              </Link>
              <Link className="home-trust-decision-choice" href="/audit">
                <div className="home-trust-decision-choice-meta"><span>02</span><small><RegionalPriceCopy>₹999</RegionalPriceCopy></small></div>
                <p>Best for an unclear direction</p>
                <strong>Start with a researched Digital Presence Audit.</strong>
                <small>Get a structured review of the business, competitors and current online presence before deciding what to improve.</small>
                <span className="home-trust-decision-result">Outcome · findings and priorities</span><br /><br />
                <div className="home-trust-decision-choice-action"><span>Request the audit</span><i aria-hidden="true">↗</i></div>
              </Link>
            {/* </div> */}
          </Reveal></div>
          </section>
      <Footer />
    </main>
  );
}

