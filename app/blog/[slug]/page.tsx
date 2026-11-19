import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { JsonLd } from '../../components/JsonLd';
import { absoluteUrl, createPageMetadata, createPageSchema, organizationId } from '../../data/seo';
import { ArticleCard, displayDate } from '../ArticleCard';
import { ArticleContents, ContentBlock, RichText } from '../ArticleContent';
import { articleWordCount, blogAuthor, findPublishedPost, publishedPosts, readingTime } from '../posts';
import styles from '../blog.module.css';

export const dynamicParams = false;
export function generateStaticParams() {
  return publishedPosts().map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = findPublishedPost(slug);
  if (!post) notFound();
  const metadata = createPageMetadata({
    title: `${post.title} | Kraftt Digital`, description: post.description, path: `/blog/${slug}`,
    label: post.category, type: 'article', image: post.hero.src, imageAlt: post.hero.alt,
  });
  return {
    ...metadata,
    authors: [{ name: blogAuthor.name, url: absoluteUrl(blogAuthor.url) }],
    openGraph: { ...metadata.openGraph, type: 'article', publishedTime: post.publishedAt, modifiedTime: post.updatedAt, authors: [absoluteUrl(blogAuthor.url)], section: post.category,
      images: [{ url: absoluteUrl(post.hero.src), width: post.hero.width, height: post.hero.height, type: 'image/webp', alt: post.hero.alt }],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = findPublishedPost(slug);
  if (!post) notFound();
  const path = `/blog/${slug}`;
  const breadcrumbName = post.title.split(':')[0];
  const related = publishedPosts().filter(item => item.slug !== slug).slice(0, 2);
  return (
    <main id="blog-content" tabIndex={-1} className={styles.articlePage}>
      <JsonLd data={createPageSchema({
        name: post.title, description: post.description, path,
        breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Insights', path: '/blog' }, { name: breadcrumbName, path }],
        entities: [{
          '@type': 'BlogPosting', '@id': absoluteUrl(`${path}#article`), url: absoluteUrl(path),
          headline: post.title, description: post.description, datePublished: post.publishedAt, dateModified: post.updatedAt,
          inLanguage: 'en-IN', articleSection: post.category, wordCount: articleWordCount(post),
          image: { '@type': 'ImageObject', url: absoluteUrl(post.hero.src), width: post.hero.width, height: post.hero.height, caption: post.hero.caption },
          author: { '@type': 'Organization', '@id': organizationId, name: blogAuthor.name, url: absoluteUrl(blogAuthor.url) },
          publisher: { '@id': organizationId }, mainEntityOfPage: { '@id': absoluteUrl(`${path}#webpage`) },
        }],
      })} />
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <ol><li><Link href="/">Home</Link></li><li><Link href="/blog">Insights</Link></li><li aria-current="page">{breadcrumbName}</li></ol>
      </nav>
      <article>
        <header className={styles.articleHeader}>
          <div className={styles.articleLead}>
            <p className={styles.eyebrow}>{post.category} · A practical guide</p>
            <h1>{post.title}</h1>
            <div className={styles.introduction}><p><RichText content={post.introduction} /></p></div>
            <p className={styles.byline}><span>By <Link href={blogAuthor.url}>{blogAuthor.name}</Link></span><time dateTime={post.publishedAt}>{displayDate(post.publishedAt)}</time><span>{readingTime(post)} min read</span></p>
            {post.updatedAt !== post.publishedAt && <p className={styles.updated}>Updated <time dateTime={post.updatedAt}>{displayDate(post.updatedAt)}</time></p>}
          </div>
          <figure className={styles.heroFigure}>
            <Image src={post.hero.src} alt={post.hero.alt} width={post.hero.width} height={post.hero.height} sizes="(max-width: 900px) 92vw, 560px" preload />
            <figcaption>{post.hero.caption}</figcaption>
          </figure>
        </header>
        <details className={styles.mobileContents}>
          <summary>In this article <ChevronDown size={18} aria-hidden="true" /></summary>
          <ArticleContents post={post} />
        </details>
        <div className={styles.articleGrid}>
          <aside className={styles.desktopContents}><div><p>In this article</p><ArticleContents post={post} /></div></aside>
          <div className={styles.prose}>
            {post.sections.map(section => (
              <section key={section.id} id={section.id} className={styles.articleSection}>
                <h2>{section.title}</h2>
                {section.blocks.map((block, index) => <ContentBlock key={index} block={block} />)}
              </section>
            ))}
            {post.faqs.length > 0 && <section id="article-faqs" className={styles.faq}>
              <p className={styles.eyebrow}>A few more questions</p><h2>Frequently asked questions</h2>
              {post.faqs.map(faq => <details key={faq.question}><summary>{faq.question}<ChevronDown size={18} aria-hidden="true" /></summary><p><RichText content={faq.answer} /></p></details>)}
            </section>}
            <aside className={styles.closing}>
              <h2>{post.closing.title}</h2><p>{post.closing.content}</p>
              <div><Link href={post.closing.primary.href} className="button button-accent">{post.closing.primary.label}<ArrowRight size={18} aria-hidden="true" /></Link><Link href={post.closing.secondary.href} className={styles.closingLink}>{post.closing.secondary.label}<ArrowRight size={17} aria-hidden="true" /></Link></div>
            </aside>
          </div>
        </div>
      </article>
      {related.length > 0 && <section className={styles.related} aria-labelledby="related-title">
        <div><h2 id="related-title">Keep reading.</h2><Link href="/blog">All insights <ArrowRight size={16} aria-hidden="true" /></Link></div>
        <div className={styles.cardGrid}>{related.map(item => <ArticleCard key={item.slug} post={item} />)}</div>
      </section>}
    </main>
  );
}
