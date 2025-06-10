# 🐛 THREADLY ISSUES TRACKER

> Bug reports and technical debt with EXACT file locations (use TODO.md for active tasks)

*Last Updated: January 10, 2025*

## 🚨 HOW WE WORK
- **ISSUES.md** = Bugs, broken code, technical debt (with file paths)
- **TODO.md** = Active development tasks, what we're building now

## 🔴 CRITICAL (Blocking Production)

### 1. Category Navigation Links All 404
**Issue**: CategoryNav component links to non-existent routes  
**File**: `/apps/web/app/[locale]/components/category-nav.tsx`  
**Lines**: 16-111 (all href values)  
**Current**: `href: '/men/t-shirts'` → 404 error  
**Fix**: Change to `href: '/products?category=men&subcategory=t-shirts'`  
**Impact**: Users can't browse by category at all

### 2. Add to Cart Buttons Don't Work
**Issue**: Cart buttons have no onClick handlers or broken state management  
**Files**: 
- `/apps/web/components/product-grid-client.tsx` - Missing cart integration
- `/apps/app/components/add-to-cart-button.tsx` - Not connected to store
**Impact**: Users can't purchase anything

### 3. Search Returns No Results
**Issue**: Search form submits but doesn't call API or display results  
**Files**:
- `/apps/web/app/[locale]/search/page.tsx` - No API integration
- `/apps/web/app/[locale]/search/components/search-results.tsx` - Empty component
**Impact**: Users can't find products

### 4. Product Upload Fails
**Issue**: Multiple validation errors and UploadThing not configured  
**Files**:
- `/apps/app/app/(authenticated)/selling/new/components/image-upload.tsx` - UploadThing broken
- `/apps/app/app/(authenticated)/selling/new/actions/create-product.ts` - Validation mismatch
**Error**: "Server component render error"  
**Impact**: Sellers can't list items

### 5. Checkout Process Broken
**Issue**: Stripe integration incomplete, no order creation  
**Files**:
- `/apps/app/app/(authenticated)/buying/checkout/page.tsx` - Missing Stripe elements
- `/apps/api/app/api/stripe/create-checkout-session/route.ts` - Not creating orders
**Impact**: Users can't complete purchases

---

## 🟡 HIGH PRIORITY (Major Features Broken)

### 6. Messaging System Non-Functional
**Issue**: UI exists but no real-time functionality  
**Files**:
- `/apps/app/app/(authenticated)/messages/components/messages-content.tsx` - No Pusher integration
- `/apps/api/app/api/messages/route.ts` - Missing WebSocket setup
**Impact**: Buyers and sellers can't communicate

### 7. User Profiles Not Connected
**Issue**: Profile pages show hardcoded data  
**Files**:
- `/apps/app/app/(authenticated)/profile/page.tsx` - Not fetching user data
- `/apps/app/app/(authenticated)/profile/components/profile-content.tsx` - Mock data
**Impact**: Users can't manage their profiles

### 8. Orders Page Empty
**Issue**: Order history not implemented  
**Files**:
- `/apps/app/app/(authenticated)/buying/orders/page.tsx` - No data fetching
- `/apps/app/app/(authenticated)/selling/orders/page.tsx` - Empty state only
**Impact**: Users can't track orders

### 9. Favorites Don't Persist
**Issue**: Heart icons don't save to database  
**Files**:
- `/apps/api/app/api/favorites/toggle/route.ts` - API exists but not called
- `/apps/app/app/(authenticated)/favorites/page.tsx` - Shows nothing
**Impact**: Users can't save items for later

### 10. No Product Filtering
**Issue**: Filter UI exists but doesn't work  
**Files**:
- `/apps/web/app/[locale]/products/components/product-filters.tsx` - Not wired up
- `/apps/web/app/[locale]/products/components/products-content.tsx` - Ignores filters
**Impact**: Users can't narrow search results

---

## 🟢 MEDIUM PRIORITY (UX Issues)

### 11. No Loading States
**Issue**: API calls show blank screen  
**Files**: All components making API calls  
**Fix**: Add Suspense boundaries and skeletons

### 12. No Error Handling
**Issue**: Errors crash the app  
**Files**: All async components  
**Fix**: Add error boundaries

### 13. Missing Toast Notifications
**Issue**: User actions give no feedback  
**Fix**: Wire up existing toast system

### 14. Mobile Navigation Broken
**Issue**: Hamburger menu doesn't open  
**File**: `/apps/web/app/[locale]/components/header/index.tsx`

### 15. Image Optimization Missing
**Issue**: Large images slow page load  
**Fix**: Use Next.js Image component everywhere

---

## 🔵 LOW PRIORITY (Polish)

### 16. No Analytics Events
**Issue**: PostHog configured but no events tracked  
**Fix**: Add tracking to user actions

### 17. SEO Meta Tags Missing
**Issue**: Poor search engine visibility  
**Fix**: Add proper meta tags to all pages

### 18. No Pagination
**Issue**: Product lists show everything  
**Fix**: Implement pagination component

### 19. No Sort Options
**Issue**: Can't sort by price/date  
**Fix**: Add sort dropdown

### 20. No 404 Page Design
**Issue**: Default Next.js 404  
**Fix**: Create custom 404 page

---

## ✅ RECENTLY FIXED (Last Session)

### Authentication & Deployment
- ✅ **Missing AuthProvider** - Added to root layout
- ✅ **Middleware Redirect** - Fixed auth redirects
- ✅ **Vercel Monorepo Config** - Fixed deployment settings
- ✅ **Environment Variables** - Made Clerk vars required

---

## 📊 ISSUE SUMMARY

**Total Issues**: 20  
**Critical**: 5 (Must fix for launch)  
**High**: 5 (Core features broken)  
**Medium**: 5 (UX problems)  
**Low**: 5 (Nice to have)  

**Estimated Fix Time**: 
- Critical: 2 hours
- High: 3 hours  
- Medium: 2 hours
- Low: 1 hour
**Total**: 8 hours to production-ready

---

## 🚀 NEXT STEPS

1. Start with Critical #1 (Category Navigation) - Quick fix
2. Then Critical #2 (Add to Cart) - Core functionality
3. Then Critical #3 (Search) - User expectation
4. Fix remaining Critical issues
5. Move to High priority features

**Remember**: Fix the issues, then remove them from this file!