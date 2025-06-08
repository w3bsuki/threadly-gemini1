import { createRouteHandler } from "uploadthing/next";
import { uploadRateLimit, checkRateLimit } from '@repo/security';
import { NextRequest, NextResponse } from 'next/server';

import { ourFileRouter } from "./core";

// Create the uploadthing route handler
const uploadthingHandler = createRouteHandler({
  router: ourFileRouter,
});

// Wrap the handlers with rate limiting
export async function GET(request: NextRequest) {
  // GET requests typically don't need rate limiting for uploadthing
  return uploadthingHandler.GET(request);
}

export async function POST(request: NextRequest) {
  // Check rate limit for uploads
  const rateLimitResult = await checkRateLimit(uploadRateLimit, request);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: rateLimitResult.error?.message || 'Rate limit exceeded' },
      { 
        status: 429,
        headers: rateLimitResult.headers,
      }
    );
  }

  return uploadthingHandler.POST(request);
}