import { getRedisCache } from './redis-cache';
import { getMemoryCache } from './memory-cache';
import { CACHE_KEYS, CACHE_TTL, CACHE_TAGS, type CacheConfig } from './types';

export class MarketplaceCacheService {
  private cache: any;
  private useMemoryCache: boolean = false;

  constructor(config?: CacheConfig) {
    try {
      if (config?.url && config?.token) {
        this.cache = getRedisCache(config);
      } else {
        throw new Error('Redis config missing');
      }
    } catch (error) {
      // Fallback to memory cache
      this.cache = getMemoryCache();
      this.useMemoryCache = true;
    }
  }

  // Product caching
  async cacheProduct(product: any): Promise<void> {
    await this.cache.set(
      CACHE_KEYS.PRODUCT(product.id),
      product,
      {
        ttl: CACHE_TTL.LONG,
        tags: [CACHE_TAGS.PRODUCTS],
      }
    );
  }

  async getProduct(productId: string): Promise<any | null> {
    return this.cache.get(CACHE_KEYS.PRODUCT(productId));
  }

  async cacheProductsByCategory(category: string, products: any[]): Promise<void> {
    await this.cache.set(
      CACHE_KEYS.CATEGORY_PRODUCTS(category),
      products,
      {
        ttl: CACHE_TTL.MEDIUM,
        tags: [CACHE_TAGS.PRODUCTS, CACHE_TAGS.CATEGORIES],
      }
    );
  }

  async getProductsByCategory(category: string): Promise<any[] | null> {
    return this.cache.get(CACHE_KEYS.CATEGORY_PRODUCTS(category));
  }

  // Search results caching
  async cacheSearchResults(query: string, results: any): Promise<void> {
    await this.cache.set(
      CACHE_KEYS.SEARCH_RESULTS(query),
      results,
      {
        ttl: CACHE_TTL.SHORT,
        tags: [CACHE_TAGS.SEARCH, CACHE_TAGS.PRODUCTS],
      }
    );
  }

  async getSearchResults(query: string): Promise<any | null> {
    return this.cache.get(CACHE_KEYS.SEARCH_RESULTS(query));
  }

  // User profile caching
  async cacheUserProfile(userId: string, profile: any): Promise<void> {
    await this.cache.set(
      CACHE_KEYS.USER_PROFILE(userId),
      profile,
      {
        ttl: CACHE_TTL.LONG,
        tags: [CACHE_TAGS.USERS],
      }
    );
  }

  async getUserProfile(userId: string): Promise<any | null> {
    return this.cache.get(CACHE_KEYS.USER_PROFILE(userId));
  }

  // User favorites caching
  async cacheUserFavorites(userId: string, favorites: any[]): Promise<void> {
    await this.cache.set(
      CACHE_KEYS.USER_FAVORITES(userId),
      favorites,
      {
        ttl: CACHE_TTL.MEDIUM,
        tags: [CACHE_TAGS.USERS],
      }
    );
  }

  async getUserFavorites(userId: string): Promise<any[] | null> {
    return this.cache.get(CACHE_KEYS.USER_FAVORITES(userId));
  }

  // Homepage data caching
  async cacheHomepageData(data: any): Promise<void> {
    await this.cache.set(
      CACHE_KEYS.HOMEPAGE_DATA,
      data,
      {
        ttl: CACHE_TTL.MEDIUM,
        tags: [CACHE_TAGS.PRODUCTS],
      }
    );
  }

  async getHomepageData(): Promise<any | null> {
    return this.cache.get(CACHE_KEYS.HOMEPAGE_DATA);
  }

  // Trending products
  async cacheTrendingProducts(products: any[]): Promise<void> {
    await this.cache.set(
      CACHE_KEYS.TRENDING_PRODUCTS,
      products,
      {
        ttl: CACHE_TTL.LONG,
        tags: [CACHE_TAGS.PRODUCTS],
      }
    );
  }

  async getTrendingProducts(): Promise<any[] | null> {
    return this.cache.get(CACHE_KEYS.TRENDING_PRODUCTS);
  }

  // Featured categories
  async cacheFeaturedCategories(categories: any[]): Promise<void> {
    await this.cache.set(
      CACHE_KEYS.FEATURED_CATEGORIES,
      categories,
      {
        ttl: CACHE_TTL.VERY_LONG,
        tags: [CACHE_TAGS.CATEGORIES],
      }
    );
  }

  async getFeaturedCategories(): Promise<any[] | null> {
    return this.cache.get(CACHE_KEYS.FEATURED_CATEGORIES);
  }

  // New arrivals
  async cacheNewArrivals(products: any[]): Promise<void> {
    await this.cache.set(
      CACHE_KEYS.NEW_ARRIVALS,
      products,
      {
        ttl: CACHE_TTL.MEDIUM,
        tags: [CACHE_TAGS.PRODUCTS],
      }
    );
  }

  async getNewArrivals(): Promise<any[] | null> {
    return this.cache.get(CACHE_KEYS.NEW_ARRIVALS);
  }

  // Conversations caching
  async cacheConversation(conversationId: string, conversation: any): Promise<void> {
    await this.cache.set(
      CACHE_KEYS.CONVERSATION(conversationId),
      conversation,
      {
        ttl: CACHE_TTL.SHORT,
        tags: [CACHE_TAGS.CONVERSATIONS],
      }
    );
  }

  async getConversation(conversationId: string): Promise<any | null> {
    return this.cache.get(CACHE_KEYS.CONVERSATION(conversationId));
  }

  async cacheUserConversations(userId: string, conversations: any[]): Promise<void> {
    await this.cache.set(
      CACHE_KEYS.USER_CONVERSATIONS(userId),
      conversations,
      {
        ttl: CACHE_TTL.SHORT,
        tags: [CACHE_TAGS.CONVERSATIONS],
      }
    );
  }

  async getUserConversations(userId: string): Promise<any[] | null> {
    return this.cache.get(CACHE_KEYS.USER_CONVERSATIONS(userId));
  }

  // Notifications caching
  async cacheUserNotifications(userId: string, notifications: any[]): Promise<void> {
    await this.cache.set(
      CACHE_KEYS.NOTIFICATIONS(userId),
      notifications,
      {
        ttl: CACHE_TTL.SHORT,
        tags: [CACHE_TAGS.NOTIFICATIONS],
      }
    );
  }

  async getUserNotifications(userId: string): Promise<any[] | null> {
    return this.cache.get(CACHE_KEYS.NOTIFICATIONS(userId));
  }

  // Cache invalidation methods
  async invalidateProduct(productId: string): Promise<void> {
    await Promise.all([
      this.cache.del(CACHE_KEYS.PRODUCT(productId)),
      this.cache.invalidateByTag(CACHE_TAGS.PRODUCTS),
    ]);
  }

  async invalidateUser(userId: string): Promise<void> {
    await Promise.all([
      this.cache.del(CACHE_KEYS.USER_PROFILE(userId)),
      this.cache.del(CACHE_KEYS.USER_FAVORITES(userId)),
      this.cache.del(CACHE_KEYS.USER_CONVERSATIONS(userId)),
      this.cache.del(CACHE_KEYS.NOTIFICATIONS(userId)),
      this.cache.invalidateByTag(CACHE_TAGS.USERS),
    ]);
  }

  async invalidateAllProducts(): Promise<void> {
    await this.cache.invalidateByTag(CACHE_TAGS.PRODUCTS);
  }

  async invalidateSearchResults(): Promise<void> {
    await this.cache.invalidateByTag(CACHE_TAGS.SEARCH);
  }

  async invalidateConversations(): Promise<void> {
    await this.cache.invalidateByTag(CACHE_TAGS.CONVERSATIONS);
  }

  // Warm cache methods for critical data
  async warmProductCache(products: any[]): Promise<void> {
    const cacheOperations = products.map(product => ({
      key: CACHE_KEYS.PRODUCT(product.id),
      value: product,
      options: {
        ttl: CACHE_TTL.LONG,
        tags: [CACHE_TAGS.PRODUCTS],
      },
    }));

    await this.cache.mset(cacheOperations);
  }

  // Generic cache methods
  async get<T>(key: string): Promise<T | null> {
    return this.cache.get(key);
  }

  async set<T>(key: string, value: T, options?: { ttl?: number; tags?: string[] }): Promise<void> {
    return this.cache.set(key, value, options);
  }

  // Cache-aside pattern wrapper
  async remember<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = CACHE_TTL.MEDIUM,
    tags: string[] = []
  ): Promise<T> {
    return this.cache.remember(key, fetcher, { ttl, tags });
  }

  // Statistics
  async getStats() {
    return this.cache.getStats();
  }
}

// Singleton instance
let marketplaceCacheService: MarketplaceCacheService | null = null;

export function getCacheService(config?: CacheConfig): MarketplaceCacheService {
  if (!marketplaceCacheService) {
    // Always create a cache service, even without config (will use memory cache)
    marketplaceCacheService = new MarketplaceCacheService(config);
  }
  
  return marketplaceCacheService;
}