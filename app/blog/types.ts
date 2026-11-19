export type ArticleText = Array<string | { text: string; href: string }>;

export type ArticleLink = { label: string; href: string };

export type ArticleBlock =
  | { type: 'paragraph'; content: ArticleText }
  | { type: 'list'; items: ArticleText[]; ordered?: boolean }
  | { type: 'table'; caption: string; columns: string[]; rows: string[][] }
  | { type: 'callout'; title: string; content: ArticleText }
  | { type: 'checklist'; title: string; items: string[] }
  | { type: 'diagram'; variant: 'website-plan' | 'identity-system' }
  | { type: 'figure'; src: string; alt: string; caption: string; width: number; height: number; href?: string }
  | { type: 'cta'; title: string; content: string; link: ArticleLink };

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: 'Websites' | 'Branding';
  status: 'draft' | 'published';
  publishedAt: string;
  updatedAt: string;
  hero: { src: string; alt: string; caption: string; width: number; height: number };
  introduction: ArticleText;
  sections: Array<{ id: string; title: string; blocks: ArticleBlock[] }>;
  faqs: Array<{ question: string; answer: ArticleText }>;
  closing: { title: string; content: string; primary: ArticleLink; secondary: ArticleLink };
};
