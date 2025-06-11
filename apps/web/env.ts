import { keys as analytics } from '@repo/analytics/keys';
import { keys as cache } from '@repo/cache/keys';
import { keys as cms } from '@repo/cms/keys';
import { keys as email } from '@repo/email/keys';
import { keys as flags } from '@repo/feature-flags/keys';
import { keys as core } from '@repo/next-config/keys';
import { keys as observability } from '@repo/observability/keys';
import { keys as rateLimit } from '@repo/rate-limit/keys';
import { keys as search } from '@repo/search/keys';
import { keys as security } from '@repo/security/keys';
import { createEnv } from '@t3-oss/env-nextjs';

export const env = createEnv({
  extends: [
    analytics(),
    cache(),
    cms(),
    core(),
    email(),
    observability(),
    flags(),
    search(),
    security(),
    rateLimit(),
  ],
  server: {},
  client: {},
  runtimeEnv: {},
});
