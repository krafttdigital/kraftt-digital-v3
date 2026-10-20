'use client';

import { Player } from '@remotion/player';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const WIDTH = 1000;
const HEIGHT = 260;
const DURATION = 210;

function LessonMotion() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const appear = spring({ frame, fps, config: { damping: 200, stiffness: 85 } });
  const progress = interpolate(frame, [15, 108], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const secondAppear = spring({ frame: frame - 83, fps, config: { damping: 200, stiffness: 95 } });
  const exit = interpolate(frame, [178, DURATION - 1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const traveler = 224 + 552 * progress;

  return (
    <AbsoluteFill style={{ background: '#e8dcc8', overflow: 'hidden', fontFamily: 'Arial, sans-serif', opacity: exit }}>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%" aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="lesson-path" x1="0" x2="1"><stop offset="0" stopColor="#b88955" /><stop offset="1" stopColor="#315440" /></linearGradient>
          <pattern id="lesson-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="#c9b8a2" strokeWidth="0.7" opacity="0.48" /></pattern>
        </defs>
        <rect width={WIDTH} height={HEIGHT} fill="url(#lesson-grid)" />
        <circle cx="155" cy="130" r="86" fill="#f4ede2" stroke="#c5ab8b" strokeWidth="1.5" opacity={appear} />
        <circle cx="845" cy="130" r="86" fill="#244636" stroke="#244636" strokeWidth="1.5" opacity={secondAppear} />
        <line x1="224" y1="130" x2="776" y2="130" stroke="#c7b49e" strokeWidth="4" strokeLinecap="round" />
        <line x1="224" y1="130" x2={traveler} y2="130" stroke="url(#lesson-path)" strokeWidth="5" strokeLinecap="round" />
        {[332, 444, 556, 668].map((x, index) => <circle key={x} cx={x} cy="130" r="5" fill={progress > (index + 1) / 6 ? '#8b6545' : '#d0c0ae'} />)}
        <circle cx={traveler} cy="130" r="12" fill="#a67745" stroke="#f4ede2" strokeWidth="4" opacity={progress > 0 ? 1 : 0} />
        <path d="M 134 129 L 149 144 L 177 113" fill="none" stroke="#9a7049" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" opacity={appear} />
        <path d="M 829 111 L 861 130 L 829 149" fill="none" stroke="#e9dbc6" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" opacity={secondAppear} />
      </svg>
      <div style={{ position: 'absolute', left: 29, bottom: 15, width: 250, color: '#765235', fontSize: 12, fontWeight: 700, letterSpacing: 2.2, textAlign: 'center', opacity: appear }}>WHAT WE LEARNED</div>
      <div style={{ position: 'absolute', right: 14, bottom: 15, width: 280, color: '#315440', fontSize: 12, fontWeight: 700, letterSpacing: 2.2, textAlign: 'center', opacity: secondAppear }}>WHAT WE TEST NEXT</div>
    </AbsoluteFill>
  );
}

export default function LessonMotionPlayer() {
  return (
    <Player
      component={LessonMotion}
      compositionWidth={WIDTH}
      compositionHeight={HEIGHT}
      durationInFrames={DURATION}
      fps={30}
      autoPlay
      loop
      initiallyMuted
      controls={false}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
