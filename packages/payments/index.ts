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
    constructEvent: () => ({}),
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
