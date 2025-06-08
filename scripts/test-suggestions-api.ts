import { PrismaClient } from '../packages/database/generated/client';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('Please set the DATABASE_URL environment variable before running this script');
  process.exit(1);
}

const database = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function testSuggestionsLogic() {
  console.log('🔍 Testing suggestions API logic directly...\n');

  try {
    const query = 'leather';
    const searchTerm = query.toLowerCase().trim();
    const suggestions: any[] = [];

    console.log(`Searching for: "${searchTerm}"`);

    // Get product suggestions (top 3)
    console.log('\n1. Testing product search...');
    const products = await database.product.findMany({
      where: {
        status: 'AVAILABLE',
        title: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { views: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 3,
    });

    console.log(`Found ${products.length} products matching "${searchTerm}"`);
    products.forEach(product => {
      console.log(`  • ${product.title} - ${product.brand} (Category: ${product.category?.name})`);
      suggestions.push({
        id: product.id,
        title: product.title,
        type: 'product',
        brand: product.brand,
        category: product.category?.name,
      });
    });

    // Get brand suggestions (top 2)
    console.log('\n2. Testing brand search...');
    const brands = await database.product.groupBy({
      by: ['brand'],
      where: {
        status: 'AVAILABLE',
        brand: {
          not: null,
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      _count: {
        brand: true,
      },
      orderBy: {
        _count: {
          brand: 'desc',
        },
      },
      take: 2,
    });

    console.log(`Found ${brands.length} brands matching "${searchTerm}"`);
    brands.forEach((brand, index) => {
      if (brand.brand) {
        console.log(`  • ${brand.brand} (${brand._count.brand} products)`);
        suggestions.push({
          id: `brand-${index}`,
          title: brand.brand,
          type: 'brand',
        });
      }
    });

    // Get category suggestions (top 2)
    console.log('\n3. Testing category search...');
    const categories = await database.category.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      include: {
        _count: {
          select: {
            products: {
              where: {
                status: 'AVAILABLE',
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      take: 2,
    });

    console.log(`Found ${categories.length} categories matching "${searchTerm}"`);
    categories.forEach(category => {
      console.log(`  • ${category.name} (${category._count.products} products)`);
      suggestions.push({
        id: category.id,
        title: category.name,
        type: 'category',
      });
    });

    console.log('\n📋 Final suggestions array:');
    const finalSuggestions = suggestions.slice(0, 7);
    console.log(JSON.stringify(finalSuggestions, null, 2));

    console.log(`\n✅ Would return ${finalSuggestions.length} suggestions`);

  } catch (error) {
    console.error('❌ Error testing suggestions:', error);
  } finally {
    await database.$disconnect();
  }
}

testSuggestionsLogic();