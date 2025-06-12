import { NextRequest, NextResponse } from 'next/server';

// Simple stub implementation - search functionality will be implemented later
export async function GET(request: NextRequest) {
  return NextResponse.json({
    suggestions: [],
    source: 'stub',
    message: 'Search suggestions endpoint not yet implemented',
    timestamp: new Date().toISOString(),
  });
}