# Threadly Marketplace - Master Plan

## 🎯 Project Overview
Threadly is a modern, second-hand fashion marketplace inspired by Vinted, built with a dual-app architecture that separates public browsing from authenticated user management for optimal UX and performance.

## 🏗️ High-Level Architecture

### Dual-App Strategy
```
┌─────────────────┐     ┌─────────────────┐
│   /web App      │     │   /app Dashboard│
│  (Public Site)  │────▶│  (User Portal)  │
│                 │     │                 │
│ • Browse        │     │ • Sell          │
│ • Search        │     │ • Buy           │
│ • Discover      │     │ • Manage        │
│ • Marketing     │     │ • Analytics     │
└─────────────────┘     └─────────────────┘
         │                       │
         └───────────┬───────────┘
                     │
         ┌─────────────────────┐
         │   Shared Backend    │
         │                     │
         │ • Database (Prisma) │
         │ • API Layer        │
         │ • Authentication   │
         │ • File Storage     │
         └─────────────────────┘
```

### Why This Architecture?
- **SEO Benefits**: Public product pages in `/web` are crawlable
- **Performance**: Optimized for different use cases
- **User Experience**: Seamless transition from browsing to managing
- **Development**: Clear separation of concerns
- **Scalability**: Independent scaling and optimization

## 📱 Application Breakdown

### `/web` - Public Marketplace (Port 3001)
**Purpose**: Public-facing marketplace for discovery and browsing
- Homepage with featured products
- Product listings with search/filter
- Individual product detail pages
- Category and brand browsing
- Marketing content and onboarding
- Auth gateway (login/register redirects to `/app`)

### `/app` - User Dashboard (Port 3000) 
**Purpose**: Authenticated user portal for marketplace management
- User dashboard and profile
- Listing creation and management
- Order processing and tracking
- Messaging and communication
- Financial management and analytics
- Settings and preferences

## 🔄 User Flow Integration

### Guest User Journey (Web-First)
1. **Discovery** → Lands on `/web`, browses products
2. **Interest** → Views product details, sees seller info
3. **Action Intent** → Clicks "Buy Now" or "Message Seller"
4. **Auth Gate** → Redirected to `/web/auth/login`
5. **Registration** → Creates account via Clerk
6. **Handoff** → Redirected to `/app` with context
7. **Transaction** → Completes purchase in `/app`
8. **Management** → Ongoing activities in `/app`

### Registered User Journey (App-Centric)
1. **Direct Access** → Bookmarks `/app` for daily use
2. **Discovery** → Can still browse `/web` for new finds
3. **Selling** → Creates listings in `/app/selling`
4. **Buying** → Purchases from `/app` or via `/web`
5. **Management** → All account activities in `/app`

## 🗄️ Shared Infrastructure

### Database Schema (Prisma)
```prisma
// Core Models
model User {
  id          String @id @default(cuid())
  clerkId     String @unique
  email       String @unique
  firstName   String?
  lastName    String?
  avatar      String?
  bio         String?
  
  // Verification
  isVerified  Boolean @default(false)
  verifiedAt  DateTime?
  
  // Preferences
  preferences Json?
  
  // Relations
  products    Product[]
  orders      Order[]
  messages    Message[]
  reviews     Review[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Product {
  id          String @id @default(cuid())
  title       String
  description String
  price       Float
  condition   ProductCondition
  status      ProductStatus @default(ACTIVE)
  
  // Product Details
  brand       String?
  size        String?
  color       String?
  material    String?
  category    Category @relation(fields: [categoryId], references: [id])
  categoryId  String
  
  // Media
  images      ProductImage[]
  
  // Seller
  seller      User @relation(fields: [sellerId], references: [id])
  sellerId    String
  
  // Analytics
  views       Int @default(0)
  likes       Int @default(0)
  
  // Orders
  orders      Order[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Order {
  id          String @id @default(cuid())
  status      OrderStatus @default(PENDING)
  
  // Product & Users
  product     Product @relation(fields: [productId], references: [id])
  productId   String
  buyer       User @relation(fields: [buyerId], references: [id])
  buyerId     String
  
  // Financial
  price       Float
  shippingCost Float
  totalAmount Float
  
  // Shipping
  shippingAddress Json
  trackingNumber  String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// Supporting Models
model Category {
  id       String @id @default(cuid())
  name     String
  slug     String @unique
  products Product[]
}

model Message {
  id           String @id @default(cuid())
  content      String
  sender       User @relation(fields: [senderId], references: [id])
  senderId     String
  conversation Conversation @relation(fields: [conversationId], references: [id])
  conversationId String
  createdAt    DateTime @default(now())
}

// Enums
enum ProductCondition {
  NEW_WITH_TAGS
  VERY_GOOD
  GOOD
  SATISFACTORY
}

enum ProductStatus {
  ACTIVE
  SOLD
  DRAFT
  HIDDEN
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}
```

### API Strategy
- **Shared API**: Both apps use same backend endpoints
- **Route Handlers**: Next.js API routes in both apps
- **Authentication**: Clerk middleware on protected routes
- **Data Validation**: Zod schemas for type safety
- **Rate Limiting**: API protection and abuse prevention

### File Upload & Storage
- **Images**: Uploadthing for product photos and avatars
- **Optimization**: Automatic compression and format conversion
- **CDN**: Fast global delivery via Uploadthing's CDN
- **Security**: Signed URLs and access control

## 🔐 Authentication & Security

### Clerk Integration
- **Single Sign-On**: Shared auth between `/web` and `/app`
- **Session Management**: Secure session handling
- **User Profiles**: Centralized user data
- **Social Login**: Google, Facebook, Apple integration

### Security Measures
- **HTTPS Enforced**: SSL/TLS encryption
- **CSRF Protection**: Cross-site request forgery prevention
- **Input Validation**: Server-side validation and sanitization
- **Rate Limiting**: API abuse prevention
- **Content Security Policy**: XSS attack prevention

## 📊 Analytics & Monitoring

### User Analytics
- **Vercel Analytics**: Core web vitals and performance
- **PostHog**: User behavior and feature usage
- **Clerk Analytics**: Authentication and user metrics

### Business Intelligence
- **Tremor Dashboard**: Custom analytics in `/app`
- **Transaction Tracking**: Sales and revenue metrics
- **Product Performance**: Views, conversions, popular items
- **User Segmentation**: Active buyers, sellers, engagement levels

## 🚀 Development Roadmap

### Phase 1: Foundation (Weeks 1-4)
**Week 1-2: Web App Foundation**
- [ ] Homepage with product showcase
- [ ] Product listing and detail pages
- [ ] Basic search and filtering
- [ ] Category browsing
- [ ] Responsive design implementation

**Week 3-4: App Dashboard Foundation**
- [ ] User dashboard and navigation
- [ ] Profile management
- [ ] Basic listing creation
- [ ] Authentication flow optimization

### Phase 2: Core Features (Weeks 5-8)
**Week 5-6: Selling Features**
- [ ] Advanced listing creation in `/app`
- [ ] Photo upload and management
- [ ] Listing management dashboard
- [ ] Basic order processing

**Week 7-8: Buying Features**
- [ ] Checkout flow in `/app`
- [ ] Order management and tracking
- [ ] Payment integration (Stripe)
- [ ] Basic messaging system

### Phase 3: Advanced Features (Weeks 9-12)
**Week 9-10: Real-time Features**
- [ ] Live messaging system
- [ ] Real-time notifications
- [ ] Order status updates
- [ ] Push notification system

**Week 11-12: Analytics & Optimization**
- [ ] Tremor analytics dashboard
- [ ] Performance optimization
- [ ] SEO enhancement for `/web`
- [ ] Mobile app preparation

### Phase 4: Polish & Launch (Weeks 13-16)
**Week 13-14: Testing & Security**
- [ ] Comprehensive testing suite
- [ ] Security audit and fixes
- [ ] Performance monitoring
- [ ] Bug fixes and polish

**Week 15-16: Launch Preparation**
- [ ] Production deployment setup
- [ ] Monitoring and alerting
- [ ] Documentation completion
- [ ] Launch strategy execution

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + Shadcn/ui
- **State Management**: React Query + Zustand
- **Forms**: React Hook Form + Zod validation
- **Analytics**: Tremor for dashboards

### Backend
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Payments**: Stripe
- **File Upload**: Uploadthing
- **Email**: Resend
- **Real-time**: Pusher or Socket.io

### Infrastructure
- **Hosting**: Vercel (Both apps)
- **Database**: Vercel Postgres or Railway
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics + Sentry
- **CI/CD**: GitHub Actions

## 📈 Success Metrics

### Technical KPIs
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Uptime**: 99.9% availability
- **API Response Time**: < 200ms average
- **Error Rate**: < 0.1% error rate

### Business KPIs
- **User Growth**: Monthly active users
- **Transaction Volume**: GMV (Gross Merchandise Value)
- **Conversion Rate**: Visitor to buyer conversion
- **Retention**: User retention rates
- **NPS**: Net Promoter Score

### User Experience KPIs
- **Page Load Speed**: Sub-2 second load times
- **Mobile Usage**: Mobile traffic percentage
- **Search Success**: Query to product view rate
- **Customer Satisfaction**: Review scores and feedback

## 🔄 Integration Points

### Web ↔ App Communication
- **URL Parameters**: Pass context between apps
- **Shared State**: Sync user preferences and cart
- **Deep Linking**: Direct links to specific app sections
- **Analytics Continuity**: Track user journey across apps

### External Integrations
- **Payment Processing**: Stripe for secure transactions
- **Shipping**: Integration with major carriers
- **Social Media**: Sharing and social login
- **Email Marketing**: Newsletter and notifications

## 📚 Documentation Structure

- `docs/WEB_APP_PLAN.md` - Detailed `/web` app specifications
- `docs/APP_PLAN.md` - Detailed `/app` dashboard specifications  
- `docs/API_DOCUMENTATION.md` - API endpoints and schemas
- `docs/DEPLOYMENT_GUIDE.md` - Production deployment instructions
- `docs/CONTRIBUTING.md` - Development guidelines and standards

---

This master plan serves as our single source of truth for the Threadly marketplace development. All implementation decisions should reference back to these architectural principles and feature specifications. 