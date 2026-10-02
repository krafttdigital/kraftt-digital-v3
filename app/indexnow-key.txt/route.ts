export const dynamic = 'force-static';

export function GET() {
  const key = process.env.INDEXNOW_KEY?.trim();
  if (!key || !/^[a-fA-F0-9]{8,128}$/.test(key)) {
    return new Response('IndexNow is not configured.\n', {
      status: 404,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  return new Response(`${key}\n`, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
