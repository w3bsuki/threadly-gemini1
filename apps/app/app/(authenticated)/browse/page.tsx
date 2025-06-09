import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '../components/header';
import { BrowseContent } from './components/browse-content';

const title = 'Browse Products';
const description = 'Discover amazing items from our community';

export const metadata: Metadata = {
  title,
  description,
};

interface BrowsePageProps {
  searchParams: Promise<{
    category?: string;
    condition?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    search?: string;
  }>;
}

const BrowsePage = async ({ searchParams }: BrowsePageProps) => {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const params = await searchParams;
  
  // Build where clause based on filters
  const where: any = {
    status: 'AVAILABLE',
  };

  if (params.category) {
    where.categoryId = params.category;
  }

  if (params.condition) {
    where.condition = params.condition;
  }

  if (params.minPrice || params.maxPrice) {
    where.price = {};
    if (params.minPrice) {
      where.price.gte = parseFloat(params.minPrice);
    }
    if (params.maxPrice) {
      where.price.lte = parseFloat(params.maxPrice);
    }
  }

  if (params.search) {
    where.OR = [
      { title: { contains: params.search } },
      { description: { contains: params.search } },
      { brand: { contains: params.search } },
    ];
  }

  // Determine sort order
  const orderBy: any = {};
  switch (params.sort) {
    case 'price-asc':
      orderBy.price = 'asc';
      break;
    case 'price-desc':
      orderBy.price = 'desc';
      break;
    case 'newest':
      orderBy.createdAt = 'desc';
      break;
    case 'oldest':
      orderBy.createdAt = 'asc';
      break;
    default:
      orderBy.createdAt = 'desc';
  }

  // Fetch products with filters
  const [products, categories, totalCount] = await Promise.all([
    database.product.findMany({
      where,
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
          take: 1,
        },
        category: true,
        seller: true,
        _count: {
          select: {
            favorites: true,
          },
        },
      },
      orderBy,
      take: 20, // Pagination can be added later
    }),
    
    // Get categories for filter
    database.category.findMany({
      where: {
        parent: {
          isNot: null,
        },
      },
      include: {
        parent: true,
        _count: {
          select: {
            products: {
              where: {
                status: 'AVAILABLE',
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    }),

    // Get total count for the current filter
    database.product.count({ where }),
  ]);

  // Get user's favorites
  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id },
    include: {
      favorites: {
        select: {
          productId: true,
        },
      },
    },
  });

  const favoriteProductIds = dbUser?.favorites.map(f => f.productId) || [];

  return (
    <>
      <Header pages={['Dashboard', 'Browse']} page="Browse" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Browse Products</h1>
          <p className="text-muted-foreground">
            Discover {totalCount} amazing items from our community
          </p>
        </div>
        
        <BrowseContent 
          products={products}
          categories={categories}
          favoriteProductIds={favoriteProductIds}
          currentFilters={params}
          totalCount={totalCount}
        />
      </div>
    </>
  );
};

export default BrowsePage;