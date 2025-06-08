'use server';

import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  username: z.string().min(3).max(30).optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
});

const updateAddressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(5),
  country: z.string().min(1),
});

const updateNotificationSchema = z.object({
  emailMarketing: z.boolean(),
  emailOrders: z.boolean(),
  emailMessages: z.boolean(),
  emailUpdates: z.boolean(),
  pushNotifications: z.boolean(),
  pushMessages: z.boolean(),
  pushOffers: z.boolean(),
});

export async function updateUserProfile(input: z.infer<typeof updateProfileSchema>) {
  try {
    // Verify user authentication
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }

    // Validate input
    const validatedInput = updateProfileSchema.parse(input);

    // Note: In a real implementation, you would update the user profile through Clerk's API
    // Since we're using Clerk for authentication, user profile updates need to be done through their API
    // For now, we'll just store additional marketplace-specific data in our database

    // Create or update user profile data in our database
    await database.user.upsert({
      where: {
        id: user.id,
      },
      create: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        firstName: validatedInput.firstName,
        lastName: validatedInput.lastName,
        username: validatedInput.username,
        bio: validatedInput.bio,
        phone: validatedInput.phone,
        website: validatedInput.website,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        firstName: validatedInput.firstName,
        lastName: validatedInput.lastName,
        username: validatedInput.username,
        bio: validatedInput.bio,
        phone: validatedInput.phone,
        website: validatedInput.website,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
    };

  } catch (error) {
    console.error('Failed to update user profile:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        details: error.errors,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile',
    };
  }
}

export async function updateShippingAddress(input: z.infer<typeof updateAddressSchema>) {
  try {
    // Verify user authentication
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }

    // Validate input
    const validatedInput = updateAddressSchema.parse(input);

    // Store the address data for future use
    // In a real app, you might want to store this in a separate user_addresses table
    // For now, we'll update the user record with the default shipping address
    await database.user.upsert({
      where: {
        id: user.id,
      },
      create: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        firstName: validatedInput.firstName,
        lastName: validatedInput.lastName,
        defaultShippingAddress: JSON.stringify(validatedInput),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        defaultShippingAddress: JSON.stringify(validatedInput),
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
    };

  } catch (error) {
    console.error('Failed to update shipping address:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        details: error.errors,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update address',
    };
  }
}

export async function updateNotificationSettings(input: z.infer<typeof updateNotificationSchema>) {
  try {
    // Verify user authentication
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }

    // Validate input
    const validatedInput = updateNotificationSchema.parse(input);

    // Store notification preferences in our database
    await database.user.upsert({
      where: {
        id: user.id,
      },
      create: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        notificationSettings: JSON.stringify(validatedInput),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        notificationSettings: JSON.stringify(validatedInput),
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
    };

  } catch (error) {
    console.error('Failed to update notification settings:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        details: error.errors,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update notification settings',
    };
  }
}