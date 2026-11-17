import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Document Workspace | Kraftt Digital',
  description: 'Kraftt Digital document workspace.',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true, nosnippet: true } },
};

export default function AdminPage() { redirect('https://admin.krafttdigital.in/admin'); }
