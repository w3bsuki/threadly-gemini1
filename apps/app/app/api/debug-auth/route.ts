import { NextResponse } from 'next/server';
import { auth, currentUser } from '@repo/auth/server';

export async function GET() {
  // SECURITY: Only allow in development mode
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Endpoint disabled in production' },
      { status: 404 }
    );
  }

  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    // SECURITY: Limited information exposure, no sensitive env vars
    return NextResponse.json({
      success: true,
      auth: {
        isAuthenticated: !!userId,
        hasUserProfile: !!user,
        userRole: user?.publicMetadata?.role || 'user',
      },
      config: {
        environment: process.env.NODE_ENV,
        authConfigured: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // SECURITY: Generic error messages only
    return NextResponse.json({
      success: false,
      error: 'Authentication check failed',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}