"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "../../../../../lib/stores/cart-store";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import { Card, CardContent } from "@repo/design-system/components/ui/card";
import { Separator } from "@repo/design-system/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/design-system/components/ui/breadcrumb";
import {
  Heart,
  Share2,
  MessageCircle,
  Package,
  Shield,
  Calendar,
  Users,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@repo/design-system/lib/utils";

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
  size?: string | null;
  brand?: string | null;
  color?: string | null;
  views: number;
  createdAt: Date;
  images: { imageUrl: string; alt?: string | null }[];
  seller: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
    joinedAt: Date;
    _count: {
      listings: number;
      followers: number;
    };
  };
  category: {
    id: string;
    name: string;
    slug: string;
    parent?: {
      name: string;
      slug: string;
    } | null;
  };
  _count: {
    favorites: number;
  };
}

interface SimilarProduct {
  id: string;
  title: string;
  price: number;
  images: { imageUrl: string; alt?: string | null }[];
  seller: {
    firstName: string | null;
    lastName: string | null;
  };
}

interface ProductDetailProps {
  product: Product;
  similarProducts: SimilarProduct[];
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

export function ProductDetail({ product, similarProducts }: ProductDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const { addItem } = useCartStore();

  const memberSince = new Date(product.seller.joinedAt).getFullYear();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      imageUrl: product.images[0]?.imageUrl,
      sellerId: product.seller.id,
      sellerName: product.seller.firstName && product.seller.lastName 
        ? `${product.seller.firstName} ${product.seller.lastName}` 
        : undefined,
      size: product.size || undefined,
      condition: product.condition,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {product.category.parent && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/${product.category.parent.slug}`}>
                    {product.category.parent.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${product.category.slug}`}>
                {product.category.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {product.images[selectedImageIndex] ? (
                <Image
                  src={product.images[selectedImageIndex].imageUrl}
                  alt={product.images[selectedImageIndex].alt || product.title}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "aspect-square bg-gray-100 rounded overflow-hidden border-2",
                      selectedImageIndex === index ? "border-primary" : "border-transparent"
                    )}
                  >
                    <Image
                      src={image.imageUrl}
                      alt={image.alt || `${product.title} ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <div className="text-3xl font-bold text-primary mb-4">
                {formatCurrency(product.price)}
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <Badge 
                  variant="secondary"
                  className={cn(
                    conditionColors[product.condition as keyof typeof conditionColors]
                  )}
                >
                  {conditionLabels[product.condition as keyof typeof conditionLabels]}
                </Badge>
                {product.size && (
                  <Badge variant="outline">Size: {product.size}</Badge>
                )}
                {product.brand && (
                  <Badge variant="outline">{product.brand}</Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <span>{product.views} views</span>
                <span>•</span>
                <span>{product._count.favorites} likes</span>
                <span>•</span>
                <span>Listed {new Date(product.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button size="lg" className="w-full" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsFavorited(!isFavorited)}
                >
                  <Heart className={cn("mr-2 h-4 w-4", isFavorited && "fill-current")} />
                  {isFavorited ? "Saved" : "Save"}
                </Button>
                <Button variant="outline" className="w-full">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
              <Button variant="outline" size="lg" className="w-full">
                <MessageCircle className="mr-2 h-5 w-5" />
                Message Seller
              </Button>
            </div>

            {/* Seller Information */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  {product.seller.imageUrl ? (
                    <Image
                      src={product.seller.imageUrl}
                      alt={`${product.seller.firstName} ${product.seller.lastName}` || "Seller"}
                      width={60}
                      height={60}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-[60px] h-[60px] bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">
                      {product.seller.firstName && product.seller.lastName 
                        ? `${product.seller.firstName} ${product.seller.lastName}` 
                        : "Anonymous Seller"}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Member since {memberSince}
                      </span>
                      <span>{product.seller._count.followers} followers</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {product.seller._count.listings} items sold
                </div>
              </CardContent>
            </Card>

            {/* Product Details */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Product Details</h3>
                <div className="space-y-2 text-sm">
                  {product.brand && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Brand:</span>
                      <span>{product.brand}</span>
                    </div>
                  )}
                  {product.size && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span>{product.size}</span>
                    </div>
                  )}
                  {product.color && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Color:</span>
                      <span>{product.color}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Condition:</span>
                    <span>{conditionLabels[product.condition as keyof typeof conditionLabels]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <span>{product.category.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Description */}
        <Card className="mb-12">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {product.description}
            </p>
          </CardContent>
        </Card>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-6">Similar Items</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {similarProducts.map((similar) => (
                <Link key={similar.id} href={`/product/${similar.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                    <div className="relative aspect-[3/4] bg-gray-100">
                      {similar.images[0] ? (
                        <Image
                          src={similar.images[0].imageUrl}
                          alt={similar.images[0].alt || similar.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-medium line-clamp-2 mb-1">
                        {similar.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {similar.seller.firstName && similar.seller.lastName 
                          ? `${similar.seller.firstName} ${similar.seller.lastName}` 
                          : "Anonymous"}
                      </p>
                      <span className="text-lg font-semibold">
                        {formatCurrency(similar.price)}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}