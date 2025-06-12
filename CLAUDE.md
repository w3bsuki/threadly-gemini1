# 🧠 CLAUDE.md - The Operational Brain

*The definitive guide for autonomous development on Threadly*

**Last Updated**: January 12, 2025  
**Purpose**: Enable continuous improvement through systematic workflows  
**Philosophy**: Audit → Plan → Execute → Ship → Repeat

---

## ⚡ THE 3-FILE SYSTEM

We maintain exactly **THREE** core documentation files:

### 1. **CLAUDE.md** (This File) 
**Purpose**: HOW we work - patterns, workflows, commands  
**Use**: Reference before any work, learn patterns  
**Update**: When discovering new patterns or workflows

### 2. **WORK.md**
**Purpose**: WHAT we're doing - current tasks, bugs, blockers  
**Use**: Daily workspace for active development  
**Update**: Immediately when starting/completing tasks

### 3. **VISION.md**
**Purpose**: WHERE we're going - roadmap, metrics, strategy  
**Use**: Weekly planning and strategic decisions  
**Update**: Weekly reviews and milestone completion

---

## 🔄 THE CONTINUOUS IMPROVEMENT CYCLE

### **Phase 1: AUDIT** 🔍 (30 minutes)
Find problems before they find you.

```bash
# Run the audit suite
grep -r "TODO\|FIXME\|HACK" apps/ --include="*.ts" --include="*.tsx" | wc -l
grep -r "console\." apps/ --include="*.ts" --include="*.tsx" | wc -l
pnpm typecheck 2>&1 | grep -c "error"
pnpm audit | grep -E "(critical|high)" | wc -l

# Check specific concerns
find . -name "*.tsx" -exec grep -l "'use client'" {} \; | wc -l  # Unnecessary client components
rg "any" --type ts --type tsx | wc -l  # TypeScript any usage
```

**Document findings in WORK.md under "Known Bugs & Issues"**

### **Phase 2: PLAN** 📋 (20 minutes)
Convert findings into actionable tasks.

1. Open WORK.md
2. Review "Critical Production Blockers"
3. Check "Active Development Tasks"
4. Pick 3-5 tasks for today
5. Use TodoWrite to track them

**Prioritization Matrix**:
- 🔴 **Critical**: Blocks launch (fix immediately)
- 🟡 **High**: Major user impact (fix this week)
- 🟢 **Medium**: Quality of life (fix this month)
- 🔵 **Low**: Nice to have (backlog)

### **Phase 3: EXECUTE** 💻 (4-6 hours)
Ship working code using established patterns.

**Before coding**:
- Check if similar code exists
- Review patterns below
- Plan your approach

**During coding**:
- Follow existing conventions
- Test as you go
- Update WORK.md immediately

**After coding**:
```bash
pnpm typecheck    # Must pass
pnpm build        # Must succeed
pnpm test         # If tests exist
```

### **Phase 4: SHIP** 🚀 (30 minutes)
Deploy with confidence.

**Pre-commit checklist**:
- [ ] No console.log statements
- [ ] TypeScript strict (no any)
- [ ] Tests pass (if exist)
- [ ] WORK.md updated
- [ ] Meaningful commit message

**Commit format**:
```
type(scope): description

- Detail 1
- Detail 2

Fixes #issue
```

### **Phase 5: REPEAT** 🔁
Start the next cycle. Never stop improving.

---

## 💪 QUICK COMMANDS

```bash
# DEVELOPMENT
pnpm dev          # Start everything
pnpm build        # Build all apps
pnpm typecheck    # Check types (run before EVERY commit)

# DATABASE  
pnpm db:push      # Update schema
pnpm db:seed      # Add test data
pnpm db:studio    # Visual database browser

# DEBUGGING
pnpm why [pkg]    # Why is package installed
pnpm ls [pkg]     # List package versions
pnpm clean        # Clean all build artifacts

# QUALITY CHECKS
pnpm audit                    # Security vulnerabilities
pnpm typecheck --no-errors    # Type check without failing
rg "console\." apps/          # Find console statements
```

---

## 🏗️ CODE PATTERNS

### Database Access (with caching)
```typescript
import { database } from '@repo/database';
import { getCacheService } from '@repo/cache';

const cache = getCacheService({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Always use caching for read operations
const products = await cache.remember(
  'products:featured',
  async () => {
    return database.product.findMany({
      where: { featured: true },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        seller: { select: { id: true, firstName: true } },
        _count: { select: { favorites: true } }
      }
    });
  },
  300 // 5 minute cache
);
```

### API Routes (Next.js 15 async params)
```typescript
// PARAMS ARE NOW ASYNC - ALWAYS AWAIT!
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // MUST AWAIT
  
  try {
    const product = await database.product.findUnique({
      where: { id }
    });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Server vs Client Components
```typescript
// DEFAULT: Server Component (for data fetching)
export default async function ProductList() {
  const products = await database.product.findMany();
  return <ProductGrid products={products} />;
}

// Client Component (ONLY for interactivity)
'use client';
import { useCartStore } from '@/lib/stores/cart-store';

export function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore(state => state.addItem);
  
  return (
    <Button onClick={() => addItem(product)}>
      Add to Cart
    </Button>
  );
}
```

### Form Handling with Validation
```typescript
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(3).max(100),
  price: z.number().positive(),
  description: z.string().min(10).max(1000),
});

export function ProductForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      await createProduct(data);
      toast.success('Product created!');
    } catch (error) {
      toast.error('Something went wrong');
    }
  };
  
  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

### Error Handling Pattern
```typescript
// In API routes
try {
  // ... operation
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Duplicate entry' },
        { status: 409 }
      );
    }
  }
  
  console.error('Unexpected error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

---

## 🚫 ANTI-PATTERNS TO AVOID

### ❌ DON'T: Create new files unnecessarily
```typescript
// BAD: Creating new component file
// components/special-button.tsx

// GOOD: Use existing components
import { Button } from '@repo/design-system';
```

### ❌ DON'T: Use any types
```typescript
// BAD
const handleData = (data: any) => { ... }

// GOOD
const handleData = (data: Product) => { ... }
```

### ❌ DON'T: Client components for data fetching
```typescript
// BAD
'use client';
export function ProductList() {
  const [products, setProducts] = useState([]);
  useEffect(() => { fetchProducts()... }, []);
}

// GOOD
export default async function ProductList() {
  const products = await database.product.findMany();
}
```

### ❌ DON'T: Ignore TypeScript errors
```typescript
// BAD
// @ts-ignore
const result = someFunction();

// GOOD: Fix the type issue properly
```

---

## 🏃 DAILY WORKFLOW

### Morning (15 min)
1. Run audit commands
2. Check WORK.md for priorities
3. Pick 3-5 tasks
4. Update TodoWrite

### Development (4-6 hours)
1. Follow patterns above
2. Test as you code
3. Update WORK.md immediately
4. Commit often with good messages

### Evening (15 min)
1. Run `pnpm typecheck && pnpm build`
2. Update WORK.md with progress
3. Plan tomorrow's tasks
4. Check VISION.md for alignment

---

## 🔥 EMERGENCY PROCEDURES

### Production Down
1. Check error logs in Vercel
2. Roll back deployment if needed
3. Fix locally with tests
4. Deploy hotfix
5. Document in WORK.md

### Major Bug Found
1. Add to WORK.md as Critical
2. Stop current work
3. Fix with test coverage
4. Deploy immediately
5. Monitor for 1 hour

### Performance Issue
1. Check bundle size
2. Review recent changes
3. Profile with Chrome DevTools
4. Optimize largest contributors
5. Deploy and measure

---

## 📚 PROJECT CONTEXT

### What is Threadly?
Premium C2C fashion marketplace (Vinted competitor) with:
- **Sellers**: List items, manage orders, track earnings
- **Buyers**: Browse, purchase, message sellers
- **Platform**: Takes 5% commission on sales

### Tech Stack
- **Frontend**: Next.js 15, TypeScript, Tailwind
- **Backend**: Prisma, PostgreSQL, tRPC
- **Payments**: Stripe Connect
- **Auth**: Clerk
- **Hosting**: Vercel
- **Real-time**: Pusher
- **Search**: Algolia

### Architecture
```
/apps
  /web     → Public marketplace
  /app     → Seller dashboard  
  /api     → Backend services
/packages
  /database     → Prisma schema
  /design-system → UI components
  /auth         → Authentication
  /email        → Email templates
```

---

## 🎯 SUCCESS METRICS

Track these in every session:

### Code Quality
- TypeScript errors: 0
- Console.logs removed: 100%
- Tests passing: 100%
- Build success: ✅

### Productivity
- Tasks completed/day: 3-5
- Bugs fixed/session: 2-3
- Features shipped/week: 1-2

### Performance
- Bundle size: <50MB
- First paint: <2s
- API response: <200ms

---

## 🔗 QUICK LINKS

- **Local**: http://localhost:3000 (web), http://localhost:3001 (app)
- **Staging**: https://threadly-staging.vercel.app
- **Production**: https://threadly.com (when live)
- **Database**: `pnpm db:studio`
- **Docs**: This file + WORK.md + VISION.md

---

## 💡 REMEMBER

1. **Edit > Create** - Always prefer editing existing files
2. **Ship > Perfect** - Working code now beats perfect code later
3. **Test > Hope** - Verify everything works before moving on
4. **Document > Memory** - Update WORK.md immediately
5. **Pattern > Creativity** - Follow established patterns

---

*"The best code is code that works, is maintainable, and ships on time."*

**Next Action**: Open WORK.md → Pick a Critical Blocker → Start coding