import { AnalyticsProvider } from '@repo/analytics';
import { AuthProvider } from '@repo/auth/provider';
import type { ThemeProviderProps } from 'next-themes';
import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { ThemeProvider } from './providers/theme';

type DesignSystemProviderProperties = ThemeProviderProps & {
  privacyUrl?: string;
  termsUrl?: string;
  helpUrl?: string;
};

export const DesignSystemProvider = ({
  children,
  privacyUrl,
  termsUrl,
  helpUrl,
  ...properties
}: DesignSystemProviderProperties) => (
  <ThemeProvider {...properties}>
    <AuthProvider privacyUrl={privacyUrl} termsUrl={termsUrl} helpUrl={helpUrl}>
      <AnalyticsProvider>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
      </AnalyticsProvider>
    </AuthProvider>
  </ThemeProvider>
);

// Export additional components
export { ServiceWorkerRegistration, useServiceWorker } from './components/ui/service-worker-registration';
export { LazyImage, ProductImage, AvatarImage } from './components/ui/lazy-image';
export { useLazyLoadImages, useImageLoadingState, useVirtualImageList } from './hooks/use-lazy-load-images';
export { Animated, StaggerContainer, PageTransition, HoverCard } from './components/ui/animated';
export { animations, animationDelays, staggerAnimation, hoverAnimations, loadingAnimations } from './lib/animations';
