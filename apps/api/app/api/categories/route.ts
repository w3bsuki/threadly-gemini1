import { database } from '@repo/database';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/categories - List all categories with hierarchy
export async function GET(request: NextRequest) {
  try {
    // Fetch categories with hierarchy
    const categories = await database.category.findMany({
      orderBy: [
        { parentId: 'asc' }, // Parent categories first
        { name: 'asc' },
      ],
      include: {
        children: {
          orderBy: { name: 'asc' },
          include: {
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
        },
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
    });

    // Organize into parent/child structure
    const rootCategories = categories.filter(cat => !cat.parentId);
    
    return NextResponse.json({
      success: true,
      data: {
        categories: rootCategories,
        allCategories: categories, // Flat list for easy lookup
      },
    });
  } catch (error) {
    // Log error without exposing sensitive details
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
      },
      { status: 500 }
    );
  }
}