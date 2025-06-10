import { NextRequest } from 'next/server';
import { createApiHandler } from '@repo/error-handling/api-wrapper';
import { getSearchService } from '@repo/search';
import { env } from '@/env';
import { z } from 'zod';

// Webhook payload schema
const ProductWebhookSchema = z.object({
  action: z.enum(['created', 'updated', 'deleted']),
  productId: z.string(),
  timestamp: z.string().datetime(),
});

const BulkIndexSchema = z.object({
  action: z.literal('bulk_index'),
  force: z.boolean().optional(),
});

// Initialize search service with environment config
const searchService = getSearchService({
  appId: env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
  apiKey: env.ALGOLIA_ADMIN_API_KEY || '',
  indexName: env.ALGOLIA_INDEX_NAME || 'threadly_products',
});

export const POST = createApiHandler(
  async (request: NextRequest, { body }) => {
    const { action, productId, force } = body;

    switch (action) {
      case 'created':
      case 'updated':
        // Index single product
        await searchService.indexProduct(productId);
        return {
          success: true,
          message: `Product ${productId} indexed successfully`,
          timestamp: new Date().toISOString(),
        };

      case 'deleted':
        // Remove product from index
        await searchService.removeProduct(productId);
        return {
          success: true,
          message: `Product ${productId} removed from index`,
          timestamp: new Date().toISOString(),
        };

      case 'bulk_index':
        // Re-index all products (admin operation)
        if (force) {
          await searchService.reindexProducts();
        } else {
          await searchService.indexAllProducts();
        }
        return {
          success: true,
          message: 'Bulk indexing completed',
          timestamp: new Date().toISOString(),
        };

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  },
  {
    validation: {
      body: z.union([ProductWebhookSchema, BulkIndexSchema]),
    },
    rateLimit: {
      requests: 100,
      window: '1m',
    },
    auth: {
      required: false, // Will validate with webhook secret
    },
  }
);

export const GET = createApiHandler(
  async () => {
    // Health check endpoint
    return {
      service: 'Algolia Search Indexing',
      status: 'operational',
      timestamp: new Date().toISOString(),
      algolia: {
        configured: !!(env.NEXT_PUBLIC_ALGOLIA_APP_ID && env.ALGOLIA_ADMIN_API_KEY),
        indexName: env.ALGOLIA_INDEX_NAME || 'threadly_products',
      },
    };
  },
  {
    rateLimit: {
      requests: 10,
      window: '1m',
    },
  }
);