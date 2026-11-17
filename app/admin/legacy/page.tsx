import type { Metadata } from 'next';
import { DocumentWorkspace } from '../components/DocumentWorkspace';
import '../workspace.css';
import { services } from '../../data/services';
import { bundles } from '../../data/bundles';
import { buildCatalogue } from '../../../lib/quotation/catalogue';

export const metadata: Metadata = {
  title: 'Legacy browser workspace | Kraftt Digital',
  robots: { index: false, follow: false, nocache: true },
};

export default function LegacyAdminPage() {
  return <DocumentWorkspace catalogue={buildCatalogue(services, bundles)} />;
}
