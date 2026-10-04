import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Clock3, Layers3, Minus, X } from 'lucide-react';
import { Footer } from '../../../components/Footer';
import { JsonLd } from '../../../components/JsonLd';
import { RegionalPriceCopy } from '../../../components/PricingCurrencyProvider';
import { Reveal } from '../../../components/Reveal';
import { SiteHeader } from '../../../components/SiteHeader';
import { bundleBySlug, bundles } from '../../../data/bundles';
import { projectBySlug } from '../../../data/projects';
import { createPageMetadata, createPageSchema, faqSchema, serviceSchema } from '../../../data/seo';
import { whatsappUrl } from '../../../data/site';
import { PageFaq } from '@/components/ui/faq-6';

const projectProofBanners: Record<string, { src: string; alt: string }> = {
  'mittal-architect': { src: '/mittal-banner.png', alt: 'Mittal Architect website, project portfolio and search visibility case study collage' },
  'shree-hari-spintex': { src: '/shsl-banner.png', alt: 'Shree Hari Spintex industrial website and search presence case study collage' },
  'kiraq-jewellery': { src: '/kiraq-banner.png', alt: 'Kiraq Jewellery brand, storefront and product management case study collage' },
  'elixir-beverages': { src: '/elixir-banner.png', alt: 'Elixir Beverages identity and pre-launch website case study collage' },
};

const bundleProcess = [
  { label: 'Introduce', title: 'Introductory call', detail: 'Share what you want to improve. We clarify the immediate need and the best first step.', badge: 'Free first call' },
  { label: 'Discover', title: 'Discovery and direction', detail: 'We clarify the audience, priorities and connected scope. A paid audit is recommended only when deeper research will help.', badge: 'Audit optional' },
  { label: 'Quote', title: 'Quote and terms', detail: 'You receive the deliverables, timeline, fees, required inputs and exclusions in writing.', badge: 'Everything in writing' },
  { label: 'Agree', title: 'Proposal and agreement', detail: 'Questions are answered and the scope, payment stages and review points are finalised together.', badge: 'Your approval' },
  { label: 'Start', title: 'Project starts', detail: 'Once approved and access is shared, work begins with visible milestones and regular updates.', badge: 'Visible milestones' },
];

export const dynamic = 'force-dynamic';
export const dynamicParams = false;

export function generateStaticParams() {
  return bundles.map((bundle) => ({ slug: bundle.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const bundle = bundleBySlug(slug);
  if (!bundle) return {};
  return createPageMetadata({
    title: `${bundle.name} Bundle | Kraftt Digital`,
    description: bundle.headline,
    path: `/services/bundles/${bundle.slug}`,
    label: 'Connected service bundle',
  });
}

export default async function BundlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bundle = bundleBySlug(slug);
  if (!bundle) notFound();
  const relatedProject = projectBySlug(bundle.relatedProjectSlug);
  const relatedBanner = relatedProject ? projectProofBanners[relatedProject.slug] : undefined;
  const bundleNumber = bundles.findIndex((item) => item.slug === bundle.slug) + 1;
  const namedInclusionCount = bundle.inclusions.reduce((total, inclusion) => total + inclusion.items.length, 0);
  const bundleMessage = whatsappUrl(`Hi Kraftt, I would like to request a free introductory call about the ${bundle.name} bundle.`);
  const bundleFaqs = [
    { question: `What is included in the ${bundle.name} bundle?`, answer: `The bundle connects ${bundle.deliverables.join(', ')}. The detailed inclusions, responsibilities and review stages are confirmed in the written proposal.` },
    { question: `How much does the ${bundle.name} bundle cost?`, answer: `The published bundle investment is ${bundle.price}. Third-party subscriptions, platform charges, hosting and advertising budgets remain separate unless the proposal states otherwise.` },
    { question: 'How long does the bundle engagement take?', answer: `${bundle.timeline}. Exact milestones depend on receiving the required information, access and approvals on time.` },
    { question: 'Can the ongoing services continue after the included period?', answer: bundle.continuation },
    { question: 'How do I know whether this bundle is the right fit?', answer: `${bundle.idealClient} It is designed to solve this situation: ${bundle.problemSolved} A free introductory call can confirm whether the bundle or one focused service is the clearer route.` },
  ];

  return (
    <main className="bundle-detail-v3">
      <JsonLd data={createPageSchema({
        name: `${bundle.name} Bundle | Kraftt Digital`,
        description: bundle.headline,
        path: `/services/bundles/${bundle.slug}`,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          { name: bundle.name, path: `/services/bundles/${bundle.slug}` },
        ],
        entities: [serviceSchema({ name: bundle.name, description: bundle.problemSolved, path: `/services/bundles/${bundle.slug}` }), faqSchema(bundleFaqs, `/services/bundles/${bundle.slug}`)],
      })} />
      <SiteHeader />

      <section className="bundle-detail-hero" aria-labelledby="bundle-detail-title">
        <div className="bundle-detail-hero-inner">
          <Reveal className="bundle-detail-kicker" direction="left">
            <Link href="/services"><ArrowLeft size={15} /> All services</Link>
            <span>Bundle {String(bundleNumber).padStart(2, '0')} / {String(bundles.length).padStart(2, '0')}</span>
          </Reveal>

          <div className="bundle-detail-hero-grid">
            <Reveal className="bundle-detail-hero-copy" direction="left">
              <p className="eyebrow">Connected service bundle</p>
              <h1 id="bundle-detail-title">{bundle.name}</h1>
              <p>{bundle.headline}</p>
              <div className="bundle-detail-actions">
                <Link href="#included">See what is included <span aria-hidden="true">↓</span></Link>
                <a href={bundleMessage}>Discuss this bundle <ArrowRight size={15} /></a>
              </div>
            </Reveal>

            <Reveal className="bundle-detail-overview" direction="right">
              <div className="bundle-detail-overview-heading">
                <span>At a glance</span>
                <Layers3 size={19} strokeWidth={1.5} />
              </div>
              <dl>
                <div><dt>Investment</dt><dd><RegionalPriceCopy>{bundle.price}</RegionalPriceCopy></dd></div>
                <div><dt>Included period</dt><dd>{bundle.timeline}</dd></div>
                <div><dt>Connected scopes</dt><dd>{String(bundle.deliverables.length).padStart(2, '0')}</dd></div>
              </dl>
              <p>Final deliverables, timeline and payment schedule are confirmed in your proposal.</p>
            </Reveal>
          </div>
        </div>
      </section>

      <nav className="service-simple-journey bundle-detail-journey" aria-label="Bundle page sections">
        <div className="service-simple-shell"><span>Explore this bundle</span><a href="#overview">01 · Overview</a><a href="#included">02 · Included scope</a><a href="#process">03 · Process</a><a href="#bundle-faq">04 · FAQs</a></div>
      </nav>

      <section className="bundle-detail-context" id="overview">
        <div className="bundle-detail-section-heading">
          <Reveal direction="left">
            <p className="eyebrow eyebrow-dark">Understand the fit</p>
            <h2>Choose by business fit.<br /><em>Then check readiness.</em></h2>
          </Reveal>
          <Reveal direction="right">
            <p>{bundle.idealClient}</p>
          </Reveal>
        </div>

        <div className="bundle-detail-match-grid">
          <Reveal className="bundle-detail-match-card is-match">
            <div className="bundle-detail-match-heading">
              <span><Check size={18} strokeWidth={1.8} /></span>
              <div><p className="eyebrow eyebrow-dark">Best match</p><h3>Built for businesses like these.</h3></div>
            </div>
            <ul>
              {bundle.bestFor.map((item) => <li key={item}><Check size={15} strokeWidth={1.8} /><span>{item}</span></li>)}
            </ul>
          </Reveal>
          <Reveal className="bundle-detail-match-card is-mismatch">
            <div className="bundle-detail-match-heading">
              <span><X size={18} strokeWidth={1.8} /></span>
              <div><p className="eyebrow eyebrow-dark">Not the right fit</p><h3>Choose a focused service instead.</h3></div>
            </div>
            <ul>
              {bundle.notFor.map((item) => <li key={item}><X size={15} strokeWidth={1.8} /><span>{item}</span></li>)}
            </ul>
          </Reveal>
        </div>

        <Reveal className="bundle-detail-context-note">
          <span>What this bundle solves</span>
          <p>{bundle.problemSolved}</p>
        </Reveal>
      </section>

      <section className="bundle-detail-scope" id="included">
        <div className="bundle-detail-scope-inner">
          <Reveal className="bundle-detail-scope-heading">
            <div className="bundle-detail-scope-kicker">
              <p className="eyebrow">What is included</p>
              <dl className="bundle-detail-scope-value" aria-label="Bundle inclusion summary">
                <div><dt>{String(bundle.inclusions.length).padStart(2, '0')}</dt><dd>Connected packages</dd></div>
                <div><dt>{String(namedInclusionCount).padStart(2, '0')}</dt><dd>Named inclusions</dd></div>
              </dl>
            </div>
            <div className="bundle-detail-scope-title">
              <h2>More built in.<br /><em>Less left to coordinate.</em></h2>
            </div>
            <div className="bundle-detail-scope-intro">
              <p>The bundle price covers the listed one-time deliverables and the stated months of ongoing work. Continuing a monthly service afterwards is optional and priced separately.</p>
              <Link href="/process">Explore how Kraftt works <ArrowRight size={15} /></Link>
            </div>
          </Reveal>

          <p className="bundle-detail-scope-swipe" aria-hidden="true">Swipe through the included packages <ArrowRight size={14} /></p>
          <div className={`bundle-detail-deliverables is-${bundle.inclusions.length}`}>
            {bundle.inclusions.map((inclusion, index) => (
              <Reveal className="bundle-detail-deliverable" key={inclusion.title}>
                <div className="bundle-detail-deliverable-number">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <small>{String(inclusion.items.length).padStart(2, '0')} inclusions</small>
                </div>
                <div className="bundle-detail-deliverable-copy">
                  <h3>{inclusion.title}</h3>
                  <p>{inclusion.summary}</p>
                </div>
                <ul>
                  {inclusion.items.map((item) => <li key={item}><Check size={13} strokeWidth={1.8} /><span>{item}</span></li>)}
                </ul>
                <span className="bundle-detail-deliverable-status"><Check size={13} strokeWidth={1.8} /> Included in this bundle</span>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="bundle-detail-exclusions">
          <div>
            <Minus size={18} />
            <div><p className="eyebrow">Scope boundaries</p><h3>Not included by default</h3></div>
          </div>
          <ul>{bundle.notIncluded.map((item) => <li key={item}>{item}</li>)}</ul>
          <p><RegionalPriceCopy>{bundle.continuation}</RegionalPriceCopy> {bundle.scopeNote}</p>
        </Reveal>
      </section>

      <section className="bundle-detail-fit" id="fit">
        <Reveal className="bundle-detail-fit-heading">
          <div>
            <p className="eyebrow eyebrow-dark">Good fit check</p>
            <h2>Three signs this bundle is the right fit.</h2>
          </div>
          <p>If these statements match where your business is now, the bundle keeps the work connected and reduces unnecessary handoffs.</p>
        </Reveal>
        <div className="bundle-detail-fit-board">
          <Reveal className="bundle-detail-fit-score" direction="left">
            <span className="bundle-detail-fit-score-icon"><Check size={22} strokeWidth={1.6} /></span>
            <div><strong>03</strong><small>signals of a strong fit</small></div>
            <p>When all three are true, one coordinated bundle is usually clearer than managing separate services.</p>
          </Reveal>
          <div className="bundle-detail-fit-grid">
            {bundle.goodFitWhen.map((item, index) => (
              <Reveal key={item}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <span className="bundle-detail-fit-check"><Check size={16} strokeWidth={1.8} /></span>
                <p>{item}</p>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal className="bundle-detail-fit-cta">
          <div><Clock3 size={18} /><p>Unsure whether a bundle or one service is the right scope?</p></div>
          <Link href="/contact">Request a Free Introductory Call <ArrowRight size={15} /></Link>
        </Reveal>
      </section>

      <section className="service-simple-process bundle-detail-process" id="process" aria-labelledby="bundle-process-title">
        <div className="service-simple-shell">
          <Reveal className="service-simple-section-head service-simple-process-head"><div><p className="eyebrow eyebrow-dark">A visible delivery path</p><h2 id="bundle-process-title">Clear steps.<br />Visible decisions.</h2></div><div className="service-simple-process-intro"><span>05 clear stages</span><p>You see the scope, terms and approval points before the connected work begins.</p></div></Reveal>
          <div className="service-simple-process-flow service-simple-process-flow-5">{bundleProcess.map((step, index) => <Reveal className={`service-simple-process-step ${index === 0 ? 'is-first' : ''} ${index === bundleProcess.length - 1 ? 'is-last' : ''}`} key={step.title} delay={index * .035}>
            <div><span>{String(index + 1).padStart(2, '0')}</span><small>{step.label}</small><i>{index === bundleProcess.length - 1 ? '✓' : '→'}</i></div>
            <h3>{step.title}</h3><p>{step.detail}</p><strong>{step.badge}</strong>
          </Reveal>)}</div>
          <Reveal className="service-simple-process-assurances"><h3>You stay in control.</h3><div><p><Check size={14} /> Clear scope before commitment</p><p><Check size={14} /> Costs and terms made visible</p><p><Check size={14} /> Your approval before finalisation</p></div></Reveal>
        </div>
      </section>

      <section className="page-faq-section" id="bundle-faq" aria-labelledby="bundle-faq-title"><div className="page-faq-inner">
        <Reveal className="page-faq-heading" direction="left"><div><p className="eyebrow eyebrow-dark">Before you decide · 05 focused answers</p><h2 id="bundle-faq-title">Questions before you<br /><em>choose this bundle.</em></h2></div><div><p>Clear answers about scope, investment, timing and continuation.</p><span className="page-faq-actions"><a href={bundleMessage}>Discuss this bundle <ArrowRight size={15} /></a><Link href="/audit">Request the ₹999 audit <ArrowUpRight size={15} /></Link></span></div></Reveal>
        <PageFaq title={`${bundle.name} bundle questions`} items={bundleFaqs} categoryTitles={['Bundle scope', 'Delivery and continuation']} />
      </div></section>

      {relatedProject && (
        <section className="bundle-detail-related" id="proof">
          <div className="bundle-detail-related-heading">
            <Reveal direction="left">
              <p className="eyebrow eyebrow-dark">Related proof</p>
              <h2>See connected work<br /><em>in practice.</em></h2>
            </Reveal>
            <Reveal direction="right">
              <p>A real engagement showing how multiple digital surfaces can support one clearer business presence.</p>
              <Link href={`/work/${relatedProject.slug}`}>Explore the {relatedProject.projectType.toLowerCase()} <ArrowRight size={15} /></Link>
            </Reveal>
          </div>
          <Reveal className="bundle-detail-proof-feature">
            <Link href={`/work/${relatedProject.slug}`} aria-label={`View ${relatedProject.name} ${relatedProject.projectType.toLowerCase()}`}>
              <div className="bundle-detail-proof-media">
                {relatedBanner ? (
                  <Image
                    src={relatedBanner.src}
                    alt={relatedBanner.alt}
                    fill
                    sizes="(max-width: 960px) 100vw, 68vw"
                  />
                ) : relatedProject.hero ? (
                  <Image
                    src={relatedProject.hero.src}
                    alt={relatedProject.hero.alt}
                    fill
                    sizes="(max-width: 960px) 100vw, 68vw"
                  />
                ) : (
                  <div><span>{relatedProject.industry}</span><strong>{relatedProject.name}</strong></div>
                )}
                <span>{relatedProject.projectType}</span>
              </div>

              <div className="bundle-detail-proof-copy">
                <div><p>{relatedProject.industry}</p><ArrowUpRight size={19} /></div>
                <h3>{relatedProject.name}</h3>
                <p>{relatedProject.context}</p>
                <dl><dt>Engagement</dt><dd>{relatedProject.package}</dd></dl>
                <div className="bundle-detail-proof-metrics">
                  {relatedProject.metrics.slice(0, 2).map((metric) => (
                    <span key={`${metric.value}-${metric.label}`}>
                      <strong>{metric.value}</strong>
                      <small>{metric.label}</small>
                    </span>
                  ))}
                </div>
                <span className="bundle-detail-proof-link">View complete project <ArrowRight size={15} /></span>
              </div>
            </Link>
          </Reveal>
        </section>
      )}

      <section className="bundle-detail-final">
        <Reveal direction="left">
          <p className="eyebrow">Choose the next clear step</p>
          <h2>Define the scope.<br /><em>Then build as one.</em></h2>
        </Reveal>
        <Reveal direction="right">
          <p>Discuss the listed scope, timing, client inputs and optional monthly continuation. A paid audit is available separately when deeper research would help.</p>
          <div>
            <a href={bundleMessage}>Discuss This Bundle <ArrowRight size={15} /></a>
            <Link href="/audit">Explore the Paid Audit <ArrowRight size={15} /></Link>
          </div>
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}
