# Threadly Brain System

## Current Status
Production readiness: 90%
- ✅ Core marketplace functionality working
- ✅ Authentication and security configured
- ✅ Product creation with image upload
- ✅ Checkout flow with Stripe integration
- ✅ Seller dashboard with sales analytics
- ✅ Redis caching implemented in web app
- 🚧 Email retry mechanism
- 🚧 Search indexing with Algolia

## Recently Completed
1. Fixed ErrorPage imports across all error handling files
2. Added image domains to next.config for external images
3. Fixed product creation form - prices now stored in cents
4. Connected checkout flow to Stripe payment intents
5. Implemented seller dashboard with sales history
6. Added Redis caching to web app components (ProductGrid, FeaturedCategories, NewArrivals)

## Critical Issues Resolved
- Database reference consistency (db → database)
- User ID mapping (Clerk ID → Database ID)
- Price storage and display (cents conversion)
- Schema mismatches in sales queries

## Next Priority Tasks
1. **Performance**: Add Redis caching to web app for faster product listings
2. **Reliability**: Implement email retry mechanism with exponential backoff
3. **Search**: Add Algolia indexing on product creation
4. **Data Model**: Extend Order model with shipping details

## Architecture Decisions
- Dual-app strategy: /web (public) and /app (authenticated)
- Prices stored in cents throughout the system
- Stripe Connect for multi-party payments
- UploadThing with fallback URLs for images
- Clerk authentication with database user mapping

## Development Patterns
- Always use database user ID, not Clerk ID for queries
- Convert prices to cents before storage
- Use server actions for mutations
- Implement optimistic UI updates
- Add proper error boundaries

## Environment Requirements
- Stripe keys configured
- UploadThing credentials (fallback in dev)
- Database connection string
- Clerk authentication keys
- Redis/Upstash for caching (optional)

## Testing Checklist
- [ ] Product creation flow
- [ ] Image upload with fallback
- [ ] Checkout with Stripe
- [ ] Order processing
- [ ] Seller dashboard analytics
- [ ] Search functionality
- [ ] User authentication

## Known Limitations
- Email service not configured (commented out)
- Real-time notifications pending
- Search indexing manual for now
- Single product per order (schema limitation)