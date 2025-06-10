import { currentUser } from '@repo/auth/server';
import { redirect } from 'next/navigation';
import { Header } from '../components/header';
import { SearchResults } from './components/search-results';

type SearchPageProperties = {
  searchParams: Promise<{
    q?: string;
    categories?: string;
    brands?: string;
    conditions?: string;
    sizes?: string;
    priceMin?: string;
    priceMax?: string;
    sortBy?: string;
  }>;
};

export const generateMetadata = async ({
  searchParams,
}: SearchPageProperties) => {
  const { q } = await searchParams;

  return {
    title: q ? `${q} - Search results` : 'Search - Threadly',
    description: q ? `Search results for ${q}` : 'Search for fashion items on Threadly',
  };
};

const SearchPage = async ({ searchParams }: SearchPageProperties) => {
  const params = await searchParams;
  const { q, categories, brands, conditions, sizes, priceMin, priceMax, sortBy } = params;
  
  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }

  // Build initial filters from URL parameters
  const initialFilters = {
    query: q,
    categories: categories ? [categories] : undefined,
    brands: brands ? [brands] : undefined,
    conditions: conditions ? [conditions as any] : undefined,
    sizes: sizes ? [sizes] : undefined,
    priceMin: priceMin ? parseInt(priceMin) : undefined,
    priceMax: priceMax ? parseInt(priceMax) : undefined,
    sortBy: (sortBy || 'relevance') as 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'most_viewed' | 'most_favorited'
  };

  const displayText = categories ? `${categories.charAt(0).toUpperCase() + categories.slice(1)} Fashion` :
                     q ? `Results for "${q}"` : 'Search';

  return (
    <>
      <Header 
        pages={['Search']} 
        page={displayText} 
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <SearchResults initialFilters={initialFilters} />
      </div>
    </>
  );
};

export default SearchPage;
