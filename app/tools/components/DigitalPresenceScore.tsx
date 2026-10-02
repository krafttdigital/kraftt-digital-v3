'use client';

import { useMemo, useRef, useState, type FormEvent } from 'react';
import { Button, ResultActions } from './ToolSuite';
import { RegionalPriceCopy } from '../../components/PricingCurrencyProvider';

type CategoryKey = 'brand' | 'website' | 'enquiry' | 'tracking';
type Answer = { points: number; category: CategoryKey };

const categories: { key: CategoryKey; label: string; heading: string; questions: { text: string; options: [string, string, string] }[] }[] = [
  {
    key: 'brand', label: 'Brand Clarity', heading: 'Does your brand look and read the same everywhere?',
    questions: [
      { text: 'Does your logo and colors look the same on your website, Instagram, and Google Business Profile?', options: ['No', 'Mostly', 'Yes, exactly'] },
      { text: "Can a new visitor tell what you do and who it's for within 5 seconds?", options: ['No', 'Somewhat', 'Yes, clearly'] },
      { text: 'Do you have real photos of your work/products/space online, not just stock images?', options: ['No', 'A few', 'Yes, plenty'] },
    ],
  },
  {
    key: 'website', label: 'Website & Search', heading: 'Can people actually find you?',
    questions: [
      { text: 'Do you have a website, and is it fast and modern?', options: ['No website', 'Yes, but outdated', 'Yes, modern & fast'] },
      { text: 'Searching your business name on Google — does your site appear on page 1?', options: ['No', 'Sometimes', 'Yes, consistently'] },
      { text: 'Is your website easy to use on a phone?', options: ["No / haven't checked", 'Somewhat', 'Yes, fully'] },
    ],
  },
  {
    key: 'enquiry', label: 'Enquiry & WhatsApp Flow', heading: 'How easy is it to actually contact you?',
    questions: [
      { text: 'Can a visitor message you on WhatsApp with one click from your site or profile?', options: ['No', 'Just a number listed', 'Yes, one-click'] },
      { text: 'Do you have a contact form, beyond just a phone number?', options: ['No', 'Just a number/email', 'Yes, form + more'] },
      { text: 'Do you know roughly how many enquiries you get online per month?', options: ['No idea', 'Rough guess', 'Yes, tracked'] },
    ],
  },
  {
    key: 'tracking', label: 'Tracking & Ownership', heading: 'Do you actually own and measure your presence?',
    questions: [
      { text: 'Do you personally hold your domain and hosting login?', options: ['No / not sure', 'Shared access', 'Yes, fully mine'] },
      { text: 'Do you have Google Analytics or Search Console set up?', options: ['No', 'Not sure', 'Yes'] },
      { text: 'Is your Google Business Profile claimed and verified?', options: ['No', 'Not sure', 'Yes'] },
    ],
  },
];

const notes: Record<CategoryKey, { low: string; high: string }> = {
  brand: { low: "Your brand doesn't look consistent everywhere a customer sees it yet — that's the first trust signal people notice.", high: 'Your brand reads consistently across the places customers actually look.' },
  website: { low: "Your website either doesn't exist, isn't found on Google, or isn't working well on mobile — this is usually the single biggest gap.", high: 'Your website is doing real work for you — visible, fast, and mobile-friendly.' },
  enquiry: { low: "Visitors may be interested but don't have an easy way to actually reach you — enquiries are likely leaking here.", high: "You've made it genuinely easy for an interested visitor to reach you." },
  tracking: { low: "You don't fully own or measure your own presence yet — hard to know what's working without this.", high: 'You own and measure your presence properly — a solid foundation.' },
};

const serviceByFocus: Record<CategoryKey, { href: string; label: string }> = {
  brand: { href: '/services/brand-identity', label: 'Explore Brand Identity' },
  website: { href: '/services/web-design-development', label: 'Explore Web Design & Development' },
  enquiry: { href: '/services/web-design-development', label: 'Explore Web Design & Development' },
  tracking: { href: '/services/ecommerce-seo', label: 'Explore SEO Services' },
};

export function DigitalPresenceScore() {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [result, setResult] = useState<{ total: number; scores: Record<CategoryKey, number>; focus: CategoryKey } | null>(null);
  const resultRef = useRef<HTMLElement>(null);
  const answered = Object.keys(answers).length;

  const resultBand = useMemo(() => {
    if (!result) return '';
    if (result.total <= 40) return 'Your presence needs foundational work';
    if (result.total <= 70) return 'You have a presence, but real gaps are costing you enquiries';
    if (result.total <= 90) return 'Strong presence — refinement, not rebuilding';
    return 'Excellent — rare to see this score';
  }, [result]);

  function calculate(event: FormEvent) {
    event.preventDefault();
    if (answered !== 12) return;
    const raw: Record<CategoryKey, number> = { brand: 0, website: 0, enquiry: 0, tracking: 0 };
    Object.values(answers).forEach((answer) => { raw[answer.category] += answer.points; });
    const scores = Object.fromEntries(categories.map((category) => [category.key, Math.round((raw[category.key] / 6) * 25)])) as Record<CategoryKey, number>;
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const focus = categories.reduce((lowest, category) => scores[category.key] < scores[lowest.key] ? category : lowest).key;
    setResult({ total, scores, focus });
    window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  }

  return (
    <>
      <form className="tool-quiz tool-wrap-wide" id="tool-workspace" onSubmit={calculate}>
        {categories.map((category) => (
          <section className="tool-category" key={category.key}>
            <div className="tool-category-heading">
              <p className="tool-eyebrow">{category.label}</p>
              <h2>{category.heading}</h2>
            </div>
            <div className="tool-category-questions">
              {category.questions.map((question, questionIndex) => {
                const answerKey = `${category.key}-${questionIndex + 1}`;
                return (
                  <div className="tool-question" key={question.text}>
                    <p>{question.text}</p>
                    <div className="tool-options" role="group" aria-label={question.text}>
                      {question.options.map((option, points) => (
                        <button
                          type="button"
                          className={`tool-option${answers[answerKey]?.points === points ? ' selected' : ''}`}
                          aria-pressed={answers[answerKey]?.points === points}
                          key={option}
                          onClick={() => setAnswers((current) => ({ ...current, [answerKey]: { points, category: category.key } }))}
                        >{option}</button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
        <Button type="submit" disabled={answered < 12}>
          {answered < 12 ? `Calculate My Score (${answered}/12 answered)` : 'Calculate My Score'}
        </Button>
      </form>

      {result && (
        <section className="tool-results show" ref={resultRef} aria-live="polite">
          <div className="tool-wrap">
            <div className="tool-score-hero">
              <p className="tool-eyebrow">Your Digital Presence Score</p>
              <div className="tool-score-number">{result.total}<span>/100</span></div>
              <p>{resultBand}</p>
            </div>
            <div className="tool-score-bars">
              {categories.map((category) => {
                const score = result.scores[category.key];
                return (
                  <div className="tool-score-row" key={category.key}>
                    <div><span>{category.label}</span><span>{score}/25</span></div>
                    <div className="tool-bar-track"><span style={{ width: `${(score / 25) * 100}%` }} /></div>
                    <p>{score <= 12 ? notes[category.key].low : notes[category.key].high}</p>
                  </div>
                );
              })}
            </div>
            <div className="tool-result-cta">
              <h3>Your free score flags the categories.</h3>
              <p><RegionalPriceCopy>The ₹999 Digital Presence Audit tells you exactly what to fix and how — in detail, not a summary.</RegionalPriceCopy></p>
              <ResultActions
                serviceHref={serviceByFocus[result.focus].href}
                serviceLabel={serviceByFocus[result.focus].label}
                auditHref={`/audit?score=${result.total}&focus=${result.focus}`}
              />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
