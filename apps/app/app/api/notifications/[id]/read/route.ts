import { currentUser } from '@repo/auth/server';
import { getNotificationService } from '@repo/real-time/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const notificationService = getNotificationService();
    await notificationService.markAsRead(id, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Notification Mark Read] Error:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}