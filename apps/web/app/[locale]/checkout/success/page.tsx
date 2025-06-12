import { Metadata } from 'next';
import { SuccessContent } from './components/success-content';

export const metadata: Metadata = {
  title: 'Order Confirmed - Threadly',
  description: 'Your order has been successfully placed',
};

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SuccessContent />
    </div>
  );
}