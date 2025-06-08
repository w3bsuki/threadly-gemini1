import {
  noseconeMiddleware,
  noseconeOptions,
  noseconeOptionsWithToolbar,
} from '@repo/security/middleware';
import { csrfMiddleware } from '@repo/security';
import type { NextMiddleware, NextRequest, NextResponse } from 'next/server';
import { env } from './env';

const securityHeaders = env.FLAGS_SECRET
  ? noseconeMiddleware(noseconeOptionsWithToolbar)
  : noseconeMiddleware(noseconeOptions);

export const middleware: NextMiddleware = async (req: NextRequest) => {
  // Apply security headers first
  const securityResponse = securityHeaders();
  
  // Check CSRF for API routes (excluding webhooks and health checks)
  if (req.nextUrl.pathname.startsWith('/api/') || 
      req.nextUrl.pathname.startsWith('/')) {
    const csrfResponse = await csrfMiddleware(req);
    if (csrfResponse) {
      return csrfResponse;
    }
  }
  
  return securityResponse || NextResponse.next();
};

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|webhooks|cron)(.*)',
  ],
};