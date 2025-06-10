"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Card, CardContent } from "@repo/design-system/components/ui/card";
import { Heart } from "lucide-react";
import { cn } from "@repo/design-system/lib/utils";
import { ProductImage, AvatarImage, StaggerContainer, Animated, HoverCard } from "@repo/design-system";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100); // Assuming price is stored in cents
};

interface Product {
  id: string;
  title: string;
  price: number;
  condition: string;
  size?: string | null;
  brand?: string | null;
  images: { imageUrl: string; alt?: string | null }[];
  seller: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  _count: {
    favorites: number;
  };
}

interface ProductGridProps {
  products: Product[];
}

const conditionLabels = {
  NEW_WITH_TAGS: "New with tags",
  NEW_WITHOUT_TAGS: "New without tags",
  VERY_GOOD: "Very good",
  GOOD: "Good",
  SATISFACTORY: "Satisfactory",
};

const conditionColors = {
  NEW_WITH_TAGS: "bg-green-100 text-green-800",
  NEW_WITHOUT_TAGS: "bg-blue-100 text-blue-800",
  VERY_GOOD: "bg-purple-100 text-purple-800",
  GOOD: "bg-yellow-100 text-yellow-800",
  SATISFACTORY: "bg-gray-100 text-gray-800",
};

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <StaggerContainer 
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4"
      staggerDelay={30}
      animation="fadeInUp"
      trigger="inView"
    >
      {products.map((product, index) => (
        <Animated key={product.id} animation="fadeInUp" stagger={index} trigger="inView">
          <Link href={`/product/${product.id}`}>
            <HoverCard className="h-full">
              <Card className="h-full cursor-pointer overflow-hidden transition-all duration-300">
            <ProductImage
              src={product.images[0]?.imageUrl || ''}
              alt={product.images[0]?.alt || product.title}
              aspectRatio="3/4"
            />
              <button
                className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white hover:scale-110 transition-all duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Add to favorites
                }}
              >
                <Heart className="h-4 w-4" />
              </button>
            </div>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {product.seller.imageUrl && (
                  <AvatarImage
                    src={product.seller.imageUrl}
                    alt={`${product.seller.firstName} ${product.seller.lastName}` || "Seller"}
                    size={20}
                  />
                )}
                <span className="text-xs text-muted-foreground truncate">
                  {product.seller.firstName && product.seller.lastName 
                    ? `${product.seller.firstName} ${product.seller.lastName}` 
                    : "Anonymous"}
                </span>
              </div>
              
              <h3 className="font-medium line-clamp-2 mb-1">
                {product.title}
              </h3>
              
              <div className="flex items-center gap-2 mb-2">
                {product.size && (
                  <Badge variant="secondary" className="text-xs">
                    {product.size}
                  </Badge>
                )}
                {product.brand && (
                  <span className="text-xs text-muted-foreground truncate">
                    {product.brand}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">
                  {formatCurrency(product.price)}
                </span>
                <Badge 
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    conditionColors[product.condition as keyof typeof conditionColors]
                  )}
                >
                  {conditionLabels[product.condition as keyof typeof conditionLabels]}
                </Badge>
              </div>
              
              {product._count.favorites > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {product._count.favorites} likes
                </p>
              )}
            </CardContent>
              </Card>
            </HoverCard>
          </Link>
        </Animated>
      ))}
    </StaggerContainer>
  );
}