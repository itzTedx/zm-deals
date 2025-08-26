"use server";

import { headers } from "next/headers";

import { eq, inArray } from "drizzle-orm";

import { auth } from "@/lib/auth/server";
import { createLog } from "@/lib/logging";
import { formatAddress, generateOrderNumber, validateOrderData } from "@/lib/utils/order";
import { db } from "@/server/db";
import { orderHistory, orderItems, orders } from "@/server/schema/orders-schema";
import { products } from "@/server/schema/product-schema";

interface CreateOrderData {
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  customerEmail: string;
  customerPhone?: string;
  customerNote?: string;
  shippingAddress?: any;
  billingAddress?: any;
  paymentIntentId?: string;
  sessionId?: string;
}

interface CreateOrderResponse {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  error?: string;
}

/**
 * Creates a new order in the database
 */
export async function createOrder(data: CreateOrderData): Promise<CreateOrderResponse> {
  const log = createLog("Order");

  log.info("Starting order creation process");

  try {
    // Validate order data
    const validation = validateOrderData(data);
    if (!validation.isValid) {
      log.error("Order validation failed", validation.error);
      return { success: false, error: validation.error };
    }

    // Get user session if available
    let userId: string | undefined;
    try {
      const session = await auth.api.getSession({ headers: await headers() });
      userId = session?.user?.id;
    } catch (error) {
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
          subtotal: data.subtotal,
          taxAmount: data.taxAmount,
          shippingAmount: data.shippingAmount,
          totalAmount: data.total,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          customerNote: data.customerNote,
          shippingAddress: data.shippingAddress ? formatAddress(data.shippingAddress) : null,
          billingAddress: data.billingAddress ? formatAddress(data.billingAddress) : null,
        })
        .returning({ id: orders.id, orderNumber: orders.orderNumber });

      log.success("Order created", { orderId: newOrder.id, orderNumber: newOrder.orderNumber });

      // Create order items
      const orderItemsData = data.items.map((item, index) => {
        const product = productDetails[index];
        return {
          orderId: newOrder.id,
          productId: item.productId,
          productTitle: product.title,
          productSlug: product.slug,
          productImage: product.image,
          unitPrice: item.price,
          quantity: item.quantity,
          totalPrice: item.price * item.quantity,
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
        changeNote: "Order created from checkout session",
        metadata: {
          sessionId: data.sessionId,
          paymentIntentId: data.paymentIntentId,
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
    });

    return {
      success: true,
      orderId: result.id,
      orderNumber: result.orderNumber,
    };
  } catch (error) {
    log.error("Order creation failed", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create order",
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
        changeNote: note,
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
          paymentIntentId,
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
