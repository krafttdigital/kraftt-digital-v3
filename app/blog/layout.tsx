import type { ReactNode } from 'react';
import { SiteHeader } from '../components/SiteHeader';
import { Footer } from '../components/Footer';
import styles from './blog.module.css';

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <a href="#blog-content" className={styles.skipLink}>Skip to content</a>
      <SiteHeader />
      {children}
      <Footer />
    </div>
  );
}
