import Image from 'next/image';
import Link from 'next/link';
import { InfiniteTextMarquee } from '@/components/ui/infinite-text-marquee';
import { projects } from '../data/projects';

const trustPillars = [
  [String(projects.length).padStart(2, '0'), 'Selected projects'],
  ['06', 'Core services'],
  ['04', 'Bundle deals'],
  [String(projects.filter((project) => project.projectType === 'Case Study').length).padStart(2, '0'), 'Documented case studies'],
];

type HomeShowcaseProps = {
  eyebrow?: string;
  intro?: string;
};

export function HomeShowcase({
  eyebrow = 'Branding · Websites · E-commerce · SEO · Social Media',
  intro = 'We help businesses clarify their brand, showcase their work and build a digital presence that makes it easier for people to understand, trust and contact them.',
}: HomeShowcaseProps = {}) {
  return (
    <section className="kraftt-hero" aria-labelledby="home-showcase-title">
      <div className="kraftt-hero-shape" aria-hidden="true" />

      <div className="kraftt-hero-main">
        <div className="kraftt-hero-copy">
          <p className="kraftt-hero-eyebrow">{eyebrow}</p>
          <h1 id="home-showcase-title">
            Be trusted.<br />
            Be discovered.<br />
            <span className="kraftt-hero-chosen"><span>Be chosen.</span></span>
          </h1>
          <p className="kraftt-hero-tagline"><em>“Digital presence for brands who take themselves seriously.”</em></p>
          <p className="kraftt-hero-intro">{intro}</p>
          <div className="kraftt-hero-actions">
            <Link href="/contact">Request a Free Introductory Call <span aria-hidden="true">→</span></Link>
            <Link href="/work">Explore Our Work <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="kraftt-hero-note" aria-label="Kraftt approach">
            <span>01</span><span>02</span><span>03</span>
            <p>Founder-led · India-based · Working worldwide</p>
          </div>
        </div>

        <div className="kraftt-hero-visual">
          <div className="kraftt-hero-visual-orbit" aria-hidden="true">
            <span>Research</span><i /><span>Choice</span>
          </div>
          <Image
            src="/kraftt-flat-team-hero-transparent.png"
            alt="Kraftt team planning a connected brand, website and digital growth system"
            fill
            priority
            sizes="(max-width: 900px) 96vw, 55vw"
          />
          <p><strong>K.</strong><span>One clear presence<br />across every surface</span></p>
        </div>
      </div>

      {/* <div className="kraftt-hero-trust" aria-label="Kraftt trust pillars">
        <p>Trust, made visible.</p>
        {trustPillars.map(([number, label]) => (
          <div key={label}><strong>{number}</strong><span>{label}</span></div>
        ))}
      </div> */}

      <div className="kraftt-hero-marquee" aria-label="Kraftt capabilities">
        <InfiniteTextMarquee
          text="Branding · Websites · E-commerce · Marketplace · SEO · Social Media"
          link="/services"
          speed={28}
          tooltipText="Explore our services ↗"
          fontSize="clamp(1.45rem, 2vw, 2rem)"
          textColor="var(--linen)"
          hoverColor="var(--sand)"
          showTooltip
        />
      </div>
    </section>
  );
}
