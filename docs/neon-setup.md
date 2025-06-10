# 🐘 Neon PostgreSQL Setup Guide

> Complete guide for setting up Threadly with Neon PostgreSQL database

## 🚀 Quick Setup

### 1. Create Neon Account & Project
1. Go to [Neon Console](https://console.neon.tech)
2. Sign up/login with GitHub
3. Create new project: **"threadly-production"**
4. Choose region closest to your users
5. Copy the connection string

### 2. Configure Environment Variables

```bash
# Production Database URL from Neon
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# Backup the SQLite database first (if migrating)
cp packages/database/prisma/dev.db packages/database/prisma/dev.db.backup
```

### 3. Update Schema & Migrate

```bash
# The schema is already updated to PostgreSQL
# Run the production database setup
pnpm run setup:production-db

# Or manually:
pnpm db:push
pnpm db:seed
```

## 🔧 Detailed Configuration

### Neon Project Settings

**Recommended Configuration:**
- **Project Name**: `threadly-production`
- **Region**: Choose based on your primary user base
  - US East (Ohio) - `us-east-2`
  - Europe (Frankfurt) - `eu-central-1`
  - Asia Pacific (Singapore) - `ap-southeast-1`
- **PostgreSQL Version**: 15+ (latest stable)
- **Compute Size**: 
  - Development: `0.25 vCPU, 1 GB RAM`
  - Production: `0.5 vCPU, 2 GB RAM` (can scale up)

### Connection String Format

```bash
# Full connection string from Neon
DATABASE_URL="postgresql://[username]:[password]@[hostname]/[database]?sslmode=require"

# Example:
# postgresql://alex:AbC123dEf@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### Environment Files

Update your environment files:

```bash
# .env (local development - optional)
DATABASE_URL="postgresql://localhost:5432/threadly_dev"

# .env.production (production)
DATABASE_URL="postgresql://[neon-connection-string]"
```

## 📊 Database Schema Migration

### Schema Changes Made
1. **Provider**: Changed from `sqlite` to `postgresql`
2. **Relation Mode**: Removed (not needed for PostgreSQL)
3. **Indexes**: Optimized for PostgreSQL performance
4. **Constraints**: Native foreign key constraints enabled

### Migration Steps

```bash
# 1. Backup existing data (if migrating from SQLite)
pnpm db:studio  # Export any critical data

# 2. Generate new Prisma client
pnpm db:generate

# 3. Push schema to PostgreSQL
pnpm db:push

# 4. Seed initial data
pnpm db:seed

# 5. Verify setup
pnpm run setup:production-db
```

## 🏗️ Production Optimizations

### Performance Indexes (Automatically Created)

```sql
-- Full-text search on products
CREATE INDEX idx_products_search ON "Product" 
USING gin(to_tsvector('english', title || ' ' || description));

-- Price range queries
CREATE INDEX idx_products_price_range ON "Product" (price) 
WHERE status = 'AVAILABLE';

-- Unread messages optimization
CREATE INDEX idx_messages_unread ON "Message" 
(read, "conversationId", "createdAt");

-- Recent orders for users
CREATE INDEX idx_orders_recent ON "Order" 
("buyerId", "createdAt" DESC);
```

### Connection Pooling

Neon automatically provides connection pooling, but for high-traffic applications, consider:

```typescript
// In your database connection (if needed)
const connectionString = `${process.env.DATABASE_URL}?pgbouncer=true&connect_timeout=15`;
```

## 🔐 Security Best Practices

### 1. Connection Security
- ✅ Always use SSL (`sslmode=require`)
- ✅ Use environment variables for credentials
- ✅ Never commit connection strings to code
- ✅ Rotate passwords regularly

### 2. Access Control
```sql
-- Create read-only user for analytics (optional)
CREATE USER threadly_readonly WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE neondb TO threadly_readonly;
GRANT USAGE ON SCHEMA public TO threadly_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO threadly_readonly;
```

### 3. Environment Isolation
```bash
# Development
DATABASE_URL="postgresql://dev_user:dev_pass@localhost:5432/threadly_dev"

# Staging
DATABASE_URL="postgresql://staging_connection_from_neon"

# Production
DATABASE_URL="postgresql://production_connection_from_neon"
```

## 📈 Monitoring & Maintenance

### Neon Dashboard Monitoring
- **Query Performance**: Monitor slow queries
- **Connection Count**: Watch for connection leaks
- **Storage Usage**: Track database growth
- **Compute Usage**: Monitor CPU and memory

### Backup Strategy
Neon provides automatic backups, but also:

```bash
# Manual backup script
pg_dump $DATABASE_URL > threadly_backup_$(date +%Y%m%d).sql

# Automated backups (add to CI/CD)
# Daily backup to S3 or similar storage
```

### Health Checks

```typescript
// Add to your API health endpoint
export async function GET() {
  try {
    await database.$queryRaw`SELECT 1`;
    return Response.json({ database: 'healthy' });
  } catch (error) {
    return Response.json(
      { database: 'unhealthy', error: error.message },
      { status: 500 }
    );
  }
}
```

## 🚨 Troubleshooting

### Common Issues

**Connection Refused**
```bash
# Check if DATABASE_URL is correct
echo $DATABASE_URL

# Test connection manually
psql $DATABASE_URL -c "SELECT version();"
```

**SSL Certificate Issues**
```bash
# Add SSL mode to connection string
DATABASE_URL="postgresql://...?sslmode=require"

# Or disable SSL for local development
DATABASE_URL="postgresql://...?sslmode=disable"
```

**Migration Errors**
```bash
# Reset database (⚠️ DATA LOSS)
pnpm db:reset

# Or manually drop/recreate
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
pnpm db:push
```

### Performance Issues

**Slow Queries**
```sql
-- Enable query logging in Neon dashboard
-- Check slow query log for optimization opportunities

-- Common optimizations:
EXPLAIN ANALYZE SELECT * FROM "Product" WHERE status = 'AVAILABLE';
```

**Connection Pool Exhaustion**
```typescript
// Add connection limits
const database = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + "?connection_limit=10"
    }
  }
});
```

## ✅ Verification Checklist

Before going live:

- [ ] Neon project created and configured
- [ ] DATABASE_URL set in all environments
- [ ] Schema migrated successfully
- [ ] Essential categories seeded
- [ ] Performance indexes created
- [ ] All API endpoints working
- [ ] Backup strategy configured
- [ ] Monitoring alerts set up
- [ ] Health checks implemented

## 🔗 Useful Links

- [Neon Documentation](https://neon.tech/docs)
- [Prisma PostgreSQL Guide](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)

---

## 🆘 Need Help?

If you encounter issues:
1. Check Neon dashboard for connection status
2. Verify environment variables are set correctly
3. Run the setup script with debug logging
4. Check application logs for specific errors

```bash
# Debug database connection
NODE_ENV=development pnpm run setup:production-db
```