import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Footer } from '../components/Footer';
import { JsonLd } from '../components/JsonLd';
import { Reveal } from '../components/Reveal';
import { SiteHeader } from '../components/SiteHeader';
import { projects } from '../data/projects';
import { createPageMetadata, createPageSchema } from '../data/seo';

const pageTitle = 'About Kraftt Digital | Founder-Led Brand & Web Agency';
const pageDescription = 'Meet Kraftt Digital and founder Ketan Goyal. We help businesses understand their digital priorities and build a brand presence that reflects their work.';

export const metadata: Metadata = createPageMetadata({ title: pageTitle, description: pageDescription, path: '/about', label: 'About Kraftt' });

const principles = [
  ['⌕', 'Research before format', 'We identify the business need before deciding what should be designed or built.'],
  ['✓', 'Proof before claims', 'Measured results, qualitative outcomes and missing evidence are labelled honestly.'],
  ['◎', 'One connected view', 'Brand, website, content and systems reinforce the same commercial idea.'],
  ['□', 'Scope without fog', 'Deliverables, exclusions, timing and decisions are written in plain language.'],
];

const trustNumbers = [
  [String(projects.length).padStart(2, '0'), 'Selected projects'],
  ['06', 'Connected services'],
  [String(projects.filter((project) => project.projectType === 'Case Study').length).padStart(2, '0'), 'Documented case studies'],
  ['India +', 'International clients'],
];

const aboutAtGlance = [
  ['01', 'What we build', 'Brands, websites, stores, marketplace catalogues, SEO and focused digital systems.'],
  ['02', 'Who we help', 'Established businesses, professionals and founders who need clarity and credibility.'],
  ['03', 'How it starts', 'Free call → written scope → visible reviews → approved delivery.'],
] as const;

const reportedOutcomes = [
  { value: '₹30L+', title: 'Stock sales reported', copy: 'A manufacturing client reported stock sold after direct enquiries from the rebuilt website.', source: 'View the Shree Hari case study', href: '/work/shree-hari-spintex' },
  { value: 'Crore-scale', title: 'Major order reported', copy: 'The same client reported a large order from a customer who discovered the mill through its website and Google Maps.', source: 'View the client evidence', href: '/work/shree-hari-spintex' },
  { value: 'Search + Maps', title: 'Easier customer discovery', copy: 'A client reported improved online visibility after website and Google Maps information was strengthened.', source: 'Client feedback', href: '/work/shree-hari-spintex' },
  { value: '₹2.4K/mo', title: 'Platform cost avoided', copy: 'A jewellery client reported saving thousands and avoiding roughly ₹2,400 per month in Shopify costs.', source: 'View the Kiraq case study', href: '/work/kiraq-jewellery' },
] as const;

const capabilityGroups = [
  {
    number: '01',
    title: 'Brand and direction',
    copy: 'Positioning, identity and practical brand systems that make the business easier to recognise and explain.',
    href: '/services/brand-identity',
    linkLabel: 'Explore brand identity',
    icon: '✦',
  },
  {
    number: '02',
    title: 'Websites and commerce',
    copy: 'Business websites and online stores structured around what visitors need to understand, trust and do next.',
    href: '/services/web-design-development',
    linkLabel: 'Explore website services',
    icon: '↗',
  },
  {
    number: '03',
    title: 'Visibility and content',
    copy: 'SEO and social communication that help the right people discover the business and assess it with confidence.',
    href: '/services/ecommerce-seo',
    linkLabel: 'Explore SEO services',
    icon: '⌕',
  },
  {
    number: '04',
    title: 'Digital systems',
    copy: 'Focused apps, dashboards and internal tools that reduce friction behind the customer experience.',
    href: '/services/dashboards-internal-tools',
    linkLabel: 'Explore digital systems',
    icon: '⌘',
  },
];

const workingSteps = [
  ['01', 'Start with context', 'A free introductory call clarifies the business, the immediate need and the most useful next step.'],
  ['02', 'Find the direction', 'We review the audience, priorities and current presence. A paid audit is suggested only when deeper research would help.'],
  ['03', 'Make the scope visible', 'Deliverables, timing, fees, inputs and exclusions are written down before either side commits.'],
  ['04', 'Build with review points', 'You see the work at agreed stages, stay informed and approve it before finalisation or launch.'],
];

const goodFit = [
  'You want the business understood before work begins.',
  'You value direct access and documented decisions.',
  'You need one focused service or several services to work together.',
];

const poorFit = [
  'Share accurate information and the access needed for the work.',
  'Tell us your goals, timing and budget so we can recommend a useful scope.',
  'Review and approve the agreed work at the planned stages.',
];

export default function AboutPage() {
  return (
    <main className="about-clarity-page">
      <JsonLd data={createPageSchema({ name: pageTitle, description: pageDescription, path: '/about', breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }] })} />
      <SiteHeader />

      <section className="about-clarity-hero" aria-labelledby="about-page-title">
        <div className="about-clarity-hero-inner">
          <Reveal className="about-clarity-hero-copy" direction="left">
            <p className="eyebrow eyebrow-dark">Founder-led digital studio · India</p>
            <h1 id="about-page-title">Understand Kraftt<br /><em>in under a minute.</em></h1>
            <p>One accountable studio for brand, websites, e-commerce, marketplace, SEO and focused digital systems—with scope and pricing made clear before work begins.</p>
            <div className="about-clarity-scan" aria-label="Kraftt at a glance">
              {aboutAtGlance.map(([number, title, copy]) => (
                <div key={title}><span>{number}</span><strong>{title}</strong><p>{copy}</p></div>
              ))}
            </div>
            <div className="about-clarity-actions">
              <Link href="/contact">Request a Free Call <span aria-hidden="true">→</span></Link>
              <Link href="/work">See real project outcomes <span aria-hidden="true">↗</span></Link>
            </div>
          </Reveal>

          <Reveal className="about-clarity-visual about-clarity-visual-founder" direction="right">
            <div className="about-clarity-visual-label"><span>K.</span><p>One clear presence<br />across every surface</p></div>
            <Image
              src="/assets/ketan-goyal-about-hero.png"
              alt="Ketan Goyal, founder of Kraftt Digital"
              fill
              priority
              sizes="(max-width: 900px) 94vw, 48vw"
            />
            <div className="about-clarity-founder-tag"><strong>Founder-led</strong><small>One accountable lead</small></div>
          </Reveal>
        </div>
      </section>

      <nav className="about-clarity-journey" aria-label="About Kraftt page sections">
        <span>Explore Kraftt</span>
        <Link href="#proof">Real outcomes <i>01</i></Link>
        <Link href="#why-kraftt">Why Kraftt <i>02</i></Link>
        <Link href="#capabilities">What we do <i>03</i></Link>
        <Link href="#approach">How we work <i>04</i></Link>
        <Link href="#founder">Who leads it <i>05</i></Link>
        <Link href="#fit">Is it a fit? <i>06</i></Link>
      </nav>

      <section className="about-clarity-proof" id="proof" aria-labelledby="about-proof-title">
        <Reveal className="about-clarity-proof-heading">
          <div><p className="eyebrow eyebrow-dark">Real-world trust signals</p><h2 id="about-proof-title">Specific outcomes.<br /><em>Reported by clients.</em></h2></div>
          <div><p>These results come from direct client feedback. They show the commercial and practical difference the work made without presenting every project as identical.</p><Link href="/work">Explore documented work <span aria-hidden="true">→</span></Link></div>
        </Reveal>
        <div className="about-clarity-proof-grid">
          {reportedOutcomes.map((outcome, index) => (
            <Reveal key={`${outcome.value}-${outcome.title}`} className={index === 0 ? 'about-clarity-proof-card about-clarity-proof-card-featured' : 'about-clarity-proof-card'}>
              <small>Client reported</small>
              <strong>{outcome.value}</strong>
              <h3>{outcome.title}</h3>
              <p>{outcome.copy}</p>
              <Link href={outcome.href}>{outcome.source} <span aria-hidden="true">↗</span></Link>
            </Reveal>
          ))}
        </div>
        <div className="about-clarity-proof-context" aria-label="Kraftt work at a glance">
          <p>Work at a glance</p>
          {trustNumbers.map(([number, label]) => (
            <div key={label}><strong>{number}</strong><span>{label}</span></div>
          ))}
        </div>
      </section>

      {/* <section className="about-clarity-belief" id="why-kraftt">
        <Reveal className="about-clarity-belief-heading" direction="scale">
          <p className="eyebrow eyebrow-dark">Why Kraftt exists</p>
          <h2>Close the gap between<br />the business and its presence.</h2>
          <p>Good businesses often look fragmented online. Identity says one thing, the website says another and internal systems create friction behind the scenes.</p>
        </Reveal>

        <div className="about-clarity-gap-grid">
          <Reveal className="about-clarity-gap-card">
            <span>01 · The gap</span>
            <h3>Real credibility.<br />Unclear online.</h3>
            <p>The business may already be trusted offline, but prospects cannot quickly understand the offer, proof or reason to choose it.</p>
          </Reveal>
          <Reveal className="about-clarity-gap-card about-clarity-gap-card-dark">
            <span>02 · The aim</span>
            <h3>One presence.<br />Built to be chosen.</h3>
            <p>Brand, website, content and systems work together so the digital experience feels as credible as the business itself.</p>
          </Reveal>
        </div>
      </section> */}

      <section className="about-clarity-capabilities" id="capabilities" aria-labelledby="about-capabilities-title">
        <Reveal className="about-clarity-section-intro">
          <div>
            <p className="eyebrow eyebrow-dark">What Kraftt brings together · 01—04</p>
            <h2 id="about-capabilities-title">The parts of your presence<br /><em>should work as one.</em></h2>
          </div>
          <div>
            <p>Kraftt can solve one focused need or connect several services into a clearer digital system.</p>
            <Link href="/services">Browse all services <span aria-hidden="true">→</span></Link>
          </div>
        </Reveal>
        <div className="about-clarity-capability-grid">
          {capabilityGroups.map((group, index) => (
            <Reveal key={group.title} className={index === 1 ? 'about-clarity-capability-card about-clarity-capability-card-featured' : 'about-clarity-capability-card'}>
              <div><span>{group.number}</span><i aria-hidden="true">{group.icon}</i></div>
              <h3>{group.title}</h3>
              <p>{group.copy}</p>
              <Link href={group.href}>{group.linkLabel} <span aria-hidden="true">↗</span></Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="about-clarity-approach" id="approach" aria-labelledby="about-approach-title">
        <Reveal className="about-clarity-approach-heading" direction="scale">
          <div>
            <p className="eyebrow">A visible working path</p>
            <h2 id="about-approach-title">Clarity before commitment.<br /><em>Visibility during delivery.</em></h2>
          </div>
          <div>
            <p>Every engagement follows the same principle: make the next decision understandable before asking you to take it.</p>
            <Link href="/process">Explore the full process <span aria-hidden="true">→</span></Link>
          </div>
        </Reveal>
        <div className="about-clarity-approach-grid">
          {workingSteps.map(([number, title, copy], index) => (
            <Reveal key={title} className={index === 0 ? 'about-clarity-approach-step about-clarity-approach-step-first' : 'about-clarity-approach-step'}>
              <div><span>{number}</span><small>{index === workingSteps.length - 1 ? 'Deliver' : 'Continue'} →</small></div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </Reveal>
          ))}
        </div>
        <div className="about-clarity-control-strip" aria-label="What stays clear while working with Kraftt">
          <strong>You stay in control.</strong>
          <span>✓ Scope before commitment</span>
          <span>✓ Costs and terms in writing</span>
          <span>✓ Approval before finalisation</span>
        </div>
      </section>

      {/* <section className="about-clarity-founder" id="founder">
        <Reveal className="about-clarity-founder-mark" direction="left">
          <span>K</span>
          <small>Founder-led<br />since day one</small>
        </Reveal>
        <Reveal className="about-clarity-founder-copy" direction="right">
          <p className="eyebrow">Accountability, not layers</p>
          <h2>One lead stays close to every important decision.</h2>
          <p>Ketan Goyal leads the direction and reviews the work before delivery. He stays close to the business context, recommendation and final result.</p>
          <div>
            <span>Direct access</span><span>Documented decisions</span><span>Research-led direction</span>
          </div>
          <Link href="/work/ketan-goyal">Read the founder project note <span aria-hidden="true">↗</span></Link>
        </Reveal>
      </section> */}

      <section className="about-clarity-principles">
        <Reveal className="about-clarity-principles-heading">
          <p className="eyebrow eyebrow-dark">Operating principles · 01—04</p>
          <h2>Clear thinking.<br /><em>Calm execution.</em></h2>
          <p>The work stays useful when decisions are researched, connected and easy to explain.</p>
        </Reveal>
        <div className="about-clarity-principles-grid">
          {principles.map(([icon, title, copy], index) => (
            <Reveal key={title}>
              <div><span>0{index + 1}</span><i aria-hidden="true">{icon}</i></div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* <section className="about-clarity-fit" id="fit">
        <Reveal className="about-clarity-fit-heading" direction="scale">
          <p className="eyebrow eyebrow-dark">Is Kraftt a good fit?</p>
          <h2>The working relationship matters.</h2>
          <p>The best engagements begin with aligned expectations—not a forced yes.</p>
        </Reveal>
        <div className="about-clarity-fit-grid">
          <Reveal className="about-clarity-fit-card about-clarity-fit-card-good">
            <span>✓</span><h3>A good fit if…</h3>
            <ul>{goodFit.map((item) => <li key={item}>{item}</li>)}</ul>
            <Link href="/contact">Request a Free Introductory Call <span aria-hidden="true">→</span></Link>
          </Reveal>
          <Reveal className="about-clarity-fit-card">
            <span>→</span><h3>What we need from you</h3>
            <ul>{poorFit.map((item) => <li key={item}>{item}</li>)}</ul>
            <Link href="/contact">Ask before deciding <span aria-hidden="true">↗</span></Link>
          </Reveal>
        </div>
      </section> */}

      <section className="about-clarity-final">
        <div>
          <p className="eyebrow">A clearer starting point</p>
          <h2>Understand the gap.<br /><em>Then choose the work.</em></h2>
        </div>
        <div>
          <p>Begin with a free introductory call. A paid Digital Presence Audit is available when deeper research would help.</p>
          <div className="about-clarity-actions about-clarity-actions-inverse">
            <Link href="/contact">Request a Free Introductory Call <span aria-hidden="true">→</span></Link>
            <Link href="/process">Explore the process <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
