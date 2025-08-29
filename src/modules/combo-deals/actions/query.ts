"use server";

import { and, desc, eq, gte, isNull, lte, or } from "drizzle-orm";

import { db } from "@/server/db";
import { comboDealProducts, comboDeals } from "@/server/schema/product-schema";

import type { ComboDealTableData, ComboDealWithProducts } from "../types";

export async function getComboDeals(): Promise<ComboDealTableData[]> {
  const comboDealsData = await db.query.comboDeals.findMany({
    with: {
      products: {
        with: {
          product: {
            columns: {
              id: true,
              title: true,
              slug: true,
              image: true,
              price: true,
            },
          },
        },
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
    createdAt: comboDeal.createdAt,
    updatedAt: comboDeal.updatedAt,
  }));
}

export async function getComboDeal(id: string): Promise<ComboDealWithProducts | null> {
  if (id === "create") return null;

  const comboDeal = await db.query.comboDeals.findFirst({
    where: eq(comboDeals.id, id),
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
  });

  return comboDeal || null;
}

export async function getActiveComboDeals(): Promise<ComboDealWithProducts[]> {
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
    },
    orderBy: [desc(comboDeals.isFeatured), desc(comboDeals.createdAt)],
  });

  return comboDealsData;
}

export async function getFeaturedComboDeals(): Promise<ComboDealWithProducts[]> {
  const comboDealsData = await db.query.comboDeals.findMany({
    where: and(eq(comboDeals.isActive, true), eq(comboDeals.isFeatured, true)),
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
    orderBy: [desc(comboDeals.createdAt)],
  });

  return comboDealsData;
}

export async function getComboDealsByProductId(productId: string): Promise<ComboDealWithProducts[]> {
  const now = new Date();

  const comboDealsData = await db.query.comboDeals.findMany({
    where: and(
      eq(comboDeals.isActive, true),
      or(isNull(comboDeals.startsAt), lte(comboDeals.startsAt, now)),
      or(isNull(comboDeals.endsAt), gte(comboDeals.endsAt, now))
    ),
    with: {
      products: {
        where: eq(comboDealProducts.productId, productId),
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
