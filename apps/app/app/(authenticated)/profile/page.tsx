import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '../components/header';
import { ProfileContent } from './components/profile-content';

const title = 'Profile Settings';
const description = 'Manage your account and marketplace preferences';

export const metadata: Metadata = {
  title,
  description,
};

const ProfilePage = async () => {
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

  // Fetch user's marketplace data
  const [userStats, userAddress] = await Promise.all([
    // Get user statistics
    database.$queryRaw<Array<{
      products_sold: number;
      total_earnings: number;
      products_bought: number;
      total_spent: number;
      active_listings: number;
    }>>`
      SELECT 
        COALESCE(
          (SELECT COUNT(*) FROM "Order" o 
           WHERE o.seller_id = ${dbUser.id} AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')), 
          0
        ) as products_sold,
        COALESCE(
          (SELECT SUM(o.amount) FROM "Order" o 
           WHERE o.seller_id = ${dbUser.id} AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')), 
          0
        ) as total_earnings,
        COALESCE(
          (SELECT COUNT(*) FROM "Order" o 
           WHERE o.buyer_id = ${dbUser.id} AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')), 
          0
        ) as products_bought,
        COALESCE(
          (SELECT SUM(o.amount) FROM "Order" o 
           WHERE o.buyer_id = ${dbUser.id} AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')), 
          0
        ) as total_spent,
        COALESCE(
          (SELECT COUNT(*) FROM "Product" p 
           WHERE p.seller_id = ${dbUser.id} AND p.status = 'AVAILABLE'), 
          0
        ) as active_listings
    `,

    // Get user's saved address from most recent order
    // TODO: Implement address storage once Order model has shipping fields
    Promise.resolve(null),
  ]);

  const stats = userStats[0] || {
    products_sold: 0,
    total_earnings: 0,
    products_bought: 0,
    total_spent: 0,
    active_listings: 0,
  };

  return (
    <>
      <Header pages={['Dashboard', 'Profile']} page="Profile" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">
              Manage your account information and marketplace preferences
            </p>
          </div>
          
          <ProfileContent 
            user={{
              id: user.id,
              emailAddresses: user.emailAddresses,
              firstName: user.firstName || undefined,
              lastName: user.lastName || undefined,
              username: user.username || undefined,
              imageUrl: user.imageUrl || undefined,
              createdAt: new Date(user.createdAt),
            }}
            stats={stats}
            savedAddress={userAddress}
          />
        </div>
      </div>
    </>
  );
};

export default ProfilePage;