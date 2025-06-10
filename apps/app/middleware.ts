import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Temporarily disable all middleware to debug
export function middleware(request: NextRequest) {
  // Log the request for debugging
  console.log('Middleware hit:', request.url);
  
  // For now, just pass through all requests
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};