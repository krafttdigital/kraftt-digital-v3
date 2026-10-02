import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AuditCTA } from '../../components/CTA';
import { Footer } from '../../components/Footer';
import { JsonLd } from '../../components/JsonLd';
import { ProjectGalleryCarousel } from '../../components/ProjectGalleryCarousel';
import { Reveal } from '../../components/Reveal';
import { ReviewsSection } from '../../components/ReviewsSection';
import { SiteHeader } from '../../components/SiteHeader';
import { projectBySlug, projects } from '../../data/projects';
import { galleryDetailsForProject } from '../../data/projectGalleryDetails';
import { reviewsForProject } from '../../data/reviews';
import { articleSchema, createPageMetadata, createPageSchema, reviewSchemas } from '../../data/seo';

const projectBanners: Record<string, { src: string; alt: string }> = {
  'shree-hari-spintex': { src: '/shsl-banner.png', alt: 'Shree Hari Spintex website, search and local discovery project collage' },
  'mittal-architect': { src: '/mittal-banner.png', alt: 'Mittal Architect website, portfolio and search visibility project collage' },
  'kiraq-jewellery': { src: '/kiraq-banner.png', alt: 'Kiraq Jewellery identity, storefront and administration system collage' },
  'elixir-beverages': { src: '/elixir-banner.png', alt: 'Elixir Beverages brand identity and pre-launch website collage' },
  'aegis-squad': { src: '/aegis-banner.png', alt: 'Aegis Squad services website and search presence collage' },
  'ketan-goyal': { src: '/ketan-banner.png', alt: 'Ketan Goyal portfolio, writing and digital builds collage' },
  'bharat-bhushan-singla': { src: '/bbs-banner.png', alt: 'Bharat Bhushan Singla legal website, case archive and consultation system collage' },
  'the-vibed-vines': { src: '/tvv-banner.png', alt: 'The Vibed Vines streetwear storefront, catalogue and checkout system collage' },
  'employee-os': { src: '/assets/projects/employee-os/employee-os-dashboard.webp', alt: 'Employee OS Windows dashboard for local employee, attendance and payroll management' },
};

export const dynamic = 'force-dynamic';
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) return {};
  return createPageMetadata({
    title: `${project.name} ${project.projectType} | Kraftt Digital`,
    description: project.context,
    path: `/work/${project.slug}`,
    label: `${project.industry} ${project.projectType.toLowerCase()}`,
    type: 'article',
  });
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) notFound();
  const related = projectBySlug(project.relatedProjectSlug);
  const projectNumber = String(projects.findIndex((item) => item.slug === project.slug) + 1).padStart(2, '0');
  const projectCount = String(projects.length).padStart(2, '0');
  const banner = projectBanners[project.slug];
  const relatedBanner = related ? projectBanners[related.slug] : null;
  const proofMetric = project.metrics.find((metric) => metric.kind === 'Measured') ?? project.metrics[0];
  const projectReviews = reviewsForProject(project.slug);
  const galleryDetails = galleryDetailsForProject(project.slug);
  const gallerySlides = project.gallery.map((image, index) => ({
    ...image,
    detail: galleryDetails[index] ?? `A documented view of ${image.alt.toLowerCase()} within the delivered ${project.name} system.`,
  }));

  return (
    <main className="project-detail-page">
      <JsonLd data={createPageSchema({
        name: `${project.name} ${project.projectType} | Kraftt Digital`,
        description: project.context,
        path: `/work/${project.slug}`,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Work', path: '/work' },
          { name: project.name, path: `/work/${project.slug}` },
        ],
        entities: [
          ...(project.projectType === 'Case Study' ? [articleSchema({
            name: `${project.name} Case Study`,
            description: project.context,
            path: `/work/${project.slug}`,
            industry: project.industry,
          })] : []),
          ...reviewSchemas(projectReviews),
        ],
      })} />
      <SiteHeader />
      <section className="project-detail-hero">
        <div className="project-detail-hero-inner">
          <Reveal className="project-detail-kicker" direction="left">
            <Link href="/work"><span aria-hidden="true">←</span> All work</Link>
            <span>{project.projectType} · {projectNumber} / {projectCount}</span>
          </Reveal>

          <Reveal className="project-detail-heading" direction="scale">
            <div>
              <p className="eyebrow eyebrow-dark">{project.industry}</p>
              <span>{project.outcomeType} outcome</span>
            </div>
            <h1>{project.name}</h1>
            <div className="project-detail-heading-summary">
              <p>{project.context}</p>
              <dl><dt>Engagement</dt><dd>{project.package}</dd></dl>
              <a className="project-detail-live-link" href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                {project.slug === 'employee-os' ? 'View Employee OS' : 'Visit live website'} <span aria-hidden="true">↗</span>
              </a>
            </div>
          </Reveal>

          {project.relationshipLabel && <Reveal className="project-detail-relationship"><strong>{project.relationshipLabel}</strong></Reveal>}

          <Reveal className="project-detail-hero-media" direction="scale">
            <Image src={banner.src} alt={banner.alt} fill priority sizes="(max-width: 760px) 94vw, 88vw" />
            {/* <strong>{projectNumber}</strong> */}
            <span>View the project ↓</span>
          </Reveal>

          <Reveal className="project-detail-metrics">
            {project.metrics.map((metric) => (
              <div key={`${metric.value}-${metric.label}`}>
                <span className="project-detail-metric-icon" aria-hidden="true">{metric.icon}</span>
                <small>{metric.kind}</small>
                <strong>{metric.value}</strong>
                <h2>{metric.label}</h2>
                <p>{metric.note}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="project-detail-story">
        <div className="project-detail-story-inner">
          <Reveal className="project-detail-section-heading">
            <div><p className="eyebrow eyebrow-dark">Inside the work</p><span>Gap → research → system</span></div>
            <h2>From business gap<br /><em>to working system.</em></h2>
            <p>See the context, research and delivered work. Outcome claims are limited to the evidence available for this project.</p>
          </Reveal>

          <div className="project-detail-system">
            <Reveal className="project-detail-brief" direction="left">
              <div className="project-detail-card-heading"><span>01</span><div><p className="eyebrow eyebrow-dark">Business brief</p><h3>What needed to change</h3></div></div>
              <div className="project-detail-brief-points">
                <div><span aria-hidden="true">!</span><div><strong>The gap</strong><p>{project.problem}</p></div></div>
                <div><span aria-hidden="true">◎</span><div><strong>The goal</strong><p>{project.context}</p></div></div>
              </div>
            </Reveal>

            <Reveal className="project-detail-findings" direction="right">
              <div className="project-detail-card-heading"><span>02</span><div><p className="eyebrow">Audit findings</p><h3>What the research exposed</h3></div></div>
              <ol>
                {project.findings.map((finding, index) => (
                  <li key={finding}><span>0{index + 1}</span><p>{finding}</p><i aria-hidden="true">↳</i></li>
                ))}
              </ol>
            </Reveal>

            {project.competitors.length > 0 && (
              <Reveal className="project-detail-landscape">
                <div className="project-detail-card-heading"><span>03</span><div><p className="eyebrow eyebrow-dark">Comparison set</p><h3>Who shaped the benchmark</h3></div></div>
                <div>{project.competitors.map((competitor) => <span key={competitor}>{competitor}</span>)}</div>
                <p>Used as a research landscape—not as a design template.</p>
              </Reveal>
            )}

            <Reveal className="project-detail-solution" direction="scale">
              <div className="project-detail-card-heading"><span>{project.competitors.length > 0 ? '04' : '03'}</span><div><p className="eyebrow eyebrow-dark">Kraftt system</p><h3>What we built and why</h3></div></div>
              <div className="project-detail-solution-grid">
                {project.solutionPoints.map((item) => (
                  <div key={item.title}><span aria-hidden="true">{item.icon}</span><div><strong>{item.title}</strong><p>{item.detail}</p></div></div>
                ))}
              </div>
            </Reveal>

            <Reveal className="project-detail-delivery-rail">
              <div><span>01</span><strong>Understand</strong><small>Business and category</small></div>
              <i aria-hidden="true">→</i>
              <div><span>02</span><strong>Compare</strong><small>Market and competitors</small></div>
              <i aria-hidden="true">→</i>
              <div><span>03</span><strong>Structure</strong><small>Scope and system</small></div>
              <i aria-hidden="true">→</i>
              <div><span>04</span><strong>Deliver</strong><small>Build, review and launch</small></div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="project-detail-gallery">
        <div className="project-detail-gallery-inner">
          <Reveal className="project-detail-gallery-heading">
            <div><p className="eyebrow eyebrow-dark">Project gallery</p><strong>{String(project.gallery.length).padStart(2, '0')}</strong></div>
            <h2>Delivered surfaces.<br /><em>Supporting detail.</em></h2>
            <p>Selected screens and implementation details from the finished system.</p>
          </Reveal>

        {gallerySlides.length ? (
          <ProjectGalleryCarousel slides={gallerySlides} projectName={project.name} />
        ) : (
          <Reveal className="project-detail-gallery-empty">
            <span>Founder-led internal venture</span>
            <strong>Documented as practice, not client proof.</strong>
            <p>This project is labelled clearly because it represents internal exploration rather than a client engagement.</p>
          </Reveal>
        )}
        </div>
      </section>

      <section className={`project-detail-outcome project-detail-outcome-${project.outcomeType.toLowerCase().replace(' ', '-')}`}>
        <Reveal className="project-detail-outcome-inner" direction="scale">
          <div className="project-detail-outcome-label">
            <small>Proof point</small>
            <strong>{proofMetric.value}</strong>
            <p>{proofMetric.label}</p>
            <span>{project.outcomeType} outcome</span>
          </div>
          <div>
            <p className="eyebrow">What changed</p>
            <h2>{project.outcome}</h2>
            {project.evidenceNote && <p className="project-detail-evidence-note"><span>Evidence note</span>{project.evidenceNote}</p>}
          </div>
        </Reveal>
      </section>

      {project.founderNote && (
        <section className="project-detail-founder-note"><p className="eyebrow eyebrow-dark">Founder note</p><h2>{project.founderNote}</h2></section>
      )}

      <ReviewsSection reviews={projectReviews} projectName={project.name} />

      {related && (
        <section className="project-detail-next">
          <div className="project-detail-next-inner">
            <Reveal className="project-detail-next-copy" direction="left">
              <p className="eyebrow eyebrow-dark">Continue exploring</p>
              <span>{related.industry}</span>
              <h2>Next: {related.name}</h2>
              <Link href={`/work/${related.slug}`}>View next {related.projectType.toLowerCase()} <span aria-hidden="true">→</span></Link>
            </Reveal>
            {relatedBanner && (
              <Reveal className="project-detail-next-media" direction="right">
                <Link href={`/work/${related.slug}`} aria-label={`View ${related.name} ${related.projectType.toLowerCase()}`}>
                  <Image src={relatedBanner.src} alt={relatedBanner.alt} fill sizes="(max-width: 760px) 94vw, 48vw" />
                  <span aria-hidden="true">↗</span>
                </Link>
              </Reveal>
            )}
          </div>
        </section>
      )}
      <AuditCTA title="Turn what the market sees into a clearer business case." />
      <Footer />
    </main>
  );
}
