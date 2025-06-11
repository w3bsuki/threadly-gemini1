# 🚨 CRITICAL PATH TO LAUNCH - NO BS EDITION

**Current Reality**: 55% complete, would fail catastrophically if launched  
**Minimum to Beta**: 1 week of focused work  
**Production Ready**: 2-3 weeks  

---

## 🔴 DAY 1: STOP THE BLEEDING (4 hours)

### 1. Re-enable Stripe Connect (30 minutes)
```typescript
// File: /apps/app/app/(authenticated)/selling/new/page.tsx
// Uncomment lines 22-26
if (!stripeConnectedAccountId || stripeAccountStatus !== 'connected') {
  redirect('/selling/onboarding');
}
```
**Why**: Without this, sellers can't get paid = lawsuits

### 2. Fix Email Import Paths (1 hour)
```typescript
// File: /apps/app/app/(authenticated)/buying/checkout/actions/create-order.ts
// Line 262: Change this
import { sendEmail } from '@repo/notifications/src';
// To this:
import { sendOrderConfirmationEmail } from '@repo/email';

// Then actually call it:
await sendOrderConfirmationEmail(order);
```
**Why**: Customers need order confirmations = trust

### 3. Add Database Backup (1.5 hours)
```bash
# Set up automated PostgreSQL backups
# Document restore process
# Test restore to verify it works
```
**Why**: When (not if) something breaks, you need recovery

### 4. Enable Error Tracking (1 hour)
```typescript
// Add to .env
SENTRY_DSN=your_actual_dsn_here

// Verify it's catching errors in production
```
**Why**: You're blind without error tracking

---

## 🔴 DAY 2-3: FIX THE MONEY (Most Critical)

### 1. Implement Real Payments on Web App (2 days)
```typescript
// File: /apps/web/app/api/stripe/create-checkout-session/route.ts
// DELETE ALL MOCK CODE
// Copy working implementation from:
// /apps/app/app/api/stripe/create-payment-intent/route.ts

// Key changes needed:
// - Handle guest checkout (no auth required)
// - Create Stripe customer for email
// - Store customer info for order
// - Return real checkout session
```

### 2. Create Basic Refund System (1 day)
```typescript
// Create: /apps/api/app/api/orders/[id]/refund/route.ts
export async function POST(req, { params }) {
  const { id } = await params;
  
  // 1. Verify order exists and is refundable
  // 2. Create Stripe refund
  // 3. Update order status to REFUNDED
  // 4. Update product status to AVAILABLE
  // 5. Send refund confirmation email
  // 6. Notify seller
}

// Add basic UI in admin panel to trigger refunds
```

### 3. Test Full Payment Flow (4 hours)
- Create Stripe test account
- Make real purchase (test mode)
- Verify money flows correctly
- Test refund process
- Document any issues

---

## 🟡 DAY 4-5: FIX THE DATABASE

### 1. Add Missing Constraints (1 day)
```sql
-- Migration file to add constraints
ALTER TABLE "Order" 
  ADD CONSTRAINT "Order_buyerId_fkey" 
  FOREIGN KEY ("buyerId") REFERENCES "User"("id") 
  ON DELETE RESTRICT;

ALTER TABLE "Review"
  ADD CONSTRAINT "Review_reviewerId_fkey"
  FOREIGN KEY ("reviewerId") REFERENCES "User"("id")
  ON DELETE CASCADE;

-- Add CHECK constraints
ALTER TABLE "Product" 
  ADD CONSTRAINT "Product_price_positive" 
  CHECK (price >= 0);

ALTER TABLE "Review"
  ADD CONSTRAINT "Review_rating_range"
  CHECK (rating >= 1 AND rating <= 5);
```

### 2. Change Float to Decimal (1 day)
```prisma
// In schema.prisma, change:
price Float
// To:
price Decimal @db.Decimal(10, 2)

// Same for Order.amount, Payment.amount
```

### 3. Test Migration Thoroughly
- Backup production data first
- Run migration on copy
- Verify no data corruption
- Have rollback plan ready

---

## 🟡 DAY 6-7: MAKE IT USABLE

### 1. Connect Email System (4 hours)
```typescript
// Fix all email sends:
// - Welcome email in auth webhook
// - Order confirmation in checkout
// - Shipping notification in ship endpoint
// - Delivery confirmation in deliver endpoint
```

### 2. Create Order Management UI (1 day)
```typescript
// Create: /apps/web/app/[locale]/orders/page.tsx
// - Require authentication
// - Show order list with status
// - Link to order details
// - Show tracking info
```

### 3. Fix Critical Mobile Issues (1 day)
```css
/* Global CSS fixes needed */
button, a, [role="button"] {
  min-height: 44px;
  min-width: 44px;
  padding: 12px;
}

input, select, textarea {
  font-size: 16px !important;
}

.bottom-nav {
  z-index: 40;
}

main {
  padding-bottom: 80px;
}
```

---

## 🚀 WEEK 2: BETA READY

### Must Complete:
1. **Search Filters** (2 days)
   - Price range
   - Size/Brand/Condition
   - Sort options

2. **User Profiles** (1 day)
   - Show real seller data
   - List products
   - Display ratings

3. **Basic Analytics** (2 days)
   - Replace placeholders
   - Show real revenue
   - Basic charts

4. **Testing** (2 days)
   - Full user journey tests
   - Payment flow tests
   - Mobile testing
   - Load testing

---

## 💀 WHAT NOT TO DO

### DON'T Launch Without:
1. ❌ Real payments (legal disaster)
2. ❌ Database constraints (data corruption)
3. ❌ Email confirmations (trust destroyer)
4. ❌ Stripe Connect enforcement (can't pay sellers)
5. ❌ Basic refund capability (trapped money)

### DON'T Waste Time On:
1. ⏸️ Perfect analytics (can add later)
2. ⏸️ Advanced search (basic is enough)
3. ⏸️ Social features (following can wait)
4. ⏸️ Promotional tools (not critical)
5. ⏸️ PWA features (nice to have)

---

## ✅ DEFINITION OF "READY"

### Beta Ready (1 week):
- [ ] Can list products (with payment account)
- [ ] Can buy products (real money)
- [ ] Get email confirmations
- [ ] Can track orders
- [ ] Can request refunds
- [ ] Mobile basically works
- [ ] Errors are tracked

### Production Ready (2-3 weeks):
- [ ] All above +
- [ ] Search filters work
- [ ] User profiles complete
- [ ] Analytics functional
- [ ] Performance optimized
- [ ] Comprehensive testing
- [ ] Documentation complete

---

## 🎯 THE ONE-WEEK SPRINT

If you have exactly one week:

**Day 1**: Stripe enforcement + Email fixes (4 hrs)  
**Day 2-3**: Real web payments (16 hrs)  
**Day 4**: Database constraints (8 hrs)  
**Day 5**: Refund system (8 hrs)  
**Day 6**: Order UI + Mobile fixes (8 hrs)  
**Day 7**: Testing + Bug fixes (8 hrs)  

**Result**: Functional beta that won't destroy your reputation

---

## 📞 GET HELP CHECKLIST

Before launch, ensure you have:
1. **Lawyer**: For terms of service
2. **Accountant**: For tax implications  
3. **Support person**: For user issues
4. **DevOps**: For scaling/monitoring
5. **Payment expert**: For Stripe setup

---

**Remember**: A broken marketplace is worse than no marketplace. Fix the money flow first, everything else can follow.**