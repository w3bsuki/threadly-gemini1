import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@repo/database/generated/client';

// Create a direct Prisma client for testing
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    console.log('Test endpoint called');
    
    // Test direct database connection
    const categoryCount = await prisma.category.count();
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: true,
        _count: {
          select: { products: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        message: 'Database connection successful!',
        categoryCount,
        rootCategories: categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          childrenCount: cat.children.length,
          productCount: cat._count.products
        }))
      }
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}