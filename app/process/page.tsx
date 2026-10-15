import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Footer } from '../components/Footer';
import { JsonLd } from '../components/JsonLd';
import { CurrencySymbol, RegionalPriceCopy } from '../components/PricingCurrencyProvider';
import { Reveal } from '../components/Reveal';
import { SiteHeader } from '../components/SiteHeader';
import { createPageMetadata, createPageSchema } from '../data/seo';

const pageTitle = 'Our Process | Discovery, Quote & Project Start | Kraftt Digital';
const pageDescription = 'See the path from a free introductory call and optional paid audit through discovery, terms and quote, proposal, agreement and project start.';

export const metadata: Metadata = createPageMetadata({ title: pageTitle, description: pageDescription, path: '/process', label: 'Our process' });

const phases = [
  { number: '01', title: 'Introduce', detail: 'Free first call' },
  { number: '02', title: 'Optional audit', detail: 'Paid, if useful' },
  { number: '03', title: 'Discover', detail: 'Clarify priorities' },
  { number: '04', title: 'Agree & start', detail: 'Written steps before work' },
];

const stages = [
  { icon: '☎', phase: 'Introduce', status: 'Free', title: 'Introductory call', summary: '15 minutes to understand your business and what it needs.', outcome: 'A clear next conversation and the information needed to assess the work.' },
  { icon: '⌕', phase: 'Audit', status: 'Optional, paid', title: 'Audit', summary: 'A written review that helps us find the best service for your business. You can skip it.', outcome: 'Research and priorities to guide the next decision, if you choose this step.' },
  { icon: '◎', phase: 'Discover', status: 'Direction', title: 'Discovery', summary: 'We go deeper into your goals, audience and constraints.', outcome: 'A practical direction and an understanding of what should be addressed now.' },
  { icon: '≡', phase: 'Quote', status: 'Written', title: 'Terms and quote', summary: 'You see scope, terms and price first.', outcome: 'A clear scope and commercial terms to review before making a commitment.' },
  { icon: '□', phase: 'Plan', status: 'Written', title: 'Proposal', summary: 'A plan with deliverables and a timeline.', outcome: 'A delivery plan to review before work starts.' },
  { icon: '✓', phase: 'Agree', status: 'Written', title: 'Agreement', summary: 'We agree in writing, then work begins.', outcome: 'A shared commitment that defines how work will proceed.' },
  { icon: '↗', phase: 'Start', status: 'After agreement', title: 'Project starts', summary: 'Access and materials are shared, the team begins production and agreed milestones guide reviews.', outcome: 'A working project underway with clear responsibilities and next checkpoints.' },
];

const clarityPoints = [
  ['◎', 'The problem', 'What is holding the business back and why it matters.'],
  ['□', 'The scope', 'Exactly what Kraftt will deliver—and what sits outside it.'],
  ['₹', 'The investment', 'Cost breakup, payment stages and optional additions.'],
  ['⌁', 'The plan', 'Timeline, responsibilities, inputs and next steps.'],
];

export default function ProcessPage() {
  return (
    <main className="process-clarity-page">
      <JsonLd data={createPageSchema({ name: pageTitle, description: pageDescription, path: '/process', breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Process', path: '/process' }] })} />
      <SiteHeader />

      <section className="process-clarity-hero" aria-labelledby="process-page-title">
        <div className="process-clarity-hero-inner">
          <Reveal className="process-clarity-hero-copy" direction="left">
            <p className="eyebrow eyebrow-dark">Our process · 01—{String(stages.length).padStart(2, '0')}</p>
            <h1 id="process-page-title">Clarity before<br /><em>commitment.</em></h1>
            <p>Start with a free conversation. An optional paid audit can follow before discovery. We then clarify the requirement, explain the recommended scope and document the terms before delivery begins.</p>
            <div className="process-clarity-actions">
              <Link href="/contact">Request a free call <span aria-hidden="true">→</span></Link>
              <Link href="/services">View services <span aria-hidden="true">↗</span></Link>
            </div>
          </Reveal>

          <Reveal className="process-clarity-audit" direction="right">
            <div className="process-clarity-audit-art">
              <span>Optional deeper review</span>
              <Image src="/01-audit.png" alt="Kraftt business audit and research illustration" fill priority sizes="(max-width: 900px) 90vw, 40vw" />
            </div>
            <div className="process-clarity-audit-copy">
              <div><span>Separate paid option</span><strong><RegionalPriceCopy>₹999</RegionalPriceCopy></strong></div>
              <h2>Digital Presence Audit</h2>
              <p>Business · category · competitors · systems · opportunities</p>
              <small>Useful when deeper research would help; not required for every project.</small>
              <Link href="/audit">See what the audit covers <span aria-hidden="true">↗</span></Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="process-clarity-phases" aria-label={`${phases.length} phases of the Kraftt process`}>
        <div className="process-clarity-phases-inner">
          {phases.map((phase) => (
            <div key={phase.number}>
              <span>{phase.number}</span>
              <p><strong>{phase.title}</strong><small>{phase.detail}</small></p>
              <i aria-hidden="true">→</i>
            </div>
          ))}
        </div>
      </section>

      <section className="process-clarity-body">
        <div className="process-clarity-body-inner">
          <aside className="process-clarity-guide">
            <p className="eyebrow eyebrow-dark">The complete path</p>
            <h2>{stages.length} steps.<br />No hidden jumps.</h2>
            <p>The free introduction comes first. Any optional paid research and the later project commitment are labelled clearly.</p>
            <div>
              <span><b>Free</b> introductory call</span>
              <span><b><RegionalPriceCopy>₹999</RegionalPriceCopy></b> optional paid audit</span>
              <span><b>Written</b> scope and terms</span>
            </div>
            <Link href="/contact">Request a free call <span aria-hidden="true">→</span></Link>
          </aside>

          <div className="process-clarity-steps">
            {stages.map((stage, index) => (
              <Reveal className="process-clarity-step" key={stage.title}>
                <div className="process-clarity-step-index"><span>{String(index + 1).padStart(2, '0')}</span><i aria-hidden="true">{stage.icon === '₹' ? <CurrencySymbol /> : stage.icon}</i></div>
                <div className="process-clarity-step-copy">
                  <p><span>{stage.phase}</span><strong><RegionalPriceCopy>{stage.status}</RegionalPriceCopy></strong></p>
                  <h3>{stage.title}</h3>
                  <p>{stage.summary}</p>
                </div>
                <div className="process-clarity-step-outcome">
                  <span>You leave with</span>
                  <p>{stage.outcome}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="process-clarity-proof">
        <Reveal className="process-clarity-proof-heading" direction="scale">
          <p className="eyebrow eyebrow-dark">Before work begins</p>
          <h2>You know what you are choosing.</h2>
          <p>Kraftt pricing reflects the research, analysis, professional production and delivery required for the agreed outcome.</p>
        </Reveal>
        <div className="process-clarity-proof-grid">
          {clarityPoints.map(([icon, title, copy]) => (
            <Reveal key={title}><span>{icon === '₹' ? <CurrencySymbol /> : icon}</span><h3>{title}</h3><p>{copy}</p></Reveal>
          ))}
        </div>
      </section>

      <section className="process-clarity-final">
        <div>
          <p className="eyebrow">Ready when the problem is.</p>
          <h2>Start with clarity.<br /><em>Not a sales pitch.</em></h2>
        </div>
        <div>
          <p><RegionalPriceCopy>The free introductory call helps us understand the need. A paid audit is available if a researched review would help.</RegionalPriceCopy></p>
          <div className="process-clarity-actions process-clarity-actions-inverse">
            <Link href="/contact">Request a free call <span aria-hidden="true">→</span></Link>
            <Link href="/contact">Ask a question <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
