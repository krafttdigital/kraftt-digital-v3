'use client';

import Image from 'next/image';
import Link from 'next/link';
import { trackEvent } from '../../../lib/analytics/core';
import type { CaseStudyContent } from '../../data/caseStudies';
import type { CaseStudyFlow } from '../../data/caseStudyFlow';
import type { Project } from '../../data/projects';
import styles from './CaseStudyHero.module.css';

type Props = {
  project: Project;
  study: CaseStudyContent;
  flow: CaseStudyFlow;
  number: string;
  count: string;
};

export function CaseStudyHero({ project, study, flow, number, count }: Props) {
  return (
    <section className={styles.hero} id="case-started" aria-labelledby="case-study-title">
      <a className={styles.skip} href="#case-who">Skip to the case study</a>
      <div className={styles.inner}>
        <div className={styles.topline}>
          <Link href="/work"><span aria-hidden="true">←</span> All work</Link>
          <span>Story {number} / {count}</span>
        </div>
        <div className={styles.layout}>
          <div className={styles.copy}>
            <p className={styles.chapter}>01 / Where they started</p>
            <h1 id="case-study-title">{project.name}</h1>
            <p className={styles.storyline}>{study.title}</p>
            <p className={styles.lead}>{study.lead}</p>
            <dl className={styles.facts}>
              <div><dt>Location</dt><dd>{study.location}</dd></div>
              <div><dt>Services</dt><dd>{project.package}</dd></div>
              <div><dt>Project</dt><dd>{study.projectDate}</dd></div>
            </dl>
            <div className={styles.actions}>
              <a href="#case-who">Read the story <span aria-hidden="true">↓</span></a>
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('case_study_live_site_click', { case_study: project.slug, cta_location: 'hero' })}>Visit live site <span aria-hidden="true">↗</span></a>
            </div>
          </div>
          <div className={styles.stage}>
            {flow.start.before ? (
              <div className={`${styles.browser} ${flow.start.beforeMobile ? styles.browserWithMobile : ''}`}>
                <div className={styles.browserBar} aria-hidden="true"><span><i /><i /><i /></span><span>Starting point</span></div>
                <Image className={flow.start.beforeMobile ? styles.desktopBefore : undefined} src={flow.start.before.src} alt={flow.start.before.alt} width={1600} height={900} priority sizes="(max-width: 900px) 92vw, 50vw" />
                {flow.start.beforeMobile && <Image className={styles.mobileBefore} src={flow.start.beforeMobile.src} alt={flow.start.beforeMobile.alt} width={390} height={844} sizes="(max-width: 600px) 90vw, 1px" />}
              </div>
            ) : (
              <div className={styles.empty}>
                <span>Before the build</span>
                <strong>No website yet.</strong>
                <p>{flow.start.empty}</p>
              </div>
            )}
            <p className={styles.caption}>{flow.start.before?.caption ?? 'The starting point, before Kraftt’s website work'}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
