import { database } from "@repo/database";
import { ProductGrid } from "./product-grid";
import { ProductFilters } from "./product-filters";
import { ProductSort } from "./product-sort";
import { Pagination } from "./pagination";

const ITEMS_PER_PAGE = 12;

interface ProductsContentProps {
  searchParams: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    condition?: string;
    sort?: string;
    page?: string;
  };
}

export async function ProductsContent({ searchParams }: ProductsContentProps) {
  const page = parseInt(searchParams.page || "1");
  const skip = (page - 1) * ITEMS_PER_PAGE;

  // Build where clause for filtering
  const where: any = {
    status: "AVAILABLE",
  };

  if (searchParams.category) {
    where.categoryId = searchParams.category;
  }

  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {};
    if (searchParams.minPrice) {
      where.price.gte = parseFloat(searchParams.minPrice);
    }
    if (searchParams.maxPrice) {
      where.price.lte = parseFloat(searchParams.maxPrice);
    }
  }

  if (searchParams.condition) {
    where.condition = searchParams.condition;
  }

  // Build orderBy for sorting
  let orderBy: any = { createdAt: "desc" }; // default to newest
  
  if (searchParams.sort === "price-asc") {
    orderBy = { price: "asc" };
  } else if (searchParams.sort === "price-desc") {
    orderBy = { price: "desc" };
  } else if (searchParams.sort === "popular") {
    orderBy = { views: "desc" };
  }

  // Fetch products with pagination
  const [products, totalCount] = await Promise.all([
    database.product.findMany({
      where,
      orderBy,
      skip,
      take: ITEMS_PER_PAGE,
      include: {
        images: {
          orderBy: { displayOrder: "asc" },
          take: 1,
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
    }),
    database.product.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Fetch categories for filters
  const categories = await database.category.findMany({
    where: {
      parentId: null, // Only top-level categories
    },
    include: {
      children: true,
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Browse Products</h1>
            <p className="text-muted-foreground mt-2">
              {totalCount} products available
            </p>
          </div>
          <ProductSort currentSort={searchParams.sort} />
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <ProductFilters 
              categories={categories}
              currentFilters={searchParams}
            />
          </aside>

          <main className="lg:col-span-3">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              <>
                <ProductGrid products={products} />
                {totalPages > 1 && (
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    baseUrl="/products"
                    searchParams={searchParams}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}