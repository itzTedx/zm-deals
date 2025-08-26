import type Stripe from "stripe";

import { createLog } from "@/lib/logging";
import { stripeClient } from "@/lib/stripe/client";
import { clearCart } from "@/modules/cart/actions/mutation";
import { createOrder, processPaymentIntentEvent, updateOrderStatus } from "@/modules/orders/actions/mutation";
import { CreateOrderData } from "@/modules/orders/schema";

const log = createLog("Auth Webhooks");

/**
 * Handle checkout session completed event
 */
export async function handleCheckoutSessionCompleted(
  session: Stripe.CheckoutSessionCompletedEvent.Data["object"],
  sessionId?: string | null
) {
  log.info("Processing checkout session completed", { sessionId: session.id });

  try {
    let sessionWithItems = session;

    // Check if line items are available in the webhook event
    if (!session.line_items?.data || session.line_items.data.length === 0) {
      log.info("No line items in webhook event, retrieving full session", { sessionId: session.id });

      // Retrieve the full session with expanded line items
      const fullSession = await stripeClient.checkout.sessions.retrieve(session.id, {
        expand: ["line_items"],
      });

      if (!fullSession.line_items?.data || fullSession.line_items.data.length === 0) {
        log.error("No line items found in retrieved session", { sessionId: session.id });
        return;
      }

      // Use the full session data
      sessionWithItems = fullSession;
    }

    // Extract order data from session
    const stripeItems = sessionWithItems.line_items!.data;

    // Get database product IDs from metadata
    let databaseProductIds: string[] = [];
    try {
      if (sessionWithItems.metadata?.productIds) {
        databaseProductIds = JSON.parse(sessionWithItems.metadata.productIds);
      }
    } catch (error) {
      log.error("Failed to parse product IDs from metadata", error);
    }

    // Map Stripe line items to order items using database product IDs
    const items = stripeItems.map((item, index) => ({
      productId:
        databaseProductIds[index] ||
        (typeof item.price?.product === "string" ? item.price.product : item.price?.product?.id || ""),
      quantity: item.quantity || 1,
      price: (item.amount_total || 0) / 100, // Convert from cents
    }));

    const total = (sessionWithItems.amount_total || 0) / 100;
    const subtotal = (sessionWithItems.amount_subtotal || 0) / 100;
    const taxAmount = (sessionWithItems.total_details?.amount_tax || 0) / 100;

    // Create order data
    const orderData: CreateOrderData = {
      items,
      total,
      subtotal,
      taxAmount,
      shippingAmount: 0, // Stripe handles shipping separately if needed
      customerEmail: sessionWithItems.customer_email || "",
      customerPhone: sessionWithItems.customer_details?.phone || undefined,
      shippingAddress: undefined,
      billingAddress: sessionWithItems.customer_details?.address
        ? {
            name: sessionWithItems.customer_details.name || undefined,
            address: {
              line1: sessionWithItems.customer_details.address.line1 || undefined,
              line2: sessionWithItems.customer_details.address.line2 || undefined,
              city: sessionWithItems.customer_details.address.city || undefined,
              state: sessionWithItems.customer_details.address.state || undefined,
              postal_code: sessionWithItems.customer_details.address.postal_code || undefined,
              country: sessionWithItems.customer_details.address.country || undefined,
            },
            phone: sessionWithItems.customer_details.phone || undefined,
          }
        : undefined,
      paymentIntentId:
        typeof sessionWithItems.payment_intent === "string"
          ? sessionWithItems.payment_intent
          : sessionWithItems.payment_intent?.id || undefined,
      sessionId: sessionId || undefined,
    };

    // Create order in database
    const orderResult = await createOrder(orderData);

    if (orderResult.success && orderResult.orderId) {
      log.success("Order created successfully", {
        orderId: orderResult.orderId,
        orderNumber: orderResult.orderNumber,
        sessionId: sessionWithItems.id,
        alreadyExists: orderResult.alreadyExists,
      });

      // Only update status if this is a new order (not already existing)
      if (!orderResult.alreadyExists) {
        // Update order status to confirmed
        await updateOrderStatus(
          orderResult.orderId,
          "confirmed",
          "paid",
          "Payment completed",
          "Order confirmed after successful payment"
        );

        // Clear user's cart if they have one
        if (sessionWithItems.metadata?.userId) {
          try {
            await clearCart();
            log.success("Cart cleared for user", { userId: sessionWithItems.metadata.userId });
          } catch (error) {
            log.warn("Failed to clear cart", { userId: sessionWithItems.metadata.userId, error });
          }
        }
      } else {
        log.info("Order already existed, skipping status update and cart clearing", {
          orderId: orderResult.orderId,
          orderNumber: orderResult.orderNumber,
        });
      }
    } else {
      log.error("Failed to create order", { error: orderResult.error, sessionId: sessionWithItems.id });
    }
  } catch (error) {
    log.error("Error processing checkout session completed", error);
  }
}

/**
 * Handle payment intent succeeded event
 */
export async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntentSucceededEvent.Data["object"]) {
  log.info("Processing payment intent succeeded", { paymentIntentId: paymentIntent.id });

  try {
    const result = await processPaymentIntentEvent(paymentIntent.id, "succeeded", {
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });

    if (result.success) {
      log.success("Payment intent succeeded and order updated", {
        paymentIntentId: paymentIntent.id,
        orderId: result.orderId,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
      });
    } else {
      log.warn("Failed to process payment intent succeeded", {
        paymentIntentId: paymentIntent.id,
        error: result.error,
      });
    }
  } catch (error) {
    log.error("Error processing payment intent succeeded", error);
  }
}

/**
 * Handle payment intent failed event
 */
export async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntentPaymentFailedEvent.Data["object"]) {
  log.info("Processing payment intent failed", { paymentIntentId: paymentIntent.id });

  try {
    const result = await processPaymentIntentEvent(paymentIntent.id, "failed", {
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      lastPaymentError: paymentIntent.last_payment_error?.message,
    });

    if (result.success) {
      log.warn("Payment intent failed and order updated", {
        paymentIntentId: paymentIntent.id,
        orderId: result.orderId,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        lastPaymentError: paymentIntent.last_payment_error?.message,
      });
    } else {
      log.warn("Failed to process payment intent failed", {
        paymentIntentId: paymentIntent.id,
        error: result.error,
        lastPaymentError: paymentIntent.last_payment_error?.message,
      });
    }
  } catch (error) {
    log.error("Error processing payment intent failed", error);
  }
}
