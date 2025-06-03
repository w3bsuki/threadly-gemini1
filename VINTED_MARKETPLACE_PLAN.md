# 🛍️ Vinted Marketplace Transformation Plan

## 📋 Project Overview
Transform the next-forge template into a fully functional Vinted-style marketplace for buying and selling second-hand fashion items.

## 🎯 Core Features to Implement

### 1. **User Management & Profiles**
- [ ] Enhanced user profiles (seller/buyer profiles)
- [ ] Profile verification system
- [ ] User ratings and reviews
- [ ] User following/followers system
- [ ] Seller stats and badges

### 2. **Product Management**
- [ ] Product listing creation with multiple images
- [ ] Category system (clothing, accessories, shoes, etc.)
- [ ] Brand management
- [ ] Size/condition filters
- [ ] Product search and advanced filtering
- [ ] Product favorites/wishlist
- [ ] Recently viewed items

### 3. **Marketplace Core**
- [ ] Browse/discover products feed
- [ ] Product detail pages
- [ ] Shopping cart functionality
- [ ] Advanced search with filters (price, size, brand, condition)
- [ ] Category browsing
- [ ] Trending/featured products

### 4. **Messaging System**
- [ ] Real-time chat between buyers and sellers
- [ ] Message history
- [ ] Image sharing in messages
- [ ] Offer negotiations
- [ ] Message notifications

### 5. **Transactions & Payments**
- [ ] Stripe Connect integration for marketplace payments
- [ ] Escrow payment system
- [ ] Order management
- [ ] Shipping integration
- [ ] Return/refund system
- [ ] Transaction fees

### 6. **Reviews & Trust**
- [ ] User review system
- [ ] Product condition verification
- [ ] Seller reliability scores
- [ ] Report system for inappropriate content
- [ ] Dispute resolution

### 7. **Mobile Experience**
- [ ] Progressive Web App (PWA)
- [ ] Mobile-optimized UI
- [ ] Push notifications
- [ ] Offline browsing capabilities

## 🗂️ Database Schema Design

### User Extensions
```prisma
model User {
  id              String   @id @default(cuid())
  clerkId         String   @unique
  email           String   @unique
  firstName       String?
  lastName        String?
  imageUrl        String?
  bio             String?
  location        String?
  joinedAt        DateTime @default(now())
  verified        Boolean  @default(false)
  totalSales      Int      @default(0)
  totalPurchases  Int      @default(0)
  averageRating   Float?
  
  // Relations
  listings        Product[]
  purchases       Order[] @relation("Buyer")
  sales           Order[] @relation("Seller") 
  reviews         Review[] @relation("Reviewer")
  receivedReviews Review[] @relation("Reviewed")
  messages        Message[]
  favorites       Favorite[]
  cart            CartItem[]
  following       Follow[] @relation("Follower")
  followers       Follow[] @relation("Following")
}

model Product {
  id          String      @id @default(cuid())
  title       String
  description String
  price       Float
  condition   Condition
  size        String?
  brand       String?
  color       String?
  categoryId  String
  sellerId    String
  status      ProductStatus @default(AVAILABLE)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  views       Int         @default(0)
  
  // Relations
  seller      User        @relation(fields: [sellerId], references: [id])
  category    Category    @relation(fields: [categoryId], references: [id])
  images      ProductImage[]
  favorites   Favorite[]
  cartItems   CartItem[]
  orders      Order[]
}

model Category {
  id       String    @id @default(cuid())
  name     String    @unique
  slug     String    @unique
  parentId String?
  
  parent   Category? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children Category[] @relation("CategoryHierarchy")
  products Product[]
}

model Order {
  id          String      @id @default(cuid())
  buyerId     String
  sellerId    String
  productId   String
  amount      Float
  status      OrderStatus @default(PENDING)
  createdAt   DateTime    @default(now())
  shippedAt   DateTime?
  deliveredAt DateTime?
  
  buyer       User        @relation("Buyer", fields: [buyerId], references: [id])
  seller      User        @relation("Seller", fields: [sellerId], references: [id])
  product     Product     @relation(fields: [productId], references: [id])
  payment     Payment?
  review      Review?
}

model Message {
  id         String   @id @default(cuid())
  senderId   String
  receiverId String
  productId  String?
  content    String
  imageUrl   String?
  createdAt  DateTime @default(now())
  readAt     DateTime?
  
  sender     User     @relation(fields: [senderId], references: [id])
  // Note: receiver relation would need a different name to avoid conflicts
}

model Review {
  id         String @id @default(cuid())
  orderId    String @unique
  reviewerId String
  reviewedId String
  rating     Int    // 1-5 stars
  comment    String?
  createdAt  DateTime @default(now())
  
  order      Order @relation(fields: [orderId], references: [id])
  reviewer   User  @relation("Reviewer", fields: [reviewerId], references: [id])
  reviewed   User  @relation("Reviewed", fields: [reviewedId], references: [id])
}

enum Condition {
  NEW_WITH_TAGS
  NEW_WITHOUT_TAGS
  VERY_GOOD
  GOOD
  SATISFACTORY
}

enum ProductStatus {
  AVAILABLE
  SOLD
  RESERVED
  REMOVED
}

enum OrderStatus {
  PENDING
  PAID
  SHIPPED
  DELIVERED
  CANCELLED
  DISPUTED
}
```

## 🏗️ New Route Structure

```
apps/app/app/
├── (unauthenticated)/
│   ├── page.tsx                    # Landing page with product feed
│   ├── sign-in/
│   ├── sign-up/
│   ├── browse/
│   │   ├── [category]/
│   │   └── search/
│   └── product/[id]/               # Public product pages
├── (authenticated)/
│   ├── dashboard/                  # User dashboard
│   ├── selling/
│   │   ├── page.tsx               # My listings
│   │   ├── new/                   # Create listing
│   │   └── orders/                # Sales management
│   ├── buying/
│   │   ├── cart/                  # Shopping cart
│   │   ├── orders/                # Purchase history
│   │   └── favorites/             # Saved items
│   ├── messages/                  # Chat system
│   ├── profile/
│   │   ├── page.tsx               # Edit profile
│   │   ├── public/[userId]/       # Public profile view
│   │   └── reviews/               # Review management
│   └── settings/                  # Account settings
└── api/
    ├── products/
    ├── messages/
    ├── payments/
    ├── upload/
    └── webhooks/
```

## 🎨 UI Components to Build

### Product Components
- [ ] ProductCard (grid/list view)
- [ ] ProductImageGallery
- [ ] ProductFilters
- [ ] ProductSearch
- [ ] CategoryNavigation
- [ ] PriceRange

### User Components
- [ ] UserProfile
- [ ] UserRating
- [ ] UserStats
- [ ] FollowButton

### Commerce Components
- [ ] AddToCart
- [ ] BuyNowButton
- [ ] ShippingOptions
- [ ] PaymentMethod
- [ ] OrderTracking

### Communication
- [ ] MessageThread
- [ ] ChatBubble
- [ ] OfferNegotiation
- [ ] NotificationBell

## 🔄 Implementation Phases

### Phase 1: Foundation (Week 1-2)
1. Set up database schema
2. Create basic product model and API
3. Build product listing and detail pages
4. Implement basic search functionality

### Phase 2: Core Marketplace (Week 3-4)
1. Shopping cart and favorites
2. User profiles and seller pages
3. Image upload system
4. Basic messaging system

### Phase 3: Transactions (Week 5-6)
1. Stripe Connect integration
2. Order management system
3. Payment processing
4. Basic shipping

### Phase 4: Advanced Features (Week 7-8)
1. Real-time messaging
2. Review and rating system
3. Advanced search and filters
4. Mobile optimization

### Phase 5: Growth & Trust (Week 9-10)
1. User verification
2. Dispute resolution
3. Analytics dashboard
4. Performance optimization

## 🛠️ Technology Stack Utilization

### Leveraging Next-forge Packages:
- **@repo/auth**: User authentication with Clerk
- **@repo/payments**: Stripe integration for marketplace
- **@repo/database**: Prisma with PostgreSQL
- **@repo/storage**: File upload for product images
- **@repo/email**: Order confirmations, notifications
- **@repo/notifications**: Real-time updates
- **@repo/analytics**: Track user behavior
- **@repo/design-system**: UI components with shadcn/ui

### Additional Dependencies Needed:
- Socket.io for real-time messaging
- Sharp for image processing
- React Hook Form for forms
- Zustand for client state management
- Date-fns for date formatting

## 📱 Mobile-First Design Principles
- Touch-friendly interface
- Swipeable image galleries
- Infinite scroll product feeds
- Pull-to-refresh functionality
- Responsive grid layouts

## 🚀 Deployment Strategy
- Vercel deployment (already configured)
- Neon PostgreSQL database
- Cloudflare R2 for image storage
- Stripe for payments
- SendGrid/Resend for emails

---

**Next Step**: Begin Phase 1 implementation starting with database schema setup. 