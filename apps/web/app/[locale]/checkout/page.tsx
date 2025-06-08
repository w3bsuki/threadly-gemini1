import { Metadata } from 'next';
import { CheckoutContent } from './components/checkout-content';
import { getDictionary } from '@repo/internationalization';
import type { Locale } from '@repo/internationalization/locales';

export const metadata: Metadata = {
  title: 'Checkout - Threadly',
  description: 'Complete your purchase on Threadly marketplace',
};

interface CheckoutPageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <div className="min-h-screen bg-gray-50">
      <CheckoutContent dictionary={dictionary} />
    </div>
  );
}