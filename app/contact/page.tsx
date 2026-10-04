import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowUpRight,
  Check,
  Mail,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { Footer } from '../components/Footer';
import { JsonLd } from '../components/JsonLd';
import { Reveal } from '../components/Reveal';
import { SiteHeader } from '../components/SiteHeader';
import { createPageMetadata, createPageSchema, faqSchema } from '../data/seo';
import { contactEmail, contactPhone, contactPhoneHref } from '../data/site';
import { ContactForm } from './ContactForm';
import { IntroCallLink } from './IntroCallLink';
import { PageFaq } from '@/components/ui/faq-6';

const pageTitle = 'Contact Kraftt Digital | Website, Branding & Digital Projects';
const pageDescription = 'Tell Kraftt Digital about your website, branding, e-commerce, SEO or social project. Send a short enquiry through the form or WhatsApp, or email hello@krafttdigital.in.';

const proofItems = [
  'Branding · websites · e-commerce · marketplace · SEO',
  'Client-reported ₹30L+ stock sales',
  'Direct enquiries generated',
  'Stronger Google and Maps visibility',
  'Thousands saved on production and platform costs',
] as const;

const quickAnswers = [
  ['What we can handle', 'Brand, website, e-commerce, marketplace, SEO and content.'],
  ['What to send', 'Your goal, current issue, timing and any useful links.'],
  ['What happens next', 'We review it, recommend the right route and reply with a clear action.'],
  ['Your commitment', 'The first conversation is free. Scope and pricing come before the work.'],
] as const;

const faqs = [
  { question: 'What can I ask Kraftt Digital to help with?', answer: 'Kraftt works on brand identity, websites, e-commerce stores, marketplace catalogues, SEO, social media and custom digital systems. Tell us the business goal even if you are unsure which service fits.' },
  { question: 'Why choose Kraftt Digital for a website project?', answer: 'Kraftt connects business positioning, brand, site structure, development and enquiry paths in one project. You can review the scope and pricing on the services pages, see documented work in the case studies, and agree the deliverables before work starts.' },
  { question: 'Do I need to buy the Digital Presence Audit first?', answer: 'No. You can send an enquiry or request a free introductory call. The paid Digital Presence Audit is an optional, separate service for a deeper researched review.' },
  { question: 'Can we work together if my business is outside Bathinda?', answer: 'Yes. Kraftt works remotely with businesses across India and international markets through calls, email, WhatsApp and documented approvals. City pages describe service areas and do not imply a local office.' },
] as const;

export const metadata: Metadata = createPageMetadata({ title: pageTitle, description: pageDescription, path: '/contact', label: 'Contact Kraftt' });


export default function ContactPage() {
  return (
    <main className="contact-page">
      <JsonLd data={createPageSchema({ name: pageTitle, description: pageDescription, path: '/contact', breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }], entities: [faqSchema(faqs, '/contact')] })} />
      <SiteHeader />

      <div className="contact-proof-marquee" aria-label="Kraftt capabilities and client-reported outcomes">
        <div className="contact-proof-marquee-track" aria-hidden="true">
          {[0, 1].map((group) => (
            <div className="contact-proof-marquee-group" key={group}>
              {proofItems.map((item) => <span key={`${group}-${item}`}>{item}<i>✦</i></span>)}
            </div>
          ))}
        </div>
      </div>

      <section className="contact-hero section-light" id="intro-call">
        <Reveal className="contact-hero-copy">
          <p className="eyebrow eyebrow-dark">One-minute project enquiry</p>
          <h1>Tell us the goal.<br /><em>Get a clear next step.</em></h1>
          <p>Short on time? Share the essentials. You do not need a polished brief or the right service name.</p>

          <div className="contact-quick-actions">
            <IntroCallLink className="button button-accent">Start on WhatsApp <ArrowUpRight size={15} aria-hidden="true" /></IntroCallLink>
            <a className="button button-outline-dark" href={contactPhoneHref}>Call {contactPhone} <Phone size={15} aria-hidden="true" /></a>
          </div>

          <div className="contact-scan-points" aria-label="What to know before contacting Kraftt">
            {quickAnswers.map(([title, detail]) => (
              <div key={title}>
                <Check size={15} strokeWidth={2} aria-hidden="true" />
                <p><strong>{title}</strong><span>{detail}</span></p>
              </div>
            ))}
          </div>
          <div className="contact-trust-line" aria-label="Kraftt service principles">
            <span><Check size={13} aria-hidden="true" /> Founder-led</span>
            <span><Check size={13} aria-hidden="true" /> India-based</span>
            <span><Check size={13} aria-hidden="true" /> Working worldwide</span>
          </div>
        </Reveal>

        <Reveal className="contact-form-panel" direction="right" delay={0.08}>
          <div className="contact-form-heading">
            <div><p className="eyebrow eyebrow-dark">Short form · about one minute</p><h2>Share the essentials.</h2></div>
            <span>01</span>
          </div>
          <p className="contact-form-intro">A name, reply email and a few words are enough to start.</p>
          <ContactForm />
        </Reveal>
      </section>

      <section className="contact-direct-section section-light" aria-labelledby="contact-direct-title">
        <div className="contact-direct-shell">
          <Reveal className="contact-direct-heading">
            <div>
              <p className="eyebrow eyebrow-dark">Skip the form</p>
              <h2 id="contact-direct-title">Choose the quickest route.</h2>
            </div>
            <p>Use the channel that is easiest right now. A short message is enough; we can ask the useful questions from there.</p>
          </Reveal>

          <div className="contact-direct-grid" aria-label="Direct contact options">
            <a href={`mailto:${contactEmail}`}>
              <span className="contact-direct-icon"><Mail size={19} strokeWidth={1.5} aria-hidden="true" /></span>
              <small>Best for a detailed brief</small>
              <strong>Email Kraftt</strong>
              <p>{contactEmail}</p>
              <ArrowUpRight className="contact-direct-arrow" size={18} aria-hidden="true" />
            </a>
            <a href={contactPhoneHref}>
              <span className="contact-direct-icon"><Phone size={19} strokeWidth={1.5} aria-hidden="true" /></span>
              <small>Best for a quick answer</small>
              <strong>Call directly</strong>
              <p>{contactPhone}</p>
              <ArrowUpRight className="contact-direct-arrow" size={18} aria-hidden="true" />
            </a>
            <IntroCallLink className="contact-direct-featured">
              <span className="contact-direct-icon"><MessageCircle size={19} strokeWidth={1.5} aria-hidden="true" /></span>
              <small>Fastest way to begin</small>
              <strong>Start on WhatsApp</strong>
              <p>Send a short introduction now.</p>
              <ArrowUpRight className="contact-direct-arrow" size={18} aria-hidden="true" />
            </IntroCallLink>
          </div>

          <Reveal className="contact-next-strip">
            <p>What happens next</p>
            <ol>
              <li><span>01</span><strong>We review your context</strong></li>
              <li><span>02</span><strong>We recommend the right route</strong></li>
              <li><span>03</span><strong>You receive a clear next action</strong></li>
            </ol>
          </Reveal>
        </div>
      </section>

      <section className="page-faq-section" aria-labelledby="contact-faq-title">
        <div className="page-faq-inner">
          <Reveal className="page-faq-heading">
            <div><p className="eyebrow eyebrow-dark">Common questions · 04 focused answers</p><h2 id="contact-faq-title">Know the essentials<br /><em>before you send.</em></h2></div>
            <div><p>Scope, fit, audit requirements and working location—answered without making you search the site.</p><Link href="">Send project details <i aria-hidden="true">→</i></Link></div>
          </Reveal>
          <PageFaq
            title="Contact Kraftt Digital questions"
            items={faqs}
            categoryTitles={['Starting a project', 'Fit and working together']}
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}
