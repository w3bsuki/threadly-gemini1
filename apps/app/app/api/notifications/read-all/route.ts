import { currentUser } from '@repo/auth/server';
import { getNotificationService } from '@repo/real-time/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notificationService = getNotificationService();
    await notificationService.markAllAsRead(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Notifications Mark All Read] Error:', error);
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  }
}