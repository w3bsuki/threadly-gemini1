import { redirect } from 'next/navigation';

export default function SellingPage() {
  // Redirect to dashboard as the main selling page
  redirect('/selling/dashboard');
}