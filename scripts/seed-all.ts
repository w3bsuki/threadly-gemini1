#!/usr/bin/env tsx

// Seed all data needed for the marketplace
import { execSync } from 'child_process';
import { resolve } from 'path';

console.log('🌱 Starting complete database seeding...\n');

try {
  // Seed categories first
  console.log('📁 Seeding categories...');
  execSync('tsx scripts/seed-categories.ts', { 
    stdio: 'inherit',
    cwd: resolve(__dirname, '..')
  });
  
  // Then seed products
  console.log('\n📦 Seeding products...');
  execSync('tsx scripts/seed-products.ts', { 
    stdio: 'inherit',
    cwd: resolve(__dirname, '..')
  });
  
  console.log('\n✅ All data seeded successfully!');
  console.log('🚀 Your marketplace now has real data to display');
  
} catch (error) {
  console.error('\n❌ Seeding failed:', error);
  process.exit(1);
}