import 'server-only';
import Stripe from 'stripe';
import { keys } from './keys';

// Create a mock Stripe instance for when Stripe is not configured
const createMockStripe = () => ({
  // Add common Stripe methods that might be used
  customers: {
    create: () => Promise.resolve({}),
    retrieve: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    list: () => Promise.resolve({ data: [] }),
  },
  paymentIntents: {
    create: () => Promise.resolve({}),
    retrieve: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    confirm: () => Promise.resolve({}),
    cancel: () => Promise.resolve({}),
  },
  subscriptions: {
    create: () => Promise.resolve({}),
    retrieve: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    cancel: () => Promise.resolve({}),
    list: () => Promise.resolve({ data: [] }),
  },
  webhooks: {
    constructEvent: () => ({
      id: 'mock_event',
      object: 'event',
      api_version: '2025-04-30.basil',
      created: Date.now(),
      type: 'checkout.session.completed',
      data: {
        object: {},
        previous_attributes: {},
      },
      livemode: false,
      pending_webhooks: 0,
      request: { id: null, idempotency_key: null },
    }),
  },
});

const env = keys();
const stripeSecretKey = env.STRIPE_SECRET_KEY;

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-04-30.basil',
    })
  : createMockStripe();

export type { Stripe } from 'stripe';
