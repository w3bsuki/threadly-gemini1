# Deployment Guide

## 🚀 Production Deployment

### Prerequisites

1. **Accounts Required**:
   - Vercel (hosting)
   - Neon/Supabase (database)
   - Clerk (authentication)
   - Stripe (payments)
   - UploadThing (file storage)
   - Sentry (error tracking)
   - PostHog (analytics)

2. **Domain Setup**:
   - `threadly.com` → Web app
   - `app.threadly.com` → User dashboard
   - `api.threadly.com` → API services

### Environment Variables

Create these in each Vercel project:

#### All Apps
```bash
# Database
DATABASE_URL="postgresql://..."

# Clerk (Public keys for web/app)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."

# URLs
NEXT_PUBLIC_APP_URL="https://app.threadly.com"
NEXT_PUBLIC_WEB_URL="https://threadly.com"
NEXT_PUBLIC_API_URL="https://api.threadly.com"
```

#### App & Web Specific
```bash
# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

# UploadThing
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="..."

# Analytics
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

#### API Specific
```bash
# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Clerk Webhook
CLERK_WEBHOOK_SECRET="whsec_..."

# Cron
CRON_SECRET="your-secure-secret"

# Sentry
SENTRY_DSN="https://..."
```

### Deployment Steps

#### 1. Database Setup

```bash
# 1. Create production database (Neon)
# 2. Update DATABASE_URL in all apps
# 3. Run migrations
pnpm db:push

# 4. Seed initial data (categories)
pnpm db:seed
```

#### 2. Deploy API

```bash
cd apps/api

# 1. Create Vercel project
vercel

# 2. Configure environment variables
vercel env add DATABASE_URL
vercel env add CLERK_SECRET_KEY
# ... add all API env vars

# 3. Deploy
vercel --prod
```

#### 3. Deploy Web App

```bash
cd apps/web

# 1. Create Vercel project
vercel

# 2. Configure build settings
# Framework Preset: Next.js
# Build Command: cd ../.. && pnpm build --filter=web
# Output Directory: apps/web/.next

# 3. Set environment variables
# 4. Deploy
vercel --prod
```

#### 4. Deploy User App

```bash
cd apps/app

# 1. Create Vercel project
vercel

# 2. Same build settings as web
# 3. Set environment variables
# 4. Deploy
vercel --prod
```

#### 5. Configure Webhooks

**Clerk Webhooks**:
1. Go to Clerk Dashboard → Webhooks
2. Add endpoint: `https://api.threadly.com/webhooks/auth`
3. Select events: user.*, organization.*
4. Copy signing secret to `CLERK_WEBHOOK_SECRET`

**Stripe Webhooks**:
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://api.threadly.com/webhooks/payments`
3. Select events: checkout.session.*, payment_intent.*
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

#### 6. Set Up Cron Jobs

In Vercel dashboard for API project:
1. Go to Settings → Cron Jobs
2. Add: `/cron/keep-alive` - `0 1 * * *`

### Post-Deployment Checklist

- [ ] Test user registration flow
- [ ] Test product creation with image upload
- [ ] Test search functionality
- [ ] Test checkout process
- [ ] Verify webhooks are working
- [ ] Check error tracking in Sentry
- [ ] Monitor analytics in PostHog
- [ ] Test mobile responsiveness
- [ ] Run Lighthouse audit
- [ ] Set up uptime monitoring

## 🔧 Maintenance

### Database Migrations

```bash
# Make schema changes
pnpm db:generate

# Apply to production
pnpm db:push
```

### Rolling Back

```bash
# Vercel instant rollback
vercel rollback

# Or redeploy previous commit
git checkout <commit>
vercel --prod
```

### Monitoring

1. **Errors**: Check Sentry dashboard
2. **Performance**: Vercel Analytics
3. **Uptime**: Set up Checkly or similar
4. **Database**: Monitor Neon dashboard
5. **Costs**: Track Vercel, database, and service usage

## 🚨 Troubleshooting

### Common Issues

**"Database connection timeout"**
- Check DATABASE_URL is correct
- Ensure IP whitelist includes Vercel
- Check connection pooling settings

**"Clerk authentication failing"**
- Verify all CLERK_* env vars
- Check middleware configuration
- Ensure domains are added in Clerk

**"Images not uploading"**
- Verify UploadThing env vars
- Check CORS settings
- Ensure file size limits

**"Webhooks not working"**
- Verify webhook secrets
- Check endpoint URLs
- Look at Vercel function logs

### Debug Commands

```bash
# View logs
vercel logs

# Check environment
vercel env ls

# Redeploy
vercel --force

# Check build output
vercel build
```

## 📊 Scaling Considerations

### When You Need to Scale

- **Database**: >10k products or >1k concurrent users
- **Images**: >100GB storage or >1M requests/month  
- **API**: >1000 req/sec sustained
- **Search**: >100k products

### Scaling Options

1. **Database**: 
   - Upgrade Neon plan
   - Add read replicas
   - Implement caching layer

2. **Images**:
   - Use Cloudflare Images
   - Add CDN (Cloudflare/Fastly)
   - Implement image optimization

3. **API**:
   - Enable Edge Functions
   - Add Redis caching
   - Use API Gateway

4. **Search**:
   - Move to Elasticsearch Cloud
   - Or use Algolia for better performance

## 🔐 Security Checklist

- [ ] Enable 2FA on all service accounts
- [ ] Rotate API keys quarterly
- [ ] Set up WAF rules in Cloudflare
- [ ] Enable DDoS protection
- [ ] Regular security audits
- [ ] Implement rate limiting
- [ ] Set up backup automation
- [ ] Document incident response plan

## 💰 Cost Estimation

Monthly costs at launch:
- **Vercel**: $20 (Pro plan)
- **Database**: $25 (Neon Starter)
- **Clerk**: $25 (Starter)
- **UploadThing**: $10 (Starter)
- **Monitoring**: $20 (Sentry + others)
- **Total**: ~$100/month

At scale (10k users):
- **Vercel**: $150
- **Database**: $100
- **Clerk**: $250
- **Storage**: $50
- **Search**: $100
- **Total**: ~$650/month