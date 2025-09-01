"use server";

import { and, desc, eq, gte, inArray, isNull, lte, or } from "drizzle-orm";

import { ProductCache } from "@/lib/cache/product-cache-new";
import { db } from "@/server/db";
import { comboDealImages, comboDealProducts, comboDeals } from "@/server/schema/product-schema";

import type { ComboDealTableData, ComboDealWithProducts } from "../types";

// Database query functions (these will be wrapped with caching)
async function getComboDealsFromDatabase(): Promise<ComboDealTableData[]> {
  const comboDealsData = await db.query.comboDeals.findMany({
    with: {
      products: {
        with: {
          product: {
            with: {
              images: { with: { media: true } },
              inventory: true,
              reviews: { with: { user: true } },
              meta: true,
            },
          },
        },
      },
      images: {
        with: {
          media: true,
        },
        orderBy: [comboDealImages.sortOrder],
      },
    },
    orderBy: [desc(comboDeals.createdAt)],
  });

  return comboDealsData.map((comboDeal) => ({
    id: comboDeal.id,
    title: comboDeal.title,
    slug: comboDeal.slug,
    originalPrice: comboDeal.originalPrice.toString(),
    comboPrice: comboDeal.comboPrice.toString(),
    savings: comboDeal.savings?.toString() || "0",
    isFeatured: comboDeal.isFeatured,
    isActive: comboDeal.isActive,
    startsAt: comboDeal.startsAt || undefined,
    endsAt: comboDeal.endsAt || undefined,
    maxQuantity: comboDeal.maxQuantity || undefined,
    productCount: comboDeal.products.length,
    imageCount: comboDeal.images?.length || 0,
    createdAt: comboDeal.createdAt,
    updatedAt: comboDeal.updatedAt,
  }));
}

async function getComboDealFromDatabase(id: string): Promise<ComboDealWithProducts | null> {
  const comboDeal = await db.query.comboDeals.findFirst({
    where: eq(comboDeals.id, id),
    with: {
      products: {
        with: {
          product: {
            with: {
              images: { with: { media: true } },
              inventory: true,
              reviews: { with: { user: true } },
              meta: true,
            },
          },
        },
        orderBy: [comboDealProducts.sortOrder],
      },
      images: {
        with: {
          media: true,
        },
        orderBy: [comboDealImages.sortOrder],
      },
    },
  });

  if (!comboDeal) return null;

  // Transform the database result to match the expected type
  return {
    ...comboDeal,
    images:
      comboDeal.images?.map((img) => ({
        id: img.id,
        url: img.media?.url || "",
        alt: img.media?.alt || undefined,
        isFeatured: img.isFeatured || false,
        sortOrder: img.sortOrder || 0,
        key: img.media?.key || undefined,
        width: img.media?.width || undefined,
        height: img.media?.height || undefined,
        blurData: img.media?.blurData || undefined,
      })) || [],
  };
}

async function getActiveComboDealsFromDatabase(): Promise<ComboDealWithProducts[]> {
  const now = new Date();

  const comboDealsData = await db.query.comboDeals.findMany({
    where: and(
      eq(comboDeals.isActive, true),
      or(isNull(comboDeals.startsAt), lte(comboDeals.startsAt, now)),
      or(isNull(comboDeals.endsAt), gte(comboDeals.endsAt, now))
    ),
    with: {
      products: {
        with: {
          product: {
            with: {
              images: {
                with: {
                  media: true,
                },
              },
              inventory: true,
              reviews: {
                with: {
                  user: true,
                },
              },
            },
          },
        },
        orderBy: [comboDealProducts.sortOrder],
      },
      images: {
        with: {
          media: true,
        },
        orderBy: [comboDealImages.sortOrder],
      },
    },
    orderBy: [desc(comboDeals.isFeatured), desc(comboDeals.createdAt)],
  });

  // Transform the database results to match the expected type
  return comboDealsData.map((comboDeal) => ({
    ...comboDeal,
    images:
      comboDeal.images?.map((img) => ({
        id: img.id,
        url: img.media?.url || "",
        alt: img.media?.alt || undefined,
        isFeatured: img.isFeatured || false,
        sortOrder: img.sortOrder || 0,
        key: img.media?.key || undefined,
        width: img.media?.width || undefined,
        height: img.media?.height || undefined,
        blurData: img.media?.blurData || undefined,
      })) || [],
  }));
}

async function getComboDealsByProductIdFromDatabase(comboId: string): Promise<ComboDealWithProducts[]> {
  const now = new Date();

  const comboDealsData = await db.query.comboDeals.findMany({
    where: and(
      eq(comboDeals.id, comboId),
      eq(comboDeals.isActive, true),
      or(isNull(comboDeals.startsAt), lte(comboDeals.startsAt, now)),
      or(isNull(comboDeals.endsAt), gte(comboDeals.endsAt, now))
    ),
    with: {
      products: {
        // where: eq(comboDealProducts.productId, productId),
        with: {
          product: {
            with: {
              images: {
                with: {
                  media: true,
                },
              },
              inventory: true,
              reviews: {
                with: {
                  user: true,
                },
              },
            },
          },
        },
        orderBy: [comboDealProducts.sortOrder],
      },
    },
    orderBy: [desc(comboDeals.isFeatured), desc(comboDeals.createdAt)],
  });

  // Filter out combo deals that don't actually contain the product
  return comboDealsData.filter((comboDeal) => comboDeal.products.length > 0);
}

async function getComboDealsContainingProductFromDatabase(productId: string): Promise<ComboDealWithProducts[]> {
  const now = new Date();

  // First, find all combo deal IDs that contain this product
  const comboDealIds = await db.query.comboDealProducts.findMany({
    where: eq(comboDealProducts.productId, productId),
    columns: { comboDealId: true },
  });

  if (comboDealIds.length === 0) {
    return [];
  }

  // Then fetch the full combo deal data for those IDs
  const comboDealIdsArray = comboDealIds.map((cp) => cp.comboDealId).filter((id): id is string => id !== null);

  if (comboDealIdsArray.length === 0) {
    return [];
  }

  const comboDealsData = await db.query.comboDeals.findMany({
    where: and(
      inArray(comboDeals.id, comboDealIdsArray),
      eq(comboDeals.isActive, true),
      or(isNull(comboDeals.startsAt), lte(comboDeals.startsAt, now)),
      or(isNull(comboDeals.endsAt), gte(comboDeals.endsAt, now))
    ),
    with: {
      products: {
        with: {
          product: {
            with: {
              images: {
                with: {
                  media: true,
                },
              },
              inventory: true,
              reviews: {
                with: {
                  user: true,
                },
              },
            },
          },
        },
        orderBy: [comboDealProducts.sortOrder],
      },
    },
    orderBy: [desc(comboDeals.isFeatured), desc(comboDeals.createdAt)],
  });

  return comboDealsData;
}

// Cached query functions using the unified caching system
export async function getComboDeals(): Promise<ComboDealTableData[]> {
  return ProductCache.getComboDeals(() => getComboDealsFromDatabase());
}

export async function getComboDeal(id: string): Promise<ComboDealWithProducts | null> {
  // Individual combo deals are not cached as they're accessed less frequently
  return getComboDealFromDatabase(id);
}

export async function getActiveComboDeals(): Promise<ComboDealWithProducts[]> {
  return ProductCache.getActiveComboDeals(() => getActiveComboDealsFromDatabase());
}

export async function getFeaturedComboDeals(): Promise<ComboDealWithProducts[]> {
  // Featured combo deals are a subset of active combo deals, so we can filter from cached data
  const activeComboDeals = await getActiveComboDeals();
  return activeComboDeals.filter((comboDeal) => comboDeal.isFeatured);
}

export async function getComboDealsByProductId(comboId: string): Promise<ComboDealWithProducts[]> {
  // Product-specific combo deals are not cached as they're personalized queries
  return getComboDealsByProductIdFromDatabase(comboId);
}

export async function getComboDealsContainingProduct(productId: string): Promise<ComboDealWithProducts[]> {
  // Product-specific combo deals are not cached as they're personalized queries
  return getComboDealsContainingProductFromDatabase(productId);
}
