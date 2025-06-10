import { NextRequest } from 'next/server';
import { createApiHandler } from '@repo/error-handling/api-wrapper';
import { getSearchService } from '@repo/search';
import { env } from '@/env';
import { z } from 'zod';

const SearchQuerySchema = z.object({
  q: z.string().min(1).max(100).optional(),
  categories: z.array(z.string()).optional(),
  brands: z.array(z.string()).optional(),
  conditions: z.array(z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'])).optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  sortBy: z.enum(['relevance', 'price_asc', 'price_desc', 'newest', 'most_viewed', 'most_favorited']).default('relevance'),
  page: z.number().min(0).default(0),
  hitsPerPage: z.number().min(1).max(100).default(20),
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
  console.warn('Failed to initialize search service:', error);
}

export const GET = createApiHandler(
  async (request: NextRequest, { query }) => {
    const {
      q,
      categories,
      brands,
      conditions,
      sizes,
      colors,
      priceMin,
      priceMax,
      sortBy,
      page,
      hitsPerPage,
    } = query;

    // If Algolia is not configured, fallback to database search
    if (!searchService) {
      return {
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
      };
    }

    // Build search filters
    const filters: any = {
      query: q,
      sortBy,
    };

    if (categories?.length) filters.categories = categories;
    if (brands?.length) filters.brands = brands;
    if (conditions?.length) filters.conditions = conditions;
    if (sizes?.length) filters.sizes = sizes;
    if (colors?.length) filters.colors = colors;
    
    if (priceMin !== undefined || priceMax !== undefined) {
      filters.priceRange = {
        min: priceMin || 0,
        max: priceMax || 999999,
      };
    }

    // Perform search
    const startTime = Date.now();
    const searchResult = await searchService.search(filters, page, hitsPerPage);
    const processingTime = Date.now() - startTime;

    return {
      message: 'Search completed successfully',
      source: 'algolia',
      results: {
        ...searchResult,
        processingTimeMS: processingTime,
      },
      algoliaConfigured: true,
      filters: {
        applied: filters,
        available: searchResult.facets || {},
      },
    };
  },
  {
    validation: {
      query: SearchQuerySchema,
    },
    rateLimit: {
      requests: 60,
      window: '1m',
    },
  }
);

// Health check for search service
export const POST = createApiHandler(
  async () => {
    if (!searchService) {
      return {
        status: 'degraded',
        message: 'Search service not configured',
        algoliaConfigured: false,
        fallback: 'database',
      };
    }

    try {
      // Test search with empty query
      await searchService.search({ query: '' }, 0, 1);
      
      return {
        status: 'operational',
        message: 'Search service is healthy',
        algoliaConfigured: true,
        indexName: env.ALGOLIA_INDEX_NAME || 'threadly_products',
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Search service health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        algoliaConfigured: true,
        fallback: 'database',
      };
    }
  },
  {
    rateLimit: {
      requests: 10,
      window: '1m',
    },
  }
);