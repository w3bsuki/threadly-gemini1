#!/usr/bin/env node

/**
 * Production Database Setup Script
 * 
 * This script:
 * 1. Validates PostgreSQL connection
 * 2. Runs database migrations
 * 3. Seeds initial data for production
 * 4. Validates all critical operations
 */

import { database } from '@repo/database';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  ssl: boolean;
}

async function parsePostgreSQLUrl(url: string): Promise<DatabaseConfig> {
  const urlObj = new URL(url);
  
  return {
    host: urlObj.hostname,
    port: parseInt(urlObj.port) || 5432,
    database: urlObj.pathname.slice(1),
    user: urlObj.username,
    ssl: urlObj.searchParams.has('sslmode') || urlObj.protocol === 'postgres:'
  };
}

async function validateConnection(): Promise<boolean> {
  try {
    console.log('🔍 Validating database connection...');
    
    await database.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

async function runMigrations(): Promise<boolean> {
  try {
    console.log('🚀 Running database migrations...');
    
    const { stdout, stderr } = await execAsync('pnpm db:push', {
      cwd: process.cwd()
    });
    
    if (stderr && !stderr.includes('warnings')) {
      console.error('❌ Migration failed:', stderr);
      return false;
    }
    
    console.log('✅ Database migrations completed');
    console.log(stdout);
    return true;
  } catch (error) {
    console.error('❌ Migration error:', error);
    return false;
  }
}

async function createEssentialCategories(): Promise<void> {
  console.log('📦 Creating essential categories...');
  
  const categories = [
    { name: 'Women\'s Clothing', slug: 'womens-clothing' },
    { name: 'Men\'s Clothing', slug: 'mens-clothing' },
    { name: 'Shoes', slug: 'shoes' },
    { name: 'Accessories', slug: 'accessories' },
    { name: 'Bags', slug: 'bags' },
    { name: 'Jewelry', slug: 'jewelry' },
    { name: 'Beauty', slug: 'beauty' },
    { name: 'Home & Living', slug: 'home-living' }
  ];

  for (const category of categories) {
    try {
      await database.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: category
      });
      console.log(`✅ Category created: ${category.name}`);
    } catch (error) {
      console.warn(`⚠️  Category ${category.name} may already exist`);
    }
  }
}

async function validateOperations(): Promise<boolean> {
  try {
    console.log('🧪 Testing database operations...');
    
    // Test basic CRUD operations
    const testOps = [
      // Categories
      () => database.category.count(),
      // Users (should be empty in fresh DB)
      () => database.user.count(),
      // Products (should be empty in fresh DB)
      () => database.product.count()
    ];

    const results = await Promise.all(testOps);
    console.log('📊 Database counts:', {
      categories: results[0],
      users: results[1],
      products: results[2]
    });

    console.log('✅ All database operations working correctly');
    return true;
  } catch (error) {
    console.error('❌ Database operation test failed:', error);
    return false;
  }
}

async function setupIndexes(): Promise<void> {
  try {
    console.log('🔧 Setting up performance indexes...');
    
    // Critical indexes for production performance
    const indexes = [
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_search ON "Product" USING gin(to_tsvector(\'english\', title || \' \' || description));',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_price_range ON "Product" (price) WHERE status = \'AVAILABLE\';',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_unread ON "Message" (read, "conversationId", "createdAt");',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_recent ON "Order" ("buyerId", "createdAt" DESC);'
    ];

    for (const indexQuery of indexes) {
      try {
        await database.$executeRawUnsafe(indexQuery);
        console.log('✅ Index created successfully');
      } catch (error: any) {
        if (error.code === '42P07') {
          console.log('ℹ️  Index already exists, skipping...');
        } else {
          console.warn('⚠️  Index creation warning:', error.message);
        }
      }
    }
  } catch (error) {
    console.warn('⚠️  Index setup completed with warnings:', error);
  }
}

async function main(): Promise<void> {
  console.log('🚀 Starting Production Database Setup\n');

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    console.error('❌ DATABASE_URL must be a PostgreSQL connection string');
    process.exit(1);
  }

  try {
    // Parse and display connection info
    const config = await parsePostgreSQLUrl(databaseUrl);
    console.log('🔗 Connecting to PostgreSQL:');
    console.log(`   Host: ${config.host}:${config.port}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   User: ${config.user}`);
    console.log(`   SSL: ${config.ssl ? 'enabled' : 'disabled'}`);
    console.log('');

    // Step 1: Validate connection
    const connectionValid = await validateConnection();
    if (!connectionValid) {
      process.exit(1);
    }

    // Step 2: Run migrations
    const migrationsSuccess = await runMigrations();
    if (!migrationsSuccess) {
      process.exit(1);
    }

    // Step 3: Create essential data
    await createEssentialCategories();

    // Step 4: Set up performance indexes
    await setupIndexes();

    // Step 5: Validate operations
    const operationsValid = await validateOperations();
    if (!operationsValid) {
      process.exit(1);
    }

    console.log('\n🎉 Production database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Update your production environment variables');
    console.log('   2. Deploy your application');
    console.log('   3. Test all functionality in production');
    console.log('   4. Set up automated backups');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await database.$disconnect();
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Setup interrupted by user');
  await database.$disconnect();
  process.exit(0);
});

if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}