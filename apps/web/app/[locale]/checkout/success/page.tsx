import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SuccessContent } from './components/success-content';
import { database } from '@repo/database';

export const metadata: Metadata = {
  title: 'Order Confirmed - Threadly',
  description: 'Your order has been successfully placed',
};

interface SuccessPageProps {
  searchParams: Promise<{
    orderId?: string;
    session_id?: string;
  }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { orderId, session_id } = await searchParams;

  if (!orderId && !session_id) {
    redirect('/');
  }

  // Fetch order by ID or by Stripe payment ID through payment relation
  const order = await database.order.findFirst({
    where: orderId 
      ? { id: orderId }
      : session_id 
      ? { payment: { stripePaymentId: session_id } }
      : undefined,
    include: {
      product: {
        include: {
          images: {
            take: 1,
            orderBy: { displayOrder: 'asc' }
          }
        }
      },
      buyer: true,
      seller: true,
    }
  });

  if (!order) {
    redirect('/');
  }

  // Prepare order data with required fields
  const orderData = {
    ...order,
    orderNumber: `ORD-${order.id.slice(-8).toUpperCase()}`,
    totalAmount: order.amount
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SuccessContent order={orderData} />
    </div>
  );
}