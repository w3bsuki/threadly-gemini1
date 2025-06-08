import { algoliasearch } from 'algoliasearch';
import { withRetry } from '@repo/error-handling';
import type { 
  SearchConfig, 
  SearchProduct, 
  SearchFilters, 
  SearchResult, 
  SearchSuggestion,
  SearchAnalytics,
  SearchIndexable,
  SearchEngine
} from './types';
import { SEARCH_FACETS, SEARCH_SETTINGS } from './types';

export class AlgoliaSearch implements SearchEngine, SearchIndexable {
  private client: ReturnType<typeof algoliasearch>;
  private index: ReturnType<ReturnType<typeof algoliasearch>['initIndex']>;
  private indexName: string;

  constructor(config: SearchConfig) {
    this.client = algoliasearch(config.appId, config.apiKey);
    this.index = this.client.initIndex(config.indexName);
    this.indexName = config.indexName;
    
    this.configureIndex();
  }

  private async configureIndex() {
    try {
      await this.index.setSettings({
        // Searchable attributes with priorities
        searchableAttributes: [
          'title',
          'brand',
          'description',
          'categoryName',
          'sellerName',
          'tags',
        ],
        
        // Attributes for faceting and filtering
        attributesForFaceting: [
          'searchable(categoryName)',
          'searchable(brand)',
          'condition',
          'size',
          'colors',
          'materials',
          'sellerRating',
          'sellerLocation',
          'availableForTrade',
          'status',
        ],
        
        // Custom ranking attributes
        customRanking: [
          'desc(views)',
          'desc(favorites)',
          'desc(sellerRating)',
          'desc(createdAt)',
        ],
        
        // Ranking formula
        ranking: [
          'typo',
          'geo',
          'words',
          'filters',
          'proximity',
          'attribute',
          'exact',
          'custom',
        ],
        
        // Highlighting
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
        
        // Pagination
        hitsPerPage: SEARCH_SETTINGS.DEFAULT_HITS_PER_PAGE,
        maxValuesPerFacet: 100,
        
        // Advanced features
        removeWordsIfNoResults: 'allOptional',
        advancedSyntax: true,
        allowCompressionOfIntegerArray: true,
      });
    } catch (error) {
      console.error('Failed to configure Algolia index:', error);
    }
  }

  // Indexing methods
  async index(products: SearchProduct[]): Promise<void> {
    try {
      const chunks = this.chunkArray(products, 1000); // Algolia limit
      
      for (const chunk of chunks) {
        await withRetry(
          () => this.index.saveObjects(chunk.map(p => ({ ...p, objectID: p.id }))),
          { retries: 3, delay: 1000 }
        );
      }
    } catch (error) {
      console.error('Failed to index products:', error);
      throw error;
    }
  }

  async updateProduct(product: SearchProduct): Promise<void> {
    try {
      await withRetry(
        () => this.index.saveObject({ ...product, objectID: product.id }),
        { retries: 3, delay: 500 }
      );
    } catch (error) {
      console.error(`Failed to update product ${product.id}:`, error);
      throw error;
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      await withRetry(
        () => this.index.deleteObject(productId),
        { retries: 3, delay: 500 }
      );
    } catch (error) {
      console.error(`Failed to delete product ${productId}:`, error);
      throw error;
    }
  }

  async clearIndex(): Promise<void> {
    try {
      await this.index.clearObjects();
    } catch (error) {
      console.error('Failed to clear index:', error);
      throw error;
    }
  }

  async getIndexStats() {
    try {
      const stats = await this.index.getTask(0); // This is a simplified approach
      return {
        objectCount: 0, // Would need to implement proper stats fetching
        fileSize: 0,
      };
    } catch (error) {
      console.error('Failed to get index stats:', error);
      return { objectCount: 0, fileSize: 0 };
    }
  }

  // Search methods
  async search(
    filters: SearchFilters,
    page = 0,
    hitsPerPage = SEARCH_SETTINGS.DEFAULT_HITS_PER_PAGE
  ): Promise<SearchResult> {
    try {
      const searchParams: any = {
        page,
        hitsPerPage: Math.min(hitsPerPage, SEARCH_SETTINGS.MAX_HITS_PER_PAGE),
        facets: Object.values(SEARCH_FACETS),
        maxValuesPerFacet: 100,
      };

      // Apply filters
      const algoliaFilters: string[] = [];

      if (filters.categories?.length) {
        algoliaFilters.push(`(${filters.categories.map(c => `categoryName:"${c}"`).join(' OR ')})`);
      }

      if (filters.brands?.length) {
        algoliaFilters.push(`(${filters.brands.map(b => `brand:"${b}"`).join(' OR ')})`);
      }

      if (filters.conditions?.length) {
        algoliaFilters.push(`(${filters.conditions.map(c => `condition:"${c}"`).join(' OR ')})`);
      }

      if (filters.sizes?.length) {
        algoliaFilters.push(`(${filters.sizes.map(s => `size:"${s}"`).join(' OR ')})`);
      }

      if (filters.priceRange) {
        algoliaFilters.push(`price:${filters.priceRange.min} TO ${filters.priceRange.max}`);
      }

      if (filters.sellerRating) {
        algoliaFilters.push(`sellerRating >= ${filters.sellerRating}`);
      }

      if (filters.availableForTrade !== undefined) {
        algoliaFilters.push(`availableForTrade:${filters.availableForTrade}`);
      }

      // Only show available products
      algoliaFilters.push('status:"AVAILABLE"');

      if (algoliaFilters.length > 0) {
        searchParams.filters = algoliaFilters.join(' AND ');
      }

      // Apply sorting
      if (filters.sortBy && filters.sortBy !== 'relevance') {
        const sortMappings = {
          price_asc: 'price_asc',
          price_desc: 'price_desc',
          newest: 'createdAt_desc',
          most_viewed: 'views_desc',
          most_favorited: 'favorites_desc',
        };
        
        const sortIndex = sortMappings[filters.sortBy];
        if (sortIndex) {
          searchParams.indexName = `${this.indexName}_${sortIndex}`;
        }
      }

      const result = await withRetry(
        () => this.index.search(filters.query || '', searchParams),
        { retries: 3, delay: 500 }
      );

      return {
        hits: result.hits as SearchProduct[],
        totalHits: result.nbHits,
        page: result.page,
        totalPages: result.nbPages,
        processingTimeMS: result.processingTimeMS,
        facets: result.facets,
        filters,
      };
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }

  async searchSuggestions(query: string, limit = SEARCH_SETTINGS.DEFAULT_SUGGESTION_LIMIT): Promise<SearchSuggestion[]> {
    try {
      if (!query || query.length < 2) return [];

      const result = await this.index.search(query, {
        hitsPerPage: 0,
        facets: [SEARCH_FACETS.CATEGORIES],
        maxValuesPerFacet: limit,
      });

      const suggestions: SearchSuggestion[] = [];

      // Add query-based suggestions
      if (result.nbHits > 0) {
        suggestions.push({
          query,
          count: result.nbHits,
        });
      }

      // Add category suggestions
      if (result.facets?.[SEARCH_FACETS.CATEGORIES]) {
        Object.entries(result.facets[SEARCH_FACETS.CATEGORIES])
          .slice(0, limit - 1)
          .forEach(([category, count]) => {
            suggestions.push({
              query,
              category,
              count,
            });
          });
      }

      return suggestions;
    } catch (error) {
      console.error('Failed to get search suggestions:', error);
      return [];
    }
  }

  async getPopularProducts(limit = SEARCH_SETTINGS.POPULAR_PRODUCTS_LIMIT): Promise<SearchProduct[]> {
    try {
      const result = await this.index.search('', {
        hitsPerPage: limit,
        filters: 'status:"AVAILABLE"',
        // This will use the custom ranking which prioritizes views and favorites
      });

      return result.hits as SearchProduct[];
    } catch (error) {
      console.error('Failed to get popular products:', error);
      return [];
    }
  }

  async getSimilarProducts(productId: string, limit = SEARCH_SETTINGS.SIMILAR_PRODUCTS_LIMIT): Promise<SearchProduct[]> {
    try {
      // First get the product to find similar ones
      const product = await this.index.getObject(productId) as SearchProduct;
      
      if (!product) return [];

      // Search for similar products based on category, brand, and price range
      const priceMin = product.price * 0.5;
      const priceMax = product.price * 2;

      const result = await this.index.search('', {
        hitsPerPage: limit + 1, // +1 to exclude the original product
        filters: `status:"AVAILABLE" AND categoryName:"${product.categoryName}" AND price:${priceMin} TO ${priceMax} AND NOT objectID:"${productId}"`,
      });

      return result.hits.slice(0, limit) as SearchProduct[];
    } catch (error) {
      console.error(`Failed to get similar products for ${productId}:`, error);
      return [];
    }
  }

  async getProductsByCategory(category: string, limit = 20): Promise<SearchProduct[]> {
    try {
      const result = await this.index.search('', {
        hitsPerPage: limit,
        filters: `status:"AVAILABLE" AND categoryName:"${category}"`,
      });

      return result.hits as SearchProduct[];
    } catch (error) {
      console.error(`Failed to get products for category ${category}:`, error);
      return [];
    }
  }

  // Analytics methods
  async trackClick(productId: string, query: string, position: number): Promise<void> {
    try {
      // Note: This requires Algolia Insights API
      // Implementation would depend on your analytics setup
      console.log(`Click tracked: ${productId} at position ${position} for query "${query}"`);
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  }

  async trackConversion(productId: string, query: string): Promise<void> {
    try {
      // Note: This requires Algolia Insights API
      console.log(`Conversion tracked: ${productId} for query "${query}"`);
    } catch (error) {
      console.error('Failed to track conversion:', error);
    }
  }

  async getAnalytics(startDate: Date, endDate: Date): Promise<SearchAnalytics> {
    try {
      // Note: This would require Algolia Analytics API
      // Return mock data for now
      return {
        totalSearches: 0,
        topQueries: [],
        topCategories: [],
        averageClickPosition: 0,
        conversionRate: 0,
      };
    } catch (error) {
      console.error('Failed to get analytics:', error);
      return {
        totalSearches: 0,
        topQueries: [],
        topCategories: [],
        averageClickPosition: 0,
        conversionRate: 0,
      };
    }
  }

  // Utility methods
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// Singleton instance
let algoliaSearch: AlgoliaSearch | null = null;

export function getAlgoliaSearch(config?: SearchConfig): AlgoliaSearch {
  if (!algoliaSearch && config) {
    algoliaSearch = new AlgoliaSearch(config);
  }
  
  if (!algoliaSearch) {
    throw new Error('AlgoliaSearch not initialized. Call with config first.');
  }
  
  return algoliaSearch;
}