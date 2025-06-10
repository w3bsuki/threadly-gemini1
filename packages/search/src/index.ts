export * from './types';
export * from './algolia-search';

// Legacy export - deprecated
export * from './search-service';

// New exports - use these
export { createSearchService, type SearchServiceClient } from './search-service-client';
export type { Product, ProductRepository } from './repositories';