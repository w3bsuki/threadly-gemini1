import { authMiddleware } from '@repo/auth/middleware';
import {
  noseconeMiddleware,
  noseconeOptions,
  noseconeOptionsWithToolbar,
} from '@repo/security/middleware';
import { createRouteMatcher } from '@clerk/nextjs/server';
import type { NextMiddleware } from 'next/server';
import { env } from './env';

const securityHeaders = env.FLAGS_SECRET
  ? noseconeMiddleware(noseconeOptionsWithToolbar)
  : noseconeMiddleware(noseconeOptions);

// Define public routes using the new Clerk API
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/browse(.*)',
  '/product(.*)',
  '/api/webhooks(.*)',
]);

export default authMiddleware((auth, req) => {
  // Apply security headers first
  const securityResponse = securityHeaders();
  
  // Allow public routes
  if (isPublicRoute(req)) {
    return securityResponse;
  }

  // If user is not signed in and trying to access a protected route
  if (!auth().userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  return securityResponse;
}) as unknown as NextMiddleware;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
