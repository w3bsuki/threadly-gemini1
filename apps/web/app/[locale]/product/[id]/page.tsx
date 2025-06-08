import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { database } from "@repo/database";
import { ProductDetail } from "./components/product-detail";

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

  return (
    <ProductDetail
      product={product}
      similarProducts={similarProducts}
    />
  );
}