import { Button } from '@repo/design-system/components/ui/button';
import { Heart, Eye, MapPin, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Mock data - in real app this would come from API
const trendingProducts = [
  {
    id: 1,
    title: 'Vintage Levi\'s 501 Jeans',
    brand: 'Levi\'s',
    price: 45,
    originalPrice: 120,
    condition: 'Very Good',
    size: '32',
    images: ['/api/placeholder/300/400'],
    seller: {
      name: 'Sarah M.',
      rating: 4.9,
      location: 'London'
    },
    likes: 127,
    views: 892,
    timeAgo: '2 hours ago'
  },
  {
    id: 2,
    title: 'Zara Floral Summer Dress',
    brand: 'Zara',
    price: 28,
    originalPrice: 89,
    condition: 'Like New',
    size: 'M',
    images: ['/api/placeholder/300/400'],
    seller: {
      name: 'Emma K.',
      rating: 4.8,
      location: 'Manchester'
    },
    likes: 89,
    views: 445,
    timeAgo: '4 hours ago'
  },
  {
    id: 3,
    title: 'Nike Air Max 90 Sneakers',
    brand: 'Nike',
    price: 65,
    originalPrice: 150,
    condition: 'Good',
    size: 'UK 8',
    images: ['/api/placeholder/300/400'],
    seller: {
      name: 'Mike R.',
      rating: 4.7,
      location: 'Birmingham'
    },
    likes: 203,
    views: 1247,
    timeAgo: '1 day ago'
  },
  {
    id: 4,
    title: 'Coach Leather Handbag',
    brand: 'Coach',
    price: 180,
    originalPrice: 450,
    condition: 'Very Good',
    size: 'One Size',
    images: ['/api/placeholder/300/400'],
    seller: {
      name: 'Lisa H.',
      rating: 5.0,
      location: 'Edinburgh'
    },
    likes: 156,
    views: 678,
    timeAgo: '3 hours ago'
  },
  {
    id: 5,
    title: 'H&M Oversized Blazer',
    brand: 'H&M',
    price: 22,
    originalPrice: 79,
    condition: 'Good',
    size: 'L',
    images: ['/api/placeholder/300/400'],
    seller: {
      name: 'Jenna S.',
      rating: 4.6,
      location: 'Bristol'
    },
    likes: 74,
    views: 321,
    timeAgo: '6 hours ago'
  },
  {
    id: 6,
    title: 'Vintage Band T-Shirt',
    brand: 'Vintage',
    price: 35,
    originalPrice: null,
    condition: 'Very Good',
    size: 'M',
    images: ['/api/placeholder/300/400'],
    seller: {
      name: 'Alex T.',
      rating: 4.9,
      location: 'Liverpool'
    },
    likes: 91,
    views: 567,
    timeAgo: '5 hours ago'
  }
];

const ConditionBadge = ({ condition }: { condition: string }) => {
  const colors = {
    'Like New': 'bg-green-100 text-green-800',
    'Very Good': 'bg-blue-100 text-blue-800',
    'Good': 'bg-yellow-100 text-yellow-800',
    'Fair': 'bg-orange-100 text-orange-800'
  };
  
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${colors[condition as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
      {condition}
    </span>
  );
};

export const TrendingProducts = () => {
  return (
    <section className="w-full bg-gray-50 py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-bold text-3xl tracking-tight md:text-5xl">
            Trending Now
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Discover the most popular items that everyone's talking about
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {trendingProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group relative overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              {/* Product Image */}
              <div className="aspect-[3/4] overflow-hidden">
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  width={300}
                  height={400}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Favorite Button */}
                <button 
                  className="absolute top-3 right-3 rounded-full bg-white/80 p-2 backdrop-blur-sm transition-all hover:bg-white"
                  aria-label="Add to favorites"
                >
                  <Heart className="h-4 w-4 text-gray-600" />
                </button>

                {/* Condition Badge */}
                <div className="absolute top-3 left-3">
                  <ConditionBadge condition={product.condition} />
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="mb-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{product.brand}</p>
                  <h3 className="font-medium text-gray-900 line-clamp-2">{product.title}</h3>
                </div>

                <div className="mb-3 flex items-center gap-2">
                  <span className="font-bold text-lg text-gray-900">£{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">£{product.originalPrice}</span>
                  )}
                </div>

                <div className="mb-3 text-sm text-gray-600">
                  Size {product.size}
                </div>

                {/* Seller Info */}
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600">{product.seller.rating}</span>
                  </div>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-600">{product.seller.name}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{product.seller.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{product.views}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View More Button */}
        <div className="mt-12 text-center">
          <Button 
            size="lg" 
            className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 text-lg text-white hover:from-purple-700 hover:to-pink-700"
            asChild
          >
            <Link href="/products">
              View All Trending Items
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}; 