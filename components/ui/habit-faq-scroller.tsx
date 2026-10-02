import type { CSSProperties, ReactNode } from 'react';

export type FaqScrollerItem = {
  id: string;
  question: string;
  answer: string;
};

export type FaqScrollerRow = {
  id: string;
  label: string;
  speed: string;
  direction: 'left' | 'right';
  faqItems: FaqScrollerItem[];
};

export type FaqSectionData = {
  mainTitle: string;
  mainSubtitle: string;
  rows: FaqScrollerRow[];
};

type DurationStyle = CSSProperties & { '--scroll-duration': string };

export function FaqCard({ question, answer, number }: FaqScrollerItem & { number: string }) {
  return (
    <article className="habit-faq-card">
      <div className="habit-faq-card-top">
        <span>FAQ / {number}</span>
        <i aria-hidden="true">↗</i>
      </div>
      <h3>{question}</h3>
      <p>{answer}</p>
    </article>
  );
}

export function HorizontalScroller({ children, speed = '40s', direction = 'left', label }: {
  children: ReactNode;
  speed?: string;
  direction?: 'left' | 'right';
  label: string;
}) {
  const style: DurationStyle = { '--scroll-duration': speed };

  return (
    <div className="habit-faq-row" aria-label={label}>
      <span className="habit-faq-row-label" aria-hidden="true">{label}</span>
      <div className={`habit-faq-track habit-faq-track-${direction}`} style={style}>
        <div className="habit-faq-group">{children}</div>
        <div className="habit-faq-group" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}

export default function FaqSection({ data }: { data: FaqSectionData }) {
  return (
    <section className="habit-faq-section" aria-label="Frequently asked questions">
      {/* <div className="habit-faq-heading">
        <div>
          <p className="eyebrow eyebrow-dark">Frequently asked questions</p>
          <span>{String(data.rows.reduce((total, row) => total + row.faqItems.length, 0)).padStart(2, '0')} practical answers</span>
        </div>
        <h2 id="homepage-faq-title">{data.mainTitle}</h2>
        <p>{data.mainSubtitle}</p>
      </div> */}

      <div className="habit-faq-rows">
        {data.rows.map((row, rowIndex) => {
          const previousQuestions = data.rows
            .slice(0, rowIndex)
            .reduce((total, previousRow) => total + previousRow.faqItems.length, 0);

          return (
            <HorizontalScroller key={row.id} speed={row.speed} direction={row.direction} label={row.label}>
              {row.faqItems.map((item, itemIndex) => (
                <FaqCard key={item.id} {...item} number={String(previousQuestions + itemIndex + 1).padStart(2, '0')} />
              ))}
            </HorizontalScroller>
          );
        })}
      </div>
    </section>
  );
}
