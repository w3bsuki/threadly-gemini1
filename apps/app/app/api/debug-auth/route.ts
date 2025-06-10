import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function GET() {
  try {
    // Get auth state
    const authState = await auth();
    const user = await currentUser();
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      auth: {
        userId: authState.userId || null,
        sessionId: authState.sessionId || null,
        sessionClaims: authState.sessionClaims || null,
      },
      user: user ? {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddresses: user.emailAddresses.map(e => e.emailAddress),
      } : null,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        hasPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        hasSecretKey: !!process.env.CLERK_SECRET_KEY,
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}