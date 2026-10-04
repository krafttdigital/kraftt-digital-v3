import { token } from '../lib/analytics/core.ts';

const [address, source, medium, campaign, content, term] = process.argv.slice(2);
try {
  if (!address || !source || !medium || !campaign) throw new Error('Usage: npm run utm -- URL source medium campaign [content] [term]');
  const url = new URL(address);
  if (url.origin !== 'https://krafttdigital.in' || url.username || url.password) throw new Error('Use a production Kraftt https://krafttdigital.in URL.');
  for (const [name, value] of Object.entries({ source, medium, campaign, content, term })) {
    if (!value) continue;
    if (!token(value) || token(value) !== value) throw new Error(`${name}: use lowercase snake_case; no personal data.`);
    url.searchParams.set('utm_' + name, value);
  }
  console.log(url.toString());
} catch (error) { console.error(error.message); process.exitCode = 1; }
