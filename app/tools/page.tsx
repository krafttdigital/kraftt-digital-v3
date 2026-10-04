import type { Metadata } from 'next';
import { JsonLd } from '../components/JsonLd';
import { createPageMetadata, createPageSchema } from '../data/seo';
import { Button, ToolCard, ToolPage } from './components/ToolSuite';
import { tools } from './data';

const pageTitle = 'Free Business & Digital Growth Tools | Kraftt Digital';
const pageDescription = 'Practical calculators and generators to help Indian businesses price projects, plan digital investment, and make clearer decisions.';

export const metadata: Metadata = createPageMetadata({ title: pageTitle, description: pageDescription, path: '/tools', label: 'Free business tools' });

export default function ToolsPage() {
  const growthTools = tools.filter((tool) => tool.group === 'Digital Growth Tools');
  const utilityTools = tools.filter((tool) => tool.group === 'Business Utility Tools');
  return (
    <ToolPage className="tool-hub">
      <JsonLd data={createPageSchema({ name: pageTitle, description: pageDescription, path: '/tools', breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Tools', path: '/tools' }] })} />
      <header className="tool-hub-hero">
        <div className="tool-hub-hero-copy">
          <p className="tool-eyebrow">Kraftt utility desk · 07 free tools</p>
          <h1>Useful answers.<br /><em>Without the guesswork.</em></h1>
        </div>
        <div className="tool-hub-hero-detail">
          <p>{pageDescription}</p>
          <div className="tool-hub-actions">
            <Button href="/tools/digital-presence-score">Check your digital presence <span aria-hidden="true">→</span></Button>
            <Button href="/contact" variant="secondary">Request a Free Introductory Call <span aria-hidden="true">↗</span></Button>
          </div>
        </div>
      </header>

      <section className="tool-hub-proof" aria-label="Tools suite benefits">
        <p>Built for useful decisions</p>
        <div><strong>07</strong><span>Free tools</span></div>
        <div><strong>0</strong><span>Logins required</span></div>
        <div><strong>Live</strong><span>Results in place</span></div>
        <div><strong>Clear</strong><span>Results before enquiry</span></div>
      </section>

      <main>
        <section className="tool-group tool-group-primary" aria-labelledby="growth-tools-title">
          <div className="tool-group-heading"><span>01</span><div><p className="tool-eyebrow">Plan before you spend</p><h2 id="growth-tools-title">Digital growth,<br /><em>made measurable.</em></h2><p>Check visibility, estimate costs and model likely returns before choosing the next step.</p></div></div>
          <div className="tool-card-grid">{growthTools.map((tool, index) => <ToolCard tool={tool} index={index} featured={index === 0} key={tool.slug} />)}</div>
        </section>
        <section className="tool-group tool-group-secondary" aria-labelledby="utility-tools-title">
          <div className="tool-group-heading"><span>02</span><div><p className="tool-eyebrow">Everyday business utility</p><h2 id="utility-tools-title">Simple tools for<br /><em>real business work.</em></h2><p>Calculate GST or prepare an invoice quickly—without accounts, sign-ups or stored data.</p></div></div>
          <div className="tool-card-grid tool-card-grid-secondary">{utilityTools.map((tool, index) => <ToolCard tool={tool} index={index} key={tool.slug} />)}</div>
        </section>
      </main>
    </ToolPage>
  );
}
