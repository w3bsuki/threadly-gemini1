'use server';

import { requireAdmin } from '@repo/auth/admin';
import { database } from '@repo/database';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(userId: string, role: 'USER' | 'ADMIN' | 'MODERATOR') {
  await requireAdmin();
  
  await database.user.update({
    where: { id: userId },
    data: { role }
  });
  
  revalidatePath('/admin/users');
  return { success: true };
}

export async function suspendUser(userId: string) {
  await requireAdmin();
  
  // Mark all user's products as removed
  await database.product.updateMany({
    where: { sellerId: userId },
    data: { status: 'REMOVED' }
  });
  
  // You might also want to:
  // - Cancel active orders
  // - Archive conversations
  // - Send notification to user
  
  revalidatePath('/admin/users');
  return { success: true };
}

export async function verifyUser(userId: string) {
  await requireAdmin();
  
  await database.user.update({
    where: { id: userId },
    data: { verified: true }
  });
  
  revalidatePath('/admin/users');
  return { success: true };
}