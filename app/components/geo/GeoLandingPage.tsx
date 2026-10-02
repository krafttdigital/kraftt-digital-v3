import { enabledLocationServices, enabledRegionServices, type LocationMarket, type RegionMarket } from '../../data/geo';
import { faqSchema } from '../../data/seo';
import { HomePageExperience } from '../HomePageExperience';

type GeoLandingPageProps =
  | { kind: 'location'; market: LocationMarket }
  | { kind: 'region'; market: RegionMarket };

function locationAnswers(market: LocationMarket) {
  return [
    {
      question: `Does Kraftt work in ${market.name}?`,
      answer: `Yes. Kraftt serves ${market.name} businesses through a research-led remote process. ${market.name} is a service area, not a claimed local office.`,
    },
    {
      question: 'Can you redesign our website?',
      answer: `Yes. For ${market.name} businesses, Kraftt first reviews the website, brand, content, search foundation and enquiry flow, then recommends the right scope.`,
    },
    {
      question: 'Do you build Shopify stores?',
      answer: `Yes. Kraftt builds Shopify stores for ${market.name} businesses, covering setup, products, checkout, mobile usability and search foundations according to the selected package.`,
    },
    {
      question: 'How does a project begin?',
      answer: 'Request a free introductory call to discuss the requirement. A paid Digital Presence Audit is available separately when deeper research would help.',
    },
  ];
}

function regionAnswers(market: RegionMarket) {
  const audienceName = market.slug === 'usa' ? 'US' : market.shortName;

  return [
    {
      question: `Does Kraftt work with ${audienceName} businesses?`,
      answer: `Yes. Kraftt is based in India and serves ${audienceName} businesses through a documented remote process. No local office is claimed.`,
    },
    {
      question: `How do India–${audienceName} meetings work?`,
      answer: market.communication.timezone,
    },
    {
      question: 'How are reviews approved?',
      answer: `${market.communication.terminology} Design, development, feedback and approvals move through documented digital stages.`,
    },
    {
      question: 'How are pricing and payments agreed?',
      answer: 'International pricing, project scope and payment milestones are confirmed in the proposal before work begins.',
    },
  ];
}

export function GeoLandingPage(props: GeoLandingPageProps) {
  const { kind, market } = props;
  const path = kind === 'location' ? `/location/${market.slug}` : `/region/${market.slug}`;
  const serviceSlugs = kind === 'location'
    ? enabledLocationServices[market.slug as keyof typeof enabledLocationServices]
    : enabledRegionServices[market.slug as keyof typeof enabledRegionServices];
  const answers = kind === 'location' ? locationAnswers(market) : regionAnswers(market);
  const marketName = kind === 'location'
    ? market.name === market.stateOrRegion ? `${market.name}, India` : `${market.name}, ${market.stateOrRegion}`
    : market.name;
  const detail = kind === 'location'
    ? `Kraftt is based in India and serves ${marketName} remotely. The market relationship is clear without implying a physical local office.${market.nearbyAreas.length ? ` Relevant nearby service areas include ${market.nearbyAreas.join(', ')}.` : ''}`
    : `${market.communication.timezone} ${market.communication.terminology}`;

  return (
    <HomePageExperience
      eyebrow={market.eyebrow}
      intro={market.heroIntro}
      schema={{
        name: market.metaTitle,
        description: market.metaDescription,
        path,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: kind === 'location' ? 'Locations' : 'Regions', path: kind === 'location' ? '/location' : '/region' },
          { name: market.name, path },
        ],
        entities: [faqSchema(answers, path)],
      }}
      geographicContext={{
        marketName,
        localEyebrow: market.localContext.eyebrow,
        localTitle: market.localContext.title,
        localBody: market.localContext.body,
        detail,
        proofNote: `Selected Kraftt work shows our process and delivery. These projects are not presented as clients from ${market.name} unless their own project pages say so.`,
        serviceBasePath: path,
        enabledServiceSlugs: serviceSlugs,
        answers,
      }}
    />
  );
}
