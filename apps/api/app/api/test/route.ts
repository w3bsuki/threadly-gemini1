import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@repo/database/generated/client';

// Create a direct Prisma client for testing
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    // Test endpoint for database connectivity
    
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
    // Don't expose error details in production
    return NextResponse.json({
      success: false,
      error: 'Database connection failed'
    }, { status: 500 });
  }
}