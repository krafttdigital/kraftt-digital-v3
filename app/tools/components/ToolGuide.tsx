import { PageFaq } from '../../../components/ui/faq-6';
import { services } from '../../data/services';
import { toolGuides } from '../guides';
import { ToolServiceCards } from './ToolServiceCards';

export function ToolGuide({ slug }: { slug: string }) {
  const guide = toolGuides[slug];
  if (!guide) return null;
  const related = guide.serviceSlugs.map((serviceSlug) => services.find((service) => service.slug === serviceSlug)).filter((service) => service !== undefined);

  return (
    <section className="tool-guide" aria-labelledby="tool-guide-title">
      <div className="tool-guide-heading">
        <p className="tool-eyebrow">Understand your result</p>
        <h2 id="tool-guide-title">What this tool tells you.</h2>
        <p>{guide.introduction}</p>
      </div>
      <div className="tool-guide-grid">
        <section className="tool-guide-panel" aria-labelledby="tool-use-title">
          <p className="tool-eyebrow">01 · How to use it</p>
          <h3 id="tool-use-title">From inputs to a decision</h3>
          <ol>{guide.steps.map((step) => <li key={step}>{step}</li>)}</ol>
        </section>
        <section className="tool-guide-panel" aria-labelledby="tool-method-title">
          <p className="tool-eyebrow">02 · Method</p>
          <h3 id="tool-method-title">How the result is calculated</h3>
          <ol>{guide.calculation.map((step) => <li key={step}>{step}</li>)}</ol>
        </section>
      </div>
      <p className="tool-guide-caveat"><strong>Keep in mind</strong> {guide.caveat}</p>
      <section className="tool-guide-services" aria-labelledby="tool-related-title">
        <div className="tool-guide-services-heading"><div><p className="tool-eyebrow">Current Kraftt services</p><h3 id="tool-related-title">Explore a relevant<br /><em>next step.</em></h3></div><p>Start with the service that fits the gap this tool highlights. Each page explains its published scope and starting price.</p></div>
        <ToolServiceCards services={related} />
      </section>
      <section className="tool-guide-faq" aria-labelledby="tool-faq-title">
        <div className="tool-guide-faq-heading"><div><p className="tool-eyebrow">Common questions</p><h3 id="tool-faq-title">Before you use<br /><em>the result.</em></h3></div><p>Short answers about what the tool shows, what it leaves out and how to decide on the next step.</p></div>
        <PageFaq id={`tool-faq-${slug}`} title="Questions about this tool" items={guide.faqs} categoryTitles={['Understanding the result', 'Using it well']} />
      </section>
    </section>
  );
}
