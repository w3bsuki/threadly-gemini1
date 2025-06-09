import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '../components/header';
import { MessagesContent } from './components/messages-content';

const title = 'Messages';
const description = 'Chat with buyers and sellers';

export const metadata: Metadata = {
  title,
  description,
};

interface MessagesPageProps {
  searchParams: Promise<{
    type?: 'buying' | 'selling';
    user?: string; // User ID to start conversation with
    product?: string; // Product ID for conversation context
  }>;
}

const MessagesPage = async ({ searchParams }: MessagesPageProps) => {
  const { type, user: targetUserId, product: productId } = await searchParams;
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Get database user
  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) {
    redirect('/sign-in');
  }

  // Fetch user's conversations
  const conversations = await database.conversation.findMany({
    where: {
      OR: [
        { buyerId: dbUser.id },
        { sellerId: dbUser.id },
      ],
      ...(type === 'buying' ? { buyerId: dbUser.id } : {}),
      ...(type === 'selling' ? { sellerId: dbUser.id } : {}),
    },
    include: {
      buyer: true,
      seller: true,
      product: {
        include: {
          images: {
            take: 1,
            orderBy: {
              displayOrder: 'asc',
            },
          },
        },
      },
      messages: {
        take: 1,
        orderBy: {
          createdAt: 'desc',
        },
      },
      _count: {
        select: {
          messages: {
            where: {
              senderId: { not: dbUser.id },
              read: false,
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  // Handle starting new conversation
  let targetUser = null;
  let targetProduct = null;
  let existingConversation = null;

  if (targetUserId) {
    // Get target user details
    targetUser = await database.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
      },
    });

    // Get product details if provided
    if (productId) {
      targetProduct = await database.product.findUnique({
        where: { id: productId },
        include: {
          images: {
            take: 1,
            orderBy: { displayOrder: 'asc' },
          },
        },
      });

      // Check if conversation already exists for this product
      existingConversation = await database.conversation.findFirst({
        where: {
          productId: productId,
          buyerId: dbUser.id,
          sellerId: targetUserId,
        },
      });
    }
  }

  return (
    <>
      <Header pages={['Dashboard', 'Messages']} page="Messages" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Messages</h1>
            <p className="text-muted-foreground">
              Chat with buyers and sellers about your transactions
            </p>
          </div>
          
          <MessagesContent 
            conversations={conversations}
            currentUserId={dbUser.id}
            filterType={type}
            targetUser={targetUser}
            targetProduct={targetProduct}
            existingConversation={existingConversation}
          />
        </div>
      </div>
    </>
  );
};

export default MessagesPage;