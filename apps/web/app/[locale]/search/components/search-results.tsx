"use client";

import { useEffect, useState } from 'react';
import { database } from '@repo/database';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@repo/design-system/components/ui/card';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import { Search, Filter, Grid, Heart } from 'lucide-react';
import { ProductPlaceholder } from '../../components/product-placeholder';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);
};

interface Product {
  id: string;
  title: string;
  brand: string | null;
  price: number;
  condition: string;
  size: string | null;
  images: { imageUrl: string }[];
  seller: {
    firstName: string | null;
    lastName: string | null;
  } | null;
  category: {
    name: string;
  } | null;
}

interface SearchResultsProps {
  query: string;
}

export function SearchResults({ query }: SearchResultsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchProducts = async () => {
      if (!query.trim()) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // This would normally be an API call, but for simplicity we'll do client-side search
        // In production, this should be a server action or API endpoint
        const searchTerm = query.toLowerCase();
        
        // For now, we'll simulate the search by calling a hypothetical API
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
          throw new Error('Search failed');
        }
        
        const results = await response.json();
        setProducts(results);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to search products. Please try again.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    searchProducts();
  }, [query]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Searching products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Search Error</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!query.trim()) {
    return (
      <div className="text-center py-12">
        <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Start Your Search</h2>
        <p className="text-gray-600">Enter a search term to find products, brands, or categories</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h2>
        <p className="text-gray-600 mb-6">
          We couldn't find any products matching "{query}". Try different keywords or browse our categories.
        </p>
        <div className="space-x-4">
          <Button variant="outline" asChild>
            <Link href="/products">Browse All Products</Link>
          </Button>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Search Results for "{query}"
        </h1>
        <p className="text-gray-600">
          Found {products.length} {products.length === 1 ? 'product' : 'products'}
        </p>
      </div>

      {/* Results Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <Link key={product.id} href={`/product/${product.id}`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group">
              <div className="relative aspect-[3/4] bg-gray-100">
                {product.images[0] && 
                 !product.images[0].imageUrl.includes('picsum.photos') && 
                 !product.images[0].imageUrl.includes('placehold.co') ? (
                  <Image
                    src={product.images[0].imageUrl}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <ProductPlaceholder className="h-full w-full" />
                )}
                
                {/* Heart Button */}
                <button 
                  className="absolute top-3 right-3 rounded-full bg-white/90 p-2 backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                  aria-label="Add to favorites"
                >
                  <Heart className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              
              <CardContent className="p-4">
                <div className="mb-2">
                  <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                    {product.brand || 'Unknown Brand'}
                  </p>
                  <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.title}
                  </h3>
                </div>
                
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(product.price)}
                  </span>
                  {product.size && (
                    <Badge variant="outline" className="text-xs">
                      Size {product.size}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    {product.seller 
                      ? `${product.seller.firstName || ''} ${product.seller.lastName || ''}`.trim() || 'Anonymous'
                      : 'Anonymous'
                    }
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {product.condition}
                  </Badge>
                </div>
                
                {product.category && (
                  <p className="text-xs text-gray-500 mt-1">
                    in {product.category.name}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}