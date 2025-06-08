'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components/ui/select';
import { Slider } from '@repo/design-system/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@repo/design-system/components/ui/sheet';
import { Separator } from '@repo/design-system/components/ui/separator';
import { 
  Filter, 
  Search, 
  Heart, 
  ShoppingBag,
  Grid3X3,
  List,
  X
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toggleFavorite } from '../actions/favorite-actions';
import { useCartStore } from '@/lib/stores/cart-store';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  brand?: string;
  size?: string;
  color?: string;
  status: string;
  createdAt: Date;
  images: Array<{
    id: string;
    imageUrl: string;
    alt?: string;
  }>;
  category: {
    id: string;
    name: string;
  };
  seller: {
    id: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
  };
  _count: {
    favorites: number;
  };
}

interface Category {
  id: string;
  name: string;
  parent?: {
    id: string;
    name: string;
  };
  _count: {
    products: number;
  };
}

interface BrowseContentProps {
  products: Product[];
  categories: Category[];
  favoriteProductIds: string[];
  currentFilters: {
    category?: string;
    condition?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    search?: string;
  };
  totalCount: number;
}

export function BrowseContent({ 
  products, 
  categories, 
  favoriteProductIds: initialFavorites,
  currentFilters,
  totalCount
}: BrowseContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favoriteIds, setFavoriteIds] = useState(new Set(initialFavorites));
  const [priceRange, setPriceRange] = useState([
    parseFloat(currentFilters.minPrice || '0'),
    parseFloat(currentFilters.maxPrice || '1000')
  ]);
  const { addItem } = useCartStore();

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    router.push(`/browse?${params.toString()}`);
  };

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('minPrice', priceRange[0].toString());
    params.set('maxPrice', priceRange[1].toString());
    router.push(`/browse?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/browse');
  };

  const handleToggleFavorite = async (productId: string) => {
    const result = await toggleFavorite(productId);
    if (result.success) {
      if (result.isFavorited) {
        setFavoriteIds(new Set([...favoriteIds, productId]));
      } else {
        const newFavorites = new Set(favoriteIds);
        newFavorites.delete(productId);
        setFavoriteIds(newFavorites);
      }
    }
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.images[0]?.imageUrl || '/placeholder.png',
      sellerId: product.seller.id,
      condition: product.condition,
      size: product.size,
    });
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'NEW_WITH_TAGS':
        return 'New with tags';
      case 'NEW_WITHOUT_TAGS':
        return 'New without tags';
      case 'VERY_GOOD':
        return 'Very good';
      case 'GOOD':
        return 'Good';
      case 'SATISFACTORY':
        return 'Satisfactory';
      default:
        return condition;
    }
  };

  const activeFiltersCount = Object.keys(currentFilters).filter(
    key => currentFilters[key as keyof typeof currentFilters]
  ).length;

  return (
    <div className="flex gap-6">
      {/* Filters Sidebar - Desktop */}
      <aside className="hidden lg:block w-64 space-y-6">
        <div>
          <h3 className="font-semibold mb-3">Filters</h3>
          
          {/* Search */}
          <div className="space-y-2 mb-4">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                defaultValue={currentFilters.search}
                className="pl-10"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    updateFilter('search', e.currentTarget.value);
                  }
                }}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select 
              value={currentFilters.category || ''} 
              onValueChange={(value) => updateFilter('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.parent?.name} - {category.name} ({category._count.products})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Condition */}
          <div className="space-y-2 mt-4">
            <Label>Condition</Label>
            <Select 
              value={currentFilters.condition || ''} 
              onValueChange={(value) => updateFilter('condition', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any condition</SelectItem>
                <SelectItem value="NEW_WITH_TAGS">New with tags</SelectItem>
                <SelectItem value="NEW_WITHOUT_TAGS">New without tags</SelectItem>
                <SelectItem value="VERY_GOOD">Very good</SelectItem>
                <SelectItem value="GOOD">Good</SelectItem>
                <SelectItem value="SATISFACTORY">Satisfactory</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-2 mt-4">
            <Label>Price Range</Label>
            <div className="px-2">
              <Slider
                min={0}
                max={1000}
                step={10}
                value={priceRange}
                onValueChange={setPriceRange}
                className="mt-2"
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2"
              onClick={applyPriceFilter}
            >
              Apply Price Filter
            </Button>
          </div>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-4"
              onClick={clearFilters}
            >
              Clear all filters ({activeFiltersCount})
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Mobile Filter */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                {/* Copy filter content here for mobile */}
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select 
                value={currentFilters.sort || 'newest'} 
                onValueChange={(value) => updateFilter('sort', value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {currentFilters.category && (
              <Badge variant="secondary" className="gap-1">
                Category: {categories.find(c => c.id === currentFilters.category)?.name}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('category', null)}
                />
              </Badge>
            )}
            {currentFilters.condition && (
              <Badge variant="secondary" className="gap-1">
                {getConditionText(currentFilters.condition)}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('condition', null)}
                />
              </Badge>
            )}
            {currentFilters.search && (
              <Badge variant="secondary" className="gap-1">
                Search: {currentFilters.search}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('search', null)}
                />
              </Badge>
            )}
          </div>
        )}

        {/* Products Grid/List */}
        {products.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No products found matching your filters.</p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4' 
            : 'space-y-4'
          }>
            {products.map((product) => (
              <Card 
                key={product.id} 
                className={`overflow-hidden group ${viewMode === 'list' ? 'flex' : ''}`}
              >
                <Link 
                  href={`/product/${product.id}`}
                  className={viewMode === 'list' ? 'flex gap-4 p-4 flex-1' : ''}
                >
                  <div className={viewMode === 'grid' 
                    ? 'aspect-square relative' 
                    : 'relative w-32 h-32 flex-shrink-0'
                  }>
                    <Image
                      src={product.images[0]?.imageUrl || '/placeholder.png'}
                      alt={product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    
                    {viewMode === 'grid' && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 bg-white/80 hover:bg-white/90"
                          onClick={(e) => {
                            e.preventDefault();
                            handleToggleFavorite(product.id);
                          }}
                        >
                          <Heart 
                            className={`h-4 w-4 ${favoriteIds.has(product.id) ? 'fill-red-500 text-red-500' : ''}`}
                          />
                        </Button>
                        
                        <Badge className="absolute bottom-2 left-2 bg-white/90 text-black">
                          {getConditionText(product.condition)}
                        </Badge>
                      </>
                    )}
                  </div>
                  
                  <div className={viewMode === 'grid' ? 'p-4' : 'flex-1 flex flex-col justify-between'}>
                    <div>
                      <h3 className="font-semibold line-clamp-1">{product.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {product.brand ? `${product.brand} • ` : ''}{product.size}
                      </p>
                      <p className="text-lg font-bold mt-1">${product.price.toFixed(2)}</p>
                      
                      {viewMode === 'list' && (
                        <>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">
                              {getConditionText(product.condition)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {product.category.name}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Heart className="h-3 w-3" />
                        {product._count.favorites}
                      </div>
                      
                      {viewMode === 'list' && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.preventDefault();
                              handleToggleFavorite(product.id);
                            }}
                          >
                            <Heart 
                              className={`h-4 w-4 ${favoriteIds.has(product.id) ? 'fill-red-500 text-red-500' : ''}`}
                            />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              handleAddToCart(product);
                            }}
                          >
                            <ShoppingBag className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
                
                {viewMode === 'grid' && (
                  <div className="px-4 pb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}