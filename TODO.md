# 📋 THREADLY DEVELOPMENT TODO

*Active task tracking for immediate development priorities*

## ✅ COMPLETED TODAY

### Fix Message Seller Flow ✅
- [x] **Create conversation creation endpoint** - Uses existing createConversation action
- [x] **Handle `?user=` param in messages page** - Added support for user & product params
- [x] **Fix "Message Seller" button** - Now includes both user and product IDs
- [x] **Add NewConversationCard component** - Clean UI for starting conversations
- [x] **Test buyer-seller messaging flow** - TypeScript validation passed

## 🚨 CRITICAL (Next Up)

## 🔴 HIGH PRIORITY (Next Up)

### Fix Image Upload in Development
- [ ] **Configure UploadThing for dev environment**
  - Check environment variables
  - Fix callback URLs for dev
  
- [ ] **Remove object URL fallback that breaks**
  - Update image-upload component
  - Ensure persistence in database

### Fix Database Field Mismatches  
- [ ] **Change all `order` to `displayOrder` for images**
  - Update edit-product-form.tsx 
  - Update product-actions.ts
  - Fix TypeScript interfaces

### Enable Email Notifications
- [ ] **Add RESEND_API_KEY to environment**
- [ ] **Uncomment email sending code**
- [ ] **Create welcome email template**
- [ ] **Test email delivery**

## 🟡 MEDIUM PRIORITY

### Fix Price Display Inconsistencies
- [ ] **Update all price displays to use formatPrice utility**
  - browse-content.tsx: `${product.price.toFixed(2)}` → `formatPrice(product.price * 100)`
  - search page, cart components, etc.
  - Standardize on database dollars → display formatting

### Mobile Navigation
- [ ] **Fix hamburger menu touch targets**
- [ ] **Add swipe gestures**
- [ ] **Improve responsive design**

## ✅ COMPLETED TODAY

- [x] Fix XSS vulnerability in messages (added sanitization)
- [x] Fix race condition in order creation 
- [x] Add payment metadata validation
- [x] Standardize price handling to use cents
- [x] Update validation schemas for cents
- [x] Create price utility functions

---

## 📚 REFERENCE

**Main docs for planning:**
- `/STATUS.md` - Overall project status and metrics
- `/ISSUES.md` - Detailed technical issues with line numbers  
- `/ROADMAP.md` - Long-term feature planning
- `/APPS.md` - Per-app implementation tracking

**Current focus:** Fixing core marketplace functionality for production readiness

*Last updated: January 9, 2025*