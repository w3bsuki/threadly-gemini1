import { env } from '@/env';
import { auth, currentUser } from '@repo/auth/server';
// import { database } from '@repo/database'; // Temporarily disabled
// import { showBetaFeature } from '@repo/feature-flags'; // Temporarily disabled  
// import { NotificationsProvider } from '@repo/notifications/components/provider'; // Temporarily disabled
// import { RealTimeWrapper } from './components/real-time-wrapper'; // Temporarily disabled
// import { secure } from '@repo/security'; // Temporarily disabled
import type { ReactNode } from 'react';
// import { PostHogIdentifier } from './components/posthog-identifier'; // Temporarily disabled
import { ToastProvider } from '@/components/toast';
import { AppLayout } from './components/app-layout';
import { redirect } from 'next/navigation';

type AppLayoutProperties = {
  readonly children: ReactNode;
};

const AuthenticatedLayout = async ({ children }: AppLayoutProperties) => {
  // TEMPORARILY DISABLE ALL EXTERNAL CALLS FOR DEBUGGING
  // if (env.ARCJET_KEY) {
  //   await secure(['CATEGORY:PREVIEW']);
  // }

  const user = await currentUser();
  // const betaFeature = await showBetaFeature();
  const betaFeature = false; // Hardcode for debugging

  if (!user) {
    redirect('/sign-in');
  }

  // TODO: Initialize CSRF protection for authenticated users
  // Note: CSRF token setup moved to individual forms/actions due to Next.js 15 cookie restrictions
  // await initializeCSRFProtection();

  // Check if user is admin - with error handling (temporarily disabled for debugging)
  let isAdmin = false;
  // TODO: Re-enable admin check after fixing database connection
  // try {
  //   const dbUser = await database.user.findUnique({
  //     where: { clerkId: user.id },
  //     select: { role: true }
  //   });
  //   isAdmin = dbUser?.role === 'ADMIN';
  // } catch (error) {
  //   console.error('Database user check failed:', error);
  //   // Continue without admin check - don't break the whole app
  // }

  return (
    <AppLayout isAdmin={isAdmin}>
      {betaFeature && (
        <div className="mb-4 rounded-lg bg-blue-500 p-3 text-center text-sm text-white">
          Beta feature now available
        </div>
      )}
      {children}
      <ToastProvider />
    </AppLayout>
  );
};

export default AuthenticatedLayout;
