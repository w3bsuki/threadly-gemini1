# Stripe Connect API Endpoints

This directory contains the Stripe Connect integration endpoints for seller onboarding and account management.

## Overview

These endpoints enable sellers to:
- Create and connect their Stripe accounts
- Complete onboarding to accept payments
- Check their account status and capabilities
- Access their Stripe dashboard for payouts and analytics

## Endpoints

### 1. Onboarding (`/api/stripe/connect/onboarding`)

Creates or refreshes Stripe Connect onboarding links for sellers.

#### POST - Create/Start Onboarding
```typescript
// Request
POST /api/stripe/connect/onboarding
Authorization: Bearer <token>

// Response
{
  "url": "https://connect.stripe.com/setup/...",
  "accountId": "acct_1234567890"
}
```

#### GET - Refresh Onboarding Link
```typescript
// Request
GET /api/stripe/connect/onboarding
Authorization: Bearer <token>

// Response
{
  "url": "https://connect.stripe.com/setup/...",
  "accountId": "acct_1234567890"
}
```

### 2. Account Status (`/api/stripe/connect/status`)

Checks the status of a seller's Stripe Connect account.

#### GET - Check Account Status
```typescript
// Request
GET /api/stripe/connect/status
Authorization: Bearer <token>

// Response (Connected)
{
  "status": "connected",
  "accountId": "acct_1234567890",
  "detailsSubmitted": true,
  "chargesEnabled": true,
  "payoutsEnabled": true,
  "canAcceptPayments": true,
  "capabilities": {
    "card_payments": "active",
    "transfers": "active"
  },
  "requirements": {
    "currentlyDue": [],
    "eventuallyDue": [],
    "pastDue": [],
    "pendingVerification": [],
    "errors": []
  },
  "businessType": "individual",
  "country": "US",
  "created": "2024-01-01T00:00:00.000Z",
  "defaultCurrency": "usd",
  "requirementsCount": 0,
  "hasPendingVerification": false
}

// Response (Not Connected)
{
  "status": "not_connected",
  "message": "No Stripe account connected",
  "canAcceptPayments": false,
  "capabilities": {}
}
```

Status Values:
- `connected` - Fully onboarded and can accept payments
- `pending` - Onboarding submitted, awaiting verification
- `restricted` - Account has restrictions
- `disabled` - Account is disabled
- `not_connected` - No Stripe account exists

### 3. Dashboard Access (`/api/stripe/connect/dashboard`)

Provides access to the Stripe Express Dashboard for sellers.

#### POST - Create Dashboard Link
```typescript
// Request
POST /api/stripe/connect/dashboard
Authorization: Bearer <token>

// Response (Success)
{
  "url": "https://connect.stripe.com/express/...",
  "created": 1234567890,
  "expiresAt": "2024-01-01T00:05:00.000Z"
}

// Response (Not Ready)
{
  "error": "Stripe account setup not completed",
  "message": "Please complete your Stripe account setup before accessing the dashboard",
  "needsOnboarding": true
}
```

#### GET - Check Dashboard Access
```typescript
// Request
GET /api/stripe/connect/dashboard
Authorization: Bearer <token>

// Response
{
  "canAccessDashboard": true,
  "chargesEnabled": true,
  "detailsSubmitted": true,
  "payoutsEnabled": true,
  "reason": null
}
```

## Integration Flow

1. **Initial Setup**: When a user wants to sell, call `POST /api/stripe/connect/onboarding`
2. **Redirect**: Send the user to the returned URL to complete Stripe onboarding
3. **Return**: User returns to your app at the specified return URL
4. **Verify**: Check account status with `GET /api/stripe/connect/status`
5. **Dashboard**: Once connected, sellers can access their dashboard via `POST /api/stripe/connect/dashboard`

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `400` - Bad request (missing data, account not ready)
- `401` - Unauthorized (not logged in)
- `404` - User not found
- `500` - Server error

Error responses include:
```json
{
  "error": "Error message",
  "details": {} // Optional additional information
}
```

## Security Considerations

1. **Authentication**: All endpoints require user authentication via Clerk
2. **Account Ownership**: Users can only access their own Stripe accounts
3. **Link Expiration**: Dashboard links expire after 5 minutes
4. **HTTPS Required**: Always use HTTPS in production
5. **Webhook Security**: Validate webhooks using Stripe webhook signatures

## Testing

Use the provided `test-endpoints.ts` file to test the endpoints:

```typescript
import { testStripeConnectEndpoints } from './test-endpoints';

const results = await testStripeConnectEndpoints();
```

## Environment Variables

Required environment variables:
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - For webhook validation (if using webhooks)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - For client-side Stripe.js

## Platform Fees

The marketplace takes a 5% platform fee on all transactions. This is configured in the payment intent creation with:
```typescript
application_fee_amount: Math.round(amount * 0.05 * 100)
```

## Next Steps

After implementing these endpoints:
1. Create UI components for seller onboarding flow
2. Add webhook handlers for account updates
3. Implement payout scheduling preferences
4. Add seller analytics and reporting
5. Create admin tools for managing seller accounts