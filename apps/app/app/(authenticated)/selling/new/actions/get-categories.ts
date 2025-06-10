'use server';

import { database } from '@repo/database';
import { getCacheService } from '@repo/cache';

// Initialize cache service
const cache = getCacheService({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL || 'redis://localhost:6379',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || undefined,
});

export interface CategoryOption {
  id: string;
  name: string;
  parentId: string | null;
  children?: CategoryOption[];
}

export async function getCategories(): Promise<CategoryOption[]> {
  try {
    // Use cache for categories
    const categoryTree = await cache.remember(
      'categories:tree',
      async () => {
        const categories = await database.category.findMany({
          select: {
            id: true,
            name: true,
            parentId: true,
          },
          orderBy: {
            name: 'asc',
          },
        });

        // Organize into hierarchy - parent categories first
        const parentCategories = categories.filter(cat => cat.parentId === null);
        const childCategories = categories.filter(cat => cat.parentId !== null);

        const tree: CategoryOption[] = parentCategories.map(parent => ({
          ...parent,
          children: childCategories.filter(child => child.parentId === parent.id),
        }));

        return tree;
      },
      3600 // Cache for 1 hour
    );

    return categoryTree;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function getCategoriesFlat(): Promise<CategoryOption[]> {
  try {
    // Skip cache for now - just get directly from database
    const categories = await database.category.findMany({
      where: {
        parentId: null, // Only top-level categories for now
      },
      select: {
        id: true,
        name: true,
        parentId: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return categories;
  } catch (error) {
    console.error('Error fetching flat categories:', error);
    return [];
  }
}