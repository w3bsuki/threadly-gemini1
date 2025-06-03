# Threadly Web App (`/web`) - Main Marketplace Plan

## 🎯 Overview
The `/web` app serves as the **public-facing marketplace** where users can browse, search, and discover fashion items without authentication. This follows the Vinted model of low-friction browsing with auth-gated actions.

## 🏗️ Architecture

### Core Principles
- **SEO-First**: All product pages are public and crawlable
- **Fast Loading**: Optimized for performance and Core Web Vitals
- **Mobile-First**: Responsive design prioritizing mobile experience
- **Auth-Optional**: Browse without registration, authenticate for actions

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + Design System components
- **Database**: Shared Prisma schema with `/app`
- **Search**: Elasticsearch/Algolia for fast product search
- **Images**: Cloudinary/Uploadthing for optimized delivery
- **Analytics**: Vercel Analytics + PostHog

## 📱 Pages & Routes

### Public Pages (No Auth Required)
```
/                           → Homepage with featured products
/products                   → Product listing with filters
/products/[id]              → Individual product detail page
/products/[id]/similar      → Similar products page
/categories                 → All categories overview
/categories/[slug]          → Category-specific browsing
/brands                     → Browse by brands
/brands/[slug]              → Brand-specific products
/search                     → Search results page
/size-guide                 → Size guide and help
/about                      → About Threadly
/help                       → Help center
/terms                      → Terms of service
/privacy                    → Privacy policy
```

### Auth-Required Actions (Redirect to /app)
```
/auth/login                 → Login modal/page
/auth/register              → Registration flow
/sell                       → Redirect to /app/selling/new
/buy/[productId]            → Redirect to /app/buying/checkout
/message/[userId]           → Redirect to /app/messages
```

## 🎨 Core Features

### 1. Homepage
- **Hero Section**: Eye-catching banner with search
- **Featured Categories**: Visual category cards
- **Trending Products**: Algorithm-driven product carousel
- **New Arrivals**: Latest listings
- **Success Stories**: User testimonials
- **Brand Highlights**: Popular brands section

### 2. Product Discovery
- **Advanced Filtering**:
  - Category, Brand, Size, Color, Condition
  - Price range slider
  - Location-based filtering
  - Recently added/ending soon
- **Sorting Options**:
  - Price (low to high, high to low)
  - Newest first
  - Ending soonest
  - Most liked
  - Closest location

### 3. Search System
- **Global Search Bar**: Persistent in header
- **Auto-complete**: Real-time suggestions
- **Search History**: For authenticated users
- **Saved Searches**: Email alerts for new matches
- **Visual Search**: Upload image to find similar

### 4. Product Detail Pages
- **Image Gallery**: High-res images with zoom
- **Product Information**:
  - Title, description, brand, size, condition
  - Price and shipping cost
  - Seller information (ratings, location)
  - Size measurements
  - Material and care instructions
- **Similar Products**: Recommendations
- **Recently Viewed**: User's browsing history
- **Social Proof**: Views, likes, shares
- **CTA Buttons**:
  - "Buy Now" → Redirects to /app/buying/checkout
  - "Message Seller" → Redirects to /app/messages
  - "Add to Favorites" → Requires auth

### 5. Category & Brand Pages
- **Category Landing**: Curated collections
- **Brand Stories**: Brand information and collections
- **Trending in Category**: Popular items
- **Editorial Content**: Style guides and trends

## 🔧 Technical Implementation

### Data Fetching Strategy
- **SSG**: Static generation for category/brand pages
- **ISR**: Incremental regeneration for product listings
- **SSR**: Server-side rendering for search results
- **Client-side**: Infinite scroll for product grids

### Performance Optimizations
- **Image Optimization**: Next.js Image component with Cloudinary
- **Code Splitting**: Route-based and component-based
- **Caching Strategy**: 
  - CDN for static assets
  - Redis for API responses
  - Browser caching for images
- **Bundle Analysis**: Regular monitoring and optimization

### SEO Strategy
- **Product Schema**: Rich snippets for products
- **Category Pages**: Optimized for category keywords
- **Brand Pages**: Brand-specific SEO
- **Blog Integration**: Fashion tips and trends
- **XML Sitemaps**: Auto-generated for products/categories
- **Meta Tags**: Dynamic generation per page

## 📊 Analytics & Tracking

### User Behavior
- **Page Views**: Track popular products/categories
- **Search Analytics**: Query analysis and optimization
- **Conversion Funnels**: Browse → View → Auth → Purchase
- **Exit Points**: Identify where users drop off

### Business Metrics
- **Product Performance**: Views, likes, inquiries per product
- **Category Insights**: Most/least popular categories
- **Search Performance**: Query success rates
- **Geographic Data**: Popular locations and shipping patterns

## 🎨 UI/UX Design

### Design System
- **Color Palette**: Fashion-forward, modern colors
- **Typography**: Clean, readable fonts optimized for mobile
- **Icons**: Consistent icon library (Lucide)
- **Spacing**: 8px grid system
- **Breakpoints**: Mobile-first responsive design

### Component Library
- **ProductCard**: Reusable product display component
- **FilterPanel**: Advanced filtering interface
- **SearchBar**: Global search with suggestions
- **CategoryCard**: Visual category representation
- **BrandCard**: Brand showcase component
- **ImageGallery**: Product image viewer
- **PriceDisplay**: Consistent price formatting
- **ConditionBadge**: Visual condition indicator

### Mobile Experience
- **Touch-Friendly**: Large tap targets
- **Swipe Gestures**: Image galleries, product carousels
- **Bottom Sheet**: Mobile-optimized filters
- **Progressive Loading**: Skeleton screens
- **Offline Support**: Basic offline browsing

## 🔐 Authentication Integration

### Login Flow
1. User clicks "Buy", "Message", or "Sell"
2. Redirect to `/auth/login` with return URL
3. After successful auth, redirect to `/app` with context
4. Seamless handoff between `/web` and `/app`

### Guest Features
- **Browse & Search**: Full product discovery
- **View Details**: Complete product information
- **Create Wishlist**: Local storage (syncs on login)
- **Size Guide**: Help and support content

## 📈 Marketing Integration

### Email Collection
- **Newsletter Signup**: Fashion tips and new arrivals
- **Price Drop Alerts**: For guest users (requires email)
- **Back in Stock**: Email notifications
- **Abandoned Browse**: Re-engagement emails

### Social Features
- **Share Products**: Social media integration
- **Product Reviews**: Post-purchase review system
- **User-Generated Content**: Style inspiration
- **Influencer Partnerships**: Curated collections

## 🚀 Development Phases

### Phase 1: Foundation (Weeks 1-2)
- [ ] Basic homepage with hero and categories
- [ ] Product listing page with basic filtering
- [ ] Product detail pages
- [ ] Search functionality
- [ ] Responsive design implementation

### Phase 2: Discovery (Weeks 3-4)
- [ ] Advanced filtering system
- [ ] Category and brand pages
- [ ] Search optimization with auto-complete
- [ ] Similar products recommendations
- [ ] SEO optimization

### Phase 3: Engagement (Weeks 5-6)
- [ ] User reviews and ratings
- [ ] Social sharing features
- [ ] Email collection and alerts
- [ ] Analytics implementation
- [ ] Performance optimization

### Phase 4: Enhancement (Weeks 7-8)
- [ ] Visual search functionality
- [ ] Advanced recommendations
- [ ] A/B testing framework
- [ ] Progressive Web App features
- [ ] International support

## 🧪 Testing Strategy

### Unit Testing
- Component rendering tests
- Utility function tests
- Search algorithm tests

### Integration Testing
- User flow testing
- API integration tests
- Authentication flow tests

### E2E Testing
- Product discovery journey
- Search and filter functionality
- Cross-device compatibility

### Performance Testing
- Core Web Vitals monitoring
- Load testing for product pages
- Image optimization testing

## 📱 PWA Features

### Progressive Enhancement
- **Service Worker**: Offline product browsing
- **App-like Experience**: Add to home screen
- **Push Notifications**: Price drops, new arrivals
- **Background Sync**: Save favorites offline

## 🌍 Internationalization

### Multi-language Support
- **Content Translation**: Product descriptions, UI
- **Currency Conversion**: Local pricing
- **Shipping Information**: Country-specific details
- **Legal Compliance**: Local terms and regulations

## 🔍 Search Engine Optimization

### Technical SEO
- **Core Web Vitals**: Optimize for Google's metrics
- **Structured Data**: Product, Review, BreadcrumbList schemas
- **URL Structure**: Clean, descriptive URLs
- **XML Sitemaps**: Products, categories, brands
- **Robots.txt**: Proper crawling instructions

### Content SEO
- **Product Descriptions**: Rich, keyword-optimized content
- **Category Pages**: Editorial content and buying guides
- **Blog Integration**: Fashion trends and style tips
- **User-Generated Content**: Reviews and photos

## 📊 Success Metrics

### Primary KPIs
- **Organic Traffic Growth**: Month-over-month increase
- **Product Page Views**: Engagement with listings
- **Search Conversion**: Query to product view rate
- **Auth Conversion**: Guest to registered user rate
- **Time on Site**: User engagement duration

### Secondary KPIs
- **Page Load Speed**: Core Web Vitals scores
- **Mobile Usage**: Mobile vs desktop traffic
- **Category Performance**: Popular vs underperforming categories
- **Geographic Insights**: Regional user behavior
- **Referral Sources**: Traffic source analysis

---

This plan serves as our north star for the `/web` application development. Each feature should be implemented with mobile-first design, performance optimization, and SEO best practices in mind. 