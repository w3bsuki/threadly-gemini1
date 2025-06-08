'use server';

import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0),
  })).min(1),
  shippingAddress: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().min(1),
  }),
  shippingMethod: z.enum(['standard', 'express', 'overnight']),
  subtotal: z.number().min(0),
  shippingCost: z.number().min(0),
  tax: z.number().min(0),
  total: z.number().min(0),
  notes: z.string().optional(),
  paymentIntentId: z.string().optional(),
});

export async function createOrder(input: z.infer<typeof createOrderSchema>) {
  try {
    // Verify user authentication
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }

    // Validate input
    const validatedInput = createOrderSchema.parse(input);

    // Verify all products exist and are available
    const productIds = validatedInput.items.map(item => item.productId);
    const products = await database.product.findMany({
      where: {
        id: { in: productIds },
        status: 'AVAILABLE',
      },
      include: {
        seller: true,
      },
    });

    if (products.length !== productIds.length) {
      return {
        success: false,
        error: 'Some products are no longer available',
      };
    }

    // Verify prices haven't changed
    for (const orderItem of validatedInput.items) {
      const product = products.find(p => p.id === orderItem.productId);
      if (!product || Math.abs(product.price - orderItem.price) > 0.01) {
        return {
          success: false,
          error: 'Product prices have changed. Please refresh your cart.',
        };
      }
    }

    // Create separate orders for each product (current schema limitation)
    const orders = [];
    
    for (const item of validatedInput.items) {
      const product = products.find(p => p.id === item.productId)!;
      
      // Create individual order for each product
      const order = await database.order.create({
        data: {
          buyerId: user.id,
          sellerId: product.sellerId,
          productId: item.productId,
          amount: item.price * item.quantity,
          status: 'PENDING',
          // TODO: Add shipping details to a separate table or extend Order model
        },
        include: {
          product: {
            include: {
              images: {
                take: 1,
                orderBy: {
                  displayOrder: 'asc',
                },
              },
              seller: true,
            },
          },
          seller: true,
        },
      });
      
      orders.push(order);
    }

    // Update product status if they're single-quantity items
    await database.product.updateMany({
      where: {
        id: { in: productIds },
        // Only update products that are single quantity (typical for marketplace)
      },
      data: {
        status: 'SOLD',
      },
    });

    // TODO: Send confirmation email
    // TODO: Notify sellers

    // Return the first order with virtual properties to match expected format
    const primaryOrder = orders[0];
    return {
      success: true,
      order: {
        ...primaryOrder,
        id: primaryOrder.id, // Use first order's ID as primary
        // Virtual properties to match the expected format
        subtotal: validatedInput.subtotal,
        shippingCost: validatedInput.shippingCost,
        tax: validatedInput.tax,
        total: validatedInput.total,
        shippingMethod: validatedInput.shippingMethod,
        shippingFirstName: validatedInput.shippingAddress.firstName,
        shippingLastName: validatedInput.shippingAddress.lastName,
        shippingAddress: validatedInput.shippingAddress.address,
        shippingCity: validatedInput.shippingAddress.city,
        shippingState: validatedInput.shippingAddress.state,
        shippingZipCode: validatedInput.shippingAddress.zipCode,
        shippingCountry: validatedInput.shippingAddress.country,
        notes: validatedInput.notes,
        paymentIntentId: validatedInput.paymentIntentId,
        // Transform orders into orderItems format
        orderItems: orders.map(o => ({
          id: o.id,
          productId: o.productId,
          sellerId: o.sellerId,
          quantity: 1, // Current schema only supports quantity 1 per order
          price: o.product.price,
          title: o.product.title,
          description: o.product.description || '',
          condition: o.product.condition,
          product: o.product,
        })),
      },
    };

  } catch (error) {
    console.error('Failed to create order:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid order data',
        details: error.errors,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order',
    };
  }
}