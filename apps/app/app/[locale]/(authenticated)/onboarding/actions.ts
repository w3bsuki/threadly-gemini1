'use server';

import { database } from '@repo/database';
import type { UserPreferenceRole } from '@repo/database';
import { revalidatePath } from 'next/cache';

export async function getUserPreferences(clerkId: string) {
  try {
    const user = await database.user.findUnique({
      where: { clerkId },
      include: { preferences: true },
    });
    
    return user?.preferences || null;
  } catch (error) {
    console.error('Failed to get user preferences:', error);
    return null;
  }
}

export async function saveUserPreferences(
  clerkId: string,
  data: {
    preferredRole: UserPreferenceRole;
    interests: string[];
    favoriteBrands: string[];
    location: string;
    onboardingCompleted: boolean;
  }
) {
  try {
    const user = await database.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    await database.userPreferences.upsert({
      where: { userId: user.id },
      update: {
        preferredRole: data.preferredRole,
        interests: data.interests,
        favoriteBrands: data.favoriteBrands,
        location: data.location || null,
        onboardingCompleted: data.onboardingCompleted,
      },
      create: {
        userId: user.id,
        preferredRole: data.preferredRole,
        interests: data.interests,
        favoriteBrands: data.favoriteBrands,
        location: data.location || null,
        onboardingCompleted: data.onboardingCompleted,
      },
    });

    revalidatePath('/onboarding');
    revalidatePath('/dashboard');
  } catch (error) {
    console.error('Failed to save user preferences:', error);
    throw new Error('Failed to save preferences');
  }
}

export async function getCategories() {
  try {
    const categories = await database.category.findMany({
      orderBy: { name: 'asc' },
    });
    
    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
    }));
  } catch (error) {
    console.error('Failed to get categories:', error);
    return [];
  }
}