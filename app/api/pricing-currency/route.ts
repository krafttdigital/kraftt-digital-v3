import { detectPricingCurrency } from '../../data/pricing.server';

export async function GET() {
  const currency = await detectPricingCurrency();
  return Response.json({ currency }, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
