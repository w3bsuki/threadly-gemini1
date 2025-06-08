# CLAUDE.md - App Dashboard (Authenticated Users)

This file provides guidance to Claude Code (claude.ai/code) when working with the authenticated user dashboard application.

## Overview

The **app dashboard** is the authenticated user portal where sellers manage listings, buyers complete purchases, and users handle their accounts. This is the core transactional engine of the marketplace.

## Purpose & Responsibilities

**Primary Functions:**
- Product listing management (CRUD)
- Order processing and checkout
- Messaging between buyers/sellers
- User profiles and settings
- Analytics and insights
- Payment processing

**Key Features:**
- Real-time collaboration
- Secure file uploads
- Stripe Connect integration
- Advanced search
- Notification system
- Multi-language support

## Development Commands

```bash
# From project root
pnpm dev          # Runs on port 3000

# From apps/app directory
cd apps/app
pnpm dev          # Start with Turbopack
pnpm build        # Build for production
pnpm test         # Run Vitest tests
pnpm typecheck    # TypeScript validation
```

## Architecture Patterns

### Route Structure
```
app/
├── (authenticated)/  # Protected routes
│   ├── layout.tsx    # Auth wrapper
│   ├── page.tsx      # Dashboard home
│   ├── products/     # Product management
│   ├── orders/       # Order management
│   ├── messages/     # Messaging system
│   ├── settings/     # User settings
│   └── analytics/    # Seller analytics
├── (unauthenticated)/
│   ├── sign-in/      # Clerk auth
│   └── sign-up/      # User registration
└── api/
    └── collaboration/ # Liveblocks auth
```

### Key Components
- `components/sidebar.tsx` - Navigation menu
- `components/header.tsx` - Top navigation
- `components/search.tsx` - Global search
- `components/collaboration-provider.tsx` - Real-time features

### State Management
- React Query for server state
- Zustand for client state
- Liveblocks for real-time collaboration
- Form state with React Hook Form + Zod

## Authentication & Security

**Clerk Integration:**
- Middleware protection for routes
- User metadata for marketplace data
- Webhook handling for user events
- Role-based access control

**Security Measures:**
- CSRF protection
- Rate limiting with Arcjet
- Input validation with Zod
- Secure file uploads

## Real-time Features

**Liveblocks Integration:**
- Presence indicators
- Collaborative cursors
- Real-time notifications
- Live activity feeds

**Implementation:**
```typescript
// Collaboration setup in layout
<CollaborationProvider>
  <Cursors />
  {children}
</CollaborationProvider>
```

## Payment Processing

**Stripe Connect:**
- Multi-party payments
- Escrow handling
- Fee calculation
- Payout management

**Payment Flow:**
1. Buyer initiates purchase
2. Funds held in escrow
3. Seller ships item
4. Buyer confirms receipt
5. Funds released to seller

## File Management

**UploadThing Integration:**
- Product image uploads
- Profile pictures
- Size/compression validation
- CDN delivery

**Upload Patterns:**
```typescript
// Product images
const { upload } = useUploadThing("productImages", {
  onSuccess: (files) => {
    // Update product with image URLs
  }
});
```

## Testing Strategy

**Test Coverage:**
- Unit tests for components
- Integration tests for features
- API route testing
- Form validation testing

**Key Test Areas:**
1. Authentication flows
2. Product CRUD operations
3. Payment processing
4. Search functionality
5. Real-time features

## Common Tasks

**Adding a New Feature:**
1. Create route in `(authenticated)/`
2. Add to sidebar navigation
3. Implement data fetching
4. Add proper error handling
5. Write tests

**Implementing Forms:**
1. Define Zod schema
2. Create form with React Hook Form
3. Add loading/error states
4. Implement optimistic updates
5. Add success notifications

**Adding API Routes:**
1. Create route in `app/api/`
2. Add authentication check
3. Validate input with Zod
4. Implement rate limiting
5. Return typed responses

## Environment Variables

Required environment variables (composed from packages):
- Clerk authentication keys
- Database connection
- Stripe API keys
- UploadThing credentials
- Liveblocks keys
- Analytics tracking

## Performance Optimization

**Strategies:**
- Lazy load heavy components
- Implement virtual scrolling
- Optimize database queries
- Use React.memo strategically
- Implement proper caching

**Monitoring:**
- Track API response times
- Monitor real-time latency
- Check bundle sizes
- Review memory usage

## Deployment Notes

- Deployed as app.threadly.com
- Uses Turbopack in development
- Serverless functions for API
- WebSocket support for real-time

## Important Files
- `middleware.ts` - Auth protection
- `liveblocks.config.ts` - Real-time setup
- `(authenticated)/layout.tsx` - App shell
- `actions/` - Server actions

## User Experience Focus

**Key Principles:**
- Fast, responsive interface
- Clear error messages
- Optimistic UI updates
- Helpful loading states
- Intuitive navigation

Remember: The app dashboard is where business happens. It should be secure, fast, and reliable for both buyers and sellers.