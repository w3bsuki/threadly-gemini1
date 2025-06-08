import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '../../components/header';
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
  }>;
}

const MessagesPage = async ({ searchParams }: MessagesPageProps) => {
  const { type } = await searchParams;
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Fetch user's conversations
  const conversations = await database.conversation.findMany({
    where: {
      OR: [
        { buyerId: user.id },
        { sellerId: user.id },
      ],
      ...(type === 'buying' ? { buyerId: user.id } : {}),
      ...(type === 'selling' ? { sellerId: user.id } : {}),
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
              senderId: { not: user.id },
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
            currentUserId={user.id}
            filterType={type}
          />
        </div>
      </div>
    </>
  );
};

export default MessagesPage;