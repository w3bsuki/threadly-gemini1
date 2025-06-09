'use server';

import { canModerate } from '@repo/auth/admin';
import { database } from '@repo/database';
import { revalidatePath } from 'next/cache';

export async function approveProduct(productId: string) {
  const isModerator = await canModerate();
  if (!isModerator) {
    throw new Error('Unauthorized');
  }
  
  // You could add a "verified" field to products
  // For now, we'll just ensure it's available
  await database.product.update({
    where: { id: productId },
    data: { status: 'AVAILABLE' }
  });
  
  revalidatePath('/admin/products');
  return { success: true };
}

export async function removeProduct(productId: string, reason: string) {
  const isModerator = await canModerate();
  if (!isModerator) {
    throw new Error('Unauthorized');
  }
  
  // Update product status
  await database.product.update({
    where: { id: productId },
    data: { status: 'REMOVED' }
  });
  
  // TODO: Send notification to seller with reason
  // TODO: Cancel any pending orders
  // TODO: Log the moderation action
  
  revalidatePath('/admin/products');
  return { success: true };
}

export async function restoreProduct(productId: string) {
  const isModerator = await canModerate();
  if (!isModerator) {
    throw new Error('Unauthorized');
  }
  
  await database.product.update({
    where: { id: productId },
    data: { status: 'AVAILABLE' }
  });
  
  // TODO: Notify seller that product was restored
  
  revalidatePath('/admin/products');
  return { success: true };
}