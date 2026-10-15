/* eslint-disable @next/next/no-img-element -- Standalone build; audit images are local data URLs. */
import type { ImgHTMLAttributes } from 'react';

// The shared audit editor only uses unoptimized data-URL images. Keep the Next
// implementation on the public deployment and use a native image in this build.
type Props = ImgHTMLAttributes<HTMLImageElement> & { unoptimized?: boolean };
export default function Image(props: Props) {
  const attributes = { ...props };
  delete attributes.unoptimized;
  return <img {...attributes} alt={props.alt || ''} />;
}
