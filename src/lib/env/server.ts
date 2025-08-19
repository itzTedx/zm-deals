import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    BETTER_AUTH_URL: z.url(),
    BETTER_AUTH_SECRET: z.string(),
    REDIS_HOST: z.string(),
    REDIS_PORT: z.coerce.number(),
  },

  // biome-ignore lint/style/noProcessEnv: We have to use process.env here
  experimental__runtimeEnv: process.env,

  emptyStringAsUndefined: true,
});
