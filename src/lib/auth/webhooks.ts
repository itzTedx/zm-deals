import type Stripe from "stripe";

import { createLog } from "@/lib/logging";
import { stripeClient } from "@/lib/stripe/client";
import { clearCartBySessionId, clearCartByUserId } from "@/modules/cart/actions/mutation";
import {
  confirmOrderAndReserveInventory,
  createOrder,
  processPaymentIntentEvent,
} from "@/modules/orders/actions/mutation";
import { CreateOrderData } from "@/modules/orders/schema";

const log = createLog("Auth Webhooks");

/**
 * Handle checkout session completed event
 */
export async function handleCheckoutSessionCompleted(
  session: Stripe.CheckoutSessionCompletedEvent.Data["object"],
  sessionId?: string | null
) {
  log.info("Processing checkout session completed", {
    sessionId: session.id,
    paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
  });

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

    // Extract discount information from metadata
    const discountAmount = Number.parseFloat(sessionWithItems.metadata?.discountAmount || "0");
    const couponCode = sessionWithItems.metadata?.couponCode || undefined;

    // Filter out discount line items and map Stripe line items to order items
    const items = stripeItems
      .filter((item) => {
        // Filter out discount line items (negative amounts)
        const amount = item.amount_total || 0;
        return amount > 0;
      })
      .map((item, index) => {
        // Find the corresponding database product ID
        const productId =
          databaseProductIds[index] ||
          (typeof item.price?.product === "string" ? item.price.product : item.price?.product?.id || "");

        return {
          productId,
          quantity: item.quantity || 1,
          price: (item.amount_total || 0) / 100, // Convert from cents
        };
      });

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
      discountAmount, // Add discount amount to order data
      couponCode, // Add coupon code to order data
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
      userId: sessionWithItems.metadata?.userId || undefined,
    };

    // Log discount information
    if (discountAmount > 0) {
      log.info("Processing order with discount", {
        discountAmount,
        couponCode,
        total,
        subtotal,
      });
    }

    // Log userId extraction
    if (sessionWithItems.metadata?.userId) {
      log.info("Extracted userId from session metadata", { userId: sessionWithItems.metadata.userId });
    } else {
      log.info("No userId found in session metadata", { metadata: sessionWithItems.metadata });
    }

    // Create order in database
    const orderResult = await createOrder(orderData);

    if (orderResult.success && orderResult.orderId) {
      log.success("Order created successfully", {
        orderId: orderResult.orderId,
        orderNumber: orderResult.orderNumber,
        sessionId: sessionWithItems.id,
        alreadyExists: orderResult.alreadyExists,
        discountAmount,
        couponCode,
      });

      // Only process confirmation if this is a new order (not already existing)
      if (!orderResult.alreadyExists) {
        // Confirm order and reserve inventory
        const confirmationResult = await confirmOrderAndReserveInventory(
          orderResult.orderId,
          "Payment completed via Stripe checkout"
        );

        if (confirmationResult.success) {
          log.success("Order confirmed and inventory reserved", {
            orderId: orderResult.orderId,
            orderNumber: orderResult.orderNumber,
            reservedItems: confirmationResult.reservedItems,
          });
        } else {
          log.error("Failed to confirm order and reserve inventory", {
            orderId: orderResult.orderId,
            error: confirmationResult.error,
          });
          // Note: In a production system, you might want to handle this failure differently
          // For example, you could retry the inventory reservation or mark the order for manual review
        }

        // Clear user's cart after successful order
        try {
          if (sessionWithItems.metadata?.userId) {
            // Clear authenticated user's cart
            const cartResult = await clearCartByUserId(sessionWithItems.metadata.userId);
            if (cartResult.success) {
              log.success("Cart cleared for authenticated user", {
                userId: sessionWithItems.metadata.userId,
              });
            } else {
              log.warn("Failed to clear cart for authenticated user", {
                userId: sessionWithItems.metadata.userId,
                error: cartResult.error,
              });
            }
          } else if (sessionWithItems.metadata?.anonymous === "true" && sessionWithItems.metadata?.sessionId) {
            // Clear guest cart using session ID from metadata
            const cartResult = await clearCartBySessionId(sessionWithItems.metadata.sessionId);
            if (cartResult.success) {
              log.success("Cart cleared for guest user", {
                sessionId: sessionWithItems.metadata.sessionId,
              });
            } else {
              log.warn("Failed to clear cart for guest user", {
                sessionId: sessionWithItems.metadata.sessionId,
                error: cartResult.error,
              });
            }
          } else {
            log.info("No user ID or session ID found in metadata, skipping cart clearing", {
              metadata: sessionWithItems.metadata,
              sessionId,
            });
          }
        } catch (error) {
          log.error("Error clearing cart after successful order", error);
        }
      } else {
        log.info("Order already existed, skipping confirmation and cart clearing", {
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
    // Find the order associated with this payment intent
    const { cancelOrderAndReleaseInventory } = await import("@/modules/orders/actions/mutation");

    const result = await processPaymentIntentEvent(paymentIntent.id, "failed", {
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      failureReason: paymentIntent.last_payment_error?.message || "Payment failed",
    });

    if (result.success && result.orderId) {
      // Cancel the order and release inventory
      const cancellationResult = await cancelOrderAndReleaseInventory(
        result.orderId,
        `Payment failed: ${paymentIntent.last_payment_error?.message || "Unknown error"}`
      );

      if (cancellationResult.success) {
        log.success("Order cancelled and inventory released due to payment failure", {
          paymentIntentId: paymentIntent.id,
          orderId: result.orderId,
          releasedItems: cancellationResult.releasedItems,
        });
      } else {
        log.error("Failed to cancel order after payment failure", {
          paymentIntentId: paymentIntent.id,
          orderId: result.orderId,
          error: cancellationResult.error,
        });
      }
    } else {
      log.warn("Failed to process payment intent failed", {
        paymentIntentId: paymentIntent.id,
        error: result.error,
      });
    }
  } catch (error) {
    log.error("Error processing payment intent failed", error);
  }
}

/**
 * Handle payment intent canceled event
 */
export async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntentCanceledEvent.Data["object"]) {
  log.info("Processing payment intent canceled", { paymentIntentId: paymentIntent.id });

  try {
    // Find the order associated with this payment intent
    const { cancelOrderAndReleaseInventory } = await import("@/modules/orders/actions/mutation");

    const result = await processPaymentIntentEvent(paymentIntent.id, "canceled", {
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      cancellationReason: paymentIntent.cancellation_reason || "Payment canceled",
    });

    if (result.success && result.orderId) {
      // Cancel the order and release inventory
      const cancellationResult = await cancelOrderAndReleaseInventory(
        result.orderId,
        `Payment canceled: ${paymentIntent.cancellation_reason || "User canceled"}`
      );

      if (cancellationResult.success) {
        log.success("Order cancelled and inventory released due to payment cancellation", {
          paymentIntentId: paymentIntent.id,
          orderId: result.orderId,
          releasedItems: cancellationResult.releasedItems,
        });
      } else {
        log.error("Failed to cancel order after payment cancellation", {
          paymentIntentId: paymentIntent.id,
          orderId: result.orderId,
          error: cancellationResult.error,
        });
      }
    } else {
      log.warn("Failed to process payment intent canceled", {
        paymentIntentId: paymentIntent.id,
        error: result.error,
      });
    }
  } catch (error) {
    log.error("Error processing payment intent canceled", error);
  }
}
