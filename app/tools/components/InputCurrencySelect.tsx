'use client';

import { isPricingCurrency, type PricingCurrency } from '../../data/pricing';
import { Field } from './CalculatorPrimitives';

export function InputCurrencySelect({ currency, change }: { currency: PricingCurrency; change: (currency: PricingCurrency) => void }) {
  return <Field label="Currency for your figures" hint="Changing this clears the entered amounts. The site’s pricing region is separate.">
    <select value={currency} onChange={event => { if (isPricingCurrency(event.target.value)) change(event.target.value); }}>
      <option value="INR">Indian rupee · INR</option>
      <option value="USD">US dollar · USD</option>
    </select>
  </Field>;
}
