'use server';

import { currentUser } from '@repo/auth/server';
import { redirect } from 'next/navigation';

export async function createProductSimple(input: any) {
  console.log('Simple create product called with:', input);
  
  try {
    // Just verify authentication works
    const user = await currentUser();
    if (!user) {
      console.log('No user found, redirecting...');
      redirect('/sign-in');
    }
    
    console.log('Clerk user authenticated:', user.id);
    
    // Return success without database call
    return {
      success: true,
      message: 'Test successful - authentication works',
      clerkId: user.id,
      input: input,
    };
    
  } catch (error) {
    console.error('Error in simple create product:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}