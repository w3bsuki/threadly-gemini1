import { showBetaFeature } from '@repo/feature-flags';
import { getDictionary } from '@repo/internationalization';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import { ProductGridServer } from './components/product-grid-server';
import { FeaturedCategories } from './components/featured-categories';
import { NewArrivals } from './components/new-arrivals';
import { TrendingProducts } from './components/trending-products';

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
      {/* Product Grid */}
      <main className="bg-white">
        <ProductGridServer limit={50} />
      </main>
    </>
  );
};

export default Home;
