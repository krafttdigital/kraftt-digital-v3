import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '../data/projects';

export function ProjectCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  return (
    <article className="project-card">
      <Link href={`/work/${project.slug}`} aria-label={`View ${project.name} ${project.projectType.toLowerCase()}`}>
        {project.hero ? (
          <div className="project-card-image">
            <Image
              src={project.hero.src}
              alt={project.hero.alt}
              width={project.hero.width}
              height={project.hero.height}
              priority={priority}
              sizes="(max-width: 760px) 100vw, 50vw"
            />
          </div>
        ) : (
          <div className="project-placeholder" role="img" aria-label={`${project.name} project title card`}>
            <span>{project.relationshipLabel ?? project.industry}</span>
            <strong>{project.name}</strong>
          </div>
        )}
        <div className="project-card-copy">
          <div>
            <p className="eyebrow">{project.projectType} · {project.industry}</p>
            <h3>{project.name}</h3>
          </div>
          <span aria-hidden="true">↗</span>
        </div>
        {project.relationshipLabel && <p className="relationship-label">{project.relationshipLabel}</p>}
      </Link>
    </article>
  );
}
