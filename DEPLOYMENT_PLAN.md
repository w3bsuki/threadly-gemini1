# Threadly Deployment Plan

## 🎯 Current Issues

### Build Failures
1. **BASEHUB_TOKEN Required Error**: Web app fails during sitemap generation when CMS token is missing
2. **CMS Import Errors**: basehub package exports not available when token isn't configured
3. **Conditional CMS Usage**: CMS package has conditional builds but web app doesn't conditionally use CMS features
4. **Environment Variable Validation**: Strict env validation failing in production without optional CMS variables

### Architecture Goals
- `/web` - Frontend marketplace (Next.js)
- `/app` - Backend API (Next.js API routes + potential future separation)
- Seamless deployment on Vercel
- Optional CMS functionality (should work with or without BASEHUB_TOKEN)

## 📋 Step-by-Step Implementation Plan

### Phase 1: Fix CMS Conditional Usage
- [ ] **1.1** Make CMS usage truly optional in web app
- [ ] **1.2** Create conditional CMS components that gracefully handle missing tokens
- [ ] **1.3** Fix sitemap generation to work without CMS
- [ ] **1.4** Update environment variable validation to make CMS variables optional

### Phase 2: Environment Configuration
- [ ] **2.1** Review and fix environment variable schemas
- [ ] **2.2** Create proper .env.example files for each app
- [ ] **2.3** Update Vercel environment variable configuration
- [ ] **2.4** Test local builds without CMS token

### Phase 3: Build Process Optimization
- [ ] **3.1** Ensure turbo.json outputs are correctly configured
- [ ] **3.2** Fix CMS package build warnings
- [ ] **3.3** Optimize build caching
- [ ] **3.4** Test build process locally and in CI

### Phase 4: Deployment Configuration
- [ ] **4.1** Configure Vercel project settings
- [ ] **4.2** Set up proper build commands for monorepo
- [ ] **4.3** Configure environment variables in Vercel dashboard
- [ ] **4.4** Test deployment process

### Phase 5: Backend API Setup
- [ ] **5.1** Review `/apps/api` structure and functionality
- [ ] **5.2** Ensure API routes are properly configured
- [ ] **5.3** Set up database connections and migrations
- [ ] **5.4** Configure authentication and security middleware

### Phase 6: Frontend-Backend Integration
- [ ] **6.1** Configure API endpoints in frontend
- [ ] **6.2** Set up proper CORS and security headers
- [ ] **6.3** Test end-to-end functionality
- [ ] **6.4** Optimize for production performance

## 🔧 Technical Implementation Details

### Environment Variables Strategy
```
Required for All:
- NEXT_PUBLIC_APP_URL
- NODE_ENV

Optional (CMS):
- BASEHUB_TOKEN (only needed if using CMS features)

Backend Specific:
- DATABASE_URL
- AUTH_SECRET
- WEBHOOK_SECRET
```

### Build Strategy
1. **Conditional CMS**: Wrap all CMS functionality in runtime checks
2. **Graceful Degradation**: App works fully without CMS, with basic content
3. **Environment-Specific Builds**: Different build outputs based on available services

### Deployment Strategy
1. **Frontend**: Deploy to Vercel with static generation where possible
2. **Backend**: Deploy API routes to Vercel Functions
3. **Database**: Use connection pooling and proper error handling
4. **Static Assets**: Optimize and serve from CDN

## 🚀 Immediate Actions Needed

### High Priority Fixes
1. Fix sitemap generation to not require BASEHUB_TOKEN
2. Make CMS components conditionally render
3. Update environment validation schema
4. Fix turbo.json outputs configuration

### Medium Priority
1. Optimize build performance
2. Set up proper error handling
3. Configure monitoring and observability

### Low Priority
1. Add comprehensive testing
2. Optimize bundle sizes
3. Set up automated deployments

## 📝 Verification Checklist

### Local Development
- [ ] App builds successfully without CMS token
- [ ] App runs in development mode
- [ ] All pages load without errors
- [ ] API endpoints respond correctly

### Production Build
- [ ] Build completes without errors
- [ ] No missing environment variable errors
- [ ] Static pages generate correctly
- [ ] Bundle analysis shows reasonable sizes

### Deployment
- [ ] Vercel build succeeds
- [ ] All pages load in production
- [ ] API endpoints work correctly
- [ ] No runtime errors in console

## 🎯 Success Criteria

1. **Successful Deployment**: Both frontend and backend deploy without errors
2. **Functional App**: Core marketplace functionality works
3. **Optional CMS**: App works with or without CMS configuration
4. **Performance**: Fast loading times and good Core Web Vitals
5. **Maintainability**: Clear separation of concerns and good code organization

## 📅 Timeline Estimate

- **Phase 1-2**: 2-3 hours (Critical fixes)
- **Phase 3-4**: 1-2 hours (Build and deployment)
- **Phase 5-6**: 2-4 hours (Backend integration)
- **Total**: 5-9 hours

## 🔄 Next Steps

1. Start with Phase 1: Fix immediate CMS conditional usage issues
2. Test build locally after each fix
3. Deploy to Vercel once build succeeds locally
4. Iterate on remaining phases based on deployment results 