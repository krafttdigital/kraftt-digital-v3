'use client';

import { clientCityByProject } from '../../data/geo/clientEvidence';

import Image from 'next/image';
import Link from 'next/link';
import { lazy, Suspense, useEffect, useRef, useState, type PointerEvent } from 'react';
import type { CaseStudyContent } from '../../data/caseStudies';
import type { CaseStudyFlow, StoryImage } from '../../data/caseStudyFlow';
import type { Project } from '../../data/projects';
import type { ClientReview } from '../../data/reviews';
import { trackEvent } from '../../../lib/analytics/core';
import { AnimatedTestimonials, type Testimonial } from '../../../components/ui/animated-testimonials';
import styles from './CaseStudyNarrative.module.css';

const chapters = [
  ['case-started', 'Started'],
  ['case-who', 'Who they are'],
  ['case-way', 'In the way'],
  ['case-brief', 'The ask'],
  ['case-decisions', 'Decisions'],
  ['case-result', 'Result'],
  ['case-proof', 'Proof'],
  ['case-lesson', 'Lesson'],
  ['case-turn', 'More stories'],
] as const;

const caseStudyBanners: Record<string, string> = {
  'gate-seeds': '/assets/case-studies/gate-seeds/related-banner.webp',
  'shree-hari-spintex': '/assets/case-studies/shree-hari-spintex/related-banner.webp',
  'mittal-architect': '/assets/case-studies/mittal-architect/related-banner.webp',
  'elixir-beverages': '/assets/case-studies/elixir-beverages/related-banner.webp',
};

const LessonMotionPlayer = lazy(() => import('./LessonMotionPlayer'));

function swipeDirection(start: { x: number; y: number } | null, event: PointerEvent<HTMLElement>) {
  if (!start) return 0;
  const x = event.clientX - start.x;
  const y = event.clientY - start.y;
  return Math.abs(x) > 45 && Math.abs(x) > Math.abs(y) * 1.25 ? (x < 0 ? 1 : -1) : 0;
}

function Screen({ image, children, className = '' }: { image: StoryImage; children?: React.ReactNode; className?: string }) {
  return (
    <figure className={`${styles.frame} ${image.portrait ? styles.phone : ''} ${className}`}>
      <div className={styles.frameShell}>
        <div className={styles.frameBar} aria-hidden="true"><span><i /><i /><i /></span><span>{image.portrait ? 'Mobile view' : 'Website view'}</span></div>
        <div className={styles.screen}>
          <Image src={image.src} alt={image.alt} width={image.portrait ? 390 : 1600} height={image.portrait ? 844 : 900} loading="lazy" sizes={image.portrait ? '(max-width: 760px) 70vw, 260px' : '(max-width: 760px) 92vw, 680px'} />
          {children}
        </div>
      </div>
      <figcaption>{image.caption}</figcaption>
    </figure>
  );
}

export function CaseStudyNarrative({ study, flow, project, nextStories, reviews }: {
  study: CaseStudyContent;
  flow: CaseStudyFlow;
  project: Project;
  nextStories: Project[];
  reviews: ClientReview[];
}) {
  const [progress, setProgress] = useState(0);
  const [progressSplit, setProgressSplit] = useState(50);
  const [activeCallout, setActiveCallout] = useState<number | null>(null);
  const [activeDecision, setActiveDecision] = useState(0);
  const [enhanced, setEnhanced] = useState(false);
  const [revealActive, setRevealActive] = useState(false);
  const [mobileDesktop, setMobileDesktop] = useState(false);
  const [resultIndex, setResultIndex] = useState(0);
  const [pauseResults, setPauseResults] = useState(false);
  const [allowAutoplay, setAllowAutoplay] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);
  const [lessonVisible, setLessonVisible] = useState(false);
  const resultSectionRef = useRef<HTMLDivElement>(null);
  const resultDragRef = useRef<{ id: number; x: number; y: number } | null>(null);
  const lessonMotionRef = useRef<HTMLDivElement>(null);
  const tracked = useRef(new Set<string>());

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setAllowAutoplay(!reduced.matches);
    update();
    reduced.addEventListener('change', update);
    return () => reduced.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === resultSectionRef.current) setResultVisible(entry.isIntersecting);
        if (entry.target === lessonMotionRef.current) setLessonVisible(entry.isIntersecting);
      }
    }, { threshold: 0.2 });
    if (resultSectionRef.current) observer.observe(resultSectionRef.current);
    if (lessonMotionRef.current) observer.observe(lessonMotionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!allowAutoplay || !resultVisible || pauseResults || flow.results.length < 2) return;
    const timer = window.setInterval(() => setResultIndex((index) => (index + 1) % flow.results.length), 3000);
    return () => window.clearInterval(timer);
  }, [allowAutoplay, resultVisible, pauseResults, resultIndex, flow.results.length]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 901px)');
    const updateMode = () => setEnhanced(desktop.matches && !reduced.matches);
    updateMode();
    reduced.addEventListener('change', updateMode);
    desktop.addEventListener('change', updateMode);

    const sections = chapters.map(([id]) => document.getElementById(id)).filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || tracked.current.has(entry.target.id)) continue;
        tracked.current.add(entry.target.id);
        trackEvent('case_study_chapter_view', { case_study: project.slug, cta_label: entry.target.id.replace('case-', '') });
      }
    }, { rootMargin: '-25% 0px -55% 0px' });
    sections.forEach((section) => observer.observe(section));

    const reveal = document.getElementById('case-result');
    const revealObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) setRevealActive(true);
    }, { threshold: 0.2 });
    if (reveal) revealObserver.observe(reveal);

    let frame = 0;
    const updateScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const first = document.getElementById('case-started');
        const last = document.getElementById('case-turn');
        if (first && last) {
          const start = first.getBoundingClientRect().top + window.scrollY;
          const end = last.getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
          setProgress(Math.max(0, Math.min(100, ((window.scrollY - start) / Math.max(end - start, 1)) * 100)));
        }
        if (desktop.matches && !reduced.matches) {
          const steps = Array.from(document.querySelectorAll<HTMLElement>('[data-decision-step]'));
          let current = 0;
          steps.forEach((step, index) => { if (step.getBoundingClientRect().top < window.innerHeight * 0.56) current = index; });
          setActiveDecision(current);
        }
      });
    };
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      revealObserver.disconnect();
      reduced.removeEventListener('change', updateMode);
      desktop.removeEventListener('change', updateMode);
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
    };
  }, [project.slug]);

  const chooseCallout = (index: number) => {
    setActiveCallout(index);
    trackEvent('case_study_callout_open', { case_study: project.slug, cta_label: `problem_${index + 1}` });
  };
  const showBefore = Boolean(flow.start.before);
  const activeResult = flow.results[resultIndex];

  return (
    <div className={styles.story}>
      <nav className={styles.chapterNav} aria-label="Case study chapters">
        <div className={styles.progress} aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
        <div className={styles.chapterLinks}>{chapters.filter(([, label]) => ['Started', 'In the way', 'Decisions', 'Result', 'Proof', 'More stories'].includes(label)).map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}</div>
      </nav>

      <section id="case-who" className={styles.chapter} aria-labelledby="case-who-title">
        <div className={styles.chapterHeading}><span>02 / Who they are</span><h2 id="case-who-title">The business behind the work.</h2></div>
        <div className={styles.identity}>
          <div>
            {flow.identity.logo && <div className={styles.logo}><Image src={flow.identity.logo.src} alt={flow.identity.logo.alt} width={320} height={130} loading="lazy" sizes="160px" /></div>}
            <p className={styles.identityIntro}>{study.overview}</p>
            <p className={styles.factIntro}>A quick picture of the business</p>
            <dl className={styles.identityFacts}>
              {clientCityByProject[project.slug] && <div><dt>Client location</dt><dd>{clientCityByProject[project.slug]}, India</dd></div>}
              <div><dt>01 / Offering</dt><dd>{flow.identity.sells}</dd></div>
              <div><dt>02 / Audience</dt><dd>{flow.identity.buyers}</dd></div>
              <div><dt>03 / Discovery</dt><dd>{flow.identity.discovery}</dd></div>
            </dl>
          </div>
          {flow.identity.photo ? <figure className={styles.identityPhoto}><Image src={flow.identity.photo.src} alt={flow.identity.photo.alt} width={960} height={1200} loading="lazy" sizes="(max-width: 760px) 92vw, 480px" /><figcaption>{flow.identity.photo.caption}</figcaption></figure> : <Screen image={flow.identity.image} className={styles.identityVisual} />}
        </div>
      </section>

      <section id="case-way" className={styles.chapter} aria-labelledby="case-way-title">
        <div className={styles.chapterHeading}><span>03 / What was in the way</span><h2 id="case-way-title">{study.challengeTitle}</h2><p>{study.challenge}</p></div>
        <div className={styles.problemLayout}>
          {showBefore && (
            <Screen image={flow.start.before!} className={styles.beforeFrame}>
              <div className={styles.calloutOverlay}>
                {flow.callouts?.map(({ x, y, problem }, index) => <button key={`${x}-${y}`} type="button" style={{ left: `${x}%`, top: `${y}%` }} className={activeCallout === problem ? styles.calloutActive : ''} aria-label={`Show problem ${problem + 1}: ${study.challengePoints[problem]}`} aria-pressed={activeCallout === problem} onClick={() => chooseCallout(problem)}>{index + 1}</button>)}
              </div>
            </Screen>
          )}
          <ol className={styles.problemList}>
            {study.challengePoints.map((point, index) => <li key={point} className={activeCallout === index ? styles.problemActive : ''}><button type="button" onClick={() => chooseCallout(index)} aria-pressed={activeCallout === index}><span>{String(index + 1).padStart(2, '0')}</span>{point}</button></li>)}
          </ol>
        </div>
      </section>

      <section id="case-brief" className={`${styles.chapter} ${styles.briefChapter}`} aria-labelledby="case-brief-title">
        <div className={styles.chapterHeading}><span>04 / What they asked for</span><h2 id="case-brief-title">{flow.brief.headline}</h2><p>The request set the direction. The visitor journey shaped what we built.</p></div>
        <div className={styles.briefGrid}>
          <div className={styles.briefRequest}><span>Client request</span><p>{flow.brief.asked}</p></div>
          <div className={styles.briefNeed}><span>Visitor need</span><p>{flow.brief.needed}</p></div>
        </div>
        <div className={styles.briefScene}>
          <div className={styles.briefSceneIntro}><span>At the starting point</span><h3>What a visitor encountered</h3><p>{flow.start.empty ?? 'The earlier website was live, but these gaps made it harder for a new visitor to take the next step.'}</p></div>
          {flow.start.before && <figure className={styles.briefBefore}><Image src={flow.start.before.src} alt={flow.start.before.alt} width={800} height={450} loading="lazy" sizes="(max-width: 760px) 90vw, 320px" /><figcaption>{flow.start.before.caption}</figcaption></figure>}
          <ol className={styles.briefPoints}>{study.challengePoints.map((point, index) => <li key={point}><span>{String(index + 1).padStart(2, '0')}</span><p>{point}</p></li>)}</ol>
        </div>
      </section>

      <section id="case-decisions" className={`${styles.chapter} ${styles.decisionChapter}`} aria-labelledby="case-decisions-title">
        <div className={styles.chapterHeading}><span>05 / What we decided</span><h2 id="case-decisions-title">Each choice had a reason.</h2><p>{study.showcaseIntro}</p></div>
        <div className={`${styles.decisionLayout} ${enhanced ? styles.decisionEnhanced : ''}`}>
          <div className={styles.decisionSteps}>
            {study.decisions.map((decision, index) => <article key={decision.title} data-decision-step>
              <span className={styles.stepNumber}>{String(index + 1).padStart(2, '0')} / {String(study.decisions.length).padStart(2, '0')}</span>
              <div className={styles.inlineVisual}><Screen image={flow.decisionImages[index] ?? flow.reveal.desktop} /></div>
              <h3>{decision.title}</h3>
              <dl><div><dt>Why</dt><dd>{decision.reason}</dd></div><div><dt>What changed</dt><dd>{decision.result}</dd></div></dl>
            </article>)}
          </div>
          <div className={styles.decisionStage} aria-live="polite">
            <Screen image={flow.decisionImages[activeDecision] ?? flow.reveal.desktop} />
            {flow.process && <div className={styles.processInset}><Image src={flow.process.src} alt={flow.process.alt} width={500} height={320} loading="lazy" sizes="210px" /><span>{flow.process.caption}</span></div>}
          </div>
          {flow.process && <figure className={styles.mobileProcess}><Image src={flow.process.src} alt={flow.process.alt} width={500} height={320} loading="lazy" sizes="(max-width: 900px) 90vw, 1px" /><figcaption>{flow.process.caption}</figcaption></figure>}
        </div>
      </section>

      <section id="case-result" className={`${styles.chapter} ${styles.resultChapter}`} aria-labelledby="case-result-title">
        <div className={styles.chapterHeading}><span>06 / What it looks like now</span><h2 id="case-result-title">{study.showcaseTitle}</h2><p>{study.showcaseIntro} <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('case_study_live_site_click', { case_study: project.slug, cta_location: 'body' })}>Visit the live site ↗</a></p></div>
        <div className={styles.viewSwitch}><button type="button" onClick={() => setMobileDesktop((value) => !value)}>{mobileDesktop ? 'Show phone view' : 'Show desktop view'}</button></div>
        <div className={styles.revealGrid}>
          <div className={`${styles.desktopReveal} ${!mobileDesktop ? styles.mobileHidden : ''}`}>
            {showBefore ? (
              <div className={styles.compare}>
                <div className={styles.compareImages}>
                  <Image src={flow.start.before!.src} alt={flow.start.before!.alt} width={1600} height={900} loading="lazy" sizes="(max-width: 760px) 92vw, 75vw" />
                  <Image className={!revealActive ? styles.awaitReveal : ''} src={flow.reveal.desktop.src} alt={flow.reveal.desktop.alt} width={1600} height={900} loading="lazy" sizes="(max-width: 760px) 92vw, 75vw" style={{ clipPath: `inset(0 ${100 - progressSplit}% 0 0)` }} />
                  <span className={styles.splitLine} style={{ left: `${progressSplit}%` }} aria-hidden="true" />
                </div>
                <div className={styles.compareLabels}><span>Before · as supplied</span><span>After · published</span></div>
                <input className={styles.range} type="range" min="0" max="100" value={progressSplit} onChange={(event) => setProgressSplit(Number(event.target.value))} aria-label="Compare the old and new desktop website screenshots" />
              </div>
            ) : <Screen image={flow.reveal.desktop} className={!revealActive ? styles.awaitReveal : ''} />}
          </div>
          {flow.reveal.mobile && <Screen image={flow.reveal.mobile} className={`${styles.mobileReveal} ${mobileDesktop ? styles.mobileHidden : ''} ${!revealActive ? styles.awaitReveal : ''}`} />}
        </div>
        {flow.reveal.clip && <div className={styles.clip}><div><span>Ten-second site view</span><p>Play when you’re ready. This screen recording is silent.</p></div><video controls muted playsInline preload="none" poster={flow.reveal.clip.poster} aria-label={flow.reveal.clip.description} onPlay={(event) => { if (event.currentTarget.currentTime >= 10) event.currentTarget.currentTime = 0; trackEvent('case_study_clip_play', { case_study: project.slug, cta_label: 'site_clip' }); }} onTimeUpdate={(event) => { if (event.currentTarget.currentTime >= 10) event.currentTarget.pause(); }}><source src={flow.reveal.clip.src} /></video></div>}
      </section>

      <section id="case-proof" className={styles.chapter} aria-labelledby="case-proof-title">
        <div className={styles.chapterHeading}><span>07 / What we can show</span><h2 id="case-proof-title">See the work. See the evidence.</h2><p>Here is the difference between what we delivered, what it was meant to improve and what the supplied evidence actually shows.</p></div>
        <div className={styles.ledger}>
          <div><span className={styles.ledgerMarker}>01</span><h3>What we made</h3><p className={styles.ledgerExplainer}>Open the site and you can see it</p><ul>{flow.ledger.built.map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div><span className={styles.ledgerMarker}>02</span><h3>Why we made it</h3><p className={styles.ledgerExplainer}>The visitor problem it addresses</p><ul>{flow.ledger.intended.map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div><span className={styles.ledgerMarker}>03</span><h3>What the evidence shows</h3><p className={styles.ledgerExplainer}>The honest read of available proof</p>{flow.ledger.measured?.source && flow.ledger.measured.period ? <p>{flow.ledger.measured.value}<small>{flow.ledger.measured.source} · {flow.ledger.measured.period}</small></p> : <p>{flow.ledger.note}</p>}</div>
        </div>
        {reviews.length > 0 && <AnimatedTestimonials variant="work" testimonials={reviews.map((review): Testimonial => ({
          id: review.id,
          name: review.clientName,
          role: review.role,
          company: review.company,
          content: review.review,
          translation: review.translation,
          evidenceNote: review.evidenceNote,
          sourceImages: review.sourceImages,
          logo: flow.identity.logo?.src,
          relationshipLabel: project.relationshipLabel,
        }))} />}
        <div ref={resultSectionRef} className={styles.evidenceSection} onFocusCapture={(event) => { if (event.target instanceof HTMLElement && event.target.matches(':focus-visible')) setPauseResults(true); }} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPauseResults(false); }}>
          <div className={styles.carouselHeading}><div><span>Results</span><h3>{project.slug === 'gate-seeds' ? 'What was published.' : 'What appeared in search.'}</h3><p>{project.slug === 'gate-seeds' ? 'No results screenshots have been supplied for this project. These published screens show the delivered work.' : 'Original screenshots from the project’s results folder. They record individual views; search and AI results can change by time and place.'}</p></div></div>
          <figure className={styles.evidenceCard} key={activeResult.src} onPointerDown={(event) => { if ((event.pointerType === 'mouse' && event.button !== 0) || (event.target instanceof Element && event.target.closest('button, a'))) return; resultDragRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); setPauseResults(true); }} onPointerUp={(event) => { const start = resultDragRef.current; resultDragRef.current = null; setPauseResults(false); if (!start || start.id !== event.pointerId) return; const direction = swipeDirection(start, event); if (direction) setResultIndex((index) => (index + direction + flow.results.length) % flow.results.length); }} onPointerCancel={() => { resultDragRef.current = null; setPauseResults(false); }}><div className={`${styles.evidenceImage} ${activeResult.portrait || activeResult.mobileSrc ? styles.portraitEvidence : ''}`}><Image className={activeResult.mobileSrc ? styles.desktopCapture : undefined} src={activeResult.src} alt={activeResult.alt} width={activeResult.portrait ? 390 : 1600} height={activeResult.portrait ? 844 : 900} loading="lazy" unoptimized draggable={false} sizes="(max-width: 760px) 92vw, 1000px" />{activeResult.mobileSrc && <Image className={styles.mobileCapture} src={activeResult.mobileSrc} alt={`${activeResult.alt} on mobile`} width={390} height={844} loading="lazy" unoptimized draggable={false} sizes="(max-width: 760px) 70vw, 1px" />}{flow.results.length > 1 && <div className={styles.evidenceOverlayControls}><button type="button" aria-label="Previous result image" onClick={() => setResultIndex((index) => (index - 1 + flow.results.length) % flow.results.length)}>←</button><span>{String(resultIndex + 1).padStart(2, '0')} / {String(flow.results.length).padStart(2, '0')}</span><button type="button" aria-label="Next result image" onClick={() => setResultIndex((index) => (index + 1) % flow.results.length)}>→</button></div>}</div><figcaption><div><span>{activeResult.kind}</span>{activeResult.query && <small>Search: “{activeResult.query}”</small>}</div><div><h4>{activeResult.title}</h4><p>{activeResult.caption}</p><small>{activeResult.kind === 'Published work' ? 'Published page capture' : 'Supplied 18 Oct 2026 · Original capture date unknown'}</small></div></figcaption></figure>
          {flow.results.length > 1 && <><div className={styles.carouselDots} aria-label="Choose result image">{flow.results.map((result, index) => <button key={result.src} type="button" aria-label={`Show result image ${index + 1}`} aria-current={resultIndex === index ? 'true' : undefined} onClick={() => setResultIndex(index)} />)}</div>{allowAutoplay && <p className={styles.autoNote}>Moves every 3 seconds while in view · focus or drag to pause</p>}</>}
        </div>
      </section>

      <section id="case-lesson" className={`${styles.chapter} ${styles.lessonChapter}`} aria-labelledby="case-lesson-title">
        <div className={styles.chapterHeading}><span>08 / What we learned</span><h2 id="case-lesson-title">The lesson, then the next test.</h2></div>
        <div ref={lessonMotionRef} className={styles.lessonMotion} aria-hidden="true">
          {allowAutoplay && lessonVisible ? <Suspense fallback={<div className={styles.lessonMotionPoster}><span>01 / Insight</span><i>→</i><span>02 / Next test</span></div>}><LessonMotionPlayer /></Suspense> : <div className={styles.lessonMotionPoster}><span>01 / Insight</span><i>→</i><span>02 / Next test</span></div>}
        </div>
        <div className={styles.lessonGrid}><article><span>01 / The principle</span><p>{study.takeaway}</p></article><article><span>02 / What we’d check next</span><p>{flow.improvement}</p></article></div>
      </section>

      <section id="case-turn" className={`${styles.chapter} ${styles.turnChapter}`} aria-labelledby="case-turn-title">
        <div className={styles.chapterHeading}><span>09 / More stories</span><h2 id="case-turn-title">Read another case study.</h2></div>
        <div className={styles.nextStories}><div>{nextStories.map((next) => <Link key={next.slug} href={`/work/${next.slug}`}><span className={styles.nextStoryImage}><Image src={caseStudyBanners[next.slug]} alt={`${next.name} case study banner`} width={1200} height={675} loading="lazy" sizes="(max-width: 760px) 92vw, 43vw" /></span><span className={styles.nextStoryCopy}><small>{next.industry}</small><strong>{next.name}</strong><span>Read the case study <span aria-hidden="true">↗</span></span></span></Link>)}</div></div>
      </section>
    </div>
  );
}
