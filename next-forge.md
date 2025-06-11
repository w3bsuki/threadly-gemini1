# 📚 Next-Forge Complete Documentation Guide

> Your comprehensive reference for building production-ready applications with Next-Forge

## Table of Contents

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

## 1. Introduction & Overview

### What is Next-Forge?

Next-Forge is a **production-grade boilerplate** for building full-stack applications with Next.js. It provides:

- ✅ **Opinionated Architecture**: Pre-configured monorepo with best practices
- ✅ **Production-Ready Features**: Auth, payments, emails, analytics out of the box
- ✅ **Type-Safe**: End-to-end TypeScript with strict configurations
- ✅ **Performance-First**: Server components, optimized bundles, edge-ready
- ✅ **Developer Experience**: Hot reload, debugging tools, clear conventions

### Core Philosophy

1. **Convention over Configuration**: Sensible defaults that can be customized
2. **Type Safety**: If it compiles, it should work
3. **Performance**: Server-first with progressive enhancement
4. **Security**: Built-in protection against common vulnerabilities
5. **Scalability**: Patterns that work from MVP to enterprise

---

## 2. Setup & Configuration

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/your-org/your-next-forge-app
cd your-next-forge-app

# Install dependencies (requires pnpm)
pnpm install

# Set up environment variables
cp .env.example .env.local

# Push database schema
pnpm db:push

# Run development server
pnpm dev
```

### Environment Configuration

Next-Forge uses a **typed environment system** with validation:

```typescript
// packages/env/index.ts
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    CLERK_SECRET_KEY: z.string().min(1),
    STRIPE_SECRET_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    // ... map all variables
  },
});
```

### Package Manager Configuration

**Always use pnpm** with Next-Forge:

```json
// package.json
{
  "packageManager": "pnpm@8.15.0",
  "engines": {
    "node": ">=18.17.0",
    "pnpm": ">=8"
  }
}
```

---

## 3. Architecture Patterns

### Monorepo Structure

```
.
├── apps/
│   ├── web/          # Public-facing app
│   ├── app/          # Authenticated dashboard
│   └── api/          # API-only app (optional)
├── packages/
│   ├── ui/           # Shared components
│   ├── database/     # Prisma schema & client
│   ├── auth/         # Authentication logic
│   ├── emails/       # Email templates
│   └── utils/        # Shared utilities
└── tooling/          # Build & dev tools
```

### Data Flow Patterns

#### Server-First Approach

```typescript
// ✅ GOOD: Server Component (default)
export default async function ProductPage({ params }: Props) {
  const product = await db.product.findUnique({
    where: { id: params.id }
  });
  
  return <ProductDetails product={product} />;
}

// ❌ AVOID: Unnecessary client component
"use client";
export default function ProductPage({ params }: Props) {
  const [product, setProduct] = useState(null);
  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then(res => res.json())
      .then(setProduct);
  }, []);
}
```

#### Server Actions Pattern

```typescript
// app/actions/product-actions.ts
"use server";

export async function createProduct(data: FormData) {
  const user = await auth();
  if (!user) throw new Error("Unauthorized");

  const validated = productSchema.parse({
    title: data.get("title"),
    price: Number(data.get("price")),
  });

  return await db.product.create({
    data: { ...validated, userId: user.id }
  });
}

// In component
<form action={createProduct}>
  <input name="title" required />
  <input name="price" type="number" required />
  <button type="submit">Create Product</button>
</form>
```

### Package Development Patterns

```typescript
// packages/analytics/src/index.ts
export * from './provider';
export * from './hooks';
export * from './events';

// packages/analytics/src/provider.tsx
"use client";

export function AnalyticsProvider({ children }: Props) {
  useEffect(() => {
    // Initialize analytics
  }, []);
  
  return <>{children}</>;
}

// Use in apps
import { AnalyticsProvider } from '@repo/analytics';
```

---

## 4. Turborepo Best Practices

### Pipeline Configuration

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"],
      "env": ["NODE_ENV", "NEXT_PUBLIC_*"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    }
  }
}
```

### Caching Strategies

```bash
# Enable remote caching (Vercel)
pnpm turbo login
pnpm turbo link

# Cache debugging
TURBO_DRY_RUN=true pnpm build

# Force cache miss
pnpm build --force
```

### Parallel Execution

```json
// Run tasks in parallel
{
  "scripts": {
    "dev": "turbo dev --parallel",
    "build": "turbo build",
    "type-check": "turbo type-check"
  }
}
```

---

## 5. File Structure & Organization

### App Structure

```
apps/web/
├── app/
│   ├── (marketing)/        # Public routes
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── (authenticated)/    # Protected routes
│   │   ├── dashboard/
│   │   └── layout.tsx
│   ├── api/               # API routes
│   │   └── webhooks/
│   └── actions/           # Server actions
│       ├── user-actions.ts
│       └── product-actions.ts
├── components/
│   ├── ui/                # Primitive components
│   ├── forms/             # Form components
│   └── layouts/           # Layout components
├── lib/
│   ├── utils.ts           # Utilities
│   └── validations.ts     # Zod schemas
└── styles/
    └── globals.css        # Global styles
```

### Package Structure

```
packages/database/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts           # Seed script
├── src/
│   ├── client.ts         # Prisma client export
│   └── types.ts          # Generated types
├── package.json
└── tsconfig.json
```

### Naming Conventions

- **Files**: `kebab-case.tsx`
- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`

---

## 6. Deployment Strategies

### Vercel Deployment

```json
// vercel.json
{
  "buildCommand": "pnpm build --filter=web",
  "outputDirectory": "apps/web/.next",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

### Environment Setup

```bash
# Production variables
vercel env add DATABASE_URL
vercel env add CLERK_SECRET_KEY
vercel env add STRIPE_SECRET_KEY

# Preview variables
vercel env add DATABASE_URL preview
```

### Database Deployment

```bash
# Production migration
pnpm db:migrate:deploy

# Seed production data
pnpm db:seed --prod
```

### Self-Hosted Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS base
RUN npm i -g pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
```

---

## 7. Performance Optimization

### Server Components Best Practices

```typescript
// ✅ Server Component (default)
async function ProductList() {
  const products = await db.product.findMany({
    include: { images: true },
    take: 10
  });
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// Only use client when needed
"use client";
function AddToCartButton({ productId }: Props) {
  const [loading, setLoading] = useState(false);
  
  return (
    <button onClick={() => addToCart(productId)}>
      Add to Cart
    </button>
  );
}
```

### Image Optimization

```typescript
import Image from 'next/image';

// ✅ Optimized images
<Image
  src={product.image}
  alt={product.title}
  width={400}
  height={400}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={index < 3} // Above the fold
/>

// Configure image domains
// next.config.js
{
  images: {
    domains: ['your-cdn.com'],
    formats: ['image/avif', 'image/webp']
  }
}
```

### Bundle Optimization

```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: ['@repo/ui', 'lucide-react']
  },
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@sentry/node': false,
      };
    }
    return config;
  }
};
```

### Caching Strategies

```typescript
// Edge caching with proper headers
export async function GET(request: Request) {
  const products = await getProducts();
  
  return NextResponse.json(products, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}

// React cache for deduplication
import { cache } from 'react';

const getUser = cache(async (id: string) => {
  return await db.user.findUnique({ where: { id } });
});
```

---

## 8. Common Pitfalls & Solutions

### Issue: Hydration Errors

```typescript
// ❌ Problem: Date objects cause hydration mismatch
function TimeAgo({ date }: { date: Date }) {
  return <span>{date.toLocaleDateString()}</span>;
}

// ✅ Solution: Use suppressHydrationWarning or format on server
function TimeAgo({ date }: { date: Date }) {
  return (
    <time dateTime={date.toISOString()} suppressHydrationWarning>
      {date.toLocaleDateString()}
    </time>
  );
}
```

### Issue: Prisma in Edge Runtime

```typescript
// ❌ Problem: Prisma doesn't work in edge runtime
export const runtime = 'edge';

export async function GET() {
  const users = await db.user.findMany(); // Error!
}

// ✅ Solution: Use Prisma Data Proxy or Node runtime
export const runtime = 'nodejs'; // Default

// Or use Data Proxy for edge
import { PrismaClient } from '@prisma/client/edge';
```

### Issue: Environment Variables

```typescript
// ❌ Problem: Runtime errors from missing env vars
const apiKey = process.env.API_KEY; // undefined!

// ✅ Solution: Use validated env
import { env } from '@repo/env';
const apiKey = env.API_KEY; // Type-safe & validated
```

### Issue: CORS in Development

```typescript
// ❌ Problem: CORS errors between apps
fetch('http://localhost:3001/api/data'); // Blocked!

// ✅ Solution: Use rewrites in next.config.js
{
  async rewrites() {
    return [
      {
        source: '/api/external/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  }
}
```

---

## 9. Authentication & Security

### Clerk Integration

```typescript
// middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/api/webhooks(.*)"],
  ignoredRoutes: ["/api/health"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### Server-Side Auth

```typescript
import { auth } from '@clerk/nextjs/server';

export async function createPost(data: FormData) {
  const { userId } = auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }
  
  // Proceed with authenticated action
}
```

### Input Validation

```typescript
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(50),
  age: z.number().min(18).max(120),
});

export async function updateUser(data: unknown) {
  const validated = userSchema.parse(data);
  // Safe to use validated data
}
```

### CSRF Protection

```typescript
// app/api/actions/route.ts
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const headersList = headers();
  const referer = headersList.get('referer');
  
  if (!referer?.startsWith(process.env.NEXT_PUBLIC_APP_URL)) {
    return new Response('Invalid request', { status: 403 });
  }
  
  // Process request
}
```

---

## 10. Database & ORM

### Prisma Setup

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
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([email])
}
```

### Query Patterns

```typescript
// Efficient queries with relations
const posts = await db.post.findMany({
  where: { published: true },
  include: {
    author: {
      select: { name: true, image: true }
    },
    _count: {
      select: { comments: true, likes: true }
    }
  },
  orderBy: { createdAt: 'desc' },
  take: 20
});

// Transactions
const result = await db.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  const profile = await tx.profile.create({
    data: { ...profileData, userId: user.id }
  });
  return { user, profile };
});
```

### Migration Strategy

```bash
# Development
pnpm db:push # Push schema changes without migration

# Production
pnpm db:migrate:dev # Create migration
pnpm db:migrate:deploy # Deploy migration
```

---

## 11. Testing Strategies

### Unit Testing

```typescript
// __tests__/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency } from '@/lib/utils';

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });
});
```

### Component Testing

```typescript
// components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

test('calls onClick when clicked', async () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  
  await userEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### E2E Testing

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can sign in', async ({ page }) => {
  await page.goto('/sign-in');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
});
```

---

## 12. Monitoring & Observability

### Error Tracking (Sentry)

```typescript
// app/layout.tsx
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Error boundary
export function ErrorBoundary({ error }: { error: Error }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  
  return <ErrorPage />;
}
```

### Analytics (PostHog)

```typescript
// lib/posthog.ts
import posthog from 'posthog-js';

export function trackEvent(name: string, properties?: any) {
  if (typeof window !== 'undefined') {
    posthog.capture(name, properties);
  }
}

// Usage
trackEvent('product_viewed', {
  productId,
  category,
  price
});
```

### Logging

```typescript
// lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

// Usage
logger.info({ userId, action }, 'User performed action');
logger.error({ err, context }, 'Operation failed');
```

---

## 13. Code Examples & Patterns

### Server Action with Optimistic Updates

```typescript
// actions/todo-actions.ts
"use server";

export async function toggleTodo(id: string) {
  const todo = await db.todo.update({
    where: { id },
    data: { completed: { not: true } }
  });
  
  revalidatePath('/todos');
  return todo;
}

// components/TodoItem.tsx
"use client";

export function TodoItem({ todo }: Props) {
  const [optimisticTodo, setOptimisticTodo] = useOptimistic(
    todo,
    (state, completed: boolean) => ({ ...state, completed })
  );
  
  return (
    <form action={async () => {
      setOptimisticTodo(!todo.completed);
      await toggleTodo(todo.id);
    }}>
      <button>{optimisticTodo.completed ? '✓' : '○'}</button>
    </form>
  );
}
```

### File Upload Pattern

```typescript
// app/api/upload/route.ts
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return NextResponse.json({ error: 'No file' }, { status: 400 });
  }
  
  const buffer = await file.arrayBuffer();
  const filename = `${Date.now()}-${file.name}`;
  
  // Upload to S3/Cloudflare R2
  await uploadToStorage(filename, buffer);
  
  return NextResponse.json({ url: `/uploads/${filename}` });
}
```

### Real-time Updates with Server-Sent Events

```typescript
// app/api/events/route.ts
export async function GET() {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  
  const subscription = subscribeToUpdates((data) => {
    writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  });
  
  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Client component
useEffect(() => {
  const eventSource = new EventSource('/api/events');
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // Update state
  };
  
  return () => eventSource.close();
}, []);
```

### API Route with Rate Limiting

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': new Date(reset).toISOString(),
        },
      }
    );
  }
  
  // Process request
}
```

---

## Summary

Next-Forge provides a solid foundation for building production-ready applications. Key takeaways:

1. **Use Server Components by default** - Only use client components when necessary
2. **Type everything** - Leverage TypeScript for safety
3. **Follow conventions** - Consistency makes maintenance easier
4. **Optimize early** - Performance should be built-in, not bolted on
5. **Security first** - Always validate, sanitize, and authenticate

For more examples and updates, check:
- [Next-Forge GitHub](https://github.com/next-forge/next-forge)
- [Next.js Documentation](https://nextjs.org/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)