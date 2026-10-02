'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { navItems } from '../data/site';
import { BrandWordmark } from './BrandWordmark';

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);

  const closeMobileMenu = () => {
    if (mobileMenuRef.current) mobileMenuRef.current.open = false;
  };

  useEffect(() => {
    const updateHeader = () => setIsScrolled(window.scrollY > 24);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    return () => window.removeEventListener('scroll', updateHeader);
  }, []);

  useEffect(() => {
    if (mobileMenuRef.current) mobileMenuRef.current.open = false;
  }, [pathname]);

  useEffect(() => {
    const handleOutsidePointer = (event: PointerEvent) => {
      const menu = mobileMenuRef.current;
      if (menu?.open && event.target instanceof Node && !menu.contains(event.target)) {
        menu.open = false;
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !mobileMenuRef.current?.open) return;
      mobileMenuRef.current.open = false;
      mobileMenuRef.current.querySelector('summary')?.focus();
    };

    document.addEventListener('pointerdown', handleOutsidePointer, true);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointer, true);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <header className={`site-header${overlay ? ' site-header-overlay' : ''}${isScrolled ? ' site-header-scrolled' : ''}`}>
      <Link href="/" aria-label="Kraftt Digital home" className="brand-link">
        <BrandWordmark />
      </Link>

      <nav className="desktop-nav" aria-label="Primary navigation">
        {navItems.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
      </nav>

      <Link className="header-cta" href="/contact#intro-call">
        Request a Free Call <span aria-hidden="true">↗</span>
      </Link>

      <details className="mobile-menu" ref={mobileMenuRef}>
        <summary aria-label="Open navigation">Menu</summary>
        <nav aria-label="Mobile navigation">
          {navItems.map((item) => <Link key={item.href} href={item.href} onClick={closeMobileMenu}>{item.label}</Link>)}
          <Link href="/contact" onClick={closeMobileMenu}>Request a Free Introductory Call</Link>
        </nav>
      </details>
    </header>
  );
}
