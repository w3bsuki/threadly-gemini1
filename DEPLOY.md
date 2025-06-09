# 🚀 THREADLY PRODUCTION DEPLOYMENT GUIDE

*Everything you need to deploy Threadly to production*

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ Required Services Setup

#### 1. **Database (PostgreSQL)**
```bash
# Option A: Neon (Recommended)
# 1. Create account at neon.tech
# 2. Create new project
# 3. Copy connection string
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Option B: Supabase
# 1. Create project at supabase.com
# 2. Go to Settings > Database
# 3. Copy connection string
```

#### 2. **Authentication (Clerk)**
```bash
# Production keys from clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# Required URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"
```

#### 3. **Payments (Stripe)**
```bash
# Production keys from stripe.com
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Enable in Stripe Dashboard:
# - Payment Intents API
# - Stripe Connect
# - Webhooks for: payment_intent.succeeded, account.updated
```

#### 4. **File Storage (UploadThing)**
```bash
# From uploadthing.com
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="your-app-id"
NEXT_PUBLIC_UPLOADTHING_APP_ID="your-app-id"
```

#### 5. **Email (Resend)**
```bash
# From resend.com
RESEND_API_KEY="re_..."
RESEND_FROM="noreply@threadly.com"
EMAIL_FROM="noreply@threadly.com"
```

#### 6. **Search (Algolia)**
```bash
# From algolia.com
NEXT_PUBLIC_ALGOLIA_APP_ID="..."
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY="..."
ALGOLIA_ADMIN_KEY="..."
NEXT_PUBLIC_ALGOLIA_INDEX_NAME="products"
```

---

## 🔧 DEPLOYMENT STEPS

### Step 1: Environment Setup

1. **Clone and prepare**
```bash
git clone https://github.com/yourusername/threadly.git
cd threadly
pnpm install
```

2. **Create production .env**
```bash
cp .env.example .env.production
# Edit with production values
```

3. **Test locally with production env**
```bash
pnpm build
pnpm start
```

### Step 2: Database Setup

```bash
# 1. Set production DATABASE_URL
export DATABASE_URL="your-production-url"

# 2. Push schema to production
pnpm db:push

# 3. Verify connection
pnpm db:studio

# 4. (Optional) Seed initial data
pnpm db:seed
```

### Step 3: Vercel Deployment

#### A. Initial Setup
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Link project
vercel link
```

#### B. Configure Project
```bash
# Set up each app
vercel --prod --scope your-team

# When prompted:
# - Set up as monorepo
# - Root directory: ./
# - Build command: pnpm build
# - Install command: pnpm install
```

#### C. Environment Variables
```bash
# Option 1: Via CLI
vercel env add DATABASE_URL production
vercel env add CLERK_SECRET_KEY production
# ... add all required vars

# Option 2: Via Dashboard
# Go to: vercel.com/project/settings/environment-variables
# Add all variables from .env.example
```

#### D. Deploy Apps
```bash
# Deploy main app
vercel --prod --scope your-team --project app

# Deploy web app  
vercel --prod --scope your-team --project web

# Deploy API (if separate)
vercel --prod --scope your-team --project api
```

### Step 4: Post-Deployment

#### 1. **Configure Webhooks**

**Clerk Webhooks:**
- URL: `https://app.threadly.com/api/webhooks/auth`
- Events: user.created, user.updated, user.deleted

**Stripe Webhooks:**
- URL: `https://app.threadly.com/api/webhooks/payments`
- Events: payment_intent.succeeded, account.updated

#### 2. **Set Up Monitoring**

```bash
# Sentry
SENTRY_DSN="https://..."
NEXT_PUBLIC_SENTRY_DSN="https://..."
SENTRY_AUTH_TOKEN="..."
SENTRY_ORG="your-org"
SENTRY_PROJECT="threadly"
```

#### 3. **Configure Domain**

```bash
# In Vercel Dashboard:
# 1. Go to Settings > Domains
# 2. Add custom domains:
#    - threadly.com → web app
#    - app.threadly.com → main app
#    - api.threadly.com → api app
```

---

## 🔍 VERIFICATION CHECKLIST

### Essential Features Test
- [ ] User can sign up/sign in
- [ ] User can create a product listing
- [ ] Images upload successfully  
- [ ] Search returns results
- [ ] User can add to cart
- [ ] Checkout completes successfully
- [ ] Payment processes correctly
- [ ] Order is created in database
- [ ] Seller receives notification
- [ ] Messages work in real-time

### Performance Checks
```bash
# Run Lighthouse
# Target scores:
# - Performance: > 90
# - Accessibility: > 95
# - SEO: > 100
# - Best Practices: > 90
```

### Security Audit
- [ ] All API routes require authentication
- [ ] Input validation on all forms
- [ ] Rate limiting enabled
- [ ] CORS configured correctly
- [ ] Environment variables not exposed
- [ ] HTTPS enforced everywhere

---

## 🚨 COMMON ISSUES & FIXES

### Build Failures

**Issue**: "Module not found"
```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
pnpm build
```

**Issue**: "Invalid environment variables"
```bash
# Check all required vars are set
vercel env ls

# Ensure NEXT_PUBLIC_ vars are available at build time
vercel env add NEXT_PUBLIC_APP_URL production
```

### Runtime Errors

**Issue**: "Database connection failed"
```bash
# Verify DATABASE_URL includes SSL
DATABASE_URL="postgresql://...?sslmode=require"

# Check connection limits
# Neon: 100 connections
# Add connection pooling if needed
```

**Issue**: "Stripe webhook failed"
```bash
# Verify webhook secret matches
# Check webhook endpoint URL
# Ensure raw body parsing for Stripe
```

---

## 📊 PRODUCTION CONFIGURATION

### Recommended Settings

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['uploadthing.com', 'utfs.io'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,
  },
}
```

### Performance Optimizations

1. **Enable ISR**
```javascript
export const revalidate = 3600; // 1 hour
```

2. **Configure Caching**
```javascript
// Cache static assets for 1 year
public, max-age=31536000, immutable

// Cache API responses for 5 minutes
s-maxage=300, stale-while-revalidate
```

3. **Image Optimization**
```javascript
// Use next/image everywhere
import Image from 'next/image';

// Configure sizes
sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
```

---

## 🔐 SECURITY HARDENING

### Environment Variables
```bash
# Never commit .env files
echo ".env*" >> .gitignore

# Use different keys for each environment
STRIPE_SECRET_KEY_DEV="sk_test_..."
STRIPE_SECRET_KEY_PROD="sk_live_..."
```

### API Security
```javascript
// Rate limiting
import { rateLimit } from '@repo/security';

export const runtime = 'edge';
export const config = {
  matcher: '/api/:path*',
};

// CORS
const allowedOrigins = [
  'https://threadly.com',
  'https://app.threadly.com'
];
```

### Database Security
```sql
-- Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_status ON products(status);
```

---

## 📈 MONITORING & ANALYTICS

### Setup Monitoring
```bash
# Better Stack
BETTERSTACK_API_KEY="..."
BETTERSTACK_URL="..."

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

### Key Metrics to Track
- Page load time < 2s
- API response time < 200ms
- Error rate < 1%
- Uptime > 99.9%
- Conversion rate > 2%

---

## 🆘 EMERGENCY PROCEDURES

### Rollback Deployment
```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback <deployment-url>
```

### Database Backup
```bash
# Create backup
pg_dump $DATABASE_URL > backup.sql

# Restore from backup
psql $DATABASE_URL < backup.sql
```

### Disable Features
```javascript
// Feature flags for quick disable
if (process.env.FEATURE_PAYMENTS === 'false') {
  return <MaintenanceMode />;
}
```

---

## 📞 SUPPORT CONTACTS

- **Vercel Support**: support.vercel.com
- **Clerk Support**: support@clerk.dev
- **Stripe Support**: support.stripe.com
- **Database Issues**: Check provider docs

---

*Deployment guide v1.0 - Update after each deployment*