import { currentUser, auth } from './server';
import { database } from '@repo/database';

export async function requireAdmin() {
  const user = await currentUser();
  const { redirectToSignIn } = await auth();
  
  if (!user) {
    return redirectToSignIn();
  }
  
  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id },
    select: { role: true }
  });
  
  if (!dbUser || dbUser.role !== 'ADMIN') {
    throw new Error('Unauthorized - Admin access required');
  }
  
  return dbUser;
}

export async function isAdmin() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return false;
    }
    
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { role: true }
    });
    
    return dbUser?.role === 'ADMIN';
  } catch {
    return false;
  }
}

export async function canModerate() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return false;
    }
    
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { role: true }
    });
    
    return dbUser?.role === 'ADMIN' || dbUser?.role === 'MODERATOR';
  } catch {
    return false;
  }
}