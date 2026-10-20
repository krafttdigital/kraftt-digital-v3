export type ToolGuideContent = {
  introduction: string;
  steps: string[];
  calculation: string[];
  caveat: string;
  serviceSlugs: string[];
  faqs: { question: string; answer: string }[];
};

export const toolGuides: Record<string, ToolGuideContent> = {
  'digital-presence-score': {
    introduction: 'A quick self-check of the foundations visitors use to find, understand and contact your business. It identifies a useful next area to review; it does not crawl or audit your website.',
    steps: ['Answer all 12 questions using the option closest to your current setup.', 'Compare the four category scores to see where your presence is least complete.', 'Use the suggested service as a starting point for a closer review.'],
    calculation: ['Each answer earns 0, 1 or 2 points. Three questions make up each of four categories.', 'Each category is scaled from a maximum of 6 raw points to 25 points, then rounded. The four rounded category scores add to a score out of 100.', 'The lowest-scoring category becomes the suggested focus. Equal scores follow the questionnaire order: brand, website, enquiry, then tracking.'],
    caveat: 'This is a self-reported planning score. It does not test page speed, search rankings, analytics accuracy or actual conversion performance.',
    serviceSlugs: ['brand-identity', 'web-design-development', 'ecommerce-seo', 'social-media-management'],
    faqs: [
      { question: 'Does this scan my website or Google profile?', answer: 'No. The score uses only your answers. A technical review would need access to the site and its search or analytics data.' },
      { question: 'What does a low category score mean?', answer: 'It means your answers indicate fewer of that category’s basic signals are in place. It is a prompt to investigate, not proof of lost enquiries.' },
      { question: 'Will a high score guarantee leads?', answer: 'No. Demand, competition, your offer and follow-up process also affect enquiries. Use the score to prioritise improvements, not to forecast sales.' },
    ],
  },
  'website-cost-calculator': {
    introduction: 'Estimate a starting investment for an informational website or online store using Kraftt’s current published packages. The result is a package match, not a custom quotation.',
    steps: ['Choose the kind of site and the approximate number of pages or core sections.', 'Indicate whether you need brand identity work or ongoing SEO.', 'Review the matched package and separately listed add-ons before requesting a scoped proposal.'],
    calculation: ['One page maps to Starter or Launch Store; two to five maps to Business or Growth Store; six or more maps to Growth or Complete Store.', 'The one-time total is the published package starting price plus Brand Starter if you selected identity work.', 'Ongoing SEO is shown separately as a monthly starting cost. Your preferred start date is passed into the enquiry but does not change the estimate.'],
    caveat: 'Store tiers also depend on product count, platform and features; page count alone cannot define store scope. Domain, hosting, subscriptions, extra integrations and custom work are confirmed in a proposal.',
    serviceSlugs: ['web-design-development', 'ecommerce-store-development', 'brand-identity', 'landing-pages', 'app-development', 'ecommerce-seo'],
    faqs: [
      { question: 'Is this my final project price?', answer: 'No. It uses published starting prices. The final quote follows a review of pages, content, products, integrations, platform and approvals.' },
      { question: 'Does the result include SEO?', answer: 'The selected build includes its published launch SEO allowance. Selecting ongoing SEO adds a separate monthly starting cost; it is not part of the one-time build total.' },
      { question: 'What if I need a landing page or custom app?', answer: 'Those are separately scoped services. Use the related service links below to review Landing Pages or App Development and request a custom proposal.' },
    ],
  },
  'social-media-cost-calculator': {
    introduction: 'Find the closest current social management tier for your monthly platform and post needs. Package content is a shared set distributed across the included platforms.',
    steps: ['Select the number of platforms and approximate monthly posts.', 'Tell us if stories or separately scoped direct-message handling matter to you.', 'Compare the matched tier’s included allowance with your actual brief.'],
    calculation: ['Three or more platforms, or 30 or more posts, matches Social Presence Management.', 'Otherwise, two platforms or around 21 posts matches Social Growth. Smaller needs match Social Starter.', 'Stories and direct-message answers help shape a later discussion but do not change the tier or published price. Each tier has its own story allowance.'],
    caveat: 'Direct messages, paid campaigns and conventional video production are not included in these prices. Additional platforms or AI reels beyond the tier are quoted separately.',
    serviceSlugs: ['social-media-management', 'content-copywriting', 'ai-powered-creative', 'brand-identity'],
    faqs: [
      { question: 'Are the posts unique on every platform?', answer: 'No. The published tiers use one shared monthly content set across the included platforms, with distribution agreed in the content calendar.' },
      { question: 'Does saying I need stories increase the price?', answer: 'No. This calculator matches by platform and post volume. Starter includes 10 stories, Growth 15 and Presence Management 20 per month.' },
      { question: 'Are message replies and advertising included?', answer: 'Direct-message handling and paid advertising are separately scoped. The published packages focus on strategy, content, profile work and the tier’s stated deliverables.' },
    ],
  },
  'seo-roi-calculator': {
    introduction: 'Explore what hypothetical organic traffic increases would mean for revenue at your own conversion rate and customer value. This is a scenario model, not a performance forecast.',
    steps: ['Enter current monthly organic visitors, conversion rate and average converted order or customer value.', 'Enter your monthly SEO cost; the field starts with the published SEO Starter price and can be changed.', 'Compare conservative, moderate and strong traffic scenarios.'],
    calculation: ['The three scenarios add 20%, 50% or 100% to the visitor count you enter.', 'Additional conversions = additional visitors × conversion rate ÷ 100. Additional revenue = additional conversions × customer value.', 'Illustrative monthly ROI = (additional revenue − monthly SEO cost) ÷ monthly SEO cost × 100. It does not deduct product costs or other operating expenses.'],
    caveat: 'The traffic increases are hypothetical inputs, not typical results. SEO may take time to affect traffic, and conversions and customer value can change. No ranking, citation or revenue is guaranteed.',
    serviceSlugs: ['ecommerce-seo', 'web-design-development', 'content-copywriting', 'marketplace-catalogue-building'],
    faqs: [
      { question: 'Are the 20%, 50% and 100% increases promises?', answer: 'No. They are fixed examples for comparing outcomes. Replace the inputs with your own data and assess whether each scenario is plausible for your business.' },
      { question: 'Does the ROI include profit margin?', answer: 'No. It compares additional revenue with monthly SEO cost. It does not subtract fulfilment, product, staff or other costs.' },
      { question: 'Does the monthly cost match a Kraftt service?', answer: 'It starts at the published SEO Starter rate, but you can replace it with your actual monthly budget. SEO Growth and Comprehensive have different scopes and prices.' },
    ],
  },
  'roas-calculator': {
    introduction: 'Check the return on ad spend from a campaign you already run or plan. Adding your gross profit margin reveals the return needed to cover advertising spend.',
    steps: ['Enter the amount spent on ads and the revenue attributed to them for the same period.', 'Add your pre-ad gross margin if you want the break-even and profit views.', 'Compare the result against your business costs before deciding on more spend.'],
    calculation: ['ROAS = attributed revenue ÷ ad spend.', 'Break-even ROAS = 100 ÷ gross margin percentage. For a 40% margin, that is 2.5×.', 'Estimated profit after ads = attributed revenue × gross margin percentage − ad spend. The calculation assumes that margin already reflects other variable costs.'],
    caveat: 'Attribution may be incomplete and this model excludes fixed overhead, taxes and agency fees. It is a planning calculation, not a statement that Kraftt manages paid ads.',
    serviceSlugs: ['landing-pages', 'web-design-development', 'ai-powered-creative', 'dashboards-internal-tools'],
    faqs: [
      { question: 'Is higher ROAS always more profitable?', answer: 'Not necessarily. A high return on a very small campaign can produce less total profit than a lower return at greater scale. Margin and other costs matter.' },
      { question: 'What margin should I enter?', answer: 'Use the share of revenue left after the variable costs you want to account for, before ad spend. Ask your finance team if you are unsure which costs belong in that figure.' },
      { question: 'Does Kraftt offer ad management through this tool?', answer: 'The calculator is a free planning utility. The linked current services can support landing pages, websites, creative or internal reporting; campaign management would require a separate agreed scope.' },
    ],
  },
  'gst-calculator': {
    introduction: 'Add GST to a taxable amount or work backwards from a tax-inclusive total. Choose whether to display a CGST/SGST split or IGST.',
    steps: ['Select exclusive if your amount is before tax, or inclusive if tax is already inside it.', 'Enter the amount and applicable rate, using Custom if needed.', 'Choose the state relationship and read the taxable value, tax and total.'],
    calculation: ['Exclusive: GST = taxable amount × rate ÷ 100; total = taxable amount + GST.', 'Inclusive: taxable amount = entered total ÷ (1 + rate ÷ 100); GST = entered total − taxable amount.', 'For a same-state selection, the calculated GST is split equally into CGST and SGST. Otherwise it is displayed as IGST. Displayed amounts are rounded to two decimals.'],
    caveat: 'You choose the tax rate and state relationship. The calculator does not determine legal classification, exemptions, place of supply or eligibility for a particular rate. Confirm these with your accountant.',
    serviceSlugs: ['dashboards-internal-tools', 'ecommerce-store-development'],
    faqs: [
      { question: 'Can I reverse-calculate GST from a total?', answer: 'Yes. Choose Inclusive → Breakdown, enter the amount already including GST, and the tool divides by one plus the selected tax rate to find the taxable base.' },
      { question: 'Why do CGST and SGST show half the tax each?', answer: 'The calculator splits the computed GST equally when you select same-state. It shows IGST as the full computed tax for the other selection.' },
      { question: 'Does this decide the correct GST rate for my service?', answer: 'No. It calculates from the rate you enter. Tax classification and compliance need independent review.' },
    ],
  },
  'gst-invoice-generator': {
    introduction: 'Prepare a simple GST invoice PDF in your browser. The form uses your seller, buyer and line-item details; the site does not save them to a Kraftt account.',
    steps: ['Enter seller, buyer, invoice and place-of-supply details.', 'Add each item with quantity, unit rate and its GST percentage.', 'Check the live total and tax split, then download the PDF after required fields are complete.'],
    calculation: ['Each item’s taxable value = quantity × rate. Item GST = taxable value × its GST percentage ÷ 100. Item total = taxable value + GST.', 'Invoice totals sum the unrounded calculated item values and display them to two decimals.', 'Seller state is compared with the entered place of supply. A match divides total GST equally into CGST and SGST; otherwise the total is labelled IGST.'],
    caveat: 'The generator does not validate GSTINs, classify items, verify place of supply or guarantee a compliant invoice. Review invoice details and rounding with your accountant before issuing it.',
    serviceSlugs: ['dashboards-internal-tools', 'ecommerce-store-development', 'marketplace-catalogue-building'],
    faqs: [
      { question: 'Does Kraftt store my invoice information?', answer: 'No account or server storage is used by this tool. The PDF is generated in your browser from the details you enter.' },
      { question: 'Can items have different GST rates?', answer: 'Yes. Each line has its own rate. The tool calculates tax for each line, then adds the amounts to the invoice total.' },
      { question: 'Is the downloaded PDF legally verified?', answer: 'No. It is a formatted document based on your inputs. Check GSTINs, tax rates, place of supply and mandatory invoice details before sending it.' },
    ],
  },
};
