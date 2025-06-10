import type { Metadata } from "next";
import { getDictionary } from "@repo/internationalization";
import { SearchResults } from './components/search-results';


interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ 
    q?: string;
    category?: string;
    brand?: string;
    size?: string;
    minPrice?: string;
    maxPrice?: string;
    condition?: string;
    sort?: string;
  }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const { q: query = '' } = await searchParams;
  const dictionary = await getDictionary(locale);
  
  return {
    title: query ? `Search results for "${query}" - Threadly` : "Search - Threadly",
    description: query ? `Find products matching "${query}" on Threadly marketplace` : "Search for clothing and accessories",
  };
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { locale } = await params;
  const searchParams_ = await searchParams;
  const query = searchParams_.q || '';
  const dictionary = await getDictionary(locale);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchResults initialQuery={query} />
      </div>
    </div>
  );
}