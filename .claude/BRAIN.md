# 🧠 BRAIN.md - Active Memory & Decision Log

## Current Focus
**Task**: UI/UX Perfection for /web marketplace frontend
**Why**: Database working, need mobile-first UX with 2-click purchases
**Started**: 2025-01-08
**Priority**: Make best navigation system and flow

**Summary**: 
1. Created clean documentation system (.claude brain)
2. Diagnosed empty database as root cause
3. Fixed migrations and seeded data
4. Verified products now display correctly

## Architecture Understanding

### Project Structure
- **Monorepo**: Turborepo with 3 main apps
  - `/app` - Authenticated dashboard (port 3000)
  - `/web` - Public marketplace (port 3001) 
  - `/api` - Backend services (port 3002)
- **Database**: Prisma with PostgreSQL
- **Auth**: Clerk integration
- **Payments**: Stripe Connect

### Key Patterns Noticed
1. **Dual-app architecture** - Public web separate from authenticated app
2. **Heavy use of server components** - Product grids, categories
3. **Mock data prevalent** - Many features show fake data instead of real
4. **Database queries working** - Code is correct, but no data exists

### Critical Insights
- Build errors fixed, but runtime errors remain
- Database schema exists and is sound
- Queries are properly structured
- **Root cause hypothesis**: Database not seeded/connected

### Reality Check (from deleted docs)
**Working (60%)**:
- Database schema complete
- Auth (Clerk) integrated
- API routes work
- Product creation saves to DB
- Messaging works (Pusher)
- Image upload works (UploadThing)

**Fake/Mock (40%)**:
- Homepage products hardcoded
- Checkout flow simulated
- Product grid uses mock array
- Search not connected
- Category pages static

## Key Decisions & Reasoning

### Decision 1: Clean Documentation First
**Reasoning**: Previous docs claimed "75% complete" but reality showed broken features. Clean slate prevents false assumptions.

### Decision 2: Focus on Database Issue
**Reasoning**: "Unable to load products" blocks all marketplace functionality. Core feature must work before anything else.

## Mental Models

### Data Flow (Verified)
```
User → Web App → Server Component → Prisma Query → Database
         ↓                                             ↓
    Locale Redirect                              19 Products ✓
         ↓
    /en route works
```

### Fixed Issues Pattern
1. **Empty Database** → Run seed scripts with env loaded
2. **Locale Middleware** → Access via /en works, root redirects
3. **TypeScript Errors** → Import paths and schema mismatches
4. **Build Success ≠ Working App** → Runtime needs data

### Remaining Issues
- Redis cache not initialized (non-blocking)
- ErrorPage export missing (warning only)
- Root path locale detection needs fix

## Lessons Learned
- **Always check data first** - code can be perfect but empty DB = no products
- **Environment matters** - scripts need explicit env loading
- **Middleware can block everything** - locale error prevented all access
- **API endpoints bypass middleware** - good for debugging