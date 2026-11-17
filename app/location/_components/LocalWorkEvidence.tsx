import Link from 'next/link';
import { clientEvidence } from '../../data/geo/clientEvidence';
import { projectBySlug } from '../../data/projects';

export function LocalWorkEvidence({ city, name, service }: { city: string; name: string; service?: string }) {
  const work = (clientEvidence[city] ?? [])
    .filter(item => !service || item.services.includes(service))
    .map(item => projectBySlug(item.slug)).filter(item => !!item);
  if (!work.length) return null;
  return <section className="service-simple-overview" aria-labelledby="local-work-title">
    <div className="service-simple-shell">
      <div className="service-simple-section-head"><div><p className="eyebrow eyebrow-dark">Client context · {name}</p><h2 id="local-work-title">Work you can explore.</h2></div><p>These clients are based in {name}. Each project shows the agreed work and the evidence available for it.</p></div>
      <div className="service-simple-related-grid">{work.map(project => <Link key={project.slug} href={`/work/${project.slug}`}><span>{project.projectType}</span><h3>{project.name}</h3><p>{project.context}</p><span>Read the project ↗</span></Link>)}</div>
    </div>
  </section>;
}
