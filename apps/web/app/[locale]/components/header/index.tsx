'use client';

import { env } from '@/env';
import { Button } from '@repo/design-system/components/ui/button';
import { Search, Heart, Menu, X, User, ShoppingBag, Crown, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import type { Dictionary } from '@repo/internationalization';

type HeaderProps = {
  dictionary: Dictionary;
};

const categories = [
  { name: "All", href: "/" },
  { name: "Women", href: "/women" },
  { name: "Men", href: "/men" },
  { name: "Kids", href: "/kids" },
  { name: "Unisex", href: "/unisex" },
  { name: "Designer", href: "/designer", isDesigner: true },
];

const subCategories = [
  "T-shirts", "Shirts", "Jackets", "Dresses", "Jeans", 
  "Sweaters", "Coats", "Sneakers", "Boots", "Bags", 
  "Watches", "Jewelry", "Belts"
];

// Collections for desktop "Shop by Type"
const collections = [
  { name: "Clothing", href: "/collections/clothing", icon: "👕" },
  { name: "Shoes", href: "/collections/shoes", icon: "👟" },
  { name: "Jewelry", href: "/collections/jewelry", icon: "💎" },
  { name: "Bags", href: "/collections/bags", icon: "👜" },
  { name: "Accessories", href: "/collections/accessories", icon: "⌚" },
  { name: "Home", href: "/collections/home", icon: "🏠" },
];

export const Header = ({ dictionary }: HeaderProps) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSubCategories, setShowSubCategories] = useState(true);

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="font-bold text-xl text-black hidden sm:block">
                  Threadly
                </span>
              </Link>
            </div>

            {/* Center: Search Bar (Desktop) */}
            <div className="flex-1 max-w-2xl mx-8 hidden md:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for items, brands, or members"
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-black focus:border-black text-sm"
                />
                {searchQuery && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-4">
              {/* Desktop Actions */}
              <div className="hidden md:flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-black">
                  <Heart className="h-5 w-5 mr-1" />
                  Favourites
                </Button>
                
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-black" asChild>
                  <Link href={`${env.NEXT_PUBLIC_APP_URL}/sign-in`}>
                    <User className="h-5 w-5 mr-1" />
                    Sign in
                  </Link>
                </Button>
                
                <Button 
                  size="sm" 
                  className="bg-black text-white hover:bg-gray-800 font-medium"
                  asChild
                >
                  <Link href="/sell">
                    Sell now
                  </Link>
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="sm"
                className="md:hidden"
                onClick={() => setMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for items, brands, or members"
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-black focus:border-black text-sm"
              />
            </div>
          </div>

          {/* Mobile Category Pills - Horizontal Scroll */}
          <div className="md:hidden pb-3">
            <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="flex-shrink-0"
                >
                  <Button
                    variant={category.name === "All" ? "default" : "outline"}
                    size="sm"
                    className={`whitespace-nowrap ${
                      category.name === "All"
                        ? "bg-black text-white hover:bg-gray-800"
                        : category.isDesigner
                        ? "border-amber-400 text-amber-700 bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 font-medium"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {category.isDesigner && <Crown className="h-3 w-3 mr-1" />}
                    {category.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Sub-Categories */}
          <div className="md:hidden pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Shop by Type</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSubCategories(!showSubCategories)}
                className="text-xs text-gray-500 p-1 h-auto"
              >
                <ChevronDown className={`h-3 w-3 transition-transform ${showSubCategories ? 'rotate-180' : ''}`} />
              </Button>
            </div>
            {showSubCategories && (
              <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
                {subCategories.map((subCategory) => (
                  <Link
                    key={subCategory}
                    href={`/categories/items/${subCategory.toLowerCase()}`}
                    className="flex-shrink-0"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap text-xs border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                      {subCategory}
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Categories Navigation */}
        <div className="border-t border-gray-100 bg-gray-50 hidden md:block">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between py-3">
              {/* Main Categories */}
              <div className="flex items-center space-x-8">
                {categories.slice(1).map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    className={`text-sm font-medium transition-colors flex items-center ${
                      category.isDesigner
                        ? "text-amber-700 hover:text-amber-800 font-semibold"
                        : "text-gray-700 hover:text-black"
                    }`}
                  >
                    {category.isDesigner && <Crown className="h-4 w-4 mr-1" />}
                    {category.name}
                  </Link>
                ))}
              </div>
              
              {/* Collections - Shop by Type */}
              <div className="flex items-center space-x-6">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Shop by Type</span>
                {collections.map((collection) => (
                  <Link
                    key={collection.name}
                    href={collection.href}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-black transition-colors"
                  >
                    <span className="text-base">{collection.icon}</span>
                    <span>{collection.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Actions */}
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start text-gray-700" asChild>
                  <Link href="/favourites">
                    <Heart className="h-5 w-5 mr-2" />
                    Favourites
                  </Link>
                </Button>
                
                <Button variant="ghost" className="w-full justify-start text-gray-700" asChild>
                  <Link href={`${env.NEXT_PUBLIC_APP_URL}/sign-in`}>
                    <User className="h-5 w-5 mr-2" />
                    Sign in
                  </Link>
                </Button>
                
                <Button className="w-full bg-black text-white hover:bg-gray-800" asChild>
                  <Link href="/sell">
                    Sell now
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
