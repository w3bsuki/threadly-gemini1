# CLAUDE.md - Web App (Public Marketplace)

This file provides guidance to Claude Code (claude.ai/code) when working with the web application.

## Overview

The **web app** is the public-facing marketplace where users browse, search, and discover products. This is the entry point for all users and is optimized for SEO, performance, and conversion.

## Purpose & Responsibilities

**Primary Functions:**
- Product browsing and discovery
- Category navigation (Men/Women/Kids/Designer/Unisex)
- Product search and filtering
- SEO-optimized product pages
- Marketing and landing pages
- User acquisition funnel

**Key Features:**
- Server-side rendering for SEO
- Advanced filtering system
- Product recommendations
- Featured categories
- Trending products
- Marketing campaigns

## Development Commands

```bash
# From project root
pnpm dev          # Runs on port 3001

# From apps/web directory
cd apps/web
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm typecheck    # TypeScript validation
pnpm test         # Run tests (when added)
```

## Architecture Patterns

### Route Structure
```
app/[locale]/
├── (home)/           # Homepage sections
├── men/              # Category pages
├── women/
├── kids/
├── designer/
├── unisex/
├── blog/             # Content marketing
├── contact/          # Support
├── legal/            # Terms, privacy
└── pricing/          # Subscription plans
```

### Key Components
- `components/header/` - Navigation with category menu
- `components/footer.tsx` - Site-wide footer
- `components/product-grid.tsx` - Product listing display
- `components/category-nav.tsx` - Category filtering

### State Management
- Server components for initial data
- React Query for client-side caching
- URL state for filters and search

## Performance Requirements

**Core Web Vitals Targets:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

**Optimization Strategies:**
- Image optimization with next/image
- Dynamic imports for heavy components
- Prefetching for navigation
- Edge caching for static content

## SEO Considerations

**Meta Tags:**
- Dynamic OG images for products
- Structured data for products
- Category-specific meta descriptions
- Sitemap generation

**URL Structure:**
- `/[locale]/[category]/[product-slug]`
- Clean, descriptive URLs
- Proper canonical tags

## Integration Points

**With App Dashboard:**
- "Sell Now" CTA → Redirects to app.threadly.com
- User authentication → Handled by app
- Product management → Via authenticated dashboard

**With API:**
- Product data fetching
- Search queries
- Analytics events
- Newsletter subscriptions

## Styling Guidelines

**Design System:**
- Use @repo/design-system components
- Maintain consistent spacing (8px grid)
- Mobile-first responsive design
- Premium aesthetic focus

**Color Scheme:**
- Primary: Brand colors
- Neutral: Grays for UI
- Accent: CTAs and highlights
- Semantic: Success/warning/error

## Testing Focus

**Critical User Flows:**
1. Browse → Filter → View Product
2. Search → Results → Product Detail
3. Category Navigation
4. Mobile Responsiveness
5. Page Load Performance

## Common Tasks

**Adding a New Category:**
1. Create route in `app/[locale]/[category]/page.tsx`
2. Update category navigation
3. Add to sitemap configuration
4. Update filtering logic

**Optimizing Performance:**
1. Check bundle size with analyzer
2. Implement lazy loading
3. Optimize images
4. Review Core Web Vitals

**Improving SEO:**
1. Update meta tags
2. Add structured data
3. Optimize content
4. Monitor search console

## Environment Variables

Required environment variables (composed from packages):
- Database connection
- Analytics tracking
- Feature flags
- CDN configuration

## Deployment Notes

- Deployed as separate Vercel project
- Uses ISR for product pages
- Edge runtime for API routes
- CDN for static assets

## Important Files
- `middleware.ts` - Locale routing
- `next.config.ts` - Build configuration
- `[locale]/layout.tsx` - Root layout
- `components/` - Shared components

## Performance Monitoring

Track these metrics:
- Page load times
- Bounce rates
- Conversion rates
- Search performance
- Mobile usage

Remember: The web app is the storefront. It should be fast, beautiful, and convert visitors into users.