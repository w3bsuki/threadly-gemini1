'use client';

import { cn } from '@repo/design-system/lib/utils';
import { useMemo } from 'react';

interface ProductPlaceholderProps {
  className?: string;
  seed?: string; // Optional seed for consistent colors
}

export function ProductPlaceholder({ className, seed }: ProductPlaceholderProps) {
  // Generate consistent gradient based on seed
  const gradient = useMemo(() => {
    const gradients = [
      'from-purple-400 to-pink-400',
      'from-blue-400 to-cyan-400',
      'from-green-400 to-teal-400',
      'from-yellow-400 to-orange-400',
      'from-red-400 to-rose-400',
      'from-indigo-400 to-purple-400',
      'from-gray-400 to-gray-500',
      'from-pink-400 to-rose-400',
      'from-teal-400 to-cyan-400',
      'from-amber-400 to-yellow-400',
    ];

    if (seed) {
      // Use seed to generate consistent index
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }
      return gradients[Math.abs(hash) % gradients.length];
    }

    // Random gradient if no seed
    return gradients[Math.floor(Math.random() * gradients.length)];
  }, [seed]);

  return (
    <div
      className={cn(
        'relative w-full h-full bg-gradient-to-br',
        gradient,
        'overflow-hidden',
        className
      )}
    >
      {/* Subtle pattern overlay for texture */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Centered icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Clothing hanger icon - more relevant for fashion */}
          <svg
            className="w-20 h-20 text-white/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 2.25a.75.75 0 01.75.75v.646c.319.03.628.09.924.178l4.119 1.207a2.25 2.25 0 011.706 2.18v.97a.75.75 0 01-.904.734l-4.595-.76v7.344l4.72 1.769a.75.75 0 01-.53 1.405l-5.44-2.04v2.567a.75.75 0 01-1.5 0v-2.567l-5.44 2.04a.75.75 0 01-.53-1.405l4.72-1.769V7.405l-4.595.76a.75.75 0 01-.904-.734v-.97a2.25 2.25 0 011.706-2.18l4.119-1.207A4.756 4.756 0 0111.25 3v-.75A.75.75 0 0112 2.25z"
            />
          </svg>
          
          {/* Subtle animation */}
          <div className="absolute inset-0 animate-pulse">
            <div className="w-full h-full rounded-full bg-white/10 scale-150" />
          </div>
        </div>
      </div>
    </div>
  );
}