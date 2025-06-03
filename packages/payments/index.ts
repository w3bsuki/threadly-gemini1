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
    constructEvent: (): Stripe.Event => ({
      id: 'evt_mock_event',
      object: 'event',
      api_version: '2025-04-30.basil',
      created: Math.floor(Date.now() / 1000),
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_mock_session',
          object: 'checkout.session',
          adaptive_pricing: null,
          after_expiration: null,
          allow_promotion_codes: null,
          amount_subtotal: 0,
          amount_total: 0,
          automatic_tax: { enabled: false, liability: null, status: null, provider: null },
          billing_address_collection: null,
          cancel_url: 'https://example.com/cancel',
          client_reference_id: null,
          client_secret: null,
          collected_information: null,
          consent: null,
          consent_collection: null,
          created: Math.floor(Date.now() / 1000),
          currency: 'usd',
          currency_conversion: null,
          custom_fields: [],
          custom_text: {
            after_submit: null,
            shipping_address: null,
            submit: null,
            terms_of_service_acceptance: null,
          },
          customer: 'cus_mock_customer',
          customer_creation: null,
          customer_details: null,
          customer_email: null,
          discounts: [],
          expires_at: Math.floor(Date.now() / 1000) + 86400,
          invoice: null,
          invoice_creation: null,
          livemode: false,
          locale: null,
          metadata: {},
          mode: 'subscription',
          payment_intent: null,
          payment_link: null,
          payment_method_collection: 'if_required',
          payment_method_configuration_details: null,
          payment_method_options: null,
          payment_method_types: ['card'],
          payment_status: 'paid',
          permissions: null,
          phone_number_collection: { enabled: false },
          recovered_from: null,
          redirect_on_completion: 'if_required',
          saved_payment_method_options: null,
          setup_intent: null,
          shipping_address_collection: null,
          shipping_cost: null,
          shipping_details: null,
          shipping_options: [],
          status: 'complete',
          submit_type: null,
          subscription: null,
          success_url: 'https://example.com/success',
          tax_id_collection: { enabled: false, required: 'if_supported' },
          total_details: {
            amount_discount: 0,
            amount_shipping: 0,
            amount_tax: 0,
          },
          ui_mode: 'hosted',
          url: null,
          wallet_options: null,
        } as Stripe.Checkout.Session,
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
