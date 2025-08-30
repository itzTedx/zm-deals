"use server";

import { and, desc, eq, gte, isNull, lte, or, sql } from "drizzle-orm";

import { ProductCache } from "@/lib/cache/product-cache-new";
import type { ComboDealWithProducts } from "@/modules/combo-deals/types";
import type { ProductQueryResult } from "@/modules/product/types";
import { db } from "@/server/db";
import { reviews } from "@/server/schema";
import { comboDealProducts, comboDeals, products } from "@/server/schema/product-schema";

// Optimized database query functions for home page
async function getHomePageDataFromDatabase() {
  const now = new Date();
  const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Fetch all products data in a single optimized query
  const allProducts = await db.query.products.findMany({
    where: eq(products.status, "published"),
    with: {
      meta: true,
      inventory: true,
      images: {
        with: {
          media: true,
        },
      },
      category: true,
      reviews: {
        with: {
          user: true,
        },
        where: isNull(reviews.deletedAt),
      },
    },
    orderBy: [desc(products.createdAt)],
  });

  // Filter products for different sections
  const lastMinuteDeals = allProducts.filter(
    (product) => product.endsIn && product.endsIn >= now && product.endsIn <= sixHoursFromNow
  );

  const todayDeals = allProducts.filter(
    (product) => product.endsIn && product.endsIn >= now && product.endsIn <= twentyFourHoursFromNow
  );

  // Fetch active combo deals
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
                where: isNull(reviews.deletedAt),
              },
            },
          },
        },
        orderBy: [comboDealProducts.sortOrder],
      },
    },
    orderBy: [desc(comboDeals.isFeatured), desc(comboDeals.createdAt)],
  });

  return {
    products: allProducts,
    lastMinuteDeals,
    todayDeals,
    comboDeals: comboDealsData,
  };
}

// Cached query function for home page data
export async function getHomePageData() {
  return ProductCache.getProducts(() => getHomePageDataFromDatabase());
}

// Database query functions for optimized deals data
async function getAllProductsFromDatabase(): Promise<ProductQueryResult[]> {
  return await db.query.products.findMany({
    where: eq(products.status, "published"),
    with: {
      meta: true,
      inventory: true,
      images: {
        with: {
          media: true,
        },
      },
      category: true,
      reviews: {
        with: {
          user: true,
        },
        where: isNull(reviews.deletedAt),
      },
    },
    orderBy: [desc(products.createdAt)],
  });
}

async function getActiveComboDealsFromDatabase(): Promise<ComboDealWithProducts[]> {
  const now = new Date();
  return await db.query.comboDeals.findMany({
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
                where: isNull(reviews.deletedAt),
              },
            },
          },
        },
        orderBy: [comboDealProducts.sortOrder],
      },
    },
    orderBy: [desc(comboDeals.isFeatured), desc(comboDeals.createdAt)],
  });
}

async function getLastMinuteDeals6hFromDatabase(): Promise<ProductQueryResult[]> {
  const now = new Date();
  const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  return await db.query.products.findMany({
    where: and(
      eq(products.status, "published"),
      sql`${products.endsIn} IS NOT NULL`,
      lte(products.endsIn, sixHoursFromNow),
      gte(products.endsIn, now)
    ),
    with: {
      meta: true,
      inventory: true,
      images: {
        with: {
          media: true,
        },
      },
      category: true,
      reviews: {
        with: {
          user: true,
        },
        where: isNull(reviews.deletedAt),
      },
    },
    orderBy: [products.endsIn],
  });
}

async function getLastMinuteDeals24hFromDatabase(): Promise<ProductQueryResult[]> {
  const now = new Date();
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return await db.query.products.findMany({
    where: and(
      eq(products.status, "published"),
      sql`${products.endsIn} IS NOT NULL`,
      lte(products.endsIn, twentyFourHoursFromNow),
      gte(products.endsIn, now)
    ),
    with: {
      meta: true,
      inventory: true,
      images: {
        with: {
          media: true,
        },
      },
      category: true,
      reviews: {
        with: {
          user: true,
        },
        where: isNull(reviews.deletedAt),
      },
    },
    orderBy: [products.endsIn],
  });
}

// Optimized deals data with proper typing
export async function getOptimizedDealsData(): Promise<{
  products: ProductQueryResult[];
  comboDeals: ComboDealWithProducts[];
  lastMinuteDeals: ProductQueryResult[];
  todayDeals: ProductQueryResult[];
}> {
  // Use existing cached functions but execute them in parallel
  const [products, comboDeals, lastMinuteDeals6h, lastMinuteDeals24h] = await Promise.all([
    ProductCache.getProducts(() => getAllProductsFromDatabase()),
    ProductCache.getActiveComboDeals(() => getActiveComboDealsFromDatabase()),
    ProductCache.getLastMinuteDeals(() => getLastMinuteDeals6hFromDatabase()),
    ProductCache.getLastMinuteDeals(() => getLastMinuteDeals24hFromDatabase()),
  ]);

  return {
    products,
    comboDeals,
    lastMinuteDeals: lastMinuteDeals6h,
    todayDeals: lastMinuteDeals24h,
  };
}
