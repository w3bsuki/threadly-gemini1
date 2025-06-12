import { Metadata } from 'next';
import { CheckoutContent } from './components/checkout-content';

export const metadata: Metadata = {
  title: 'Checkout - Threadly',
  description: 'Complete your purchase on Threadly marketplace',
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <CheckoutContent />
    </div>
  );
}