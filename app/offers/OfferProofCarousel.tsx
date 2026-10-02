'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import type { ProjectType } from '../data/projects';

type ProofProject = {
  slug: string;
  name: string;
  projectType: ProjectType;
  industry: string;
  hero: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
};

export function OfferProofCarousel({ projects }: { projects: ProofProject[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToProject = useCallback((index: number) => {
    if (!projects.length) return;

    const nextIndex = (index + projects.length) % projects.length;
    const target = viewportRef.current?.querySelector<HTMLElement>(`[data-proof-index="${nextIndex}"]`);

    if (target && viewportRef.current) {
      viewportRef.current.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
      setActiveIndex(nextIndex);
    }
  }, [projects.length]);

  const updateActiveProject = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2;
    const slides = Array.from(viewport.querySelectorAll<HTMLElement>('[data-proof-index]'));
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    slides.forEach((slide, index) => {
      const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
      const distance = Math.abs(slideCenter - viewportCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  }, []);

  if (!projects.length) return null;

  return (
    <div className="offer-proof-carousel" aria-roledescription="carousel" aria-label="Selected Kraftt work">
      <div
        className="offer-proof-carousel-viewport"
        ref={viewportRef}
        onScroll={updateActiveProject}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') scrollToProject(activeIndex - 1);
          if (event.key === 'ArrowRight') scrollToProject(activeIndex + 1);
        }}
        tabIndex={0}
      >
        <div className="offer-proof-carousel-track">
          {projects.map((project, index) => (
            <article
              className="offer-proof-slide"
              data-proof-index={index}
              key={project.slug}
              aria-label={`${index + 1} of ${projects.length}: ${project.name}`}
            >
              <Link href={`/work/${project.slug}`} aria-label={`View ${project.name} ${project.projectType.toLowerCase()}`}>
                <div className="offer-proof-slide-image">
                  <Image
                    src={project.hero.src}
                    alt={project.hero.alt}
                    width={project.hero.width}
                    height={project.hero.height}
                    sizes="(max-width: 700px) 88vw, (max-width: 1100px) 70vw, 62vw"
                  />
                  <span className="offer-proof-slide-number" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="offer-proof-slide-copy">
                  <div>
                    <p className="eyebrow eyebrow-dark">{project.industry}</p>
                    <h3>{project.name}</h3>
                  </div>
                  <span className="offer-proof-slide-link">View {project.projectType.toLowerCase()} <ArrowUpRight size={16} aria-hidden="true" /></span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>

      <div className="offer-proof-carousel-controls">
        <p aria-live="polite">
          <span>Project</span> {String(activeIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
        </p>
        <div>
          <button type="button" onClick={() => scrollToProject(activeIndex - 1)} aria-label="Show previous project">
            <ArrowLeft size={18} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => scrollToProject(activeIndex + 1)} aria-label="Show next project">
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
