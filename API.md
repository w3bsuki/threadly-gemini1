# API Documentation

## Base URLs

- **Production**: `https://api.threadly.com`
- **Development**: `http://localhost:3002`

## Authentication

Most endpoints require authentication via Clerk. Include the session token in requests:

```typescript
headers: {
  'Authorization': `Bearer ${token}`
}
```

## Endpoints

### Products

#### List Products
```http
GET /api/products
```

Query Parameters:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `category` (string): Filter by category slug
- `brand` (string): Filter by brand name
- `condition` (string): Filter by condition
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `search` (string): Search in title, description, brand
- `sort` (string): Sort by - `newest`, `price_asc`, `price_desc`

Response:
```json
{
  "products": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "price": "number",
      "brand": "string",
      "condition": "string",
      "status": "string",
      "images": [{ "url": "string" }],
      "seller": {
        "id": "string",
        "name": "string",
        "imageUrl": "string"
      },
      "category": {
        "id": "string",
        "name": "string",
        "slug": "string"
      },
      "_count": {
        "favorites": "number"
      }
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number"
  }
}
```

#### Get Product
```http
GET /api/products/[id]
```

Response includes full product details with seller stats and category hierarchy.

#### Create Product 🔒
```http
POST /api/products
```

Request Body:
```json
{
  "title": "string",
  "description": "string", 
  "price": "number",
  "categoryId": "string",
  "condition": "NEW | LIKE_NEW | GOOD | FAIR",
  "brand": "string",
  "size": "string",
  "color": "string",
  "images": ["url1", "url2"]
}
```

#### Update Product 🔒
```http
PUT /api/products/[id]
```

Request body same as create (all fields optional).

#### Delete Product 🔒
```http
DELETE /api/products/[id]
```

Returns 204 on success.

### Categories

#### List Categories
```http
GET /api/categories
```

Response:
```json
[
  {
    "id": "string",
    "name": "string",
    "slug": "string",
    "productCount": "number",
    "children": [
      {
        "id": "string",
        "name": "string", 
        "slug": "string",
        "productCount": "number"
      }
    ]
  }
]
```

### Search

#### Search Products
```http
GET /api/search?q=search+term
```

#### Search Suggestions
```http
GET /api/search/suggestions?q=search
```

Response:
```json
{
  "products": [...],
  "brands": ["string"],
  "categories": [...]
}
```

### Orders (Not Implemented)

#### Create Order 🔒
```http
POST /api/orders
```

#### List Orders 🔒
```http
GET /api/orders
```

#### Get Order 🔒
```http
GET /api/orders/[id]
```

### Messages (Not Implemented)

#### Send Message 🔒
```http
POST /api/messages
```

#### Get Conversations 🔒
```http
GET /api/messages
```

### Webhooks

#### Clerk User Events
```http
POST /webhooks/auth
```

Handles:
- `user.created`
- `user.updated`
- `user.deleted`
- `organization.created`
- `organizationMembership.created`

#### Stripe Payment Events
```http
POST /webhooks/payments
```

Handles:
- `checkout.session.completed`
- `payment_intent.succeeded`
- `subscription_schedule.canceled`

### Health Check

#### API Health
```http
GET /health
```

Response:
```json
"OK"
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "details": {} // Optional, for validation errors
}
```

Common Status Codes:
- `200` - Success
- `201` - Created
- `204` - No Content (Delete success)
- `400` - Bad Request (Validation error)
- `401` - Unauthorized
- `403` - Forbidden (No permission)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate limited:
- **Authenticated**: 100 requests per minute
- **Unauthenticated**: 20 requests per minute

Rate limit headers:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Development Tools

### Test Endpoints

#### Test Database Connection
```http
GET /api/test
```

Returns category statistics and database info (development only).

### Postman Collection

Import this collection for easy testing:

```json
{
  "info": {
    "name": "Threadly API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3002"
    }
  ]
}
```

## SDK Usage

### JavaScript/TypeScript

```typescript
import { ThreadlyAPI } from '@threadly/sdk'

const api = new ThreadlyAPI({
  baseURL: 'https://api.threadly.com',
  auth: clerkSession
})

// List products
const { products } = await api.products.list({
  category: 'women',
  sort: 'newest'
})

// Create product
const product = await api.products.create({
  title: 'Vintage Denim Jacket',
  price: 45.99,
  // ...
})
```

## WebSocket Events (Coming Soon)

For real-time features:

```typescript
const ws = new WebSocket('wss://api.threadly.com/ws')

ws.on('message:new', (data) => {
  // Handle new message
})

ws.on('order:updated', (data) => {
  // Handle order update
})
```