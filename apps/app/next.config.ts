import { env } from '@/env';
import { withToolbar } from '@repo/feature-flags/lib/toolbar';
import { config, withAnalyzer } from '@repo/next-config';
// import { withLogging, withSentry } from '@repo/observability/next-config';
import type { NextConfig } from 'next';

// Temporarily disable logging and sentry to fix build error
let nextConfig: NextConfig = withToolbar(config);

// if (env.VERCEL) {
//   nextConfig = withSentry(nextConfig);
// }

if (env.ANALYZE === 'true') {
  nextConfig = withAnalyzer(nextConfig);
}

export default nextConfig;
