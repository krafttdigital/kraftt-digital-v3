import Image from 'next/image';
import Link from 'next/link';
import type { CaseStudyContent } from '../../data/caseStudies';
import type { Project } from '../../data/projects';
import styles from './CaseStudyHero.module.css';

type CaseStudyHeroProps = {
  project: Project;
  study: CaseStudyContent;
  number: string;
  count: string;
  image: { src: string; alt: string };
};

export function CaseStudyHero({ project, study, number, count, image }: CaseStudyHeroProps) {
  return (
    <section className={styles.hero} data-client={project.slug} aria-labelledby="case-study-title">
      <div className={styles.inner}>
        <div className={styles.topline}>
          <Link href="/work"><span aria-hidden="true">←</span> All work</Link>
          <span>Case study <b>{number}</b> / {count}</span>
        </div>

        <div className={styles.intro}>
          <div className={styles.headline}>
            <p className={styles.eyebrow}><span className={styles.mark} aria-hidden="true" />{project.name} <span aria-hidden="true">/</span> {project.industry}</p>
            <h1 id="case-study-title">{study.title}</h1>
          </div>
          <div className={styles.summary}>
            <span className={styles.location}>{study.location}</span>
            <p>{study.lead}</p>
            <div className={styles.actions}>
              <a href="#case-overview">Explore the case <span aria-hidden="true">↓</span></a>
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">Visit live site <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </div>

        <div className={styles.stage}>
          <div className={styles.browser}>
            <div className={styles.browserBar} aria-hidden="true">
              <span className={styles.browserDots}><i /><i /><i /></span>
              <span>{project.name} — website preview</span>
              <span>↗</span>
            </div>
            <div className={styles.screen}>
              <Image src={image.src} alt={image.alt} fill priority sizes="(max-width: 760px) 94vw, 86vw" />
            </div>
          </div>
          <div className={styles.stageCaption}><span>Selected work / {project.name}</span><span>{study.projectDate}</span></div>
        </div>
      </div>
    </section>
  );
}
