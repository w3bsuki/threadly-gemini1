import { authMiddleware } from '@repo/auth/middleware';
import {
  noseconeMiddleware,
  noseconeOptions,
  noseconeOptionsWithToolbar,
} from '@repo/security/middleware';
import type { NextMiddleware } from 'next/server';
import { env } from './env';

const securityHeaders = env.FLAGS_SECRET
  ? noseconeMiddleware(noseconeOptionsWithToolbar)
  : noseconeMiddleware(noseconeOptions);

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/browse(.*)',
    '/product(.*)',
    '/api/webhooks(.*)',
  ],
  // Routes that should redirect to sign-in if not authenticated
  afterAuth: (auth, req) => {
    // Allow public routes
    if (auth.isPublicRoute) {
      return;
    }

    // If user is not signed in and trying to access a protected route
    if (!auth.userId) {
      return new Response('Unauthorized', { status: 401 });
    }
  },
  // Apply security headers
  beforeAuth: () => securityHeaders(),
}) as unknown as NextMiddleware;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
