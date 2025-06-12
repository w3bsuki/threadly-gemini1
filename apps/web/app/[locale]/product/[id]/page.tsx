import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { database } from "@repo/database";
import { ProductDetail } from "./components/product-detail";
import { generateProductStructuredData, generateBreadcrumbStructuredData } from "@repo/seo/structured-data";

interface ProductPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await database.product.findFirst({
    where: {
      id,
      status: "AVAILABLE",
    },
    include: {
      seller: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
      images: {
        orderBy: { displayOrder: "asc" },
        take: 1,
      },
    },
  });

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.title} - ${product.category.name} | Threadly`,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: product.images[0] ? [product.images[0].imageUrl] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.description,
      images: product.images[0] ? [product.images[0].imageUrl] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await database.product.findFirst({
    where: {
      id,
      status: "AVAILABLE",
    },
    include: {
      images: {
        orderBy: { displayOrder: "asc" },
      },
      seller: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
          joinedAt: true,
          _count: {
            select: {
              listings: {
                where: {
                  status: "SOLD",
                },
              },
              followers: true,
            },
          },
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          parent: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },
      _count: {
        select: {
          favorites: true,
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Increment view count
  await database.product.update({
    where: { id },
    data: {
      views: {
        increment: 1,
      },
    },
  });

  // Fetch similar products
  const similarProducts = await database.product.findMany({
    where: {
      categoryId: product.category.id,
      status: "AVAILABLE",
      NOT: {
        id: product.id,
      },
    },
    include: {
      images: {
        orderBy: { displayOrder: "asc" },
        take: 1,
      },
      seller: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    take: 8,
    orderBy: {
      createdAt: "desc",
    },
  });

  // Generate structured data
  const productStructuredData = generateProductStructuredData({
    id: product.id,
    title: product.title,
    description: product.description,
    price: Number(product.price),
    condition: product.condition,
    brand: product.brand || undefined,
    size: product.size || undefined,
    color: product.color || undefined,
    images: product.images.map(image => ({
      imageUrl: image.imageUrl,
      alt: image.alt || undefined,
    })),
    seller: {
      firstName: product.seller.firstName || undefined,
      lastName: product.seller.lastName || undefined,
    },
    category: product.category,
  });

  const breadcrumbStructuredData = generateBreadcrumbStructuredData([
    { name: 'Home', url: 'https://threadly.com' },
    { name: 'Products', url: 'https://threadly.com/products' },
    { name: product.category.name, url: `https://threadly.com/products?category=${product.category.slug}` },
    { name: product.title, url: `https://threadly.com/product/${product.id}` },
  ]);

  // Transform product for component (keep null values as interface expects string | null)
  const transformedProduct = {
    ...product,
    price: Number(product.price),
  };

  // Transform similar products for component
  const transformedSimilarProducts = similarProducts.map(similar => ({
    ...similar,
    price: Number(similar.price),
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />
      <ProductDetail
        product={transformedProduct}
        similarProducts={transformedSimilarProducts}
      />
    </>
  );
}