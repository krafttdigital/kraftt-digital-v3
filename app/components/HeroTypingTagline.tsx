'use client';

import { useEffect, useState } from 'react';

const tagline = 'Be trusted. Be discovered. Be chosen.';

export function HeroTypingTagline() {
  const [visibleText, setVisibleText] = useState(tagline);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer: ReturnType<typeof setTimeout>;
    let length = 0;
    let deleting = false;

    const tick = () => {
      length += deleting ? -1 : 1;
      setVisibleText(tagline.slice(0, length));

      if (length === tagline.length) {
        deleting = true;
        timer = setTimeout(tick, 1700);
      } else if (length === 0) {
        deleting = false;
        timer = setTimeout(tick, 450);
      } else {
        timer = setTimeout(tick, deleting ? 35 : 70);
      }
    };

    const updateMotion = () => {
      clearTimeout(timer);
      if (reducedMotion.matches) {
        setVisibleText(tagline);
      } else {
        length = 0;
        deleting = false;
        timer = setTimeout(tick, 600);
      }
    };

    updateMotion();
    reducedMotion.addEventListener('change', updateMotion);
    return () => {
      clearTimeout(timer);
      reducedMotion.removeEventListener('change', updateMotion);
    };
  }, []);

  return <p className="kraftt-hero-tagline kraftt-hero-typing-tagline">
    <em className="kraftt-hero-typing-frame">
      <span className="kraftt-hero-typing-measure" aria-hidden="true">{tagline}</span>
      <span className="kraftt-hero-typing-text" aria-hidden="true">{visibleText}<span className="kraftt-hero-typing-caret" /></span>
      <span className="sr-only">{tagline}</span>
    </em>
  </p>;
}
