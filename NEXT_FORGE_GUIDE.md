# 🚀 NEXT-FORGE COMPREHENSIVE GUIDE

*The complete reference for building production-grade applications with Next-Forge*

**Last Updated**: January 10, 2025

## 📖 Table of Contents

1. [Introduction & Overview](#introduction--overview)
2. [Setup & Configuration](#setup--configuration)
3. [Architecture Patterns](#architecture-patterns)
4. [Turborepo Best Practices](#turborepo-best-practices)
5. [File Structure & Organization](#file-structure--organization)
6. [Deployment Strategies](#deployment-strategies)
7. [Performance Optimization](#performance-optimization)
8. [Common Pitfalls & Solutions](#common-pitfalls--solutions)
9. [Authentication & Security](#authentication--security)
10. [Database & ORM](#database--orm)
11. [Testing Strategies](#testing-strategies)
12. [Monitoring & Observability](#monitoring--observability)
13. [Code Examples & Patterns](#code-examples--patterns)

---

## 🎯 Introduction & Overview

### What is Next-Forge?

Next-Forge is a **production-grade, monorepo-first, full-stack Next.js template** designed to accelerate SaaS development. Created and maintained by Vercel and the community, it represents "a culmination of experience building web apps over the last decade."

### Key Benefits

- **Weeks of Setup Eliminated**: Pre-configured with authentication, payments, analytics, and more
- **Production-Ready**: Built with scalability, security, and performance in mind
- **Opinionated Foundation**: Best practices baked in with minimal configuration needed
- **Type-Safe Throughout**: Full TypeScript support across the entire stack
- **Modern Stack**: Uses cutting-edge tools and patterns

### Core Features

- 🏗️ **Monorepo Architecture** with Turborepo
- 🔐 **Authentication** via Clerk
- 💾 **Database & ORM** with Prisma
- 💳 **Payments** via Stripe
- 📊 **Analytics** with PostHog
- 📧 **Email Templates** with React Email & Resend
- 📚 **Documentation** generator
- 🎨 **Design System** with Storybook
- 🌙 **Dark Mode** support
- 🚩 **Feature Flags**
- 🔍 **SEO Optimization**
- 🌍 **Internationalization**
- 🧪 **Testing Framework** with Vitest
- 🔒 **Security** best practices
- 📡 **Webhooks** support

---

## 🛠️ Setup & Configuration

### Prerequisites

- **Node.js** 18.0.0 or later
- **pnpm** (recommended) or npm/yarn
- **Git** for version control
- **PostgreSQL** database (or other Prisma-supported DB)
- **Stripe** account for payments
- **Clerk** account for authentication
- **Vercel** account for deployment (optional)

### Quick Start

```bash
# Create a new Next-Forge project
npx next-forge@latest init

# Navigate to project
cd your-project-name

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Push database schema
pnpm db:push

# Seed database (optional)
pnpm db:seed

# Start development server
pnpm dev
```

### Environment Configuration

Next-Forge uses a sophisticated environment variable system:

```typescript
// packages/[package]/keys.ts pattern
export const keys = () => ({
  // Required variables
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  CLERK_SECRET_KEY: z.string(),
  
  // Optional with defaults
  STRIPE_SECRET_KEY: z.string().default(''),
  RESEND_API_KEY: z.string().default(''),
});

// In env.ts files
import { createEnv } from '@t3-oss/env-nextjs';
export const env = createEnv({
  extends: [authKeys(), paymentKeys(), databaseKeys()],
  // Additional app-specific vars
});
```

### Initial Configuration Steps

1. **Database Setup**
   ```bash
   # Update DATABASE_URL in .env.local
   # Run migrations
   pnpm db:push
   ```

2. **Authentication (Clerk)**
   - Create account at clerk.com
   - Add keys to `.env.local`
   - Configure OAuth providers

3. **Payments (Stripe)**
   - Set up Stripe Connect
   - Add webhook endpoints
   - Configure product catalog

4. **Analytics (PostHog)**
   - Create PostHog project
   - Add project API key
   - Configure custom events

---

## 🏗️ Architecture Patterns

### Monorepo Structure

Next-Forge uses Turborepo to manage multiple applications and packages:

```
your-project/
├── apps/
│   ├── web/          # Main Next.js application
│   ├── api/          # API microservice
│   ├── docs/         # Documentation site
│   ├── email/        # Email templates
│   └── storybook/    # Component library
├── packages/
│   ├── database/     # Prisma schema & client
│   ├── ui/           # Shared UI components
│   ├── config/       # Shared configuration
│   ├── auth/         # Authentication logic
│   ├── analytics/    # Analytics integration
│   └── utils/        # Shared utilities
├── turbo.json        # Turborepo configuration
└── pnpm-workspace.yaml
```

### Key Architectural Principles

1. **Self-Contained Apps**: Each app should be deployable independently
2. **Shared Packages**: Common code lives in packages/
3. **Type Safety**: Everything is typed with TypeScript
4. **Server-First**: Prefer server components and actions
5. **Progressive Enhancement**: Works without JavaScript

### Data Flow Architecture

```typescript
// Server Component (default)
export default async function ProductList() {
  // Direct database access in server components
  const products = await database.product.findMany({
    include: {
      images: true,
      category: true,
    }
  });
  
  return <ProductGrid products={products} />;
}

// Client Component (only when needed)
'use client';
export function AddToCartButton({ product }: Props) {
  const [isPending, startTransition] = useTransition();
  
  return (
    <Button 
      onClick={() => {
        startTransition(async () => {
          await addToCart(product.id);
        });
      }}
      disabled={isPending}
    >
      Add to Cart
    </Button>
  );
}
```

---

## ⚡ Turborepo Best Practices

### Task Configuration

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "test": {
      "dependsOn": ["build"],
      "inputs": ["src/**", "tests/**"]
    }
  }
}
```

### Caching Strategy

1. **Remote Caching**: Enable for team collaboration
   ```bash
   turbo login
   turbo link
   ```

2. **Local Caching**: Automatic, stored in `.turbo/`

3. **Cache Invalidation**:
   ```bash
   # Clear all caches
   turbo daemon clean
   rm -rf .turbo
   
   # Run without cache
   pnpm build --force
   ```

### Parallel Execution

```json
// package.json scripts
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck"
  }
}
```

### Dependency Management

1. **Pin Versions**: Always pin turborepo version
   ```json
   {
     "devDependencies": {
       "turbo": "2.0.0"
     }
   }
   ```

2. **Workspace Protocol**: Use workspace protocol for internal packages
   ```json
   {
     "dependencies": {
       "@repo/ui": "workspace:*",
       "@repo/database": "workspace:*"
     }
   }
   ```

---

## 📁 File Structure & Organization

### Recommended Structure

```
apps/web/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Auth group routes
│   ├── (marketing)/         # Public routes
│   ├── api/                 # API routes
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/              # App-specific components
│   ├── ui/                  # UI components
│   └── features/            # Feature components
├── lib/                     # Utilities and helpers
│   ├── actions/            # Server actions
│   ├── hooks/              # Custom hooks
│   └── utils/              # Helper functions
├── public/                  # Static assets
└── env.ts                   # Environment validation
```

### Package Structure

```
packages/database/
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts             # Seed script
├── src/
│   ├── client.ts           # Prisma client export
│   └── types.ts            # Additional types
├── package.json
└── tsconfig.json
```

### Naming Conventions

- **Files**: `kebab-case.tsx`
- **Components**: `PascalCase`
- **Utilities**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`

---

## 🚀 Deployment Strategies

### Vercel Deployment (Recommended)

1. **Connect Repository**
   ```bash
   vercel link
   ```

2. **Configure Environment**
   - Add all env vars in Vercel dashboard
   - Set root directory if needed
   - Configure build settings

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Self-Hosted Deployment

1. **Docker Setup**
   ```dockerfile
   FROM node:18-alpine AS base
   
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   
   COPY package.json pnpm-lock.yaml ./
   RUN corepack enable pnpm && pnpm install --frozen-lockfile
   
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   
   RUN pnpm build
   
   FROM base AS runner
   WORKDIR /app
   ENV NODE_ENV production
   
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/.next/standalone ./
   COPY --from=builder /app/.next/static ./.next/static
   
   EXPOSE 3000
   CMD ["node", "server.js"]
   ```

2. **PM2 Configuration**
   ```javascript
   module.exports = {
     apps: [{
       name: 'next-forge',
       script: 'npm',
       args: 'start',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   };
   ```

### Database Deployment

1. **Production Database**: Use managed services
   - Vercel Postgres
   - Supabase
   - PlanetScale
   - Neon

2. **Migration Strategy**
   ```bash
   # Generate migration
   pnpm db:migrate:dev
   
   # Deploy migration
   pnpm db:migrate:deploy
   ```

---

## ⚡ Performance Optimization

### Server Components

```typescript
// Prefer server components (default)
export default async function Page() {
  const data = await fetchData();
  return <ServerComponent data={data} />;
}

// Use client components only when needed
'use client';
export function InteractiveComponent() {
  const [state, setState] = useState();
  // Interactive logic
}
```

### Image Optimization

```typescript
import Image from 'next/image';

export function OptimizedImage() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero"
      width={1200}
      height={600}
      priority // Load immediately
      placeholder="blur" // Show blur while loading
      blurDataURL={blurDataUrl}
    />
  );
}
```

### Caching Strategies

1. **Data Cache**
   ```typescript
   // Cache with revalidation
   const data = await fetch(url, {
     next: { revalidate: 3600 } // 1 hour
   });
   
   // Cache with tags
   const data = await fetch(url, {
     next: { tags: ['products'] }
   });
   ```

2. **Route Cache**
   ```typescript
   // Static route (cached by default)
   export default function Page() {
     return <div>Static content</div>;
   }
   
   // Dynamic route
   export const dynamic = 'force-dynamic';
   ```

3. **Component Memoization**
   ```typescript
   const MemoizedComponent = memo(ExpensiveComponent);
   ```

### Bundle Optimization

1. **Code Splitting**
   ```typescript
   // Dynamic imports
   const HeavyComponent = dynamic(
     () => import('./HeavyComponent'),
     { loading: () => <Skeleton /> }
   );
   ```

2. **Tree Shaking**
   ```typescript
   // Import only what you need
   import { Button } from '@/components/ui/button';
   // Not: import * as UI from '@/components/ui';
   ```

---

## ⚠️ Common Pitfalls & Solutions

### 1. Environment Variable Issues

**Problem**: Missing or incorrect env vars
**Solution**:
```typescript
// Always validate env vars
import { env } from '@/env';

// Use defaults for optional vars
const apiKey = env.OPTIONAL_API_KEY || 'default-value';
```

### 2. Build Failures

**Problem**: TypeScript or build errors
**Solution**:
```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm typecheck
pnpm build
```

### 3. Database Connection Issues

**Problem**: Can't connect to database
**Solution**:
```typescript
// Add connection pooling
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connectionLimit = 5
}
```

### 4. Hydration Errors

**Problem**: Client/server mismatch
**Solution**:
```typescript
// Ensure consistent rendering
export function TimeDisplay() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return <time>{new Date().toLocaleString()}</time>;
}
```

### 5. Performance Issues

**Problem**: Slow page loads
**Solution**:
- Use server components by default
- Implement proper caching
- Optimize images
- Lazy load components
- Use Suspense boundaries

---

## 🔐 Authentication & Security

### Clerk Integration

```typescript
// Middleware protection
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: ['/', '/api/public'],
  ignoredRoutes: ['/api/webhooks'],
});

// Get user in server components
import { currentUser } from '@clerk/nextjs/server';

export default async function Page() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');
  
  return <Dashboard user={user} />;
}

// Client-side hooks
import { useUser, useAuth } from '@clerk/nextjs';

export function UserProfile() {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  
  if (!isLoaded) return <Skeleton />;
  if (!user) return null;
  
  return <Profile user={user} onSignOut={signOut} />;
}
```

### Security Best Practices

1. **Input Validation**
   ```typescript
   import { z } from 'zod';
   
   const schema = z.object({
     email: z.string().email(),
     password: z.string().min(8),
   });
   
   export async function createUser(data: unknown) {
     const validated = schema.parse(data);
     // Process validated data
   }
   ```

2. **CSRF Protection**
   ```typescript
   // Automatic in Next.js server actions
   export async function serverAction(formData: FormData) {
     // CSRF token validated automatically
   }
   ```

3. **Rate Limiting**
   ```typescript
   import { Ratelimit } from '@upstash/ratelimit';
   
   const ratelimit = new Ratelimit({
     redis: Redis.fromEnv(),
     limiter: Ratelimit.slidingWindow(10, '10 s'),
   });
   
   export async function rateLimitedAction() {
     const { success } = await ratelimit.limit(userId);
     if (!success) throw new Error('Rate limited');
   }
   ```

4. **Content Security Policy**
   ```typescript
   // next.config.js
   const csp = `
     default-src 'self';
     script-src 'self' 'unsafe-eval' 'unsafe-inline';
     style-src 'self' 'unsafe-inline';
     img-src 'self' blob: data: https:;
     font-src 'self';
     connect-src 'self' https://api.clerk.com;
   `;
   ```

---

## 💾 Database & ORM

### Prisma Configuration

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  posts     Post[]
  profile   Profile?
  
  @@index([email])
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  String
  
  author    User     @relation(fields: [authorId], references: [id])
  
  @@index([authorId, published])
}
```

### Database Patterns

1. **Connection Management**
   ```typescript
   // packages/database/src/client.ts
   import { PrismaClient } from '@prisma/client';
   
   const globalForPrisma = globalThis as unknown as {
     prisma: PrismaClient | undefined;
   };
   
   export const prisma = globalForPrisma.prisma ?? new PrismaClient();
   
   if (process.env.NODE_ENV !== 'production') {
     globalForPrisma.prisma = prisma;
   }
   ```

2. **Query Optimization**
   ```typescript
   // Include related data to avoid N+1
   const posts = await prisma.post.findMany({
     include: {
       author: {
         select: {
           id: true,
           name: true,
           email: true,
         }
       },
       _count: {
         select: { comments: true }
       }
     }
   });
   ```

3. **Transactions**
   ```typescript
   const result = await prisma.$transaction(async (tx) => {
     const user = await tx.user.create({ data: userData });
     const profile = await tx.profile.create({
       data: { ...profileData, userId: user.id }
     });
     return { user, profile };
   });
   ```

### Migration Strategy

```bash
# Development workflow
pnpm db:migrate:dev --name add_user_role

# Production deployment
pnpm db:migrate:deploy

# Reset database (development only)
pnpm db:reset
```

---

## 🧪 Testing Strategies

### Unit Testing with Vitest

```typescript
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });
  
  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Testing

```typescript
// __tests__/api/users.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/users/route';

describe('/api/users', () => {
  it('returns users list', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });
    
    await handler(req, res);
    
    expect(res._getStatusCode()).toBe(200);
    const json = JSON.parse(res._getData());
    expect(json).toHaveProperty('users');
  });
});
```

### E2E Testing with Playwright

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can sign in', async ({ page }) => {
    await page.goto('/sign-in');
    
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });
});
```

### Testing Best Practices

1. **Test Structure**:
   - Place tests in `__tests__` folders
   - Name test files `*.test.ts(x)`
   - Group related tests with `describe`

2. **Mock External Services**:
   ```typescript
   vi.mock('@clerk/nextjs', () => ({
     currentUser: vi.fn(() => ({ id: 'test-user' })),
   }));
   ```

3. **Test Database**:
   ```typescript
   // Use separate test database
   DATABASE_URL="postgresql://test_db"
   ```

---

## 📊 Monitoring & Observability

### Error Tracking with Sentry

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
});

// Error boundary
export function ErrorBoundary({ children }: Props) {
  return (
    <Sentry.ErrorBoundary fallback={ErrorFallback}>
      {children}
    </Sentry.ErrorBoundary>
  );
}
```

### Analytics with PostHog

```typescript
// lib/posthog.ts
import posthog from 'posthog-js';

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug();
    }
  });
}

// Track events
export function trackEvent(event: string, properties?: any) {
  posthog?.capture(event, properties);
}

// Track page views
export function trackPageView() {
  posthog?.capture('$pageview');
}
```

### Performance Monitoring

```typescript
// Web Vitals tracking
export function reportWebVitals(metric: NextWebVitalsMetric) {
  switch (metric.name) {
    case 'FCP':
    case 'LCP':
    case 'CLS':
    case 'FID':
    case 'TTFB':
      trackEvent('web_vitals', {
        metric: metric.name,
        value: Math.round(metric.value),
        rating: metric.rating,
      });
      break;
  }
}
```

### Logging Strategy

```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

// Structured logging
logger.info({ userId, action: 'login' }, 'User logged in');
logger.error({ error, userId }, 'Payment failed');
```

---

## 💻 Code Examples & Patterns

### Server Actions Pattern

```typescript
// app/actions/user-actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100),
  bio: z.string().max(500).optional(),
});

export async function updateProfile(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');
  
  const data = updateProfileSchema.parse({
    name: formData.get('name'),
    bio: formData.get('bio'),
  });
  
  await prisma.user.update({
    where: { id: user.id },
    data,
  });
  
  revalidatePath('/profile');
  return { success: true };
}
```

### API Route Pattern

```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const querySchema = z.object({
  category: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));
    
    const products = await prisma.product.findMany({
      where: query.category ? { categoryId: query.category } : {},
      take: query.limit,
      skip: query.offset,
      include: {
        category: true,
        _count: { select: { reviews: true } },
      },
    });
    
    return NextResponse.json({ products });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Real-time Updates Pattern

```typescript
// Using Server-Sent Events
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: any) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };
      
      // Send initial data
      sendEvent({ type: 'connection', status: 'connected' });
      
      // Set up real-time subscription
      const unsubscribe = subscribeToUpdates((update) => {
        sendEvent({ type: 'update', data: update });
      });
      
      // Clean up on close
      request.signal.addEventListener('abort', () => {
        unsubscribe();
        controller.close();
      });
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### File Upload Pattern

```typescript
// Using UploadThing
import { createUploadthing } from 'uploadthing/next';

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 4 } })
    .middleware(async ({ req }) => {
      const user = await currentUser();
      if (!user) throw new Error('Unauthorized');
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.image.create({
        data: {
          url: file.url,
          key: file.key,
          userId: metadata.userId,
        },
      });
      
      return { uploadedBy: metadata.userId };
    }),
};
```

### Search Implementation

```typescript
// Full-text search with Prisma
export async function searchProducts(query: string) {
  return prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { category: { name: { contains: query, mode: 'insensitive' } } },
      ],
    },
    include: {
      category: true,
      images: { take: 1 },
    },
    take: 20,
  });
}

// Advanced search with filters
export async function advancedSearch(params: SearchParams) {
  const where: Prisma.ProductWhereInput = {
    AND: [
      params.query ? {
        OR: [
          { name: { contains: params.query, mode: 'insensitive' } },
          { description: { contains: params.query, mode: 'insensitive' } },
        ],
      } : {},
      params.categoryId ? { categoryId: params.categoryId } : {},
      params.minPrice ? { price: { gte: params.minPrice } } : {},
      params.maxPrice ? { price: { lte: params.maxPrice } } : {},
    ],
  };
  
  return prisma.product.findMany({
    where,
    orderBy: params.sortBy || { createdAt: 'desc' },
    take: params.limit || 20,
    skip: params.offset || 0,
  });
}
```

---

## 🎯 Key Takeaways

### When to Use Next-Forge

✅ **Perfect for:**
- New SaaS applications
- E-commerce platforms
- Multi-tenant applications
- Content platforms
- Team collaboration tools

❌ **Not ideal for:**
- Simple static websites
- Single-page applications
- Projects with very specific requirements

### Success Tips

1. **Start with the defaults** - Don't over-customize early
2. **Use the monorepo structure** - Keep code organized
3. **Leverage server components** - Better performance
4. **Follow the patterns** - Consistency is key
5. **Read the source code** - Learn from the implementation

### Resources

- **Documentation**: https://next-forge.com/docs
- **GitHub**: https://github.com/haydenbleasel/next-forge
- **Discord**: Join the community for support
- **Examples**: Check the examples/ directory

---

*This guide is a living document. As Next-Forge evolves, so should this guide. Last updated: January 10, 2025*