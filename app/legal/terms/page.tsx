import type { Metadata } from 'next';
import { Footer } from '../../components/Footer';
import { JsonLd } from '../../components/JsonLd';
import { SiteHeader } from '../../components/SiteHeader';
import { createPageMetadata, createPageSchema } from '../../data/seo';

const pageTitle = 'Website Terms | Kraftt Digital';
const pageDescription = 'Read the Kraftt Digital website terms covering service information, audits, project claims, intellectual property and written project agreements.';

export const metadata: Metadata = createPageMetadata({ title: pageTitle, description: pageDescription, path: '/legal/terms', label: 'Website terms' });

export default function TermsPage() {
  return (
    <main><JsonLd data={createPageSchema({ name: pageTitle, description: pageDescription, path: '/legal/terms', breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Terms', path: '/legal/terms' }] })} /><SiteHeader /><section className="page-hero legal-hero section-dark"><p className="eyebrow">Legal</p><h1>Terms</h1><p>Last updated: 23 August 2026</p></section>
      <article className="legal-copy">
        <h2>Website information</h2><p>This website describes Kraftt Digital services and selected work. Project availability, price and scope are confirmed only in a written proposal or agreement.</p>
        <h2>Audit</h2><p>The Digital Presence Audit is a focused paid review. It does not guarantee rankings, sales, enquiries or acceptance of a later proposal.</p>
        <h2>Project claims</h2><p>Measured outcomes are identified separately from qualitative outcomes. Evidence notes remain visible where dated proof is still required before public release.</p>
        <h2>Intellectual property</h2><p>Site content and Kraftt brand materials may not be copied or represented as another party’s work. Client and project assets remain subject to their respective rights and agreements.</p>
        <h2>Contact and project terms</h2><p>Questions can be raised through the contact options on this website. The written proposal and client agreement govern the final scope, payment schedule, responsibilities, timeline and applicable project terms.</p>
      </article><Footer /></main>
  );
}
