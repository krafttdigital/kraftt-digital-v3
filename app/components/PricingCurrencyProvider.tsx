'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  formatRegionalAmount,
  regionalizePriceCopy,
  type PricingCurrency,
  type RegionalAmount,
} from '../data/pricing';

const PricingCurrencyContext = createContext<PricingCurrency>('INR');

export function PricingCurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<PricingCurrency>('INR');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/pricing-currency', { signal: controller.signal, cache: 'no-store' })
      .then((response) => response.ok ? response.json() : null)
      .then((result: unknown) => {
        if (!result || typeof result !== 'object' || !('currency' in result)) return;
        if (result.currency !== 'INR' && result.currency !== 'USD') return;
        setCurrency(result.currency);
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

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
