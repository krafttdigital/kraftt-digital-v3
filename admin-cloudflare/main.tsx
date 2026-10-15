import { createRoot } from 'react-dom/client';
import { DocumentWorkspace } from '../app/admin/components/DocumentWorkspace';
import { services } from '../app/data/services';
import { bundles } from '../app/data/bundles';
import { buildCatalogue } from '../lib/quotation/catalogue';
import './base.css';
import '../app/admin/workspace.css';

createRoot(document.getElementById('root')!).render(
  <DocumentWorkspace catalogue={buildCatalogue(services, bundles)} />,
);
