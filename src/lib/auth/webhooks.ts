import type Stripe from "stripe";

import { createLog } from "@/lib/logging";
import { clearCart } from "@/modules/cart/actions/mutation";
import { createOrder, updateOrderStatus } from "@/modules/orders/actions/mutation";

const log = createLog("Auth Webhooks");

/**
 * Handle checkout session completed event
 */
export async function handleCheckoutSessionCompleted(session: Stripe.CheckoutSessionCompletedEvent.Data["object"]) {
  log.info("Processing checkout session completed", { sessionId: session.id });

  try {
    if (!session.line_items?.data || session.line_items.data.length === 0) {
      log.error("No line items found in session", { sessionId: session.id });
      return;
    }

    // Extract order data from session
    const items = session.line_items.data.map((item) => ({
      productId: item.price?.product || "",
      quantity: item.quantity || 1,
      price: (item.amount_total || 0) / 100, // Convert from cents
    }));

    const total = (session.amount_total || 0) / 100;
    const subtotal = (session.amount_subtotal || 0) / 100;
    const taxAmount = (session.total_details?.amount_tax || 0) / 100;

    // Create order data
    const orderData = {
      items,
      total,
      subtotal,
      taxAmount,
      shippingAmount: 0, // Stripe handles shipping separately if needed
      customerEmail: session.customer_email,
      // customerEmail: session.customer_details?.email || "",
      customerPhone: session.customer_details?.phone,
      shippingAddress: session.shipping_address_collection?.allowed_countries,
      billingAddress: session.customer_details?.address,
      paymentIntentId: session.payment_intent,
      sessionId: session.id,
    };

    // Create order in database
    const orderResult = await createOrder(orderData);

    if (orderResult.success && orderResult.orderId) {
      log.success("Order created successfully", {
        orderId: orderResult.orderId,
        orderNumber: orderResult.orderNumber,
        sessionId: session.id,
      });

      // Update order status to confirmed
      await updateOrderStatus(
        orderResult.orderId,
        "confirmed",
        "paid",
        "Payment completed",
        "Order confirmed after successful payment"
      );

      // Clear user's cart if they have one
      if (session.metadata?.userId) {
        try {
          await clearCart();
          log.success("Cart cleared for user", { userId: session.metadata.userId });
        } catch (error) {
          log.warn("Failed to clear cart", { userId: session.metadata.userId, error });
        }
      }
    } else {
      log.error("Failed to create order", { error: orderResult.error, sessionId: session.id });
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
    // Find order by payment intent ID and update status
    log.success("Payment intent succeeded", {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
    });
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
    // Find order by payment intent ID and update status
    log.warn("Payment intent failed", {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      lastPaymentError: paymentIntent.last_payment_error?.message,
    });
  } catch (error) {
    log.error("Error processing payment intent failed", error);
  }
}
