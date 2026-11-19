import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '../components/JsonLd';
import { absoluteUrl, createPageMetadata, createPageSchema } from '../data/seo';
import { ArticleCard } from './ArticleCard';
import { publishedPosts } from './posts';
import styles from './blog.module.css';

const title = 'Insights on Websites & Brand Identity | Kraftt Digital';
const description = 'Practical guides to planning a small-business website and a startup brand identity, with clear scopes, checklists and examples from Kraftt Digital.';

export const metadata: Metadata = createPageMetadata({ title, description, path: '/blog', label: 'Kraftt Insights' });

export default function BlogPage() {
  const posts = publishedPosts();
  return (
    <main id="blog-content" tabIndex={-1} className={styles.index}>
      <JsonLd data={createPageSchema({
        name: title, description, path: '/blog', breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Insights', path: '/blog' }],
        entities: [{
          '@type': 'ItemList', '@id': absoluteUrl('/blog#articles'),
          itemListElement: posts.map((post, index) => ({ '@type': 'ListItem', position: index + 1, name: post.title, url: absoluteUrl(`/blog/${post.slug}`) })),
        }],
      })} />
      <header className={styles.indexHeader}>
        <div><p className={styles.eyebrow}>The Kraftt perspective</p><h1>Insights<span>.</span></h1></div>
        <p>Practical guidance for your next website or brand. Understand the scope, ask better questions and plan what your business needs.</p>
      </header>
      <div className={styles.indexTopics}><span>Websites</span><span>Brand identity</span><Link href="/tools">Explore our free calculators <span aria-hidden="true">↗</span></Link></div>
      <div className={styles.cardGrid}>{posts.map(post => <ArticleCard key={post.slug} post={post} />)}</div>
    </main>
  );
}
