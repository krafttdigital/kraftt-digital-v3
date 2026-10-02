import Link from 'next/link';
import type { ReactNode } from 'react';

export type Faq6Item = {
  id: string;
  question: string;
  answer: ReactNode;
  links?: Array<{ label: string; href: string }>;
};

export type Faq6Category = {
  id: string;
  title: string;
  items: Faq6Item[];
};

export type Faq6Data = {
  eyebrow: string;
  title: string;
  subtitle: string;
  categories: Faq6Category[];
};

type FaqProps = {
  data: Faq6Data;
  id?: string;
  className?: string;
};

function safeId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function Faq({ data, id, className = '' }: FaqProps) {
  const namespace = id ?? `faq-${safeId(data.title)}`;

  return (
    <section id={id} className={`faq6 ${className}`.trim()} aria-label={data.title}>
      {/* <header className="faq6-header">
        <div>
          <p>{data.eyebrow}</p>
          <span>{String(questionCount).padStart(2, '0')} practical answers</span>
        </div>
        <h2 id="homepage-faq-heading">{data.title}</h2>
        <p>{data.subtitle}</p>
      </header> */}

      <div className="faq6-grid">
        {data.categories.map((category, categoryIndex) => {
          const categoryDomId = `${safeId(namespace)}-category-${safeId(category.id)}`;
          return (
          <section className="faq6-category" data-tone={categoryIndex % 3} key={category.id} aria-labelledby={categoryDomId}>
            <h3 id={categoryDomId}><span>0{categoryIndex + 1}</span>{category.title}</h3>
            <div className="faq6-list">
              {category.items.map((item, itemIndex) => {
                return (
                  <details className="faq6-item" name={`faq-${safeId(category.id)}`} key={item.id}>
                    {/* open={itemIndex === 0} */}
                    <summary>
                      <span><small>{String(itemIndex + 1).padStart(2, '0')}</small>{item.question}</span>
                      <i aria-hidden="true">+</i>
                    </summary>
                    <div className="faq6-content">
                      <div>
                        <p>{item.answer}</p>
                        {item.links?.length ? (
                          <div className="faq6-links" aria-label="Related links">
                            {item.links.map((link) => <Link href={link.href} key={link.href}>{link.label} <i aria-hidden="true">↗</i></Link>)}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          </section>
          );
        })}
      </div>

      <div className="faq6-contact">
        <span>Still have a question? Ask us directly.</span>
        <a href="mailto:hello@krafttdigital.in">hello@krafttdigital.in <i aria-hidden="true">↗</i></a>
      </div>
    </section>
  );
}

export type PageFaqItem = {
  question: string;
  answer: ReactNode;
  links?: Array<{ label: string; href: string }>;
};

type PageFaqProps = {
  id?: string;
  title: string;
  eyebrow?: string;
  subtitle?: string;
  items: readonly PageFaqItem[];
  categoryTitles?: readonly [string, string];
  className?: string;
};

export function PageFaq({
  id,
  title,
  eyebrow = 'Frequently asked questions',
  subtitle = 'Clear answers before you decide.',
  items,
  categoryTitles = ['The essentials', 'Working together'],
  className,
}: PageFaqProps) {
  const midpoint = Math.ceil(items.length / 2);
  const groups = [items.slice(0, midpoint), items.slice(midpoint)].filter((group) => group.length > 0);
  const baseId = safeId(id ?? title);
  const data: Faq6Data = {
    eyebrow,
    title,
    subtitle,
    categories: groups.map((group, categoryIndex) => ({
      id: `${baseId}-${categoryIndex + 1}`,
      title: categoryTitles[categoryIndex] ?? `More answers`,
      items: group.map((item, itemIndex) => ({
        ...item,
        id: `${baseId}-${categoryIndex + 1}-${itemIndex + 1}`,
      })),
    })),
  };

  return <Faq id={id} className={className} data={data} />;
}
