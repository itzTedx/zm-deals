import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/server/db";

import { env } from "../env/server";
import redis from "../redis";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  appName: "ZM Deals",

  emailAndPassword: {
    enabled: true,
    maxPasswordLength: 40,
    minPasswordLength: 8,
  },

  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },

  secondaryStorage: {
    get: async (key) => {
      const value = await redis.get(`session:${key}`);
      return value ?? null;
    },
    set: async (key, value, ttl) => {
      if (ttl) await redis.setex(`session:${key}`, ttl, value);
      else await redis.set(`session:${key}`, value);
    },
    delete: async (key) => {
      await redis.del(`session:${key}`);
    },
  },
  advanced: {
    cookiePrefix: "zmdeals",
    database: {
      generateId: false,
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
});
