import { currentUser } from '@repo/auth/server';
import { getPusherServer } from '@repo/real-time/server';
import { NextRequest, NextResponse } from 'next/server';

const pusherServer = getPusherServer({
  pusherKey: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  pusherCluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  pusherAppId: process.env.PUSHER_APP_ID!,
  pusherSecret: process.env.PUSHER_SECRET!,
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const socketId = formData.get('socket_id') as string;
    const channel = formData.get('channel_name') as string;

    if (!socketId || !channel) {
      return NextResponse.json(
        { error: 'Missing socket_id or channel_name' },
        { status: 400 }
      );
    }

    // Authenticate the user for the channel
    const authResponse = await pusherServer.authenticateUser(
      socketId,
      channel,
      user.id
    );

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('[RealTime Auth] Error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}