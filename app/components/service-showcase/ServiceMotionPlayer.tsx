'use client';

import type { Ref } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { artworkHeight, artworkWidth, framesPerChapter } from './motion';

function Artwork({ images }: { images: string[] }) {
  const frame = useCurrentFrame();
  const position = frame / framesPerChapter;
  const current = Math.min(images.length - 1, Math.floor(position));
  const next = Math.min(images.length - 1, current + 1);
  const mix = current === next ? 0 : interpolate(position - current, [0.34, 0.66], [0, 1], {
    easing: Easing.inOut(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return <AbsoluteFill style={{ background: '#20382e' }}>
    {images.map((src, index) => {
      const visible = index === current || index === next;
      const opacity = index === current ? 1 : index === next ? mix : 0;
      return <Img key={src} src={src} alt="" style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        opacity, visibility: visible ? 'visible' : 'hidden',
        transform: `scale(${index === next ? 1 + (1 - mix) * 0.04 : 1 + mix * 0.02})`,
      }} />;
    })}
  </AbsoluteFill>;
}

export default function ServiceMotionPlayer({ images, playerRef }: { images: string[]; playerRef: Ref<PlayerRef> }) {
  return <Player ref={playerRef}
    component={Artwork}
    inputProps={{ images }}
    durationInFrames={(images.length - 1) * framesPerChapter + 1}
    compositionWidth={artworkWidth}
    compositionHeight={artworkHeight}
    fps={30}
    controls={false}
    allowFullscreen={false}
    clickToPlay={false}
    spaceKeyToPlayOrPause={false}
    numberOfSharedAudioTags={0}
    style={{ width: '100%', height: '100%' }}
    errorFallback={() => null}
  />;
}
