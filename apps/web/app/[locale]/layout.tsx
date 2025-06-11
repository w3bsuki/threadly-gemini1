import './styles.css';
import { DesignSystemProvider, ServiceWorkerRegistration } from '@repo/design-system';
import { fonts } from '@repo/design-system/lib/fonts';
import { cn } from '@repo/design-system/lib/utils';
import { Toolbar } from '@repo/feature-flags/components/toolbar';
import { getDictionary } from '@repo/internationalization';
import { AnalyticsProvider } from '@repo/analytics';
import type { ReactNode } from 'react';
import { Footer } from './components/footer';
import { Header } from './components/header';
import { BottomNavMobile } from './components/bottom-nav-mobile';

type RootLayoutProperties = {
  readonly children: ReactNode;
  readonly params: Promise<{
    locale: string;
  }>;
};

const RootLayout = async ({ children, params }: RootLayoutProperties) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <html
      lang={locale}
      className={cn(fonts, 'scroll-smooth')}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        <AnalyticsProvider>
          <DesignSystemProvider>
            <ServiceWorkerRegistration />
            <Header dictionary={dictionary} />
            {children}
            <Footer />
            <BottomNavMobile cartCount={0} savedCount={0} />
          </DesignSystemProvider>
        </AnalyticsProvider>
        <Toolbar />
      </body>
    </html>
  );
};

export default RootLayout;
