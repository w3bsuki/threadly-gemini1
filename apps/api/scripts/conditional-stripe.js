#!/usr/bin/env node

// Conditional stripe script for API app
// Only runs stripe listen if stripe CLI is installed

const { execSync } = require('child_process');

try {
  // Check if stripe CLI is installed
  execSync('which stripe', { stdio: 'ignore' });
  console.log('✅ Stripe CLI found, starting webhook listener...');
  execSync('stripe listen --forward-to localhost:3002/webhooks/payments', { stdio: 'inherit' });
} catch (error) {
  console.log('⏭️ Skipping Stripe webhook listener - Stripe CLI not installed');
  console.log('ℹ️  To enable webhooks, install Stripe CLI: https://stripe.com/docs/stripe-cli');
  console.log('✅ API server running without Stripe webhook listener');
}