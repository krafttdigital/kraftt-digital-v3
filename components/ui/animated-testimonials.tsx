'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { useRef, useState } from 'react';
import styles from './animated-testimonials.module.css';

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  translation?: string;
  isExcerpt?: boolean;
  relationshipLabel?: string;
  sourceImages?: readonly { src: string; alt: string; label: string }[];
  logo: string;
  href: string;
  rating?: number | null;
}

export interface AnimatedTestimonialsProps {
  testimonials: Testimonial[];
}

function TestimonialCard({ item, number }: { item: Testimonial; number: number }) {
  return (
    <article className={`${styles.card}${item.sourceImages?.length ? ` ${styles.cardWithProof}` : ''}`}>
      <div className={styles.cardTop}>
        <span>Client testimonial <span aria-hidden="true">/</span> {String(number).padStart(2, '0')}</span>
        <span className={styles.quoteMark} aria-hidden="true">“</span>
      </div>

      <blockquote>
        <p>{item.content}</p>
        {item.translation && <p className={styles.translation}><strong>English translation:</strong> {item.translation}</p>}
      </blockquote>

      {item.sourceImages && <div className={styles.proof} aria-label={`Original messages from ${item.name}`}>
        {item.sourceImages.map(source => <a key={source.src} href={source.src} target="_blank" rel="noopener noreferrer" aria-label={`Open ${source.label.toLowerCase()} from ${item.name}`}>
          <span className={styles.proofImage}><Image src={source.src} alt={source.alt} fill sizes="(max-width: 760px) 75vw, 300px" /></span>
          <span className={styles.proofLabel}>{source.label} ↗</span>
        </a>)}
      </div>}

      <footer className={styles.person}>
        <div className={styles.logo}><Image src={item.logo} alt={`${item.company} logo`} width={112} height={72} sizes="52px" /></div>
        <div className={styles.identity}>
          <h3>{item.name}</h3>
          <p>{item.role} · {item.company}</p>
          {item.relationshipLabel && <span>{item.relationshipLabel}</span>}
          {item.isExcerpt && <span>Review excerpt</span>}
        </div>
        <Link className={styles.projectLink} href={item.href} aria-label={`View ${item.company} project`}>↗</Link>
      </footer>
    </article>
  );
}

function StackCard({ item, index, count, progress, active }: {
  item: Testimonial;
  index: number;
  count: number;
  progress: MotionValue<number>;
  active: boolean;
}) {
  const initialY = `${index * 10}px`;
  const start = index / Math.max(count - 1, 1);
  const end = (index + 1) / Math.max(count - 1, 1);
  const y = useTransform(progress, [start, end], [initialY, '-125%']);
  const rotate = useTransform(progress, [start, end], [Math.min(index * 1.25, 5), -9]);

  return (
    <motion.div className={styles.stackCard} style={{ y, rotate, zIndex: count - index }} aria-hidden={!active} inert={!active}>
      <TestimonialCard item={item} number={index + 1} />
    </motion.div>
  );
}

export function AnimatedTestimonials({ testimonials }: AnimatedTestimonialsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });

  useMotionValueEvent(scrollYProgress, 'change', latest => {
    setActiveIndex(Math.min(testimonials.length - 1, Math.max(0, Math.floor(latest * (testimonials.length - 1) + 0.00001))));
  });

  if (!testimonials.length) return null;

  return (
    <section id="testimonials" ref={sectionRef} className={`${styles.section}${reducedMotion ? ` ${styles.reduced}` : ''}`} aria-labelledby="home-testimonials-title" style={{ minHeight: reducedMotion ? undefined : `${100 + (testimonials.length - 1) * 45}svh` }}>
      <div className={styles.sticky}>
        <div className={styles.inner}>
          <header className={styles.heading}>
            <span className={styles.eyebrow}>In their own words</span>
            <h2 id="home-testimonials-title">What our <em>clients say.</em></h2>
            <p>Real feedback from the people behind the projects.</p>
          </header>
          {reducedMotion ? <div className={styles.reducedList}>
            {testimonials.map((item, index) => <TestimonialCard key={item.id} item={item} number={index + 1} />)}
          </div> : <div className={styles.stackStage} aria-label="Scroll to read client testimonials">
            {testimonials.map((item, index) => <StackCard key={item.id} item={item} index={index} count={testimonials.length} progress={scrollYProgress} active={activeIndex === index} />)}
          </div>}
          {!reducedMotion && <div className={styles.progress} aria-hidden="true"><span>Scroll to read</span><span>{String(activeIndex + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}</span></div>}
        </div>
      </div>
    </section>
  );
}
