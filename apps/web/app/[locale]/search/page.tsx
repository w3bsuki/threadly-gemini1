import type { Metadata } from "next";
import { getDictionary } from "@repo/internationalization";
import { SearchResults } from "./components/search-results";

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: { q?: string };
}

export async function generateMetadata({
  params,
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const query = searchParams.q || '';
  
  return {
    title: query ? `Search results for "${query}" - Threadly` : "Search - Threadly",
    description: query ? `Find products matching "${query}" on Threadly marketplace` : "Search for clothing and accessories",
  };
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const query = searchParams.q || '';

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6">
        <SearchResults query={query} />
      </div>
    </div>
  );
}