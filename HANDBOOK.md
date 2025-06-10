# 📚 THREADLY DEVELOPER HANDBOOK

*The complete guide to developing, maintaining, and deploying Threadly*  
*Last updated: January 10, 2025*

## 📖 TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Development Philosophy](#development-philosophy)
3. [Architecture Overview](#architecture-overview)
4. [Package Structure](#package-structure)
5. [Development Workflow](#development-workflow)
6. [Code Patterns & Conventions](#code-patterns-conventions)
7. [Common Development Tasks](#common-development-tasks)
8. [Debugging & Troubleshooting](#debugging-troubleshooting)
9. [Performance Optimization](#performance-optimization)
10. [Testing Strategies](#testing-strategies)
11. [Production Deployment](#production-deployment)

---

## 🎯 PROJECT OVERVIEW {#project-overview}

**Threadly** is a premium C2C fashion marketplace (Vinted competitor) built with modern web technologies.

### Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Monorepo:** Turborepo
- **Database:** PostgreSQL (Neon) + Prisma ORM
- **Authentication:** Clerk
- **Payments:** Stripe Connect
- **Real-time:** Pusher
- **Search:** Algolia (integrated)
- **UI:** shadcn/ui + Tailwind CSS + Custom animations
- **File Upload:** UploadThing
- **Email:** Resend (configured)
- **Caching:** Redis (Upstash)
- **Analytics:** PostHog
- **Rate Limiting:** Custom middleware
- **PWA:** Service Worker + Offline support

### Project Status
- **Core Features:** 100% complete
- **Production Ready:** 98% (needs env vars in Vercel)
- **Performance:** Optimized with caching, lazy loading, PWA

---

## 💡 DEVELOPMENT PHILOSOPHY {#development-philosophy}

### Core Principles

1. **Edit Over Create**
   - Check existing files first - we have comprehensive coverage
   - Always prefer editing to creating new files
   - No unnecessary README.md files - use the main documentation

2. **Production-First Mindset**
   - We're building for production, not a demo
   - Performance matters - use server components by default
   - Security first - sanitize inputs, validate everything
   - User experience - fast, intuitive, beautiful

3. **Type Safety**
   - TypeScript strict mode enabled
   - No `any` types allowed
   - Proper error handling with typed errors

4. **Research Before Implementation**
   - Always check Next Forge docs first
   - Review existing patterns in the codebase
   - Understand the "why" not just the "how"

### The Golden Rule
**ALWAYS: Research → Plan → Review → Implement**

1. **🔍 RESEARCH FIRST (30% of time)**
   - Next Forge: https://next-forge.com/docs
   - Next.js 15: https://nextjs.org/docs
   - UI Components: https://ui.shadcn.com/docs/components
   - Check existing patterns in codebase

2. **📋 PLAN BASED ON DOCS (20% of time)**
   - Write implementation steps
   - Identify potential issues
   - Consider edge cases

3. **👀 REVIEW PLAN (10% of time)**
   - Does it follow best practices?
   - Is it the simplest solution?
   - Will it scale?

4. **💻 IMPLEMENT (40% of time)**
   - Follow the plan exactly
   - Test as you go
   - Document complex logic

---

## 🏗️ ARCHITECTURE OVERVIEW {#architecture-overview}

### Monorepo Structure
```
threadly/
├── apps/
│   ├── api/        # Backend API (Port 3002)
│   ├── app/        # User Dashboard (Port 3000)
│   └── web/        # Public Marketplace (Port 3001)
├── packages/
│   ├── auth/       # Authentication utilities
│   ├── database/   # Prisma client & schemas
│   ├── design-system/ # Shared UI components
│   ├── email/      # Email templates
│   ├── env/        # Environment validation
│   ├── notifications/ # Notification system
│   ├── payments/   # Stripe integration
│   └── utils/      # Shared utilities
└── scripts/        # Development & deployment scripts
```

### Application Architecture

#### /app (User Dashboard)
- **Purpose:** Authenticated user experience
- **Features:** Product management, messaging, orders, profile
- **Stack:** Next.js 15 App Router, Clerk auth, Zustand state

#### /web (Public Marketplace)
- **Purpose:** Public-facing marketplace
- **Features:** Browse products, search, guest checkout
- **Stack:** Next.js 15 App Router, i18n support, server components

#### /api (Backend API)
- **Purpose:** Shared backend services
- **Features:** Webhooks, cron jobs, external integrations
- **Stack:** Next.js API routes, Prisma ORM

### Key Architectural Decisions

1. **Server Components by Default**
   - Use client components only when needed (interactivity)
   - Maximize performance with server-side rendering

2. **Database Access Pattern**
   - Single Prisma client instance (singleton)
   - Include related data to avoid N+1 queries
   - Use proper indexing for performance

3. **State Management**
   - Server state: React Query with 5min cache
   - Client state: Zustand for cart, UI state
   - Auth state: Clerk hooks

4. **Environment Variables**
   - Centralized validation with @t3-oss/env-nextjs
   - Type-safe access throughout the codebase
   - Clear separation of client/server vars

---

## 📦 PACKAGE STRUCTURE {#package-structure}

### Package Independence Rules

1. **Packages should NOT import from other packages** (except types)
2. **Use dependency injection** for cross-package functionality
3. **Apps orchestrate packages** - they inject dependencies

### Core Packages

#### @repo/database
```typescript
// Singleton pattern for Prisma client
import { database } from '@repo/database';

// Always include relations to avoid N+1
const products = await database.product.findMany({
  include: {
    images: { orderBy: { displayOrder: 'asc' } },
    seller: { select: { id: true, firstName: true } },
    category: true,
    _count: { select: { favorites: true } }
  }
});
```

#### @repo/auth
```typescript
// Server-side auth utilities
import { currentUser } from '@repo/auth/server';

// Client-side hooks
import { useUser, useAuth } from '@clerk/nextjs';
```

#### @repo/design-system
```typescript
// UI components with consistent styling
import { Button, Card, Input } from '@repo/design-system/components';
```

#### @repo/env
```typescript
// Type-safe environment variables
import { env } from '@repo/env';

// Access with full type safety
const apiKey = env.STRIPE_SECRET_KEY;
```

---

## 🔄 DEVELOPMENT WORKFLOW {#development-workflow}

### Quick Commands
```bash
# ALWAYS USE THESE
pnpm dev          # Start everything
pnpm build        # Build all apps
pnpm typecheck    # Check types before commit
pnpm db:push      # Update database schema
pnpm db:seed      # Add test data

# DEBUG COMMANDS
pnpm why [package]      # Check why package exists
pnpm ls [package]       # List package versions
turbo daemon clean      # Fix turbo cache issues
pnpm db:studio          # View database in GUI
```

### Daily Workflow

1. **Check Documentation**
   - `STATUS.md` - Current state & active issues
   - `ISSUES.md` - Technical debt tracker
   - Pick task from NEXT section

2. **Create Todo List**
   - Break complex tasks into 3-5 steps
   - Set priorities based on impact
   - Track progress systematically

3. **Before Starting Work**
   ```bash
   # Ensure clean state
   git pull origin main
   pnpm install
   pnpm dev
   ```

4. **During Development**
   - Mark todos as in_progress one at a time
   - Test changes continuously
   - Update documentation as needed

5. **Before Committing**
   ```bash
   pnpm typecheck    # Must pass
   pnpm build        # Should pass locally
   git status        # Review changes
   ```

### Git Workflow
```bash
# Feature branch
git checkout -b feature/your-feature-name

# Regular commits
git add .
git commit -m "feat: add new feature"

# Before pushing
pnpm typecheck && pnpm build
```

---

## 🎨 CODE PATTERNS & CONVENTIONS {#code-patterns-conventions}

### API Route Pattern (Next.js 15)
```typescript
// CRITICAL: Params are now async in Next.js 15!
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params; // MUST AWAIT
  const id = resolvedParams.id;
  
  try {
    const result = await database.product.findUnique({
      where: { id },
      include: { images: true }
    });
    
    if (!result) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Server Component Pattern
```typescript
// Default to server components
export default async function ProductList() {
  // Direct database access in server components
  const products = await database.product.findMany({
    include: {
      images: { orderBy: { displayOrder: 'asc' } },
      category: true
    }
  });
  
  return <ProductGrid products={products} />;
}
```

### Client Component Pattern
```typescript
'use client'; // Only when needed!

import { useCartStore } from '@/lib/stores/cart-store';

export function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore(state => state.addItem);
  
  return (
    <Button onClick={() => addItem(product)}>
      Add to Cart
    </Button>
  );
}
```

### Caching Pattern (NEW)
```typescript
// Use Redis caching for expensive queries
import { getCacheService } from '@repo/cache';

const cache = getCacheService({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Cache-aside pattern
const products = await cache.remember(
  'products:featured',
  async () => database.product.findMany({ where: { featured: true } }),
  300 // TTL in seconds
);

// Invalidate on update
await cache.delete('products:featured');
```

### Analytics Pattern (NEW)
```typescript
// Track user events with PostHog
import { usePostHog } from '@repo/analytics';

export function ProductCard({ product }) {
  const posthog = usePostHog();
  
  const handleView = () => {
    posthog.capture('product_viewed', {
      productId: product.id,
      price: product.price,
      category: product.category.name
    });
  };
  
  return <div onMouseEnter={handleView}>...</div>;
}
```

### Animation Pattern (NEW)
```typescript
// Use animation components for better UX
import { Animated, StaggerContainer } from '@repo/design-system';

export function ProductGrid({ products }) {
  return (
    <StaggerContainer animation="fadeInUp" staggerDelay={30}>
      {products.map((product, index) => (
        <Animated key={product.id} stagger={index}>
          <ProductCard product={product} />
        </Animated>
      ))}
    </StaggerContainer>
  );
}
```

### Lazy Loading Pattern (NEW)
```typescript
// Optimize image loading
import { ProductImage, LazyImage } from '@repo/design-system';

export function ProductDetail({ product }) {
  return (
    <div>
      <ProductImage 
        src={product.images[0].url}
        alt={product.title}
        aspectRatio="3/4"
      />
      {/* Gallery with lazy loading */}
      {product.images.slice(1).map((img) => (
        <LazyImage
          key={img.id}
          src={img.url}
          alt={img.alt}
          threshold={0.1}
          rootMargin="50px"
        />
      ))}
    </div>
  );
}
```

### Form Validation Pattern
```typescript
// Define schema with Zod
const productSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  price: z.number().positive().max(10000),
  categoryId: z.string().uuid(),
  images: z.array(z.string().url()).min(1).max(5)
});

// Use with React Hook Form
const form = useForm<z.infer<typeof productSchema>>({
  resolver: zodResolver(productSchema),
  defaultValues: {
    title: '',
    description: '',
    price: 0,
    categoryId: '',
    images: []
  }
});
```

### Error Handling Pattern
```typescript
// Standardized API error handling
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
  }
}

export const handleApiError = (error: unknown) => {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }
  
  console.error('Unexpected error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
};
```

### State Management Patterns

#### Zustand Store (Client State)
```typescript
interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (product) => set((state) => ({
    items: [...state.items, { ...product, quantity: 1 }]
  })),
  removeItem: (productId) => set((state) => ({
    items: state.items.filter(item => item.id !== productId)
  })),
  clearCart: () => set({ items: [] })
}));
```

#### React Query (Server State)
```typescript
// Fetch with caching
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

---

## 🛠️ COMMON DEVELOPMENT TASKS {#common-development-tasks}

### Adding a New Feature

1. **Plan the Feature**
   - Check existing patterns in the codebase
   - Review relevant documentation
   - Break down into small tasks

2. **Database Schema Updates**
   ```bash
   # Edit schema.prisma
   pnpm db:push    # Update database
   pnpm db:generate # Generate types
   ```

3. **Create API Endpoint**
   ```typescript
   // apps/app/app/api/your-endpoint/route.ts
   export async function GET(request: NextRequest) {
     // Implementation
   }
   ```

4. **Build UI Components**
   - Start with server components
   - Add client interactivity only where needed
   - Use design system components

5. **Add Tests**
   - Unit tests for utilities
   - Integration tests for API routes
   - E2E tests for critical flows

### Working with Images

```typescript
// Current working pattern - DO NOT CHANGE
const handleImageUpload = async (file: File) => {
  const reader = new FileReader();
  reader.onloadend = () => {
    const base64 = reader.result as string;
    // Process base64 data URL
  };
  reader.readAsDataURL(file);
};
```

### Database Queries

```typescript
// Always include necessary relations
const product = await database.product.findUnique({
  where: { id },
  include: {
    images: true,
    seller: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true
      }
    },
    category: true,
    reviews: {
      include: {
        buyer: true
      }
    }
  }
});
```

### Environment Variables

```typescript
// packages/env/src/index.ts
export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    STRIPE_SECRET_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  }
});
```

---

## 🐛 DEBUGGING & TROUBLESHOOTING {#debugging-troubleshooting}

### Common Issues & Solutions

#### TypeScript Errors
```bash
# Check specific app
pnpm typecheck --filter=app

# Clean and reinstall
pnpm clean && pnpm install
```

#### Build Failures
```bash
# Clean turbo cache
turbo daemon clean && rm -rf .turbo

# Check for missing env vars
cat .env.example  # Compare with your .env
```

#### Database Issues
```bash
# Reset database
pnpm db:push --force-reset
pnpm db:seed

# View data
pnpm db:studio
```

#### Deployment Failures
1. Check environment variables in Vercel
2. Ensure all `NEXT_PUBLIC_` vars are set
3. Default values for optional vars
4. Check build logs for missing packages

### Debug Strategies

1. **Console Logging**
   ```typescript
   console.log('DEBUG:', { variable, state });
   ```

2. **React Dev Tools**
   - Inspect component props and state
   - Track re-renders

3. **Network Tab**
   - Monitor API calls
   - Check response payloads

4. **Database Queries**
   ```typescript
   // Enable query logging in development
   const database = new PrismaClient({
     log: ['query', 'error', 'warn']
   });
   ```

---

## ⚡ PERFORMANCE OPTIMIZATION {#performance-optimization}

### Server Component Optimization

```typescript
// Use server components for data fetching
export default async function ProductPage({ params }: Props) {
  // This runs on the server, no client bundle impact
  const product = await database.product.findUnique({
    where: { id: params.id }
  });
  
  return <ProductDetail product={product} />;
}
```

### Caching Strategies

```typescript
// Next.js 15 caching
import { unstable_cache } from 'next/cache';

export const getCachedCategories = unstable_cache(
  async () => {
    return database.category.findMany();
  },
  ['categories'],
  {
    revalidate: 3600, // 1 hour
    tags: ['categories']
  }
);

// Revalidate cache
import { revalidateTag } from 'next/cache';
revalidateTag('categories');
```

### Image Optimization

```typescript
import Image from 'next/image';

<Image
  src={product.images[0].url}
  alt={product.title}
  width={500}
  height={500}
  className="object-cover"
  loading="lazy"
  placeholder="blur"
  blurDataURL={product.images[0].blurDataUrl}
/>
```

### Bundle Optimization

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      '@repo/design-system',
      'lucide-react',
      'date-fns'
    ]
  }
};

// Tree-shake imports
// Bad: import * as utils from '@repo/utils';
// Good: import { formatPrice } from '@repo/utils/formatters';
```

### Database Query Optimization

```typescript
// Avoid N+1 queries
// Bad:
const products = await database.product.findMany();
for (const product of products) {
  const category = await database.category.findUnique({
    where: { id: product.categoryId }
  });
}

// Good:
const products = await database.product.findMany({
  include: { category: true }
});
```

---

## 🧪 TESTING STRATEGIES {#testing-strategies}

### Testing Pyramid

1. **Unit Tests** (Most)
   - Utility functions
   - Pure components
   - Business logic

2. **Integration Tests** (Some)
   - API routes
   - Database operations
   - Component interactions

3. **E2E Tests** (Few)
   - Critical user flows
   - Payment processing
   - Authentication

### Testing Patterns

#### Unit Test Example
```typescript
// __tests__/utils/formatters.test.ts
import { formatPrice } from '@/utils/formatters';

describe('formatPrice', () => {
  it('formats price correctly', () => {
    expect(formatPrice(1000)).toBe('$10.00');
    expect(formatPrice(1999)).toBe('$19.99');
  });
});
```

#### API Route Test
```typescript
// __tests__/api/products.test.ts
import { GET } from '@/app/api/products/route';

describe('GET /api/products', () => {
  it('returns products list', async () => {
    const response = await GET(new Request('http://localhost'));
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });
});
```

#### Component Test
```typescript
// __tests__/components/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/ProductCard';

describe('ProductCard', () => {
  it('displays product information', () => {
    const product = {
      id: '1',
      title: 'Test Product',
      price: 1000
    };
    
    render(<ProductCard product={product} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument();
  });
});
```

### Testing Commands
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e
```

---

## 🚀 PRODUCTION DEPLOYMENT {#production-deployment}

### Pre-Deployment Checklist

#### Environment Configuration
- [ ] PostgreSQL database (not SQLite)
- [ ] All env vars configured in Vercel
- [ ] Stripe production keys
- [ ] UploadThing configured
- [ ] Resend email service
- [ ] Error tracking (Sentry)

#### Optional Services
- [ ] Redis for caching
- [ ] CDN for images
- [ ] Rate limiting configured
- [ ] Monitoring (Better Stack)
- [ ] Analytics (PostHog)

### Deployment Process

1. **Local Validation**
   ```bash
   pnpm build
   pnpm typecheck
   pnpm test
   ```

2. **Environment Setup**
   - Copy `.env.example` to Vercel
   - Set production values
   - Enable preview deployments

3. **Database Migration**
   ```bash
   # Production migration
   pnpm db:push --prod
   ```

4. **Deploy**
   ```bash
   git push origin main
   # Vercel auto-deploys
   ```

5. **Post-Deployment**
   - Monitor error tracking
   - Check performance metrics
   - Validate critical flows

### Production Best Practices

1. **Security**
   - Enable rate limiting
   - Sanitize all inputs
   - Use HTTPS only
   - Implement CSP headers

2. **Performance**
   - Enable caching headers
   - Use CDN for assets
   - Optimize images
   - Minimize JavaScript

3. **Monitoring**
   - Set up error alerts
   - Monitor performance
   - Track user analytics
   - Regular backups

4. **Maintenance**
   - Regular dependency updates
   - Security patch monitoring
   - Performance optimization
   - User feedback loops

---

## 📚 ADDITIONAL RESOURCES

### Documentation System
1. **HANDBOOK.md** (this file) - Developer guide
2. **STATUS.md** - Current state dashboard
3. **ISSUES.md** - Technical debt tracker
4. **ROADMAP.md** - Future plans
5. **DEPLOY.md** - Production guide

### External Resources
- **Next Forge Docs:** https://next-forge.com/docs
- **Next.js 15 Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Clerk Docs:** https://clerk.com/docs
- **Stripe Docs:** https://stripe.com/docs

### Quick Reference

#### File Paths
- Dashboard: `/apps/app`
- Public Site: `/apps/web`
- API Routes: `/apps/*/app/api`
- Components: `/packages/design-system`
- Database: `/packages/database`

#### Key Components
- Product Form: `/apps/app/components/product-form.tsx`
- Cart System: `/apps/app/lib/stores/cart-store.ts`
- Auth Middleware: `/apps/app/middleware.ts`
- Database Schema: `/packages/database/prisma/schema.prisma`

---

*This handbook is your single source of truth for Threadly development. Keep it updated as patterns evolve.*