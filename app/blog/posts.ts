import { smallBusinessWebsitePost } from './articles/small-business-website-design';
import { startupBrandingPost } from './articles/brand-identity-for-startups';
import { articleDiagrams } from './diagrams';
import type { ArticleBlock, ArticleText, BlogPost } from './types';

export const blogAuthor = { name: 'Kraftt Digital', url: '/about' } as const;

const posts: BlogPost[] = [smallBusinessWebsitePost, startupBrandingPost];

export function publishedPosts(): BlogPost[] {
  return posts
    .filter((post) => post.status === 'published')
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug));
}

export function findPublishedPost(slug: string): BlogPost | undefined {
  return publishedPosts().find((post) => post.slug === slug);
}

function plainText(content: ArticleText): string {
  return content.map((part) => typeof part === 'string' ? part : part.text).join('');
}

function blockText(block: ArticleBlock): string {
  switch (block.type) {
    case 'paragraph':
      return plainText(block.content);
    case 'list':
      return block.items.map(plainText).join(' ');
    case 'table':
      return [block.caption, ...block.columns, ...block.rows.flat()].join(' ');
    case 'callout':
      return [block.title, plainText(block.content)].join(' ');
    case 'checklist':
      return [block.title, ...block.items].join(' ');
    case 'figure':
      return block.caption;
    case 'cta':
      return [block.title, block.content, block.link.label].join(' ');
    case 'diagram': {
      const diagram = articleDiagrams[block.variant];
      return [
        diagram.title,
        diagram.description,
        ...diagram.steps.flatMap((step) => [step.title, step.detail]),
        diagram.caption,
      ].join(' ');
    }
  }
}

export function articleWordCount(post: BlogPost): number {
  const visibleText = [
    post.title,
    plainText(post.introduction),
    post.hero.caption,
    ...post.sections.flatMap((section) => [
      section.title,
      ...section.blocks.map(blockText),
    ]),
    ...post.faqs.flatMap((faq) => [faq.question, plainText(faq.answer)]),
    post.closing.title,
    post.closing.content,
    post.closing.primary.label,
    post.closing.secondary.label,
  ].join(' ');

  return visibleText.match(/[\p{L}\p{N}]+(?:['’.-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

export function readingTime(post: BlogPost): number {
  return Math.max(1, Math.ceil(articleWordCount(post) / 200));
}
