# Next Forge Development Rules & Best Practices

This document outlines the core rules and best practices for developing with Next Forge turborepo architecture. These guidelines ensure consistency, performance, and maintainability across all applications.

## 🎯 Core Principles

1. **Modularity First**: Every feature should be swappable (Clerk → Auth.js, Stripe → Lemonsqueezy)
2. **Type Safety**: 100% TypeScript with runtime validation using Zod
3. **Performance**: Optimize for Core Web Vitals (>90 score)
4. **Developer Experience**: Clear patterns, excellent documentation
5. **Production Ready**: Built for scale from day one

## 🏗️ Project Structure Rules

### Application Separation
```
apps/
├── web/       # Public marketplace (SEO-optimized, fast loading)
├── app/       # Authenticated dashboard (feature-rich, secure)
├── api/       # Backend services (webhooks, cron jobs)
├── docs/      # Documentation (Mintlify)
└── storybook/ # Component development
```

### Package Independence
- **Rule**: Packages MUST NOT depend on other workspace packages
- **Rule**: Each package exports everything needed (components, hooks, middleware, env keys)
- **Rule**: Apps compose functionality by importing from packages

## 🔐 Environment Variables

### Composable Pattern (REQUIRED)
```typescript
// apps/[app]/env.ts
import { keys as auth } from '@repo/auth/keys';
import { keys as database } from '@repo/database/keys';

export const env = createEnv({
  extends: [auth(), database()],
  server: { /* app-specific */ },
  client: { /* app-specific */ },
  runtimeEnv: { /* runtime values */ }
});
```

### Environment Rules
- **Rule**: NEVER duplicate environment variables across apps
- **Rule**: Use @t3-oss/env-nextjs for type-safe validation
- **Rule**: Each package exports its required keys
- **Rule**: Apps compose environment from packages they use

## 💻 Development Standards

### TypeScript Requirements
- **Rule**: 100% TypeScript coverage (NO JavaScript files)
- **Rule**: Strict mode enabled in tsconfig
- **Rule**: NO `any` types allowed
- **Rule**: Interface all component props

### Component Architecture
```typescript
// Smart Component (with state/logic)
export const FeatureComponent = () => {
  const [state, setState] = useState();
  const { data } = useQuery();
  // Business logic here
  return <PresentationComponent data={data} />;
};

// Dumb Component (presentation only)
export const PresentationComponent = ({ data }: Props) => {
  // Only presentation logic
  return <div>{data}</div>;
};
```

### File Organization
- **Rule**: One component per file
- **Rule**: Co-locate tests with components
- **Rule**: Group by feature, not by file type

## 🎨 UI/UX Standards

### Design System Usage
- **Rule**: Use shadcn/ui as base component library
- **Rule**: Maintain 8px grid system for spacing
- **Rule**: Mobile-first responsive design
- **Rule**: WCAG 2.1 AA accessibility compliance

### Performance Metrics
- **Rule**: Page load < 2 seconds
- **Rule**: API response < 200ms
- **Rule**: Bundle size < 500KB initial load
- **Rule**: 99.9% uptime SLA

## 🧪 Testing Requirements

### Coverage Standards
- **Rule**: Minimum 90% test coverage
- **Rule**: Unit tests for all components
- **Rule**: Integration tests for features
- **Rule**: E2E tests for critical user flows

### Test Organization
```
__tests__/
├── unit/        # Component tests
├── integration/ # Feature tests
└── e2e/         # User journey tests
```

## 🚀 Deployment Rules

### Subdomain Strategy
```
example.com         # Web app (public)
app.example.com     # Dashboard (authenticated)
api.example.com     # API services
docs.example.com    # Documentation
```

### Build Configuration
- **Rule**: Each app has independent deployment
- **Rule**: Use Vercel Team Environment Variables
- **Rule**: Configure proper ignore commands
- **Rule**: Set correct build/dev commands per app

## 📏 Code Quality

### Linting & Formatting
- **Rule**: Run `pnpm lint` before ALL commits
- **Rule**: Use Biome for consistent formatting
- **Rule**: Configure pre-commit hooks
- **Rule**: Fix all linting errors (no warnings)

### Git Workflow
- **Rule**: Use conventional commits
- **Rule**: Feature branches from main
- **Rule**: PR reviews required (no direct commits)
- **Rule**: Squash merge to main

### Naming Conventions
- **Rule**: PascalCase for components
- **Rule**: camelCase for functions/variables
- **Rule**: kebab-case for file names
- **Rule**: UPPER_SNAKE_CASE for constants

## 🔧 Development Commands

### Essential Commands
```bash
pnpm dev        # Start all development servers
pnpm build      # Build all applications
pnpm test       # Run all tests
pnpm lint       # Lint and format code
pnpm typecheck  # TypeScript validation
pnpm migrate    # Database migrations
pnpm boundaries # Check workspace boundaries
```

### App-Specific Commands
```bash
# Run from app directory
pnpm dev        # Start specific app
pnpm test       # Test specific app
pnpm build      # Build specific app
```

## 🚨 Critical Rules (MUST FOLLOW)

1. **NEVER** import from other apps
2. **NEVER** duplicate code across packages
3. **NEVER** commit directly to main
4. **NEVER** skip TypeScript checks
5. **NEVER** ignore linting errors
6. **ALWAYS** run tests before PR
7. **ALWAYS** update documentation
8. **ALWAYS** follow accessibility standards
9. **ALWAYS** optimize for performance
10. **ALWAYS** consider security implications

## 📋 PR Checklist

Before submitting a PR, ensure:
- [ ] All tests pass (`pnpm test`)
- [ ] No TypeScript errors (`pnpm typecheck`)
- [ ] Code is formatted (`pnpm lint`)
- [ ] Bundle size unchanged or reduced
- [ ] Documentation updated
- [ ] Accessibility checked
- [ ] Mobile responsive
- [ ] Performance metrics met

## 🎯 Success Metrics

Your code meets Next Forge standards when:
- ✅ 100% TypeScript coverage
- ✅ 90%+ test coverage
- ✅ Core Web Vitals > 90
- ✅ Zero linting warnings
- ✅ Clean workspace boundaries
- ✅ Documentation complete
- ✅ Accessibility compliant
- ✅ Performance optimized

Follow these rules to maintain a high-quality, scalable, and maintainable codebase that leverages the full power of Next Forge architecture.