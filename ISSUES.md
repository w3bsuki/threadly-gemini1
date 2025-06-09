# 🐛 THREADLY TECHNICAL ISSUES TRACKER

*All code issues, TODOs, incomplete functions, and technical debt*

## 🔴 INCOMPLETE IMPLEMENTATIONS

### Payment Processing
- **File**: `/apps/app/app/api/webhooks/payments/route.ts`
  - TODO: Order creation after payment success
  - Missing: Update product status to SOLD
  - Missing: Send confirmation email
  ```typescript
  // Line 45: TODO: Create order in database
  // Line 67: TODO: Update product availability
  // Line 89: TODO: Send email notification
  ```

### Messaging System  
- **File**: `/apps/app/app/(authenticated)/messages/components/messages-content.tsx`
  - Missing: Loading states for messages
  - TODO: Implement message pagination
  - Bug: Typing indicator not clearing properly

### Search Implementation
- **File**: `/apps/web/app/api/search/route.ts`
  - TODO: Connect to Algolia
  - Currently using database queries (slow)
  - Missing: Search analytics tracking

### User Profiles
- **File**: `/apps/app/app/(authenticated)/profile/actions/profile-actions.ts`
  - Incomplete: Address management functions
  - Missing: Profile image upload
  - TODO: Implement follow/unfollow system

---

## 🟡 BUGS & ERRORS

### Critical Bugs
1. **Mobile Navigation Broken**
   - File: `/apps/web/app/[locale]/components/header/index.tsx`
   - Issue: Hamburger menu onClick not working
   - Line: 156-167

2. **Cart State Sync**
   - Files: Both `/lib/stores/cart-store.ts` 
   - Issue: Cart items don't sync between /web and /app
   - Cause: Separate Zustand instances

3. **Image URLs Broken in Production**
   - Multiple files
   - Issue: Using localhost URLs instead of UploadThing
   - Need: Environment-based URL generation

### Non-Critical Bugs
1. **Review Form Shows Too Early**
   - File: `/apps/app/app/(authenticated)/reviews/page.tsx`
   - Shows before order is delivered
   - Need: Check order.deliveredAt

2. **Category Selector Hardcoded**
   - File: `/apps/app/app/(authenticated)/selling/new/components/category-selector.tsx`
   - Using hardcoded category IDs
   - Need: Fetch from database

---

## 🔧 REFACTORING NEEDED

### Database Queries
- **Multiple files** using inefficient queries
  ```typescript
  // BAD: N+1 query problem
  const products = await db.product.findMany();
  for (const product of products) {
    const seller = await db.user.findUnique({ where: { id: product.sellerId }});
  }
  
  // GOOD: Include relations
  const products = await db.product.findMany({
    include: { seller: true }
  });
  ```

### Component Structure  
- **ProductCard** component duplicated in 3 places
  - `/apps/web/components/product-card.tsx`
  - `/apps/app/components/product-card.tsx`
  - `/packages/ui/src/product-card.tsx`
  - ACTION: Consolidate into packages/ui

### Error Handling
- Many API routes missing try/catch blocks
- No consistent error response format
- Need: Standardized error handler utility

---

## 📝 MISSING FEATURES

### API Endpoints
- [ ] `POST /api/users/follow` - Follow user
- [ ] `DELETE /api/users/follow` - Unfollow user  
- [ ] `GET /api/analytics/sales` - Sales data
- [ ] `POST /api/products/bulk` - Bulk operations
- [ ] `POST /api/export/orders` - Export CSV

### UI Components
- [ ] Loading skeletons for all lists
- [ ] Error boundaries on all pages
- [ ] Empty states for all lists
- [ ] Pagination components
- [ ] Date pickers for filters

### Integrations
- [ ] Email service not connected
- [ ] SMS notifications not implemented
- [ ] Push notifications not set up
- [ ] Analytics tracking incomplete

---

## 🔒 SECURITY ISSUES

### Input Validation
- **Multiple forms** missing Zod schemas
- SQL injection possible in search queries
- XSS vulnerabilities in message content

### Authentication
- Some API routes missing auth checks
- Admin routes not protected
- Rate limiting not configured

### Data Exposure
- User emails visible in API responses
- Stripe keys in client-side code (one instance)
- Database IDs exposed (should use slugs)

---

## 🚀 PERFORMANCE ISSUES

### Database
- Missing indexes on frequently queried fields
  ```sql
  -- Need these indexes
  CREATE INDEX idx_products_status ON products(status);
  CREATE INDEX idx_products_created ON products(created_at);
  CREATE INDEX idx_orders_buyer ON orders(buyer_id);
  ```

### Images
- No lazy loading implemented
- Missing responsive image sizes
- No image optimization pipeline

### Bundle Size
- Importing entire libraries
  ```typescript
  // BAD
  import * as Icons from 'lucide-react';
  
  // GOOD  
  import { Search, User } from 'lucide-react';
  ```

---

## 🧪 TESTING GAPS

### Missing Tests
- No E2E tests for checkout flow
- No unit tests for cart store
- No API endpoint tests
- No component tests

### Test Data
- Seed script incomplete
- Missing edge case data
- No performance test data

---

## 📱 MOBILE ISSUES

### Responsive Design
- Checkout form breaks on small screens
- Product grid not optimized for mobile
- Modal dialogs too large on mobile

### Touch Interactions  
- Swipe gestures not implemented
- Touch targets too small
- No pull-to-refresh

---

## 🎯 PRIORITY MATRIX

### Do First (Blocking Production)
1. Payment webhook → order creation
2. Mobile navigation fix
3. Production environment variables
4. Image URL handling

### Do Soon (Bad UX)
1. Loading states everywhere
2. Error boundaries
3. Cart state sync
4. Search implementation

### Do Later (Nice to Have)
1. Component consolidation
2. Performance optimizations
3. Advanced analytics
4. Test coverage

---

## 📋 CODE TODOS FOUND

```typescript
// TODO: Implement rate limiting (auth-middleware.ts:34)
// TODO: Add webhook signature verification (stripe/route.ts:22)
// TODO: Implement image compression (upload-utils.ts:56)
// TODO: Add database connection pooling (database.ts:12)
// TODO: Implement cache invalidation (cache-store.ts:89)
// FIXME: Memory leak in real-time connection (pusher-client.ts:45)
// HACK: Temporary solution for date formatting (format-date.ts:23)
```

---

*Last scanned: January 9, 2025*
*Next scan: After implementing priority fixes*