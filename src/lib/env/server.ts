import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    BETTER_AUTH_URL: z.url(),
    BETTER_AUTH_SECRET: z.string(),
    REDIS_HOST: z.string(),
    REDIS_PORT: z.coerce.number(),

    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),

    STRIPE_SECRET_KEY: z.string(),
    STRIPE_WEBHOOK_SECRET: z.string(),

    AWS_BUCKET_NAME: z.string(),
    AWS_BUCKET_REGION: z.string(),
    AWS_ACCESS_KEY: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),

    BASE_URL: z.string(),
  },

  // biome-ignore lint/style/noProcessEnv: We have to use process.env here
  experimental__runtimeEnv: process.env,

  emptyStringAsUndefined: true,
});
