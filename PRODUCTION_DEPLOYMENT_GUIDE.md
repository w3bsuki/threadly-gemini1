# Threadly Production Deployment Guide

This guide covers the complete production deployment process for the Threadly marketplace platform.

## 🚀 Production Readiness Checklist

### Environment Setup
- [ ] Production database configured (PostgreSQL)
- [ ] Redis cache configured (Upstash)
- [ ] CDN setup for static assets
- [ ] Domain names configured and SSL certificates
- [ ] Environment variables configured in Vercel
- [ ] Database backups scheduled
- [ ] Monitoring tools configured

### Security
- [ ] Authentication configured (Clerk)
- [ ] API rate limiting enabled (Arcjet)
- [ ] CSRF protection enabled
- [ ] Input validation implemented
- [ ] File upload security configured
- [ ] Database connection encrypted
- [ ] Secrets properly managed

### Performance
- [ ] Database indexes optimized
- [ ] Redis caching implemented
- [ ] CDN configured for images
- [ ] Code splitting implemented
- [ ] Bundle size optimized
- [ ] Image optimization enabled
- [ ] Database query optimization

### Monitoring
- [ ] Error tracking (Sentry)
- [ ] Analytics (PostHog)
- [ ] Performance monitoring (Vercel Analytics)
- [ ] Uptime monitoring
- [ ] Database monitoring
- [ ] Log aggregation
- [ ] Alert notifications

## 📦 Deployment Process

### Prerequisites

1. **Install Required Tools**
   ```bash
   npm install -g vercel@latest
   npm install -g pnpm@latest
   ```

2. **Configure Vercel CLI**
   ```bash
   vercel login
   vercel link
   ```

3. **Set Environment Variables**
   ```bash
   # Required for all environments
   DATABASE_URL=
   REDIS_URL=
   CLERK_SECRET_KEY=
   STRIPE_SECRET_KEY=
   UPLOADTHING_SECRET=
   UPLOADTHING_APP_ID=
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
   
   # Production specific
   SENTRY_DSN=
   POSTHOG_KEY=
   ALGOLIA_APPLICATION_ID=
   ALGOLIA_SEARCH_API_KEY=
   PUSHER_APP_ID=
   PUSHER_KEY=
   PUSHER_SECRET=
   RESEND_API_KEY=
   ```

### Deployment Steps

1. **Automated Deployment (Recommended)**
   ```bash
   # Deploy all apps to production
   ./scripts/deploy.sh production all
   
   # Deploy specific app
   ./scripts/deploy.sh production web
   ```

2. **Manual Deployment**
   ```bash
   # Install dependencies
   pnpm install --frozen-lockfile
   
   # Run tests
   pnpm test
   pnpm lint
   pnpm typecheck
   
   # Build applications
   pnpm build
   
   # Deploy to Vercel
   vercel deploy --prod
   ```

3. **Database Migrations**
   ```bash
   # Run migrations
   pnpm db:deploy
   
   # Verify migrations
   pnpm db:studio
   ```

## 🔧 Configuration

### Vercel Project Settings

1. **App (Main Application)**
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install --frozen-lockfile`
   - Root Directory: `apps/app`

2. **Web (Public Marketplace)**
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install --frozen-lockfile`
   - Root Directory: `apps/web`

3. **API (Backend Services)**
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install --frozen-lockfile`
   - Root Directory: `apps/api`

### Domain Configuration

```
Production URLs:
- Main App: https://app.threadly.com
- Web Marketplace: https://threadly.com
- API Backend: https://api.threadly.com

Staging URLs:
- Main App: https://app-staging.threadly.com
- Web Marketplace: https://staging.threadly.com
- API Backend: https://api-staging.threadly.com
```

### Database Configuration

```sql
-- Production database settings
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET random_page_cost = 1.1;
SELECT pg_reload_conf();
```

## 📊 Monitoring Setup

### Error Tracking (Sentry)

1. **Configuration**
   ```typescript
   // sentry.client.config.ts
   import * as Sentry from '@sentry/nextjs';
   
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
     tracesSampleRate: 1.0,
     beforeSend(event) {
       // Filter out sensitive information
       return event;
     },
   });
   ```

2. **Custom Alerts**
   - Error rate > 1%
   - Response time > 2 seconds
   - Memory usage > 80%
   - Database connection errors

### Analytics (PostHog)

1. **Events Tracking**
   - User registrations
   - Product listings
   - Order completions
   - Search queries
   - Page views

2. **Custom Metrics**
   - Conversion rates
   - Average order value
   - User retention
   - Feature adoption

### Uptime Monitoring

1. **Health Check Endpoints**
   ```typescript
   // Health check endpoints
   GET /health        - Basic health check
   GET /api/health    - API health check
   GET /db/health     - Database health check
   GET /cache/health  - Redis health check
   ```

2. **Monitoring Services**
   - UptimeRobot for endpoint monitoring
   - Pingdom for performance monitoring
   - New Relic for application monitoring

## 🚨 Alerting & Notifications

### Slack Integration

```bash
# Webhook URL for notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Notification events
- Deployment success/failure
- High error rates
- Performance degradation
- Security alerts
- Database issues
```

### Email Alerts

```bash
# Email configuration
NOTIFICATION_EMAIL=ops@threadly.com

# Alert conditions
- Critical errors
- System downtime
- Performance issues
- Security incidents
```

## 🔄 Backup & Recovery

### Database Backups

1. **Automated Backups**
   ```bash
   # Daily backups via GitHub Actions
   # Located: .github/workflows/database-backup.yml
   
   # Manual backup
   pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
   ```

2. **Backup Storage**
   - Primary: AWS S3
   - Retention: 30 days
   - Verification: Daily restore tests

### Disaster Recovery

1. **Recovery Time Objective (RTO): 4 hours**
2. **Recovery Point Objective (RPO): 1 hour**

3. **Recovery Process**
   ```bash
   # Restore from backup
   psql $DATABASE_URL < backup-file.sql
   
   # Verify data integrity
   pnpm db:studio
   
   # Test application
   ./scripts/health-check.sh
   ```

## 📈 Performance Optimization

### Database Optimization

```sql
-- Key indexes for performance
CREATE INDEX CONCURRENTLY idx_products_status_created 
ON products(status, created_at DESC);

CREATE INDEX CONCURRENTLY idx_orders_user_status 
ON orders(buyer_id, status);

CREATE INDEX CONCURRENTLY idx_messages_conversation 
ON messages(conversation_id, created_at DESC);

-- Query optimization
ANALYZE;
VACUUM;
```

### Caching Strategy

```typescript
// Redis caching layers
1. User sessions (TTL: 24h)
2. Product listings (TTL: 1h)
3. Search results (TTL: 15m)
4. Category data (TTL: 6h)
5. User profiles (TTL: 2h)
```

### CDN Configuration

```javascript
// Next.js image optimization
module.exports = {
  images: {
    domains: ['utfs.io', 'images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};
```

## 🔒 Security Measures

### API Security

1. **Rate Limiting**
   ```typescript
   // Arcjet configuration
   const aj = arcjet({
     key: process.env.ARCJET_KEY,
     rules: [
       rateLimit({
         mode: "LIVE",
         max: 100,
         window: "1m",
       }),
     ],
   });
   ```

2. **Authentication**
   ```typescript
   // Clerk middleware
   export default authMiddleware({
     publicRoutes: ["/", "/products", "/search"],
     ignoredRoutes: ["/api/webhooks/(.*)"],
   });
   ```

### Data Protection

1. **Encryption**
   - Database: Encrypted at rest
   - Transmission: TLS 1.3
   - File uploads: Virus scanning

2. **Privacy**
   - GDPR compliance
   - Data anonymization
   - User consent management

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] Code review completed
- [ ] Tests passing (unit, integration, e2e)
- [ ] Performance benchmarks met
- [ ] Security scan passed
- [ ] Database migrations ready
- [ ] Feature flags configured
- [ ] Monitoring alerts configured

### During Deployment

- [ ] Maintenance page activated (if needed)
- [ ] Database migrations executed
- [ ] Applications deployed
- [ ] Health checks passing
- [ ] Feature flags updated
- [ ] Cache invalidated

### Post-Deployment

- [ ] All services healthy
- [ ] Performance metrics normal
- [ ] Error rates acceptable
- [ ] User acceptance testing
- [ ] Rollback plan ready
- [ ] Team notifications sent
- [ ] Documentation updated

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check connection
   psql $DATABASE_URL -c "SELECT 1"
   
   # Check connection pool
   SELECT * FROM pg_stat_activity;
   ```

2. **High Memory Usage**
   ```bash
   # Check application memory
   node --max-old-space-size=512 app.js
   
   # Monitor memory usage
   ps aux | grep node
   ```

3. **Slow Queries**
   ```sql
   -- Enable query logging
   ALTER SYSTEM SET log_min_duration_statement = '1000ms';
   
   -- Check slow queries
   SELECT * FROM pg_stat_statements 
   ORDER BY total_time DESC LIMIT 10;
   ```

### Emergency Contacts

- **DevOps Lead**: ops@threadly.com
- **Database Admin**: dba@threadly.com
- **Security Team**: security@threadly.com
- **On-Call Engineer**: +1-555-0123

### Rollback Procedures

1. **Application Rollback**
   ```bash
   # Revert to previous deployment
   vercel rollback
   ```

2. **Database Rollback**
   ```bash
   # Restore from backup
   psql $DATABASE_URL < previous-backup.sql
   ```

3. **Cache Invalidation**
   ```bash
   # Clear Redis cache
   redis-cli FLUSHALL
   ```

## 📚 Additional Resources

- [Vercel Deployment Documentation](https://vercel.com/docs)
- [Prisma Production Deployment](https://www.prisma.io/docs/guides/deployment)
- [Next.js Production Checklist](https://nextjs.org/docs/going-to-production)
- [Clerk Production Setup](https://clerk.com/docs/deployments/overview)
- [Stripe Production Setup](https://stripe.com/docs/keys)

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: Production Ready ✅