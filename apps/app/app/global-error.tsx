'use client';

import { fonts } from '@repo/design-system/lib/fonts';
// import { ErrorPage } from '@repo/error-handling/error-pages';
import type NextError from 'next/error';
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

type GlobalErrorProperties = {
  readonly error: NextError & { digest?: string };
  readonly reset: () => void;
};

const GlobalError = ({ error, reset }: GlobalErrorProperties) => {
  useEffect(() => {
    // Capture exception with Sentry
    Sentry.captureException(error, {
      tags: {
        location: 'global-error-boundary',
      },
    });
  }, [error]);

  return (
    <html lang="en" className={fonts}>
      <body>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong!</h1>
            <p className="text-gray-600 mb-6">
              {'statusCode' in error ? `Error ${error.statusCode}` : 'An unexpected error occurred'}
            </p>
            {error.digest && (
              <p className="text-sm text-gray-500 mb-4">Error ID: {error.digest}</p>
            )}
            <button
              onClick={reset}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
};

export default GlobalError;
