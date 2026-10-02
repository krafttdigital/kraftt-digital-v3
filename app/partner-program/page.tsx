import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Check, FileText } from 'lucide-react';
import { Footer } from '../components/Footer';
import { JsonLd } from '../components/JsonLd';
import { Reveal } from '../components/Reveal';
import { SiteHeader } from '../components/SiteHeader';
import { createPageMetadata, createPageSchema } from '../data/seo';
import { PartnerApplicationForm } from './PartnerApplicationForm';

const pageTitle = 'Kraftt Partner Program | Refer a Business & Earn 15%';
const pageDescription = 'Join the Kraftt Partner Program, refer a suitable business and earn 15% of the final collected professional fee after project delivery and full payment.';

export const metadata: Metadata = createPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: '/partner-program',
  label: 'Kraftt Partner Program',
});

const steps = [
  ['01', 'Refer a suitable business', 'Make a genuine introduction to Kraftt before project discussions begin.'],
  ['02', 'Kraftt handles the project', 'Kraftt manages discovery, proposal, communication, delivery, invoicing and payment collection.'],
  ['03', 'Receive 15% commission', 'Commission is paid after the project is delivered and the complete client payment is received.'],
];

const referableServices = ['Websites', 'Branding', 'E-commerce', 'SEO / GEO', 'Social media', 'Digital systems'];

const terms = [
  ['Independent relationship', 'The program creates a non-exclusive referral relationship only. It does not create employment, agency, franchise, joint venture or a legal partnership between Kraftt and the Partner.'],
  ['Referral eligibility', 'A referral must be shared with Kraftt before Kraftt begins discussions with that business. Kraftt will confirm whether the referral is eligible. Existing leads and previously contacted businesses are not eligible.'],
  ['Duplicate referrals', 'If the same business is introduced by more than one person, attribution belongs to the first verified introduction recorded and accepted by Kraftt.'],
  ['Partner responsibilities', 'The Partner will make genuine introductions and share accurate information. The Partner may not finalise pricing, promise results, commit timelines, collect client payments or represent themselves as an employee or authorised agent of Kraftt.'],
  ['Kraftt responsibilities', 'Kraftt will independently handle discovery, recommendations, proposal, agreement, delivery, client communication, invoicing and payment collection. Kraftt may accept or decline a referral at its discretion.'],
  ['Commission basis', 'The Partner earns 15% of the final collected professional fee stated in the approved proposal, after discounts. Applicable taxes and third-party or pass-through expenses are excluded.'],
  ['Payment timing', "Commission becomes payable within seven working days after the referred project is delivered and the complete client payment is received as cleared funds in Kraftt's bank account. Applicable statutory deductions and documentation requirements may apply."],
  ['Cancelled, refunded or unpaid work', 'No commission is payable on cancelled, refunded or uncollected amounts. Any later refund relating to an already-paid commission may be adjusted against a future payout after written explanation.'],
  ['Repeat work and retainers', 'Commission applies only to the eligible project recorded in the accepted referral. Repeat work, extensions and future retainers are not automatically commissionable unless Kraftt confirms otherwise in writing.'],
  ['Confidentiality and ownership', "The Partner shall not disclose, forward, publish, reproduce, copy, distribute or otherwise expose any Kraftt document, proposal, pricing, strategy, process, template, credential, client information, internal communication, knowledge or file without prior written permission. All such material remains Kraftt's property and this obligation survives termination."],
  ['Client information', 'The Partner will use client and Kraftt information only for the relevant referral and will not retain, reuse or share it for another purpose without permission.'],
  ['Ending participation', 'Either side may end participation through written communication. Eligible referrals accepted before termination remain subject to these terms if the project is completed and fully paid. Confidentiality obligations continue.'],
] as const;

export default function PartnerProgramPage() {
  return (
    <main className="partner-program-page">
      <JsonLd data={createPageSchema({
        name: pageTitle,
        description: pageDescription,
        path: '/partner-program',
        breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Partner Program', path: '/partner-program' }],
      })} />
      <SiteHeader />

      <section className="partner-hero" aria-labelledby="partner-page-title">
        <Reveal className="partner-hero-copy" direction="left">
          <div className="partner-hero-kicker">
            <p className="eyebrow eyebrow-dark">Kraftt Partner Program</p>
            <a
              className="partner-hero-icon"
              href=""
              target="_blank"
              rel="noreferrer"
              aria-label="Agreement icon created by Magnific on Flaticon"
              title="Agreement icon created by Magnific on Flaticon"
            >
              <Image src="/assets/partner-program/handshake.png" alt="A handshake representing a Kraftt partnership" width={512} height={512} priority sizes="64px" />
            </a>
          </div>
          <h1 id="partner-page-title">Refer a business.<br /><em>Earn 15%.</em></h1>
          <p>You make a genuine introduction. Kraftt handles the complete project. Your commission is paid after final delivery and complete client payment.</p>
          <div className="partner-hero-actions">
            <a className="button button-accent" href="#apply">Apply to become a partner <ArrowDown size={16} aria-hidden="true" /></a>
            <a className="button button-outline-dark" href="#program-terms">Review the terms <ArrowDown size={16} aria-hidden="true" /></a>
          </div>
          <div className="partner-hero-trust" aria-label="Partner Program highlights">
            <span><Check size={13} aria-hidden="true" /> Non-exclusive</span>
            <span><Check size={13} aria-hidden="true" /> Clear attribution</span>
            <span><Check size={13} aria-hidden="true" /> Documented payout</span>
          </div>
        </Reveal>

        <Reveal className="partner-hero-system" direction="right">
          <div className="partner-commission-mark"><small>Partner commission</small><strong>15%</strong><span>of the eligible professional fee</span></div>
          <p><strong>Payout timing</strong> Within seven working days after delivery and complete cleared client payment.</p>
        </Reveal>
      </section>

      <section className="partner-process-section" aria-labelledby="partner-process-title">
        <div className="partner-process-layout">
          <Reveal className="partner-section-heading" direction="left">
            <p className="eyebrow eyebrow-dark">How it works · 01—03</p>
            <h2 id="partner-process-title">One introduction.<br /><em>A clear process.</em></h2>
            <p>If a business in your network needs a stronger digital presence, bring Kraftt into the conversation. The handoff stays simple from introduction to payout.</p>
          </Reveal>

          <div className="partner-process-content">
            <Reveal>
              <ol className="partner-flow" aria-label="Three-step partner process">
                {steps.map(([number, title, copy]) => (
                  <li key={number}>
                    <span aria-hidden="true">{number}</span>
                    <div>
                      <h3>{title}</h3>
                      <p>{copy}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>

            <Reveal className="partner-process-services">
              <div className="partner-process-services-heading">
                <p className="eyebrow eyebrow-dark">Services you can refer</p>
                <p>You do not need to choose the exact package. A genuine introduction and useful context are enough.</p>
              </div>
              <div className="partner-process-service-list" aria-label="Services available for referral">
                {referableServices.map((service, index) => (
                  <span key={service}><small>{String(index + 1).padStart(2, '0')}</small>{service}</span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="partner-apply-section" id="apply" aria-labelledby="partner-application-title">
        <Reveal className="partner-apply-intro" direction="left">
          <p className="eyebrow">Ready to refer?</p>
          <h2>Become a<br /><em>Kraftt Partner.</em></h2>
          <p>Apply with your contact details, confirm the terms and add your electronic signature. Kraftt will review the application before confirming participation.</p>
          <ul>
            <li><span>01</span> Submit the application</li>
            <li><span>02</span> Kraftt reviews the details</li>
            <li><span>03</span> Participation is confirmed directly</li>
          </ul>
          <a href="#program-terms">Review terms before signing <ArrowDown size={15} aria-hidden="true" /></a>
        </Reveal>
        <Reveal className="partner-form-shell" direction="right">
          <PartnerApplicationForm />
        </Reveal>
      </section>

      <section className="partner-commission-section">
        <Reveal className="partner-commission-heading">
          <p className="eyebrow eyebrow-dark">How the commission works</p>
          <h2>Simple maths.<br /><em>Written conditions.</em></h2>
          <p>Your commission is 15% of the eligible professional fee Kraftt actually collects. Here is one clear example.</p>
        </Reveal>
        <Reveal className="partner-commission-card" direction="right">
          <div className="partner-commission-example" aria-label="Commission calculation example: one lakh rupees multiplied by fifteen percent equals fifteen thousand rupees">
            <div><span>Eligible fee</span><strong>₹1,00,000</strong></div>
            <i aria-hidden="true">×</i>
            <div><span>Partner rate</span><strong>15%</strong></div>
            <i aria-hidden="true">=</i>
            <div className="partner-commission-result"><span>You receive</span><strong>₹15,000</strong></div>
          </div>
          <ul className="partner-commission-rules">
            <li><Check size={14} aria-hidden="true" /><span><strong>Eligible amount</strong> Final collected professional fee after discounts.</span></li>
            <li><Check size={14} aria-hidden="true" /><span><strong>Excluded</strong> Taxes and third-party or pass-through expenses.</span></li>
            <li><Check size={14} aria-hidden="true" /><span><strong>Payout</strong> Within seven working days after delivery and complete cleared client payment.</span></li>
          </ul>
          <div className="partner-commission-card-footer">
            <p>Share the referral before discussions begin. Kraftt confirms eligibility, and the first verified introduction establishes attribution.</p>
            <a href="/documents/kraftt-partner-agreement.pdf" target="_blank">Open the agreement <ArrowUpRight size={15} aria-hidden="true" /></a>
          </div>
        </Reveal>
      </section>

      <section className="partner-terms-section" id="program-terms">
        <Reveal className="partner-terms-heading">
          <div>
            <p className="eyebrow eyebrow-dark">Program terms · 01—12</p>
            <h2>Built on<br /><em>clear terms.</em></h2>
          </div>
          <div>
            <p>Review the complete conditions before applying. The application requires explicit acceptance and an electronic signature.</p>
            <div className="partner-document-links">
              <Link href="/documents/kraftt-partner-program.pdf" target="_blank">Program overview <FileText size={15} aria-hidden="true" /></Link>
              <Link href="/documents/kraftt-partner-agreement.pdf" target="_blank">Partner agreement <FileText size={15} aria-hidden="true" /></Link>
            </div>
          </div>
        </Reveal>

        <div className="partner-terms-grid">
          {terms.map(([title, copy], index) => (
            <details key={title} className="partner-term">
              <summary><span>{String(index + 1).padStart(2, '0')}</span><strong>{title}</strong><i aria-hidden="true">+</i></summary>
              <p>{copy}</p>
            </details>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
