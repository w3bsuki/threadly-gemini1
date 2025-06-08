import { PrismaClient } from './packages/database/generated/client/index.js';

const prisma = new PrismaClient();

async function checkImages() {
  try {
    const products = await prisma.product.findMany({
      include: {
        images: true,
        category: true,
      },
      take: 10,
    });

    console.log(`\n📦 Found ${products.length} products\n`);

    for (const product of products) {
      console.log(`Product: ${product.title}`);
      console.log(`  Category: ${product.category.name}`);
      console.log(`  Images: ${product.images.length}`);
      
      if (product.images.length > 0) {
        product.images.forEach((img, idx) => {
          console.log(`    Image ${idx + 1}: ${img.imageUrl}`);
        });
      } else {
        console.log(`    ❌ No images`);
      }
      console.log('');
    }

    // Check for any placeholder images
    const placeholderImages = await prisma.productImage.findMany({
      where: {
        OR: [
          { imageUrl: { contains: 'placeholder' } },
          { imageUrl: { contains: 'placehold' } },
        ]
      }
    });

    console.log(`\n🔍 Placeholder images found: ${placeholderImages.length}`);
    if (placeholderImages.length > 0) {
      console.log('Placeholder URLs:');
      placeholderImages.forEach(img => {
        console.log(`  - ${img.imageUrl}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImages();