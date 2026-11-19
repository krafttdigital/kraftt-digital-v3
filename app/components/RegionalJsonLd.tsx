'use client';

import { JsonLd } from './JsonLd';
import { usePricingCurrency } from './PricingCurrencyProvider';
import { addOnIds, formatServicePrice, priceFor, regionalizePriceCopy, type PriceId, type PricingCurrency } from '../data/pricing';

type Tier = { name: string; priceId: PriceId | null; deliverables: string[] };
type FaqEntity = { acceptedAnswer: { text: string; [key: string]: unknown }; [key: string]: unknown };

function offer(id: PriceId, name: string, currency: PricingCurrency, url: unknown, description?: string) {
  const { amount, cadence } = priceFor(id, currency);
  if (amount === null) return null;
  return {
    '@type': 'Offer', name, url, description, price: amount, priceCurrency: currency,
    ...(cadence === 'one-time' ? {} : {
      priceSpecification: {
        '@type': 'UnitPriceSpecification', price: amount, priceCurrency: currency,
        billingIncrement: 1, unitText: cadence === 'monthly' ? 'month' : 'year',
      },
    }),
  };
}

export function RegionalJsonLd({ data, tiers }: { data: Record<string, unknown>; tiers?: readonly Tier[] }) {
  const currency = usePricingCurrency();
  const graph = data['@graph'] as Record<string, unknown>[];
  return <JsonLd data={{
    ...data,
    '@graph': graph.map(entity => {
      if (entity['@type'] === 'FAQPage') {
        return { ...entity, mainEntity: (entity.mainEntity as FaqEntity[]).map(item => ({
          ...item, acceptedAnswer: { ...item.acceptedAnswer, text: regionalizePriceCopy(item.acceptedAnswer.text, currency, formatServicePrice) },
        })) };
      }
      if (entity['@type'] !== 'Service' || !tiers) return entity;
      const offers = tiers.flatMap(tier => {
        if (!tier.priceId) return [];
        const price = offer(tier.priceId, tier.name, currency, entity.url, tier.deliverables.join('; '));
        if (!price) return [];
        const addOn = addOnIds(tier.priceId).map(id => offer(id, priceFor(id, currency).name, currency, entity.url)).filter(Boolean);
        return [{ ...price, ...(addOn.length ? { addOn } : {}) }];
      });
      return { ...entity, ...(offers.length ? { offers } : {}) };
    }),
  }} />;
}
