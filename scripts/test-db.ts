import { PrismaClient } from '../packages/database/generated/client';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('Please set the DATABASE_URL environment variable before running this script');
  process.exit(1);
}

async function testDatabase() {
  console.log('🔍 Testing database connection...\n');
  
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

  try {
    // Test connection
    const categoryCount = await prisma.category.count();
    console.log(`✅ Database connected successfully!`);
    console.log(`📊 Found ${categoryCount} categories in the database\n`);

    // List some categories
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: true,
        _count: {
          select: { products: true }
        }
      }
    });

    console.log('📁 Root Categories:');
    categories.forEach(cat => {
      console.log(`  • ${cat.name} (${cat.children.length} subcategories)`);
    });

    // Test product query
    const productCount = await prisma.product.count();
    console.log(`\n📦 Total products: ${productCount}`);

  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();