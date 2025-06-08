# Development Guide

## 🏗️ Architecture Overview

### Application Structure

```
/apps/web (Public Marketplace)
├── Purpose: SEO-optimized browsing, discovery, marketing
├── Auth: None (public access)
├── Features: Browse, search, view products, add to cart
└── Redirects: To /app for authenticated actions

/apps/app (User Dashboard) 
├── Purpose: Authenticated user actions
├── Auth: Clerk (required)
├── Features: Sell, buy, message, manage account
└── Data: Full CRUD operations

/apps/api (Backend Services)
├── Purpose: Webhooks, cron jobs, server operations
├── Auth: API keys and webhook signatures
├── Features: Payment processing, notifications
└── Runtime: Edge functions where possible
```

### Key Design Decisions

1. **Dual-App Architecture**: Separates public (SEO) from private (functionality)
2. **Edge-First API**: Use edge runtime for better performance
3. **Server Components**: Default to RSC, client only when needed
4. **Type Safety**: Strict TypeScript throughout
5. **Shared Packages**: Reusable code in packages/

## 🛠️ Development Workflow

### 1. Always Start Here
```bash
# Check you're in the right place
pwd  # Should be /home/w3bsuki/threadly

# Start dev servers
pnpm dev

# Or start specific app
cd apps/web && pnpm dev
cd apps/app && pnpm dev  
cd apps/api && pnpm dev
```

### 2. Common Tasks

#### Adding a New Feature
1. Update database schema if needed (`packages/database/prisma/schema.prisma`)
2. Run `pnpm db:push` to update database
3. Create API endpoint in `/apps/api` or app route handler
4. Build UI components using existing patterns
5. Add to PROGRESS.md when complete

#### Creating API Endpoints
```typescript
// apps/api/app/api/[resource]/route.ts
import { createRouter } from '@repo/api/utils'
import { z } from 'zod'

const schema = z.object({
  // Define your schema
})

export const GET = createRouter()
  .use(authMiddleware)  // If auth needed
  .use(validateMiddleware(schema))
  .handler(async (req, ctx) => {
    // Your logic here
  })
```

#### Working with Database
```typescript
// Always import from the package
import { db } from '@repo/database'

// Use Prisma client
const products = await db.product.findMany({
  where: { status: 'AVAILABLE' },
  include: { 
    seller: true,
    images: true 
  }
})
```

## 📁 Code Organization

### File Naming
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- API Routes: `route.ts`
- Actions: `kebab-case.ts`

### Component Structure
```typescript
// components/product-card.tsx
import { cn } from '@repo/design-system/lib/utils'
import type { Product } from '@repo/database'

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  // Component logic
}
```

### Server Actions
```typescript
// actions/product-actions.ts
'use server'

import { auth } from '@repo/auth/server'
import { db } from '@repo/database'

export async function createProduct(data: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')
  
  // Action logic
}
```

## 🔧 Common Patterns

### Authentication Check
```typescript
// In Server Components
import { auth } from '@repo/auth/server'

const { userId } = await auth()
if (!userId) redirect('/sign-in')

// In API Routes  
import { currentUser } from '@repo/auth/server'

const user = await currentUser()
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Error Handling
```typescript
// Consistent error responses
try {
  // Your logic
} catch (error) {
  console.error('Error in [function]:', error)
  
  if (error instanceof z.ZodError) {
    return NextResponse.json({ 
      error: 'Invalid input', 
      details: error.errors 
    }, { status: 400 })
  }
  
  return NextResponse.json({ 
    error: 'Internal server error' 
  }, { status: 500 })
}
```

### Form Handling
```typescript
// Using React Hook Form + Zod
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: {
    // ...
  }
})
```

## 🧪 Testing

### Run Tests
```bash
# All tests
pnpm test

# Specific app
pnpm test:web
pnpm test:app
pnpm test:api

# Watch mode
pnpm test:watch
```

### Writing Tests
```typescript
// __tests__/product.test.ts
import { describe, it, expect } from 'vitest'

describe('Product API', () => {
  it('should create a product', async () => {
    // Test implementation
  })
})
```

## 🚀 Performance Tips

1. **Use Server Components** by default
2. **Optimize Images** with next/image
3. **Lazy Load** heavy components
4. **Cache API Responses** where appropriate
5. **Use Edge Runtime** for simple APIs
6. **Prefetch Data** in layouts

## 🐛 Debugging

### Common Issues

**"Cannot find module '@repo/...'"**
```bash
# Rebuild packages
pnpm build:packages
```

**"Database connection failed"**
```bash
# Check your .env files
# Ensure DATABASE_URL is set correctly
```

**"Clerk authentication error"**
```bash
# Verify NEXT_PUBLIC_CLERK_* vars in .env
# Check middleware.ts configuration
```

### Useful Commands
```bash
# Check TypeScript errors
pnpm typecheck

# Lint code
pnpm lint

# Format code
pnpm format

# Open database GUI
pnpm db:studio

# Check bundle size
cd apps/[app] && pnpm analyze
```

## 📝 Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push -u origin feature/your-feature

# Create PR on GitHub
```

### Commit Convention
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance

## 🔐 Security Best Practices

1. **Never commit secrets** - Use .env.local
2. **Validate all inputs** - Use Zod schemas
3. **Authenticate API routes** - Check user session
4. **Sanitize user content** - Prevent XSS
5. **Use CSRF protection** - Already configured
6. **Rate limit APIs** - Use Upstash ratelimit

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)