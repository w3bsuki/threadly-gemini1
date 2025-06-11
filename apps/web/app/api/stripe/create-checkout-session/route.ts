import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { stripe, calculatePlatformFee, isStripeConfigured } from '@repo/payments';
import { paymentRateLimit, checkRateLimit } from '@repo/security';
import { z } from 'zod';

const createCheckoutSessionSchema = z.object({
  productId: z.string().min(1),
  sellerId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(paymentRateLimit, request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.error?.message || 'Rate limit exceeded' },
        { 
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }

    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Payment processing is not configured' },
        { status: 503 }
      );
    }

    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // SECURITY: Get database user to ensure proper ID comparison
    const user = await database.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { productId, sellerId } = createCheckoutSessionSchema.parse(body);

    // Verify product exists and is available
    const product = await database.product.findUnique({
      where: {
        id: productId,
        status: 'AVAILABLE',
      },
      include: {
        seller: {
          select: {
            stripeAccountId: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not available' },
        { status: 404 }
      );
    }

    // SECURITY: Proper ID comparison - database user ID vs database seller ID
    if (product.sellerId === user.id) {
      return NextResponse.json(
        { error: 'Cannot purchase your own product' },
        { status: 400 }
      );
    }

    // Create order with PENDING status
    const order = await database.order.create({
      data: {
        buyerId: user.id,
        sellerId: product.sellerId,
        productId: product.id,
        amount: product.price,
        status: 'PENDING',
      },
    });

    // Calculate fees
    const amountInCents = Math.round(product.price * 100);
    const platformFeeInCents = Math.round(calculatePlatformFee(product.price) * 100);
    
    // Create payment intent parameters
    const paymentIntentParams: any = {
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        orderId: order.id,
        productId: product.id,
        buyerId: user.id,
        sellerId: product.sellerId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    };

    // If seller has connected Stripe account, set up the transfer
    if (product.seller.stripeAccountId) {
      paymentIntentParams.application_fee_amount = platformFeeInCents;
      paymentIntentParams.transfer_data = {
        destination: product.seller.stripeAccountId,
      };
    }
    // Otherwise, the platform will handle manual payouts later

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    // Update order with payment intent ID
    await database.order.update({
      where: { id: order.id },
      data: { paymentIntentId: paymentIntent.id },
    });

    // Mark product as RESERVED to prevent double purchases
    await database.product.update({
      where: { id: productId },
      data: { status: 'RESERVED' },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
    });

  } catch (error) {
    console.error('Checkout session creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}