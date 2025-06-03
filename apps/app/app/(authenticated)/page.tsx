import { env } from '@/env';
import { currentUser } from '@repo/auth/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from './components/header';

const title = 'Threadly Marketplace';
const description = 'Your marketplace for second-hand fashion.';

export const metadata: Metadata = {
  title,
  description,
};

const App = async () => {
  const user = await currentUser();

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to Threadly</h1>
          <p className="text-muted-foreground mb-6">Your marketplace for second-hand fashion</p>
          <div className="space-x-4">
            <Link 
              href="/sign-in" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Sign In
            </Link>
            <Link 
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header pages={['Dashboard', 'Browse', 'Sell']} page="Dashboard" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Quick Actions */}
          <div className="rounded-xl bg-card p-6">
            <h3 className="font-semibold text-lg mb-2">Sell an Item</h3>
            <p className="text-muted-foreground text-sm mb-4">List your fashion items for sale</p>
            <Link 
              href="/selling/new"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
            >
              Start Selling
            </Link>
          </div>

          <div className="rounded-xl bg-card p-6">
            <h3 className="font-semibold text-lg mb-2">Browse Items</h3>
            <p className="text-muted-foreground text-sm mb-4">Discover amazing fashion finds</p>
            <Link 
              href="/browse"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
            >
              Browse Now
            </Link>
          </div>

          <div className="rounded-xl bg-card p-6">
            <h3 className="font-semibold text-lg mb-2">My Orders</h3>
            <p className="text-muted-foreground text-sm mb-4">Track your purchases</p>
            <Link 
              href="/buying/orders"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
            >
              View Orders
            </Link>
          </div>

          <div className="rounded-xl bg-card p-6">
            <h3 className="font-semibold text-lg mb-2">Messages</h3>
            <p className="text-muted-foreground text-sm mb-4">Chat with buyers and sellers</p>
            <Link 
              href="/messages"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
            >
              View Messages
            </Link>
          </div>
        </div>

        {/* Welcome message for new users */}
        <div className="rounded-xl bg-muted/50 p-6">
          <h2 className="text-xl font-semibold mb-2">Welcome to Threadly, {user.firstName}! 👋</h2>
          <p className="text-muted-foreground">
            You're now part of our community of fashion lovers. Start by browsing items or listing something to sell.
          </p>
        </div>
      </div>
    </>
  );
};

export default App;
