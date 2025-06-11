# 📊 Analytics & Monitoring Setup

This guide explains how to set up analytics and monitoring for Threadly.

## 🎯 Analytics Integration

### PostHog (Recommended)
1. **Sign up** at [PostHog](https://app.posthog.com)
2. **Create a project** and get your keys
3. **Add environment variables**:
   ```bash
   NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
   ```

### Google Analytics (Optional)
1. **Create GA4 property** at [Google Analytics](https://analytics.google.com)
2. **Get measurement ID** (starts with `G-`)
3. **Add environment variable**:
   ```bash
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

## 📈 What's Being Tracked

### E-commerce Events
- **Product Views** - When users view product details
- **Add to Cart** - When items are added to shopping cart
- **Favorites** - When products are favorited/unfavorited
- **Search Queries** - Search terms and results count
- **Checkout Events** - Start checkout, complete order
- **User Actions** - Sign up, sign in, profile views

### Page Analytics
- **Page Views** - Automatic tracking with PostHog
- **User Sessions** - Session duration and engagement
- **User Identification** - Logged-in user tracking
- **Error Tracking** - JavaScript errors and exceptions

### Custom Events
All events include rich context:
- Product details (ID, title, price, category, brand)
- User information (when authenticated)
- Session metadata (device, location, referrer)

## 🔍 Error Monitoring

### Sentry Integration
Error tracking is configured but needs API keys:
```bash
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
SENTRY_AUTH_TOKEN=your_token
```

### Error Boundaries
- Global error boundaries catch React errors
- API error handling with user-friendly messages
- Automatic error reporting to monitoring services

## 🏗️ Implementation Details

### Analytics Provider
Located in `/packages/analytics/`:
- PostHog client wrapper
- Google Analytics integration
- Vercel Analytics support
- Type-safe event tracking hooks

### Usage Example
```tsx
import { useAnalyticsEvents } from '@repo/analytics';

function ProductCard({ product }) {
  const { trackProductView } = useAnalyticsEvents();
  
  useEffect(() => {
    trackProductView(product);
  }, [product]);
}
```

### Event Types
All events are type-safe and include:
- E-commerce tracking (products, cart, checkout)
- User behavior (navigation, search, engagement)
- Error tracking (exceptions, failed requests)
- Performance metrics (page load, API response times)

## 🚀 Testing Analytics

### Local Development
1. **Set up PostHog** with test project
2. **Add environment variables** to `.env.local`
3. **Open browser DevTools** → Network tab
4. **Navigate the app** and see events being sent
5. **Check PostHog dashboard** for real-time events

### Production Deployment
1. **Add environment variables** to Vercel/hosting platform
2. **Deploy application** with analytics enabled
3. **Verify tracking** in PostHog dashboard
4. **Set up alerts** for errors and key metrics

## 📊 Dashboard Setup

### PostHog Dashboards
Recommended dashboard widgets:
- **Product Views** by category
- **Conversion Funnel** (view → cart → checkout)
- **User Retention** and engagement
- **Revenue Tracking** and seller metrics
- **Error Rates** and performance

### Custom Insights
- **Popular Products** and categories
- **Search Analytics** and top queries
- **User Journey** analysis
- **Seller Performance** metrics

## 🔐 Privacy & Compliance

### Data Collection
- **User consent** handled by PostHog
- **GDPR compliance** with opt-out options
- **Data retention** policies configured
- **PII protection** with data anonymization

### Configuration
PostHog is configured with:
- `person_profiles: 'identified_only'` - Only track logged-in users
- `capture_pageview: false` - Manual pageview control
- Privacy-friendly defaults for EU compliance

---

**Ready to track user behavior and optimize your marketplace!** 🎯