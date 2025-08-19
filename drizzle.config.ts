import { defineConfig } from "drizzle-kit";

import { env } from "@/lib/env/server";

export default defineConfig({
  out: "./src/server/migrations",
  schema: "./src/server/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
