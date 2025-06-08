// Simple API test script
const API_BASE = 'http://localhost:3002';

async function testAPIs() {
  console.log('🧪 Testing Threadly APIs...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log(`✅ Health check: ${healthData.status}\n`);

    // Test categories endpoint
    console.log('2. Testing categories endpoint...');
    const categoriesResponse = await fetch(`${API_BASE}/api/categories`);
    const categoriesData = await categoriesResponse.json();
    
    if (categoriesData.success) {
      console.log(`✅ Categories: Found ${categoriesData.data.categories.length} root categories`);
      categoriesData.data.categories.forEach((cat: any) => {
        console.log(`   • ${cat.name} (${cat.children?.length || 0} subcategories)`);
      });
    } else {
      console.log('❌ Categories endpoint failed:', categoriesData.error);
    }
    console.log('');

    // Test products endpoint
    console.log('3. Testing products endpoint...');
    const productsResponse = await fetch(`${API_BASE}/api/products?limit=5`);
    const productsData = await productsResponse.json();
    
    if (productsData.success) {
      console.log(`✅ Products: Found ${productsData.data.pagination.total} total products`);
      console.log(`   Showing ${productsData.data.products.length} products on page ${productsData.data.pagination.page}`);
      
      if (productsData.data.products.length > 0) {
        console.log('   Sample products:');
        productsData.data.products.slice(0, 3).forEach((product: any) => {
          console.log(`   • ${product.title} - $${product.price} (${product.condition})`);
        });
      }
    } else {
      console.log('❌ Products endpoint failed:', productsData.error);
    }
    console.log('');

    console.log('🎉 API tests completed!');
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

// Run tests if this file is executed directly
testAPIs().catch(console.error);

export { testAPIs };