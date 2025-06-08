import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '../../../components/header';
import { SingleProductCheckout } from './components/single-product-checkout';

const title = 'Checkout';
const description = 'Complete your purchase';

export const metadata: Metadata = {
  title,
  description,
};

interface CheckoutPageProps {
  params: Promise<{
    productId: string;
  }>;
}

const CheckoutPage = async ({ params }: CheckoutPageProps) => {
  const { productId } = await params;
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Get product details
  const product = await database.product.findUnique({
    where: {
      id: productId,
      status: 'AVAILABLE',
    },
    include: {
      seller: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
          stripeAccountId: true,
        },
      },
      images: {
        orderBy: { displayOrder: 'asc' },
        take: 1,
      },
      category: true,
    },
  });

  if (!product) {
    redirect('/browse');
  }

  // Don't allow buying own products
  if (product.sellerId === user.id) {
    redirect(`/product/${product.id}`);
  }

  // Get user's saved address if any
  const lastOrder = await database.order.findFirst({
    where: { buyerId: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      // Note: Order model doesn't have shipping address fields yet
      // We'll need to add them or use a separate address model
    },
  });

  return (
    <>
      <Header pages={['Dashboard', 'Buying', 'Checkout']} page="Checkout" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Complete Your Purchase</h1>
            <p className="text-muted-foreground">
              Secure checkout powered by Stripe
            </p>
          </div>
          
          <SingleProductCheckout 
            user={user} 
            product={product}
            savedAddress={null} // TODO: Implement saved addresses
          />
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;