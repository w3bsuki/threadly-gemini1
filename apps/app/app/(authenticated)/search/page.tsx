import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { notFound, redirect } from 'next/navigation';
import { Header } from '../components/header';
import { AddToCartButton } from '@/components/add-to-cart-button';

type SearchPageProperties = {
  searchParams: Promise<{
    q: string;
  }>;
};

export const generateMetadata = async ({
  searchParams,
}: SearchPageProperties) => {
  const { q } = await searchParams;

  return {
    title: `${q} - Search results`,
    description: `Search results for ${q}`,
  };
};

const SearchPage = async ({ searchParams }: SearchPageProperties) => {
  const { q } = await searchParams;
  const products = await database.product.findMany({
    where: {
      OR: [
        {
          title: {
            contains: q,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: q,
            mode: 'insensitive',
          },
        },
        {
          brand: {
            contains: q,
            mode: 'insensitive',
          },
        },
      ],
      status: 'AVAILABLE',
    },
    include: {
      images: {
        take: 1,
        orderBy: {
          order: 'asc',
        },
      },
      seller: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    take: 20, // Limit results
  });
  
  const { orgId } = await auth();

  if (!orgId) {
    notFound();
  }

  if (!q) {
    redirect('/');
  }

  return (
    <>
      <Header pages={['Search']} page={`Results for "${q}"`} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="group cursor-pointer rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square relative bg-muted">
                  {product.images[0] ? (
                    <img
                      src={product.images[0].url}
                      alt={product.images[0].altText || product.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm truncate">{product.title}</h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {product.seller.firstName} {product.seller.lastName}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="font-semibold text-sm">${product.price.toFixed(2)}</p>
                    <AddToCartButton 
                      product={product} 
                      size="sm" 
                      showText={false}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No products found for "{q}"</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchPage;
