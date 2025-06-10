import { env } from '@/env';
import { auth, currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { showBetaFeature } from '@repo/feature-flags';
import { NotificationsProvider } from '@repo/notifications/components/provider';
import { RealTimeWrapper } from './components/real-time-wrapper';
import { secure } from '@repo/security';
import type { ReactNode } from 'react';
import { PostHogIdentifier } from './components/posthog-identifier';
import { ToastProvider } from '@/components/toast';
import { AppLayout } from './components/app-layout';
import { redirect } from 'next/navigation';

type AppLayoutProperties = {
  readonly children: ReactNode;
};

const AuthenticatedLayout = async ({ children }: AppLayoutProperties) => {
  if (env.ARCJET_KEY) {
    await secure(['CATEGORY:PREVIEW']);
  }

  const user = await currentUser();
  const betaFeature = await showBetaFeature();

  if (!user) {
    redirect('/sign-in');
  }

  // TODO: Initialize CSRF protection for authenticated users
  // Note: CSRF token setup moved to individual forms/actions due to Next.js 15 cookie restrictions
  // await initializeCSRFProtection();

  // Check if user is admin - with error handling
  let isAdmin = false;
  try {
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { role: true }
    });
    isAdmin = dbUser?.role === 'ADMIN';
  } catch (error) {
    console.error('Database user check failed:', error);
    // Continue without admin check - don't break the whole app
  }

  return (
    <RealTimeWrapper userId={user.id}>
      <NotificationsProvider userId={user.id}>
        <AppLayout isAdmin={isAdmin}>
          {betaFeature && (
            <div className="mb-4 rounded-lg bg-blue-500 p-3 text-center text-sm text-white">
              Beta feature now available
            </div>
          )}
          {children}
          <ToastProvider />
        </AppLayout>
        <PostHogIdentifier />
      </NotificationsProvider>
    </RealTimeWrapper>
  );
};

export default AuthenticatedLayout;
