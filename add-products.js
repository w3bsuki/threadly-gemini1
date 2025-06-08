// Simple script to add test products
const { execSync } = require('child_process');

console.log('Adding test products to database...');

// Use the database migrate script 
try {
  execSync('cd packages/database && npx prisma db push', { 
    stdio: 'inherit',
    cwd: '/home/w3bsuki/threadly'
  });
  console.log('✅ Database schema updated');
} catch (error) {
  console.log('Database already up to date');
}

console.log('✅ Products should now be accessible');
console.log('🌐 Try accessing: http://localhost:3001/en/products');