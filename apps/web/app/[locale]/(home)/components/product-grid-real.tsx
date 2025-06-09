'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Heart, Filter, Grid, List, ChevronDown, Crown, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo, useCallback, useEffect } from 'react';

// Inline ProductPlaceholder component for loading states
const ProductPlaceholder = ({ className = "w-full h-full" }: { className?: string }) => {
  return (
    <div className={`bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative ${className}`}>
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-gray-300"
      >
        <path
          d="M20 25 C20 25, 25 20, 40 20 C55 20, 60 25, 60 25"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M40 20 L40 15 C40 12, 42 10, 45 10 C48 10, 50 12, 50 15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M25 28 L25 35 C25 37, 27 39, 29 39 L51 39 C53 39, 55 37, 55 35 L55 28"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="currentColor"
          fillOpacity="0.1"
        />
      </svg>
      <div className="absolute bottom-4 text-xs text-gray-400 font-medium">
        Threadly
      </div>
    </div>
  );
};

// TypeScript interfaces for API data
interface Product {
  id: string;
  title: string;
  brand?: string;
  price: number;
  size?: string;
  condition: 'NEW_WITH_TAGS' | 'NEW_WITHOUT_TAGS' | 'VERY_GOOD' | 'GOOD' | 'SATISFACTORY';
  color?: string;
  views: number;
  createdAt: string;
  seller: {
    id: string;
    firstName: string;
    lastName: string;
    imageUrl?: string;
    averageRating?: number;
    verified: boolean;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: {
    imageUrl: string;
    displayOrder: number;
  }[];
  _count: {
    favorites: number;
  };
}

interface ApiResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

interface FilterState {
  category: string;
  brand: string;
  condition: string;
  minPrice: number;
  maxPrice: number;
  search: string;
  sortBy: 'newest' | 'price_asc' | 'price_desc';
  page: number;
}

const conditionMap = {
  'NEW_WITH_TAGS': 'Like New',
  'NEW_WITHOUT_TAGS': 'Like New',
  'VERY_GOOD': 'Very Good',
  'GOOD': 'Good',
  'SATISFACTORY': 'Fair'
};

export const ProductGrid = ({ 
  defaultCategory = 'All',
  maxItems = 20 
}: { 
  defaultCategory?: string;
  maxItems?: number;
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    category: defaultCategory === 'All' ? '' : defaultCategory,
    brand: '',
    condition: '',
    minPrice: 0,
    maxPrice: 5000,
    search: '',
    sortBy: 'newest',
    page: 1
  });

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      
      // Add filters to search params
      if (filters.category) searchParams.set('category', filters.category);
      if (filters.brand) searchParams.set('brand', filters.brand);
      if (filters.condition) searchParams.set('condition', filters.condition);
      if (filters.minPrice > 0) searchParams.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice < 5000) searchParams.set('maxPrice', filters.maxPrice.toString());
      if (filters.search) searchParams.set('search', filters.search);
      searchParams.set('sortBy', filters.sortBy);
      searchParams.set('page', filters.page.toString());
      searchParams.set('limit', maxItems.toString());

      const response = await fetch(`/api/products?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();
      
      if (!data.success) {
        throw new Error('API returned error');
      }

      setProducts(data.data.products);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [filters, maxItems]);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 })); // Reset to page 1 when filters change
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      category: '',
      brand: '',
      condition: '',
      minPrice: 0,
      maxPrice: 5000,
      search: '',
      sortBy: 'newest',
      page: 1
    });
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading products...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-red-500 mb-4">⚠️ Error loading products</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchProducts} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-gray-400 mb-4">📦 No products found</div>
          <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
          <Button onClick={clearFilters} variant="outline">
            Clear Filters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {defaultCategory === 'All' ? 'All Products' : defaultCategory}
          </h2>
          <p className="text-gray-600 mt-1">
            {products.length} item{products.length !== 1 ? 's' : ''} available
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          
          <div className="flex items-center border border-gray-200 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="p-2"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="p-2"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Search products..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">All Categories</option>
                <option value="clothing">Clothing</option>
                <option value="shoes">Shoes</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value as FilterState['sortBy'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
      }>
        {products.map((product) => (
          <div
            key={product.id}
            className={`group cursor-pointer bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 ${
              viewMode === 'list' ? 'flex' : ''
            }`}
          >
            {/* Product Image */}
            <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-square'}`}>
              {product.images.length > 0 ? (
                <Image
                  src={product.images[0].imageUrl}
                  alt={product.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <ProductPlaceholder />
              )}
              
              {/* Heart icon */}
              <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-all duration-200 z-10">
                <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
              </button>

              {/* Designer badge */}
              {product.seller.verified && (
                <Badge className="absolute top-3 left-3 bg-black text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4 flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-black transition-colors">
                  {product.title}
                </h3>
              </div>

              <p className="text-sm text-gray-600 mb-2">
                {product.brand} • {product.size} • {conditionMap[product.condition]}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-gray-900">
                    £{product.price}
                  </span>
                </div>
                
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span>{product.seller.firstName}</span>
                  {product.seller.averageRating && (
                    <>
                      <span>•</span>
                      <span>★ {product.seller.averageRating.toFixed(1)}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                <span>
                  {product._count.favorites} like{product._count.favorites !== 1 ? 's' : ''}
                </span>
                <span>
                  {new Date(product.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};