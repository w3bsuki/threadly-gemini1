import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { z } from 'zod';

/**
 * Critical path validation tests
 * These tests ensure our refactored code maintains functionality
 */

// Test environment validation
describe('Environment Configuration', () => {
  it('should load required environment variables', () => {
    // Core environment variables
    expect(process.env.NODE_ENV).toBeDefined();
    expect(['development', 'test', 'production']).toContain(process.env.NODE_ENV);
  });

  it('should validate environment with zod schemas', () => {
    const envSchema = z.object({
      NODE_ENV: z.enum(['development', 'test', 'production']),
      DATABASE_URL: z.string().url().optional(),
    });

    const result = envSchema.safeParse(process.env);
    expect(result.success).toBe(true);
  });
});

// Test package independence
describe('Package Independence', () => {
  it('should not import database from auth package', async () => {
    const authPackage = await import('@repo/auth/types');
    expect(authPackage).toBeDefined();
    // Ensure no database imports in exports
    const exports = Object.keys(authPackage);
    expect(exports).not.toContain('database');
  });

  it('should export repository interfaces', async () => {
    const authTypes = await import('@repo/auth/types');
    expect(authTypes.UserRepository).toBeDefined();
    expect(typeof authTypes.UserRepository).toBe('object');
  });

  it('should export factory functions for services', async () => {
    const { createEmailService } = await import('@repo/notifications');
    expect(typeof createEmailService).toBe('function');
  });
});

// Test error handling
describe('Error Handling', () => {
  it('should export AppError class', async () => {
    const { AppError } = await import('@repo/error-handling/error-handler');
    const error = new AppError('Test error', 400, 'BAD_REQUEST');
    expect(error).toBeInstanceOf(Error);
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('BAD_REQUEST');
  });

  it('should handle API errors correctly', async () => {
    const { handleApiError, AppError } = await import('@repo/error-handling/error-handler');
    
    // Create mock request
    const mockRequest = {
      url: 'http://localhost/api/test',
      method: 'GET',
      headers: new Map([['content-type', 'application/json']]),
    } as any;

    const error = new AppError('Test error', 404, 'NOT_FOUND');
    const response = await handleApiError(error, mockRequest);
    
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error.code).toBe('NOT_FOUND');
  });
});

// Test caching functionality
describe('Cache Service', () => {
  it('should export cache service functions', async () => {
    const cache = await import('@repo/cache');
    expect(cache.getCacheService).toBeDefined();
    expect(cache.CACHE_KEYS).toBeDefined();
    expect(cache.CACHE_TTL).toBeDefined();
  });

  it('should create cache keys correctly', async () => {
    const { CACHE_KEYS } = await import('@repo/cache');
    
    expect(CACHE_KEYS.PRODUCT('123')).toBe('product:123');
    expect(CACHE_KEYS.USER_PROFILE('user123')).toBe('user:user123:profile');
    expect(CACHE_KEYS.CATEGORY_PRODUCTS('fashion')).toBe('category:fashion:products');
  });

  it('should have proper TTL values', async () => {
    const { CACHE_TTL } = await import('@repo/cache');
    
    expect(CACHE_TTL.SHORT).toBe(5 * 60); // 5 minutes
    expect(CACHE_TTL.MEDIUM).toBe(30 * 60); // 30 minutes
    expect(CACHE_TTL.LONG).toBe(2 * 60 * 60); // 2 hours
  });
});

// Test validation schemas
describe('Validation Schemas', () => {
  it('should validate product schema', async () => {
    const { productSchema } = await import('@repo/validation/schemas/product');
    
    const validProduct = {
      title: 'Test Product',
      description: 'A test product',
      price: 99.99,
      categoryId: 'cat123',
      condition: 'NEW',
      images: ['https://example.com/image.jpg'],
    };

    const result = productSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it('should reject invalid product data', async () => {
    const { productSchema } = await import('@repo/validation/schemas/product');
    
    const invalidProduct = {
      title: '', // Empty title
      price: -10, // Negative price
      condition: 'INVALID', // Invalid enum
    };

    const result = productSchema.safeParse(invalidProduct);
    expect(result.success).toBe(false);
  });
});

// Test API wrapper functionality
describe('API Wrapper', () => {
  it('should create API handlers with validation', async () => {
    const { createApiHandler } = await import('@repo/error-handling/api-wrapper');
    const { z } = await import('zod');

    const handler = createApiHandler(
      async (request, { body }) => {
        return { success: true, data: body };
      },
      {
        validation: {
          body: z.object({
            name: z.string().min(1),
            email: z.string().email(),
          }),
        },
      }
    );

    expect(typeof handler).toBe('function');
  });

  it('should handle rate limiting configuration', async () => {
    const { createRateLimiter } = await import('@repo/error-handling/rate-limiter');
    
    const limiter = createRateLimiter({
      requests: 10,
      window: '1m',
    });

    expect(limiter).toBeDefined();
    expect(typeof limiter.check).toBe('function');
  });
});

// Test Next.js configuration
describe('Next.js Configuration', () => {
  it('should export performance configuration', async () => {
    const { performanceConfig, withPerformance } = await import('@repo/next-config/optimized');
    
    expect(performanceConfig).toBeDefined();
    expect(performanceConfig.experimental).toBeDefined();
    expect(performanceConfig.experimental.optimizePackageImports).toBeInstanceOf(Array);
  });

  it('should merge configurations correctly', async () => {
    const { withPerformance } = await import('@repo/next-config/optimized');
    
    const baseConfig = {
      images: {
        domains: ['example.com'],
      },
    };

    const merged = withPerformance(baseConfig as any);
    expect(merged.images.formats).toContain('image/avif');
    expect(merged.experimental.optimizePackageImports).toBeDefined();
  });
});

// Integration test for repository pattern
describe('Repository Pattern', () => {
  it('should create services with repository injection', async () => {
    const { createEmailService } = await import('@repo/notifications');
    
    // Mock repository
    const mockUserRepo = {
      findById: async (id: string) => ({
        id,
        email: 'test@example.com',
        firstName: 'Test',
        notificationPreferences: {},
      }),
      findManyByIds: async (ids: string[]) => [],
    };

    const emailService = createEmailService(
      {
        apiKey: 'test-key',
        environment: 'test',
        enableDelivery: false,
      },
      mockUserRepo
    );

    expect(emailService).toBeDefined();
    expect(typeof emailService.sendOrderConfirmation).toBe('function');
  });
});

// Performance validation
describe('Performance Optimizations', () => {
  it('should have tree-shaking friendly exports', async () => {
    // Test individual component imports
    const { Button } = await import('@repo/design-system/components/ui/button');
    expect(Button).toBeDefined();
    
    // Should not load entire library
    const buttonModule = await import('@repo/design-system/components/ui/button');
    const exports = Object.keys(buttonModule);
    expect(exports.length).toBeLessThan(10); // Should only export Button related items
  });
});