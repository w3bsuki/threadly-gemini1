import { database } from "@repo/database";
import { ProductGrid } from "./product-grid";
import { ProductFilters } from "./product-filters";
import { ProductSort } from "./product-sort";
import { Pagination } from "./pagination";

const ITEMS_PER_PAGE = 12;

interface ProductsContentProps {
  searchParams: {
    category?: string;
    gender?: string;
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

  // Handle gender filtering by category name
  if (searchParams.gender) {
    where.category = {
      OR: [
        { name: { contains: searchParams.gender, mode: 'insensitive' } },
        { slug: { contains: searchParams.gender, mode: 'insensitive' } }
      ]
    };
  }

  // Handle specific category within gender
  if (searchParams.category) {
    if (searchParams.gender) {
      // Refine the category search to be more specific
      where.category = {
        AND: [
          {
            OR: [
              { name: { contains: searchParams.gender, mode: 'insensitive' } },
              { slug: { contains: searchParams.gender, mode: 'insensitive' } }
            ]
          },
          {
            OR: [
              { name: { contains: searchParams.category, mode: 'insensitive' } },
              { slug: { contains: searchParams.category, mode: 'insensitive' } }
            ]
          }
        ]
      };
    } else {
      where.category = {
        OR: [
          { name: { contains: searchParams.category, mode: 'insensitive' } },
          { slug: { contains: searchParams.category, mode: 'insensitive' } }
        ]
      };
    }
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

  // Transform products to match ProductGrid interface
  const transformedProducts = products.map(product => ({
    id: product.id,
    title: product.title,
    description: product.description,
    price: Number(product.price),
    condition: product.condition,
    category: product.category.name,
    brand: product.brand || undefined,
    images: product.images.map(image => ({
      id: image.id,
      imageUrl: image.imageUrl,
      alt: image.alt || undefined,
      displayOrder: image.displayOrder,
    })),
    seller: {
      id: product.seller.id,
      firstName: product.seller.firstName || "Anonymous",
    },
    _count: product._count,
    views: product.views,
    createdAt: product.createdAt,
  }));

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
            {transformedProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              <>
                <ProductGrid products={transformedProducts} />
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