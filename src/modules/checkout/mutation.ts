"use server";

import { headers } from "next/headers";

import Stripe from "stripe";
import z from "zod";

import { auth } from "@/lib/auth/server";
import { env } from "@/lib/env/server";
import { stripeClient } from "@/lib/stripe/client";

// Schema for cart checkout
const cartCheckoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
      name: z.string(),
      description: z.string().optional(),
      price: z.number().min(0),
      image: z.string().optional(),
    })
  ),
  total: z.number().min(0),
  discountAmount: z.number().min(0).optional(),
  finalTotal: z.number().min(0).optional(),
  couponCode: z.string().optional(),
});

export type CartCheckoutSchema = z.infer<typeof cartCheckoutSchema>;

// Legacy single product checkout (keeping for backward compatibility)
export async function createCheckoutSession(checkoutData: {
  productId: string;
  quantity: number;
  name: string;
  description?: string;
  price: number;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      console.error("❌ [DEBUG] Authentication failed: No session found");
      throw new Error("Unauthorized");
    }

    const { productId, quantity, name, description, price } = checkoutData;

    const stripeParams = {
      mode: "payment" as const,
      line_items: [
        {
          price_data: {
            currency: "AED",
            product_data: {
              name,
              description,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity,
        },
      ],
      metadata: {
        productId,
        userId: session.user.id,
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

// New cart-based checkout function
export async function createCartCheckoutSession(checkoutData: CartCheckoutSchema) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Please sign in to proceed with checkout");
    }

    const { data, error } = cartCheckoutSchema.safeParse(checkoutData);

    if (error) {
      console.error("❌ [DEBUG] Schema validation failed:", {
        errors: z.prettifyError(error),
        originalData: checkoutData,
      });
      throw new Error(error.message);
    }

    const { items, total, discountAmount, finalTotal, couponCode } = data;

    if (items.length === 0) {
      throw new Error("Cart is empty");
    }

    // Calculate the amount to charge (use finalTotal if available, otherwise use total)
    const amountToCharge = finalTotal || total;

    const stripeParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment" as const,
      line_items: items.map((item) => ({
        price_data: {
          currency: "AED",
          product_data: {
            name: item.name,
            description: item.description || "",
            images: item.image ? [item.image] : undefined,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      metadata: {
        userId: session.user.id,
        itemCount: items.length.toString(),
        total: total.toString(),
        finalTotal: amountToCharge.toString(),
        discountAmount: (discountAmount || 0).toString(),
        couponCode: couponCode || "",
        productIds: JSON.stringify(items.map((item) => item.productId)),
      },
      customer_email: session.user.email,
      success_url: `${env.BASE_URL}/checkout?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.BASE_URL}/checkout?cancelled=1`,
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["AE"],
      },
      phone_number_collection: { enabled: true },
    };

    const checkout = await stripeClient.checkout.sessions.create(stripeParams);

    console.log("checkout", checkout);
    return { success: true, url: checkout.url };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create checkout session",
    };
  }
}

// Function to handle anonymous user checkout
export async function createAnonymousCheckoutSession(checkoutData: CartCheckoutSchema) {
  try {
    const { data, error } = cartCheckoutSchema.safeParse(checkoutData);

    if (error) {
      console.error("❌ [DEBUG] Schema validation failed:", {
        errors: z.prettifyError(error),
        originalData: checkoutData,
      });
      throw new Error(error.message);
    }

    const { items, total, discountAmount, finalTotal, couponCode } = data;

    if (items.length === 0) {
      throw new Error("Cart is empty");
    }

    // Calculate the amount to charge (use finalTotal if available, otherwise use total)
    const amountToCharge = finalTotal || total;

    const stripeParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment" as const,
      line_items: items.map((item) => ({
        price_data: {
          currency: "AED",
          product_data: {
            name: item.name,
            description: item.description || "",
            images: item.image ? [item.image] : undefined,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      metadata: {
        anonymous: "true",
        itemCount: items.length.toString(),
        total: total.toString(),
        finalTotal: amountToCharge.toString(),
        discountAmount: (discountAmount || 0).toString(),
        couponCode: couponCode || "",
        productIds: JSON.stringify(items.map((item) => item.productId)),
      },
      success_url: `${env.BASE_URL}/checkout?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.BASE_URL}/checkout?cancelled=1`,
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["AE"],
      },
    };

    const checkout = await stripeClient.checkout.sessions.create(stripeParams);

    return { success: true, url: checkout.url };
  } catch (error) {
    console.error("Error creating anonymous checkout session:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create checkout session",
    };
  }
}
