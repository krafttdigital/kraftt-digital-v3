import type { Metadata } from 'next';
import { Cormorant_Garamond, Outfit } from 'next/font/google';
import './globals.css';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { JsonLd } from './components/JsonLd';
import { PricingCurrencyProvider } from './components/PricingCurrencyProvider';
import { SiteLoader } from './components/SiteLoader';
import { detectPricingCurrency } from './data/pricing.server';
import { organizationAndWebsiteSchema } from './data/seo';
import { siteUrl } from './data/site';

const cormorant = Cormorant_Garamond({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['300', '400'],
});

const outfit = Outfit({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Kraftt Digital — Digital presence for brands who take themselves seriously',
    template: '%s',
  },
  description:
    'Be discovered. Be trusted. Be chosen. Kraftt Digital builds brand identities, websites, online stores and digital presence for ambitious businesses.',
  manifest: '/favicon/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon/favicon.ico', sizes: 'any' },
      { url: '/favicon/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
    ],
    shortcut: '/favicon/favicon.ico',
    apple: [{ url: '/favicon/apple-touch-icon.png', type: 'image/png', sizes: '180x180' }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
    ...(process.env.BING_SITE_VERIFICATION
      ? { other: { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } }
      : {}),
  },
  openGraph: {
    type: 'website',
    siteName: 'Kraftt Digital',
    title: 'Kraftt Digital — Digital presence for brands who take themselves seriously',
    description: 'Be discovered. Be trusted. Be chosen. Brand, websites, commerce, SEO and social media by Kraftt Digital.',
    url: '/',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Kraftt Digital — Make your business easier to discover, trust and choose.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kraftt Digital — Digital presence for brands who take themselves seriously',
    description: 'Be discovered. Be trusted. Be chosen. Brand, websites, commerce, SEO and social media by Kraftt Digital.',
    images: ['/og.png'],
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const currency = await detectPricingCurrency();

  return (
    <html lang="en">
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18424492469" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-18424492469');
            `,
          }}
        />
      </head>
      <body className={`${cormorant.variable} ${outfit.variable}`}>
        <SiteLoader />
        <PricingCurrencyProvider currency={currency}>
          <JsonLd data={organizationAndWebsiteSchema()} />
          {children}
          <FloatingWhatsApp />
        </PricingCurrencyProvider>
      </body>
    </html>
  );
}
