import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { LocationMarket } from '../../data/geo';
import type { Service } from '../../data/services';
import styles from './location.module.css';

export function LocationBreadcrumbs({ market, service }: { market?: LocationMarket; service?: Service }) {
  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
      <ol>
        <li><Link href="/">Home</Link></li>
        <li><ChevronRight size={12} aria-hidden="true" />{market ? <Link href="/location">Locations</Link> : <span aria-current="page">Locations</span>}</li>
        {market && <li><ChevronRight size={12} aria-hidden="true" />{service ? <Link href={`/location/${market.slug}`}>{market.name}</Link> : <span aria-current="page">{market.name}</span>}</li>}
        {service && <li><ChevronRight size={12} aria-hidden="true" /><span aria-current="page">{service.name}</span></li>}
      </ol>
    </nav>
  );
}
