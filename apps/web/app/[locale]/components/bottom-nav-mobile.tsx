'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@repo/design-system/components/ui/sheet';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Separator } from '@repo/design-system/components/ui/separator';
import { 
  Home, 
  Search, 
  Heart, 
  ShoppingBag, 
  Filter, 
  User,
  Grid3X3,
  SlidersHorizontal,
  X,
  ChevronUp
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@repo/design-system/lib/utils';

interface BottomNavMobileProps {
  cartCount?: number;
  savedCount?: number;
}

const navItems = [
  { 
    icon: Home, 
    label: 'Home', 
    href: '/',
    activePattern: /^\/$/
  },
  { 
    icon: Search, 
    label: 'Browse', 
    href: '/products',
    activePattern: /^\/products/
  },
  { 
    icon: Heart, 
    label: 'Saved', 
    href: '/favorites',
    activePattern: /^\/favorites/
  },
  { 
    icon: ShoppingBag, 
    label: 'Cart', 
    href: '/cart',
    activePattern: /^\/cart/
  },
  { 
    icon: User, 
    label: 'Account', 
    href: '/account',
    activePattern: /^\/account/
  }
];

const filterCategories = [
  'All Categories',
  'Women',
  'Men', 
  'Kids',
  'Designer',
  'Unisex'
];

const priceRanges = [
  { label: 'Under $25', value: 'under-25' },
  { label: '$25 - $50', value: '25-50' },
  { label: '$50 - $100', value: '50-100' },
  { label: '$100 - $200', value: '100-200' },
  { label: 'Over $200', value: 'over-200' }
];

const conditions = [
  'New with tags',
  'New without tags', 
  'Very good',
  'Good',
  'Satisfactory'
];

const sizes = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL',
  '6', '8', '10', '12', '14', '16'
];

export function BottomNavMobile({ cartCount = 0, savedCount = 0 }: BottomNavMobileProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    category: 'All Categories',
    priceRange: '',
    condition: '',
    sizes: [] as string[]
  });

  // Hide/show bottom nav on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false); // Hide when scrolling down
      } else {
        setIsVisible(true); // Show when scrolling up
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleSizeToggle = (size: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) 
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      category: 'All Categories',
      priceRange: '',
      condition: '',
      sizes: []
    });
  };

  const hasActiveFilters = selectedFilters.category !== 'All Categories' || 
                         selectedFilters.priceRange || 
                         selectedFilters.condition || 
                         selectedFilters.sizes.length > 0;

  return (
    <>
      {/* Bottom Navigation */}
      <nav 
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden transition-transform duration-300",
          isVisible ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const isActive = item.activePattern.test(pathname);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center space-y-1 text-xs transition-colors",
                  "min-h-[44px] min-w-[44px] p-2", // Ensure minimum touch target size
                  "hover:bg-gray-50 active:bg-gray-100 rounded-lg mx-1",
                  isActive 
                    ? "text-black font-medium" 
                    : "text-gray-500 hover:text-gray-700"
                )}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {item.label === 'Cart' && cartCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center min-w-[20px]"
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </Badge>
                  )}
                  {item.label === 'Saved' && savedCount > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center min-w-[20px]"
                    >
                      {savedCount > 99 ? '99+' : savedCount}
                    </Badge>
                  )}
                </div>
                <span className="text-[10px] leading-none max-w-full truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Filter Floating Action Button */}
      {(pathname.includes('/products') || pathname === '/') && (
        <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <SheetTrigger asChild>
            <Button
              className={cn(
                "fixed bottom-20 right-4 z-30 h-14 w-14 rounded-full shadow-lg bg-black text-white hover:bg-gray-800 md:hidden transition-transform duration-300",
                "min-h-[44px] min-w-[44px]", // Ensure minimum touch target
                "active:scale-95 active:bg-gray-700", // Better touch feedback
                isVisible ? "translate-y-0" : "translate-y-16"
              )}
              aria-label="Open filters"
            >
              <div className="relative">
                <Filter className="h-6 w-6" />
                {hasActiveFilters && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
                )}
              </div>
            </Button>
          </SheetTrigger>
          
          <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
            <SheetHeader className="pb-4">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-xl font-semibold">
                  Filters
                </SheetTitle>
                <div className="flex items-center space-x-2">
                  {hasActiveFilters && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearAllFilters}
                      className="text-gray-600"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto" />
            </SheetHeader>

            <div className="space-y-6 pb-6 overflow-y-auto">
              {/* Category Filter */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Category</h3>
                <div className="grid grid-cols-2 gap-2">
                  {filterCategories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedFilters.category === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFilters(prev => ({ ...prev, category }))}
                      className={cn(
                        "justify-start h-10",
                        selectedFilters.category === category && "bg-black text-white"
                      )}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Price Range */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <Button
                      key={range.value}
                      variant={selectedFilters.priceRange === range.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFilters(prev => ({ 
                        ...prev, 
                        priceRange: prev.priceRange === range.value ? '' : range.value 
                      }))}
                      className={cn(
                        "w-full justify-start h-10",
                        selectedFilters.priceRange === range.value && "bg-black text-white"
                      )}
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Condition */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Condition</h3>
                <div className="grid grid-cols-2 gap-2">
                  {conditions.map((condition) => (
                    <Button
                      key={condition}
                      variant={selectedFilters.condition === condition ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFilters(prev => ({ 
                        ...prev, 
                        condition: prev.condition === condition ? '' : condition 
                      }))}
                      className={cn(
                        "justify-start h-10 text-xs",
                        selectedFilters.condition === condition && "bg-black text-white"
                      )}
                    >
                      {condition}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Size */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Size</h3>
                <div className="grid grid-cols-6 gap-2">
                  {sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedFilters.sizes.includes(size) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSizeToggle(size)}
                      className={cn(
                        "h-10 w-full",
                        selectedFilters.sizes.includes(size) && "bg-black text-white"
                      )}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Apply Filters Button */}
            <div className="sticky bottom-0 bg-white pt-4 border-t">
              <Button 
                className="w-full bg-black text-white hover:bg-gray-800 h-12 text-lg"
                onClick={() => {
                  // Apply filters logic here
                  setIsFiltersOpen(false);
                }}
              >
                Apply Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">
                    {Object.values(selectedFilters).flat().filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Spacer for bottom nav */}
      <div className="h-16 md:hidden" />
    </>
  );
}