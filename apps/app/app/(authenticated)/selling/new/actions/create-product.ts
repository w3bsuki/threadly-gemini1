'use server';

import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import { z } from 'zod';
// Temporarily remove complex validation imports to isolate issue

const createProductSchema = z.object({
  title: z.string().trim().min(3).max(100),
  description: z.string().trim().min(10).max(2000),
  price: z.number().min(1).max(99999999),
  categoryId: z.string(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'NEW_WITH_TAGS', 'NEW_WITHOUT_TAGS', 'VERY_GOOD', 'SATISFACTORY']),
  brand: z.string().trim().max(50).optional(),
  size: z.string().max(20).optional(),
  color: z.string().max(30).optional(),
  images: z.array(z.string().url()).min(1).max(10),
  sellerId: z.string(),
});

export async function createProduct(input: z.infer<typeof createProductSchema>) {
  try {
    console.log('Creating product with input:', JSON.stringify(input, null, 2));
    // Verify user authentication
    const user = await currentUser();
    if (!user) {
      console.error('User not authenticated');
      redirect('/sign-in');
    }
    
    console.log('Authenticated Clerk user:', user.id);

    // First, ensure user exists in our database
    let dbUser = await database.user.findUnique({
      where: { clerkId: user.id }
    });

    if (!dbUser) {
      console.log('User not found in database, creating...');
      dbUser = await database.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
        }
      });
    }

    console.log('Database user:', dbUser.id);

    // Validate input
    console.log('Validating input against schema...');
    const validatedInput = createProductSchema.parse(input);
    console.log('Input validation passed');

    // Simple sanitization without complex imports
    const sanitizedData = {
      ...validatedInput,
      title: validatedInput.title.trim(),
      description: validatedInput.description.trim(),
      brand: validatedInput.brand?.trim() || null,
    };

    console.log('Creating product in database...');
    
    // Create the product in the database
    const product = await database.product.create({
      data: {
        title: sanitizedData.title,
        description: sanitizedData.description,
        price: sanitizedData.price / 100, // Convert cents to dollars for database
        categoryId: sanitizedData.categoryId,
        condition: sanitizedData.condition,
        brand: sanitizedData.brand,
        size: sanitizedData.size || null,
        color: sanitizedData.color || null,
        sellerId: dbUser.id, // Use the database user ID, not Clerk ID
        status: 'AVAILABLE',
        // Remove manual date setting - let Prisma handle it
        images: {
          create: sanitizedData.images.map((url, index) => ({
            imageUrl: url,
            alt: `${sanitizedData.title} - Image ${index + 1}`,
            displayOrder: index,
          })),
        },
      },
      include: {
        images: true,
        category: true,
        seller: true,
      },
    });
    
    console.log('Product created successfully:', product.id);

    return {
      success: true,
      product,
    };

  } catch (error) {
    console.error('Failed to create product:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        details: error.errors,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create product',
    };
  }
}