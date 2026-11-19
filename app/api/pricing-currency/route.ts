import { geographicCurrency } from '../../data/pricing';

// Keep the existing endpoint deterministic for callers passing a page path.
export function GET(request: Request) {
  const path = new URL(request.url).searchParams.get('path') ?? '/';
  return Response.json({ currency: geographicCurrency(path) ?? 'INR' });
}
