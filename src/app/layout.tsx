import type { Metadata, Viewport } from 'next';
import './globals.css';
import Toast from '@/components/ui/Toast';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: 'LOCARA — Local Marketplace & Heritage Shops Discovery',
  description: 'Discover local shops, products and services near you in Meerut. Browse, reserve for pickup, and support local heritage stores.',
  keywords: 'local shops, heritage marketplace, Meerut, handicrafts, fashion, jewellery, local store pickup',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://locara.app',
    siteName: 'Locara',
    title: 'LOCARA — Local Marketplace & Heritage Shops Discovery',
    description: 'Discover local shops and products near you.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#FAFAF8',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.dicebear.com" />
      </head>
      <body suppressHydrationWarning className="bg-[#FAFAF8] text-[#171717] antialiased min-h-screen">
        {children}
        <Toast />
      </body>
    </html>
  );
}
