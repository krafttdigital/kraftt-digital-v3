'use client';

import { createContext, useContext, type ReactNode } from 'react';
import {
  formatRegionalAmount,
  regionalizePriceCopy,
  type PricingCurrency,
  type RegionalAmount,
} from '../data/pricing';

const PricingCurrencyContext = createContext<PricingCurrency>('INR');

export function PricingCurrencyProvider({ currency, children }: { currency: PricingCurrency; children: ReactNode }) {
  return <PricingCurrencyContext.Provider value={currency}>{children}</PricingCurrencyContext.Provider>;
}

export function usePricingCurrency() {
  return useContext(PricingCurrencyContext);
}

export function RegionalPriceCopy({ children }: { children: string }) {
  const currency = usePricingCurrency();
  return <>{regionalizePriceCopy(children, currency)}</>;
}

export function RegionalAmountText({ amount }: { amount: RegionalAmount<number> }) {
  const currency = usePricingCurrency();
  return <>{formatRegionalAmount(amount[currency], currency)}</>;
}

export function CurrencySymbol() {
  const currency = usePricingCurrency();
  return <>{currency === 'INR' ? '₹' : '$'}</>;
}
