# Threadly - Modern C2C Fashion Marketplace

A production-ready clothing marketplace built with Next.js, TypeScript, and modern web technologies. Think Vinted, but better.

## 🏗️ Architecture

This is a **Turborepo monorepo** with three main applications:

```
apps/
├── web/        # Public marketplace (threadly.com)
├── app/        # User dashboard (app.threadly.com)
└── api/        # Backend services (api.threadly.com)

packages/       # Shared packages
├── database/   # Prisma ORM & schemas
├── ui/         # Design system components
├── auth/       # Clerk authentication
└── ...         # Other shared utilities
```

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local
cp apps/app/.env.example apps/app/.env.local
cp apps/api/.env.example apps/api/.env.local

# Push database schema
pnpm db:push

# Start development servers
pnpm dev
```

### Access Points
- Web: http://localhost:3001
- App: http://localhost:3000
- API: http://localhost:3002

## 📚 Documentation

All documentation is in the `/documentation` folder:

1. **[PROGRESS.md](./PROGRESS.md)** - Current status and task tracking
2. **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development guide and patterns
3. **[API.md](./API.md)** - API endpoints and integration
4. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
5. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture decisions

## 🔧 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma
- **Auth**: Clerk
- **Payments**: Stripe Connect
- **File Upload**: UploadThing
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **Monorepo**: Turborepo
- **Deployment**: Vercel

## 📊 Project Status

**Overall Completion: ~70%**

✅ **Completed**:
- Database schema and models
- Authentication system
- Product browsing and search
- Shopping cart functionality
- Basic UI/UX structure

🚧 **In Progress**:
- Payment processing
- Order management
- Messaging system
- Seller dashboard

❌ **Not Started**:
- Email notifications
- Mobile app
- Admin panel
- Analytics dashboard

## 🤝 Contributing

1. Check [PROGRESS.md](./PROGRESS.md) for current tasks
2. Follow patterns in [DEVELOPMENT.md](./DEVELOPMENT.md)
3. Create feature branch from `main`
4. Make changes and test thoroughly
5. Submit PR with clear description

## 📝 License

Private and confidential. All rights reserved.