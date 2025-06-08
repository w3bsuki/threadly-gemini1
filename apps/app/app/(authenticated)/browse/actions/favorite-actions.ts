'use server';

import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';

export async function toggleFavorite(productId: string) {
  try {
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }

    // Get database user
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id }
    });

    if (!dbUser) {
      throw new Error('User not found in database');
    }

    // Check if already favorited
    const existingFavorite = await database.favorite.findUnique({
      where: {
        userId_productId: {
          userId: dbUser.id,
          productId: productId,
        },
      },
    });

    if (existingFavorite) {
      // Remove favorite
      await database.favorite.delete({
        where: {
          id: existingFavorite.id,
        },
      });

      return {
        success: true,
        isFavorited: false,
      };
    } else {
      // Add favorite
      await database.favorite.create({
        data: {
          userId: dbUser.id,
          productId: productId,
        },
      });

      return {
        success: true,
        isFavorited: true,
      };
    }
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle favorite',
    };
  }
}