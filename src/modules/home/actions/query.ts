import { unstable_cache } from "next/cache";

import { and, desc, eq, gte, isNull, lte, or } from "drizzle-orm";

import { ProductCache } from "@/lib/cache/product-cache-new";
import type { ComboDealWithProducts } from "@/modules/combo-deals/types";
import type { ProductQueryResult } from "@/modules/product/types";
import { db } from "@/server/db";
import { reviews } from "@/server/schema";
import { comboDeals, products } from "@/server/schema/product-schema";

// Cache keys for home deals data
const HOME_DEALS_CACHE_KEYS = {
  // Main deals data
  homeDeals: () => "home:deals:main",

  // Individual sections with time-based keys
  lastMinuteDeals: () => `home:deals:last-minute:${getTimeBasedKey()}`,
  todayDeals: () => `home:deals:today:${getTimeBasedKey()}`,
  hotDeals: () => `home:deals:hot:${getTimeBasedKey()}`,

  // Combo deals with active status
  activeComboDeals: () => `home:deals:combo:active:${getTimeBasedKey()}`,

  // Time-based cache key generator (changes every hour for deals)
  timeBasedKey: () => getTimeBasedKey(),
} as const;

// Cache tags for Next.js cache invalidation
const HOME_DEALS_CACHE_TAGS = {
  HOME_DEALS: "home:deals",
  LAST_MINUTE_DEALS: "home:deals:last-minute",
  TODAY_DEALS: "home:deals:today",
  HOT_DEALS: "home:deals:hot",
  COMBO_DEALS: "home:deals:combo",
} as const;

// Generate time-based cache key that changes every hour
function getTimeBasedKey(): string {
  const now = new Date();
  const hour = Math.floor(now.getTime() / (60 * 60 * 1000)); // Hour timestamp
  return hour.toString();
}

// Database query functions for individual sections
export async function getAllProductsFromDatabase(): Promise<ProductQueryResult[]> {
  const now = new Date();
  const allProducts = await db.query.products.findMany({
    where: and(
      eq(products.status, "published"),
      or(isNull(products.schedule), lte(products.schedule, now)),
      or(isNull(products.endsIn), gte(products.endsIn, now))
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
    orderBy: [desc(products.createdAt)],
  });

  // Filter out products without categories and assert type
  return allProducts.filter((product) => product.category !== null).map((product) => product as ProductQueryResult);
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
              images: { with: { media: true } },
              inventory: true,
              reviews: { with: { user: true } },
              meta: true,
              category: true,
            },
          },
        },
      },
    },
    orderBy: [desc(comboDeals.createdAt)],
  });

  return comboDealsData;
}

async function getLastMinuteDeals6hFromDatabase(): Promise<ProductQueryResult[]> {
  const now = new Date();
  const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);

  const lastMinuteDeals = await db.query.products.findMany({
    where: and(eq(products.status, "published"), gte(products.endsIn, now), lte(products.endsIn, sixHoursFromNow)),
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

  // Filter out products without categories and assert type
  return lastMinuteDeals.filter((product) => product.category !== null).map((product) => product as ProductQueryResult);
}

async function getLastMinuteDeals24hFromDatabase(): Promise<ProductQueryResult[]> {
  const now = new Date();
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const todayDeals = await db.query.products.findMany({
    where: and(
      eq(products.status, "published"),
      gte(products.endsIn, now),
      lte(products.endsIn, twentyFourHoursFromNow)
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

  // Filter out products without categories and assert type
  return todayDeals.filter((product) => product.category !== null).map((product) => product as ProductQueryResult);
}

// Next.js unstable_cache implementations for home deals
const getCachedAllProducts = unstable_cache(getAllProductsFromDatabase, ["home:deals:all-products"], {
  tags: [HOME_DEALS_CACHE_TAGS.HOME_DEALS],
  revalidate: 1800, // 30 minutes
});

const getCachedActiveComboDeals = unstable_cache(getActiveComboDealsFromDatabase, ["home:deals:active-combo-deals"], {
  tags: [HOME_DEALS_CACHE_TAGS.COMBO_DEALS],
  revalidate: 300, // 5 minutes for combo deals
});

const getCachedLastMinuteDeals6h = unstable_cache(getLastMinuteDeals6hFromDatabase, ["home:deals:last-minute-6h"], {
  tags: [HOME_DEALS_CACHE_TAGS.LAST_MINUTE_DEALS],
  revalidate: 300, // 5 minutes for time-sensitive deals
});

const getCachedLastMinuteDeals24h = unstable_cache(getLastMinuteDeals24hFromDatabase, ["home:deals:last-minute-24h"], {
  tags: [HOME_DEALS_CACHE_TAGS.TODAY_DEALS],
  revalidate: 300, // 5 minutes for time-sensitive deals
});

// Optimized deals data with Next.js caching and proper typing
export async function getOptimizedDealsData(): Promise<{
  products: ProductQueryResult[];
  comboDeals: ComboDealWithProducts[];
  lastMinuteDeals: ProductQueryResult[];
  todayDeals: ProductQueryResult[];
}> {
  // Use Next.js unstable_cache for immediate caching alongside ProductCache
  const [products, comboDeals, lastMinuteDeals6h, lastMinuteDeals24h] = await Promise.all([
    getAllProductsFromDatabase(),
    getActiveComboDealsFromDatabase(),
    getLastMinuteDeals6hFromDatabase(),
    getLastMinuteDeals24hFromDatabase(),
  ]);

  return {
    products,
    comboDeals,
    lastMinuteDeals: lastMinuteDeals6h,
    todayDeals: lastMinuteDeals24h,
  };
}

// Alternative function using ProductCache for Redis + Next.js hybrid caching
export async function getHybridCachedDealsData(): Promise<{
  products: ProductQueryResult[];
  comboDeals: ComboDealWithProducts[];
  lastMinuteDeals: ProductQueryResult[];
  todayDeals: ProductQueryResult[];
}> {
  // Use existing ProductCache for hybrid Redis + Next.js caching
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

// Export cache keys and tags for external use
export { HOME_DEALS_CACHE_KEYS, HOME_DEALS_CACHE_TAGS };
