# 🚨 URGENT: Vercel Build Fix

**Current Issue**: Build failing due to Clerk environment variable validation

## ⚠️ IMPORTANT: Custom Domain Required

**Clerk blocks `.vercel.app` domains for production apps.** You have 2 options:

### Option A: Use Custom Domain (Recommended)
1. **Buy a domain** (e.g., `threadly.io`, `getthreadly.com`)
2. **Add to Vercel**: Project Settings → Domains
3. **Configure Clerk** with your custom domain

### Option B: Use Development Keys for Now
Keep using `pk_test_` and `sk_test_` keys until you get a custom domain.

## 🔧 How to Fix

### Step 1: Go to Vercel Dashboard
1. Open your Vercel project
2. Go to **Settings** → **Environment Variables**

### Step 2: Add These Variables for "Production" Environment

```bash
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

**Important**: 
- Values must start with `/` (forward slash)
- No quotes needed in Vercel dashboard
- Set for "Production" environment

### Step 3: Add Clerk Keys

**Option A - Custom Domain (Production):**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_live_YOUR_KEY_HERE
```

**Option B - Development Keys (Temporary):**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE  
CLERK_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

Get these from: https://dashboard.clerk.com → Your App → API Keys

### Step 4: Redeploy

After adding the environment variables, trigger a new deployment:
- Go to **Deployments** tab
- Click **Redeploy** on the latest deployment

## 🎯 Root Cause

The `.env.production` file I created provides fallback values for the build process, but Vercel needs the actual environment variables set in the dashboard for validation to pass.

## ✅ Verification

After setting the variables, your build should pass. You'll see:
```
✓ Environment variables validated
✓ Build completed successfully
```

## 📋 Complete Environment Variables Needed

For a full production deployment, you'll eventually need:

```bash
# Authentication (Required for build)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Database (Required for runtime)
DATABASE_URL=postgresql://...

# Application URLs (Required)
# Option A - Custom Domain:
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
NEXT_PUBLIC_WEB_URL=https://yourdomain.com  
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Option B - Vercel domains (for development/testing):
NEXT_PUBLIC_APP_URL=https://threadly-app.vercel.app
NEXT_PUBLIC_WEB_URL=https://threadly-web.vercel.app
NEXT_PUBLIC_API_URL=https://threadly-api.vercel.app
```

But for now, just add the Clerk variables to fix the build.

---

*Fix this immediately to get your deployment working!*