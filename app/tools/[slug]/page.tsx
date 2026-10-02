import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '../../components/JsonLd';
import { createPageMetadata, createPageSchema } from '../../data/seo';
import { GstCalculator } from '../components/GstCalculator';
import { GstInvoiceGenerator } from '../components/GstInvoiceGenerator';
import { RoasCalculator } from '../components/RoasCalculator';
import { SeoRoiCalculator } from '../components/SeoRoiCalculator';
import { SocialMediaCostCalculator } from '../components/SocialMediaCostCalculator';
import { ToolDetail, ToolPage } from '../components/ToolSuite';
import { WebsiteCostCalculator } from '../components/WebsiteCostCalculator';
import { toolBySlug, tools } from '../data';

const dynamicToolSlugs = tools.map((tool) => tool.slug).filter((slug) => slug !== 'digital-presence-score');
export const dynamic = 'force-dynamic';
export const dynamicParams = false;
export function generateStaticParams() { return dynamicToolSlugs.map((slug) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = toolBySlug(slug);
  if (!tool || slug === 'digital-presence-score') return {};
  return createPageMetadata({ title: `${tool.name} | Free Tool | Kraftt Digital`, description: tool.description, path: `/tools/${tool.slug}`, label: tool.group });
}

function Calculator({ slug }: { slug: string }) {
  switch (slug) {
    case 'website-cost-calculator': return <WebsiteCostCalculator />;
    case 'social-media-cost-calculator': return <SocialMediaCostCalculator />;
    case 'gst-calculator': return <GstCalculator />;
    case 'gst-invoice-generator': return <GstInvoiceGenerator />;
    case 'seo-roi-calculator': return <SeoRoiCalculator />;
    case 'roas-calculator': return <RoasCalculator />;
    default: return null;
  }
}

export default async function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = toolBySlug(slug);
  if (!tool || slug === 'digital-presence-score') notFound();
  const pageTitle = `${tool.name} | Free Tool | Kraftt Digital`;
  return (
    <ToolPage>
      <JsonLd data={createPageSchema({ name: pageTitle, description: tool.description, path: `/tools/${tool.slug}`, breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Tools', path: '/tools' }, { name: tool.name, path: `/tools/${tool.slug}` }] })} />
      <ToolDetail tool={tool}><Calculator slug={tool.slug} /></ToolDetail>
    </ToolPage>
  );
}
