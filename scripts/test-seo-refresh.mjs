import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

// Execute the shipped calculation and availability handlers without a browser or network.
function load(file, mocks = {}) {
  const filename = path.resolve(file);
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  const testModule = { exports: {} };
  vm.runInNewContext(source, { exports: testModule.exports, module: testModule, console, Date, Intl,
    require(name) {
      if (name in mocks) return mocks[name];
      if (name.startsWith('.')) return load(path.resolve(path.dirname(filename), name + '.ts'), mocks);
      throw Error('Unmocked import: ' + name);
    },
  }, { filename });
  return testModule.exports;
}
const availability = load('app/data/offers.ts');
const { diwaliGrowthOffer } = load('app/data/diwaliGrowthOffer.ts');
for (const offer of [...availability.offers, diwaliGrowthOffer]) {
  assert.equal(availability.isOfferClaimable(offer, new Date('2026-11-08T18:29:58.999Z')), true);
  assert.equal(availability.isOfferClaimable(offer, new Date('2026-11-08T18:29:59.000Z')), true);
  assert.equal(availability.isOfferClaimable(offer, new Date('2026-11-08T18:29:59.001Z')), false);
  assert.equal(availability.activeOffers([offer], new Date('2026-11-13T00:00:00+05:30')).length, 0);
  assert.equal(availability.isOfferClaimable({ ...offer, status: 'paused' }, new Date('2026-11-01')), false);
}

function calculate(component, answers, currency = 'INR') {
  let stateIndex = 0, result;
  const events = [];
  const jsx = (type, props) => ({ type, props });
  const mocks = {
    react: { useState: initial => { const index = stateIndex++; return [index < answers.length ? answers[index] : initial, value => { result = value; }]; }, useRef: initial => ({ current: initial }) },
    'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'fragment' },
    '../../../lib/analytics/core': { trackEvent: (...args) => events.push(args) },
    './CalculatorPrimitives': { OptionQuestion: 'question', ResultPanel: 'result', revealResult() {} },
    './ToolSuite': { Button: 'button', ResultActions: 'actions' },
    '../../components/PricingCurrencyProvider': { usePricingCurrency: () => currency },
  };
  const loaded = load(`app/tools/components/${component}.tsx`, mocks);
  const tree = loaded[component]();
  const form = tree.props.children[0];
  const event = { preventDefault() {} };
  form.props.onSubmit(event); form.props.onSubmit(event);
  assert.equal(events.length, 1, 'Repeated calculation with identical inputs must not double count');
  return result;
}
for (const [pages, expected] of [['one', 12000], ['business', 25000], ['growth', 45000]]) {
  const result = calculate('WebsiteCostCalculator', ['informational', pages, 'yes', 'needed', '30-days']);
  assert.equal(result.basePrice, expected);
  assert.equal(result.oneTimeTotal, expected + 12000);
  assert.ok(result.addons.some(addon => addon.label === 'Ongoing SEO' && addon.value.includes('/month')));
}
assert.equal(calculate('WebsiteCostCalculator', ['ecommerce', 'business', 'no', 'ready', 'exploring']).basePrice, 40000);
assert.equal(calculate('WebsiteCostCalculator', ['informational', 'one', 'no', 'ready', 'exploring'], 'USD').basePrice, 299);
for (const [platforms, posts, expected] of [['1', '15', 'Social Starter'], ['2', '15', 'Social Growth'], ['1', '21', 'Social Growth'], ['3', '15', 'Social Presence Management'], ['1', '30', 'Social Presence Management']]) {
  assert.equal(calculate('SocialMediaCostCalculator', [platforms, posts, '10', 'yes']).name, expected);
}
console.log('SEO refresh: both offer expiry boundaries, paused status, calculator prices/formulas and event deduplication passed. No external requests.');
