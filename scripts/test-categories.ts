import { PrismaClient } from '../packages/database/generated/client';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('Please set the DATABASE_URL environment variable before running this script');
  process.exit(1);
}

async function testCategories() {
  console.log('🔍 Testing categories...\n');
  
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

  try {
    // Get all categories
    const categories = await prisma.category.findMany({
      include: {
        parent: true,
        _count: {
          select: { products: true }
        }
      }
    });

    console.log('📁 All Categories:');
    categories.forEach(cat => {
      console.log(`  • ID: ${cat.id} | Name: ${cat.name} | Parent: ${cat.parent?.name || 'None'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCategories();