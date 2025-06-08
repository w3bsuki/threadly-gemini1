import { PrismaClient } from '../packages/database/generated/client';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('Please set the DATABASE_URL environment variable before running this script');
  process.exit(1);
}

async function fixPlaceholderImages() {
  console.log('🔍 Checking for placehold.co URLs in the database...\n');
  
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

  try {
    // Find all product images with placehold.co URLs
    const placeholderImages = await prisma.productImage.findMany({
      where: {
        imageUrl: {
          contains: 'placehold.co'
        }
      },
      include: {
        product: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    console.log(`📊 Found ${placeholderImages.length} images with placehold.co URLs\n`);

    if (placeholderImages.length === 0) {
      console.log('✅ No placehold.co URLs found in database');
      return;
    }

    // Show which products are affected
    console.log('🔍 Affected products:');
    placeholderImages.forEach(img => {
      console.log(`  • ${img.product.title} (${img.imageUrl})`);
    });

    console.log('\n🔧 Updating placehold.co URLs to use picsum.photos...\n');

    // Update each image to use picsum.photos instead
    let updateCount = 0;
    for (const img of placeholderImages) {
      // Extract dimensions from placehold.co URL if possible
      const dimensionMatch = img.imageUrl.match(/placehold\.co\/(\d+)x?(\d+)?/);
      let width = 400;
      let height = 400;
      
      if (dimensionMatch) {
        width = parseInt(dimensionMatch[1]);
        height = dimensionMatch[2] ? parseInt(dimensionMatch[2]) : width;
      }

      // Use picsum.photos as replacement (works well with Next.js Image)
      const newImageUrl = `https://picsum.photos/${width}/${height}?random=${img.id}`;

      await prisma.productImage.update({
        where: { id: img.id },
        data: { imageUrl: newImageUrl }
      });

      console.log(`  ✅ Updated: ${img.product.title} -> ${newImageUrl}`);
      updateCount++;
    }

    console.log(`\n🎉 Successfully updated ${updateCount} product images!`);

    // Verify the fix
    const remainingPlaceholders = await prisma.productImage.count({
      where: {
        imageUrl: {
          contains: 'placehold.co'
        }
      }
    });

    if (remainingPlaceholders === 0) {
      console.log('✅ All placehold.co URLs have been successfully replaced!');
    } else {
      console.log(`⚠️  Warning: ${remainingPlaceholders} placehold.co URLs still remain`);
    }

  } catch (error) {
    console.error('❌ Error fixing placeholder images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPlaceholderImages();