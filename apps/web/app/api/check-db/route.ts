import { database } from '@repo/database';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get counts
    const stats = {
      users: await database.user.count(),
      products: await database.product.count(),
      availableProducts: await database.product.count({
        where: { status: 'AVAILABLE' }
      }),
      categories: await database.category.count(),
      orders: await database.order.count(),
      reviews: await database.review.count(),
    };
    
    // Get sample products
    const sampleProducts = await database.product.findMany({
      take: 5,
      include: {
        images: true,
        category: true,
        seller: true,
      }
    });
    
    return NextResponse.json({
      success: true,
      stats,
      sampleProducts,
      diagnosis: stats.products === 0 
        ? 'No products in database - run pnpm seed'
        : stats.availableProducts === 0
        ? 'Products exist but none are AVAILABLE'
        : 'Database has products'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}