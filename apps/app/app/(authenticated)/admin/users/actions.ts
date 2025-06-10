'use server';

import { requireAdmin } from '@/lib/auth/admin';
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
  
  // Get user info first
  const user = await database.user.findUnique({
    where: { id: userId },
    select: { id: true, firstName: true, lastName: true }
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Mark all user's products as removed
  await database.product.updateMany({
    where: { sellerId: userId },
    data: { status: 'REMOVED' }
  });
  
  // Cancel active orders where user is seller
  await database.order.updateMany({
    where: {
      sellerId: userId,
      status: { in: ['PENDING', 'PAID'] }
    },
    data: {
      status: 'CANCELLED'
    }
  });
  
  // Send notification to user
  await database.notification.create({
    data: {
      userId: userId,
      title: 'Account Suspended',
      message: 'Your account has been suspended due to policy violations. All active listings have been removed and pending orders cancelled. Contact support for more information.',
      type: 'SYSTEM',
      metadata: JSON.stringify({
        action: 'suspended',
        timestamp: new Date().toISOString(),
      }),
    },
  });
  
  revalidatePath('/admin/users');
  return { success: true };
}

export async function verifyUser(userId: string) {
  await requireAdmin();
  
  // Get user info first
  const user = await database.user.findUnique({
    where: { id: userId },
    select: { id: true, firstName: true, lastName: true, verified: true }
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  if (user.verified) {
    throw new Error('User is already verified');
  }
  
  await database.user.update({
    where: { id: userId },
    data: { verified: true }
  });
  
  // Send verification notification to user
  await database.notification.create({
    data: {
      userId: userId,
      title: 'Account Verified',
      message: 'Congratulations! Your account has been verified. You now have access to all platform features and enhanced seller benefits.',
      type: 'SYSTEM',
      metadata: JSON.stringify({
        action: 'verified',
        timestamp: new Date().toISOString(),
      }),
    },
  });
  
  revalidatePath('/admin/users');
  return { success: true };
}