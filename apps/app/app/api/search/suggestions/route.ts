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
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const suggestions = await searchService.getSearchSuggestions(query, limit);
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('[Search Suggestions API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get suggestions' },
      { status: 500 }
    );
  }
}