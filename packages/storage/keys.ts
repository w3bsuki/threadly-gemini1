import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      BLOB_READ_WRITE_TOKEN: z.string().optional(),
      UPLOADTHING_SECRET: z.string().optional(),
      UPLOADTHING_TOKEN: z.string().optional(),
    },
    client: {
      NEXT_PUBLIC_UPLOADTHING_APP_ID: z.string().optional(),
    },
    runtimeEnv: {
      BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
      UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
      UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
      NEXT_PUBLIC_UPLOADTHING_APP_ID: process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID,
    },
  });
