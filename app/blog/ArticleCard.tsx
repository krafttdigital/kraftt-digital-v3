import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { readingTime } from './posts';
import type { BlogPost } from './types';
import styles from './blog.module.css';

export function displayDate(date: string) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(date));
}

export function ArticleCard({ post }: { post: BlogPost }) {
  return (
    <article className={styles.card}>
      <Link href={`/blog/${post.slug}`} className={styles.cardImage} aria-label={`Read ${post.title}`}>
        <Image src={post.hero.src} alt={post.hero.alt} width={post.hero.width} height={post.hero.height} sizes="(max-width: 700px) 92vw, 560px" />
      </Link>
      <div className={styles.cardCopy}>
        <p className={styles.cardMeta}><span>{post.category}</span><span>{readingTime(post)} min read</span></p>
        <h2><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2>
        <p>{post.description}</p>
        <div className={styles.cardFooter}><time dateTime={post.publishedAt}>{displayDate(post.publishedAt)}</time><Link href={`/blog/${post.slug}`} aria-label={`Read guide — ${post.title}`}>Read guide <ArrowUpRight size={17} aria-hidden="true" /></Link></div>
      </div>
    </article>
  );
}
