import Link from 'next/link';
import {
  BarChart3,
  Calculator,
  FileText,
  Gauge,
  Globe2,
  ReceiptText,
  Share2,
  type LucideIcon,
} from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Footer as SiteFooter } from '../../components/Footer';
import { SiteHeader } from '../../components/SiteHeader';
import { CurrencySymbol } from '../../components/PricingCurrencyProvider';
import type { ToolDefinition } from '../data';

const toolIcons: Record<string, LucideIcon> = {
  'digital-presence-score': Gauge,
  'website-cost-calculator': Globe2,
  'social-media-cost-calculator': Share2,
  'seo-roi-calculator': BarChart3,
  'roas-calculator': Calculator,
  'gst-calculator': ReceiptText,
  'gst-invoice-generator': FileText,
};

const toolDetailFacts: Record<string, { number: string; facts: [string, string][] }> = {
  'digital-presence-score': {
    number: '01',
    facts: [['12', 'Guided signals'], ['04', 'Focus categories'], ['100', 'Point score']],
  },
  'website-cost-calculator': {
    number: '02',
    facts: [['05', 'Brief choices'], ['03', 'Website tiers'], ['Clear', 'Starting estimate']],
  },
  'social-media-cost-calculator': {
    number: '03',
    facts: [['04', 'Workload inputs'], ['03', 'Management tiers'], ['Clear', 'Scope match']],
  },
  'seo-roi-calculator': {
    number: '04',
    facts: [['03', 'Growth scenarios'], ['Live', 'Revenue model'], ['Clear', 'ROI range']],
  },
  'roas-calculator': {
    number: '05',
    facts: [['02', 'Core inputs'], ['Live', 'Break-even test'], ['₹', 'Profit view']],
  },
  'gst-calculator': {
    number: '06',
    facts: [['04', 'Standard rates'], ['CGST', 'Or IGST split'], ['Live', 'Tax breakdown']],
  },
  'gst-invoice-generator': {
    number: '07',
    facts: [['Live', 'Invoice totals'], ['PDF', 'Direct download'], ['0', 'Data stored']],
  },
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary';
  className?: string;
};

export function Button({ children, href, variant = 'primary', className = '', ...props }: ButtonProps) {
  const classes = `tool-btn tool-btn-${variant}${className ? ` ${className}` : ''}`;
  if (href) return <Link href={href} className={classes}>{children}</Link>;
  return <button className={classes} {...props}>{children}</button>;
}

export function ToolCard({ tool, index, featured = false }: { tool: ToolDefinition; index: number; featured?: boolean }) {
  const Icon = toolIcons[tool.slug] ?? Calculator;

  return (
    <article className={`tool-card${featured ? ' tool-card-featured' : ''}`}>
      <Link className="tool-card-hit" href={`/tools/${tool.slug}`} aria-label={`Open ${tool.name}`}>
        <div className="tool-card-top">
          <span>0{index + 1}</span>
          <i aria-hidden="true"><Icon size={20} strokeWidth={1.45} /></i>
          <strong>Free</strong>
        </div>
        <div>
          <p className="tool-eyebrow">{tool.time}</p>
          <h3>{tool.name}</h3>
          <p>{tool.description}</p>
        </div>
        <span className="tool-card-link">Use this tool <span aria-hidden="true">↗</span></span>
      </Link>
    </article>
  );
}

export function ToolIntro({ tool }: { tool: ToolDefinition }) {
  const Icon = toolIcons[tool.slug] ?? Calculator;
  const detail = toolDetailFacts[tool.slug];

  return (
    <header className="tool-page-intro" aria-labelledby="tool-page-title">
      <Link className="tool-back-link" href="/tools"><span aria-hidden="true">←</span> All free tools</Link>
      <div className="tool-intro-label">
        <span aria-hidden="true"><Icon size={16} strokeWidth={1.6} /></span>
        <p className="tool-eyebrow">Free Kraftt tool · {detail.number}</p>
      </div>
      <h1 id="tool-page-title">{tool.name}</h1>
      <p className="tool-intro-copy">{tool.value}</p>
      <div className="tool-intro-facts" aria-label={`${tool.name} overview`}>
        {detail.facts.map(([value, label]) => (
          <div key={label}>
            <strong>{value === '₹' ? <CurrencySymbol /> : value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <p className="tool-intro-note"><span aria-hidden="true">✓</span> {tool.time} · no login · instant result</p>
    </header>
  );
}

export function ToolDetail({ tool, children }: { tool: ToolDefinition; children: ReactNode }) {
  const Icon = toolIcons[tool.slug] ?? Calculator;

  return (
    <main className={`tool-detail-layout tool-detail-${tool.slug}`}>
      <ToolIntro tool={tool} />
      <section className="tool-detail-workspace" aria-label={`${tool.name} calculator`}>
        <span className="tool-workspace-badge"><Icon size={13} strokeWidth={1.8} aria-hidden="true" /> Calculator</span>
        {children}
      </section>
    </main>
  );
}

export function ResultActions({
  serviceHref,
  serviceLabel,
  auditHref,
}: {
  serviceHref: string;
  serviceLabel: string;
  auditHref: string;
}) {
  const contactHref = `${auditHref.replace(/^\/audit/, '/contact')}`;
  return (
    <div className="tool-result-actions">
      <Button href={serviceHref} variant="secondary">{serviceLabel} <span aria-hidden="true">↗</span></Button>
      <Button href={contactHref}>Request a Free Introductory Call</Button>
      <Link href={auditHref}>Explore the Paid Digital Presence Audit</Link>
    </div>
  );
}

export function ToolPage({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`tool-suite${className ? ` ${className}` : ''}`}>
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
