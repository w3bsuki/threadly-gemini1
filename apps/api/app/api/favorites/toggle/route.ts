import { database } from '@repo/database';
import { currentUser } from '@repo/auth/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const toggleFavoriteSchema = z.object({
  productId: z.string().min(1),
});

// POST /api/favorites/toggle - Toggle favorite status
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = toggleFavoriteSchema.parse(body);

    // Check if product exists
    const product = await database.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check current favorite status
    const existingFavorite = await database.favorite.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    let isFavorited: boolean;
    let message: string;

    if (existingFavorite) {
      // Remove favorite
      await database.favorite.delete({
        where: {
          userId_productId: {
            userId: user.id,
            productId,
          },
        },
      });
      isFavorited = false;
      message = 'Product removed from favorites';
    } else {
      // Add favorite
      await database.favorite.create({
        data: {
          userId: user.id,
          productId,
        },
      });
      isFavorited = true;
      message = 'Product added to favorites';
    }

    // Get updated favorite count
    const favoriteCount = await database.favorite.count({
      where: { productId },
    });

    return NextResponse.json({
      message,
      isFavorited,
      favoriteCount,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error toggling favorite:', error);
    return NextResponse.json(
      { error: 'Failed to toggle favorite' },
      { status: 500 }
    );
  }
}