'use server';

import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { 
  productConditionSchema,
} from '@repo/validation/schemas/product';
import {
  priceCentsSchema,
  safeTextSchema,
  cuidSchema,
} from '@repo/validation/schemas/common';
import { 
  sanitizeForDisplay, 
  sanitizeHtml,
  filterProfanity,
  containsProfanity,
} from '@repo/validation/sanitize';
import { 
  isValidProductTitle,
  isAllowedImageUrl,
  isPriceInRange,
} from '@repo/validation/validators';

const createProductSchema = z.object({
  title: z.string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be at most 100 characters')
    .refine((text) => !/<[^>]*>/.test(text), {
      message: 'HTML tags are not allowed',
    })
    .refine((title) => isValidProductTitle(title), {
      message: 'Invalid product title format',
    })
    .refine((title) => !containsProfanity(title), {
      message: 'Product title contains inappropriate content',
    }),
  description: z.string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be at most 2000 characters')
    .refine((text) => !/<[^>]*>/.test(text), {
      message: 'HTML tags are not allowed',
    }),
  price: z.number().min(1, 'Price must be at least 1 cent').max(99999999, 'Price must be less than $999,999.99'),
  categoryId: cuidSchema,
  condition: productConditionSchema,
  brand: z.string().trim().max(50).optional(),
  size: z.string().max(20).optional(),
  color: z.string().max(30).optional(),
  images: z.array(
    z.string()
      .refine((url) => url.startsWith('data:image/') || url.startsWith('http'), {
        message: 'Invalid image format',
      })
  ).min(1, 'At least one image is required').max(10, 'Maximum 10 images allowed'),
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

    // Sanitize user input
    const sanitizedData = {
      ...validatedInput,
      title: filterProfanity(sanitizeForDisplay(validatedInput.title)),
      description: sanitizeHtml(validatedInput.description, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: [],
      }),
      brand: validatedInput.brand ? sanitizeForDisplay(validatedInput.brand) : null,
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