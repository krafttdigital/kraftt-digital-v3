import type { Metadata } from 'next';
import { JsonLd } from '../../components/JsonLd';
import { createPageMetadata, createPageSchema } from '../../data/seo';
import { DigitalPresenceScore } from '../components/DigitalPresenceScore';
import { ToolDetail, ToolPage } from '../components/ToolSuite';
import { toolBySlug } from '../data';

const tool = toolBySlug('digital-presence-score')!;
const pageTitle = 'Digital Presence Score | Free Tool | Kraftt Digital';
const pageDescription = 'A free 2-minute check across brand clarity, website and search, enquiry flow, and tracking—with an instant score and no email required.';

export const metadata: Metadata = createPageMetadata({ title: pageTitle, description: pageDescription, path: '/tools/digital-presence-score', label: 'Free digital growth tool' });

export default function DigitalPresenceScorePage() {
  return (
    <ToolPage>
      <JsonLd data={createPageSchema({ name: pageTitle, description: pageDescription, path: '/tools/digital-presence-score', breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Tools', path: '/tools' }, { name: tool.name, path: '/tools/digital-presence-score' }] })} />
      <ToolDetail tool={tool}><DigitalPresenceScore /></ToolDetail>
    </ToolPage>
  );
}
