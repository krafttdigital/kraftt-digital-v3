import Link from 'next/link';
import { Check, Minus, MoveRight, PhoneCall } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RegionalPriceCopy } from '@/app/components/PricingCurrencyProvider';

export type ComparisonPlan = {
  name: string;
  eyebrow: string;
  description: string;
  price: string;
  timeline: string;
  href: string;
  featured?: boolean;
};

export type ComparisonRow = {
  label: string;
  values: Array<string | boolean>;
};

type PricingProps = {
  plans: ComparisonPlan[];
  rows: ComparisonRow[];
};

function FeatureValue({ value }: { value: string | boolean }) {
  if (value === true) return <Check aria-label="Included" size={18} strokeWidth={1.7} />;
  if (value === false) return <Minus aria-label="Not included" size={18} strokeWidth={1.7} />;
  return <span>{value}</span>;
}

function Pricing({ plans, rows }: PricingProps) {
  return (
    <section className="services-comparison" id="compare-bundles" aria-labelledby="bundle-comparison-title">
      <div className="services-comparison-heading">
        <Badge variant="outline">Bundle comparison</Badge>
        <h2 id="bundle-comparison-title">Compare the scope.<br /><em>Choose with clarity.</em></h2>
        <p>Four connected packages for common business stages. Every proposal confirms the final deliverables, exclusions and payment schedule.</p>
      </div>

      <div className="services-comparison-table" role="table" aria-label="Kraftt bundle comparison">
        <div className="services-comparison-corner" role="columnheader">
          <span>What is included</span>
          <small>India / international</small>
        </div>
        {plans.map((plan) => (
          <article className={plan.featured ? 'is-featured' : ''} key={plan.name} role="columnheader">
            <div>
              <p>{plan.eyebrow}</p>
              {plan.featured && <Badge>Most complete</Badge>}
            </div>
            <h3>{plan.name}</h3>
            <p>{plan.description}</p>
            <strong><RegionalPriceCopy>{plan.price}</RegionalPriceCopy></strong>
            <small>{plan.timeline}</small>
            <Button asChild variant={plan.featured ? 'default' : 'secondary'}>
              <Link href={plan.href}>View full scope <MoveRight size={15} /></Link>
            </Button>
          </article>
        ))}

        {rows.map((row) => (
          <div className="services-comparison-row" role="row" key={row.label}>
            <div role="rowheader">{row.label}</div>
            {row.values.map((value, index) => (
              <div className={plans[index]?.featured ? 'is-featured' : ''} role="cell" key={`${row.label}-${plans[index]?.name}`}>
                <FeatureValue value={value} />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="services-comparison-mobile">
        {plans.map((plan, planIndex) => (
          <article className={plan.featured ? 'is-featured' : ''} key={plan.name}>
            <div className="services-comparison-mobile-head">
              <div><p>{plan.eyebrow}</p><h3>{plan.name}</h3></div>
              {plan.featured && <Badge>Most complete</Badge>}
            </div>
            <p>{plan.description}</p>
            <strong><RegionalPriceCopy>{plan.price}</RegionalPriceCopy></strong>
            <small>{plan.timeline}</small>
            <ul>
              {rows.map((row) => (
                <li key={row.label}>
                  <span>{row.label}</span>
                  <FeatureValue value={row.values[planIndex]} />
                </li>
              ))}
            </ul>
            <Button asChild variant={plan.featured ? 'default' : 'secondary'}>
              <Link href={plan.href}>View full scope <MoveRight size={15} /></Link>
            </Button>
          </article>
        ))}
      </div>

      <div className="services-comparison-help">
        <div><PhoneCall size={20} strokeWidth={1.6} /><p><strong>Need a different combination?</strong><span>The audit identifies the right scope before you commit.</span></p></div>
        <Button asChild variant="outline"><Link href="/contact">Discuss a custom scope <MoveRight size={15} /></Link></Button>
      </div>
    </section>
  );
}

export { Pricing };
