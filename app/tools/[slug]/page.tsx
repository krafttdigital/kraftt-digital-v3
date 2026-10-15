import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '../../components/JsonLd';
import { createPageMetadata, createPageSchema, faqSchema } from '../../data/seo';
import { GstCalculator } from '../components/GstCalculator';
import { GstInvoiceGenerator } from '../components/GstInvoiceGenerator';
import { RoasCalculator } from '../components/RoasCalculator';
import { SeoRoiCalculator } from '../components/SeoRoiCalculator';
import { SocialMediaCostCalculator } from '../components/SocialMediaCostCalculator';
import { ToolDetail, ToolPage } from '../components/ToolSuite';
import { ToolEditorial } from '../components/ToolEditorial';
import { WebsiteCostCalculator } from '../components/WebsiteCostCalculator';
import { toolBySlug, tools } from '../data';
import { toolGuides } from '../editorial';

const dynamicToolSlugs = tools.map((tool) => tool.slug).filter((slug) => slug !== 'digital-presence-score');
export const dynamic = 'force-dynamic';
export const dynamicParams = false;
export function generateStaticParams() { return dynamicToolSlugs.map((slug) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = toolBySlug(slug);
  if (!tool || slug === 'digital-presence-score') return {};
  const isWebsiteCost = slug === 'website-cost-calculator';
  return createPageMetadata({
    title: isWebsiteCost ? 'Website Cost in India | Prices & Free Calculator | Kraftt Digital' : `${tool.name} | Free Tool | Kraftt Digital`,
    description: isWebsiteCost ? 'Compare Kraftt website and e-commerce starting prices in India, see how the estimate is calculated, and use a free website cost calculator.' : tool.description,
    path: `/tools/${tool.slug}`,
    label: tool.group,
  });
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
  const pageTitle = slug === 'website-cost-calculator' ? 'Website Cost in India | Kraftt Digital' : `${tool.name} | Free Tool | Kraftt Digital`;
  const path = `/tools/${tool.slug}`;
  return (
    <ToolPage>
      <JsonLd data={createPageSchema({ name: pageTitle, description: tool.description, path, breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Tools', path: '/tools' }, { name: tool.name, path }], entities: [faqSchema(toolGuides[slug].faqs, path)] })} />
      <ToolDetail tool={tool} editorial={<ToolEditorial slug={slug} />}><Calculator slug={tool.slug} /></ToolDetail>
    </ToolPage>
  );
}
