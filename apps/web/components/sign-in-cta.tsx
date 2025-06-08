'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { env } from '@/env';
import Link from 'next/link';
import { ReactNode } from 'react';

interface SignInCTAProps {
  children: ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  redirectPath?: string;
  fullWidth?: boolean;
}

export function SignInCTA({ 
  children, 
  variant = 'default', 
  size = 'default',
  className,
  redirectPath,
  fullWidth = false
}: SignInCTAProps) {
  const appUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const signInUrl = redirectPath 
    ? `${appUrl}/sign-in?redirect_url=${encodeURIComponent(redirectPath)}`
    : `${appUrl}/sign-in`;

  return (
    <Button 
      variant={variant} 
      size={size} 
      className={`${fullWidth ? 'w-full' : ''} ${className || ''}`}
      asChild
    >
      <Link href={signInUrl}>
        {children}
      </Link>
    </Button>
  );
}