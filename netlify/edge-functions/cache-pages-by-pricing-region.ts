type EdgeContext = {
  next: (options?: { sendConditionalRequest?: boolean }) => Promise<Response>;
};

// Netlify groups every listed non-India country into one cache variation.
// An unavailable/unknown country remains a separate fallback variation, so
// the application's existing INR fallback cannot inherit international HTML.
const INTERNATIONAL_COUNTRY_CODES = `
  AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ
  CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR
  GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IO IQ IR IS IT JE JM JO JP
  KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS
  MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS
  RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW
  TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW
`.trim().split(/\s+/).join('+');

const PRICING_REGION_CACHE_KEY = `country=IN|${INTERNATIONAL_COUNTRY_CODES}`;

export default async function cachePagesByPricingRegion(request: Request, context: EdgeContext) {
  const acceptsHtml = request.headers.get('accept')?.includes('text/html');
  if (!acceptsHtml) return;

  const response = await context.next({ sendConditionalRequest: true });
  const contentType = response.headers.get('content-type') ?? '';
  if (!response.ok || !contentType.includes('text/html')) return response;

  const headers = new Headers(response.headers);
  const frameworkVary = headers.get('Netlify-Vary');
  headers.set('Netlify-CDN-Cache-Control', 'public, max-age=900, stale-while-revalidate=3600');
  headers.set(
    'Netlify-Vary',
    frameworkVary ? `${frameworkVary},${PRICING_REGION_CACHE_KEY}` : PRICING_REGION_CACHE_KEY,
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export const config = {
  cache: 'manual',
  excludedPath: [
    '/_next/*',
    '/api/*',
    '/assets/*',
    '/*.ico',
    '/*.jpg',
    '/*.jpeg',
    '/*.png',
    '/*.webp',
    '/*.svg',
    '/*.mp4',
    '/*.pdf',
    '/*.txt',
    '/*.xml',
  ],
  method: ['GET'],
  name: 'Cache HTML by pricing region',
  onError: 'bypass',
  path: '/*',
};
