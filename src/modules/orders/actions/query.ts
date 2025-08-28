"use server";

import { headers } from "next/headers";

import { and, desc, eq } from "drizzle-orm";

import { auth, getSession } from "@/lib/auth/server";
import { createLog } from "@/lib/logging";
import { db } from "@/server/db";
import { orderHistory, orders } from "@/server/schema/orders-schema";

import { UserOrdersResult } from "../types";

const log = createLog("Order Query");

/**
 * Get order by payment intent ID (for webhook handling)
 */
export async function getOrderByPaymentIntentId(paymentIntentId: string) {
  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.paymentIntentId, paymentIntentId),
      with: {
        items: {
          with: {
            product: {
              columns: {
                id: true,
                title: true,
                slug: true,
                image: true,
              },
            },
          },
        },
        history: {
          orderBy: [desc(orderHistory.createdAt)],
          limit: 10,
        },
      },
    });

    return { success: true, order };
  } catch (error) {
    log.error("Failed to get order by payment intent ID", error);
    return { success: false, error: "Failed to fetch order" };
  }
}

/**
 * Get order by session ID (from Stripe checkout session)
 */
export async function getOrderBySessionId(sessionId: string) {
  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.paymentIntentId, sessionId),
      with: {
        items: {
          with: {
            product: {
              columns: {
                id: true,
                title: true,
                slug: true,
                image: true,
              },
            },
          },
        },
        history: {
          orderBy: [desc(orderHistory.createdAt)],
          limit: 10,
        },
      },
    });

    return { success: true, order };
  } catch (error) {
    log.error("Failed to get order by session ID", error);
    return { success: false, error: "Failed to fetch order" };
  }
}

/**
 * Get order by order number
 */
export async function getOrderByNumber(orderNumber: string) {
  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.orderNumber, orderNumber),
      with: {
        items: {
          with: {
            product: {
              columns: {
                id: true,
                title: true,
                slug: true,
                image: true,
              },
            },
          },
        },
        history: {
          orderBy: [desc(orderHistory.createdAt)],
          limit: 10,
        },
      },
    });

    return { success: true, order };
  } catch (error) {
    log.error("Failed to get order by number", error);
    return { success: false, error: "Failed to fetch order" };
  }
}

/**
 * Get user's orders
 */
export async function getUserOrders(): Promise<UserOrdersResult> {
  try {
    const session = await getSession();

    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    const userOrders = await db.query.orders.findMany({
      where: eq(orders.userId, session.user.id),
      with: {
        items: {
          with: {
            product: {
              columns: {
                id: true,
                title: true,
                slug: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: [desc(orders.createdAt)],
    });

    return { success: true, orders: userOrders };
  } catch (error) {
    log.error("Failed to get user orders", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}

/**
 * Get order by ID (for admin or order owner)
 */
export async function getOrderById(orderId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    const order = await db.query.orders.findFirst({
      where: and(eq(orders.id, orderId), eq(orders.userId, session.user.id)),
      with: {
        items: {
          with: {
            product: {
              columns: {
                id: true,
                title: true,
                slug: true,
                image: true,
              },
            },
          },
        },
        history: {
          orderBy: [desc(orderHistory.createdAt)],
        },
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    return { success: true, order };
  } catch (error) {
    log.error("Failed to get order by ID", error);
    return { success: false, error: "Failed to fetch order" };
  }
}

/**
 * Get all orders (admin only)
 */
export async function getAllOrders() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    if (!session.user.role || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const allOrders = await db.query.orders.findMany({
      with: {
        items: {
          with: {
            product: {
              columns: {
                id: true,
                title: true,
                slug: true,
                image: true,
              },
            },
          },
        },
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: [desc(orders.createdAt)],
    });

    return { success: true, orders: allOrders };
  } catch (error) {
    log.error("Failed to get all orders", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}
