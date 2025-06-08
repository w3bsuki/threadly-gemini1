import { database } from '@repo/database';
import { ProductGridClient } from './product-grid-client';

interface ProductGridServerProps {
  defaultCategory?: string;
  limit?: number;
}

export async function ProductGridServer({ 
  defaultCategory, 
  limit = 20 
}: ProductGridServerProps) {
  try {
    // Build where clause
    const where: any = {
      status: 'AVAILABLE',
    };

    // Fetch products with all necessary relations
    const products = await database.product.findMany({
      where,
      include: {
        images: {
          orderBy: { order: 'asc' },
          take: 1,
        },
        category: {
          include: {
            parent: true,
          },
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
            location: true,
            averageRating: true,
          },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Fetch categories for filters
    const categories = await database.category.findMany({
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
    });

    // Transform products to match the expected format
    const transformedProducts = products.map((product) => ({
      id: product.id,
      title: product.title,
      brand: product.brand || 'Unknown',
      price: product.price,
      originalPrice: null, // We don't have this in our schema
      size: product.size || 'One Size',
      condition: product.condition,
      categoryId: product.categoryId,
      categoryName: product.category?.name || 'Unknown',
      parentCategoryName: product.category?.parent?.name,
      images: product.images.map(img => img.imageUrl),
      seller: product.seller ? {
        id: product.seller.id,
        name: `${product.seller.firstName || ''} ${product.seller.lastName || ''}`.trim() || 'Anonymous',
        location: product.seller.location || 'Unknown',
        rating: product.seller.averageRating || 0,
      } : {
        id: 'unknown',
        name: 'Anonymous',
        location: 'Unknown',
        rating: 0,
      },
      favoritesCount: product._count.favorites,
      createdAt: product.createdAt,
    }));

    return (
      <ProductGridClient 
        initialProducts={transformedProducts}
        categories={categories}
        defaultCategory={defaultCategory}
      />
    );
  } catch (error) {
    console.error('Failed to fetch products:', error);
    
    // Return empty state component
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Unable to load products</p>
          <p className="text-gray-400 text-sm">Please try again later</p>
        </div>
      </div>
    );
  }
}