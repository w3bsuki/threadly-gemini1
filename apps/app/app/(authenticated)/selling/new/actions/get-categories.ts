'use server';

import { database } from '@repo/database';

export interface CategoryOption {
  id: string;
  name: string;
  parentId: string | null;
  children?: CategoryOption[];
}

export async function getCategories(): Promise<CategoryOption[]> {
  try {
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

    const categoryTree: CategoryOption[] = parentCategories.map(parent => ({
      ...parent,
      children: childCategories.filter(child => child.parentId === parent.id),
    }));

    return categoryTree;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function getCategoriesFlat(): Promise<CategoryOption[]> {
  try {
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