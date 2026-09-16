import type { Metadata, Viewport } from 'next';
import './globals.css';
import ThemeSync from '@/components/ui/ThemeSync';
import LanguageSync from '@/components/ui/LanguageSync';
import NoiseOverlay from '@/components/ui/NoiseOverlay';
import CustomCursor from '@/components/ui/CustomCursor';
import SmoothScroll from '@/components/ui/SmoothScroll';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: 'Locara — Heritage Shop Discovery & Cultural Commerce',
  description: 'Discover the most iconic heritage shops, artisanal crafts, and timeless local treasures.',
  keywords: 'heritage shops, traditional craftsmanship, local markets, artisanal products, Meerut, Delhi',
  authors: [{ name: 'Locara Studio' }],
  creator: 'Locara',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://locara.app',
    siteName: 'Locara',
    title: 'Locara — Heritage Shop Discovery',
    description: 'Discover the most iconic heritage shops and traditional treasures.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#09090B',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
        
        {/* Preconnect to external assets */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.dicebear.com" />
      </head>
      <body suppressHydrationWarning className="bg-bg text-fg antialiased min-h-screen">
        <ThemeSync />
        <LanguageSync />
        <NoiseOverlay />
        <CustomCursor />
        <SmoothScroll>
          {children}
        </SmoothScroll>

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js').catch(() => {});
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
