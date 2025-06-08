# CLAUDE.md - API App (Backend Services)

This file provides guidance to Claude Code (claude.ai/code) when working with the API application.

## Overview

The **API app** handles backend services including webhooks, scheduled jobs, server-side processing, and integrations that can't run in the browser. It serves as the backbone for asynchronous operations and third-party integrations.

## Purpose & Responsibilities

**Primary Functions:**
- Webhook processing (Stripe, Clerk, etc.)
- Scheduled/cron jobs
- Email sending
- Background job processing
- Third-party API integrations
- Data synchronization

**Key Features:**
- Stripe webhook handling
- Authentication webhooks
- Keep-alive endpoints
- Batch processing
- Email notifications
- Search indexing

## Development Commands

```bash
# From project root
pnpm dev          # Runs on port 3002

# From apps/api directory
cd apps/api
pnpm dev          # Start with webhook listener
pnpm build        # Build for production
pnpm test         # Run Vitest tests
pnpm typecheck    # TypeScript validation
pnpm stripe       # Run Stripe CLI listener only
```

## Architecture Patterns

### Route Structure
```
app/
├── api/
│   ├── products/     # Product CRUD endpoints
│   ├── categories/   # Category management
│   ├── test/         # Test endpoints
│   └── [other]/      # Additional services
├── webhooks/
│   ├── auth/         # Clerk webhooks
│   └── payments/     # Stripe webhooks
├── cron/
│   └── keep-alive/   # Scheduled jobs
└── health/           # Health check endpoint
```

### API Patterns
```typescript
// Standard API route pattern
export async function GET(request: Request) {
  // Authentication check
  const { userId } = await auth();
  if (!userId) return unauthorized();

  // Input validation
  const params = parseSearchParams(request.url);
  
  // Business logic
  const data = await fetchData(params);
  
  // Typed response
  return NextResponse.json({ data });
}
```

## Webhook Handling

**Stripe Webhooks:**
```typescript
// Verify webhook signature
const sig = headers().get('stripe-signature');
const event = stripe.webhooks.constructEvent(
  body,
  sig,
  env.STRIPE_WEBHOOK_SECRET
);

// Handle specific events
switch (event.type) {
  case 'payment_intent.succeeded':
    await handlePaymentSuccess(event.data);
    break;
  case 'checkout.session.completed':
    await handleCheckoutComplete(event.data);
    break;
}
```

**Clerk Webhooks:**
- User created/updated/deleted
- Organization events
- Session events

## Scheduled Jobs

**Cron Configuration:**
```typescript
// vercel.json
{
  "crons": [{
    "path": "/cron/keep-alive",
    "schedule": "*/5 * * * *"  // Every 5 minutes
  }]
}
```

**Common Jobs:**
- Database cleanup
- Cache warming
- Analytics aggregation
- Email digest sending
- Search index updates

## Error Handling

**Standard Error Responses:**
```typescript
// Consistent error format
export function errorResponse(
  message: string,
  status: number = 500
) {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

// Common responses
export const unauthorized = () => 
  errorResponse('Unauthorized', 401);
export const notFound = () => 
  errorResponse('Not found', 404);
export const badRequest = (msg: string) => 
  errorResponse(msg, 400);
```

## Testing Strategy

**Test Coverage:**
- API endpoint testing
- Webhook signature verification
- Error handling scenarios
- Rate limiting behavior
- Authentication flows

**Test Patterns:**
```typescript
// API route testing
describe('GET /api/products', () => {
  it('returns products for authenticated user', async () => {
    const response = await GET(mockRequest);
    expect(response.status).toBe(200);
  });
});
```

## Security Measures

**Authentication:**
- Verify Clerk session
- Validate API keys
- Check webhook signatures
- Rate limiting per endpoint

**Input Validation:**
- Zod schemas for all inputs
- SQL injection prevention
- XSS protection
- CORS configuration

## Performance Optimization

**Caching Strategies:**
- Redis for session data
- Database query caching
- Response caching headers
- Edge caching for static data

**Database Optimization:**
- Connection pooling
- Query optimization
- Proper indexing
- Batch operations

## Common Tasks

**Adding a New API Endpoint:**
1. Create route file in `app/api/`
2. Implement HTTP methods
3. Add authentication
4. Validate inputs with Zod
5. Write tests

**Adding a Webhook Handler:**
1. Create route in `app/webhooks/`
2. Verify signature
3. Parse event data
4. Implement handler logic
5. Return proper status

**Creating a Cron Job:**
1. Add route in `app/cron/`
2. Configure in vercel.json
3. Implement job logic
4. Add monitoring
5. Handle failures gracefully

## Environment Variables

Required environment variables:
- Database connection
- Stripe API keys and webhook secrets
- Clerk webhook secrets
- Email service credentials
- Redis connection (if used)
- Third-party API keys

## Monitoring & Logging

**Key Metrics:**
- API response times
- Webhook processing time
- Error rates by endpoint
- Queue depths
- Database connection pool

**Logging Strategy:**
```typescript
// Structured logging
logger.info('Payment processed', {
  orderId,
  amount,
  userId,
  timestamp: new Date()
});
```

## Deployment Notes

- Deployed as api.threadly.com
- Serverless functions on Vercel
- Auto-scaling based on load
- Webhook endpoints always available
- Cron jobs scheduled via Vercel

## Important Files
- `instrumentation.ts` - Sentry setup
- `env.ts` - Environment validation
- `app/health/route.ts` - Health checks
- `vercel.json` - Cron configuration

## Integration Guidelines

**With Other Apps:**
- Web app calls for public data
- App dashboard for authenticated operations
- Shared database via @repo/database
- Common types via packages

Remember: The API app is the reliable workhorse. It should handle failures gracefully, process webhooks securely, and keep the marketplace running smoothly 24/7.