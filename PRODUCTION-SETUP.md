# 🚀 THREADLY PRODUCTION SETUP GUIDE

*Complete guide for deploying Threadly to production*

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ Required Services
- [ ] **PostgreSQL Database** (Neon, Railway, or PlanetScale)
- [ ] **Stripe Account** (Business account for Connect)
- [ ] **Clerk Account** (Production app)
- [ ] **UploadThing Account** (File storage)
- [ ] **Resend Account** (Email service)
- [ ] **Vercel Account** (Hosting)

### ⚠️ Optional Services (Recommended)
- [ ] **Sentry** (Error tracking)
- [ ] **PostHog** (Analytics)
- [ ] **Redis** (Caching - Upstash)

---

## 🔧 1. STRIPE CONFIGURATION

### Step 1: Stripe Connect Platform Setup
```bash
# 1. Create Stripe Connect platform account
# 2. Enable Express accounts in Dashboard > Connect > Settings
# 3. Set platform fee to 5% (or adjust in packages/payments/index.ts)
```

### Step 2: Required Stripe Settings
- **Country**: US (adjust in apps/api/app/api/stripe/connect/route.ts:35)
- **Capabilities**: `card_payments`, `transfers`
- **Account Type**: Express accounts
- **Payout Schedule**: Daily (recommended)

### Step 3: Webhook Configuration
```bash
# Production webhook endpoint:
https://your-api-domain.vercel.app/webhooks/payments

# Required events:
- payment_intent.succeeded
- checkout.session.completed
- subscription_schedule.canceled
```

### Step 4: Environment Variables
```env
# Production Stripe keys (from Dashboard > Developers > API keys)
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Webhook secret (from webhook settings)
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## 💾 2. DATABASE CONFIGURATION

### PostgreSQL Production Setup
```env
# Use PostgreSQL (not SQLite) for production
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"
```

### Migration Commands
```bash
# For new production database (PostgreSQL)
pnpm migrate:prod

# Migrate from SQLite to PostgreSQL (if switching)
SQLITE_DATABASE_URL="file:./dev.db" pnpm migrate:postgres

# Deploy schema changes (production deployments)
pnpm db:migrate:deploy

# Push schema changes (development)
pnpm db:push

# Seed initial data (categories, etc.)
pnpm seed

# Verify connection and browse data
pnpm db:studio
```

### Database Environment Variables
```env
# Production PostgreSQL (REQUIRED)
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"

# Backup SQLite for migration (if needed)
SQLITE_DATABASE_URL="file:./dev.db"
```

---

## 🔐 3. AUTHENTICATION (CLERK)

### Step 1: Create Production Clerk Application
```bash
# 1. Go to https://dashboard.clerk.com
# 2. Click "Add application"
# 3. Name it "Threadly Production"
# 4. Select authentication methods (Email, Google, Apple, etc.)
```

### Step 2: Production Environment Variables
```env
# Production Clerk keys (REQUIRED)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# Domain configuration (REQUIRED for custom domains)
NEXT_PUBLIC_CLERK_DOMAIN="app.threadly.com"
NEXT_PUBLIC_CLERK_IS_SATELLITE="false"

# URL configuration (customize as needed)
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"  
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

# Enhanced security (RECOMMENDED)
CLERK_ENCRYPTION_KEY="your-32-char-encryption-key"
```

### Step 3: Domain Configuration in Clerk Dashboard
```bash
# Add these domains in Clerk Dashboard > Domains:
# - app.threadly.com (main dashboard)
# - threadly.com (marketing site)
# - api.threadly.com (API endpoints)

# Set primary domain: app.threadly.com
```

### Step 4: Webhook Configuration
```bash
# Create webhook in Clerk Dashboard:
# URL: https://api.threadly.com/webhooks/auth
# Events: user.created, user.updated, user.deleted
# Secret: Generate and add to CLERK_WEBHOOK_SECRET
```

### Step 5: Social Authentication (Optional)
- **Google OAuth**: Enable in Clerk Dashboard > SSO Connections
- **Apple Sign In**: Configure Apple Developer credentials
- **GitHub/Discord**: Add for developer audience
- **Test flow**: Verify each provider works correctly

### Step 6: Security Settings
- **Session lifetime**: 30 days (adjustable)
- **MFA requirement**: Enable for admin users
- **Password policy**: Minimum 8 characters, mixed case
- **Rate limiting**: Built into Clerk (customizable)
- **Bot protection**: Enable CAPTCHA for sign-ups

---

## 📁 4. FILE STORAGE (UPLOADTHING)

### UploadThing Production Setup
```env
# Production UploadThing keys
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_TOKEN="sk_live_..."
NEXT_PUBLIC_UPLOADTHING_APP_ID="your_app_id"
```

### File Limits Configuration
```typescript
// In packages/storage - update limits for production
maxFileSize: "8MB",        // Per image
maxFileCount: 8,           // Per product
allowedFileTypes: ["image/jpeg", "image/png", "image/webp"]
```

---

## 📧 5. EMAIL SERVICE (RESEND)

### Resend Production Setup
```env
# Production Resend keys
RESEND_TOKEN="re_..."
RESEND_FROM="noreply@yourdomain.com"
```

### DNS Configuration
```bash
# Add these DNS records for your domain:
# TXT record for domain verification
# MX records if using custom domain
```

### Email Templates
- **Order confirmation** ✅
- **Message notifications** ✅
- **Welcome email** (optional)
- **Password reset** (handled by Clerk)

---

## 🌐 6. DEPLOYMENT (VERCEL)

### Environment Variables in Vercel
```bash
# Core services (REQUIRED)
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
UPLOADTHING_SECRET="sk_live_..."
RESEND_TOKEN="re_..."

# URLs (REQUIRED)
NEXT_PUBLIC_APP_URL="https://app.threadly.com"
NEXT_PUBLIC_WEB_URL="https://threadly.com"
NEXT_PUBLIC_API_URL="https://api.threadly.com"

# Webhook secrets (REQUIRED)
CLERK_WEBHOOK_SECRET="whsec_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Optional but recommended
SENTRY_DSN="https://..."
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
```

### Domain Configuration
```bash
# Recommended domain structure:
# threadly.com          -> apps/web (marketing site)
# app.threadly.com      -> apps/app (user dashboard)
# api.threadly.com      -> apps/api (backend API)
```

---

## 🔍 7. MONITORING & ANALYTICS

### Step 1: Sentry Error Tracking Setup
```bash
# 1. Create Sentry account at https://sentry.io
# 2. Create organization and project for "Threadly"
# 3. Select "Next.js" as platform
# 4. Get DSN from Project Settings > Client Keys
```

### Step 2: Sentry Environment Variables
```env
# Sentry Configuration (REQUIRED for production)
SENTRY_DSN="https://abc123@sentry.io/project-id"
NEXT_PUBLIC_SENTRY_DSN="https://abc123@sentry.io/project-id"
SENTRY_ORG="your-org-slug"
SENTRY_PROJECT="threadly"
SENTRY_AUTH_TOKEN="your-auth-token"

# Environment tracking
SENTRY_ENVIRONMENT="production"
NEXT_PUBLIC_SENTRY_ENVIRONMENT="production"

# Release tracking (auto-populated by Vercel)
SENTRY_RELEASE="${VERCEL_GIT_COMMIT_SHA}"
NEXT_PUBLIC_SENTRY_RELEASE="${VERCEL_GIT_COMMIT_SHA}"
```

### Step 3: Sentry Dashboard Configuration
```bash
# Alerts to set up:
# - Error rate > 5% in 5 minutes
# - New critical errors
# - Performance degradation > 2x baseline
# - Database connection errors
# - Payment processing failures

# Performance monitoring:
# - 10% sampling rate in production
# - Core Web Vitals tracking
# - API response time monitoring
```

### Step 4: PostHog Analytics (Optional)
```env
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

### Step 5: Better Stack Uptime Monitoring (Optional)
```env
BETTERSTACK_API_KEY="..."
BETTERSTACK_URL="https://uptime.betterstack.com"
```

---

## 🚀 8. REDIS CACHING (OPTIONAL BUT RECOMMENDED)

### Step 1: Set Up Upstash Redis (Recommended)
```bash
# 1. Create account at https://upstash.com
# 2. Create Redis database
# 3. Select region closest to your users
# 4. Get REST URL and token from dashboard
```

### Step 2: Redis Environment Variables
```env
# Upstash Redis (recommended for serverless)
UPSTASH_REDIS_REST_URL="https://your-database.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-rest-token"

# Alternative: Standard Redis URL
REDIS_URL="redis://localhost:6379"

# Cache configuration
CACHE_TTL_DEFAULT="3600"  # 1 hour default
CACHE_ENABLED="true"
```

### Step 3: Cache Strategy
```bash
# What gets cached:
# - Product search results (5 minutes)
# - Category data (1 hour)
# - User session data (30 minutes)
# - API responses (varies by endpoint)

# Cache invalidation:
# - Product updates: Clear product cache
# - New orders: Clear user-specific cache
# - Category changes: Clear category cache
```

### Alternative Redis Providers
- **Upstash**: Serverless Redis (recommended for Vercel)
- **Redis Cloud**: Managed Redis service
- **Railway**: Simple Redis hosting
- **Self-hosted**: Docker/VPS setup

---

## 🧪 9. TESTING PRODUCTION

### Pre-Launch Testing Checklist
- [ ] **Authentication flow** (sign up, sign in, sign out)
- [ ] **Product creation** (images upload correctly)
- [ ] **Shopping flow** (add to cart, checkout, payment)
- [ ] **Stripe Connect** (seller onboarding works)
- [ ] **Messaging system** (real-time messages)
- [ ] **Email notifications** (order confirmations sent)
- [ ] **Mobile responsiveness** (all devices)

### Load Testing
```bash
# Test critical endpoints
# - GET /api/products (browse page)
# - POST /api/orders (checkout flow)  
# - POST /api/messages (messaging)
# - Stripe webhook handling
```

---

## 🚨 9. SECURITY CHECKLIST

### Required Security Measures
- [ ] **HTTPS only** (all domains)
- [ ] **CSRF protection** ✅ (implemented)
- [ ] **Input sanitization** ✅ (implemented)
- [ ] **Rate limiting** ✅ (Arcjet)
- [ ] **Error boundaries** ✅ (implemented)
- [ ] **Environment variables** (no secrets in code)

### Stripe Security
- [ ] **Webhook signature verification** ✅
- [ ] **Metadata validation** ✅
- [ ] **Payment intent verification** ✅
- [ ] **Connect account validation** ✅

---

## 📈 10. PERFORMANCE OPTIMIZATION

### Recommended Optimizations
- [ ] **Database indexes** ✅ (configured)
- [ ] **Image optimization** ✅ (Next.js)
- [ ] **Server components** ✅ (where possible)
- [ ] **Caching strategy** (Redis recommended)
- [ ] **CDN setup** (Vercel handles this)

### Performance Targets
- **First load**: < 2 seconds
- **Navigation**: < 500ms
- **Core Web Vitals**: Good rating
- **Mobile performance**: > 90 score

---

## 🔄 11. MAINTENANCE

### Regular Tasks
- **Database backups** (automatic with most providers)
- **Error monitoring** (check Sentry weekly)
- **Performance monitoring** (Vercel analytics)
- **Security updates** (dependabot enabled)

### Scaling Considerations
- **Database**: Upgrade plan as needed
- **File storage**: Monitor usage limits
- **Stripe**: Contact for high volume discounts
- **Server resources**: Vercel scales automatically

---

## 📞 SUPPORT CONTACTS

### Service Support
- **Stripe**: [support.stripe.com](https://support.stripe.com)
- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Clerk**: [clerk.com/support](https://clerk.com/support)
- **UploadThing**: [uploadthing.com/help](https://uploadthing.com/help)
- **Resend**: [resend.com/help](https://resend.com/help)

---

*Updated: January 9, 2025*