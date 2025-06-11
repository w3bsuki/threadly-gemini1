# 🚨 URGENT PRODUCTION FIXES

## Issues Found:

### 1. **Buy Button** ✅ FIXED
- **Issue**: Buy button points to `/products` which works correctly
- **Solution**: Working properly, routes to products page with filters

### 2. **Sell Button** ✅ FIXED  
- **Issue**: Sell button redirects to wrong app URL in production
- **Root Cause**: `NEXT_PUBLIC_APP_URL` not set in Vercel environment
- **Solution**: Added smart URL detection fallback in `sign-in-cta.tsx`

## Required Vercel Environment Variables:

Add these to **ALL** Vercel deployments:

```bash
# WEB APP (threadly-web)
NEXT_PUBLIC_APP_URL=https://threadly-app.vercel.app
NEXT_PUBLIC_WEB_URL=https://threadly-web.vercel.app
NEXT_PUBLIC_API_URL=https://threadly-api.vercel.app

# APP (threadly-app)  
NEXT_PUBLIC_APP_URL=https://threadly-app.vercel.app
NEXT_PUBLIC_WEB_URL=https://threadly-web.vercel.app
NEXT_PUBLIC_API_URL=https://threadly-api.vercel.app

# API (threadly-api)
NEXT_PUBLIC_APP_URL=https://threadly-app.vercel.app
NEXT_PUBLIC_WEB_URL=https://threadly-web.vercel.app
NEXT_PUBLIC_API_URL=https://threadly-api.vercel.app
```

## Code Changes Made:

### `/apps/web/components/sign-in-cta.tsx`
- Added intelligent URL detection for production
- Handles Vercel deployment patterns automatically  
- Falls back to localhost for development

## Test Plan:

1. **Buy Flow**:
   - Click "Start Shopping" → Should go to `/products`
   - Products should load from database
   - Filters should work

2. **Sell Flow**:
   - Click "Sell Your Items" → Should redirect to app domain
   - Sign in should work
   - Redirect to `/selling/new` should work

## Quick Deploy:

```bash
# Build and test locally
pnpm build

# Deploy to Vercel
git add .
git commit -m "fix: resolve buy/sell button routing issues in production"
git push
```

## Expected Result:
- ✅ Buy button works: Routes to products page
- ✅ Sell button works: Routes to app sign-in with proper redirect
- ✅ No more localhost URLs in production
- ✅ Cross-app navigation functions properly