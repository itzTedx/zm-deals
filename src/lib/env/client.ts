import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_BASE_URL: z.url(),
  },

  experimental__runtimeEnv: {
    // biome-ignore lint/style/noProcessEnv: We have to use process.env here
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },

  emptyStringAsUndefined: true,
});
