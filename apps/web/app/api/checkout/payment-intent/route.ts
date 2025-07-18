import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { z } from 'zod';
import { log, logError } from '@repo/observability/server';
import { stripe, calculatePlatformFee, isStripeConfigured } from '@repo/payments';

const createPaymentIntentSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0),
  })),
  costs: z.object({
    subtotal: z.number(),
    shipping: z.number(),
    tax: z.number(),
    total: z.number(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Payment processing is not configured' },
        { status: 503 }
      );
    }

    // Authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createPaymentIntentSchema.parse(body);

    // Get database user
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate products and check availability
    const productIds = validatedData.items.map(item => item.productId);
    const products = await database.product.findMany({
      where: {
        id: { in: productIds },
        status: 'AVAILABLE',
      },
      include: {
        seller: true,
      },
    });

    if (products.length !== validatedData.items.length) {
      return NextResponse.json(
        { error: 'One or more products are not available' },
        { status: 400 }
      );
    }

    // Calculate platform fee (5% of subtotal)
    const platformFeeInCents = calculatePlatformFee(validatedData.costs.subtotal * 100);

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(validatedData.costs.total * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId: dbUser.id,
        orderType: 'cart_checkout',
        itemCount: validatedData.items.length.toString(),
        // Store item details in metadata for later order creation
        items: JSON.stringify(validatedData.items),
        costs: JSON.stringify(validatedData.costs),
      },
      application_fee_amount: platformFeeInCents, // Platform fee in cents
    });

    log.info('Successfully created payment intent', {
      paymentIntentId: paymentIntent.id,
      userId: dbUser.id,
      total: validatedData.costs.total,
    });

    return NextResponse.json({
      success: true,
      paymentIntent: {
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id,
      },
    });

  } catch (error) {
    logError('Failed to create payment intent', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}