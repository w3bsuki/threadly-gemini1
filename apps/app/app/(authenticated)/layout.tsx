import { env } from '@/env';
import { auth, currentUser } from '@repo/auth/server';
import { SidebarProvider } from '@repo/design-system/components/ui/sidebar';
import { showBetaFeature } from '@repo/feature-flags';
import { NotificationsProvider } from '@repo/notifications/components/provider';
import { RealTimeWrapper } from './components/real-time-wrapper';
import { secure, initializeCSRFProtection } from '@repo/security';
import type { ReactNode } from 'react';
import { PostHogIdentifier } from './components/posthog-identifier';
import { GlobalSidebar } from './components/sidebar';

type AppLayoutProperties = {
  readonly children: ReactNode;
};

const AppLayout = async ({ children }: AppLayoutProperties) => {
  if (env.ARCJET_KEY) {
    await secure(['CATEGORY:PREVIEW']);
  }

  const user = await currentUser();
  const { redirectToSignIn } = await auth();
  const betaFeature = await showBetaFeature();

  if (!user) {
    return redirectToSignIn();
  }

  // Initialize CSRF protection for authenticated users
  await initializeCSRFProtection();

  return (
    <RealTimeWrapper userId={user.id}>
      <NotificationsProvider userId={user.id}>
        <SidebarProvider>
          <GlobalSidebar>
            {betaFeature && (
              <div className="m-4 rounded-full bg-blue-500 p-1.5 text-center text-sm text-white">
                Beta feature now available
              </div>
            )}
            {children}
          </GlobalSidebar>
          <PostHogIdentifier />
        </SidebarProvider>
      </NotificationsProvider>
    </RealTimeWrapper>
  );
};

export default AppLayout;
