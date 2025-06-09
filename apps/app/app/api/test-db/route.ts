import { database } from '@repo/database';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Debug: Check working directory and DATABASE_URL
    const cwd = process.cwd();
    const dbUrl = process.env.DATABASE_URL;
    
    console.log('Working directory:', cwd);
    console.log('DATABASE_URL:', dbUrl);
    
    // Test database connection
    const userCount = await database.user.count();
    const productCount = await database.product.count();
    const categoryCount = await database.category.count();
    
    return NextResponse.json({
      success: true,
      data: {
        users: userCount,
        products: productCount,
        categories: categoryCount
      },
      debug: {
        cwd,
        dbUrl
      },
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        cwd: process.cwd(),
        dbUrl: process.env.DATABASE_URL
      },
      message: 'Database connection failed'
    }, { status: 500 });
  }
}