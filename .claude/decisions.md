# Threadly Architectural Decisions

> Last Updated: 2025-01-06
> Purpose: Key decisions & patterns to follow

## 🏗️ Architecture Decisions

### Dual-App Strategy ✅
**Decision**: Separate `/web` and `/app` applications
**Rationale**: 
- `/web` - SEO-optimized public marketplace
- `/app` - Rich authenticated user experience
- Better performance and maintenance separation

**Pattern**: Use shared packages (`@repo/*`) for common functionality

### Database & ORM ✅
**Decision**: Prisma with PostgreSQL
**Schema**: Complete marketplace model with all relationships
- Users (Clerk integration)
- Products with categories and conditions
- Orders with payment tracking
- Messages for buyer-seller communication
- Reviews and favorites

### Authentication ✅
**Decision**: Clerk for user management
**Integration**: Configured across both apps with middleware
**Pattern**: Use `auth()` helper for server components

### UI/UX System ✅
**Decision**: Custom design system with premium aesthetic
**Components**: Built with Radix UI primitives
**Theming**: CSS variables with dark mode support

### Payment Processing 🚧
**Decision**: Stripe Connect for marketplace payments
**Status**: Foundation in place, needs completion
**Pattern**: Multi-party payments for C2C transactions

## 🎯 Development Patterns

### API Development
```typescript
// Pattern: Next.js API routes with Zod validation
export async function POST(request: Request) {
  const body = await request.json()
  const validated = ProductSchema.parse(body)
  // ... implementation
}
```

### State Management
- **Server State**: React Query for API data
- **Client State**: Zustand for UI state
- **Forms**: React Hook Form + Zod validation

### File Organization
```
/app/(authenticated)/feature/
  ├── actions/          # Server actions
  ├── components/       # Feature components  
  └── page.tsx         # Route component
```

### Testing Strategy
- **Unit Tests**: Vitest for business logic
- **Integration**: API route testing
- **Components**: React Testing Library

## 📋 Coding Standards

### TypeScript
- Strict mode enabled
- Use Zod for runtime validation
- Prefer type inference over explicit types

### React Patterns
- Server components by default
- Client components only when needed (`"use client"`)
- Async server components for data fetching

### Database Access
```typescript
// Pattern: Use shared database package
import { db } from '@repo/database'
const products = await db.product.findMany()
```

## 🚫 Anti-Patterns to Avoid

### Don't
- ❌ Mix web and app concerns in single components
- ❌ Create new packages without clear need
- ❌ Skip Zod validation for user inputs
- ❌ Use client components for static content
- ❌ Implement auth manually (use Clerk)

### Do
- ✅ Follow Next Forge documentation patterns
- ✅ Focus on one app at a time during development
- ✅ Use server actions for mutations
- ✅ Implement proper error boundaries
- ✅ Test API endpoints thoroughly

## 🔄 Development Workflow

1. **Feature Planning**: Check Next Forge docs first
2. **Implementation**: Start with server components
3. **Validation**: Add Zod schemas for data
4. **Testing**: Write tests for critical paths
5. **Integration**: Ensure cross-app compatibility

## 🎯 Current Focus Decisions

### Product Management
- **Location**: `/apps/app` (authenticated dashboard)
- **Flow**: Upload → Edit → Publish → Manage
- **Images**: UploadThing integration
- **Validation**: Comprehensive Zod schemas

This decision log ensures consistent patterns and prevents architectural drift.