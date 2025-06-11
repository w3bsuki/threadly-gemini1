# 🎯 Threadly Refactoring Plan

> Comprehensive roadmap to transform Threadly into a production-ready Next-Forge application

## Executive Summary

### Current State Assessment

**Threadly** is a C2C fashion marketplace built on Next-Forge with approximately **60% functionality complete**. The architecture is solid, following turborepo best practices, but suffers from:

- **Incomplete feature implementation** (40% of features have UI but no backend)
- **Inconsistent patterns** across the codebase
- **Missing critical production features** (error handling, loading states, real-time)
- **Technical debt** from rapid development

### Key Problems Identified

1. **Non-functional UI Elements**: Messaging, filters, profiles show mock data
2. **Duplicate API Logic**: Three different API patterns used inconsistently
3. **Poor User Experience**: No loading states, error handling, or optimistic updates
4. **Missing Real-time Features**: Pusher configured but not connected
5. **Incomplete Type Safety**: Many `any` types and missing validations

### Proposed End State

A **production-ready marketplace** with:
- ✅ All features fully functional with real data
- ✅ Consistent patterns following Next-Forge best practices
- ✅ Exceptional user experience with proper loading/error states
- ✅ Real-time messaging and notifications
- ✅ Type-safe, performant, and maintainable codebase

**Estimated Timeline**: 70-90 hours of focused development across 6 phases (including pre-refactoring audit)

---

## Phase 0: Pre-Refactoring Audit (8-10 hours)

### Scope
Comprehensive audit of current system before making any changes. Critical for avoiding unexpected issues.

### Priority
**CRITICAL** - Skip this at your own peril. This phase prevents disasters.

### Tasks

#### 0.1 Database Audit (3 hours)
- [ ] Backup production database to multiple locations
- [ ] Document all schema relationships and dependencies
- [ ] Identify unused tables, columns, and indexes
- [ ] Create rollback scripts for each migration
- [ ] Test restore procedures

```bash
# Backup script
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backups/prod_backup_$TIMESTAMP.sql
aws s3 cp backups/prod_backup_$TIMESTAMP.sql s3://threadly-backups/
```

#### 0.2 Code Audit (3 hours)
- [ ] Run bundle analyzer on all apps
- [ ] Document all external API dependencies
- [ ] List all environment variables in use
- [ ] Identify dead code with coverage tools
- [ ] Map component dependency tree

```bash
# Bundle analysis
pnpm build --filter=web -- --analyze
pnpm build --filter=app -- --analyze

# Dead code detection
pnpm dlx knip
```

#### 0.3 Performance Baseline (2 hours)
- [ ] Record current Lighthouse scores for key pages
- [ ] Document API response times (p50, p95, p99)
- [ ] Measure database query performance
- [ ] Create performance regression test suite
- [ ] Set up monitoring dashboards

```typescript
// packages/testing/performance-baseline.ts
export const performanceBaseline = {
  lighthouse: {
    homepage: { performance: 72, seo: 85, accessibility: 88 },
    productList: { performance: 68, seo: 82, accessibility: 90 },
    productDetail: { performance: 70, seo: 90, accessibility: 85 }
  },
  apiResponseTimes: {
    getProducts: { p50: 120, p95: 350, p99: 800 },
    createOrder: { p50: 200, p95: 500, p99: 1200 }
  }
};
```

#### 0.4 Security Audit (2 hours)
- [ ] Run security vulnerability scan
- [ ] Check for exposed secrets in code
- [ ] Audit API permissions and auth flows
- [ ] Review CORS and CSP policies
- [ ] Document security assumptions

### Success Criteria
- [ ] Complete backup and restore tested
- [ ] All metrics documented for comparison
- [ ] No critical security vulnerabilities
- [ ] Clear rollback plan for each phase

---

## Phase 1: Foundation & Infrastructure (15-20 hours)

### Scope
Establish consistent patterns, fix critical infrastructure, and prepare for feature implementation.

### Priority
**HIGHEST** - Everything else depends on getting these foundations right.

### Best Practices to Implement
- Centralized data fetching patterns
- Consistent error handling
- Type-safe environment variables
- Proper loading states infrastructure

### Tasks

#### 1.1 Data Layer Consolidation (8 hours)

**Next-Forge Pattern**: Centralize all data operations in packages for reuse across apps.
- [ ] Create `/packages/api` for centralized data fetching
- [ ] Implement consistent server action patterns
- [ ] Remove duplicate API routes between apps
- [ ] Create typed API client with Zod validation
- [ ] Document data fetching conventions

```typescript
// packages/api/src/products.ts
import { cache } from 'react';
import { db } from '@repo/database';
import { redis } from '@repo/cache';
import { AppError, NotFoundError } from '@repo/errors';

// Standard includes to prevent N+1 queries
const productIncludes = {
  images: { orderBy: { displayOrder: 'asc' } },
  seller: { 
    select: { 
      id: true, 
      firstName: true, 
      lastName: true, 
      imageUrl: true,
      averageRating: true,
      _count: { select: { reviews: true } }
    } 
  },
  category: true,
  _count: { select: { favorites: true, views: true } }
} as const;

// React cache for request deduplication
const getProductCached = cache(async (id: string) => {
  const cacheKey = `product:${id}`;
  
  // Try Redis first
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // Fetch from database
  const product = await db.product.findUnique({
    where: { id },
    include: productIncludes
  });
  
  if (!product) {
    throw new NotFoundError('Product not found', 'PRODUCT_NOT_FOUND');
  }
  
  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(product));
  
  return product;
});

export const productApi = {
  getById: getProductCached,
  
  async getAll(filters?: ProductFilters) {
    const whereClause = buildWhereClause(filters);
    const cacheKey = `products:${JSON.stringify(whereClause)}`;
    
    // Check cache
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
    
    const products = await db.product.findMany({
      where: whereClause,
      include: productIncludes,
      orderBy: filters?.sortBy || { createdAt: 'desc' },
      take: filters?.limit || 20,
      skip: filters?.offset || 0
    });
    
    // Cache for 1 minute (frequently changing)
    await redis.setex(cacheKey, 60, JSON.stringify(products));
    
    return products;
  },
  
  async invalidateCache(productId?: string) {
    if (productId) {
      await redis.del(`product:${productId}`);
    }
    // Clear all product list caches
    const keys = await redis.keys('products:*');
    if (keys.length) await redis.del(...keys);
  }
};
```

#### 1.2 Error Handling Infrastructure (4 hours)
- [ ] Implement global error boundary in both apps
- [ ] Create consistent error pages
- [ ] Add error logging with Sentry
- [ ] Create error handling utilities
- [ ] Document error handling patterns

```typescript
// packages/errors/src/index.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof ZodError) return new ValidationError(error);
  return new AppError('Internal error', 'INTERNAL_ERROR');
}
```

#### 1.3 Loading States Infrastructure (4 hours)
- [ ] Create loading.tsx for all routes
- [ ] Implement skeleton components
- [ ] Add Suspense boundaries
- [ ] Create loading utilities
- [ ] Document loading patterns

#### 1.4 TypeScript Strict Mode (4 hours)
- [ ] Enable strict mode in all tsconfig files
- [ ] Fix all type errors
- [ ] Remove all `any` types
- [ ] Add missing type exports
- [ ] Create type generation scripts

### Success Criteria
- [ ] All data fetching goes through centralized API
- [ ] Every async operation has loading/error states
- [ ] Zero TypeScript errors with strict mode
- [ ] Consistent patterns documented
- [ ] Performance baseline maintained or improved
- [ ] All critical paths have error recovery

---

## Emergency Procedures

### Rollback Procedures

#### Database Rollback
```bash
# Immediate rollback to specific migration
pnpm db:migrate:rollback --to 20240110123456_migration_name

# Full database restore from backup
pg_restore -d $DATABASE_URL backups/prod_backup_20240110.sql
```

#### Deployment Rollback
```bash
# Vercel instant rollback
vercel rollback

# Or via dashboard: Settings > Functions > Rollback
```

#### Feature Flag Kill Switch
```typescript
// Using Vercel Edge Config for instant updates
import { get } from '@vercel/edge-config';

export async function middleware(request: NextRequest) {
  const flags = await get('featureFlags');
  
  if (flags?.killSwitch?.messaging) {
    return NextResponse.rewrite(new URL('/maintenance', request.url));
  }
}
```

### Incident Response Plan

1. **Error Spike Detection**
   - Sentry alert triggers at 100 errors/minute
   - Check error grouping and affected users
   - Implement hotfix or rollback within 15 minutes

2. **Performance Degradation**
   - Alert triggers at p95 > 3s response time
   - Check database slow query log
   - Scale infrastructure or optimize queries

3. **Security Incident**
   - Immediate lockdown of affected systems
   - Rotate all potentially compromised credentials
   - Full audit log review
   - User notification if data affected

### Monitoring Dashboards

```typescript
// packages/monitoring/alerts.ts
export const alertThresholds = {
  errorRate: {
    warning: 10, // errors per minute
    critical: 100
  },
  responseTime: {
    warning: 2000, // ms
    critical: 5000
  },
  availability: {
    warning: 99.5, // percentage
    critical: 99.0
  }
};
```

---

## Incremental Migration Strategy

### Feature Flag Implementation

```typescript
// packages/feature-flags/src/index.ts
import { get } from '@vercel/edge-config';

export interface FeatureFlags {
  newMessagingSystem: boolean;
  optimizedSearch: boolean;
  enhancedFilters: boolean;
  realTimeNotifications: boolean;
}

export async function getFeatureFlags(): Promise<FeatureFlags> {
  const flags = await get('featureFlags') || {};
  
  return {
    newMessagingSystem: flags.newMessagingSystem || false,
    optimizedSearch: flags.optimizedSearch || false,
    enhancedFilters: flags.enhancedFilters || false,
    realTimeNotifications: flags.realTimeNotifications || false
  };
}

// Usage in components
export async function MessagesPage() {
  const flags = await getFeatureFlags();
  
  if (flags.newMessagingSystem) {
    return <NewMessagingSystem />;
  }
  
  return <LegacyMessaging />;
}
```

### Parallel System Running

```typescript
// Run both systems and compare results
export async function searchProducts(query: string) {
  const flags = await getFeatureFlags();
  
  if (flags.optimizedSearch) {
    // Log both results for comparison in development
    if (process.env.NODE_ENV === 'development') {
      const [newResults, oldResults] = await Promise.all([
        optimizedSearch(query),
        legacySearch(query)
      ]);
      
      console.log('Search comparison:', {
        query,
        newCount: newResults.length,
        oldCount: oldResults.length,
        diff: newResults.length - oldResults.length
      });
      
      return newResults;
    }
    
    return optimizedSearch(query);
  }
  
  return legacySearch(query);
}
```

### Gradual Traffic Shifting

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const rolloutPercentage = await get('rolloutPercentage') || 0;
  const userHash = hashUserId(request);
  
  // Consistent user experience - same users always get new version
  const shouldUseNewVersion = (userHash % 100) < rolloutPercentage;
  
  if (shouldUseNewVersion) {
    request.headers.set('x-use-new-version', 'true');
  }
  
  return NextResponse.next();
}
```

---

## Phase 2: Core Feature Completion (20-25 hours)

### Scope
Complete all partially implemented features that have UI but no functionality.

### Priority
**HIGH** - These are features users expect to work based on visible UI.

### Best Practices to Implement
- Server-first approach
- Optimistic updates
- Real-time synchronization
- Proper caching strategies

### Tasks

#### 2.1 Messaging System (8 hours)
- [ ] Connect Pusher for real-time messaging
- [ ] Implement message sending/receiving
- [ ] Add typing indicators
- [ ] Create conversation management
- [ ] Add unread message counts
- [ ] Test buyer-seller communication flow

```typescript
// apps/app/app/(authenticated)/messages/hooks/use-messages.ts
export function useMessages(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  
  useEffect(() => {
    const channel = pusher.subscribe(`conversation-${conversationId}`);
    channel.bind('new-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });
    
    return () => {
      pusher.unsubscribe(`conversation-${conversationId}`);
    };
  }, [conversationId]);
  
  return { messages, sendMessage };
}
```

#### 2.2 User Profiles & Settings (6 hours)
- [ ] Connect profile to real user data
- [ ] Implement address management
- [ ] Add profile editing
- [ ] Create seller statistics
- [ ] Implement user preferences
- [ ] Add avatar upload

#### 2.3 Order Management (6 hours)
- [ ] Implement order listing for buyers
- [ ] Create seller order management
- [ ] Add order status updates
- [ ] Implement order tracking
- [ ] Create order detail pages
- [ ] Add order actions (cancel, return)

#### 2.4 Product Filtering (5 hours)
- [ ] Connect filters to product queries
- [ ] Implement price range filtering
- [ ] Add condition filtering
- [ ] Create size/brand filters
- [ ] Add sort functionality
- [ ] Persist filter state in URL

### Success Criteria
- [ ] All visible UI elements are functional
- [ ] Real-time features work reliably
- [ ] Data persists correctly
- [ ] User flows are complete end-to-end

---

## Phase 3: User Experience Enhancement (15-20 hours)

### Scope
Improve the overall user experience with optimistic updates, better feedback, and polish.

### Priority
**MEDIUM** - Critical for user satisfaction but not blocking core functionality.

### Best Practices to Implement
- Optimistic UI updates
- Proper form validation
- Accessibility standards
- Mobile-first responsive design

### Tasks

#### 3.1 Optimistic Updates (6 hours)
- [ ] Implement optimistic cart updates
- [ ] Add optimistic favorites
- [ ] Create optimistic message sending
- [ ] Add optimistic follow actions
- [ ] Implement rollback on failure

```typescript
// Example: Optimistic cart update
const addToCart = useMutation({
  mutationFn: async (product) => {
    return await cartApi.addItem(product);
  },
  onMutate: async (product) => {
    await queryClient.cancelQueries(['cart']);
    const previousCart = queryClient.getQueryData(['cart']);
    queryClient.setQueryData(['cart'], old => [...old, product]);
    return { previousCart };
  },
  onError: (err, product, context) => {
    queryClient.setQueryData(['cart'], context.previousCart);
    toast.error('Failed to add to cart');
  },
});
```

#### 3.2 Form Validation & Feedback (5 hours)
- [ ] Add client-side validation
- [ ] Implement field-level errors
- [ ] Create success animations
- [ ] Add progress indicators
- [ ] Implement auto-save drafts

#### 3.3 Search & Discovery (5 hours)
- [ ] Implement search suggestions
- [ ] Add search history
- [ ] Create related products
- [ ] Implement "saved searches"
- [ ] Add visual search preview

#### 3.4 Mobile Experience (4 hours)
- [ ] Fix mobile navigation
- [ ] Optimize touch targets
- [ ] Add swipe gestures
- [ ] Implement pull-to-refresh
- [ ] Test on real devices

### Success Criteria
- [ ] All interactions feel instant
- [ ] Forms provide clear feedback
- [ ] Mobile experience is smooth
- [ ] Accessibility score > 90

---

## Phase 4: Performance & Optimization (10-15 hours)

### Scope
Optimize performance, implement caching, and ensure scalability.

### Priority
**MEDIUM** - Important for production but not blocking launch.

### Best Practices to Implement
- Server-side caching
- Image optimization
- Bundle optimization
- Database query optimization

### Tasks

#### 4.1 Caching Implementation (5 hours)
- [ ] Implement Redis caching layer
- [ ] Add query result caching
- [ ] Create cache invalidation strategy
- [ ] Implement edge caching
- [ ] Add browser caching headers

```typescript
// packages/cache/src/strategies.ts
export const cacheStrategies = {
  products: {
    ttl: 300, // 5 minutes
    tags: ['products'],
    invalidateOn: ['product.created', 'product.updated']
  },
  user: {
    ttl: 3600, // 1 hour
    tags: (id: string) => [`user:${id}`],
    invalidateOn: ['user.updated']
  }
};
```

#### 4.2 Image Optimization (3 hours)
- [ ] Implement Next.js Image component everywhere
- [ ] Add responsive image sizes
- [ ] Configure image CDN
- [ ] Implement lazy loading
- [ ] Add placeholder blur

#### 4.3 Database Optimization (4 hours)
- [ ] Add missing database indexes
- [ ] Optimize N+1 queries
- [ ] Implement query batching
- [ ] Add database connection pooling
- [ ] Create query performance monitoring

#### 4.4 Bundle Optimization (3 hours)
- [ ] Analyze bundle size
- [ ] Implement code splitting
- [ ] Remove unused dependencies
- [ ] Optimize imports
- [ ] Configure tree shaking

### Success Criteria
- [ ] Page load time < 3s on 3G
- [ ] Time to Interactive < 5s
- [ ] Lighthouse score > 90
- [ ] Database queries < 50ms

---

## Phase 5: Production Readiness (10-15 hours)

### Scope
Final preparations for production launch including monitoring, security, and documentation.

### Priority
**LOW** - Important but can be done in parallel with soft launch.

### Best Practices to Implement
- Comprehensive monitoring
- Security hardening
- Documentation
- Automated testing

### Tasks

#### 5.1 Monitoring & Analytics (5 hours)
- [ ] Configure Sentry error tracking
- [ ] Set up PostHog analytics
- [ ] Implement custom metrics
- [ ] Create monitoring dashboards
- [ ] Set up alerts

#### 5.2 Security Hardening (5 hours)
- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Configure CSP headers
- [ ] Implement input sanitization
- [ ] Add security scanning

#### 5.3 Testing Implementation (5 hours)
- [ ] Write critical path E2E tests
- [ ] Add component tests
- [ ] Create API integration tests
- [ ] Implement visual regression tests
- [ ] Set up CI/CD pipeline

### Success Criteria
- [ ] 100% monitoring coverage
- [ ] Pass security audit
- [ ] 80%+ test coverage
- [ ] Zero critical vulnerabilities

---

## Implementation Guidelines

### Code Quality Standards

```typescript
// ✅ GOOD: Clear, typed, and follows conventions
export async function getProductsByCategory(
  categoryId: string,
  options?: { limit?: number; offset?: number }
): Promise<ProductWithDetails[]> {
  return await productApi.getByCategory(categoryId, options);
}

// ❌ BAD: Unclear, untyped, and inconsistent
export async function getProds(cat: any, opts: any) {
  return await db.product.findMany({ where: { categoryId: cat } });
}
```

### Git Workflow

```bash
# Feature branches
git checkout -b feature/phase-1-data-layer

# Commit messages
git commit -m "feat: implement centralized product API"
git commit -m "fix: resolve N+1 query in product listing"
git commit -m "docs: add data fetching conventions"

# PR titles
"Phase 1: Data Layer Consolidation (#123)"
```

### Review Checklist

Before marking any task complete:
- [ ] Code follows Next-Forge conventions
- [ ] TypeScript types are complete
- [ ] Error cases are handled
- [ ] Loading states are implemented
- [ ] Mobile experience is tested
- [ ] Documentation is updated

---

## Timeline & Resources

### Phase Timeline

| Phase | Duration | Dependencies | Team Size |
|-------|----------|--------------|-----------|
| Phase 1 | 1 week | None | 2 devs |
| Phase 2 | 1.5 weeks | Phase 1 | 2 devs |
| Phase 3 | 1 week | Phase 2 | 2 devs |
| Phase 4 | 1 week | Phase 1 | 1 dev |
| Phase 5 | 1 week | All phases | 1 dev |

**Total Timeline**: 5-6 weeks with 2 developers

### Resource Requirements

- **Developers**: 2 full-stack developers
- **Designer**: Part-time for UX improvements
- **DevOps**: Part-time for infrastructure
- **QA**: Part-time for testing

### Risk Mitigation

1. **Data Migration Risk**: Create comprehensive backups before any schema changes
2. **Performance Risk**: Implement feature flags for gradual rollout
3. **User Impact**: Maintain backward compatibility during refactor
4. **Timeline Risk**: Prioritize by user impact, defer nice-to-haves

---

## Success Metrics

### Technical Metrics
- **TypeScript Coverage**: 100% (no `any` types)
- **Test Coverage**: >80%
- **Bundle Size**: <500KB initial load
- **Performance Score**: >90 Lighthouse
- **Error Rate**: <0.1%

### Business Metrics
- **Feature Completion**: 100%
- **User Satisfaction**: >4.5/5
- **Page Load Time**: <3s
- **Conversion Rate**: >2%
- **Support Tickets**: <5% of DAU

---

## Server vs Client Component Decision Matrix

### When to Use Server Components (Default)

```typescript
// ✅ Server Component - Data fetching
export default async function ProductList({ category }: Props) {
  const products = await productApi.getByCategory(category);
  return <ProductGrid products={products} />;
}

// ✅ Server Component - Static content
export function ProductCard({ product }: Props) {
  return (
    <Card>
      <h3>{product.title}</h3>
      <p>{product.price}</p>
    </Card>
  );
}

// ✅ Server Component - SEO critical
export function ProductMetadata({ product }: Props) {
  return (
    <>
      <h1>{product.title}</h1>
      <meta property="og:title" content={product.title} />
    </>
  );
}
```

### When to Use Client Components

```typescript
// ✅ Client Component - User interaction
'use client';
export function AddToCartButton({ productId }: Props) {
  const [loading, setLoading] = useState(false);
  const { addItem } = useCart();
  
  return (
    <Button 
      onClick={() => addItem(productId)}
      disabled={loading}
    >
      Add to Cart
    </Button>
  );
}

// ✅ Client Component - Browser APIs
'use client';
export function LocationPicker() {
  const [location, setLocation] = useState(null);
  
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(setLocation);
  }, []);
  
  return <div>{location?.coords.latitude}</div>;
}

// ✅ Client Component - Real-time updates
'use client';
export function LiveChat({ conversationId }: Props) {
  const messages = usePusherMessages(conversationId);
  return <MessageList messages={messages} />;
}
```

---

## Package Boundary Guidelines

### Shared Package Structure

```typescript
// packages/shared-auth/src/index.ts
// ✅ GOOD - Clear exports, single responsibility
export { AuthProvider } from './provider';
export { useAuth } from './hooks';
export { withAuth } from './hoc';
export type { User, Session } from './types';

// packages/shared-ui/src/index.ts
// ❌ BAD - Kitchen sink package
export * from './components';
export * from './hooks';
export * from './utils';
export * from './types';
```

### Cross-App Data Sharing

```typescript
// packages/shared-state/src/cart-sync.ts
// Sync cart state between web and app
export function useCartSync() {
  const { items } = useCart();
  
  useEffect(() => {
    // Broadcast to other tabs/apps
    const channel = new BroadcastChannel('threadly-cart');
    channel.postMessage({ type: 'cart-update', items });
    
    // Listen for updates from other sources
    channel.onmessage = (event) => {
      if (event.data.type === 'cart-update') {
        syncCartState(event.data.items);
      }
    };
    
    return () => channel.close();
  }, [items]);
}
```

---

## Conclusion

This refactoring plan transforms Threadly from a 60% complete prototype into a production-ready marketplace. By following Next-Forge best practices and implementing changes in logical phases, we can deliver a high-quality product while maintaining development velocity.

The key to success is:
1. **Consistency** - Follow patterns religiously
2. **Incremental Progress** - Small, tested changes with feature flags
3. **User Focus** - Prioritize user-facing improvements
4. **Quality** - Don't compromise on code quality
5. **Safety** - Always have a rollback plan

With focused execution and proper monitoring, Threadly will become a best-in-class Next-Forge application ready to scale.

### Final Checklist Before Production

- [ ] All phases completed and tested
- [ ] Performance metrics meet or exceed baseline
- [ ] Security audit passed
- [ ] Monitoring and alerts configured
- [ ] Rollback procedures tested
- [ ] Documentation updated
- [ ] Team trained on new patterns
- [ ] Customer support briefed on changes