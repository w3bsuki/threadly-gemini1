import { env } from '@/env';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '../../components/header';
import { ProductForm } from './components/product-form';
import { Alert, AlertDescription, AlertTitle } from '@repo/design-system/components/ui/alert';
import { Button } from '@repo/design-system/components/ui/button';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

const title = 'Sell New Item';
const description = 'List your fashion item for sale on Threadly';

export const metadata: Metadata = {
  title,
  description,
};

const SellNewItemPage = async () => {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Check if user has connected Stripe account
  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id },
    select: { 
      id: true,
      stripeAccountId: true,
    },
  });

  // If no Stripe account, redirect to onboarding
  if (!dbUser?.stripeAccountId) {
    return (
      <>
        <Header pages={['Dashboard', 'Selling', 'New Item']} page="New Item" />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="mx-auto w-full max-w-2xl">
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Seller Account Required</AlertTitle>
              <AlertDescription>
                You need to connect your Stripe account before you can list items for sale.
                This allows us to process payments securely and pay you directly.
              </AlertDescription>
            </Alert>
            
            <div className="text-center">
              <Button asChild>
                <Link href="/selling/onboarding">
                  Set Up Seller Account
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header pages={['Dashboard', 'Selling', 'New Item']} page="New Item" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Sell a New Item</h1>
            <p className="text-muted-foreground">
              Fill out the details below to list your fashion item for sale
            </p>
          </div>
          
          <ProductForm userId={user.id} />
        </div>
      </div>
    </>
  );
};

export default SellNewItemPage;