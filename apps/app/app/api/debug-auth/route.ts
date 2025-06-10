import { NextResponse } from 'next/server';
import { auth, currentUser } from '@repo/auth/server';

export async function GET() {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    return NextResponse.json({
      success: true,
      auth: {
        userId: userId || null,
        hasUser: !!user,
        userEmail: user?.emailAddresses?.[0]?.emailAddress || null,
        firstName: user?.firstName || null,
      },
      env: {
        hasPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        hasSecretKey: !!process.env.CLERK_SECRET_KEY,
        nodeEnv: process.env.NODE_ENV,
        signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Auth check failed',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}