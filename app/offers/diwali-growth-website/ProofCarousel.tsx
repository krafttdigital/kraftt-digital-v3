'use client';

import Image from 'next/image';
import { ArrowUpRight, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import styles from './page.module.css';

type Proof = {
  category: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  width: number;
  height: number;
  video?: string;
};

const proofs: Proof[] = [
  {
    category: 'SEO foundation',
    title: 'A clearer search presence.',
    description: 'A captured search result for Shree Hari Spintex showing its website and sitelinks.',
    image: '/assets/projects/shree-hari-spintex/shsl-jsonld.png',
    alt: 'Google search screenshot for Shree Hari Spintex, including its website and sitelinks',
    width: 1881,
    height: 877,
  },
  {
    category: 'AEO / GEO example',
    title: 'Visible in an AI answer.',
    description: 'A captured AI answer citing the Mittal Architect website. Placement can change.',
    image: '/assets/projects/mittal-architect/mittal-ai-answer.jpeg',
    alt: 'Google AI answer screenshot citing the Mittal Architect website',
    width: 1178,
    height: 690,
  },
  {
    category: 'Design in practice',
    title: 'See the design in motion.',
    description: 'A short desktop walkthrough of the Elixir Beverages website, from its hero to the product story.',
    image: '/assets/projects/elixir-beverages/elixir-design-poster.webp',
    alt: 'Elixir Beverages website design preview',
    width: 1100,
    height: 627,
    video: '/assets/projects/elixir-beverages/elixir-design-in-practice.mp4',
  },
] as const;

export function ProofCarousel() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const proof = proofs[index];
  useEffect(() => {
    if (playing) videoRef.current?.focus();
  }, [playing]);
  const show = (nextIndex: number) => {
    setPlaying(false);
    setIndex((nextIndex + proofs.length) % proofs.length);
  };

  return <div className={styles.carousel} aria-label="Past project proof examples">
    <div className={styles.carouselFrame} aria-live="polite">
      {proof.video ? (playing
        ? <video ref={videoRef} className={styles.carouselVideo} controls autoPlay playsInline preload="none" poster={proof.image} width={1280} height={730} tabIndex={0} aria-label="Elixir Beverages website walkthrough"><source src={proof.video} type="video/mp4" />Your browser does not support video playback.</video>
        : <button className={styles.carouselVideoPoster} type="button" onClick={() => setPlaying(true)} aria-label="Play Elixir Beverages website walkthrough">
            <Image src={proof.image} alt="" width={proof.width} height={proof.height} sizes="(max-width: 900px) calc(100vw - 44px), 66vw" />
            <span><Play size={17} fill="currentColor" aria-hidden="true" /> Watch the walkthrough</span>
          </button>)
        : <a className={styles.carouselImageLink} href={proof.image} target="_blank" rel="noopener noreferrer" aria-label={`Open full image: ${proof.alt}`}>
            <Image key={proof.image} src={proof.image} alt={proof.alt} width={proof.width} height={proof.height} sizes="(max-width: 900px) calc(100vw - 44px), 66vw" />
            <span>View full image <ArrowUpRight size={15} aria-hidden="true" /></span>
          </a>}
      <div className={styles.carouselCopy}>
        <span className={styles.carouselCategory}>{proof.category}</span>
        <strong>{proof.title}</strong>
        <p>{proof.description}</p>
        <small>Past-project example. Search and AI appearances can change.</small>
      </div>
    </div>
    <div className={styles.carouselControls}>
      <span aria-hidden="true">{String(index + 1).padStart(2, '0')} / {String(proofs.length).padStart(2, '0')}</span>
      <div className={styles.carouselDots} aria-label="Choose proof image">{proofs.map((item, dotIndex) => <button key={item.image} type="button" aria-label={`Show ${item.category} example`} aria-pressed={dotIndex === index} onClick={() => show(dotIndex)} />)}</div>
      <div className={styles.carouselArrows}><button type="button" aria-label="Previous proof" onClick={() => show(index - 1)}><ChevronLeft size={20} aria-hidden="true" /></button><button type="button" aria-label="Next proof" onClick={() => show(index + 1)}><ChevronRight size={20} aria-hidden="true" /></button></div>
    </div>
  </div>;
}
