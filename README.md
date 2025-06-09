# 🛍️ Threadly - Premium C2C Fashion Marketplace

A modern peer-to-peer fashion marketplace built with Next.js 15, TypeScript, and Turborepo.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Push database schema
pnpm db:push

# Seed test data
pnpm db:seed

# Start development
pnpm dev
```

## 📚 Documentation

We use a streamlined 6-file documentation system:

1. **[CLAUDE.md](./CLAUDE.md)** - Development guide and patterns
2. **[STATUS.md](./STATUS.md)** - Current project status dashboard
3. **[ISSUES.md](./ISSUES.md)** - Technical debt and code issues tracker
4. **[ROADMAP.md](./ROADMAP.md)** - Feature roadmap and vision
5. **[APPS.md](./APPS.md)** - Implementation details for each app
6. **[DEPLOY.md](./DEPLOY.md)** - Production deployment guide

## 🏗️ Architecture

```
apps/
├── web/        # Public marketplace (port 3001)
├── app/        # User dashboard (port 3000)
└── api/        # Backend services (port 3002)

packages/
├── database/   # Prisma ORM
├── ui/         # Shared components
├── auth/       # Clerk integration
└── ...         # Other shared packages
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma
- **Auth**: Clerk
- **Payments**: Stripe Connect
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand + React Query
- **Real-time**: Pusher
- **Search**: Algolia

## 📦 Key Features

- ✅ User authentication and profiles
- ✅ Product listings with multi-image upload
- ✅ Real-time messaging between buyers/sellers
- ✅ Secure payments with Stripe Connect
- ✅ Advanced search and filtering
- ✅ Order management and tracking
- ✅ Review and rating system
- ✅ Responsive design

## 🧑‍💻 Development

See [CLAUDE.md](./CLAUDE.md) for development guidelines and [STATUS.md](./STATUS.md) for current tasks.

## 📄 License

Private and confidential.