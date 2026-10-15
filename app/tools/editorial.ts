export type ToolGuide = {
  eyebrow: string;
  headline: string;
  introduction: string;
  context: string;
  methodTitle: string;
  steps: readonly { title: string; detail: string }[];
  exampleTitle: string;
  example: string;
  exampleNote: string;
  faqs: readonly { question: string; answer: string }[];
};

export const toolGuides: Record<string, ToolGuide> = {
  'website-cost-calculator': {
    eyebrow: 'Website cost in India',
    headline: 'What does a business website cost in India?',
    introduction: 'Kraftt’s published India starting prices range from ₹12,000 for a one-page informational website to ₹45,000 for a 6–10+ page Growth website. An online store starts at ₹22,000; the Complete Store tier starts at ₹70,000. These are Kraftt package prices, not an average for every agency or every project.',
    context: 'The right estimate depends on whether you need an informational site or a store, how much structure the project needs, and whether you also need brand identity or ongoing SEO. The calculator matches your brief to a published tier; a written quote confirms the exact scope.',
    methodTitle: 'How the website estimate is calculated',
    steps: [
      { title: 'Choose the site type', detail: 'An informational website uses the Starter, Business and Growth prices. An e-commerce brief uses Launch Store, Growth Store and Complete Store prices.' },
      { title: 'Match the size of the brief', detail: 'One page or core section selects the first tier; 2–5 selects the middle tier; 6–10+ selects the largest tier. The tool matches a tier rather than charging per page.' },
      { title: 'Add only the selected extras', detail: 'Brand Identity adds ₹12,000 to the one-time starting estimate if needed. Ongoing SEO is shown separately from ₹12,000 per month when selected.' },
      { title: 'Confirm the scope', detail: 'Your preferred start time helps plan a conversation but does not change the calculated price. Custom features, content and third-party requirements are priced in a written proposal.' },
    ],
    exampleTitle: 'A worked website-cost example',
    example: 'Business website ₹25,000 + Brand Identity ₹12,000 = ₹37,000 starting one-time estimate.',
    exampleNote: 'If ongoing SEO is selected, the result also shows from ₹12,000 per month. That recurring amount is not part of the one-time total.',
    faqs: [
      { question: 'How much does a small business website cost in India?', answer: 'At Kraftt, a one-page Starter website starts at ₹12,000 and a 2–5 page Business website starts at ₹25,000. The final quote depends on the approved pages, features, content and handover scope.' },
      { question: 'How much does an e-commerce website cost?', answer: 'Kraftt’s published store tiers start at ₹22,000 for Launch Store, ₹40,000 for Growth Store and ₹70,000 for Complete Store. The calculator chooses a starting tier from your store brief; a proposal defines the actual catalogue and integrations.' },
      { question: 'Is SEO included in the website price?', answer: 'Website packages have their own agreed launch scope. The calculator’s ongoing SEO option is a separate monthly service starting at ₹12,000 per month; it is not added to the one-time website total.' },
      { question: 'Does needing the website sooner increase the estimate?', answer: 'No. The start-time answer is collected for planning and does not add a rush fee or change the calculator result. A delivery plan is agreed only after reviewing the complete scope and access.' },
      { question: 'Is the calculator result a final quote?', answer: 'No. It is a starting estimate from Kraftt’s published packages. You receive an exact written scope and price before committing to the project.' },
      { question: 'Do I need to pay for an audit to request a website quote?', answer: 'No. You can request a free introductory call and a written quote. A paid audit is optional when a deeper review is useful before selecting work.' },
    ],
  },
  'digital-presence-score': {
    eyebrow: 'Understand your online presence',
    headline: 'What does a digital presence score tell you?',
    introduction: 'The score helps you inspect four practical parts of an online presence: brand clarity, website and search, enquiry routes, and tracking and ownership. It shows where your own answers indicate the largest gap.',
    context: 'This is a guided self-assessment, not a live crawl of your website or a Google ranking report. It can help you decide what to inspect next before paying for a more detailed audit.',
    methodTitle: 'How the score is calculated',
    steps: [
      { title: 'Answer 12 questions', detail: 'There are three questions in each of the four categories. Each answer is worth 0, 1 or 2 points.' },
      { title: 'Scale each category to 25', detail: 'A category can earn 0–6 raw points. The tool divides that score by six, multiplies by 25 and rounds to a whole number.' },
      { title: 'Add the four category scores', detail: 'Four category scores of up to 25 produce an overall result from 0 to 100.' },
      { title: 'Find the first focus area', detail: 'The lowest category becomes the suggested place to start. Equal scores are resolved by the order of the four categories.' },
    ],
    exampleTitle: 'A score example',
    example: 'Brand 4/6 becomes 17/25; website 3/6 becomes 13/25; enquiry 5/6 becomes 21/25; tracking 2/6 becomes 8/25. Total: 59/100.',
    exampleNote: 'Tracking is the lowest category in this example, so it becomes the first suggested focus area.',
    faqs: [
      { question: 'Does this tool scan my website?', answer: 'No. It scores the answers you choose. It does not crawl pages, verify Google rankings or inspect your analytics account.' },
      { question: 'What does a score out of 100 mean?', answer: 'It is a weighted summary of your 12 answers across four equally weighted categories. Use the category breakdown to understand the result instead of treating the total as an external benchmark.' },
      { question: 'Why did the tool choose one focus area?', answer: 'It selects the category with the lowest score. When two categories tie, it follows the questionnaire order.' },
      { question: 'Can I use the result without submitting my details?', answer: 'Yes. The score appears on the page after you answer all 12 questions; no email address is required.' },
    ],
  },
  'social-media-cost-calculator': {
    eyebrow: 'Plan monthly content',
    headline: 'What shapes social media management cost?',
    introduction: 'The number of managed platforms and posts drives this package match. The tool compares your monthly brief with Kraftt’s published Social Starter, Social Growth and Social Presence Management tiers.',
    context: 'Stories and direct-message needs are still useful scoping inputs, but they do not change the automatic tier selection. Direct messages need a separate agreed scope.',
    methodTitle: 'How the social tier is selected',
    steps: [
      { title: 'Count platforms and posts', detail: 'The tool uses the platform and monthly post answers as the tier-selection inputs.' },
      { title: 'Apply the highest matching tier', detail: 'Three or more platforms or 30+ posts selects Social Presence Management. Otherwise, two platforms or about 21 posts selects Social Growth.' },
      { title: 'Use Starter for smaller briefs', detail: 'One platform with about 15 posts selects Social Starter. Published India starting prices are ₹12,000, ₹22,000 and ₹40,000 per month respectively.' },
      { title: 'Confirm what is outside the tier', detail: 'Stories are listed in each tier’s included output. Direct-message handling, conventional video production and paid campaigns require separate scoping.' },
    ],
    exampleTitle: 'A social-cost example',
    example: 'Two platforms and about 21 posts per month match Social Growth, starting at ₹22,000 per month.',
    exampleNote: 'Posts are one shared content set across the selected platforms, not 21 unique posts for each platform.',
    faqs: [
      { question: 'How does the calculator choose my package?', answer: 'It looks at your platform count and monthly post volume, then selects the highest applicable published tier. Stories and direct-message answers are retained for scope discussion.' },
      { question: 'Are posts unique for every platform?', answer: 'No. The included posts are one shared content set adapted across the selected platforms.' },
      { question: 'Are direct messages included?', answer: 'Direct-message handling is separately scoped. Selecting that answer does not silently add it to the package price.' },
      { question: 'Does the price include ad spend or campaign management?', answer: 'No. The listed social tiers cover the stated content and management scope; paid campaigns and media spend are separate.' },
    ],
  },
  'seo-roi-calculator': {
    eyebrow: 'Model organic growth',
    headline: 'How could more organic traffic affect revenue?',
    introduction: 'The SEO ROI tool explores three hypothetical traffic increases using your own visitor count, conversion rate, customer or order value, and monthly SEO cost. It is a planning model, not a forecast.',
    context: 'A change in traffic only creates revenue in this model when visitors convert at the rate you enter. Results are sensitive to your assumptions and do not include every business cost.',
    methodTitle: 'How the SEO scenarios are calculated',
    steps: [
      { title: 'Model extra visitors', detail: 'The tool applies illustrative organic-traffic increases of 20%, 50% and 100% to your current monthly organic visitors.' },
      { title: 'Estimate conversions and revenue', detail: 'Additional visitors × your conversion rate = additional conversions. Additional conversions × your customer or order value = modelled additional revenue.' },
      { title: 'Compare with monthly SEO cost', detail: 'The displayed percentage is (additional revenue − monthly SEO cost) ÷ monthly SEO cost × 100.' },
      { title: 'Interpret it carefully', detail: 'This is revenue-based return after the SEO fee, not net business profit. Actual growth, conversion rates and margins can differ.' },
    ],
    exampleTitle: 'An illustrative SEO example',
    example: '1,000 monthly visitors × 20% growth = 200 extra visitors. At 2% conversion and ₹5,000 per order, that models 4 extra orders and ₹20,000 additional revenue.',
    exampleNote: 'With a ₹12,000 monthly SEO cost, the displayed revenue-based ROI is about 66.7%. This does not deduct product or delivery costs.',
    faqs: [
      { question: 'Does a 20%, 50% or 100% scenario predict my SEO result?', answer: 'No. Those percentages are illustrative inputs for comparison, not predicted growth or a guarantee.' },
      { question: 'What conversion rate should I enter?', answer: 'Use your own measured organic conversion rate if available. If you use an assumption, treat the result as a scenario and test how it changes with a lower rate.' },
      { question: 'Is the displayed ROI my profit?', answer: 'No. The formula compares additional revenue with the SEO fee. It does not deduct product costs, staff, fulfilment or other expenses.' },
      { question: 'Can SEO guarantee rankings or enquiries?', answer: 'No. Search visibility and enquiries depend on competition, demand, content, the website and how search engines respond over time.' },
    ],
  },
  'roas-calculator': {
    eyebrow: 'Read ad performance',
    headline: 'What does ROAS say about an ad campaign?',
    introduction: 'Return on ad spend (ROAS) compares revenue attributed to ads with the amount spent on those ads. A high ROAS can still be unprofitable if product or delivery margins are low.',
    context: 'Enter your ad spend and ad-attributed revenue. Add a margin if you want a break-even ROAS and a simple profit-after-ads calculation.',
    methodTitle: 'How ROAS and break-even are calculated',
    steps: [
      { title: 'Divide revenue by ad spend', detail: 'ROAS = revenue from the ads ÷ ad spend. ₹100,000 revenue on ₹25,000 spend gives 4.00× ROAS.' },
      { title: 'Use margin for break-even', detail: 'Break-even ROAS = 100 ÷ margin percentage. A 40% margin requires 2.50× ROAS to cover ad spend in this simplified model.' },
      { title: 'Calculate profit after ads', detail: 'The tool calculates revenue × margin percentage − ad spend. This assumes the margin already reflects the other costs you want to include.' },
      { title: 'Compare, then investigate', detail: 'ROAS alone does not prove incrementality or reliable attribution. Check refunds, repeat purchases and any costs missing from your margin.' },
    ],
    exampleTitle: 'A ROAS example',
    example: '₹100,000 ad-attributed revenue ÷ ₹25,000 spend = 4.00× ROAS. At 40% margin, break-even is 2.50× and simplified profit after ads is ₹15,000.',
    exampleNote: 'The profit figure changes if the entered margin does not already account for fulfilment, fees and other relevant costs.',
    faqs: [
      { question: 'What is a good ROAS?', answer: 'There is no universal target. Compare your ROAS with your own gross or contribution margin, costs and goals. The calculator shows a margin-based break-even point when you provide a margin.' },
      { question: 'Can I calculate ROAS without a margin?', answer: 'Yes. Ad spend and ad-attributed revenue are enough for ROAS. A margin is needed for the break-even and simplified profit figures.' },
      { question: 'Does ROAS include agency fees or other marketing costs?', answer: 'Only if you have included those amounts in your entered spend or margin. The tool uses exactly the inputs you provide.' },
      { question: 'Does Kraftt manage paid ads through this tool?', answer: 'No. This is a free planning calculator; using it does not start an advertising service.' },
    ],
  },
  'gst-calculator': {
    eyebrow: 'Understand tax arithmetic',
    headline: 'How do you add or reverse GST?',
    introduction: 'This calculator can add a selected GST percentage to a taxable amount or extract the taxable base and tax from an inclusive total. It also shows a CGST/SGST or IGST split based on the states you select.',
    context: 'You choose the applicable rate. The tool performs arithmetic; it does not determine whether a supply is taxable, which rate applies, or whether a transaction meets every legal condition.',
    methodTitle: 'How the GST result is calculated',
    steps: [
      { title: 'For an exclusive amount', detail: 'GST = taxable base × selected rate ÷ 100. Total = taxable base + GST.' },
      { title: 'For an inclusive amount', detail: 'Taxable base = inclusive total ÷ (1 + selected rate ÷ 100). GST is the inclusive total minus that base.' },
      { title: 'Split the tax', detail: 'When you select same-state supply, the GST is divided equally into CGST and SGST. Different-state supply shows the full amount as IGST.' },
      { title: 'Check the real transaction', detail: 'Confirm the correct rate, place of supply and treatment with a qualified tax professional before issuing a document.' },
    ],
    exampleTitle: 'A GST example',
    example: '₹1,000 taxable base at 18% GST gives ₹180 tax and a ₹1,180 inclusive total. For a same-state supply, the tool shows ₹90 CGST and ₹90 SGST.',
    exampleNote: 'Reversing a ₹1,180 inclusive total at 18% returns the same ₹1,000 base and ₹180 GST before rounding.',
    faqs: [
      { question: 'How do I remove GST from an inclusive price?', answer: 'Divide the total by 1 plus the GST rate expressed as a decimal. At 18%, divide by 1.18, then subtract the base from the total to find GST.' },
      { question: 'When does the calculator show CGST and SGST?', answer: 'It shows an equal CGST and SGST split when you select same-state supply. Selecting different-state supply shows IGST.' },
      { question: 'Does the tool choose the correct GST rate for my product or service?', answer: 'No. You select the rate. The calculator does not classify goods or services or determine legal tax treatment.' },
      { question: 'Can I enter a custom rate?', answer: 'Yes. Choose Custom and enter a percentage. Confirm that the rate is applicable before using the figure on an invoice.' },
    ],
  },
  'gst-invoice-generator': {
    eyebrow: 'Prepare a business invoice',
    headline: 'What goes into a GST invoice total?',
    introduction: 'The generator combines seller and buyer details, invoice dates, a place of supply and line items into a downloadable PDF. Totals update as you enter quantities, rates and GST percentages.',
    context: 'The form helps format information you supply. It does not validate a GSTIN, verify a tax rate or decide whether the finished invoice complies with every rule for your transaction.',
    methodTitle: 'How the invoice totals are calculated',
    steps: [
      { title: 'Calculate each line', detail: 'Quantity × unit rate produces a taxable line amount. The entered GST percentage is applied to that amount.' },
      { title: 'Add the lines', detail: 'The taxable amounts and GST amounts are summed separately; their sum is the grand total.' },
      { title: 'Choose the split', detail: 'When the seller state matches the place of supply, GST is split equally into CGST and SGST. Otherwise the summary shows IGST.' },
      { title: 'Review and download', detail: 'Check names, GSTINs, dates, item descriptions, place of supply and tax treatment before downloading the PDF.' },
    ],
    exampleTitle: 'An invoice-line example',
    example: 'Two units × ₹500 each = ₹1,000 taxable value. At 18% GST, that line adds ₹180 tax and ₹1,180 to the invoice total.',
    exampleNote: 'The tool formats the PDF in your browser and does not submit invoice details to a Kraftt server.',
    faqs: [
      { question: 'Does the generator check my GSTIN?', answer: 'No. It uses the GSTIN text you enter and does not verify registration or legal validity.' },
      { question: 'How is GST calculated for each line?', answer: 'The taxable line amount is quantity multiplied by unit rate. GST is that amount multiplied by the entered rate and divided by 100.' },
      { question: 'Will my invoice data be stored by Kraftt?', answer: 'The tool builds the PDF in your browser. It does not submit the invoice fields to a Kraftt server.' },
      { question: 'Can I use the PDF without reviewing it?', answer: 'You should review all details and tax treatment first. The tool helps format an invoice but cannot replace accounting or tax advice.' },
    ],
  },
};
