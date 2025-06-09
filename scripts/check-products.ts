import { PrismaClient } from '../packages/database/generated/client';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('Please set the DATABASE_URL environment variable before running this script');
  process.exit(1);
}

async function checkProducts() {
  console.log('🔍 Checking products in database...\n');
  
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

  try {
    // Get all products
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`📦 Found ${products.length} products:\n`);
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title}`);
      console.log(`   Brand: ${product.brand || 'No brand'}`);
      console.log(`   Category: ${product.category?.name || 'No category'}`);
      console.log(`   Status: ${product.status}`);
      console.log(`   Price: $${product.price}`);
      console.log(`   Description: ${product.description?.substring(0, 100)}${product.description && product.description.length > 100 ? '...' : ''}`);
      console.log('');
    });

    // Test specific searches
    console.log('🔍 Testing search for "leather":');
    const leatherProducts = await prisma.product.findMany({
      where: {
        status: 'AVAILABLE',
        OR: [
          {
            title: {
              contains: 'leather',
            },
          },
          {
            description: {
              contains: 'leather',
            },
          },
          {
            brand: {
              contains: 'leather',
            },
          },
        ],
      },
    });
    
    console.log(`Found ${leatherProducts.length} products matching "leather"`);
    leatherProducts.forEach(product => {
      console.log(`  • ${product.title} - ${product.brand}`);
    });

    console.log('\n🔍 Testing search for "jacket":');
    const jacketProducts = await prisma.product.findMany({
      where: {
        status: 'AVAILABLE',
        OR: [
          {
            title: {
              contains: 'jacket',
            },
          },
          {
            description: {
              contains: 'jacket',
            },
          },
        ],
      },
    });
    
    console.log(`Found ${jacketProducts.length} products matching "jacket"`);
    jacketProducts.forEach(product => {
      console.log(`  • ${product.title} - ${product.brand}`);
    });

  } catch (error) {
    console.error('❌ Error checking products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();