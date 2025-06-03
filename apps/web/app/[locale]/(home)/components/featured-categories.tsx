import { Button } from '@repo/design-system/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const categories = [
  {
    id: 'womens',
    name: "Women's Fashion",
    description: 'Dresses, tops, jeans & more',
    image: '/api/placeholder/400/500',
    href: '/categories/womens',
    color: 'from-pink-500 to-rose-500',
    count: '15.2k items'
  },
  {
    id: 'mens',
    name: "Men's Fashion", 
    description: 'Shirts, pants, jackets & more',
    image: '/api/placeholder/400/500',
    href: '/categories/mens',
    color: 'from-blue-500 to-indigo-500',
    count: '8.7k items'
  },
  {
    id: 'accessories',
    name: 'Accessories',
    description: 'Bags, jewelry, watches & more',
    image: '/api/placeholder/400/500', 
    href: '/categories/accessories',
    color: 'from-purple-500 to-violet-500',
    count: '12.1k items'
  },
  {
    id: 'shoes',
    name: 'Shoes',
    description: 'Sneakers, heels, boots & more',
    image: '/api/placeholder/400/500',
    href: '/categories/shoes',
    color: 'from-orange-500 to-red-500',
    count: '9.8k items'
  },
  {
    id: 'vintage',
    name: 'Vintage',
    description: 'Unique retro & vintage finds',
    image: '/api/placeholder/400/500',
    href: '/categories/vintage',
    color: 'from-emerald-500 to-teal-500',
    count: '4.5k items'
  },
  {
    id: 'designer',
    name: 'Designer',
    description: 'Luxury & high-end brands',
    image: '/api/placeholder/400/500',
    href: '/categories/designer',
    color: 'from-amber-500 to-yellow-500',
    count: '2.3k items'
  }
];

export const FeaturedCategories = () => {
  return (
    <section className="w-full py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-bold text-3xl tracking-tight md:text-5xl">
            Shop by Category
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Find exactly what you're looking for in our curated fashion categories
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Background Image */}
              <div className="aspect-[4/5] overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={400}
                  height={500}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-20 transition-opacity duration-300 group-hover:opacity-30`} />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6 text-white">
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="mb-1 font-bold text-xl">{category.name}</h3>
                    <p className="mb-2 text-sm text-white/80">{category.description}</p>
                    <span className="text-xs text-white/60">{category.count}</span>
                  </div>
                  <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/30">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Categories Button */}
        <div className="mt-12 text-center">
          <Button 
            size="lg" 
            variant="outline" 
            className="gap-2 border-gray-200 px-8 py-6 text-lg hover:bg-gray-50"
            asChild
          >
            <Link href="/categories">
              View All Categories
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}; 