"use server";

import { headers } from "next/headers";

import { and, eq, inArray, sql } from "drizzle-orm";

import { auth } from "@/lib/auth/server";
import { createLog } from "@/lib/logging";
import { db } from "@/server/db";
import { inventory } from "@/server/schema/inventory-schema";

const log = createLog("Inventory");

/**
 * Check if products have sufficient stock for the requested quantities
 */
export async function validateStockAvailability(items: Array<{ productId: string; quantity: number }>): Promise<{
  isValid: boolean;
  errors: Array<{ productId: string; productTitle: string; requested: number; available: number; error: string }>;
  availableItems: Array<{ productId: string; available: number }>;
}> {
  const log = createLog("Inventory Validation");

  try {
    const productIds = items.map((item) => item.productId);

    // Get current inventory levels
    const inventoryData = await db.query.inventory.findMany({
      where: inArray(inventory.productId, productIds),
      with: {
        product: {
          columns: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    const errors: Array<{
      productId: string;
      productTitle: string;
      requested: number;
      available: number;
      error: string;
    }> = [];
    const availableItems: Array<{ productId: string; available: number }> = [];

    for (const item of items) {
      const inventoryRecord = inventoryData.find((inv) => inv.productId === item.productId);

      if (!inventoryRecord) {
        errors.push({
          productId: item.productId,
          productTitle: "Unknown Product",
          requested: item.quantity,
          available: 0,
          error: "Product not found in inventory",
        });
        continue;
      }

      const available = inventoryRecord.stock;
      availableItems.push({ productId: item.productId, available });

      if (inventoryRecord.isOutOfStock) {
        errors.push({
          productId: item.productId,
          productTitle: inventoryRecord.product.title,
          requested: item.quantity,
          available: 0,
          error: "Product is out of stock",
        });
      } else if (item.quantity > available) {
        errors.push({
          productId: item.productId,
          productTitle: inventoryRecord.product.title,
          requested: item.quantity,
          available,
          error: `Insufficient stock. Only ${available} items available`,
        });
      }
    }

    const isValid = errors.length === 0;

    log.info("Stock validation completed", {
      isValid,
      itemCount: items.length,
      errorCount: errors.length,
    });

    return { isValid, errors, availableItems };
  } catch (error) {
    log.error("Stock validation failed", error);
    return {
      isValid: false,
      errors: items.map((item) => ({
        productId: item.productId,
        productTitle: "Unknown Product",
        requested: item.quantity,
        available: 0,
        error: "Failed to validate stock",
      })),
      availableItems: [],
    };
  }
}

/**
 * Reserve stock for items (decrease inventory)
 * This should be called when an order is confirmed
 */
export async function reserveStock(
  items: Array<{ productId: string; quantity: number }>,
  orderId: string
): Promise<{
  success: boolean;
  error?: string;
  reservedItems: Array<{ productId: string; quantity: number; newStock: number }>;
}> {
  const log = createLog("Inventory Reservation");

  try {
    // First validate stock availability
    const validation = await validateStockAvailability(items);
    if (!validation.isValid) {
      log.warn("Stock validation failed during reservation", { errors: validation.errors });
      return {
        success: false,
        error: "Insufficient stock for some items",
        reservedItems: [],
      };
    }

    const productIds = items.map((item) => item.productId);
    const reservedItems: Array<{ productId: string; quantity: number; newStock: number }> = [];

    // Update inventory in a transaction
    await db.transaction(async (tx) => {
      for (const item of items) {
        // Get current inventory
        const currentInventory = await tx.query.inventory.findFirst({
          where: eq(inventory.productId, item.productId),
          columns: { stock: true, isOutOfStock: true },
        });

        if (!currentInventory) {
          throw new Error(`Inventory not found for product ${item.productId}`);
        }

        if (currentInventory.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.productId}`);
        }

        const newStock = currentInventory.stock - item.quantity;
        const isOutOfStock = newStock <= 0;

        // Update inventory
        await tx
          .update(inventory)
          .set({
            stock: newStock,
            isOutOfStock,
            updatedAt: new Date(),
          })
          .where(eq(inventory.productId, item.productId));

        reservedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          newStock,
        });
      }
    });

    log.success("Stock reserved successfully", {
      orderId,
      itemCount: items.length,
      reservedItems,
    });

    return {
      success: true,
      reservedItems,
    };
  } catch (error) {
    log.error("Stock reservation failed", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reserve stock",
      reservedItems: [],
    };
  }
}

/**
 * Release reserved stock (increase inventory)
 * This should be called when an order is cancelled or payment fails
 */
export async function releaseStock(
  items: Array<{ productId: string; quantity: number }>,
  orderId: string
): Promise<{
  success: boolean;
  error?: string;
  releasedItems: Array<{ productId: string; quantity: number; newStock: number }>;
}> {
  const log = createLog("Inventory Release");

  try {
    const productIds = items.map((item) => item.productId);
    const releasedItems: Array<{ productId: string; quantity: number; newStock: number }> = [];

    // Update inventory in a transaction
    await db.transaction(async (tx) => {
      for (const item of items) {
        // Get current inventory
        const currentInventory = await tx.query.inventory.findFirst({
          where: eq(inventory.productId, item.productId),
          columns: { stock: true, isOutOfStock: true },
        });

        if (!currentInventory) {
          throw new Error(`Inventory not found for product ${item.productId}`);
        }

        const newStock = currentInventory.stock + item.quantity;
        const isOutOfStock = newStock <= 0;

        // Update inventory
        await tx
          .update(inventory)
          .set({
            stock: newStock,
            isOutOfStock,
            updatedAt: new Date(),
          })
          .where(eq(inventory.productId, item.productId));

        releasedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          newStock,
        });
      }
    });

    log.success("Stock released successfully", {
      orderId,
      itemCount: items.length,
      releasedItems,
    });

    return {
      success: true,
      releasedItems,
    };
  } catch (error) {
    log.error("Stock release failed", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to release stock",
      releasedItems: [],
    };
  }
}

/**
 * Get low stock products (less than threshold)
 */
export async function getLowStockProducts(threshold = 10): Promise<{
  success: boolean;
  products: Array<{
    productId: string;
    productTitle: string;
    currentStock: number;
    initialStock: number;
  }>;
  error?: string;
}> {
  const log = createLog("Low Stock Query");

  try {
    const lowStockProducts = await db.query.inventory.findMany({
      where: and(sql`${inventory.stock} < ${threshold}`, sql`${inventory.stock} > 0`),
      with: {
        product: {
          columns: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: inventory.stock,
    });

    const products = lowStockProducts.map((item) => ({
      productId: item.productId,
      productTitle: item.product.title,
      currentStock: item.stock,
      initialStock: item.initialStock,
    }));

    log.success("Low stock products retrieved", { count: products.length, threshold });

    return {
      success: true,
      products,
    };
  } catch (error) {
    log.error("Failed to get low stock products", error);
    return {
      success: false,
      products: [],
      error: error instanceof Error ? error.message : "Failed to get low stock products",
    };
  }
}

/**
 * Get out of stock products
 */
export async function getOutOfStockProducts(): Promise<{
  success: boolean;
  products: Array<{
    productId: string;
    productTitle: string;
    initialStock: number;
  }>;
  error?: string;
}> {
  const log = createLog("Out of Stock Query");

  try {
    const outOfStockProducts = await db.query.inventory.findMany({
      where: eq(inventory.isOutOfStock, true),
      with: {
        product: {
          columns: {
            id: true,
            title: true,
          },
        },
      },
    });

    const products = outOfStockProducts.map((item) => ({
      productId: item.productId,
      productTitle: item.product.title,
      initialStock: item.initialStock,
    }));

    log.success("Out of stock products retrieved", { count: products.length });

    return {
      success: true,
      products,
    };
  } catch (error) {
    log.error("Failed to get out of stock products", error);
    return {
      success: false,
      products: [],
      error: error instanceof Error ? error.message : "Failed to get out of stock products",
    };
  }
}

/**
 * Update inventory for a specific product
 */
export async function updateProductInventory(
  productId: string,
  newStock: number
): Promise<{ success: boolean; error?: string }> {
  const log = createLog("Inventory Update");

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const isOutOfStock = newStock <= 0;

    await db
      .update(inventory)
      .set({
        stock: newStock,
        isOutOfStock,
        updatedAt: new Date(),
      })
      .where(eq(inventory.productId, productId));

    log.success("Inventory updated", { productId, newStock, isOutOfStock });

    return { success: true };
  } catch (error) {
    log.error("Inventory update failed", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update inventory",
    };
  }
}
