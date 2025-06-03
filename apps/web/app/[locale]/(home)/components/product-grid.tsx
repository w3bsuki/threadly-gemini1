'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Heart, Filter, Grid, List, ChevronDown, Crown, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo, useCallback } from 'react';

// Inline ProductPlaceholder component
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
        {/* Clothing Hanger */}
        <path
          d="M20 25 C20 25, 25 20, 40 20 C55 20, 60 25, 60 25"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Hanger Hook */}
        <path
          d="M40 20 L40 15 C40 12, 42 10, 45 10 C48 10, 50 12, 50 15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* T-shirt Shape */}
        <path
          d="M25 28 L25 35 C25 37, 27 39, 29 39 L51 39 C53 39, 55 37, 55 35 L55 28"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="currentColor"
          fillOpacity="0.1"
        />
        
        {/* T-shirt Body */}
        <rect
          x="30"
          y="35"
          width="20"
          height="30"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
          fill="currentColor"
          fillOpacity="0.1"
        />
        
        {/* Sleeves */}
        <path
          d="M25 28 L20 32 C18 34, 18 36, 20 38 L22 40 C23 41, 25 40, 25 38 L25 35"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="currentColor"
          fillOpacity="0.1"
        />
        
        <path
          d="M55 28 L60 32 C62 34, 62 36, 60 38 L58 40 C57 41, 55 40, 55 38 L55 35"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="currentColor"
          fillOpacity="0.1"
        />
        
        {/* Decorative Elements */}
        <circle cx="35" cy="45" r="1" fill="currentColor" opacity="0.3" />
        <circle cx="40" cy="48" r="1" fill="currentColor" opacity="0.3" />
        <circle cx="45" cy="45" r="1" fill="currentColor" opacity="0.3" />
      </svg>
      
      {/* Subtle text */}
      <div className="absolute bottom-4 text-xs text-gray-400 font-medium">
        Threadly
      </div>
    </div>
  );
};

// TypeScript interfaces following best practices
type ProductCategory = 'T-shirts' | 'Jeans' | 'Dresses' | 'Sneakers' | 'Bags' | 'Jackets' | 'Sweaters';
type ProductCondition = 'Like New' | 'Very Good' | 'Good';
type SortOption = 'newest' | 'price-low' | 'price-high' | 'popular';
type ProductGender = 'men' | 'women' | 'kids' | 'unisex';

interface Product {
  id: number;
  title: string;
  brand: string;
  price: number;
  originalPrice?: number;
  size: string;
  condition: ProductCondition;
  category: ProductCategory;
  gender: ProductGender;
  images: string[];
  seller: {
    name: string;
    location: string;
    rating: number;
  };
  isLiked: boolean;
  isDesigner?: boolean;
  uploadedAgo: string;
}

interface FilterState {
  category: string;
  brand: string;
  size: string;
  priceRange: [number, number];
  condition: string;
  sortBy: SortOption;
  searchQuery: string;
}

// Mock product data with proper typing
const mockProducts: Product[] = [
  {
    id: 1,
    title: 'Vintage Levi\'s 501 Jeans',
    brand: 'Levi\'s',
    price: 45,
    originalPrice: 120,
    size: '32',
    condition: 'Very Good',
    category: 'Jeans',
    gender: 'men',
    images: ['placeholder'],
    seller: { name: 'Sarah', location: 'London', rating: 4.9 },
    isLiked: false,
    uploadedAgo: '2 hours ago'
  },
  {
    id: 2,
    title: 'Zara Floral Summer Dress',
    brand: 'Zara',
    price: 28,
    originalPrice: 89,
    size: 'M',
    condition: 'Like New',
    category: 'Dresses',
    gender: 'women',
    images: ['placeholder'],
    seller: { name: 'Emma', location: 'Manchester', rating: 4.8 },
    isLiked: true,
    uploadedAgo: '4 hours ago'
  },
  {
    id: 3,
    title: 'Nike Air Max 90 White',
    brand: 'Nike',
    price: 65,
    originalPrice: 150,
    size: 'UK 8',
    condition: 'Good',
    category: 'Sneakers',
    gender: 'unisex',
    images: ['placeholder'],
    seller: { name: 'Mike', location: 'Birmingham', rating: 4.7 },
    isLiked: false,
    uploadedAgo: '1 day ago'
  },
  {
    id: 4,
    title: 'Gucci Leather Handbag',
    brand: 'Gucci',
    price: 850,
    originalPrice: 2200,
    size: 'One Size',
    condition: 'Very Good',
    category: 'Bags',
    gender: 'women',
    images: ['placeholder'],
    seller: { name: 'Lisa', location: 'Edinburgh', rating: 5.0 },
    isLiked: false,
    isDesigner: true,
    uploadedAgo: '3 hours ago'
  },
  {
    id: 5,
    title: 'H&M Oversized Blazer Black',
    brand: 'H&M',
    price: 22,
    originalPrice: 79,
    size: 'L',
    condition: 'Good',
    category: 'Jackets',
    gender: 'men',
    images: ['placeholder'],
    seller: { name: 'Jenna', location: 'Bristol', rating: 4.6 },
    isLiked: true,
    uploadedAgo: '6 hours ago'
  },
  {
    id: 6,
    title: 'Vintage Band T-Shirt',
    brand: 'Vintage',
    price: 35,
    size: 'M',
    condition: 'Very Good',
    category: 'T-shirts',
    gender: 'men',
    images: ['placeholder'],
    seller: { name: 'Alex', location: 'Liverpool', rating: 4.9 },
    isLiked: false,
    uploadedAgo: '5 hours ago'
  },
  {
    id: 7,
    title: 'Chanel Classic Flap Bag',
    brand: 'Chanel',
    price: 3200,
    originalPrice: 8500,
    size: 'Medium',
    condition: 'Like New',
    category: 'Bags',
    gender: 'women',
    images: ['placeholder'],
    seller: { name: 'Victoria', location: 'London', rating: 5.0 },
    isLiked: true,
    isDesigner: true,
    uploadedAgo: '1 hour ago'
  },
  {
    id: 8,
    title: 'Adidas Stan Smith Sneakers',
    brand: 'Adidas',
    price: 35,
    originalPrice: 90,
    size: 'UK 9',
    condition: 'Good',
    category: 'Sneakers',
    gender: 'unisex',
    images: ['placeholder'],
    seller: { name: 'Tom', location: 'Manchester', rating: 4.5 },
    isLiked: false,
    uploadedAgo: '8 hours ago'
  },
  // Add more varied products
  ...Array.from({ length: 16 }, (_, i) => ({
    id: i + 9,
    title: `${['Designer Silk Blouse', 'Cotton T-Shirt', 'Wool Sweater', 'Denim Jacket', 'Summer Dress'][i % 5]}`,
    brand: ['Prada', 'Uniqlo', 'COS', 'Levi\'s', 'Mango'][i % 5],
    price: Math.floor(Math.random() * 200) + 10,
    originalPrice: Math.floor(Math.random() * 300) + 50,
    size: ['XS', 'S', 'M', 'L', 'XL'][i % 5],
    condition: (['Like New', 'Very Good', 'Good'] as const)[i % 3],
    category: (['T-shirts', 'Sweaters', 'Jackets', 'Dresses', 'Jeans'] as const)[i % 5],
    gender: (['men', 'women', 'kids', 'unisex'] as const)[i % 4],
    images: ['placeholder'],
    seller: {
      name: ['Anna', 'John', 'Maria', 'David', 'Sophie'][i % 5],
      location: ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Bristol'][i % 5],
      rating: 4.5 + Math.random() * 0.5
    },
    isLiked: Math.random() > 0.7,
    isDesigner: i % 8 === 0,
    uploadedAgo: `${Math.floor(Math.random() * 24)} hours ago`
  }))
];

// Filter options
const filterOptions = {
  categories: ['All', 'T-shirts', 'Jeans', 'Dresses', 'Sneakers', 'Bags', 'Jackets', 'Sweaters'],
  brands: ['All brands', 'Gucci', 'Chanel', 'Prada', 'Nike', 'Adidas', 'Zara', 'H&M', 'Levi\'s', 'Vintage'],
  sizes: ['All sizes', 'XS', 'S', 'M', 'L', 'XL', 'UK 8', 'UK 9', '32'],
  conditions: ['All conditions', 'Like New', 'Very Good', 'Good'],
  sortOptions: [
    { value: 'newest' as const, label: 'Newest first' },
    { value: 'price-low' as const, label: 'Price: Low to High' },
    { value: 'price-high' as const, label: 'Price: High to Low' },
    { value: 'popular' as const, label: 'Most Popular' },
  ]
};

// Pure UI component for product cards
const ProductCard = ({ product, onToggleLike }: { 
  product: Product; 
  onToggleLike: (id: number) => void;
}) => (
  <div className="group relative bg-white">
    <Link href={`/products/${product.id}`} className="block">
      <div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 relative">
        {/* Use our beautiful illustrated placeholder */}
        <ProductPlaceholder className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity" />
        
        {/* Heart button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            onToggleLike(product.id);
          }}
          className={`absolute top-2 right-2 p-2 rounded-full transition-all ${
            product.isLiked ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
          } backdrop-blur-sm`}
          aria-label="Add to favourites"
        >
          <Heart className={`h-4 w-4 ${product.isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Condition badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="text-xs bg-white/90 text-gray-900">
            {product.condition}
          </Badge>
        </div>

        {/* Designer badge - moved to top left */}
        {product.isDesigner && (
          <div className="absolute top-2 left-2 mt-7">
            <Badge className="text-xs bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 border-0">
              <Crown className="h-3 w-3 mr-1" />
              Designer
            </Badge>
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{product.brand}</p>
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{product.title}</h3>
        
        <div className="flex items-center space-x-2">
          <span className="text-lg font-semibold text-gray-900">£{product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">£{product.originalPrice}</span>
          )}
        </div>
        
        <p className="text-xs text-gray-500">Size {product.size}</p>
        <p className="text-xs text-gray-400">{product.seller.location} • {product.uploadedAgo}</p>
      </div>
    </Link>
  </div>
);

// Custom hook for product filtering and sorting
const useProductFilters = (products: Product[], defaultCategory?: string) => {
  const [filters, setFilters] = useState<FilterState>({
    category: defaultCategory || 'All',
    brand: 'All brands',
    size: 'All sizes',
    priceRange: [0, 5000],
    condition: 'All conditions',
    sortBy: 'newest',
    searchQuery: ''
  });

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Special handling for designer category
    if (defaultCategory === 'designer') {
      filtered = filtered.filter(product => product.isDesigner === true);
    } 
    // Gender filter (based on defaultCategory)
    else if (defaultCategory && ['men', 'women', 'kids', 'unisex'].includes(defaultCategory)) {
      filtered = filtered.filter(product => 
        product.gender === defaultCategory || product.gender === 'unisex'
      );
    }

    // Category filter
    if (filters.category !== 'All') {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Brand filter
    if (filters.brand !== 'All brands') {
      filtered = filtered.filter(product => product.brand === filters.brand);
    }

    // Size filter
    if (filters.size !== 'All sizes') {
      filtered = filtered.filter(product => product.size === filters.size);
    }

    // Price range filter
    filtered = filtered.filter(product => 
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Condition filter
    if (filters.condition !== 'All conditions') {
      filtered = filtered.filter(product => product.condition === filters.condition);
    }

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }

    // Sort products
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        filtered.sort((a, b) => b.seller.rating - a.seller.rating);
        break;
      case 'newest':
      default:
        // Already in newest order
        break;
    }

    return filtered;
  }, [products, filters, defaultCategory]);

  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      category: 'All',
      brand: 'All brands',
      size: 'All sizes',
      priceRange: [0, 5000],
      condition: 'All conditions',
      sortBy: 'newest',
      searchQuery: ''
    });
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'All') count++;
    if (filters.brand !== 'All brands') count++;
    if (filters.size !== 'All sizes') count++;
    if (filters.condition !== 'All conditions') count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000) count++;
    return count;
  }, [filters]);

  return {
    filters,
    filteredProducts,
    updateFilter,
    clearFilters,
    activeFilterCount
  };
};

// Main component
export const ProductGrid = ({ defaultCategory }: { defaultCategory?: string } = {}) => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [showFilters, setShowFilters] = useState(false);
  const { 
    filters, 
    filteredProducts, 
    updateFilter, 
    clearFilters, 
    activeFilterCount 
  } = useProductFilters(products, defaultCategory);

  // Handle like toggle
  const handleToggleLike = useCallback((productId: number) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, isLiked: !product.isLiked }
          : product
      )
    );
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Enhanced Filter Bar with Working Functionality */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          {/* Working Filter Button */}
          <Button 
            variant="outline" 
            size="default"
            onClick={() => setShowFilters(!showFilters)}
            className="hidden md:flex font-medium border-gray-300 hover:border-gray-400 hover:bg-gray-50 px-6 py-2.5"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-black text-white text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          
          {/* Working Filter Chips */}
          <div className="hidden lg:flex items-center space-x-2">
            <select
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="text-xs text-gray-600 border border-gray-200 rounded px-3 py-1.5 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
              aria-label="Filter by category"
            >
              {filterOptions.categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={filters.brand}
              onChange={(e) => updateFilter('brand', e.target.value)}
              className="text-xs text-gray-600 border border-gray-200 rounded px-3 py-1.5 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
              aria-label="Filter by brand"
            >
              {filterOptions.brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            <select
              value={filters.condition}
              onChange={(e) => updateFilter('condition', e.target.value)}
              className="text-xs text-gray-600 border border-gray-200 rounded px-3 py-1.5 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
              aria-label="Filter by condition"
            >
              {filterOptions.conditions.map(condition => (
                <option key={condition} value={condition}>{condition}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Results count */}
          <span className="text-sm text-gray-600 hidden md:block font-medium">
            {filteredProducts.length.toLocaleString()} items
          </span>

          {/* View toggle */}
          <div className="hidden md:flex items-center border rounded-md">
            <Button variant="ghost" size="sm" className="rounded-r-none border-r bg-gray-50">
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="rounded-l-none">
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile filter button - Working */}
      <div className="md:hidden mb-4">
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className="w-full font-medium py-3 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters & Sort
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2 bg-black text-white text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {/* Mobile Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Filters</h3>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="text-sm border border-gray-200 rounded px-3 py-2"
                aria-label="Filter by category"
              >
                {filterOptions.categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={filters.brand}
                onChange={(e) => updateFilter('brand', e.target.value)}
                className="text-sm border border-gray-200 rounded px-3 py-2"
                aria-label="Filter by brand"
              >
                {filterOptions.brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>

              <select
                value={filters.size}
                onChange={(e) => updateFilter('size', e.target.value)}
                className="text-sm border border-gray-200 rounded px-3 py-2"
                aria-label="Filter by size"
              >
                {filterOptions.sizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>

              <select
                value={filters.condition}
                onChange={(e) => updateFilter('condition', e.target.value)}
                className="text-sm border border-gray-200 rounded px-3 py-2"
                aria-label="Filter by condition"
              >
                {filterOptions.conditions.map(condition => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>

            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value as SortOption)}
              className="w-full text-sm border border-gray-200 rounded px-3 py-2"
              aria-label="Sort products by"
            >
              {filterOptions.sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Product Grid with Filtered Results */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filteredProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onToggleLike={handleToggleLike}
          />
        ))}
      </div>

      {/* No results state */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No products found</p>
          <Button variant="outline" onClick={clearFilters}>
            Clear all filters
          </Button>
        </div>
      )}

      {/* Load More */}
      {filteredProducts.length > 0 && (
        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" className="px-8 py-3 font-medium">
            Load more items
          </Button>
        </div>
      )}
    </div>
  );
}; 