type EdgeContext = {
  next: (options?: { sendConditionalRequest?: boolean }) => Promise<Response>;
};

export default async function cachePublicHtml(request: Request, context: EdgeContext) {
  if (!request.headers.get('accept')?.includes('text/html')) return;
  const response = await context.next({ sendConditionalRequest: true });
  if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) return response;
  const headers = new Headers(response.headers);
  // Published prices are determined by the URL, so the framework's own
  // cache variations are sufficient for every region.
  headers.set('Netlify-CDN-Cache-Control', 'public, max-age=900, stale-while-revalidate=3600');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export const config = {
  cache: 'manual',
  excludedPath: [
    '/_next/*', '/api/*', '/assets/*',
    '/*.ico', '/*.jpg', '/*.jpeg', '/*.png', '/*.webp', '/*.svg',
    '/*.mp4', '/*.pdf', '/*.txt', '/*.xml',
  ],
  method: ['GET'],
  name: 'Cache public HTML',
  onError: 'bypass',
  path: '/*',
};
