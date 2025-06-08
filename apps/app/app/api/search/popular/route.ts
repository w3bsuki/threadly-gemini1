import { NextRequest, NextResponse } from 'next/server';
import { getSearchService } from '@repo/search';

const searchService = getSearchService({
  appId: process.env.ALGOLIA_APP_ID!,
  apiKey: process.env.ALGOLIA_ADMIN_API_KEY!,
  searchOnlyApiKey: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!,
  indexName: process.env.ALGOLIA_INDEX_NAME!,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const products = await searchService.getPopularProducts(limit);
    return NextResponse.json(products);
  } catch (error) {
    console.error('[Search Popular API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get popular products' },
      { status: 500 }
    );
  }
}