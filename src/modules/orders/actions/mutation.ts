"use server";

import { headers } from "next/headers";

import { eq, inArray } from "drizzle-orm";
import z from "zod";

import { auth } from "@/lib/auth/server";
import { createLog } from "@/lib/logging";
import { formatAddress, generateOrderNumber } from "@/lib/utils/order";
import { reserveStock } from "@/modules/inventory/actions/mutation";
import { db } from "@/server/db";
import { type NewOrder, type NewOrderItem, orderHistory, orderItems, orders } from "@/server/schema/orders-schema";
import { products } from "@/server/schema/product-schema";

import { createOrderDataSchema } from "../schema";
import type { CreateOrderResponse } from "../types";

/**
 * Creates a new order in the database
 * Handles webhook scenarios with duplicate prevention and idempotency
 */
export async function createOrder(rawData: unknown): Promise<CreateOrderResponse> {
  const log = createLog("Order");

  log.info("Starting order creation process");

  try {
    // Validate order data
    const { data, success, error } = createOrderDataSchema.safeParse(rawData);
    if (!success) {
      log.error("Order validation failed", error);
      return { success: false, error: z.prettifyError(error) };
    }

    // Check for existing order by payment intent ID (webhook idempotency)
    if (data.paymentIntentId) {
      const existingOrder = await db.query.orders.findFirst({
        where: eq(orders.paymentIntentId, data.paymentIntentId),
        columns: { id: true, orderNumber: true, status: true },
      });

      if (existingOrder) {
        log.info("Order already exists for payment intent", {
          orderId: existingOrder.id,
          orderNumber: existingOrder.orderNumber,
          status: existingOrder.status,
          paymentIntentId: data.paymentIntentId,
        });
        return {
          success: true,
          orderId: existingOrder.id,
          orderNumber: existingOrder.orderNumber,
          alreadyExists: true,
        };
      }
    }

    // Get user session if available
    let userId: string | undefined;
    try {
      const session = await auth.api.getSession({ headers: await headers() });
      userId = session?.user?.id;
    } catch (error) {
      console.error("Error getting session", error);
      log.warn("No authenticated session found, creating anonymous order");
    }

    // Generate unique order number
    const orderNumber = generateOrderNumber();
    log.info("Generated order number", orderNumber);

    // Get product details for order items
    const productIds = data.items.map((item) => item.productId);
    const productDetails = await db.query.products.findMany({
      where: inArray(products.id, productIds),
      columns: {
        id: true,
        title: true,
        slug: true,
        image: true,
      },
    });

    if (productDetails.length !== data.items.length) {
      log.error("Some products not found", { requested: data.items.length, found: productDetails.length });
      return { success: false, error: "Some products not found" };
    }

    // Create order in database transaction
    const result = await db.transaction(async (tx) => {
      // Create main order record
      const [newOrder] = await tx
        .insert(orders)
        .values({
          orderNumber,
          userId,
          status: "pending",
          paymentStatus: "pending",
          paymentMethod: "stripe",
          paymentIntentId: data.paymentIntentId,
          subtotal: data.subtotal.toString(),
          taxAmount: data.taxAmount.toString(),
          shippingAmount: data.shippingAmount.toString(),
          totalAmount: data.total.toString(),
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          customerNote: data.customerNote,
          shippingAddress: data.shippingAddress ? formatAddress(data.shippingAddress) : null,
          billingAddress: data.billingAddress ? formatAddress(data.billingAddress) : null,
        } satisfies NewOrder)
        .returning({ id: orders.id, orderNumber: orders.orderNumber });

      log.success("Order created", { orderId: newOrder.id, orderNumber: newOrder.orderNumber });

      // Create order items
      const orderItemsData: NewOrderItem[] = data.items.map((item, index) => {
        const product = productDetails[index];
        return {
          orderId: newOrder.id,
          productId: item.productId,
          productTitle: product.title,
          productSlug: product.slug,
          productImage: product.image,
          unitPrice: item.price.toString(),
          quantity: item.quantity,
          totalPrice: (item.price * item.quantity).toString(),
        };
      });

      await tx.insert(orderItems).values(orderItemsData);
      log.success("Order items created", { count: orderItemsData.length });

      // Create initial order history record
      await tx.insert(orderHistory).values({
        orderId: newOrder.id,
        userId,
        newStatus: "pending",
        newPaymentStatus: "pending",
        changeReason: "Order created",
        changeNote: data.paymentIntentId ? "Order created from Stripe webhook" : "Order created from checkout session",
        metadata: {
          sessionId: data.sessionId || "",
          paymentIntentId: data.paymentIntentId || "",
          source: data.paymentIntentId ? "webhook" : "checkout",
        },
      });

      log.success("Order history record created");

      return newOrder;
    });

    log.success("Order creation completed successfully", {
      orderId: result.id,
      orderNumber: result.orderNumber,
      itemCount: data.items.length,
      total: data.total,
      paymentIntentId: data.paymentIntentId,
    });

    return {
      success: true,
      orderId: result.id,
      orderNumber: result.orderNumber,
    };
  } catch (error) {
    log.error("Order creation failed", error);

    // Handle specific database errors
    if (error instanceof Error) {
      // Check for duplicate order number error
      if (error.message.includes("duplicate key") && error.message.includes("order_number")) {
        log.warn("Duplicate order number detected, regenerating and retrying");
        // In a real implementation, you might want to retry with a new order number
        return { success: false, error: "Order number conflict, please try again" };
      }

      // Check for duplicate payment intent error
      if (error.message.includes("duplicate key") && error.message.includes("payment_intent_id")) {
        log.warn("Duplicate payment intent detected");
        return { success: false, error: "Order already exists for this payment" };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create order",
    };
  }
}

/**
 * Confirms an order and reserves inventory
 * This should be called when payment is successful
 */
export async function confirmOrderAndReserveInventory(
  orderId: string,
  reason?: string
): Promise<{
  success: boolean;
  error?: string;
  reservedItems?: Array<{ productId: string; quantity: number; newStock: number }>;
}> {
  const log = createLog("Order Confirmation");

  try {
    // Get order details with items
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: {
          columns: {
            productId: true,
            quantity: true,
          },
        },
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    if (order.status === "confirmed") {
      log.info("Order already confirmed", { orderId });
      return { success: true };
    }

    // Reserve inventory
    const reservationResult = await reserveStock(
      order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      orderId
    );

    if (!reservationResult.success) {
      log.error("Failed to reserve inventory", { error: reservationResult.error });
      return { success: false, error: reservationResult.error };
    }

    // Update order status to confirmed
    const statusResult = await updateOrderStatus(
      orderId,
      "confirmed",
      "paid",
      reason || "Payment completed",
      "Order confirmed and inventory reserved"
    );

    if (!statusResult.success) {
      log.error("Failed to update order status", { error: statusResult.error });
      // Note: In a production system, you might want to release the reserved inventory here
      return { success: false, error: statusResult.error };
    }

    log.success("Order confirmed and inventory reserved", {
      orderId,
      orderNumber: order.orderNumber,
      reservedItems: reservationResult.reservedItems,
    });

    return {
      success: true,
      reservedItems: reservationResult.reservedItems,
    };
  } catch (error) {
    log.error("Failed to confirm order and reserve inventory", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to confirm order",
    };
  }
}

/**
 * Cancels an order and releases reserved inventory
 * This should be called when an order is cancelled or payment fails
 */
export async function cancelOrderAndReleaseInventory(
  orderId: string,
  reason?: string
): Promise<{
  success: boolean;
  error?: string;
  releasedItems?: Array<{ productId: string; quantity: number; newStock: number }>;
}> {
  const log = createLog("Order Cancellation");

  try {
    // Get order details with items
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: {
          columns: {
            productId: true,
            quantity: true,
          },
        },
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    if (order.status === "cancelled") {
      log.info("Order already cancelled", { orderId });
      return { success: true };
    }

    // Only release inventory if the order was confirmed (inventory was reserved)
    let releasedItems: Array<{ productId: string; quantity: number; newStock: number }> | undefined;

    if (order.status === "confirmed") {
      const { releaseStock } = await import("@/modules/inventory/actions/mutation");

      const releaseResult = await releaseStock(
        order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        orderId
      );

      if (!releaseResult.success) {
        log.error("Failed to release inventory", { error: releaseResult.error });
        // Continue with order cancellation even if inventory release fails
        // The inventory can be manually adjusted later
      } else {
        releasedItems = releaseResult.releasedItems;
        log.success("Inventory released", { releasedItems });
      }
    }

    // Update order status to cancelled
    const statusResult = await updateOrderStatus(
      orderId,
      "cancelled",
      "failed",
      reason || "Order cancelled",
      "Order cancelled and inventory released"
    );

    if (!statusResult.success) {
      log.error("Failed to update order status", { error: statusResult.error });
      return { success: false, error: statusResult.error };
    }

    log.success("Order cancelled and inventory released", {
      orderId,
      orderNumber: order.orderNumber,
      releasedItems,
    });

    return {
      success: true,
      releasedItems,
    };
  } catch (error) {
    log.error("Failed to cancel order and release inventory", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel order",
    };
  }
}

/**
 * Updates order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded" | "failed",
  paymentStatus?: "pending" | "paid" | "failed" | "refunded" | "partially_refunded",
  reason?: string,
  note?: string
): Promise<{ success: boolean; error?: string }> {
  const log = createLog("Order");

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;

    const result = await db.transaction(async (tx) => {
      // Get current order status
      const currentOrder = await tx.query.orders.findFirst({
        where: eq(orders.id, orderId),
        columns: { status: true, paymentStatus: true },
      });

      if (!currentOrder) {
        throw new Error("Order not found");
      }

      // Update order status
      await tx
        .update(orders)
        .set({
          status,
          ...(paymentStatus && { paymentStatus }),
          ...(status === "confirmed" && { confirmedAt: new Date() }),
          ...(status === "shipped" && { shippedAt: new Date() }),
          ...(status === "delivered" && { deliveredAt: new Date() }),
          ...(status === "cancelled" && { cancelledAt: new Date() }),
          ...(status === "refunded" && { refundedAt: new Date() }),
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));

      // Create history record
      await tx.insert(orderHistory).values({
        orderId,
        userId,
        previousStatus: currentOrder.status,
        newStatus: status,
        previousPaymentStatus: currentOrder.paymentStatus,
        newPaymentStatus: paymentStatus || currentOrder.paymentStatus,
        changeReason: reason || "Status updated",
        changeNote: note || "",
      });

      return { success: true };
    });

    log.success("Order status updated", { orderId, status, paymentStatus });
    return result;
  } catch (error) {
    log.error("Failed to update order status", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update order status",
    };
  }
}

/**
 * Updates payment status
 */
export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: "pending" | "paid" | "failed" | "refunded" | "partially_refunded",
  paymentIntentId?: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const log = createLog("Order");

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;

    const result = await db.transaction(async (tx) => {
      // Get current order status
      const currentOrder = await tx.query.orders.findFirst({
        where: eq(orders.id, orderId),
        columns: { status: true, paymentStatus: true },
      });

      if (!currentOrder) {
        throw new Error("Order not found");
      }

      // Update payment status
      await tx
        .update(orders)
        .set({
          paymentStatus,
          ...(paymentIntentId && { paymentIntentId }),
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));

      // Create history record
      await tx.insert(orderHistory).values({
        orderId,
        userId,
        previousStatus: currentOrder.status,
        newStatus: currentOrder.status,
        previousPaymentStatus: currentOrder.paymentStatus,
        newPaymentStatus: paymentStatus,
        changeReason: reason || "Payment status updated",
        changeNote: `Payment status changed to ${paymentStatus}`,
        metadata: {
          paymentIntentId: paymentIntentId || "",
        },
      });

      return { success: true };
    });

    log.success("Payment status updated", { orderId, paymentStatus, paymentIntentId });
    return result;
  } catch (error) {
    log.error("Failed to update payment status", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update payment status",
    };
  }
}

/**
 * Process payment intent event and update order accordingly
 * This function is designed for webhook handling
 */
export async function processPaymentIntentEvent(
  paymentIntentId: string,
  eventType: "succeeded" | "failed" | "canceled",
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; error?: string; orderId?: string }> {
  const log = createLog("Order");

  try {
    // Find order by payment intent ID
    const existingOrder = await db.query.orders.findFirst({
      where: eq(orders.paymentIntentId, paymentIntentId),
      columns: { id: true, orderNumber: true, status: true, paymentStatus: true },
    });

    if (!existingOrder) {
      log.warn("No order found for payment intent", { paymentIntentId });
      return { success: false, error: "Order not found for payment intent" };
    }

    // Determine new payment status based on event type
    let newPaymentStatus: "paid" | "failed" | "refunded";
    let newOrderStatus: "confirmed" | "cancelled" | "failed";
    let reason: string;

    switch (eventType) {
      case "succeeded":
        newPaymentStatus = "paid";
        newOrderStatus = "confirmed";
        reason = "Payment completed successfully";
        break;
      case "failed":
        newPaymentStatus = "failed";
        newOrderStatus = "failed";
        reason = "Payment failed";
        break;
      case "canceled":
        newPaymentStatus = "failed";
        newOrderStatus = "cancelled";
        reason = "Payment was canceled";
        break;
      default:
        return { success: false, error: "Invalid event type" };
    }

    // Update order status and payment status
    await db.transaction(async (tx) => {
      // Update order
      await tx
        .update(orders)
        .set({
          status: newOrderStatus,
          paymentStatus: newPaymentStatus,
          ...(newOrderStatus === "confirmed" && { confirmedAt: new Date() }),
          ...(newOrderStatus === "cancelled" && { cancelledAt: new Date() }),
          updatedAt: new Date(),
        })
        .where(eq(orders.id, existingOrder.id));

      // Create history record
      await tx.insert(orderHistory).values({
        orderId: existingOrder.id,
        userId: null, // Webhook events don't have user context
        previousStatus: existingOrder.status,
        newStatus: newOrderStatus,
        previousPaymentStatus: existingOrder.paymentStatus,
        newPaymentStatus: newPaymentStatus,
        changeReason: reason,
        changeNote: `Payment intent ${eventType}: ${paymentIntentId}`,
        metadata: {
          paymentIntentId,
          eventType,
          ...metadata,
        },
      });

      return { success: true };
    });

    log.success("Payment intent event processed", {
      paymentIntentId,
      eventType,
      orderId: existingOrder.id,
      orderNumber: existingOrder.orderNumber,
      newStatus: newOrderStatus,
      newPaymentStatus: newPaymentStatus,
    });

    return { success: true, orderId: existingOrder.id };
  } catch (error) {
    log.error("Failed to process payment intent event", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process payment intent event",
    };
  }
}
