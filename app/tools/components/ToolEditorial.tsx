import Link from 'next/link';
import { PageFaq } from '../../../components/ui/faq-6';
import { formatRegionalAmount, pricing } from '../../data/pricing';
import { toolGuides } from '../editorial';

const websitePrices = [
  { name: 'Starter', scope: 'One-page informational website', price: pricing.websiteCalculator.starter.INR },
  { name: 'Business', scope: '2–5 page informational website', price: pricing.websiteCalculator.business.INR },
  { name: 'Growth', scope: '6–10+ page informational website', price: pricing.websiteCalculator.growth.INR },
  { name: 'Launch Store', scope: 'One core page or section in a store brief', price: pricing.websiteCalculator.launchStore.INR },
  { name: 'Growth Store', scope: '2–5 core pages or sections in a store brief', price: pricing.websiteCalculator.growthStore.INR },
  { name: 'Complete Store', scope: '6–10+ core pages or sections in a store brief', price: pricing.websiteCalculator.completeStore.INR },
] as const;

export function ToolEditorial({ slug }: { slug: string }) {
  const guide = toolGuides[slug];
  if (!guide) return null;
  const isWebsiteCost = slug === 'website-cost-calculator';

  return <>
    <section className="tool-guide-overview" aria-labelledby="tool-guide-title">
      <div className="tool-guide-inner">
        <div className="tool-guide-heading">
          <p className="tool-eyebrow">{guide.eyebrow}</p>
          <h2 id="tool-guide-title">{guide.headline}</h2>
          <p>{guide.introduction}</p>
        </div>
        <div className="tool-guide-context"><span>What to know first</span><p>{guide.context}</p></div>

        {isWebsiteCost && <div className="tool-guide-prices" aria-labelledby="tool-guide-prices-title">
          <div className="tool-guide-prices-intro"><div><p className="tool-eyebrow">Kraftt starting prices · India</p><h3 id="tool-guide-prices-title">Website and store package prices</h3></div><p>Published starting prices in INR. A written proposal confirms the deliverables and exact quote.</p></div>
          <div className="tool-guide-table-scroll"><table><thead><tr><th scope="col">Package</th><th scope="col">Calculator brief</th><th scope="col">Starting price</th></tr></thead><tbody>
            {websitePrices.map(row => <tr key={row.name}><th scope="row">{row.name}</th><td>{row.scope}</td><td>From {formatRegionalAmount(row.price, 'INR')}</td></tr>)}
          </tbody></table></div>
          <p className="tool-guide-table-note">A site’s page count is a tier-selection input, not a per-page fee. <Link href="/services/web-design-development">Explore website services ↗</Link></p>
        </div>}
      </div>
    </section>

    <section className="tool-guide-method" aria-labelledby="tool-guide-method-title">
      <div className="tool-guide-inner">
        <div className="tool-guide-section-heading"><span>01 / Method</span><div><p className="tool-eyebrow">Behind the result</p><h2 id="tool-guide-method-title">{guide.methodTitle}</h2></div></div>
        <div className="tool-guide-steps">{guide.steps.map((step, index) => <article key={step.title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{step.title}</h3><p>{step.detail}</p></article>)}</div>
        <aside className="tool-guide-example"><div><span>02 / Worked example</span><h3>{guide.exampleTitle}</h3></div><div><p>{guide.example}</p><small>{guide.exampleNote}</small></div></aside>
      </div>
    </section>

    <section className="tool-guide-faq" aria-labelledby="tool-guide-faq-title">
      <div className="tool-guide-inner">
        <div className="tool-guide-faq-heading"><div><p className="tool-eyebrow">Frequently asked questions</p><span>Before you decide</span></div><h2 id="tool-guide-faq-title">Clear answers.<br /><em>No guesswork.</em></h2><p>Understand the result, the assumptions and what a written scope still needs to confirm.</p></div>
        <PageFaq id={`faq-${slug}`} title={`${guide.eyebrow} questions`} items={guide.faqs} categoryTitles={['Understanding the result', 'Scope and next steps']} />
      </div>
    </section>
  </>;
}
