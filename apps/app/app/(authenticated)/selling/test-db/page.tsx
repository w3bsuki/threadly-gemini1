// Test database connection separately
import { database } from '@repo/database';

export default async function TestDatabasePage() {
  try {
    // Test basic database connection
    const categoryCount = await database.category.count();
    
    return (
      <div className="p-8">
        <h1>✅ Database Test Works!</h1>
        <p>Category count: {categoryCount}</p>
        <p>If you see this, database connection works.</p>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-8">
        <h1>❌ Database Error</h1>
        <pre>{error instanceof Error ? error.message : 'Unknown error'}</pre>
        <pre>{error instanceof Error ? error.stack : 'No stack'}</pre>
      </div>
    );
  }
}