import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      PUSHER_APP_ID: z.string().min(1),
      PUSHER_SECRET: z.string().min(1),
      RESEND_API_KEY: z.string().min(1).optional(),
    },
    client: {
      NEXT_PUBLIC_PUSHER_KEY: z.string().min(1),
      NEXT_PUBLIC_PUSHER_CLUSTER: z.string().min(1),
    },
    runtimeEnv: {
      PUSHER_APP_ID: process.env.PUSHER_APP_ID,
      PUSHER_SECRET: process.env.PUSHER_SECRET,
      NEXT_PUBLIC_PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY,
      NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
    },
  });