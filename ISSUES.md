# 🐛 THREADLY ISSUES TRACKER

> Bug reports and technical debt with EXACT file locations (use TODO.md for active tasks)

*Last Updated: January 10, 2025*

## 🚨 HOW WE WORK
- **ISSUES.md** = Bugs, broken code, technical debt (with file paths)
- **TODO.md** = Active development tasks, what we're building now

## 🔴 CRITICAL (Blocking Production)

### Production UI Completely Broken
**Issue**: NO buttons or UI elements work after sign-in on deployed app  
**Files**: Multiple potential causes:
- `/apps/app/env.ts` - Missing NEXT_PUBLIC_API_URL
- `/apps/app/middleware.ts` - Might be blocking client-side navigation
- `/apps/api/middleware.ts` - CORS headers might be missing
- All button components - onClick handlers might not be bound

**Symptoms**:
- User can sign in successfully
- After sign in, no buttons are clickable
- Forms don't submit
- Navigation doesn't work

**Likely Causes**:
1. Missing `NEXT_PUBLIC_API_URL` environment variable
2. API requests failing due to CORS
3. Hydration mismatch breaking React
4. JavaScript not loading properly
5. Authentication state not persisting

---

## 🟡 HIGH PRIORITY (Degraded Experience)

### UI Implementation Needed

#### Following Feed UI
**File**: `/apps/app/app/(authenticated)/following/page.tsx`  
**Issue**: API endpoints exist but UI not implemented  
**Impact**: Users can't see who they follow or their feed  
**Fix**: Create feed component using existing API endpoints

#### Follower Count Display  
**File**: `/apps/app/app/(authenticated)/profile/components/profile-content.tsx`  
**Lines**: Need to add follower/following counts  
**Issue**: API returns counts but UI doesn't display them  
**Impact**: Users can't see their social metrics

#### Analytics Dashboard
**Files**: `/apps/app/app/(authenticated)/selling/dashboard/*`  
**Issue**: PostHog tracking active but no dashboard UI  
**Impact**: Sellers can't see their performance metrics  
**Fix**: Create dashboard components using PostHog data

---

## 🟢 LOW PRIORITY (Nice to Have)

### Missing Features

#### Keyboard Shortcuts
**File**: Create `/apps/app/lib/hooks/use-keyboard-shortcuts.ts`  
**Issue**: No keyboard navigation implemented  
**Impact**: Power users can't navigate efficiently  
**Shortcuts needed**: 
- `Cmd+K` - Search
- `Cmd+/` - Help
- `Esc` - Close modals

#### Help Documentation  
**File**: Create `/apps/app/app/(authenticated)/help/page.tsx`  
**Issue**: No user-facing documentation  
**Impact**: Users have to figure things out themselves  
**Needed**: FAQ, guides, tutorials

#### Bundle Size Optimization
**File**: `/apps/*/next.config.ts`  
**Issue**: No bundle analysis or optimization  
**Impact**: Larger than necessary downloads  
**Fix**: Add bundle analyzer, lazy load heavy components

---

## ✅ RECENTLY FIXED (Last 24 Hours)

### Performance & Infrastructure
- ✅ **Redis Caching** - All API routes now cached with Upstash
- ✅ **Rate Limiting** - All endpoints protected
- ✅ **Lazy Loading** - Images load on intersection
- ✅ **Service Worker** - Offline support implemented

### User Experience
- ✅ **Category System** - Dynamic from database, no hardcoding
- ✅ **Error Pages** - Custom 404/500 pages created
- ✅ **Form Validation** - User-friendly Zod messages
- ✅ **Loading States** - Comprehensive skeletons
- ✅ **Mobile Touch Targets** - 44px minimum achieved
- ✅ **Pull-to-Refresh** - Mobile gesture support
- ✅ **Animations** - Smooth transitions throughout

### Features
- ✅ **Follow System API** - Complete REST endpoints
- ✅ **PostHog Analytics** - 30+ events tracked
- ✅ **Sitemap Generation** - Dynamic SEO sitemap
- ✅ **Email System** - Resend integration complete
- ✅ **Search System** - Algolia fully integrated

---

## 📋 HOW TO USE THIS FILE

1. **When you find a bug**: Add it here with exact file path and line numbers
2. **When starting work**: Pick issues from Critical → High → Low priority  
3. **When fixing**: Move to "Recently Fixed" section
4. **Weekly cleanup**: Remove old items from "Recently Fixed"

## 🏷️ ISSUE TAGS

- **[BUG]** - Something broken
- **[INCOMPLETE]** - Feature partially implemented  
- **[TODO]** - Code has TODO comment
- **[PERF]** - Performance issue
- **[SEC]** - Security concern
- **[UI]** - User interface issue
- **[API]** - Backend issue