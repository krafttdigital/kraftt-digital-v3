import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { marketplacePackages } from '../../data/marketplace';
import { serviceBySlug } from '../../data/services';
import { PriceText, PricingControls } from '../PricingCurrencyProvider';
import { ServiceScrollStage } from './ServiceScrollStage';
import styles from './showcase.module.css';

const services = [
  {
    slug: 'web-design-development', id: 'service-showcase-website', artwork: 'website', label: 'Website',
    title: 'Website Design & Development',
    description: 'Make it easy for visitors to understand what you do, see your work and enquire.',
    features: ['Responsive website design', 'Launch SEO for the agreed scope', 'Clear contact and enquiry paths'],
    action: 'Explore website design',
    proof: { href: '/work/gate-seeds', label: 'See the Gate Seeds redesign' },
  },
  {
    slug: 'brand-identity', id: 'service-showcase-brand', artwork: 'brand', label: 'Branding',
    title: 'Brand Identity & System',
    description: 'Give your business a recognizable identity your team can use consistently.',
    features: ['Positioning and audience research', 'Logo, colour and typography', 'Brand voice and tone'],
    action: 'Explore brand identity',
    proof: { href: '/work/elixir-beverages', label: 'See the Elixir Beverages brand system' },
  },
  {
    slug: 'ecommerce-seo', id: 'service-showcase-seo', artwork: 'seo', label: 'SEO',
    title: 'SEO Services',
    description: 'Improve the pages people need to find and see which search improvements are helping.',
    features: ['Technical and on-page improvements', 'Search Console monitoring', 'Monthly reporting'],
    action: 'Explore SEO',
    proof: { href: '/work/elixir-beverages#case-proof', label: 'See the Elixir Beverages search snapshot' },
  },
  {
    slug: 'ecommerce-store-development', id: 'service-showcase-store', artwork: 'store', label: 'Store',
    title: 'E-commerce Store Development',
    description: 'Build a store that helps shoppers find products, understand them and complete an order.',
    features: ['Shopify, Wix or WooCommerce storefront', 'Organized product catalogue', 'Checkout setup and handover'],
    action: 'Explore store development',
    proof: { href: '/work/the-vibed-vines', label: 'See The Vibed Vines storefront' },
  },
  {
    slug: 'marketplace-catalogue-building', id: 'marketplace-highlight', artwork: 'marketplace', label: 'Marketplace',
    title: 'Marketplace Catalogue Building',
    description: 'Prepare your product listings for marketplaces while your team handles orders.',
    features: ['Seller account setup support', 'Product uploads and listing structure', 'Marketplace walkthrough for your team'],
    action: 'Explore marketplace services',
    proof: null,
  },
] as const;

const platforms = [
  { name: 'Amazon', src: '/assets/marketplaces/amazon.png' },
  { name: 'Flipkart', src: '/assets/marketplaces/flipkart.png' },
  { name: 'Myntra', src: '/assets/marketplaces/myntra.png' },
  { name: 'Meesho', src: '/assets/marketplaces/meesho.png' },
];

const packageAllowances = new Intl.ListFormat('en-IN', { type: 'disjunction' })
  .format(marketplacePackages.map(pkg => String(pkg.productAllowance)));

export function HomeServiceShowcase({ market }: { market?: { serviceBasePath: string; enabledServiceSlugs: readonly string[] } }) {
  const chapters = services.map(service => ({
    id: service.id, label: service.label, artwork: `/assets/service-motion/${service.artwork}.webp?v=published-work`,
  }));

  return <section id="what-we-build" aria-labelledby="service-showcase-title" className={styles.section}>
    <div className={styles.shell}>
      <header className={styles.intro}>
        <div>
          <p className="eyebrow eyebrow-dark">What we build</p>
          <h2 id="service-showcase-title">Explore our services.</h2>
        </div>
        <div>
          <p>Choose the service that fits what your business needs next.</p>
          <a href="#service-showcase-website">Start exploring <ArrowDown size={16} aria-hidden="true" /></a>
        </div>
      </header>
      {/* <PricingControls /> */}
      <div className={styles.layout}>
        <ServiceScrollStage chapters={chapters} />
        <div className={styles.stack}>
          {services.map(service => {
            const base = market?.enabledServiceSlugs.includes(service.slug) ? market.serviceBasePath : '/services';
            const priceId = serviceBySlug(service.slug)?.tiers[0].priceId ?? null;
            return <article id={service.id} key={service.slug} className={styles.chapter} aria-labelledby={`${service.id}-title`}>
              <div className={styles.card}>
                <h3 id={`${service.id}-title`}>{service.title}</h3>
                <p>{service.description}</p>
                <ul>{service.features.map(feature => <li key={feature}><Check size={16} aria-hidden="true" />{feature}</li>)}</ul>
                {service.proof && <Link className={styles.proof} href={service.proof.href}>
                  {service.proof.label} <ArrowUpRight size={15} aria-hidden="true" />
                </Link>}
                {service.artwork === 'marketplace' && <>
                  <p className={styles.allowances}>India packages include uploads for up to {packageAllowances} products.</p>
                  <div className={styles.platforms} aria-label="Supported marketplaces">
                    {platforms.map(platform => <span key={platform.name}>
                      <Image src={platform.src} alt={platform.name} width={68} height={27} />
                    </span>)}
                  </div>
                </>}
                <div className={styles.action}>
                  <strong><PriceText id={priceId} from /></strong>
                  <Link href={`${base}/${service.slug}`}>{service.action} <ArrowUpRight size={16} aria-hidden="true" /></Link>
                </div>
              </div>
            </article>;
          })}
        </div>
      </div>
      <div className={styles.allServices}>
        <Link href="/services">View all services <ArrowRight size={17} aria-hidden="true" /></Link>
      </div>
    </div>
  </section>;
}
