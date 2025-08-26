import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth/server";
import { createLog } from "@/lib/logging";
import { clearCart } from "@/modules/cart/actions/mutation";
import { createOrder, updateOrderStatus } from "@/modules/orders/actions/mutation";

const log = createLog("Auth Webhook");

export async function POST(request: NextRequest) {
  try {
    // Use the auth system's webhook handler
    const response = await auth.webhooks.handle(request);

    if (response.status === 200) {
      // Get the webhook event from the response
      const event = await request.json();

      // Handle specific events for order management
      await handleWebhookEvent(event);
    }

    return response;
  } catch (error) {
    log.error("Webhook processing failed", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function handleWebhookEvent(event: any) {
  log.info("Processing webhook event", { type: event.type, id: event.id });

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(event.data.object);
      break;

    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(event.data.object);
      break;

    case "payment_intent.payment_failed":
      await handlePaymentIntentFailed(event.data.object);
      break;

    case "customer.subscription.created":
      await handleCustomerSubscriptionCreated(event.data.object);
      break;

    case "customer.subscription.updated":
      await handleCustomerSubscriptionUpdated(event.data.object);
      break;

    case "customer.subscription.deleted":
      await handleCustomerSubscriptionDeleted(event.data.object);
      break;

    default:
      log.info("Unhandled event type", { type: event.type });
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  log.info("Processing checkout session completed", { sessionId: session.id });

  try {
    if (!session.line_items?.data || session.line_items.data.length === 0) {
      log.error("No line items found in session", { sessionId: session.id });
      return;
    }

    // Extract order data from session
    const items = session.line_items.data.map((item: any) => ({
      productId: (item.price?.product as string) || "",
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
      customerEmail: session.customer_details?.email || "",
      customerPhone: session.customer_details?.phone || undefined,
      shippingAddress: session.shipping_details?.address,
      billingAddress: session.customer_details?.address,
      paymentIntentId: session.payment_intent as string,
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

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  log.info("Processing payment intent succeeded", { paymentIntentId: paymentIntent.id });

  try {
    // Find order by payment intent ID and update status
    // This would require a query to find the order, but for now we'll log it
    log.success("Payment intent succeeded", {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
    });
  } catch (error) {
    log.error("Error processing payment intent succeeded", error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: any) {
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

async function handleCustomerSubscriptionCreated(subscription: any) {
  log.info("Processing customer subscription created", { subscriptionId: subscription.id });

  try {
    // Handle subscription creation
    log.success("Subscription created", {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      status: subscription.status,
    });
  } catch (error) {
    log.error("Error processing subscription created", error);
  }
}

async function handleCustomerSubscriptionUpdated(subscription: any) {
  log.info("Processing customer subscription updated", { subscriptionId: subscription.id });

  try {
    // Handle subscription updates
    log.success("Subscription updated", {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      status: subscription.status,
    });
  } catch (error) {
    log.error("Error processing subscription updated", error);
  }
}

async function handleCustomerSubscriptionDeleted(subscription: any) {
  log.info("Processing customer subscription deleted", { subscriptionId: subscription.id });

  try {
    // Handle subscription deletion
    log.success("Subscription deleted", {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      status: subscription.status,
    });
  } catch (error) {
    log.error("Error processing subscription deleted", error);
  }
}
