import { NextRequest } from 'next/server';
import { createApiHandler } from '@repo/error-handling/api-wrapper';
import { getSearchService } from '@repo/search';
import { env } from '@/env';
import { z } from 'zod';

const SuggestionsQuerySchema = z.object({
  q: z.string().min(1).max(100),
  limit: z.number().min(1).max(20).default(8),
});

// Initialize search service (only if Algolia is configured)
let searchService: ReturnType<typeof getSearchService> | null = null;

try {
  if (env.NEXT_PUBLIC_ALGOLIA_APP_ID && env.ALGOLIA_ADMIN_API_KEY) {
    searchService = getSearchService({
      appId: env.NEXT_PUBLIC_ALGOLIA_APP_ID,
      apiKey: env.ALGOLIA_ADMIN_API_KEY,
      indexName: env.ALGOLIA_INDEX_NAME || 'threadly_products',
    });
  }
} catch (error) {
  console.warn('Failed to initialize search service for suggestions:', error);
}

export const GET = createApiHandler(
  async (request: NextRequest, { query }) => {
    const { q, limit } = query;

    // If Algolia is not configured, return empty suggestions
    if (!searchService) {
      return {
        query: q,
        suggestions: [],
        autocomplete: [],
        source: 'fallback',
        configured: false,
      };
    }

    try {
      // Get search suggestions and autocomplete in parallel
      const [suggestions, autocomplete] = await Promise.all([
        searchService.getSearchSuggestions(q, limit),
        searchService.getAutoComplete(q, limit),
      ]);

      return {
        query: q,
        suggestions: suggestions || [],
        autocomplete: autocomplete || [],
        source: 'algolia',
        configured: true,
      };
    } catch (error) {
      console.error('Search suggestions failed:', error);
      
      return {
        query: q,
        suggestions: [],
        autocomplete: [],
        source: 'error',
        configured: true,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
  {
    validation: {
      query: SuggestionsQuerySchema,
    },
    rateLimit: {
      requests: 120, // Higher limit for autocomplete
      window: '1m',
    },
  }
);