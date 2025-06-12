import type { Metadata } from "next";
import { getDictionary } from "@repo/internationalization";
import { ProductsContent } from "./components/products-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  
  return {
    title: "Products - Threadly",
    description: "Browse our collection of clothing and accessories",
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    condition?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  return <ProductsContent searchParams={resolvedSearchParams} />;
}