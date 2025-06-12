import { NextRequest, NextResponse } from 'next/server';

// Simple stub implementation - search functionality will be implemented later
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Search service not configured - using database fallback',
    source: 'database',
    results: {
      hits: [],
      totalHits: 0,
      page: 0,
      totalPages: 0,
      processingTimeMS: 0,
    },
    algoliaConfigured: false,
    timestamp: new Date().toISOString(),
  });
}

// Health check for search service
export async function POST(request: NextRequest) {
  return NextResponse.json({
    status: 'not_implemented',
    message: 'Search service not yet configured',
    algoliaConfigured: false,
    fallback: 'database',
    timestamp: new Date().toISOString(),
  });
}