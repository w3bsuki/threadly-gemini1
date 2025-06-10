'use client';

import { Button } from '@repo/design-system/components/ui/button';

export default function TestPage() {
  const handleClick = () => {
    alert('Test page works!');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Simple Test Page</h1>
      <div className="space-y-4">
        <div>Current URL: {typeof window !== 'undefined' ? window.location.href : 'SSR'}</div>
        <div>API URL: {process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}</div>
        <div>App URL: {process.env.NEXT_PUBLIC_APP_URL || 'NOT SET'}</div>
        <Button onClick={handleClick}>Test Button</Button>
      </div>
    </div>
  );
}