# 🌐 WEB APP PRODUCTION CHECKLIST

**App**: `/apps/web` - Public-facing marketplace  
**Status**: ~70% Complete  
**Priority**: Critical for user acquisition  

---

## 🎯 CRITICAL FIXES (Must Have for Launch)

### 1. ❌ Enable Real Payment Processing
**Current**: Mock payment intent returned  
**Files**: `/apps/web/app/api/stripe/create-checkout-session/route.ts`  
**Fix**:
```typescript
// Remove mock response, use real Stripe
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [...],
  mode: 'payment',
  success_url: `${process.env.NEXT_PUBLIC_WEB_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXT_PUBLIC_WEB_URL}/cart`,
});
```

### 2. ❌ Single Product Checkout
**Issue**: No direct checkout from product page  
**Files**: Create `/apps/web/app/[locale]/checkout/[productId]/page.tsx`  
**Implementation**:
- Copy checkout flow from /app dashboard
- Allow guest checkout with email
- Create order after payment success
- Show order confirmation

### 3. ❌ User Profiles Display
**Current**: Basic page with no data  
**Files**: `/apps/web/app/[locale]/profile/[id]/page.tsx`  
**Add**:
- Seller stats (sales, rating, member since)
- Product listings grid
- Reviews received
- Follow/unfollow button (if authenticated)
- Share profile button

### 4. ❌ Messaging Integration
**Current**: Mock UI only  
**Files**: `/apps/web/app/[locale]/messages/components/messages-content.tsx`  
**Fix**:
- Redirect unauthenticated users to sign in
- For authenticated: Show "Sign in on Threadly App to message"
- Or: Implement basic message viewing (read-only)

### 5. ❌ Order History
**Missing**: No way to view orders  
**Create**: `/apps/web/app/[locale]/orders/page.tsx`  
**Implementation**:
- Require authentication
- Fetch orders from database
- Show order status and tracking
- Link to order details

---

## 🔧 FEATURE COMPLETION

### 1. 🟡 Enhanced Product Filters
**Current**: Basic category filter  
**Files**: `/apps/web/app/[locale]/products/components/product-filters.tsx`  
**Add**:
```typescript
- Price range slider (min/max)
- Size selector (XS-XXL)
- Color filter
- Condition filter (New/Like New/Good/Fair)
- Brand search
- Sort by: Price, Newest, Most Popular
- Clear all filters button
```

### 2. 🟡 Wishlist/Favorites Page
**Current**: API works but no UI  
**Create**: `/apps/web/app/[locale]/favorites/page.tsx`  
**Features**:
- Grid of favorited items
- Remove from favorites
- Add all to cart
- Share wishlist
- Price drop notifications opt-in

### 3. 🟡 Search Enhancements
**Current**: Basic search works  
**Files**: `/apps/web/app/[locale]/search/components/search-results.tsx`  
**Add**:
- Search suggestions dropdown
- Recent searches (localStorage)
- Popular searches
- "No results" suggestions
- Search by image (future)

### 4. 🟡 Category Landing Pages
**Current**: Redirect to products  
**Files**: `/apps/web/app/[locale]/[category]/page.tsx` (men, women, kids, etc.)  
**Add**:
- Hero banner with category image
- Featured products carousel
- Trending in category
- Category-specific filters
- Style guide content

### 5. ✅ Mobile Navigation
**Status**: Mostly complete  
**Files**: `/apps/web/app/[locale]/components/bottom-nav-mobile.tsx`  
**Polish**:
- Fix z-index conflicts
- Add badge for cart count
- Highlight active page
- Smooth transitions

---

## 💅 UI/UX POLISH

### 1. Loading States
**Add loading.tsx files**:
```
/app/[locale]/products/loading.tsx
/app/[locale]/search/loading.tsx  
/app/[locale]/cart/loading.tsx
/app/[locale]/checkout/loading.tsx
/app/[locale]/profile/[id]/loading.tsx
```

### 2. Error Handling
**Add error.tsx files**:
```
/app/[locale]/products/error.tsx
/app/[locale]/checkout/error.tsx
/app/[locale]/error.tsx (global)
```

### 3. Empty States
**Improve UX when no data**:
- Empty cart → "Start shopping" CTA
- No search results → Suggestions
- No products in category → Related categories
- Profile no listings → "Seller has no items"

### 4. Micro-interactions
**Add polish**:
- Heart animation on favorite
- Cart badge bounce on add
- Smooth image loading
- Skeleton screens
- Success haptics (mobile)

---

## 📱 MOBILE OPTIMIZATION

### Critical Fixes:
```css
/* Ensure touch targets are 44px minimum */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Fix bottom nav overlapping content */
.pb-safe {
  padding-bottom: calc(env(safe-area-inset-bottom) + 60px);
}

/* Improve form inputs on mobile */
input, textarea, select {
  font-size: 16px; /* Prevents zoom on iOS */
}
```

### Gestures:
- Swipe between product images
- Pull to refresh on listings
- Swipe to delete from cart
- Long press to preview

---

## 🔍 SEO CRITICAL

### 1. Meta Tags
**Every page needs**:
```typescript
export const metadata: Metadata = {
  title: 'Page Title - Threadly',
  description: 'Unique description 150-160 chars',
  openGraph: {
    images: ['/og-image.png'],
  },
};
```

### 2. Structured Data
**Add to product pages**:
```typescript
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.title,
  image: product.images,
  description: product.description,
  offers: {
    '@type': 'Offer',
    price: product.price,
    priceCurrency: 'USD',
    availability: 'InStock',
    seller: {
      '@type': 'Person',
      name: product.seller.name,
    },
  },
};
```

### 3. Performance
**Optimize**:
- Use `next/image` with blur placeholders
- Lazy load below-fold content
- Minimize JavaScript bundles
- Cache API responses

---

## 🧪 TESTING CHECKLIST

### User Flows to Test:
1. **Browse & Search**
   - [ ] Land on homepage
   - [ ] Browse by category
   - [ ] Use filters
   - [ ] Search for items
   - [ ] View product details

2. **Purchase Flow**
   - [ ] Add to cart
   - [ ] Update quantities
   - [ ] Apply filters
   - [ ] Guest checkout
   - [ ] Payment success

3. **Favorites**
   - [ ] Add/remove favorites
   - [ ] View favorites page
   - [ ] Persist across sessions

4. **Mobile Experience**
   - [ ] All touch targets work
   - [ ] No horizontal scroll
   - [ ] Forms are usable
   - [ ] Images load properly

---

## 🚀 DEPLOYMENT CHECKLIST

### Environment Variables:
```bash
NEXT_PUBLIC_WEB_URL=https://threadly.com
NEXT_PUBLIC_APP_URL=https://app.threadly.com
NEXT_PUBLIC_API_URL=https://api.threadly.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
NEXT_PUBLIC_POSTHOG_KEY=xxx
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXX
```

### Pre-deployment:
- [ ] Run `pnpm build` locally
- [ ] Fix all TypeScript errors
- [ ] Test all critical paths
- [ ] Optimize images
- [ ] Review bundle size

### Post-deployment:
- [ ] Verify payment flow
- [ ] Check all environment variables
- [ ] Test on real mobile devices
- [ ] Monitor error logs
- [ ] Check page speed scores

---

## 📋 PRIORITY ORDER

### Day 1 (8 hours):
1. Enable real payment processing (2h)
2. Implement single product checkout (2h)
3. Fix user profiles display (2h)
4. Add order history page (2h)

### Day 2 (8 hours):
1. Complete product filters (2h)
2. Create favorites page (2h)
3. Enhance search features (2h)
4. Mobile optimizations (2h)

### Day 3 (4 hours):
1. Loading states (1h)
2. Error handling (1h)
3. SEO improvements (1h)
4. Final testing (1h)

---

## ✅ DEFINITION OF DONE

The web app is ready when:
- [ ] Users can browse without signing in
- [ ] Search returns relevant results
- [ ] Filters narrow down products
- [ ] Product pages show all details
- [ ] Add to cart works smoothly
- [ ] Checkout processes payments
- [ ] Orders are created successfully
- [ ] Mobile experience is flawless
- [ ] Page loads are under 3 seconds
- [ ] No console errors in production

---

## 🎯 SUCCESS METRICS

Monitor after launch:
- **Bounce Rate**: < 40%
- **Add to Cart Rate**: > 10%
- **Checkout Completion**: > 60%
- **Mobile Traffic**: > 50%
- **Page Load Time**: < 3s
- **Search Usage**: > 30%
- **Return Visitors**: > 20%

---

*Remember: The web app is the first impression. It must be fast, beautiful, and intuitive.*