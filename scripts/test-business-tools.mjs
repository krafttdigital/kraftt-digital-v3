import assert from 'node:assert/strict';
import { test } from 'node:test';
import { businessTools, defaults, evaluate } from '../app/tools/businessModels.ts';

const [discount, cod, engagement, pricing, settlement, comparison] = [
  'discount-profit-calculator',
  'cod-rto-cost-calculator',
  'instagram-engagement-calculator',
  'project-pricing-calculator',
  'marketplace-settlement-calculator',
  'website-quote-comparison',
].map(slug => businessTools.find(tool => tool.slug === slug));

function result(tool, changes = {}) {
  const { result, errors } = evaluate(tool, { ...tool.example, ...changes });
  assert.deepEqual(errors, {});
  assert.ok(result);
  return result;
}

function value(result, label) {
  const row = result.rows.find(row => row.label === label);
  assert.ok(row, `Missing result row: ${label}`);
  return row.value;
}

function invalid(tool, field, entry) {
  const response = evaluate(tool, { ...tool.example, [field]: entry });
  assert.ok(response.errors[field], `${tool.slug}: invalid ${field}=${entry} was accepted`);
  assert.equal(response.result, null);
}

function near(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-7, `${actual} differs from ${expected}`);
}

test('each calculator accepts its example, rejects invalid inputs and starts without assumed charges', () => {
  assert.equal(businessTools.length, 6);
  for (const tool of businessTools) {
    assert.equal(result(tool).complete, true);
    const empty = evaluate(tool, defaults(tool)).result;
    if (tool === comparison) assert.equal(empty.complete, false);
    else assert.equal(empty, null);

    const numeric = tool.fields.find(field => !field.text && !field.options);
    for (const entry of ['-1', 'NaN', 'Infinity', '10000000000001']) invalid(tool, numeric.key, entry);
    const choice = tool.fields.find(field => field.options);
    if (choice) invalid(tool, choice.key, 'not a listed option');
  }
  assert.equal(pricing.fields.find(field => field.key === 'hours').money, undefined);
  assert.ok(pricing.fields.find(field => field.key === 'hourly').money);
  assert.ok(engagement.fields.every(field => !field.money));
});

test('discount preserves original total contribution and rounds whole sales upwards', () => {
  const example = result(discount);
  assert.equal(value(example, 'Additional sales needed'), 34);
  assert.equal(value(example, 'Original total contribution'), 40000);
  assert.equal(value(result(discount, { discount: '0' }), 'Additional sales needed'), 0);
  assert.equal(value(result(discount, { discount: '40' }), 'Additional sales needed'), null);
  assert.equal(value(result(discount, { cost: '1100' }), 'Additional sales needed'), null);
  assert.equal(value(result(discount, { discount: '100' }), 'Discounted selling price'), 0);
  invalid(discount, 'units', '1.5');
  invalid(discount, 'discount', '100.01');

  const zeroVolume = result(discount, { units: '0', discount: '100' });
  assert.equal(value(zeroVolume, 'Additional sales needed'), 0);
  assert.equal(value(zeroVolume, 'Additional sales versus original volume'), null);

  const breakeven = result(discount, { price: '100', cost: '14', discount: '86', units: '1' });
  assert.equal(value(breakeven, 'Discounted contribution per unit'), 0);
  assert.equal(value(breakeven, 'Additional sales needed'), null);
  const tinyDiscount = result(discount, { price: '100', cost: '0', discount: '1e-9', units: '1' });
  assert.equal(value(tinyDiscount, 'Additional sales needed'), 1);
  const wholeRatio = result(discount, { price: '0.3', cost: '0.1', discount: '50', units: '1' });
  assert.equal(value(wholeRatio, 'Additional sales needed'), 3);
});

test('COD costs use the COD subset, include failed orders once and accept fractional expectations', () => {
  const example = result(cod);
  near(value(example, 'Expected COD RTO orders'), 120);
  near(value(example, 'Total COD failed-delivery cost'), 21600);
  near(value(example, 'All-dispatch shipping, packaging and RTO losses'), 100800);
  assert.equal(value(result(cod, { orders: '0' }), 'Failed-delivery cost per dispatched order'), null);
  assert.equal(value(result(cod, { cod: '0' }), 'Total COD failed-delivery cost'), 0);
  assert.equal(value(result(cod, { cod: '100', rto: '100' }), 'Expected COD RTO orders'), 1000);
  near(value(result(cod, { orders: '3' }), 'Expected COD RTO orders'), 0.36);
  invalid(cod, 'rto', '101');
});

test('Instagram uses the selected denominator, including undefined and above-100% rates', () => {
  assert.equal(value(result(engagement), 'Engagement by reach'), 8);
  const followers = result(engagement, { basis: 'Followers', denominator: '4000' });
  assert.equal(value(followers, 'Engagement by followers'), 4);
  assert.equal(value(result(engagement, { denominator: '0' }), 'Engagement by reach'), null);
  assert.equal(value(result(engagement, { denominator: '1' }), 'Engagement by reach'), 16000);

  const noInteractions = result(engagement, { likes: '0', comments: '0', saves: '0', shares: '0' });
  assert.equal(value(noInteractions, 'Engagement by reach'), 0);
  invalid(engagement, 'denominator', '1.25');
});

test('project pricing quotes margin on sales and calculates markup on cost', () => {
  const example = result(pricing);
  near(value(example, 'Quote before separately applicable tax'), 33333.333333333336);
  near(value(example, 'Effective profit margin'), 25);
  near(value(example, 'Equivalent markup on cost'), 33.33333333333334);
  const zero = result(pricing, { hours: '0', expenses: '0', overhead: '0' });
  assert.equal(value(zero, 'Effective profit margin'), null);
  assert.equal(value(zero, 'Equivalent markup on cost'), null);
  assert.equal(value(result(pricing, { margin: '0' }), 'Estimated profit after entered costs'), 0);
  near(value(result(pricing, { margin: '99.999' }), 'Effective profit margin'), 99.999);
  invalid(pricing, 'margin', '100');
});

test('settlement cash and contribution handle external ads, reserves, losses and refund-heavy periods', () => {
  const example = result(settlement);
  assert.equal(value(example, 'Estimated platform payout / balance'), 63000);
  assert.equal(value(example, 'Contribution after entered operating costs'), 23000);
  const external = result(settlement, { adBasis: 'Paid separately' });
  assert.equal(value(external, 'Estimated platform payout / balance'), 71000);
  assert.equal(value(external, 'Contribution after entered operating costs'), 23000);
  const withReserve = result(settlement, { other: '1000' });
  assert.equal(value(withReserve, 'Estimated platform payout / balance'), 62000);
  assert.equal(value(withReserve, 'Contribution after entered operating costs'), 23000);
  const loss = result(settlement, { product: '100000' });
  assert.equal(value(loss, 'Contribution after entered operating costs'), -37000);
  const noSales = result(settlement, { gross: '0', refunds: '0' });
  assert.equal(value(noSales, 'Contribution margin on sales after refunds'), null);
  const refunds = result(settlement, { refunds: '110000' });
  assert.equal(value(refunds, 'Estimated platform payout / balance'), -37000);
  assert.ok(refunds.notes.some(note => note.includes('Refunds exceed sales')));
});

test('website quotes apply the chosen period, recurring prices and comparable maintenance', () => {
  const example = result(comparison);
  assert.equal(value(example, 'Proposal A · complete entered-price total'), 53000);
  assert.equal(value(example, 'Proposal B · complete entered-price total'), 66000);
  const difference = 'B minus A · difference in complete entered-price totals';
  assert.equal(value(example, difference), 13000);

  const missingMonthly = result(comparison, { aMonthly: '' });
  assert.equal(value(missingMonthly, 'Proposal A · complete entered-price total'), null);
  assert.equal(value(missingMonthly, difference), null);
  assert.equal(missingMonthly.complete, false);
  assert.equal(value(result(comparison, { aMonthly: '0' }), 'Proposal A · complete entered-price total'), 29000);
  assert.equal(value(result(comparison, { months: '12 months' }), 'Proposal A · complete entered-price total'), 39000);
  assert.equal(value(result(comparison, { months: '60 months' }), 'Proposal A · complete entered-price total'), 95000);
  assert.equal(result(comparison, { aMaintenance: 'Not included' }).complete, false);
  assert.equal(result(comparison, { bSupport: '' }).complete, false);
  assert.ok(result(comparison, { aScope: '' }).notes.some(note => note.includes('Missing')));
});

test('quote subtotals distinguish missing prices from confirmed zero and skip unused support fields', () => {
  const data = { ...defaults(comparison), aScope: 'One page' };
  const onlyScope = evaluate(comparison, data).result;
  const knownA = 'Proposal A · known cost subtotal (12 months)';
  assert.equal(value(onlyScope, knownA), null);
  assert.equal(value(onlyScope, 'Proposal B · known cost subtotal (12 months)'), null);
  const explicitZero = evaluate(comparison, { ...data, aUpfront: '0' }).result;
  assert.equal(value(explicitZero, knownA), 0);
  assert.equal(explicitZero.complete, false);
  const inactiveSupport = result(comparison, { aSupport: '-1' });
  assert.equal(value(inactiveSupport, 'Proposal A · complete entered-price total'), 53000);
  invalid(comparison, 'bSupport', '-1');
});
