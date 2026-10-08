'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/** Public chrome and third-party scripts must not run in the document editor. */
export function PublicRouteOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return /^\/admin(?:\/|$)/.test(pathname || '') ? null : children;
}
