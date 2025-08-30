"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { and, eq, inArray, ne } from "drizzle-orm";
import z from "zod";

import { auth } from "@/lib/auth/server";
import { ProductCache } from "@/lib/cache/product-cache-new";
import { createLog } from "@/lib/logging";
import { db } from "@/server/db";
import { comboDealProducts, comboDeals, products } from "@/server/schema/product-schema";

import { comboDealSchema, deleteComboDealSchema, updateComboDealSchema } from "../schema";

export async function createComboDeal(rawData: unknown): Promise<{ success: boolean; message: string; id?: string }> {
  const log = createLog("ComboDeal");

  log.info("Starting combo deal creation");

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    log.warn("Unauthorized access attempt to create combo deal");
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  log.auth("Combo deal creation authorized", session.user.id);

  const { data, success, error } = comboDealSchema.safeParse(rawData);

  if (!success) {
    log.error("Combo deal data validation failed", z.prettifyError(error));
    return {
      success: false,
      message: z.prettifyError(error),
    };
  }

  log.info("Combo deal data validated successfully");

  try {
    log.db("Starting database transaction", "combo_deals");

    return await db.transaction(async (tx) => {
      // Check if combo deal exists by slug
      const existingComboDeal = await tx.query.comboDeals.findFirst({
        where: eq(comboDeals.slug, data.slug),
      });

      if (existingComboDeal) {
        log.warn("Combo deal with slug already exists", { slug: data.slug });
        return {
          success: false,
          message: "A combo deal with this slug already exists",
        };
      }

      // Validate that all products exist
      const productIds = data.products.map((p) => p.productId);
      const existingProducts = await tx.query.products.findMany({
        where: and(inArray(products.id, productIds)),
        columns: { id: true },
      });

      if (existingProducts.length !== productIds.length) {
        log.error("Some products not found", { requested: productIds.length, found: existingProducts.length });
        return {
          success: false,
          message: "Some products not found",
        };
      }

      // Calculate savings if not provided
      const calculatedSavings = data.savings ?? data.originalPrice - data.comboPrice;

      // Create combo deal
      const [newComboDeal] = await tx
        .insert(comboDeals)
        .values({
          title: data.title,
          description: data.description || null,
          slug: data.slug,
          originalPrice: data.originalPrice.toString(),
          comboPrice: data.comboPrice.toString(),
          savings: calculatedSavings.toString(),
          isFeatured: data.isFeatured,
          isActive: data.isActive,
          startsAt: data.startsAt || null,
          endsAt: data.endsAt || null,
          maxQuantity: data.maxQuantity || null,
        })
        .returning({ id: comboDeals.id });

      log.success("Combo deal created", { comboDealId: newComboDeal.id });

      // Create combo deal products
      const comboDealProductsData = data.products.map((product) => ({
        comboDealId: newComboDeal.id,
        productId: product.productId,
        quantity: product.quantity,
        sortOrder: product.sortOrder,
      }));

      await tx.insert(comboDealProducts).values(comboDealProductsData);

      log.success("Combo deal products created", { productCount: comboDealProductsData.length });

      revalidatePath("/studio/products/combo");
      revalidatePath("/deals/combo");

      // Invalidate combo deals cache
      await ProductCache.invalidateComboDeals();
      await ProductCache.invalidateActiveComboDeals();

      return {
        success: true,
        message: "Combo deal created successfully",
        id: newComboDeal.id,
      };
    });
  } catch (error) {
    log.error("Failed to create combo deal", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create combo deal",
    };
  }
}

export async function updateComboDeal(rawData: unknown): Promise<{ success: boolean; message: string }> {
  const log = createLog("ComboDeal");

  log.info("Starting combo deal update");

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    log.warn("Unauthorized access attempt to update combo deal");
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  log.auth("Combo deal update authorized", session.user.id);

  const { data, success, error } = updateComboDealSchema.safeParse(rawData);

  if (!success) {
    log.error("Combo deal data validation failed", z.prettifyError(error));
    return {
      success: false,
      message: z.prettifyError(error),
    };
  }

  log.info("Combo deal data validated successfully");

  try {
    log.db("Starting database transaction", "combo_deals");

    return await db.transaction(async (tx) => {
      // Check if combo deal exists
      const existingComboDeal = await tx.query.comboDeals.findFirst({
        where: eq(comboDeals.id, data.id),
      });

      if (!existingComboDeal) {
        log.warn("Combo deal not found", { id: data.id });
        return {
          success: false,
          message: "Combo deal not found",
        };
      }

      // Check if slug is unique (excluding current combo deal)
      const slugConflict = await tx.query.comboDeals.findFirst({
        where: and(eq(comboDeals.slug, data.slug), ne(comboDeals.id, data.id)),
      });

      if (slugConflict) {
        log.warn("Combo deal with slug already exists", { slug: data.slug });
        return {
          success: false,
          message: "A combo deal with this slug already exists",
        };
      }

      // Validate that all products exist
      const productIds = data.products.map((p) => p.productId);
      const existingProducts = await tx.query.products.findMany({
        where: and(inArray(products.id, productIds)),
        columns: { id: true },
      });

      if (existingProducts.length !== productIds.length) {
        log.error("Some products not found", { requested: productIds.length, found: existingProducts.length });
        return {
          success: false,
          message: "Some products not found",
        };
      }

      // Calculate savings if not provided
      const calculatedSavings = data.savings ?? data.originalPrice - data.comboPrice;

      // Update combo deal
      await tx
        .update(comboDeals)
        .set({
          title: data.title,
          description: data.description || null,
          slug: data.slug,
          originalPrice: data.originalPrice.toString(),
          comboPrice: data.comboPrice.toString(),
          savings: calculatedSavings.toString(),
          isFeatured: data.isFeatured,
          isActive: data.isActive,
          startsAt: data.startsAt || null,
          endsAt: data.endsAt || null,
          maxQuantity: data.maxQuantity || null,
          updatedAt: new Date(),
        })
        .where(eq(comboDeals.id, data.id));

      log.success("Combo deal updated", { comboDealId: data.id });

      // Delete existing combo deal products
      await tx.delete(comboDealProducts).where(eq(comboDealProducts.comboDealId, data.id));

      // Create new combo deal products
      const comboDealProductsData = data.products.map((product) => ({
        comboDealId: data.id,
        productId: product.productId,
        quantity: product.quantity,
        sortOrder: product.sortOrder,
      }));

      await tx.insert(comboDealProducts).values(comboDealProductsData);

      log.success("Combo deal products updated", { productCount: comboDealProductsData.length });

      revalidatePath("/studio/products/combo");
      revalidatePath("/deals/combo");

      // Invalidate combo deals cache
      await ProductCache.invalidateComboDeals();
      await ProductCache.invalidateActiveComboDeals();

      return {
        success: true,
        message: "Combo deal updated successfully",
      };
    });
  } catch (error) {
    log.error("Failed to update combo deal", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update combo deal",
    };
  }
}

export async function deleteComboDeal(rawData: unknown): Promise<{ success: boolean; message: string }> {
  const log = createLog("ComboDeal");

  log.info("Starting combo deal deletion");

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    log.warn("Unauthorized access attempt to delete combo deal");
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  log.auth("Combo deal deletion authorized", session.user.id);

  const { data, success, error } = deleteComboDealSchema.safeParse(rawData);

  if (!success) {
    log.error("Combo deal data validation failed", z.prettifyError(error));
    return {
      success: false,
      message: z.prettifyError(error),
    };
  }

  try {
    log.db("Starting database transaction", "combo_deals");

    return await db.transaction(async (tx) => {
      // Check if combo deal exists
      const existingComboDeal = await tx.query.comboDeals.findFirst({
        where: eq(comboDeals.id, data.id),
      });

      if (!existingComboDeal) {
        log.warn("Combo deal not found", { id: data.id });
        return {
          success: false,
          message: "Combo deal not found",
        };
      }

      // Delete combo deal (cascade will handle combo deal products)
      await tx.delete(comboDeals).where(eq(comboDeals.id, data.id));

      log.success("Combo deal deleted", { comboDealId: data.id });

      revalidatePath("/studio/products/combo");
      revalidatePath("/deals/combo");

      // Invalidate combo deals cache
      await ProductCache.invalidateComboDeals();
      await ProductCache.invalidateActiveComboDeals();

      return {
        success: true,
        message: "Combo deal deleted successfully",
      };
    });
  } catch (error) {
    log.error("Failed to delete combo deal", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete combo deal",
    };
  }
}

export async function toggleComboDealStatus(id: string): Promise<{ success: boolean; message: string }> {
  const log = createLog("ComboDeal");

  log.info("Starting combo deal status toggle");

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    log.warn("Unauthorized access attempt to toggle combo deal status");
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  try {
    const comboDeal = await db.query.comboDeals.findFirst({
      where: eq(comboDeals.id, id),
      columns: { id: true, isActive: true },
    });

    if (!comboDeal) {
      return {
        success: false,
        message: "Combo deal not found",
      };
    }

    await db
      .update(comboDeals)
      .set({
        isActive: !comboDeal.isActive,
        updatedAt: new Date(),
      })
      .where(eq(comboDeals.id, id));

    log.success("Combo deal status toggled", { comboDealId: id, newStatus: !comboDeal.isActive });

    revalidatePath("/studio/products/combo");
    revalidatePath("/deals/combo");

    // Invalidate combo deals cache
    await ProductCache.invalidateComboDeals();
    await ProductCache.invalidateActiveComboDeals();

    return {
      success: true,
      message: `Combo deal ${comboDeal.isActive ? "deactivated" : "activated"} successfully`,
    };
  } catch (error) {
    log.error("Failed to toggle combo deal status", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to toggle combo deal status",
    };
  }
}
