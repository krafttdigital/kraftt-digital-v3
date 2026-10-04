import Link from 'next/link';
import { Reveal } from './Reveal';

type AuditCTAProps = {
  title?: string;
  theme?: 'dark' | 'light';
};

export function AuditCTA({
  title = 'Let’s make the next step clear.',
  theme = 'dark',
}: AuditCTAProps) {
  const isLight = theme === 'light';

  return (
    <section className={`cta-section ${isLight ? 'cta-section-light section-light' : 'section-dark'}`}>
      <Reveal>
        <p className={`eyebrow${isLight ? ' eyebrow-dark' : ''}`}>Free introductory call</p>
        <h2>{title}</h2>
        <p>Tell us what you need. We’ll discuss the fit, the likely scope and a sensible starting point.</p>
        <Link className="button button-accent" href="/contact">Request a Free Introductory Call</Link>
      </Reveal>
    </section>
  );
}
