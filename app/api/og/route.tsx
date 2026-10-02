import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') ?? 'Kraftt Digital';
  const label = searchParams.get('label') ?? 'Digital presence, made clear';
  const path = searchParams.get('path') ?? '/';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: '#f2eee7',
          color: '#151515',
          fontFamily: 'Georgia, serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', width: 560, height: 560, borderRadius: 999, background: '#d7c29f', right: -150, top: -230, opacity: 0.72 }} />
        <div style={{ position: 'absolute', width: 430, height: 430, borderRadius: 999, background: '#9a805e', right: 115, bottom: -260, opacity: 0.85 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'Arial, sans-serif', fontSize: 24, zIndex: 1 }}>
          <span style={{ fontSize: 38, fontFamily: 'Georgia, serif' }}>Kraftt</span>
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.18em', color: '#735f45', fontSize: 18 }}>{label}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', width: 900, zIndex: 1 }}>
          <div style={{ width: 68, height: 5, background: '#9a805e', marginBottom: 24 }} />
          <div style={{ fontSize: title.length > 62 ? 62 : 76, lineHeight: 1.03, letterSpacing: '-0.035em' }}>{title}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Arial, sans-serif', fontSize: 20, zIndex: 1 }}>
          <span>krafttdigital.in</span>
          <span style={{ color: '#735f45' }}>{path}</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
