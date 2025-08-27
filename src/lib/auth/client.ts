import { stripeClient } from "@better-auth/stripe/client";
import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { env } from "../env/client";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BASE_URL,
  plugins: [
    stripeClient(),
    adminClient(),
    // anonymousClient()
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
