'use server';

import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// SECURITY: Enhanced validation schema with stricter rules
const createProductSchema = z.object({
  title: z.string().trim().min(3).max(100)
    .refine((val) => !/[<>\"'&]/.test(val), { message: "Title contains invalid characters" }),
  description: z.string().trim().min(10).max(2000),
  price: z.number().min(1).max(99999999),
  categoryId: z.string().uuid("Invalid category ID"),
  condition: z.enum(['NEW_WITH_TAGS', 'NEW_WITHOUT_TAGS', 'VERY_GOOD', 'GOOD', 'SATISFACTORY']),
  brand: z.string().trim().max(50).optional()
    .refine((val) => !val || !/[<>\"'&]/.test(val), { message: "Brand contains invalid characters" }),
  size: z.string().max(20).optional(),
  color: z.string().max(30).optional(),
  images: z.array(z.string().url()).min(1).max(10),
  sellerId: z.string(),
});

// SECURITY: Server-side DOM sanitization utility
function createSecureDOMPurify() {
  const window = new JSDOM('').window;
  return DOMPurify(window as any);
}

// SECURITY: Comprehensive input sanitization
function sanitizeUserInput(input: z.infer<typeof createProductSchema>) {
  const purify = createSecureDOMPurify();
  
  return {
    ...input,
    title: purify.sanitize(input.title.trim(), { ALLOWED_TAGS: [] }),
    description: purify.sanitize(input.description.trim(), { 
      ALLOWED_TAGS: [], 
      ALLOWED_ATTR: [] 
    }),
    brand: input.brand ? purify.sanitize(input.brand.trim(), { ALLOWED_TAGS: [] }) : null,
    size: input.size ? purify.sanitize(input.size.trim(), { ALLOWED_TAGS: [] }) : null,
    color: input.color ? purify.sanitize(input.color.trim(), { ALLOWED_TAGS: [] }) : null,
  };
}

export async function createProduct(input: z.infer<typeof createProductSchema>) {
  try {
    // Verify user authentication
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }

    // First, ensure user exists in our database
    let dbUser = await database.user.findUnique({
      where: { clerkId: user.id }
    });

    if (!dbUser) {
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

    // SECURITY: Validate and sanitize input
    const validatedInput = createProductSchema.parse(input);
    const sanitizedData = sanitizeUserInput(validatedInput);

    // Create the product in the database
    const product = await database.product.create({
      data: {
        title: sanitizedData.title,
        description: sanitizedData.description,
        price: sanitizedData.price, // Price is already in cents from form
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
    
    // Product created successfully

    return {
      success: true,
      product,
    };

  } catch (error) {
    // Log error for monitoring (replace with proper error tracking)
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to create product:', error);
    }
    
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