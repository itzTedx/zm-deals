import { stripeClient } from "@better-auth/stripe/client";
import { createAuthClient } from "better-auth/react";

import { env } from "../env/client";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BASE_URL,
  plugins: [stripeClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
