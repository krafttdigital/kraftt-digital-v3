import Image from 'next/image';
import type { CaseStudyContent, CaseStudyImage } from '../../data/caseStudies';
import styles from './CaseStudyNarrative.module.css';

function StudyImage({ image, className = '', badge }: { image: CaseStudyImage; className?: string; badge?: string }) {
  return (
    <figure className={`${styles.figure} ${image.shape === 'portrait' ? styles.portrait : ''} ${className}`}>
      <div className={styles.imageFrame}>
        <Image src={image.src} alt={image.alt} fill sizes={image.shape === 'portrait' ? '(max-width: 700px) 82vw, 28vw' : '(max-width: 700px) 92vw, 48vw'} />
        {badge && <span className={styles.imageBadge}>{badge}</span>}
      </div>
      <figcaption>{image.caption}</figcaption>
    </figure>
  );
}

export function CaseStudyNarrative({ study }: { study: CaseStudyContent }) {
  return (
    <div className={styles.study}>
      <nav className={styles.nav} aria-label="Case study sections">
        <span className={styles.navTitle}>Explore the story</span>
        <a href="#case-overview"><span>01</span> Overview</a>
        <a href="#case-challenge"><span>02</span> Challenge</a>
        <a href="#case-decisions"><span>03</span> Decisions</a>
        <a href="#case-work"><span>04</span> The work</a>
        <a href="#case-outcomes"><span>05</span> Outcomes</a>
      </nav>

      <section className={`${styles.section} ${styles.overview}`} id="case-overview" aria-labelledby="case-overview-title">
        <div className={styles.sectionIntro}>
          <p className={styles.label}>The project at a glance</p>
          <h2 id="case-overview-title">{study.overviewTitle}</h2>
          <p>{study.overview}</p>
        </div>
        <dl className={styles.facts}>
          {study.facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}
        </dl>
      </section>

      <section className={styles.section} id="case-challenge" aria-labelledby="case-challenge-title">
        <div className={styles.sectionIntro}>
          <p className={styles.label}>01 / The challenge</p>
          <h2 id="case-challenge-title">{study.challengeTitle}</h2>
          <p>{study.challenge}</p>
        </div>
        <div className={styles.challengePoints}>
          {study.challengePoints.map((point, index) => <div key={point}><span>0{index + 1}</span><p>{point}</p></div>)}
        </div>
        {study.beforeAfter && (
          <div className={styles.beforeAfter}>
            {study.beforeAfter.map((image, index) => <StudyImage key={image.src} image={image} badge={index === 0 ? 'Before' : 'After'} />)}
          </div>
        )}
      </section>

      <section className={`${styles.section} ${styles.decisionsSection}`} id="case-decisions" aria-labelledby="case-decisions-title">
        <div className={styles.sectionIntro}>
          <p className={styles.label}>02 / What we did</p>
          <h2 id="case-decisions-title">The decisions behind the work.</h2>
          <p>Each choice answered a specific need in the client’s brief and changed what a visitor could see or do.</p>
        </div>
        <div className={styles.decisions}>
          {study.decisions.map((decision, index) => (
            <article key={decision.title}>
              <span className={styles.decisionNumber}>0{index + 1}</span>
              <h3>{decision.title}</h3>
              <div className={styles.decisionWhy}><small>The reason</small><p>{decision.reason}</p></div>
              <div className={styles.decisionResult}><small>What changed</small><p>{decision.result}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section} id="case-work" aria-labelledby="case-work-title">
        <div className={styles.sectionIntro}>
          <p className={styles.label}>03 / The delivered work</p>
          <h2 id="case-work-title">{study.showcaseTitle}</h2>
          <p>{study.showcaseIntro}</p>
        </div>
        <div className={styles.showcase}>
          {study.showcase.map((image, index) => <StudyImage key={image.src} image={image} badge={`View ${String(index + 1).padStart(2, '0')}`} />)}
        </div>
      </section>

      <section className={`${styles.section} ${styles.outcomesSection}`} id="case-outcomes" aria-labelledby="case-outcomes-title">
        <div className={styles.sectionIntro}>
          <p className={styles.label}>04 / What changed</p>
          <h2 id="case-outcomes-title">{study.outcomesTitle}</h2>
        </div>
        <div className={styles.outcomes}>
          {study.outcomes.map((outcome, index) => <article key={outcome.title}><span>0{index + 1}</span><h3>{outcome.title}</h3><p>{outcome.detail}</p></article>)}
        </div>
        <div className={styles.proof}>
          <StudyImage image={study.proof} badge="Source evidence" />
          <div><span className={styles.label}>Evidence in context</span><p>{study.proofNote}</p></div>
        </div>
      </section>

      <aside className={styles.takeaway}><span>Project takeaway</span><p>{study.takeaway}</p><span className={styles.takeawayMark} aria-hidden="true">↗</span></aside>
    </div>
  );
}
