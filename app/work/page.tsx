import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { AuditCTA } from '../components/CTA';
import { Footer } from '../components/Footer';
import { JsonLd } from '../components/JsonLd';
import { Reveal } from '../components/Reveal';
import { SiteHeader } from '../components/SiteHeader';
import { projects } from '../data/projects';
import { createPageMetadata, createPageSchema } from '../data/seo';
import { WorkGrid } from './WorkGrid';

const pageTitle = 'Selected Work | Kraftt Digital';
const pageDescription = 'Explore Kraftt Digital case studies, portfolio projects and Kraftt products across brand, websites, commerce and digital systems.';

export const metadata: Metadata = createPageMetadata({ title: pageTitle, description: pageDescription, path: '/work', label: 'Selected work' });

export default function WorkPage() {
  const projectCount = String(projects.length).padStart(2, '0');
  const caseCount = String(projects.filter((project) => project.projectType === 'Case Study').length).padStart(2, '0');
  const portfolioCount = String(projects.filter((project) => project.projectType === 'Portfolio Project').length).padStart(2, '0');
  const productCount = String(projects.filter((project) => project.projectType === 'Kraftt Product').length).padStart(2, '0');

  return (
    <main className="work-page">
      <JsonLd data={createPageSchema({ name: pageTitle, description: pageDescription, path: '/work', breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Work', path: '/work' }] })} />
      <SiteHeader />
      <section className="work-page-hero" aria-labelledby="work-page-title">
        <div className="work-page-hero-inner">
          <Reveal className="work-page-hero-copy" direction="left">
            <div className="work-page-hero-kicker"><p className="eyebrow eyebrow-dark">Selected work</p><span>{projectCount} projects to explore</span></div>
            <h1 id="work-page-title">Real work.<br /><em>Honest evidence.</em></h1>
            <p>Client engagements, portfolio work and our own product. Each project is clearly labelled, so you can judge the work and its evidence in context.</p>
            <div className="work-page-hero-actions">
              <a href="#work-index">Explore the projects <span aria-hidden="true">↓</span></a>
              <Link href="/contact">Discuss your project <span aria-hidden="true">↗</span></Link>
            </div>
          </Reveal>

          <Reveal className="work-page-hero-feature" direction="right">
            <Link href="/work/elixir-beverages" aria-label="View the Elixir Beverages case study">
              <div className="work-page-hero-feature-image">
                <Image src="/elixir-banner.png" alt="Elixir Beverages branding and website project collage" fill priority sizes="(max-width: 760px) 92vw, (max-width: 1100px) 44vw, 48vw" />
              </div>
              <div className="work-page-hero-feature-caption"><span>Featured case study · Consumer brands</span><strong>Elixir Beverages</strong><span aria-hidden="true">↗</span></div>
            </Link>
          </Reveal>
        </div>

        <Reveal className="work-page-evidence" direction="up">
          <div><strong>{caseCount}</strong><span>Case studies</span></div>
          <div><strong>{portfolioCount}</strong><span>Portfolio projects</span></div>
          <div><strong>{productCount}</strong><span>Kraftt products</span></div>
        </Reveal>
      </section>

      <section className="work-page-index" id="work-index">
        <Reveal className="work-page-index-heading">
          <div><p className="eyebrow eyebrow-dark">Project index</p><span>01 — {projectCount}</span></div>
          <h2>Different industries.<br /><em>The same discipline.</em></h2>
          <p>Filter by project type, then open a project to see its context, work and supporting evidence.</p>
        </Reveal>
        <WorkGrid projects={projects} />
      </section>

      {/* <section className="work-page-method">
        <div className="work-page-method-inner">
          <Reveal className="work-page-method-heading" direction="scale">
            <div><p className="eyebrow">A consistent method</p><span>Research before production</span></div>
            <h2>The work changes.<br /><em>The thinking stays clear.</em></h2>
            <p>Every engagement moves from a real business gap to a defined scope, then into focused production and delivery.</p>
          </Reveal>

          <div className="work-page-method-grid">
            <Reveal><span>01</span><div><strong>Audit the gap</strong><p>Understand the business, category, systems and competitors before recommending a solution.</p></div></Reveal>
            <Reveal delay={0.06}><span>02</span><div><strong>Define the work</strong><p>Make the strategy, deliverables, timeline, price and responsibilities clear before production.</p></div></Reveal>
            <Reveal delay={0.12}><span>03</span><div><strong>Build with context</strong><p>Connect brand, website, content and systems around one commercial idea.</p></div></Reveal>
          </div>

          <Reveal className="work-page-method-actions">
            <Link href="/process">Explore the process <span aria-hidden="true">↗</span></Link>
            <Link href="/contact">Request a free call <span aria-hidden="true">→</span></Link>
          </Reveal>
        </div>
      </section> */}
      <AuditCTA theme="light" />
      <Footer />
    </main>
  );
}
