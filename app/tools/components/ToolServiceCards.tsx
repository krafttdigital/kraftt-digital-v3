import Link from 'next/link';
import { AnimatedServiceIcon } from '../../components/AnimatedServiceIcon';
import { RegionalPriceCopy } from '../../components/PricingCurrencyProvider';
import type { Service } from '../../data/services';

export function ToolServiceCards({ services }: { services: Service[] }) {
  return (
    <div className="tool-service-cards">
      {services.map((service, index) => (
        <article className={`home-service-featured home-service-featured-${index % 4 + 1} tool-service-card`} key={service.slug}>
          <div className="home-service-featured-top"><span>{String(index + 1).padStart(2, '0')}</span><i aria-hidden="true"><AnimatedServiceIcon slug={service.slug} size={36} /></i></div>
          <div className="home-service-featured-copy"><small>{service.category}</small><h3>{service.name}</h3><p>{service.headline}</p></div>
          <div className="home-service-featured-bottom">
            <span>{service.tiers[0]?.price ? <>From <RegionalPriceCopy>{service.tiers[0].price}</RegionalPriceCopy></> : 'Scope agreed individually'}</span>
            <Link href={`/services/${service.slug}`}>View service <i aria-hidden="true">↗</i></Link>
          </div>
        </article>
      ))}
    </div>
  );
}
