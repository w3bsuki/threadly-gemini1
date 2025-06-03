'use client';

import { ChevronDown, Grid } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface CategoryNavProps {
  category: 'men' | 'women' | 'kids' | 'unisex';
  title: string;
  description: string;
}

const subcategories = {
  men: {
    clothing: [
      { name: 'T-shirts & Tops', href: '/men/t-shirts' },
      { name: 'Shirts', href: '/men/shirts' },
      { name: 'Hoodies & Sweatshirts', href: '/men/hoodies' },
      { name: 'Jeans', href: '/men/jeans' },
      { name: 'Trousers', href: '/men/trousers' },
      { name: 'Jackets & Coats', href: '/men/jackets' },
      { name: 'Shorts', href: '/men/shorts' },
      { name: 'Suits', href: '/men/suits' },
    ],
    shoes: [
      { name: 'Sneakers', href: '/men/sneakers' },
      { name: 'Boots', href: '/men/boots' },
      { name: 'Formal Shoes', href: '/men/formal-shoes' },
      { name: 'Sandals', href: '/men/sandals' },
      { name: 'Trainers', href: '/men/trainers' },
    ],
    accessories: [
      { name: 'Bags', href: '/men/bags' },
      { name: 'Watches', href: '/men/watches' },
      { name: 'Belts', href: '/men/belts' },
      { name: 'Wallets', href: '/men/wallets' },
      { name: 'Sunglasses', href: '/men/sunglasses' },
      { name: 'Jewelry', href: '/men/jewelry' },
    ]
  },
  women: {
    clothing: [
      { name: 'Dresses', href: '/women/dresses' },
      { name: 'Tops & T-shirts', href: '/women/tops' },
      { name: 'Jeans', href: '/women/jeans' },
      { name: 'Skirts', href: '/women/skirts' },
      { name: 'Jackets & Coats', href: '/women/jackets' },
      { name: 'Knitwear', href: '/women/knitwear' },
      { name: 'Trousers', href: '/women/trousers' },
      { name: 'Lingerie & Sleepwear', href: '/women/lingerie' },
    ],
    shoes: [
      { name: 'Heels', href: '/women/heels' },
      { name: 'Boots', href: '/women/boots' },
      { name: 'Sneakers', href: '/women/sneakers' },
      { name: 'Flats', href: '/women/flats' },
      { name: 'Sandals', href: '/women/sandals' },
    ],
    accessories: [
      { name: 'Bags & Purses', href: '/women/bags' },
      { name: 'Jewelry', href: '/women/jewelry' },
      { name: 'Scarves', href: '/women/scarves' },
      { name: 'Belts', href: '/women/belts' },
      { name: 'Sunglasses', href: '/women/sunglasses' },
      { name: 'Watches', href: '/women/watches' },
    ]
  },
  kids: {
    clothing: [
      { name: 'T-shirts & Tops', href: '/kids/t-shirts' },
      { name: 'Dresses', href: '/kids/dresses' },
      { name: 'Jeans', href: '/kids/jeans' },
      { name: 'Jackets & Coats', href: '/kids/jackets' },
      { name: 'Shorts', href: '/kids/shorts' },
      { name: 'Sleepwear', href: '/kids/sleepwear' },
    ],
    shoes: [
      { name: 'Sneakers', href: '/kids/sneakers' },
      { name: 'Boots', href: '/kids/boots' },
      { name: 'Sandals', href: '/kids/sandals' },
      { name: 'School Shoes', href: '/kids/school-shoes' },
    ],
    accessories: [
      { name: 'Bags', href: '/kids/bags' },
      { name: 'Toys', href: '/kids/toys' },
      { name: 'Hair Accessories', href: '/kids/hair-accessories' },
    ]
  },
  unisex: {
    clothing: [
      { name: 'T-shirts & Tops', href: '/unisex/t-shirts' },
      { name: 'Hoodies & Sweatshirts', href: '/unisex/hoodies' },
      { name: 'Jeans', href: '/unisex/jeans' },
      { name: 'Joggers', href: '/unisex/joggers' },
      { name: 'Jackets & Coats', href: '/unisex/jackets' },
      { name: 'Oversized Items', href: '/unisex/oversized' },
    ],
    shoes: [
      { name: 'Sneakers', href: '/unisex/sneakers' },
      { name: 'Boots', href: '/unisex/boots' },
      { name: 'Sandals', href: '/unisex/sandals' },
      { name: 'Slip-ons', href: '/unisex/slip-ons' },
    ],
    accessories: [
      { name: 'Bags', href: '/unisex/bags' },
      { name: 'Watches', href: '/unisex/watches' },
      { name: 'Sunglasses', href: '/unisex/sunglasses' },
      { name: 'Hats & Caps', href: '/unisex/hats' },
      { name: 'Jewelry', href: '/unisex/jewelry' },
    ]
  }
};

export const CategoryNav = ({ category, title, description }: CategoryNavProps) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const categoryData = subcategories[category];

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span>/</span>
          <span className="text-gray-900 capitalize">{category}</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>

      {/* Navigation Dropdowns */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center space-x-8 pb-4">
          {/* Clothing Dropdown */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'clothing' ? null : 'clothing')}
              className="flex items-center space-x-1 py-2 text-sm font-medium text-gray-900 hover:text-gray-700"
            >
              <span>Clothing</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {activeDropdown === 'clothing' && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  {categoryData.clothing.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                      onClick={() => setActiveDropdown(null)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Shoes Dropdown */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'shoes' ? null : 'shoes')}
              className="flex items-center space-x-1 py-2 text-sm font-medium text-gray-900 hover:text-gray-700"
            >
              <span>Shoes</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {activeDropdown === 'shoes' && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  {categoryData.shoes.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                      onClick={() => setActiveDropdown(null)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Accessories Dropdown */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'accessories' ? null : 'accessories')}
              className="flex items-center space-x-1 py-2 text-sm font-medium text-gray-900 hover:text-gray-700"
            >
              <span>Accessories</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {activeDropdown === 'accessories' && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  {categoryData.accessories.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                      onClick={() => setActiveDropdown(null)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* All Categories Link */}
          <Link 
            href={`/${category}`}
            className="flex items-center space-x-1 py-2 text-sm font-medium text-gray-900 hover:text-gray-700"
          >
            <Grid className="h-4 w-4" />
            <span>All {category}</span>
          </Link>
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
}; 