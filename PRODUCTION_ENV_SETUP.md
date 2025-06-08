# Threadly Production Environment Configuration Guide

This guide provides comprehensive documentation for all environment variables required to deploy Threadly to production. Variables are grouped by service, with clear instructions on how to obtain each value.

## Table of Contents
- [Required vs Optional Variables](#required-vs-optional-variables)
- [Database Configuration](#database-configuration)
- [Authentication (Clerk)](#authentication-clerk)
- [Payment Processing (Stripe)](#payment-processing-stripe)
- [File Storage (UploadThing)](#file-storage-uploadthing)
- [Email Service (Resend)](#email-service-resend)
- [Analytics (PostHog)](#analytics-posthog)
- [Error Tracking (Sentry)](#error-tracking-sentry)
- [Security (Arcjet)](#security-arcjet)
- [Redis Caching](#redis-caching)
- [Real-time Features (Liveblocks)](#real-time-features-liveblocks)
- [Notifications (Knock)](#notifications-knock)
- [Application URLs](#application-urls)
- [Additional Services](#additional-services)
- [Platform-Specific Configuration](#platform-specific-configuration)
- [Security Best Practices](#security-best-practices)
- [Validation Checklist](#validation-checklist)

## Required vs Optional Variables

### Critical Required Variables (App won't start without these)
- `DATABASE_URL`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_WEB_URL`
- `NEXT_PUBLIC_API_URL`

### Highly Recommended (Core features won't work)
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `UPLOADTHING_SECRET`
- `UPLOADTHING_TOKEN`
- `RESEND_API_KEY`

### Optional (Enhanced features)
- Analytics, monitoring, caching, and other services

## Database Configuration

### PostgreSQL Database
```bash
# Required - PostgreSQL connection string
DATABASE_URL="postgresql://username:password@host:5432/database_name?sslmode=require"
```

**How to obtain:**
1. **Vercel Postgres**: Create database in Vercel dashboard → Settings → Storage
2. **Railway**: Create PostgreSQL service → Copy connection string from dashboard
3. **Supabase**: Create project → Settings → Database → Connection string
4. **Neon**: Create database → Dashboard → Connection details

**Important:** Always use `?sslmode=require` for production databases

## Authentication (Clerk)

### Core Authentication
```bash
# Required - Get from Clerk Dashboard
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
CLERK_WEBHOOK_SECRET="whsec_..."
```

### Authentication URLs
```bash
# Required - Authentication flow URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"
```

**How to obtain:**
1. Create account at [clerk.com](https://clerk.com)
2. Create new application for production
3. Navigate to API Keys section
4. Copy publishable and secret keys
5. Set up webhook endpoint: `https://your-api-domain.com/webhooks/auth`
6. Copy webhook signing secret

## Payment Processing (Stripe)

### Stripe Configuration
```bash
# Required for payments
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

**How to obtain:**
1. Create account at [stripe.com](https://stripe.com)
2. Switch to live mode (not test mode)
3. Navigate to Developers → API keys
4. Copy publishable and secret keys
5. Set up webhook endpoint: `https://your-api-domain.com/webhooks/payments`
6. Add events: `payment_intent.succeeded`, `payment_intent.failed`, etc.
7. Copy webhook signing secret

**Stripe Connect Setup (for marketplace):**
1. Enable Connect in Stripe Dashboard
2. Configure platform settings
3. Set up OAuth for seller onboarding

## File Storage (UploadThing)

### UploadThing Configuration
```bash
# Required for image uploads
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_TOKEN="sk_live_..."
UPLOADTHING_APP_ID="your-app-id"
NEXT_PUBLIC_UPLOADTHING_APP_ID="your-app-id"
```

**How to obtain:**
1. Create account at [uploadthing.com](https://uploadthing.com)
2. Create new app for production
3. Navigate to API Keys
4. Copy secret key and app ID
5. Token is same as secret key

**Alternative: Vercel Blob Storage**
```bash
BLOB_READ_WRITE_TOKEN="vercel_blob_..."
```

## Email Service (Resend)

### Resend Configuration
```bash
# Required for transactional emails
RESEND_API_KEY="re_..."
RESEND_TOKEN="re_..."  # Same as API key
RESEND_FROM="noreply@threadly.com"
EMAIL_FROM="noreply@threadly.com"
```

**How to obtain:**
1. Create account at [resend.com](https://resend.com)
2. Verify your domain
3. Navigate to API Keys → Create API Key
4. Set up email address for sending

**Domain Verification:**
1. Add DNS records as shown in Resend dashboard
2. Wait for verification (usually < 1 hour)
3. Test with API key

## Analytics (PostHog)

### PostHog Configuration
```bash
# Optional but recommended
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

**How to obtain:**
1. Create account at [posthog.com](https://posthog.com)
2. Create new project
3. Navigate to Project Settings
4. Copy project API key

**Self-hosted option:**
```bash
NEXT_PUBLIC_POSTHOG_HOST="https://your-posthog-instance.com"
```

### Google Analytics
```bash
# Optional
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-..."
```

## Error Tracking (Sentry)

### Sentry Configuration
```bash
# Highly recommended for production
SENTRY_DSN="https://...@sentry.io/..."
SENTRY_AUTH_TOKEN="..."
SENTRY_ORG="your-org-slug"
SENTRY_PROJECT="threadly"
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."
```

**How to obtain:**
1. Create account at [sentry.io](https://sentry.io)
2. Create new project (Next.js)
3. Navigate to Settings → Client Keys → Copy DSN
4. Create auth token: Settings → Auth Tokens
5. Note organization and project slugs

**Configuration files needed:**
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`

## Security (Arcjet)

### Arcjet Rate Limiting
```bash
# Required for API protection
ARCJET_KEY="ajkey_..."
```

**How to obtain:**
1. Create account at [arcjet.com](https://arcjet.com)
2. Create new site
3. Copy API key from dashboard

### CRON Job Security
```bash
# Required - Generate a secure random string
CRON_SECRET="your-generated-secure-cron-secret"
```

**Generate secure secret:**
```bash
openssl rand -base64 32
```

## Redis Caching

### Redis Configuration
```bash
# Optional but recommended for performance
REDIS_URL="redis://default:password@host:6379"
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

**How to obtain:**
1. **Upstash** (Recommended for Vercel):
   - Create Redis database at [upstash.com](https://upstash.com)
   - Copy REST URL and token
2. **Railway**: Add Redis service → Copy URL
3. **Redis Cloud**: Create database → Copy connection string

## Real-time Features (Liveblocks)

### Liveblocks Configuration
```bash
# Required for real-time collaboration
LIVEBLOCKS_SECRET="sk_live_..."
```

**How to obtain:**
1. Create account at [liveblocks.io](https://liveblocks.io)
2. Create new project
3. Navigate to API keys
4. Copy secret key

## Notifications (Knock)

### Knock Configuration
```bash
# Optional - In-app notifications
KNOCK_API_KEY="sk_live_..."
KNOCK_SECRET_API_KEY="sk_live_..."
NEXT_PUBLIC_KNOCK_API_KEY="pk_live_..."
KNOCK_FEED_CHANNEL_ID="..."
NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID="..."
```

**How to obtain:**
1. Create account at [knock.app](https://knock.app)
2. Set up notification workflows
3. Create feed channel
4. Copy API keys and channel ID

## Application URLs

### Production URLs
```bash
# Required - Update with your actual domains
NEXT_PUBLIC_APP_URL="https://app.threadly.com"
NEXT_PUBLIC_WEB_URL="https://threadly.com"
NEXT_PUBLIC_API_URL="https://api.threadly.com"
NEXT_PUBLIC_DOCS_URL="https://docs.threadly.com"

# Platform-specific
VERCEL_PROJECT_PRODUCTION_URL="https://threadly.vercel.app"
VERCEL_URL="https://threadly.vercel.app"
```

## Additional Services

### Better Stack Monitoring
```bash
# Optional - Application monitoring
BETTERSTACK_API_KEY="..."
BETTERSTACK_URL="..."
```

### Feature Flags
```bash
# Required for feature flag service
FLAGS_SECRET="..."

# Feature toggles
NEXT_PUBLIC_FEATURE_SEARCH="true"
NEXT_PUBLIC_FEATURE_MESSAGING="true"
NEXT_PUBLIC_FEATURE_REVIEWS="true"
```

### Content Management (Basehub)
```bash
# Optional - CMS integration
BASEHUB_TOKEN="..."
```

### Webhooks (Svix)
```bash
# Optional - Webhook management
SVIX_TOKEN="..."
```

## Platform-Specific Configuration

### Vercel Deployment

1. **Environment Variables**:
   - Add via Vercel Dashboard → Settings → Environment Variables
   - Set for Production, Preview, and Development environments
   - Use Vercel's encrypted secrets for sensitive values

2. **Required Vercel Environment Variables**:
   ```bash
   VERCEL_PROJECT_PRODUCTION_URL  # Auto-set by Vercel
   VERCEL_URL                     # Auto-set by Vercel
   VERCEL_ENV                     # Auto-set by Vercel
   ```

3. **Vercel-specific integrations**:
   - Vercel Postgres
   - Vercel Blob Storage
   - Vercel Analytics (automatic)

### Railway Deployment

1. **Service Configuration**:
   - Create services for each app (web, app, api)
   - Add PostgreSQL and Redis services
   - Use Railway's environment variable groups

2. **Domain Setup**:
   - Configure custom domains for each service
   - Enable HTTPS (automatic)

### Docker Deployment

1. **Environment File**:
   ```bash
   # Create .env.production locally (never commit!)
   cp .env.example .env.production
   # Edit with production values
   ```

2. **Docker Compose Override**:
   ```yaml
   # docker-compose.production.yml
   services:
     app:
       env_file: .env.production
   ```

## Security Best Practices

### 1. Secret Management
- **Never commit** `.env` files to version control
- Use platform-specific secret management (Vercel Encrypted Secrets, Railway Variables)
- Rotate keys regularly (every 90 days)
- Use different keys for staging and production

### 2. API Key Restrictions
- **Stripe**: Restrict to specific domains
- **UploadThing**: Set allowed origins
- **Clerk**: Configure allowed redirect URLs
- **PostHog**: Set up allowed domains

### 3. Database Security
- Always use SSL connections (`sslmode=require`)
- Implement connection pooling for production
- Use read replicas for analytics queries
- Regular backups (automated)

### 4. Environment Separation
```bash
# Naming convention for multiple environments
DATABASE_URL_PRODUCTION
DATABASE_URL_STAGING
DATABASE_URL_DEVELOPMENT
```

### 5. Access Control
- Use least privilege principle
- Separate API keys for different services
- Implement IP allowlisting where possible
- Enable 2FA on all service accounts

## Validation Checklist

### Pre-deployment Validation

- [ ] All required environment variables are set
- [ ] Database connection tested with SSL
- [ ] Clerk authentication flow works end-to-end
- [ ] Stripe webhook endpoint responds correctly
- [ ] File uploads work with UploadThing
- [ ] Email sending verified with Resend
- [ ] Application URLs are correct and HTTPS
- [ ] Redis connection established (if used)
- [ ] Error tracking reports to Sentry
- [ ] Analytics events firing to PostHog

### Post-deployment Validation

- [ ] Sign up flow completes successfully
- [ ] Product image upload works
- [ ] Payment processing completes
- [ ] Emails are delivered
- [ ] Real-time features work (if enabled)
- [ ] No console errors in production
- [ ] Performance metrics acceptable
- [ ] Security headers configured
- [ ] SSL certificates valid
- [ ] Monitoring alerts configured

### Common Issues and Solutions

1. **Database Connection Timeout**
   - Check SSL mode is set correctly
   - Verify firewall/security group rules
   - Ensure connection pooling is configured

2. **Authentication Redirect Loops**
   - Verify Clerk URLs match deployment
   - Check middleware configuration
   - Ensure cookies work cross-domain

3. **File Upload Failures**
   - Verify UploadThing app ID matches
   - Check CORS configuration
   - Ensure file size limits are set

4. **Payment Webhook Failures**
   - Verify webhook secret is correct
   - Check endpoint URL is accessible
   - Ensure proper error handling

5. **Email Delivery Issues**
   - Verify domain DNS records
   - Check from address is verified
   - Monitor Resend dashboard for bounces

## Environment File Template

Create `.env.production` with all values filled:

```bash
# Copy from .env.example and fill with production values
cp .env.example .env.production

# Edit with your production values
# NEVER commit this file!
```

## Support Resources

- **Clerk**: [docs.clerk.dev](https://docs.clerk.dev)
- **Stripe**: [stripe.com/docs](https://stripe.com/docs)
- **UploadThing**: [docs.uploadthing.com](https://docs.uploadthing.com)
- **Resend**: [resend.com/docs](https://resend.com/docs)
- **PostHog**: [posthog.com/docs](https://posthog.com/docs)
- **Sentry**: [docs.sentry.io](https://docs.sentry.io)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)

Remember: Always test in a staging environment before deploying to production!