#!/usr/bin/env tsx

import { database } from '@repo/database';

async function checkDatabase() {
  console.log('🔍 Checking database connection and data...\n');
  
  try {
    // Check connection
    await database.$connect();
    console.log('✅ Database connected successfully\n');
    
    // Check data counts
    const stats = {
      users: await database.user.count(),
      products: await database.product.count(),
      categories: await database.category.count(),
      orders: await database.order.count(),
      reviews: await database.review.count(),
      messages: await database.message.count(),
    };
    
    console.log('📊 Database Statistics:');
    console.log('------------------------');
    Object.entries(stats).forEach(([table, count]) => {
      const icon = count > 0 ? '✓' : '✗';
      console.log(`${icon} ${table.padEnd(12)}: ${count}`);
    });
    
    // Check for available products specifically
    const availableProducts = await database.product.count({
      where: { status: 'AVAILABLE' }
    });
    console.log(`\n📦 Available products: ${availableProducts}`);
    
    // Sample some products if they exist
    if (stats.products > 0) {
      const sampleProducts = await database.product.findMany({
        take: 3,
        include: {
          images: true,
          category: true,
        }
      });
      
      console.log('\n🎯 Sample products:');
      sampleProducts.forEach(p => {
        console.log(`- ${p.title} (${p.status}) - $${p.price}`);
        console.log(`  Category: ${p.category?.name || 'None'}`);
        console.log(`  Images: ${p.images.length}`);
      });
    }
    
    await database.$disconnect();
    
    // Provide diagnosis
    console.log('\n🔎 Diagnosis:');
    if (stats.products === 0) {
      console.log('❌ No products in database - this is why grids are empty!');
      console.log('💡 Run: pnpm seed to populate the database');
    } else if (availableProducts === 0) {
      console.log('⚠️  Products exist but none are AVAILABLE status');
    } else {
      console.log('✅ Database has products - check queries in components');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.log('\n💡 Check your DATABASE_URL in .env.local');
  }
}

checkDatabase();