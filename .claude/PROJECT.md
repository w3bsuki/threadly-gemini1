# 🛍️ PROJECT.md - Threadly Marketplace Architecture

## Overview
**Threadly** - A production-ready C2C fashion marketplace built on Next-forge, targeting the UK market as a Vinted/Depop competitor.

## Tech Stack
- **Framework**: Next.js 15.3 (App Router) via Next-forge
- **Database**: PostgreSQL (Neon) + Prisma ORM
- **Auth**: Clerk (with database user sync)
- **Payments**: Stripe Connect (marketplace model)
- **File Storage**: UploadThing
- **Real-time**: Pusher (messaging)
- **Search**: Algolia (future)
- **Cache**: Redis/Upstash
- **Hosting**: Vercel

## Monorepo Architecture
```
threadly/
├── apps/
│   ├── web/          # Public marketplace (port 3001)
│   ├── app/          # Authenticated dashboard (port 3000)
│   ├── api/          # Backend services (port 3002)
│   ├── docs/         # Documentation site (port 3004)
│   └── studio/       # Prisma Studio (port 3005)
├── packages/
│   ├── database/     # Shared Prisma schema & client
│   ├── design-system/# UI components (shadcn/ui)
│   ├── auth/         # Clerk integration
│   ├── payments/     # Stripe logic
│   ├── real-time/    # WebSocket/Pusher
│   ├── search/       # Search integration
│   ├── cache/        # Redis caching
│   ├── notifications/# In-app notifications
│   └── security/     # Rate limiting, CSRF
```

## Current Features (Implemented)
### For Buyers
- ✅ Browse products by category (Men/Women/Kids/Designer/Unisex)
- ✅ Product detail pages with image galleries
- ✅ Add to cart (client-side state)
- ✅ User authentication (Clerk)
- ✅ Basic checkout flow
- ✅ Order history

### For Sellers
- ✅ List products with images
- ✅ Manage listings (edit/delete)
- ✅ View sales analytics
- ✅ Stripe Connect onboarding
- ✅ Order management

### Platform Features
- ✅ Database schema complete
- ✅ API endpoints for CRUD operations
- ✅ Image upload with UploadThing
- ✅ Responsive design
- ✅ SEO optimization
- ✅ Error tracking (Sentry)

## Upcoming Features (Priority Order)

### Phase 1: Core Marketplace (Next 2 weeks)
- [ ] Real-time messaging between buyers/sellers
- [ ] Search with Algolia integration
- [ ] Product recommendations
- [ ] Email notifications (Resend)
- [ ] Push notifications
- [ ] Reviews and ratings system
- [ ] Saved searches
- [ ] Price drop alerts

### Phase 2: Trust & Safety (Week 3)
- [ ] User verification badges
- [ ] Escrow payments (hold until delivery)
- [ ] Dispute resolution system
- [ ] Fraud detection
- [ ] Content moderation
- [ ] Report listings
- [ ] Block users

### Phase 3: AI Features (Week 4+)
- [ ] **AI Visual Search** - Upload photo to find similar items
- [ ] **Smart Pricing** - ML-based price suggestions
- [ ] **Auto-categorization** - AI categorizes products from photos
- [ ] **Quality Detection** - AI rates condition from images
- [ ] **Trend Prediction** - Show what's about to be popular
- [ ] **Personalized Feed** - AI-curated homepage
- [ ] **Chatbot Assistant** - Help with sizing, styling
- [ ] **Fake Detection** - AI identifies counterfeit items

### Phase 4: Social Features
- [ ] User profiles with follower system
- [ ] Share listings to social media
- [ ] Outfit inspiration boards
- [ ] Style communities
- [ ] Influencer partnerships
- [ ] Live shopping events

### Phase 5: Advanced Commerce
- [ ] Bundle deals
- [ ] Make offer system
- [ ] Auction format
- [ ] International shipping
- [ ] Multi-currency support
- [ ] Loyalty program
- [ ] Seller subscriptions (reduced fees)

## Business Model

### Revenue Streams
1. **Transaction Fees**: 5% + payment processing
2. **Seller Plus**: £4.99/month for:
   - Reduced fees (3%)
   - Priority listing
   - Advanced analytics
   - Bulk upload tools
3. **Featured Listings**: £0.99 per 7 days
4. **Shipping Labels**: Small markup on integrated shipping

### Market Strategy
- **Target**: UK Gen Z/Millennials (18-35)
- **Differentiation**: Lower fees than Vinted, better UX than Depop
- **Marketing**: TikTok influencers, student ambassadors

## Performance Targets
- **Page Load**: < 2 seconds (LCP)
- **API Response**: < 200ms (p95)
- **Search Results**: < 500ms
- **Image Upload**: < 3 seconds
- **Uptime**: 99.9% SLA

## Database Schema Highlights
```prisma
User (Clerk sync)
├── listings: Product[]
├── purchases: Order[]
├── reviews: Review[]
├── favorites: Favorite[]
└── stripeAccountId

Product
├── images: ProductImage[]
├── category: Category
├── seller: User
├── condition: Enum
└── status: AVAILABLE/SOLD/RESERVED

Order
├── buyer: User
├── seller: User
├── items: OrderItem[]
├── status: Enum
└── trackingNumber
```

## Security Measures
- CSRF protection on all mutations
- Rate limiting (Arcjet)
- Input sanitization (DOMPurify)
- SQL injection prevention (Prisma)
- XSS protection (React)
- Secure headers (Next.js)
- Payment tokenization (Stripe)

## Deployment Strategy
- **Production**: Vercel (auto-deploy from main)
- **Staging**: Vercel (preview deployments)
- **Database**: Neon (connection pooling)
- **CDN**: Vercel Edge Network
- **Monitoring**: Sentry + Vercel Analytics

## Development Workflow
1. Feature branches → PR → Review → Merge
2. Automated tests run on PR
3. Preview deployment for testing
4. Merge to main = production deploy
5. Database migrations via GitHub Actions

## Success Metrics
- **GMV**: £100k in first 6 months
- **Users**: 10,000 active sellers
- **Listings**: 100,000 active items
- **Conversion**: 2% browse-to-buy
- **Retention**: 40% monthly active