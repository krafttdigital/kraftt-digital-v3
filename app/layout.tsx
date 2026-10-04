import type { Metadata } from 'next';
import Script from 'next/script';
import { AnalyticsRuntime } from './components/AnalyticsRuntime';
import { analyticsConfig } from '../lib/analytics/config';
import sitemap from './sitemap';
import { services } from './data/services';
import { SERVICE_MAP } from '../lib/analytics/core';
import { Cormorant_Garamond, Outfit } from 'next/font/google';
import './globals.css';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { JsonLd } from './components/JsonLd';
import { PricingCurrencyProvider } from './components/PricingCurrencyProvider';
import { SiteLoader } from './components/SiteLoader';
import { detectPricingCurrency } from './data/pricing.server';
import { metadataByPath, organizationAndWebsiteSchema } from './data/seo';
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
    default: metadataByPath['/'].title,
    template: '%s',
  },
  description:
    metadataByPath['/'].description,
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
    title: metadataByPath['/'].title,
    description: metadataByPath['/'].description,
    url: '/',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Kraftt Digital — Make your business easier to discover, trust and choose.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: metadataByPath['/'].title,
    description: metadataByPath['/'].description,
    images: ['/og.png'],
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const currency = await detectPricingCurrency();

  return (
    <html lang="en">
      <head>
        {analyticsConfig.gtmId && <Script id="kraftt-gtm" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html:
          `window.dataLayer=window.dataLayer||[];window.dataLayer.push({kraftt_ga_id:'${analyticsConfig.gaId}',kraftt_ads_id:'${analyticsConfig.adsId}'});(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${analyticsConfig.gtmId}');`
        }} />}
        {analyticsConfig.clarityId && <Script id="kraftt-clarity" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html:
          `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,'clarity','script','${analyticsConfig.clarityId}');`
        }} />}
      </head>
      <body className={`${cormorant.variable} ${outfit.variable}`}>
        {analyticsConfig.gtmId && <noscript><iframe src={`https://www.googletagmanager.com/ns.html?id=${analyticsConfig.gtmId}`} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} title="Google Tag Manager" /></noscript>}
        <AnalyticsRuntime services={Object.fromEntries(services.map(service => [service.name, SERVICE_MAP[service.slug]]))} paths={[...sitemap().map(item => new URL(item.url).pathname.replace(/\/$/, '') || '/'), '/offers', '/thank-you']} />
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
