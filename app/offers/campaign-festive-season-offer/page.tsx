import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, LayoutGrid, MessageCircle, Monitor, Palette, Search, ShieldCheck } from 'lucide-react';
import { JsonLd } from '../../components/JsonLd';
import { projects } from '../../data/projects';
import { contactEmail, whatsappUrl } from '../../data/site';
import { formatInr, getFeaturedOffer, isOfferClaimable } from '../../data/offers';
import { absoluteUrl, createPageMetadata, createPageSchema, faqSchema, serviceSchema } from '../../data/seo';
import { OfferEnquiryForm } from '../OfferEnquiryForm';
import { CampaignTracker } from './CampaignTracker';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';
const offer = getFeaturedOffer();
const faqs = [
  { question: 'What is included in ₹30,000?', answer: 'A five-page responsive website, starter brand identity and the first month of social content for one platform. The full checklist is above.' },
  { question: 'Are domain and hosting included?', answer: 'No. Domain, hosting, subscriptions and other third-party costs are separate.' },
  { question: 'Is paid advertising included?', answer: 'No. Ad spend and ad management are outside this package.' },
  { question: 'Can I get an e-commerce website?', answer: 'A large product catalogue needs a different scope. Tell us what you plan to sell and we can recommend the right approach.' },
  { question: 'Can I purchase only one service?', answer: 'The ₹30,000 festive price is for all three together. A standalone service needs a separate scope.' },
  { question: 'What happens after I apply?', answer: 'We check fit, confirm scope and timeline, then send a proposal. No payment is needed to enquire.' },
  { question: 'What happens after the first social month?', answer: 'Further social support can be discussed and scoped separately.' },
  { question: 'How is the timeline decided?', answer: 'We confirm it in the proposal after reviewing your content, access and requirements.' },
];
const projectLabels: Record<string, string> = {
  'kiraq-jewellery': 'Brand + Website',
  'elixir-beverages': 'Brand + Website',
  'mittal-architect': 'Website + Search',
};
const projectBanner: Record<string, { src: string; alt: string; height: number }> = {
  'kiraq-jewellery': { src: '/assets/offers/kiraq-case-study-banner.webp', alt: 'Kiraq Jewellery brand identity, storefront and administration collage', height: 675 },
  'elixir-beverages': { src: '/assets/offers/elixir-case-study-banner.webp', alt: 'Elixir Beverages brand identity and website collage', height: 720 },
  'mittal-architect': { src: '/assets/offers/mittal-case-study-banner.webp', alt: 'Mittal Architect website, portfolio and search presence collage', height: 675 },
};
const proofProjects = offer.proofProjectSlugs.map(slug => projects.find(project => project.slug === slug)).filter((project): project is NonNullable<typeof project> => Boolean(project?.hero));
const inclusionIcons = { website: Monitor, branding: Palette, social: LayoutGrid };
const inclusionHeadings = { website: 'Your digital home.', branding: 'Look consistent and credible.', social: 'Launch with content ready.' };
const inclusionItems = {
  website: ['5 responsive pages', 'Complete on-page SEO', 'WhatsApp + contact form', 'Basic lead capture', 'Search Console setup'],
  branding: ['Primary logo', 'Secondary logo', 'Icon logo', 'Colour palette', 'Typography system', 'Brand voice & tone guide'],
  social: ['First month · one platform', '15 designed posts', '10 stories', 'Captions + hashtags', 'Profile setup'],
};

export function generateMetadata(): Metadata {
  return createPageMetadata({
    title: 'Starter Business Launch | Website, Brand & Social for ₹30,000 | Kraftt Digital',
    description: 'A five-page website, brand identity and first month of social media for ₹30,000. Festive offer through 8 November 2026.',
    path: offer.pagePath,
    label: 'Starter Business Launch',
  });
}

export default function FestiveSeasonOfferPage() {
  const active = isOfferClaimable(offer);
  const benefit = offer.individualServiceValue - offer.offerPrice;
  const whatsApp = whatsappUrl(active ? "Hi Kraftt, I'm interested in the ₹30,000 Starter Business Launch offer. Please share the next steps." : "Hi Kraftt, I saw your closed Starter Business Launch campaign. I'd like to discuss a current website, brand and social scope.");
  return <main id="campaign-landing" className={styles.page}>
    <JsonLd data={createPageSchema({
      name: offer.name + ' Festive Season Offer', description: offer.supportingLine, path: offer.pagePath,
      breadcrumbs: [{ name: 'Home', path: '/' }, { name: offer.name, path: offer.pagePath }],
      entities: [serviceSchema({ name: offer.name, description: offer.supportingLine, path: offer.pagePath }), faqSchema(faqs, offer.pagePath)],
    })} />
    <header className={styles.header}>
      <Link className={styles.wordmark} href="/" aria-label="Kraftt Digital home">Kraftt<span>.</span></Link>
      <div><span>{active ? 'Offer ends 8 Nov' : 'Offer closed'}</span><a href={whatsApp} target="_blank" rel="noopener noreferrer" aria-label="Ask Kraftt on WhatsApp"><MessageCircle size={19} aria-hidden="true" /></a></div>
    </header>

    <section id="campaign-hero" className={styles.hero} aria-labelledby="campaign-title">
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>Festive business launch offer</p>
        <h1 id="campaign-title">Launch your business.<br /><em>Ready to be trusted.</em></h1>
        <p className={styles.heroSubline}>Website + Brand + Social</p>
        <p className={styles.heroLead}>Everything you need for a credible digital launch — <strong>₹30,000.</strong></p>
        <div className={styles.heroHighlights} aria-label="Offer highlights">
          <span><Monitor aria-hidden="true" />5-page website</span>
          <span><Palette aria-hidden="true" />Complete brand identity</span>
          <span><LayoutGrid aria-hidden="true" />15 posts + 10 stories</span>
        </div>
        <div className={styles.heroPrice} aria-label="Festive price and saving">
          <div><small>Individual value</small><s>{formatInr(offer.individualServiceValue)}</s></div>
          <ArrowRight size={20} aria-hidden="true" />
          <div><small>Festive price</small><strong>{formatInr(offer.offerPrice)}</strong></div>
          <span className={styles.saving}>Save {formatInr(benefit)}</span>
        </div>
        <a className={styles.primaryCta} href="#hero-application" data-campaign-event="hero_apply_click">{active ? 'APPLY NOW' : 'SEND AN ENQUIRY'} <ArrowRight size={17} aria-hidden="true" /></a>
        <p className={styles.microcopy}>Takes under 2 minutes · No payment now</p>
        <p className={styles.deadline}>{active ? 'Offer ends 8 November 2026 · India time' : 'This festive offer has ended. Ask about a current scope.'}</p>
      </div>
      <div id="hero-application" className={styles.heroForm}>
        <a className={styles.whatsappEnquiry} href={whatsApp} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} aria-hidden="true" /> Enquire on WhatsApp <ArrowRight size={16} aria-hidden="true" /></a>
        <OfferEnquiryForm offer={offer} pageUrl={absoluteUrl(offer.pagePath)} initialExpired={!active} campaign campaignPlacement="hero" />
      </div>
    </section>

    <section id="campaign-projects" className={styles.section} aria-labelledby="campaign-projects-title">
      <div className={styles.sectionHead}><p className={styles.eyebrow}>Proof in the work</p><h2 id="campaign-projects-title">Real work. <em>Real businesses.</em></h2></div>
      <div className={styles.projects}>{proofProjects.map(project => <Link className={styles.projectCard} href={`/work/${project.slug}`} key={project.slug} data-campaign-event="project_click" data-project={project.slug}>
        {projectBanner[project.slug] && <div className={styles.projectImage}><Image src={projectBanner[project.slug].src} alt={projectBanner[project.slug].alt} width={1200} height={projectBanner[project.slug].height} sizes="(max-width: 700px) 92vw, (max-width: 1050px) 45vw, 30vw" /></div>}
        <div><span><strong>{project.name}</strong><small>{projectLabels[project.slug]}</small></span><ArrowRight size={18} aria-hidden="true" /></div>
      </Link>)}</div>
    </section>

    <section id="campaign-details" className={`${styles.section} ${styles.included}`} aria-labelledby="campaign-details-title">
      <div className={styles.sectionHead}><p className={styles.eyebrow}>What you get</p><h2 id="campaign-details-title">Everything included.</h2></div>
      <div className={styles.inclusionGrid}>{offer.inclusions.map(item => {
        const Icon = inclusionIcons[item.id as keyof typeof inclusionIcons];
        const items = inclusionItems[item.id as keyof typeof inclusionItems];
        return <article key={item.id} className={styles.inclusionCard}><div className={styles.cardIcon}>{Icon && <Icon size={24} strokeWidth={1.5} aria-hidden="true" />}</div><p className={styles.eyebrow}>{item.title}</p><h3>{inclusionHeadings[item.id as keyof typeof inclusionHeadings]}</h3><ul>{items?.map(detail => <li key={detail}><Check size={16} aria-hidden="true" />{detail}</li>)}</ul></article>;
      })}</div>
    </section>

    <section className={`${styles.section} ${styles.outcomes}`} aria-labelledby="campaign-outcomes-title"><div className={styles.sectionHead}><p className={styles.eyebrow}>One team. One launch.</p><h2 id="campaign-outcomes-title">Ready to show up.</h2></div><div className={styles.outcomeGrid}><div><ShieldCheck aria-hidden="true" /><strong>Look credible</strong></div><div><Search aria-hidden="true" /><strong>Get discovered</strong></div><div><MessageCircle aria-hidden="true" /><strong>Start receiving enquiries</strong></div></div></section>

    <section className={`${styles.section} ${styles.fit}`} aria-labelledby="campaign-fit-title"><div className={styles.sectionHead}><p className={styles.eyebrow}>The right fit</p><h2 id="campaign-fit-title">Is this for you?</h2></div><div className={styles.fitGrid}><div><h3>Good fit</h3><ul>{['Starting a new business', 'Local business going digital', 'Founder launching a new offer', 'Relying on Instagram or WhatsApp', 'Need website + branding + social together'].map(value => <li key={value}><Check size={16} aria-hidden="true" />{value}</li>)}</ul></div><div><h3>Another scope fits better</h3><ul>{['Large e-commerce catalogue', 'Major established-business rebuild', 'Only one standalone service'].map(value => <li key={value}><span aria-hidden="true">×</span>{value}</li>)}</ul></div></div></section>

    <section id="campaign-price" className={`${styles.section} ${styles.priceSection}`} aria-labelledby="campaign-price-title"><div><p className={styles.eyebrow}>The investment</p><h2 id="campaign-price-title">One clear investment.</h2><p>Website + Brand + Social</p></div><div className={styles.pricePanel}><div><span>Individual value</span><s>{formatInr(offer.individualServiceValue)}</s></div><div><span>Regular Kraftt bundle</span><s>{formatInr(offer.regularBundlePrice)}</s></div><div className={styles.priceNow}><span>Festive price</span><strong>{formatInr(offer.offerPrice)}</strong></div><p>Save {formatInr(benefit)} versus individual purchase</p><small>{active ? 'Valid through 8 November 2026 · India time' : 'This festive offer has ended.'}</small><a className={styles.primaryCta} href="#hero-application">{active ? 'APPLY NOW' : 'SEND AN ENQUIRY'} <ArrowRight size={17} aria-hidden="true" /></a><small>No payment required to enquire.</small></div></section>

    <section className={`${styles.section} ${styles.process}`} aria-labelledby="campaign-process-title"><div className={styles.sectionHead}><p className={styles.eyebrow}>Three steps</p><h2 id="campaign-process-title">How it works.</h2></div><ol><li><span>01</span><strong>Apply</strong><p>Share basic business details.</p></li><li><span>02</span><strong>We check fit</strong><p>Kraftt reviews what you need.</p></li><li><span>03</span><strong>Get your proposal</strong><p>We confirm scope, timeline and next steps.</p></li></ol></section>

    <section id="campaign-faq" className={`${styles.section} ${styles.faq}`} aria-labelledby="campaign-faq-title"><div className={styles.sectionHead}><p className={styles.eyebrow}>The essentials</p><h2 id="campaign-faq-title">Questions, answered.</h2></div><div className={styles.faqList}>{faqs.map(({ question, answer }) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>

    <footer className={styles.footer}><span>Kraftt Digital · Starter Business Launch</span><div><a href={`mailto:${contactEmail}`}>{contactEmail}</a><Link href="/legal/privacy-policy">Privacy</Link></div></footer>
    <CampaignTracker expiresAt={offer.expiresAt} initialExpired={!active} />
  </main>;
}
