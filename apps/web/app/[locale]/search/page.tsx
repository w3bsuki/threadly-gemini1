import type { Metadata } from "next";
import { getDictionary } from "@repo/internationalization";
import { database, ProductStatus } from '@repo/database';
import { ProductGridClient } from '../../../components/product-grid-client';
import { notFound } from 'next/navigation';

// Transform database product to UI format
function transformProduct(
  product: any
): any {
  return {
    id: product.id,
    title: product.title,
    brand: product.brand || 'Unknown',
    price: product.price,
    originalPrice: undefined,
    size: product.size || 'One Size',
    condition: product.condition,
    category: product.category?.name || 'Other',
    gender: 'unisex',
    images: product.images
      .sort((a: any, b: any) => a.displayOrder - b.displayOrder)
      .map((img: any) => img.imageUrl),
    seller: {
      id: product.seller.id,
      name: `${product.seller.firstName} ${product.seller.lastName || ''}`.trim() || 'Anonymous',
      location: product.seller.location || 'Unknown',
      rating: product.seller.averageRating || 4.5,
    },
    isLiked: false,
    isDesigner: product.brand ? [
      'GUCCI', 'PRADA', 'CHANEL', 'LOUIS VUITTON', 'VERSACE', 
      'DIOR', 'BALENCIAGA', 'HERMÈS', 'SAINT LAURENT', 'BOTTEGA VENETA'
    ].some(brand => product.brand!.toUpperCase().includes(brand)) : false,
    uploadedAgo: getTimeAgo(product.createdAt),
    _count: product._count || { favorites: 0 },
  };
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ 
    q?: string;
    category?: string;
    brand?: string;
    size?: string;
    minPrice?: string;
    maxPrice?: string;
    condition?: string;
    sort?: string;
  }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const { q: query = '' } = await searchParams;
  const dictionary = await getDictionary(locale);
  
  return {
    title: query ? `Search results for "${query}" - Threadly` : "Search - Threadly",
    description: query ? `Find products matching "${query}" on Threadly marketplace` : "Search for clothing and accessories",
  };
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { locale } = await params;
  const searchParams_ = await searchParams;
  const query = searchParams_.q || '';
  const dictionary = await getDictionary(locale);

  try {
    // Build search query
    const whereClause: any = {
      status: ProductStatus.AVAILABLE,
    };

    // Add search query if provided
    if (query) {
      whereClause.OR = [
        { title: { contains: query } },
        { description: { contains: query } },
        { brand: { contains: query } },
      ];
    }

    // Add category filter
    if (searchParams_.category && searchParams_.category !== 'all') {
      const categoryRecord = await database.category.findFirst({
        where: {
          OR: [
            { name: { equals: searchParams_.category } },
            { slug: { equals: searchParams_.category } }
          ]
        }
      });
      if (categoryRecord) {
        whereClause.categoryId = categoryRecord.id;
      }
    }

    // Add other filters
    if (searchParams_.brand) {
      whereClause.brand = { equals: searchParams_.brand };
    }
    if (searchParams_.size) {
      whereClause.size = searchParams_.size;
    }
    if (searchParams_.condition) {
      whereClause.condition = searchParams_.condition;
    }

    // Add price range filters
    if (searchParams_.minPrice || searchParams_.maxPrice) {
      whereClause.price = {};
      if (searchParams_.minPrice) {
        whereClause.price.gte = parseInt(searchParams_.minPrice) * 100; // Convert to cents
      }
      if (searchParams_.maxPrice) {
        whereClause.price.lte = parseInt(searchParams_.maxPrice) * 100; // Convert to cents
      }
    }

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' }; // Default: newest first
    if (searchParams_.sort === 'price-asc') {
      orderBy = { price: 'asc' };
    } else if (searchParams_.sort === 'price-desc') {
      orderBy = { price: 'desc' };
    }

    // Fetch products
    const products = await database.product.findMany({
      where: whereClause,
      include: {
        images: {
          orderBy: { displayOrder: 'asc' }
        },
        seller: true,
        category: true,
        _count: {
          select: { favorites: true }
        }
      },
      orderBy,
      take: 48, // Show more results on search page
    });

    // Transform products
    const transformedProducts = products.map(transformProduct);

    // Get filter options
    const categories = await database.category.findMany({
      select: { name: true },
      where: {
        products: {
          some: { status: ProductStatus.AVAILABLE }
        }
      },
    });

    const brands = await database.product.groupBy({
      by: ['brand'],
      where: { 
        status: ProductStatus.AVAILABLE,
        brand: { not: null }
      },
      _count: true,
      orderBy: { _count: { brand: 'desc' } },
      take: 20,
    });

    const sizes = await database.product.groupBy({
      by: ['size'],
      where: { 
        status: ProductStatus.AVAILABLE,
        size: { not: null }
      },
      _count: true,
      orderBy: { _count: { size: 'desc' } },
      take: 20,
    });

    const filterOptions = {
      categories: categories.map(c => c.name),
      brands: brands.map(b => b.brand).filter(Boolean) as string[],
      sizes: sizes.map(s => s.size).filter(Boolean) as string[],
      totalCount: products.length
    };

    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {query ? `Search results for "${query}"` : 'All Products'}
            </h1>
            <p className="text-gray-600">
              {products.length} {products.length === 1 ? 'item' : 'items'} found
            </p>
          </div>

          {/* Product Grid */}
          <ProductGridClient 
            initialProducts={transformedProducts}
            filterOptions={filterOptions}
            defaultCategory={searchParams_.category}
          />
        </div>
      </div>
    );

  } catch (error) {
    console.error('Search error:', error);
    
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Search unavailable
          </h1>
          <p className="text-gray-600 mb-8">
            We're having trouble with search right now. Please try again later.
          </p>
          <a 
            href="/" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800"
          >
            Return home
          </a>
        </div>
      </div>
    );
  }
}