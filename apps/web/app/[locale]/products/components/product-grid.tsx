"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Card, CardContent } from "@repo/design-system/components/ui/card";
import { Heart } from "lucide-react";
import { cn } from "@repo/design-system/lib/utils";
import { ProductImage, AvatarImage } from "@repo/design-system";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100); // Assuming price is stored in cents
};

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  category: string;
  brand?: string;
  images: Array<{
    id: string;
    imageUrl: string;
    alt?: string;
    displayOrder: number;
  }>;
  seller: {
    id: string;
    firstName: string;
  };
  _count: {
    favorites: number;
  };
}

interface ProductGridProps {
  products: Product[];
}

const conditionLabels = {
  NEW: "New",
  LIKE_NEW: "Like New", 
  EXCELLENT: "Excellent",
  GOOD: "Good",
  SATISFACTORY: "Fair"
};

const conditionColors = {
  NEW: "bg-green-100 text-green-800",
  LIKE_NEW: "bg-blue-100 text-blue-800",
  EXCELLENT: "bg-purple-100 text-purple-800",
  GOOD: "bg-yellow-100 text-yellow-800",
  SATISFACTORY: "bg-gray-100 text-gray-800",
};

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <div key={product.id}>
          <Link href={`/product/${product.id}`}>
            <Card className="h-full cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg">
              <ProductImage
                src={product.images[0]?.imageUrl || ''}
                alt={product.images[0]?.alt || product.title}
                aspectRatio="3/4"
                className="w-full object-cover"
              />
              
              <CardContent className="p-4">
                <div className="mb-2">
                  <h3 className="font-medium line-clamp-2 text-sm leading-tight">
                    {product.title}
                  </h3>
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
          </Link>
        </div>
      ))}
    </div>
  );
}