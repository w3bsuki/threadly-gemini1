import { getDictionary } from '@repo/internationalization';
import { createMetadata } from '@repo/seo/metadata';
import { organizationStructuredData, websiteStructuredData } from '@repo/seo/structured-data';
import type { Metadata } from 'next';
import { ProductGridServer } from '../../../components/product-grid-server';
import { Button } from '@repo/design-system/components/ui/button';
import { ShoppingBag, Plus } from 'lucide-react';
import Link from 'next/link';
import { env } from '@/env';

type HomeProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const generateMetadata = async ({
  params,
}: HomeProps): Promise<Metadata> => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return createMetadata({
    title: 'Threadly - Buy and sell fashion online',
    description: 'Buy and sell pre-loved fashion items. Discover unique pieces from brands you love at great prices.',
  });
};

const Home = async ({ params }: HomeProps) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteStructuredData),
        }}
      />
      <main className="min-h-screen bg-white">
      {/* Main Action Buttons - Buy/Sell */}
      <div className="sticky top-16 z-40 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Big Buy/Sell Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Button 
              asChild 
              className="h-14 text-lg font-semibold bg-black text-white hover:bg-gray-800 transition-colors"
            >
              <Link href="/products">
                <ShoppingBag className="h-6 w-6 mr-2" />
                BUY
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline"
              className="h-14 text-lg font-semibold border-black text-black hover:bg-gray-50 transition-colors"
            >
              <Link href={`${env.NEXT_PUBLIC_APP_URL}/selling/new`}>
                <Plus className="h-6 w-6 mr-2" />
                SELL
              </Link>
            </Button>
          </div>

          {/* Search Bar */}
          <form action="/search" method="get" className="flex gap-2">
            <input
              type="text"
              name="q"
              placeholder="Search for items, brands..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-base"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Search
            </button>
          </form>
        </div>
      </div>
      
      {/* Featured Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Featured Items</h2>
          <p className="text-gray-600 text-sm">Discover the best finds from our community</p>
        </div>
        <ProductGridServer limit={50} />
      </div>
    </main>
    </>
  );
};

export default Home;
