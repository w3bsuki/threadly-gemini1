import { Metadata } from 'next';
import { SuccessContent } from './components/success-content';
import { getDictionary } from '@repo/internationalization';
import type { Locale } from '@repo/internationalization/locales';

export const metadata: Metadata = {
  title: 'Order Confirmed - Threadly',
  description: 'Your order has been successfully placed',
};

interface SuccessPageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export default async function SuccessPage({ params }: SuccessPageProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <div className="min-h-screen bg-gray-50">
      <SuccessContent dictionary={dictionary} />
    </div>
  );
}