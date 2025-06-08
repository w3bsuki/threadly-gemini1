import { env } from '@/env';
import { analytics } from '@repo/analytics/posthog/server';
import { clerkClient } from '@repo/auth/server';
import { database } from '@repo/database';
import { parseError } from '@repo/observability/error';
import { log } from '@repo/observability/log';
import { stripe } from '@repo/payments';
import type { Stripe } from '@repo/payments';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

const getUserFromCustomerId = async (customerId: string) => {
  const clerk = await clerkClient();
  const users = await clerk.users.getUserList();

  const user = users.data.find(
    (user) => user.privateMetadata.stripeCustomerId === customerId
  );

  return user;
};

const handleCheckoutSessionCompleted = async (
  data: Stripe.Checkout.Session
) => {
  if (!data.customer) {
    return;
  }

  const customerId =
    typeof data.customer === 'string' ? data.customer : data.customer.id;
  const user = await getUserFromCustomerId(customerId);

  if (!user) {
    return;
  }

  analytics.capture({
    event: 'User Subscribed',
    distinctId: user.id,
  });
};

const handleSubscriptionScheduleCanceled = async (
  data: Stripe.SubscriptionSchedule
) => {
  if (!data.customer) {
    return;
  }

  const customerId =
    typeof data.customer === 'string' ? data.customer : data.customer.id;
  const user = await getUserFromCustomerId(customerId);

  if (!user) {
    return;
  }

  analytics.capture({
    event: 'User Unsubscribed',
    distinctId: user.id,
  });
};

const handlePaymentIntentSucceeded = async (
  paymentIntent: Stripe.PaymentIntent
) => {
  try {
    log.info('Payment intent succeeded', { 
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      metadata: paymentIntent.metadata 
    });

    // Extract order details from metadata
    const { buyerId, productId, sellerId, orderId } = paymentIntent.metadata;

    if (!orderId) {
      log.error('No orderId in payment intent metadata', { paymentIntentId: paymentIntent.id });
      return;
    }

    // Start a transaction to update order, product, and create payment
    const result = await database.$transaction(async (tx) => {
      // Update order status to PAID
      const order = await tx.order.update({
        where: { id: orderId },
        data: { 
          status: 'PAID',
        },
      });

      // Mark product as SOLD
      await tx.product.update({
        where: { id: productId },
        data: { 
          status: 'SOLD',
        },
      });

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          stripePaymentId: paymentIntent.id,
          amount: paymentIntent.amount / 100, // Convert from cents
          status: 'completed',
        },
      });

      return { order, payment };
    });

    // Track in analytics
    analytics.capture({
      event: 'Order Paid',
      distinctId: buyerId,
      properties: {
        orderId: result.order.id,
        amount: paymentIntent.amount / 100,
        productId,
        sellerId,
      },
    });

    log.info('Order payment processed successfully', { 
      orderId: result.order.id,
      productId,
      buyerId,
      sellerId 
    });
  } catch (error) {
    log.error('Error processing payment intent', { 
      error, 
      paymentIntentId: paymentIntent.id 
    });
    throw error;
  }
};

export const POST = async (request: Request): Promise<Response> => {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ message: 'Not configured', ok: false });
  }

  try {
    const body = await request.text();
    const headerPayload = await headers();
    const signature = headerPayload.get('stripe-signature');

    if (!signature) {
      throw new Error('missing stripe-signature header');
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'payment_intent.succeeded': {
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      }
      case 'checkout.session.completed': {
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      }
      case 'subscription_schedule.canceled': {
        await handleSubscriptionScheduleCanceled(event.data.object);
        break;
      }
      default: {
        log.warn(`Unhandled event type ${event.type}`);
      }
    }

    await analytics.shutdown();

    return NextResponse.json({ result: event, ok: true });
  } catch (error) {
    const message = parseError(error);

    log.error(message);

    return NextResponse.json(
      {
        message: 'something went wrong',
        ok: false,
      },
      { status: 500 }
    );
  }
};
