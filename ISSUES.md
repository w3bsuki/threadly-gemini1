# 🐛 THREADLY TECHNICAL ISSUES TRACKER

*All code issues, TODOs, incomplete functions, and technical debt*

## 🔴 INCOMPLETE IMPLEMENTATIONS

### Payment Processing
- **File**: `/apps/app/app/(authenticated)/buying/checkout/actions/create-order.ts`
  - ✅ **FIXED**: Removed early SOLD status update to prevent race condition
  - **TODO Line 99**: Shipping details need separate storage
  - **TODO Line 132**: Email notifications not implemented
  - **TODO Line 151**: Real-time notifications not implemented
  
- **File**: `/apps/app/app/api/stripe/create-checkout-session/route.ts`
  - **Issue**: Creates payment intents, not checkout sessions (naming mismatch)
  - **Missing**: No timeout handling for abandoned checkouts
  - **Missing**: No mechanism to revert RESERVED status on failure

- **File**: `/apps/api/app/webhooks/payments/route.ts`
  - ✅ Actually working! Updates order to PAID and product to SOLD
  - ✅ **FIXED**: Added proper metadata validation before accessing fields

### Product Management
- **File**: `/apps/app/app/(authenticated)/selling/new/components/product-form.tsx`
  - ✅ **FIXED**: Price now properly converted to cents
  
- **File**: `/apps/app/app/(authenticated)/selling/new/actions/create-product.ts`
  - ✅ **FIXED**: Updated to use priceCentsSchema and convert to dollars for database
  
- **File**: `/apps/app/app/(authenticated)/selling/new/components/image-upload.tsx`
  - ✅ **FIXED**: Removed development bypass that used non-persistent object URLs
  - ✅ **FIXED**: UploadThing callbacks now working properly in development
  
- **File**: `/apps/app/app/(authenticated)/selling/listings/[id]/edit/components/edit-product-form.tsx`
  - **BUG Lines 254-259**: Category selector hardcoded (should be dynamic)
  - ✅ **FIXED**: Price field now handles cents conversion
  - **BUG**: Uses `order` but schema has `displayOrder` field
  
- **File**: `/apps/app/app/(authenticated)/selling/listings/[id]/edit/actions/product-actions.ts`
  - ✅ **FIXED**: Updated to use priceCentsSchema and convert to dollars for database
  - **BUG Line 149**: Creates images with `order` field but schema expects `displayOrder`

### Messaging System  
- **File**: `/apps/app/app/(authenticated)/messages/components/messages-content.tsx`
  - **Missing**: Loading states for messages
  - **TODO**: Implement message pagination
  - **Bug**: Typing indicator not clearing properly
  - **Bug Line 129-134**: Real-time updates only trigger router refresh (bad UX)
  
- **File**: `/apps/app/app/(authenticated)/product/[id]/components/product-detail-content.tsx`
  - ✅ **FIXED**: "Message Seller" now navigates with both user and product params
  - ✅ **FIXED**: Messages page handles new conversation creation
  
- **File**: `/apps/app/app/(authenticated)/messages/actions/message-actions.ts`
  - ✅ **FIXED**: Message content now sanitized with `sanitizeForDisplay()`
  
- **File**: `/apps/api/app/api/messages/route.ts`
  - ✅ **FIXED**: Message content now sanitized before storage
  - **Missing**: No file/image attachment support (schema has it, no implementation)

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

### Price Display Inconsistencies
- **Multiple Files**: Inconsistent price display formatting
  - Some expect dollars: `${product.price.toFixed(2)}`
  - Some expect cents: `${(price / 100).toFixed(2)}`
  - Need to standardize using formatPrice utility
  - Created `/packages/utils/src/price.ts` with formatting utilities

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

4. **UploadThing Route Access**
   - ✅ **FIXED**: Added `/api/uploadthing` to public routes in middleware
   - ✅ **FIXED**: Improved error handling in upload callbacks
   - ✅ **FIXED**: Added development mode configuration with proper logging

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

### Email & Notification System
- **Infrastructure EXISTS but DISABLED**:
  - **File**: `/apps/app/app/(authenticated)/buying/checkout/actions/create-order.ts`
    - **Lines 131-148**: Order confirmation email COMMENTED OUT
  - **File**: `/apps/app/app/(authenticated)/messages/actions/message-actions.ts`
    - **Line 126**: New message email COMMENTED OUT
  - **File**: `/apps/api/app/webhooks/auth/route.ts`
    - **Missing**: No welcome email on user creation
  
- **Email Templates Available**:
  - ✅ Order confirmation template exists
  - ✅ New message template exists  
  - ✅ Payment received template exists
  - ❌ Welcome email template MISSING
  
- **Required to Enable**:
  - Set `RESEND_API_KEY` environment variable
  - Uncomment email sending code
  - Create welcome email template

### Other Missing Integrations
- [ ] SMS notifications not implemented
- [ ] Push notifications not set up
- [ ] Analytics tracking incomplete (PostHog configured but not used)
- [ ] Search indexing not running (Algolia configured but not indexing)

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

### Navigation Problems
- **File**: `/apps/web/app/[locale]/components/header/index.tsx`
  - **Line 305-318**: Mobile search lacks proper keyboard handling
  - **Line 250-258**: Menu toggle touch target too small (< 44px)
  - **Line 423-477**: No swipe gestures to close mobile menu
  - **Missing**: `enterkeyhint="search"` for mobile keyboards

- **File**: `/apps/app/app/(authenticated)/components/sidebar.tsx`
  - **Line 185-341**: Desktop-first design, no mobile navigation
  - **Missing**: Bottom navigation for mobile app
  - **Missing**: Swipe gestures for sidebar

- **File**: `/apps/web/app/[locale]/components/bottom-nav-mobile.tsx`
  - **Line 104-120**: Jarring scroll-based visibility
  - **Line 357**: Missing spacer causing content to hide behind nav

### Touch Interaction Issues
- **File**: `/apps/web/app/[locale]/product/[id]/components/product-detail.tsx`
  - **Line 148-165**: Basic swipe lacks momentum/physics
  - **Line 204-210**: Touch events don't prevent defaults
  - **Missing**: Pinch-to-zoom on images

### Responsive Design Problems  
- **Global Issues**:
  - Touch targets below 44x44px minimum
  - Using `100vh` instead of `100dvh` (browser chrome issues)
  - No safe area handling for notches
  - Form inputs < 16px cause zoom on iOS
  - No `-webkit-tap-highlight-color` reset

### Missing Mobile Features
- No pull-to-refresh anywhere
- No offline support/PWA
- No haptic feedback
- No deep linking
- No mobile app install banners
- No reduced motion support

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