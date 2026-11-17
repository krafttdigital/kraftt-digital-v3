import { businessTools } from './businessModels';
import type { ToolGuide } from './editorial';

type GuideDetails = {
  question: string;
  inputs: string;
  interpretation: string;
  faqs: ToolGuide['faqs'];
};

const details: Record<string, GuideDetails> = {
  'discount-profit-calculator': {
    question: 'How many more sales would your discount need?',
    inputs: 'Use the current selling price, per-unit variable cost and number of units normally sold. Include costs that rise with each extra sale.',
    interpretation: 'Compare the extra units required with the stock you can deliver and the demand you expect.',
    faqs: [
      { question: 'Which costs belong in the variable cost per unit?', answer: 'Include the product, packaging and any per-sale fulfilment costs you bear. Keep fixed expenses such as rent outside this figure.' },
      { question: 'What if a discounted sale loses money?', answer: 'Each extra unit adds to the loss. With zero or negative contribution per discounted unit, extra volume cannot recover a positive original contribution.' },
    ],
  },
  'cod-rto-cost-calculator': {
    question: 'What do failed cash-on-delivery orders cost?',
    inputs: 'Choose one dispatch period. Divide COD orders returned to origin by COD orders dispatched to find the RTO rate to enter.',
    interpretation: 'Use the failed-delivery total to isolate the impact of returns. The all-dispatch figure already includes that amount.',
    faqs: [
      { question: 'Which orders count toward the RTO rate?', answer: 'Use cash-on-delivery orders dispatched in the same group you are analysing. Count an order as RTO when the failed delivery returns to the seller.' },
      { question: 'Do I enter the full value of returned stock?', answer: 'Use the expected cost of stock you cannot resell per failed delivery. If you can resell all returned stock at full value, enter zero for product loss. Return shipping and spent packaging still count.' },
    ],
  },
  'instagram-engagement-calculator': {
    question: 'How do reach and followers change an engagement rate?',
    inputs: 'Use likes, comments, saves and shares for the same content and period. For several posts, use unique accounts reached across that set when available.',
    interpretation: 'Keep the audience measure consistent when comparing two results. The follower count is a snapshot, while reach describes who saw the content.',
    faqs: [
      { question: 'When should I choose reach?', answer: 'Choose reach when asking how many interactions your content received relative to the accounts it reached. Choose followers to compare interactions with the size of your follower base.' },
      { question: 'Can the engagement rate exceed 100%?', answer: 'Yes. One account can like, save, share and comment on the same post. The numerator counts interactions, so it can exceed the number of accounts in the denominator.' },
      { question: 'Does the calculator need my Instagram handle?', answer: 'No. Enter your counts manually. A zero reach or follower count leaves the rate undefined.' },
    ],
  },
  'project-pricing-calculator': {
    question: 'What project price covers your costs and target margin?',
    inputs: 'Estimate delivery hours and their internal hourly cost. Add direct expenses and the share of overhead assigned to this project.',
    interpretation: 'Change the expected hours to see how extra rounds of work affect the price needed for the same margin.',
    faqs: [
      { question: 'How does profit margin differ from markup?', answer: 'Margin divides profit by the selling price. Markup divides profit by cost. A project that costs 80 and sells for 100 has a 20% margin and a 25% markup.' },
      { question: 'Should overhead be entered as a percentage?', answer: 'Enter an amount for this project. If your hourly cost already covers a share of overhead, leave it out of the separate overhead amount.' },
    ],
  },
  'marketplace-settlement-calculator': {
    question: 'What will the marketplace pay, and what do you keep?',
    inputs: 'Use sales, refunds and actual fees from one settlement period. Check whether advertising came out of the payout or a separate account.',
    interpretation: 'Compare the estimated payout with the statement balance. Use contribution to assess how much is left to cover fixed business expenses.',
    faqs: [
      { question: 'Why can my payout look healthy while my contribution is negative?', answer: 'The platform can transfer cash before you cover inventory and ads paid from a separate account. The contribution calculation also deducts those costs.' },
      { question: 'Where do I enter advertising paid by card?', answer: 'Enter the advertising amount and choose “Paid separately”. That cost reduces contribution while the settlement calculation keeps it outside the platform deductions.' },
    ],
  },
  'website-quote-comparison': {
    question: 'What will each website proposal cost over the same period?',
    inputs: 'Copy upfront, monthly and annual amounts from each written proposal. Record included scope, who controls the assets and how maintenance is charged.',
    interpretation: 'Read each cost total alongside scope and ownership. Follow up on omissions before using the difference to choose a provider.',
    faqs: [
      { question: 'What if a proposal leaves out hosting or maintenance?', answer: 'Leave the relevant charge blank or select the unknown maintenance option. The known subtotal still appears. A complete comparison needs the missing information. Enter zero only when the provider confirms it.' },
      { question: 'What ownership details should I check?', answer: 'Ask who controls the domain, hosting account, source files and administrator credentials after handover. Record restrictions alongside the proposal’s price.' },
    ],
  },
};

export const businessGuides: Record<string, ToolGuide> = Object.fromEntries(
  businessTools.map((tool) => {
    const guide = details[tool.slug];
    return [tool.slug, {
      eyebrow: 'Understand the numbers',
      headline: guide.question,
      introduction: tool.description,
      context: tool.caveat,
      methodTitle: 'Formula and assumptions',
      steps: [
        { title: 'Choose your inputs', detail: guide.inputs },
        { title: 'Follow the calculation', detail: tool.formula },
        { title: 'Read your result', detail: guide.interpretation },
      ],
      exampleTitle: 'One worked example',
      example: tool.exampleText,
      exampleNote: 'Select “Try worked example” to load these figures. Then change one input to see its effect.',
      faqs: guide.faqs,
    } satisfies ToolGuide];
  }),
);
