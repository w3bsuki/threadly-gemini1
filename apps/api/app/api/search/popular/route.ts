import { NextRequest, NextResponse } from 'next/server';

// Simple stub implementation - search functionality will be implemented later
export async function GET(request: NextRequest) {
  return NextResponse.json({
    products: [],
    category: 'all',
    source: 'stub',
    configured: false,
    message: 'Popular products endpoint not yet implemented',
    timestamp: new Date().toISOString(),
  });
}