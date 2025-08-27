import { cache } from "react";
import { headers } from "next/headers";

import { stripe } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin, openAPI } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { adminAc } from "better-auth/plugins/admin/access";

import { db } from "@/server/db";

import { env } from "../env/server";
import redis from "../redis";
import { stripeClient } from "../stripe/client";
import { PERMISSIONS } from "./constants";
import { handleCheckoutSessionCompleted, handlePaymentIntentFailed, handlePaymentIntentSucceeded } from "./webhooks";

// Create access control instance
const ac = createAccessControl(PERMISSIONS);

// Define roles
const admin = ac.newRole({
  coupons: ["create", "update", "delete"],
  products: ["create", "update", "delete"],
  ...adminAc.statements,
});

const user = ac.newRole({
  coupons: [],
  products: [],
});

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
  user: {
    additionalFields: {
      role: {
        type: ["user", "admin"],
        input: false,
      },
    },
  },
  plugins: [
    adminPlugin({
      ac,
      roles: {
        admin,
        user,
      },
    }),
    stripe({
      stripeClient,
      stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
      createCustomerOnSignUp: true,

      onEvent: async ({ request, type, data }) => {
        // console.log(`Event ${type} triggered for user ${request}, Data: `, data);

        switch (type) {
          case "checkout.session.completed":
            await handleCheckoutSessionCompleted(data.object, request?.id);
            break;
          case "payment_intent.succeeded":
            await handlePaymentIntentSucceeded(data.object);
            break;
          case "payment_intent.payment_failed":
            await handlePaymentIntentFailed(data.object);
            break;
          default:
            console.log(`Unhandled event type: ${type}`);
        }
      },
    }),
    // anonymous({
    //   onLinkAccount: async ({ anonymousUser, newUser }) => {
    //     const result = await migrateAnonymousCart({
    //       anonymousUserId: anonymousUser.user.id,
    //       newUserId: newUser.user.id,
    //     });

    //     if (result.success) {
    //       console.log(`Cart migration completed: ${result.migratedItems} items migrated`);
    //     } else {
    //       console.error("Cart migration failed:", result.error);
    //     }
    //   },
    // }),
    openAPI(),
    nextCookies(),
  ],
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
      maxAge: 5 * 60,
    },
  },
  trustedOrigins: [env.BASE_URL, "http://192.168.1.30:3000"],
});

export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));
export type AuthSession = Awaited<ReturnType<typeof getSession>>;
