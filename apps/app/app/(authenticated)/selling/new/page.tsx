import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { ProductForm } from './components/product-form';
import { Alert, AlertDescription, AlertTitle } from '@repo/design-system/components/ui/alert';
import { Button } from '@repo/design-system/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';
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

  // For now, skip Stripe requirement to allow testing
  // TODO: Re-enable Stripe requirement when Connect is properly configured
  /*
  if (!dbUser?.stripeAccountId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">List New Item</h1>
            <p className="text-muted-foreground">Get ready to sell your fashion items</p>
          </div>
        </div>

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
    );
  }
  */

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">List New Item</h1>
          <p className="text-muted-foreground">Fill out the details below to list your fashion item for sale</p>
        </div>
      </div>
      
      <div className="mx-auto w-full max-w-2xl">
        <ProductForm userId={dbUser.id} />
      </div>
    </div>
  );
};

export default SellNewItemPage;