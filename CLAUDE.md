# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Threadly** is a production-ready C2C clothing marketplace like Vinted, built with a dual-app architecture for optimal performance and user experience. The project is 75% complete with solid foundations and ready for core marketplace feature implementation.

## Development Commands

This is a Turborepo monorepo with three main applications and shared packages.

### Root Commands
- `pnpm dev` - Start all development servers
- `pnpm build` - Build all applications and packages
- `pnpm test` - Run all tests across the workspace
- `pnpm lint` - Lint all code using ultracite (Biome wrapper)
- `pnpm format` - Format all code
- `pnpm typecheck` - Run TypeScript checks on all apps
- `pnpm migrate` - Run database migrations (Prisma format, generate, and push)
- `pnpm clean` - Clean all node_modules and build artifacts

### Application-Specific Commands

**App (Main authenticated application - port 3000):**
- `cd apps/app && pnpm dev` - Start user dashboard with Turbopack
- `cd apps/app && pnpm test` - Run vitest tests
- `cd apps/app && pnpm typecheck` - TypeScript checking

**Web (Public marketplace - port 3001):**
- `cd apps/web && pnpm dev` - Start public marketplace site
- `cd apps/web && pnpm typecheck` - TypeScript checking

**API (Backend services - port 3002):**
- `cd apps/api && pnpm dev` - Start API server with Stripe webhook listener
- `cd apps/api && pnpm test` - Run vitest tests
- `cd apps/api && pnpm stripe` - Run Stripe CLI webhook listener only

## Architecture Overview

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
```

### Applications
- `apps/app/` - **Authenticated user dashboard** for selling, buying, messaging, and account management
- `apps/web/` - **Public marketplace** for browsing, search, and product discovery (SEO-optimized)
- `apps/api/` - **Backend API** handling webhooks, payments, and server-side operations

### Database Schema (Prisma)
Comprehensive marketplace schema includes:
- **Users**: Clerk integration with marketplace-specific fields
- **Products**: Full product management with categories, images, conditions
- **Orders**: Complete order lifecycle with payments and tracking
- **Messages**: Real-time communication between users
- **Reviews**: User rating and feedback system
- **Favorites**: Wishlist and saved items functionality

### Shared Packages
The monorepo uses workspace packages (`@repo/*`) for shared functionality:

- `@repo/auth` - Authentication (Clerk integration)
- `@repo/database` - Database layer (Prisma) with marketplace models
- `@repo/design-system` - UI components with premium aesthetic
- `@repo/payments` - Payment processing (Stripe Connect)
- `@repo/analytics` - Analytics integration (PostHog, Vercel Analytics)
- `@repo/observability` - Monitoring and error tracking (Sentry)
- `@repo/feature-flags` - Feature flag management
- `@repo/notifications` - In-app notifications
- `@repo/security` - Security middleware (Arcjet)
- `@repo/internationalization` - i18n support

## Current Implementation Status

### ✅ Completed (75%)
- **Database Schema**: Complete marketplace models with all relationships
- **Authentication**: Clerk integration across both apps
- **UI/UX**: Premium design system with designer section
- **Navigation**: Category-based browsing (Men/Women/Kids/Designer)
- **Filtering**: Advanced product filtering system
- **Architecture**: Solid monorepo structure with proper separation
- **Payments**: Stripe foundation (mock implementation)

### 🚧 In Progress / Missing
- **Product Management**: CRUD operations for product listings
- **Image Upload**: UploadThing integration for product photos
- **Checkout Flow**: Complete purchase and order processing
- **Messaging System**: Real-time chat between buyers/sellers
- **Search Engine**: Elasticsearch/Algolia integration
- **Production Deployment**: Environment configuration and CI/CD

## Development Patterns

**Layout Structure:**
- Main app uses nested layouts with authentication guards in `(authenticated)/layout.tsx`
- Web app uses locale-based routing with `[locale]/layout.tsx`
- Shared `DesignSystemProvider` wraps all applications

**API Development:**
- Next.js API routes in each app for specific functionality
- Shared database access via `@repo/database` package
- Type-safe API calls with Zod validation

**State Management:**
- React Query for server state and caching
- Zustand for client-side state management
- Form handling with React Hook Form + Zod

**Testing:**
- Vitest for unit/integration tests in `app` and `api`
- Testing utilities in `@repo/testing` package
- React Testing Library for component tests

## MCP Server Integration

The project is configured to use Model Context Protocol servers for enhanced AI capabilities:

**Recommended MCP Servers:**
- **Pinecone MCP**: Vector database for product recommendations
- **Tavily MCP**: Enhanced search capabilities
- **Stripe MCP**: Advanced payment processing automation
- **Clientary MCP**: Business analytics and management

## Production Readiness

**Next Steps for Production:**
1. Implement core marketplace APIs (products, orders, messages)
2. Build product upload and management flows
3. Complete Stripe Connect integration for multi-party payments
4. Set up real-time messaging with WebSockets
5. Deploy to production with proper environment configuration

**Performance Requirements:**
- Page load times < 2 seconds
- API response times < 200ms
- 99.9% uptime SLA
- Mobile-first responsive design

## Documentation

All project documentation is in the root directory:

1. **[README.md](./README.md)** - Project overview and quick start
2. **[PROGRESS.md](./PROGRESS.md)** - Current status and task tracking (CHECK THIS DAILY!)
3. **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development guide and patterns
4. **[API.md](./API.md)** - API endpoints and integration
5. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
6. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture decisions

## Important Files
- `packages/database/prisma/schema.prisma` - Complete marketplace database schema
- `turbo.json` - Turborepo pipeline configuration
- `pnpm-workspace.yaml` - Workspace package definitions
- `biome.json` - Code formatting and linting rules

## Development Focus Areas

When working on this codebase, prioritize:
1. **Marketplace Functionality**: Product management, orders, payments
2. **User Experience**: Smooth flows between web and app
3. **Performance**: Fast loading, optimized queries
4. **Security**: Payment processing, user data protection
5. **Scalability**: Architecture that supports growth

## Critical Development Rules

**ALWAYS REFER TO NEXT FORGE DOCS FIRST:**
- Before implementing ANY feature, check Next Forge documentation at https://next-forge.com
- Next Forge has perfect documentation - use it instead of creating "simple" solutions
- Follow Next Forge patterns exactly as documented
- When unsure, read the docs rather than guessing

**ONE REPO AT A TIME:**
- Focus on ONLY ONE application at a time (/web OR /app)
- Complete features fully in one repo before moving to another
- Avoid cross-repo changes during feature development
- Each app can work independently and be deployed separately

The codebase has excellent foundations and is ready for the final push to production-ready marketplace functionality.