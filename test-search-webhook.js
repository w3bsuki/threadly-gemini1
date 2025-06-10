/**
 * Simple test script for the search indexing webhook
 */

const API_BASE = 'http://localhost:3002';

async function testSearchWebhook() {
  console.log('🧪 Testing Search Indexing Webhook');
  console.log('=====================================\n');

  try {
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${API_BASE}/api/search/index`, {
      method: 'GET',
    });
    
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('✅ Health check passed:', health);
      
      if (health.algolia.configured) {
        console.log('✅ Algolia is configured');
      } else {
        console.log('⚠️  Algolia not configured (missing environment variables)');
      }
    } else {
      console.log('❌ Health check failed:', healthResponse.status);
    }
    
    console.log();

    // Test product creation webhook (mock)
    console.log('2. Testing product creation webhook...');
    const createResponse = await fetch(`${API_BASE}/api/search/index`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'created',
        productId: 'test-product-123',
        timestamp: new Date().toISOString(),
      }),
    });

    if (createResponse.ok) {
      const result = await createResponse.json();
      console.log('✅ Product creation webhook passed:', result.message);
    } else {
      const error = await createResponse.json();
      console.log('❌ Product creation webhook failed:', error);
    }

    console.log();

    // Test bulk indexing
    console.log('3. Testing bulk indexing...');
    const bulkResponse = await fetch(`${API_BASE}/api/search/index`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'bulk_index',
        force: false,
        timestamp: new Date().toISOString(),
      }),
    });

    if (bulkResponse.ok) {
      const result = await bulkResponse.json();
      console.log('✅ Bulk indexing webhook passed:', result.message);
    } else {
      const error = await bulkResponse.json();
      console.log('❌ Bulk indexing webhook failed:', error);
    }

    console.log('\n🎉 Search webhook testing completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('\n💡 Make sure the API server is running on port 3002');
    console.log('   Run: pnpm dev --filter=api');
  }
}

// Run the test
testSearchWebhook();