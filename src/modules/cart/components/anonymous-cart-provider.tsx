"use client";

import { useEffect } from "react";

import { useAtom } from "jotai";

import { signIn, useSession } from "@/lib/auth/client";

import { cartAtom } from "../atom";

interface AnonymousCartProviderProps {
  children: React.ReactNode;
}

export function AnonymousCartProvider({ children }: AnonymousCartProviderProps) {
  const [cart] = useAtom(cartAtom);
  const { data: session } = useSession();

  useEffect(() => {
    // If user has items in cart but no session, create anonymous session
    if (!session && cart.length > 0) {
      const createAnonymousSession = async () => {
        try {
          await signIn.anonymous();
        } catch (error) {
          console.error("Failed to create anonymous session:", error);
        }
      };

      createAnonymousSession();
    }
  }, [session, cart.length]);

  return <>{children}</>;
}
