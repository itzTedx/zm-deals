"use server";

import { headers } from "next/headers";

import z from "zod";

import { auth } from "@/lib/auth/server";
import { env } from "@/lib/env/server";
import { stripeClient } from "@/lib/stripe/client";

import { CheckoutSchema, checkoutSchema } from "../schema";

export async function createCheckoutSession(checkoutData: CheckoutSchema) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      console.error("❌ [DEBUG] Authentication failed: No session found");
      throw new Error("Unauthorized");
    }

    const { data, error } = checkoutSchema.safeParse(checkoutData);

    if (error) {
      console.error("❌ [DEBUG] Schema validation failed:", {
        errors: z.prettifyError(error),
        originalData: checkoutData,
      });
      throw new Error(error.message);
    }

    const { productId, quantity, name, description, price } = data;

    const stripeParams = {
      mode: "payment" as const,
      line_items: [
        {
          price_data: {
            currency: "AED",
            product_data: {
              name,
              description,
              // images: [image],
            },
            unit_amount: price * 100,
          },
          quantity,
        },
      ],
      metadata: {
        productId,
      },
      customer_email: session.user.email,
      success_url: `${env.BASE_URL}/checkout?success=1`,
      cancel_url: `${env.BASE_URL}/checkout?cancelled=1`,
    };

    const checkout = await stripeClient.checkout.sessions.create(stripeParams);

    return checkout.url;
  } catch (error) {
    throw error;
  }
}
