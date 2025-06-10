import { createApiHandler } from '@repo/error-handling/api-wrapper';
import { getSearchService } from '@repo/search';
import { env } from '@/env';
import { z } from 'zod';

const PopularQuerySchema = z.object({
  limit: z.number().min(1).max(50).default(10),
  category: z.string().optional(),
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
  console.warn('Failed to initialize search service for popular products:', error);
}

export const GET = createApiHandler(
  async (request, { query }) => {
    const { limit, category } = query;

    // If Algolia is not configured, return empty results
    if (!searchService) {
      return {
        products: [],
        category: category || 'all',
        source: 'fallback',
        configured: false,
        message: 'Search service not configured',
      };
    }

    try {
      let products;
      
      if (category) {
        // Get popular products for specific category
        products = await searchService.getProductsByCategory(category, limit);
      } else {
        // Get popular products overall
        products = await searchService.getPopularProducts(limit);
      }

      return {
        products: products || [],
        category: category || 'all',
        source: 'algolia',
        configured: true,
        count: products?.length || 0,
      };
    } catch (error) {
      console.error('Failed to get popular products:', error);
      
      return {
        products: [],
        category: category || 'all',
        source: 'error',
        configured: true,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
  {
    validation: {
      query: PopularQuerySchema,
    },
    rateLimit: {
      requests: 30,
      window: '1m',
    },
  }
);