import { Button } from '@repo/design-system/components/ui/button';
import { Clock, Heart, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Mock data for new arrivals
const newArrivals = [
  {
    id: 7,
    title: 'Reformation Silk Slip Dress',
    brand: 'Reformation',
    price: 89,
    condition: 'Like New',
    size: 'S',
    images: ['/api/placeholder/400/500'],
    seller: 'Maya L.',
    timeAgo: '15 minutes ago',
    isNew: true
  },
  {
    id: 8,
    title: 'Acne Studios Wool Scarf',
    brand: 'Acne Studios',
    price: 125,
    condition: 'Very Good',
    size: 'One Size',
    images: ['/api/placeholder/400/500'],
    seller: 'Oliver K.',
    timeAgo: '32 minutes ago',
    isNew: true
  },
  {
    id: 9,
    title: 'Ganni Floral Midi Skirt',
    brand: 'Ganni',
    price: 67,
    condition: 'Good',
    size: 'M',
    images: ['/api/placeholder/400/500'],
    seller: 'Sophie R.',
    timeAgo: '1 hour ago',
    isNew: true
  },
  {
    id: 10,
    title: 'Stone Island Hoodie',
    brand: 'Stone Island',
    price: 198,
    condition: 'Very Good',
    size: 'L',
    images: ['/api/placeholder/400/500'],
    seller: 'James M.',
    timeAgo: '2 hours ago',
    isNew: false
  }
];

export const NewArrivals = () => {
  return (
    <section className="w-full py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="mb-4 font-bold text-3xl tracking-tight md:text-5xl">
              Fresh Finds
            </h2>
            <p className="max-w-2xl text-lg text-gray-600">
              Just landed! The latest additions to our marketplace
            </p>
          </div>
          <Button variant="outline" className="hidden md:flex gap-2" asChild>
            <Link href="/products?sort=newest">
              View All New
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* New Arrivals Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {newArrivals.map((item) => (
            <Link
              key={item.id}
              href={`/products/${item.id}`}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
            >
              {/* Image Container */}
              <div className="aspect-[4/5] overflow-hidden">
                <Image
                  src={item.images[0]}
                  alt={item.title}
                  width={400}
                  height={500}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* New Badge */}
                {item.isNew && (
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 text-xs font-medium text-white">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                      NEW
                    </div>
                  </div>
                )}

                {/* Heart Button */}
                <button 
                  className="absolute top-4 right-4 rounded-full bg-white/90 p-2 backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                  aria-label="Add to favorites"
                >
                  <Heart className="h-4 w-4 text-gray-600" />
                </button>

                {/* Time Badge */}
                <div className="absolute bottom-4 left-4">
                  <div className="flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-xs text-white backdrop-blur-sm">
                    <Clock className="h-3 w-3" />
                    {item.timeAgo}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-2">
                  <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                    {item.brand}
                  </p>
                  <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {item.title}
                  </h3>
                </div>

                <div className="mb-3 flex items-center justify-between">
                  <span className="font-bold text-xl text-gray-900">£{item.price}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                    Size {item.size}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">by {item.seller}</span>
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    {item.condition}
                  </span>
                </div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 text-center md:hidden">
          <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white" asChild>
            <Link href="/products?sort=newest">
              View All New Arrivals
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}; 