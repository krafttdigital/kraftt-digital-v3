export type Values = Record<string, string>;

export type ResultRow = {
  label: string;
  value: number | null;
  unit: 'money' | 'percent' | 'count';
};

export type Calculation = {
  rows: ResultRow[];
  notes: string[];
  complete: boolean;
};

export type InputField = {
  key: string;
  label: string;
  hint?: string;
  max?: number;
  exclusiveMax?: number;
  integer?: boolean;
  money?: boolean;
  optional?: boolean;
  options?: readonly string[];
  text?: boolean;
  visibleWhen?: (values: Values) => boolean;
};

export type BusinessTool = {
  slug: string;
  name: string;
  description: string;
  service: string;
  fields: InputField[];
  example: Values;
  formula: string;
  exampleText: string;
  caveat: string;
  calculate: (values: Values) => Calculation;
};

const money = (label: string, value: number | null): ResultRow => ({ label, value, unit: 'money' });
const count = (label: string, value: number | null): ResultRow => ({ label, value, unit: 'count' });
const percent = (label: string, value: number | null): ResultRow => ({ label, value, unit: 'percent' });

// Whole-sale targets use exact decimal ratios. Rounding a binary float upward near an
// integer can otherwise recommend one extra sale, or miss a small real shortfall.
function decimalParts(value: number) {
  const [coefficient, exponent = '0'] = value.toString().split('e');
  const [whole, fraction = ''] = coefficient.split('.');
  const places = fraction.length - Number(exponent);
  return {
    numerator: BigInt(whole + fraction + '0'.repeat(Math.max(0, -places))),
    denominator: BigInt('1' + '0'.repeat(Math.max(0, places))),
  };
}

function discountScenario(values: Values): Calculation {
  const unitPrice = Number(values.price);
  const unitCost = Number(values.cost);
  const volume = Number(values.units);
  const price = decimalParts(unitPrice);
  const cost = decimalParts(unitCost);
  const rate = decimalParts(Number(values.discount));

  const rateScale = BigInt(100) * rate.denominator;
  const original = price.numerator * cost.denominator - cost.numerator * price.denominator;
  const discounted = original * rateScale - price.numerator * cost.denominator * rate.numerator;
  const discountedPrice = unitPrice * ((100 - Number(values.discount)) / 100);
  const before = unitPrice - unitCost;
  const after = discounted === BigInt(0) ? 0 : discountedPrice - unitCost;

  let required: number | null = null;
  let note: string;
  if (volume === 0) {
    required = 0;
    note = 'With no original sales, the contribution target is zero. Percentage growth from zero is undefined.';
  } else if (original <= BigInt(0)) {
    note = 'The original sale already breaks even or loses money. There is no positive contribution target to recover.';
  } else if (discounted <= BigInt(0)) {
    note = 'Each discounted sale breaks even or loses money. Selling more cannot recover the original positive contribution.';
  } else {
    const target = original * rateScale * BigInt(volume);
    const wholeSales = Number((target + discounted - BigInt(1)) / discounted);
    if (Number.isSafeInteger(wholeSales)) {
      required = wholeSales;
      note = 'Sales needed are rounded up to the next whole unit when necessary.';
    } else {
      note = 'The required sales volume exceeds the whole-number range this calculator can display.';
    }
  }
  const extra = required === null ? null : required - volume;
  return {
    rows: [
      money('Discounted selling price', discountedPrice),
      money('Original contribution per unit', before),
      money('Discounted contribution per unit', after),
      money('Original total contribution', before * volume),
      money('Discounted contribution at original volume', after * volume),
      count('Total sales needed to maintain positive contribution', required),
      count('Additional sales needed', extra),
      percent('Additional sales versus original volume', extra === null || volume === 0 ? null : extra / volume * 100),
    ],
    notes: [note],
    complete: true,
  };
}

function codScenario(values: Values): Calculation {
  const orders = Number(values.orders);
  const codOrders = orders * Number(values.cod) / 100;
  const failedOrders = codOrders * Number(values.rto) / 100;
  const forward = Number(values.forward);
  const returnShipping = Number(values.return);
  const packaging = Number(values.packaging);
  const writeOff = Number(values.loss);
  const failedCost = failedOrders * (forward + returnShipping + packaging + writeOff);
  const dispatchCost = orders * (forward + packaging) + failedOrders * (returnShipping + writeOff);

  return {
    rows: [
      count('Expected COD orders', codOrders),
      count('Expected COD RTO orders', failedOrders),
      money('Failed forward shipping', failedOrders * forward),
      money('Failed return shipping', failedOrders * returnShipping),
      money('Failed packaging', failedOrders * packaging),
      money('Failed product write-offs', failedOrders * writeOff),
      money('Total COD failed-delivery cost', failedCost),
      money('Failed-delivery cost per dispatched order', orders > 0 ? failedCost / orders : null),
      money('All-dispatch shipping, packaging and RTO losses', dispatchCost),
    ],
    notes: [orders === 0
      ? 'With no dispatched orders the modelled total is zero. Per-order cost is undefined.'
      : 'Shipping and packaging figures are averages for the same period.'],
    complete: true,
  };
}

function engagementScenario(values: Values): Calculation {
  const interactions = ['likes', 'comments', 'saves', 'shares']
    .reduce((total, field) => total + Number(values[field]), 0);
  const denominator = Number(values.denominator);
  const byReach = values.basis === 'Reach';

  return {
    rows: [
      count('Total interactions', interactions),
      count(byReach ? 'Unique accounts reached' : 'Followers at snapshot', denominator),
      percent(`Engagement by ${values.basis.toLowerCase()}`, denominator > 0 ? interactions / denominator * 100 : null),
    ],
    notes: [denominator === 0
      ? 'Enter a positive audience count to calculate the rate. Division by zero is undefined.'
      : byReach ? 'This rate uses unique accounts reached by the selected content.'
        : 'This rate uses your follower count at the selected snapshot.'],
    complete: true,
  };
}

function pricingScenario(values: Values): Calculation {
  const labour = Number(values.hours) * Number(values.hourly);
  const cost = labour + Number(values.expenses) + Number(values.overhead);
  const quote = cost / ((100 - Number(values.margin)) / 100);
  const profit = quote - cost;

  return {
    rows: [
      money('Total estimated project cost', cost),
      money('Quote before separately applicable tax', quote),
      money('Estimated profit after entered costs', profit),
      percent('Effective profit margin', quote > 0 ? profit / quote * 100 : null),
      percent('Equivalent markup on cost', cost > 0 ? profit / cost * 100 : null),
    ],
    notes: [cost === 0
      ? 'Zero entered cost produces a zero cost-based quote. Effective margin and markup are undefined.'
      : 'Margin measures profit as a share of the selling price. Markup measures profit as a share of the cost.'],
    complete: true,
  };
}

function settlementScenario(values: Values): Calculation {
  const netSales = Number(values.gross) - Number(values.refunds);
  const platformCosts = Number(values.fees) + Number(values.fulfilment) + Number(values.returns);
  const advertising = Number(values.ads);
  const withheldAds = values.adBasis === 'Deducted from settlement' ? advertising : 0;
  const payout = netSales - platformCosts - Number(values.other) - withheldAds;
  const contribution = netSales - platformCosts - advertising - Number(values.product);
  const notes = [];
  if (netSales < 0) notes.push('Refunds exceed sales. Check whether both amounts cover the intended settlement period.');
  if (contribution < 0) notes.push('Operating costs exceed sales after refunds. This scenario has negative contribution.');
  if (payout < 0) notes.push('The negative payout represents an estimated amount owed to the platform or carried forward.');

  return {
    rows: [
      money('Sales after refunds', netSales),
      money('Estimated platform payout / balance', payout),
      money('Advertising paid outside settlement', advertising - withheldAds),
      money('Contribution after entered operating costs', contribution),
      percent('Contribution margin on sales after refunds', netSales > 0 ? contribution / netSales * 100 : null),
    ],
    notes,
    complete: true,
  };
}

function proposalFields(prefix: 'a' | 'b'): InputField[] {
  const name = `Proposal ${prefix.toUpperCase()} · `;
  return [
    { key: prefix + 'Upfront', label: name + 'upfront price', money: true, optional: true },
    {
      key: prefix + 'Monthly', label: name + 'monthly recurring charges', money: true, optional: true,
      hint: 'Enter 0 only when the provider confirms no charge. Leave unknown charges blank.',
    },
    {
      key: prefix + 'Annual', label: name + 'annual recurring charges', money: true, optional: true,
      hint: 'Billed at the start and every 12 months. Exclude charges already in the upfront or monthly price.',
    },
    {
      key: prefix + 'Scope', label: name + 'included scope', text: true, optional: true,
      hint: 'Summarise page count, features, content, SEO and exclusions.',
    },
    {
      key: prefix + 'Ownership', label: name + 'account / asset ownership',
      options: ['Unknown', 'Client owns / controls', 'Shared / restricted', 'Provider controls'],
    },
    {
      key: prefix + 'Maintenance', label: name + 'maintenance',
      options: ['Unknown', 'Included in entered prices', 'Separate monthly charge', 'Not included'],
    },
    {
      key: prefix + 'Support', label: name + 'separate maintenance per month', money: true, optional: true,
      visibleWhen: values => values[prefix + 'Maintenance'] === 'Separate monthly charge',
    },
  ];
}

function priceProposal(values: Values, prefix: 'a' | 'b', months: number) {
  const name = `Proposal ${prefix.toUpperCase()}`;
  const maintenance = values[prefix + 'Maintenance'];
  const charges: [string, number, string][] = [
    ['Upfront', 1, 'upfront price'],
    ['Monthly', months, 'monthly price'],
    ['Annual', Math.ceil(months / 12), 'annual price'],
  ];
  if (maintenance === 'Separate monthly charge') {
    charges.push(['Support', months, 'separate maintenance cost']);
  }

  let subtotal: number | null = null;
  const notes: string[] = [];
  for (const [key, multiplier, description] of charges) {
    const entered = values[prefix + key]?.trim();
    if (entered) {
      subtotal = (subtotal ?? 0) + Number(entered) * multiplier;
    } else {
      notes.push(`${name}: ${description} is unknown.`);
    }
  }
  if (maintenance === 'Unknown') notes.push(`${name}: maintenance terms are unknown.`);
  if (maintenance === 'Not included') notes.push(`${name}: obtain a separate maintenance allowance to compare full costs.`);
  const total = notes.length === 0 ? subtotal : null;

  const scope = values[prefix + 'Scope']?.trim();
  const ownership = values[prefix + 'Ownership'];
  notes.push(`${name} scope: ${scope || 'Missing — request a written inclusion and exclusion list.'}`);
  notes.push(`${name} ownership: ${ownership}. Maintenance: ${maintenance}.`);

  return {
    total,
    rows: [
      money(`${name} · known cost subtotal (${months} months)`, subtotal),
      money(`${name} · complete entered-price total`, total),
    ],
    notes,
  };
}

function compareProposals(values: Values): Calculation {
  const months = Number.parseInt(values.months, 10);
  const first = priceProposal(values, 'a', months);
  const second = priceProposal(values, 'b', months);
  const difference = first.total === null || second.total === null ? null : second.total - first.total;
  return {
    rows: [
      ...first.rows,
      ...second.rows,
      money('B minus A · difference in complete entered-price totals', difference),
    ],
    notes: [...first.notes, ...second.notes, 'Check included scope and ownership alongside the price difference.'],
    complete: difference !== null,
  };
}

export const businessTools: BusinessTool[] = [
  {
    slug: 'discount-profit-calculator',
    name: 'Discount Profit Calculator',
    description: 'Compare contribution before and after a discount, and the extra sales needed to preserve it.',
    service: 'ecommerce-store-development',
    fields: [
      { key: 'price', label: 'Original selling price per unit', money: true },
      {
        key: 'cost',
        label: 'Variable cost per unit',
        hint: 'Include product, fulfilment and other costs that vary with each sale. Keep the same tax basis as price.',
        money: true,
      },
      { key: 'discount', label: 'Discount (%)', max: 100 },
      { key: 'units', label: 'Original sales volume (units)', integer: true },
    ],
    example: {
      price: '1000',
      cost: '600',
      discount: '10',
      units: '100',
    },
    formula: 'Discounted price = price × (1 − discount/100). Unit contribution = selling price − variable cost. Target contribution = original unit contribution × original units. Required units = round up(target ÷ discounted unit contribution), when both contributions are positive.',
    exampleText: 'At a price of 1,000 and variable cost of 600, contribution is 400 per sale. A 10% discount reduces it to 300. For 100 original sales, the 40,000 contribution target needs 134 discounted sales: 34 more sales (34%).',
    caveat: 'Contribution covers fixed costs and profit; it is not net profit. This assumes unchanged unit costs and demand capacity. A discount does not guarantee more sales.',
    calculate: discountScenario,
  },
  {
    slug: 'cod-rto-cost-calculator',
    name: 'COD & RTO Cost Calculator',
    description: 'Estimate COD failed-delivery costs from your own order, shipping and loss assumptions.',
    service: 'ecommerce-store-development',
    fields: [
      { key: 'orders', label: 'Dispatched orders in the period', integer: true },
      { key: 'cod', label: 'COD share of dispatched orders (%)', max: 100 },
      { key: 'rto', label: 'RTO rate among COD orders (%)', max: 100 },
      { key: 'forward', label: 'Forward shipping per dispatched order', money: true },
      { key: 'return', label: 'Return shipping per RTO order', money: true },
      { key: 'packaging', label: 'Non-recoverable packaging per order', money: true },
      {
        key: 'loss',
        label: 'Unrecoverable product cost per RTO order',
        hint: 'Enter only the expected write-off, not the value of stock recovered for resale.',
        money: true,
      },
    ],
    example: {
      orders: '1000',
      cod: '60',
      rto: '20',
      forward: '70',
      return: '60',
      packaging: '20',
      loss: '30',
    },
    formula: 'Expected COD RTO orders = dispatched orders × COD share/100 × COD RTO rate/100. Failed-delivery cost = expected COD RTO orders × (forward shipping + return shipping + packaging + unrecoverable product cost). All-dispatch cost = all orders × (forward shipping + packaging) + COD RTO orders × (return shipping + unrecoverable product cost).',
    exampleText: 'For 1,000 orders, 60% COD and 20% COD RTO, expect 120 failed deliveries. At 70 forward + 60 return + 20 packaging + 30 product loss, failed-delivery cost is 21,600. The all-dispatch model totals 100,800; it already includes those failed-delivery costs.',
    caveat: 'Expected volumes may be fractional. Only COD failures are modelled; prepaid RTO, cancellations before dispatch, COD collection fees, taxes and other costs are outside this model. Do not add failed cost to the all-dispatch total again.',
    calculate: codScenario,
  },
  {
    slug: 'instagram-engagement-calculator',
    name: 'Instagram Engagement Calculator',
    description: 'Calculate engagement by reach or followers using manual counts, with no scraping or account access.',
    service: 'social-media-management',
    fields: [
      { key: 'basis', label: 'Engagement denominator', options: ['Reach', 'Followers'] },
      { key: 'likes', label: 'Likes', integer: true },
      { key: 'comments', label: 'Comments', integer: true },
      { key: 'saves', label: 'Saves', integer: true },
      { key: 'shares', label: 'Shares', integer: true },
      {
        key: 'denominator',
        label: 'Reach or follower count (selected above)',
        integer: true,
        hint: 'Reach = unique accounts reached by the selected content. Followers = follower count at your stated snapshot. Use one consistent content set and period.',
      },
    ],
    example: {
      basis: 'Reach',
      likes: '100',
      comments: '20',
      saves: '30',
      shares: '10',
      denominator: '2000',
    },
    formula: 'Engagement rate = (likes + comments + saves + shares) ÷ selected denominator × 100. By reach divides by unique accounts reached. By followers divides by a follower-count snapshot, not by the people who actually saw the content.',
    exampleText: '100 likes + 20 comments + 30 saves + 10 shares = 160 interactions. With reach of 2,000, engagement by reach is 8%. The same interactions divided by 4,000 followers would be 4% by followers.',
    caveat: 'Interactions are not unique people and can exceed reach or follower count; a rate above 100% is mathematically possible. No benchmark or account-quality judgment is implied. Manual inputs only.',
    calculate: engagementScenario,
  },
  {
    slug: 'project-pricing-calculator',
    name: 'Project Pricing Calculator',
    description: 'Turn delivery costs and a desired profit margin into a transparent project quote.',
    service: 'web-design-development',
    fields: [
      { key: 'hours', label: 'Estimated delivery hours' },
      {
        key: 'hourly',
        label: 'Internal cost per hour',
        hint: 'Your delivery cost, not the hourly rate billed to a client.',
        money: true,
      },
      { key: 'expenses', label: 'Direct project expenses', money: true },
      {
        key: 'overhead',
        label: 'Allocated project overhead',
        hint: 'Enter a currency amount, not a percentage. Avoid costs already in your hourly cost.',
        money: true,
      },
      { key: 'margin', label: 'Desired profit margin (%)', exclusiveMax: 100 },
    ],
    example: {
      hours: '40',
      hourly: '500',
      expenses: '3000',
      overhead: '2000',
      margin: '25',
    },
    formula: 'Total cost = hours × hourly cost + direct expenses + allocated overhead. Quote = total cost ÷ (1 − margin/100). Profit = quote − cost. Markup = profit ÷ cost × 100; margin = profit ÷ quote × 100.',
    exampleText: '40 hours × 500 + 3,000 expenses + 2,000 overhead = 25,000 cost. A 25% margin requires a quote of 33,333.33, with 8,333.33 profit. That is 33.33% markup, not 25% markup.',
    caveat: 'Amounts use one consistent tax basis; tax, contingency and scope changes are not silently added. A 100% margin is impossible with positive cost. The result is a planning estimate, not a Kraftt quotation.',
    calculate: pricingScenario,
  },
  {
    slug: 'marketplace-settlement-calculator',
    name: 'Marketplace Settlement Calculator',
    description: 'Separate estimated platform payout from contribution using your own settlement costs.',
    service: 'marketplace-catalogue-building',
    fields: [
      {
        key: 'gross',
        label: 'Gross sales in the period',
        hint: 'Before entered refunds. Keep all amounts on the same tax basis.',
        money: true,
      },
      { key: 'refunds', label: 'Customer refunds', money: true },
      { key: 'fees', label: 'Platform fees deducted', money: true },
      { key: 'fulfilment', label: 'Fulfilment / shipping deductions', money: true },
      {
        key: 'returns',
        label: 'Return handling deductions',
        hint: 'Exclude customer refunds entered above.',
        money: true,
      },
      { key: 'ads', label: 'Advertising costs', money: true },
      {
        key: 'adBasis',
        label: 'Advertising payment',
        options: ['Deducted from settlement', 'Paid separately'],
      },
      {
        key: 'other',
        label: 'Other settlement deductions',
        hint: 'Enter actual tax withholding, reserves or adjustments if applicable; no platform fee is assumed.',
        money: true,
      },
      {
        key: 'product',
        label: 'Product cost for the period',
        hint: 'Cost of retained sales plus unrecoverable write-offs; exclude recovered return stock and avoid counting costs twice.',
        money: true,
      },
    ],
    example: {
      gross: '100000',
      refunds: '10000',
      fees: '12000',
      fulfilment: '5000',
      returns: '2000',
      ads: '8000',
      adBasis: 'Deducted from settlement',
      other: '0',
      product: '40000',
    },
    formula: 'Payout = gross sales − refunds − platform fees − fulfilment − return handling − other settlement deductions − advertising if withheld. Contribution = gross sales − refunds − platform fees − fulfilment − return handling − all advertising − product cost. Other settlement deductions are cash adjustments, not automatically expenses.',
    exampleText: '100,000 sales − 10,000 refunds − 12,000 fees − 5,000 fulfilment − 2,000 return handling − 8,000 withheld advertising = 63,000 payout. After 40,000 product costs, contribution is 23,000. If ads are paid separately, payout is 71,000 but contribution remains 23,000.',
    caveat: 'Payout is cash due from the platform, not profit. Contribution excludes fixed overheads, income tax and any costs not entered. Other settlement deductions affect payout only; include genuine expenses in the applicable cost fields. Actual timing, reserves, taxes and adjustments depend on your statement.',
    calculate: settlementScenario,
  },
  {
    slug: 'website-quote-comparison',
    name: 'Website Quote Comparison',
    description: 'Compare two website proposals over a chosen period, with unknown costs and scope kept visible.',
    service: 'web-design-development',
    fields: [
      {
        key: 'months',
        label: 'Comparison period',
        options: ['12 months', '24 months', '36 months', '60 months'],
      },
      ...proposalFields('a'),
      ...proposalFields('b'),
    ],
    example: {
      months: '24 months',
      aUpfront: '25000',
      aMonthly: '1000',
      aAnnual: '2000',
      aScope: 'Five pages, responsive design, enquiry form',
      aOwnership: 'Client owns / controls',
      aMaintenance: 'Included in entered prices',
      aSupport: '',
      bUpfront: '18000',
      bMonthly: '1500',
      bAnnual: '0',
      bScope: 'Five pages; SEO scope to confirm',
      bOwnership: 'Unknown',
      bMaintenance: 'Separate monthly charge',
      bSupport: '500',
    },
    formula: 'Known period cost = upfront + months × monthly charges + ceiling(months/12) × annual charges + months × separate maintenance, where applicable. A complete entered-price total is shown only when all cost and maintenance information is known. Ownership and scope are compared separately, without arbitrary scoring.',
    exampleText: 'Over 24 months, Proposal A costs 25,000 + 24 × 1,000 + 2 × 2,000 = 53,000. Proposal B costs 18,000 + 24 × 1,500 + 24 × 500 = 66,000. B costs 13,000 more on entered prices; ownership and SEO scope still need clarification. This is not a recommendation to choose A.',
    caveat: 'Blank charges are unknown, not free. Included maintenance means included in the entered prices; no double charge is added. Annual charges are billed at the start of each year, not prorated. Compare tax basis, scope, licences, handover and support obligations directly with providers. No quality score or guaranteed result is implied.',
    calculate: compareProposals,
  },
];

export function defaults(tool: BusinessTool): Values {
  return Object.fromEntries(tool.fields.map(field => [field.key, field.options?.[0] ?? '']));
}

export function evaluate(tool: BusinessTool, values: Values): {
  result: Calculation | null;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  for (const field of tool.fields) {
    if (field.text || (field.visibleWhen && !field.visibleWhen(values))) continue;
    const raw = values[field.key]?.trim() ?? '';
    if (field.options) {
      if (!field.options.includes(raw)) errors[field.key] = 'Choose one of the available options.';
      continue;
    }
    if (!raw) {
      if (!field.optional) errors[field.key] = 'Enter a value. Use 0 for a confirmed zero.';
      continue;
    }
    const value = Number(raw);
    const limit = field.max ?? 1e12;
    if (!Number.isFinite(value) || value < 0 || value > limit || (field.integer && !Number.isInteger(value))) {
      errors[field.key] = `Enter a ${field.integer ? 'whole ' : ''}number from 0 to ${limit.toLocaleString('en-US')}.`;
    } else if (field.exclusiveMax !== undefined && value >= field.exclusiveMax) {
      errors[field.key] = `Enter a value below ${field.exclusiveMax}.`;
    }
  }
  if (Object.keys(errors).length) return { result: null, errors };

  const result = tool.calculate(values);
  if (result.rows.some(row => row.value !== null && !Number.isFinite(row.value))) {
    return { result: null, errors: { calculation: 'These inputs exceed the calculation range. Reduce the amounts.' } };
  }
  return { result, errors };
}
