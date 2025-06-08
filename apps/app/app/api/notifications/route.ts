import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { getNotificationService } from '@repo/real-time/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const notificationService = getNotificationService();

const createNotificationSchema = z.object({
  title: z.string().min(1).max(255),
  message: z.string().min(1).max(1000),
  type: z.enum(['order', 'message', 'payment', 'system']),
  metadata: z.record(z.any()).optional(),
});

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
  try {
    const user = await auth();
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unread') === 'true';

    const notifications = await database.notification.findMany({
      where: {
        userId: user.id,
        ...(unreadOnly && { read: false }),
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const unreadCount = await notificationService.getUnreadCount(user.id);

    return NextResponse.json({
      notifications,
      unreadCount,
      page,
      limit,
    });
  } catch (error) {
    console.error('[Notifications GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create notification (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await auth();
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // This would need admin check in real implementation
    const body = await request.json();
    const { title, message, type, metadata } = createNotificationSchema.parse(body);

    const notification = await notificationService.notify(user.id, {
      title,
      message,
      type,
      metadata,
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('[Notifications POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}