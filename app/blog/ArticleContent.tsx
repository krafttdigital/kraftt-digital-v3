import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, ClipboardList, Layers, Palette, Rocket, Search, Settings2 } from 'lucide-react';
import type { ArticleBlock, ArticleText, BlogPost } from './types';
import { articleDiagrams } from './diagrams';
import styles from './blog.module.css';

export function RichText({ content }: { content: ArticleText }) {
  return <>{content.map((part, index) => typeof part === 'string'
    ? part
    : <Link href={part.href} key={index}>{part.text}</Link>)}</>;
}

export function ArticleContents({ post }: { post: BlogPost }) {
  return (
    <nav aria-label="Article contents">
      <ul>
        {post.sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}
        {post.faqs.length > 0 && <li><a href="#article-faqs">Frequently asked questions</a></li>}
      </ul>
    </nav>
  );
}

function Diagram({ variant }: { variant: 'website-plan' | 'identity-system' }) {
  const diagram = articleDiagrams[variant];
  const icons = variant === 'website-plan'
    ? [ClipboardList, Layers, Settings2, Search, Rocket]
    : [Search, Palette, Layers, ClipboardList];
  return (
    <figure className={styles.diagram}>
      <figcaption>
        <strong>{diagram.title}</strong>
        <span>{diagram.description}</span>
      </figcaption>
      <ol>
        {diagram.steps.map((step, index) => {
          const Icon = icons[index];
          return <li key={step.title}><Icon size={22} strokeWidth={1.4} aria-hidden="true" /><strong>{step.title}</strong><p>{step.detail}</p></li>;
        })}
      </ol>
      <p className={styles.diagramCaption}>{diagram.caption}</p>
    </figure>
  );
}

export function ContentBlock({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case 'paragraph':
      return <p><RichText content={block.content} /></p>;
    case 'list': {
      const List = block.ordered ? 'ol' : 'ul';
      return <List className={styles.proseList}>{block.items.map((item, index) => <li key={index}><RichText content={item} /></li>)}</List>;
    }
    case 'table':
      return (
        <div className={styles.tableBlock}>
          <div className={styles.tableScroll} role="region" aria-label={block.caption} tabIndex={0}>
            <table>
              <caption>{block.caption}</caption>
              <thead><tr>{block.columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
              <tbody>{block.rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => cellIndex === 0
                ? <th scope="row" key={cellIndex}>{cell}</th>
                : <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <p className={styles.tableHint}>Scroll across to compare every column.</p>
        </div>
      );
    case 'callout':
      return <aside className={styles.callout}><h3>{block.title}</h3><p><RichText content={block.content} /></p></aside>;
    case 'checklist':
      return <div className={styles.checklist}><h3>{block.title}</h3><ul>{block.items.map(item => <li key={item}><Check size={17} aria-hidden="true" /><span>{item}</span></li>)}</ul></div>;
    case 'diagram':
      return <Diagram variant={block.variant} />;
    case 'figure': {
      const visual = <Image src={block.src} alt={block.alt} width={block.width} height={block.height} sizes="(max-width: 900px) 92vw, 740px" />;
      return <figure className={styles.figure}>{block.href ? <Link href={block.href}>{visual}</Link> : visual}<figcaption>{block.caption}</figcaption></figure>;
    }
    case 'cta':
      return <aside className={styles.inlineCta}><div><h3>{block.title}</h3><p>{block.content}</p></div><Link href={block.link.href}>{block.link.label}<ArrowRight size={17} aria-hidden="true" /></Link></aside>;
  }
}
