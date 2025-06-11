import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { MessagesContent } from './components/messages-content';

export const metadata: Metadata = {
  title: 'Messages - Threadly',
  description: 'Chat with sellers and buyers on Threadly marketplace',
};

export default async function MessagesPage() {
  const { userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-2">
              Chat with sellers and buyers about your items
            </p>
          </div>
          
          <MessagesContent />
        </div>
      </div>
    </div>
  );
}