"use server";

import { headers } from "next/headers";

import Stripe from "stripe";
import z from "zod";

import { auth, getSession } from "@/lib/auth/server";
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
  sessionId: z.string().optional(), // Added sessionId to schema
  shippingFee: z.number().min(0).optional(), // Added shipping fee to schema
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

// Helper function to create line items with discount and shipping
function createLineItemsWithDiscount(
  items: CartCheckoutSchema["items"],
  discountAmount = 0,
  couponCode?: string,
  shippingFee = 0
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  // Add product line items
  items.forEach((item) => {
    lineItems.push({
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
    });
  });

  // Add discount line item if there's a discount
  if (discountAmount > 0) {
    lineItems.push({
      price_data: {
        currency: "AED",
        product_data: {
          name: couponCode ? `Discount (${couponCode})` : "Discount",
          description: "Applied discount",
        },
        unit_amount: -Math.round(discountAmount * 100), // Negative amount for discount
      },
      quantity: 1,
    });
  }

  // Add shipping fee line item if there's a shipping fee
  if (shippingFee > 0) {
    lineItems.push({
      price_data: {
        currency: "AED",
        product_data: {
          name: "Shipping Fee",
          description: "Delivery and handling charges",
        },
        unit_amount: Math.round(shippingFee * 100),
      },
      quantity: 1,
    });
  }

  return lineItems;
}

// New cart-based checkout function with Stripe coupon support
export async function createCartCheckoutSessionWithStripeCoupon(checkoutData: CartCheckoutSchema) {
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

    const { items, total, discountAmount, finalTotal, couponCode, shippingFee } = data;

    if (items.length === 0) {
      throw new Error("Cart is empty");
    }

    // Create line items without discount (Stripe will handle the discount)
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
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
    }));

    // Add shipping fee line item if there's a shipping fee
    if (shippingFee && shippingFee > 0) {
      lineItems.push({
        price_data: {
          currency: "AED",
          product_data: {
            name: "Shipping Fee",
            description: "Delivery and handling charges",
          },
          unit_amount: Math.round(shippingFee * 100),
        },
        quantity: 1,
      });
    }

    const stripeParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment" as const,
      line_items: lineItems,
      metadata: {
        userId: session.user.id,
        itemCount: items.length.toString(),
        total: total.toString(),
        finalTotal: finalTotal?.toString() || total.toString(),
        discountAmount: (discountAmount || 0).toString(),
        couponCode: couponCode || "",
        productIds: JSON.stringify(items.map((item) => item.productId)),
        shippingFee: (shippingFee || 0).toString(),
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

    // Add coupon if provided
    if (couponCode) {
      stripeParams.discounts = [
        {
          coupon: couponCode, // Use the coupon code directly
        },
      ];
    }

    const checkout = await stripeClient.checkout.sessions.create(stripeParams);

    console.log("✅ [DEBUG] Stripe checkout session created with coupon:", {
      sessionId: checkout.id,
      couponCode,
      total,
      finalTotal,
    });

    return { success: true, url: checkout.url };
  } catch (error) {
    console.error("❌ [DEBUG] Error creating checkout session:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create checkout session" };
  }
}

// Enhanced cart-based checkout function that supports both approaches
export async function createCartCheckoutSession(checkoutData: CartCheckoutSchema) {
  try {
    const session = await getSession();

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

    const { items, total, discountAmount, finalTotal, couponCode, shippingFee } = data;

    if (items.length === 0) {
      throw new Error("Cart is empty");
    }

    // If we have a coupon code, try to use Stripe's native coupon system
    if (couponCode) {
      try {
        // First, try to use Stripe's native coupon system
        const result = await createCartCheckoutSessionWithStripeCoupon(checkoutData);
        if (result.success) {
          return result;
        }
        // If Stripe coupon fails, fall back to manual discount
        console.warn("⚠️ [DEBUG] Stripe coupon failed, falling back to manual discount:", result.error);
      } catch (stripeError) {
        console.warn("⚠️ [DEBUG] Stripe coupon error, falling back to manual discount:", stripeError);
      }
    }

    // Calculate the amount to charge (use finalTotal if available, otherwise use total)
    const amountToCharge = finalTotal || total;

    // Create line items with manual discount and shipping fee
    const lineItems = createLineItemsWithDiscount(items, discountAmount || 0, couponCode, shippingFee || 0);

    const stripeParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment" as const,
      line_items: lineItems,
      metadata: {
        userId: session.user.id,
        itemCount: items.length.toString(),
        total: total.toString(),
        finalTotal: amountToCharge.toString(),
        discountAmount: (discountAmount || 0).toString(),
        couponCode: couponCode || "",
        productIds: JSON.stringify(items.map((item) => item.productId)),
        discountMethod: "manual", // Indicate this was a manual discount
        shippingFee: (shippingFee || 0).toString(),
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

    console.log("✅ [DEBUG] Stripe checkout session created with manual discount:", {
      sessionId: checkout.id,
      couponCode,
      total,
      finalTotal,
      discountAmount,
    });

    return { success: true, url: checkout.url };
  } catch (error) {
    console.error("❌ [DEBUG] Error creating checkout session:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create checkout session" };
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

    const { items, total, discountAmount, finalTotal, couponCode, sessionId, shippingFee } = data;

    if (items.length === 0) {
      throw new Error("Cart is empty");
    }

    // Calculate the amount to charge (use finalTotal if available, otherwise use total)
    const amountToCharge = finalTotal || total;

    // Create line items with discount and shipping fee
    const lineItems = createLineItemsWithDiscount(items, discountAmount || 0, couponCode, shippingFee || 0);

    const stripeParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment" as const,
      line_items: lineItems,
      metadata: {
        anonymous: "true",
        sessionId: sessionId || "", // Include session ID for guest cart clearing
        itemCount: items.length.toString(),
        total: total.toString(),
        finalTotal: amountToCharge.toString(),
        discountAmount: (discountAmount || 0).toString(),
        couponCode: couponCode || "",
        productIds: JSON.stringify(items.map((item) => item.productId)),
        shippingFee: (shippingFee || 0).toString(),
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
