import { NextRequest, NextResponse } from 'next/server';

// Simple stub implementation - search functionality will be implemented later
export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'Search indexing not yet implemented',
    message: 'This endpoint is a placeholder',
    timestamp: new Date().toISOString(),
  });
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    service: 'Search Indexing',
    status: 'not_implemented',
    timestamp: new Date().toISOString(),
    message: 'Search functionality will be implemented later'
  });
}