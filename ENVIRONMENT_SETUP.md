# 🔧 Environment Setup Guide

This guide will help you set up all the required environment variables and API keys to run your Vinted marketplace clone.

## 📋 Required Services & API Keys

### 1. **Authentication (Clerk)** - REQUIRED
- Sign up at [clerk.com](https://clerk.com)
- Create a new application
- Get your keys from the dashboard

### 2. **Database (Neon)** - REQUIRED  
- Sign up at [neon.tech](https://neon.tech)
- Create a new PostgreSQL database
- Get your connection string

### 3. **Payments (Stripe)** - REQUIRED for marketplace
- Sign up at [stripe.com](https://stripe.com)
- Get your API keys (use test keys for development)

### 4. **Email (Resend)** - RECOMMENDED
- Sign up at [resend.com](https://resend.com)
- Get your API key

### 5. **File Storage (Uploadthing)** - REQUIRED for images
- Sign up at [uploadthing.com](https://uploadthing.com)
- Get your API keys

### 6. **Analytics (PostHog)** - OPTIONAL
- Sign up at [posthog.com](https://posthog.com)
- Get your project API key

### 7. **Monitoring (Sentry)** - OPTIONAL
- Sign up at [sentry.io](https://sentry.io)
- Create a new project and get DSN

## 🔑 Environment Variables Setup

Create a `.env.local` file in the `apps/app` directory with the following variables:

```bash
# === REQUIRED FOR BASIC FUNCTIONALITY ===

# Clerk Authentication (REQUIRED)
CLERK_SECRET_KEY=sk_test_your-secret-key-here
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-publishable-key-here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database (REQUIRED)
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require

# Stripe Payments (REQUIRED for marketplace)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Uploadthing for Images (REQUIRED)
UPLOADTHING_SECRET=sk_live_your-uploadthing-secret
UPLOADTHING_APP_ID=your-app-id

# === RECOMMENDED FOR FULL FUNCTIONALITY ===

# Email (Resend)
RESEND_API_KEY=re_your-resend-api-key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Feature Flags (Vercel)
FLAGS_SECRET=your-flags-secret

# === OPTIONAL FOR ENHANCED FEATURES ===

# Analytics (PostHog)
NEXT_PUBLIC_POSTHOG_KEY=phc_your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Monitoring (Sentry)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Security (Arcjet)
ARCJET_KEY=ajkey_your-arcjet-key

# Collaboration (Liveblocks)
LIVEBLOCKS_SECRET_KEY=sk_dev_your-liveblocks-key
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_dev_your-liveblocks-key

# Notifications (Knock)
KNOCK_API_KEY=sk_live_your-knock-api-key
NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY=pk_live_your-knock-public-key
KNOCK_SIGNING_KEY=your-knock-signing-key

# Webhooks (Svix)
SVIX_API_KEY=sk_your-svix-api-key
SVIX_WEBHOOK_SECRET=whsec_your-svix-webhook-secret
```

## 🚀 Quick Start (Minimal Setup)

For a minimal development setup, you only need these 4 services:

1. **Clerk** (Authentication)
2. **Neon** (Database) 
3. **Stripe** (Payments)
4. **Uploadthing** (File uploads)

## 📝 Step-by-Step Setup

### 1. Clerk Authentication Setup
1. Go to [clerk.com](https://clerk.com) and sign up
2. Create a new application
3. Go to "API Keys" in the dashboard
4. Copy the "Secret key" and "Publishable key"
5. Add them to your `.env.local` file

### 2. Neon Database Setup
1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Go to "Dashboard" → "Connection Details"
4. Copy the connection string
5. Add it as `DATABASE_URL` in your `.env.local` file

### 3. Stripe Payments Setup
1. Go to [stripe.com](https://stripe.com) and sign up
2. Go to "Developers" → "API keys"
3. Use the test keys for development
4. Copy "Secret key" and "Publishable key"
5. Add them to your `.env.local` file

### 4. Uploadthing Setup
1. Go to [uploadthing.com](https://uploadthing.com) and sign up
2. Create a new app
3. Go to "API Keys"
4. Copy your secret and app ID
5. Add them to your `.env.local` file

## 🔄 After Setup

Once you've created your `.env.local` file:

1. Run database migrations:
   ```bash
   cd apps/app
   pnpm migrate
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Visit:
   - Main app: http://localhost:3000
   - Web landing: http://localhost:3001  
   - Storybook: http://localhost:6006
   - Docs: http://localhost:3002

## 🎯 Marketplace-Specific Considerations

For our Vinted clone, make sure to:

1. **Enable Stripe Connect** in your Stripe dashboard for marketplace payments
2. **Configure Clerk** with custom user fields for seller profiles
3. **Set up Uploadthing** with appropriate file size limits for product images
4. **Configure email templates** in Resend for order confirmations

## 🐛 Troubleshooting

- If you get authentication errors, check your Clerk keys
- If database errors occur, verify your DATABASE_URL
- For payment issues, ensure Stripe keys are correct
- For image upload problems, check Uploadthing configuration

## 🔐 Security Notes

- Never commit your `.env.local` file to version control
- Use test keys for development
- Switch to production keys only when deploying
- Regularly rotate your API keys 