import type { Metadata } from 'next';
import { DocumentWorkspace } from './components/DocumentWorkspace';
import './workspace.css';
import { services } from '../data/services';
import { bundles } from '../data/bundles';
import { buildCatalogue } from '../../lib/quotation/catalogue';

export const metadata: Metadata = {
  title: 'Document Workspace | Kraftt Digital',
  description: 'Kraftt Digital document workspace.',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true, nosnippet: true } },
};

export default function AdminPage() { return <DocumentWorkspace catalogue={buildCatalogue(services, bundles)} />; }
