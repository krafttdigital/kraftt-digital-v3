'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Reveal } from '../components/Reveal';
import type { Project, ProjectType } from '../data/projects';

const projectBanners: Record<string, { src: string; alt: string }> = {
  'shree-hari-spintex': { src: '/shsl-banner.png', alt: 'Shree Hari Spintex website, search and local discovery project collage' },
  'gate-seeds': { src: '/assets/case-studies/gate-seeds/after-home.webp', alt: 'Gate Seeds redesigned website homepage' },
  'mittal-architect': { src: '/mittal-banner.png', alt: 'Mittal Architect website, portfolio and search visibility project collage' },
  'kiraq-jewellery': { src: '/kiraq-banner.png', alt: 'Kiraq Jewellery identity, storefront and administration system collage' },
  'elixir-beverages': { src: '/elixir-banner.png', alt: 'Elixir Beverages brand identity and pre-launch website collage' },
  'aegis-squad': { src: '/aegis-banner.png', alt: 'Aegis Squad services website and search presence collage' },
  'ketan-goyal': { src: '/ketan-banner.png', alt: 'Ketan Goyal portfolio, writing and digital builds collage' },
  'bharat-bhushan-singla': { src: '/bbs-banner.png', alt: 'Bharat Bhushan Singla legal website, case archive and consultation system collage' },
  'the-vibed-vines': { src: '/tvv-banner.png', alt: 'The Vibed Vines streetwear storefront, catalogue and checkout system collage' },
  'employee-os': { src: '/assets/projects/employee-os/employee-os-dashboard.webp', alt: 'Employee OS Windows dashboard for local employee, attendance and payroll management' },
};

export function WorkGrid({ projects }: { projects: Project[] }) {
  const filters = ['All Work', 'Case Study', 'Portfolio Project', 'Kraftt Product'] as const;
  const [active, setActive] = useState<(typeof filters)[number]>('All Work');
  const orderedProjects = [...projects].sort((a, b) =>
    Number(Boolean(a.relationshipLabel)) - Number(Boolean(b.relationshipLabel)));
  const visible = active === 'All Work'
    ? orderedProjects
    : orderedProjects.filter((project) => project.projectType === active);

  const projectCount = (filter: (typeof filters)[number]) => filter === 'All Work'
    ? projects.length
    : projects.filter((project) => project.projectType === (filter as ProjectType)).length;

  return (
    <>
      <div className="work-page-filters" aria-label="Filter work by project type">
        {filters.map((filter) => (
          <button key={filter} className={active === filter ? 'active' : ''} type="button" onClick={() => setActive(filter)} aria-pressed={active === filter}>
            <span>{filter}</span><small>{projectCount(filter)}</small>
          </button>
        ))}
      </div>

      <div className="work-page-grid" aria-live="polite">
        {visible.map((project, index) => {
          const banner = projectBanners[project.slug];

          return (
            <Reveal className="work-page-card work-page-hero-feature" direction="up" delay={Math.min(index, 5) * 0.045} key={project.slug}>
              <Link href={`/work/${project.slug}`} aria-label={`View ${project.name} ${project.projectType.toLowerCase()}`}>
                <div className="work-page-hero-feature-image">
                  <Image src={banner.src} alt={banner.alt} fill priority={index < 2} sizes="(max-width: 760px) 92vw, (max-width: 1100px) 47vw, 48vw" />
                </div>
                <div className="work-page-hero-feature-caption">
                  <span>{project.projectType} · {project.workCategory}</span>
                  <strong>{project.name}</strong>
                  <span aria-hidden="true">↗</span>
                  {project.relationshipLabel && <small className="work-page-card-note">{project.relationshipLabel}</small>}
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}
