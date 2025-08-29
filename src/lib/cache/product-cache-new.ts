import { createLog } from "@/lib/logging";

import { CACHE_CONFIG, cache } from "./core";

const log = createLog("ProductCache");

// Product-specific cache configuration
const PRODUCT_CACHE_CONFIG = {
  TTL: {
    PRODUCT: CACHE_CONFIG.TTL.LONG, // 1 hour
    PRODUCTS: CACHE_CONFIG.TTL.MEDIUM, // 30 minutes
    PRODUCT_BY_SLUG: CACHE_CONFIG.TTL.LONG, // 1 hour
    FEATURED_PRODUCTS: CACHE_CONFIG.TTL.SHORT, // 5 minutes
    LAST_MINUTE_DEALS: CACHE_CONFIG.TTL.SHORT, // 5 minutes
    SEARCH_RESULTS: CACHE_CONFIG.TTL.SHORT, // 5 minutes
    PRODUCTS_BY_CATEGORY: CACHE_CONFIG.TTL.MEDIUM, // 30 minutes
    REVIEWS: CACHE_CONFIG.TTL.MEDIUM, // 30 minutes
    REVIEW_STATS: CACHE_CONFIG.TTL.LONG, // 1 hour
  },

  REVALIDATE: {
    PRODUCT: CACHE_CONFIG.REVALIDATE.LONG, // 1 hour
    PRODUCTS: CACHE_CONFIG.REVALIDATE.MEDIUM, // 30 minutes
    PRODUCT_BY_SLUG: CACHE_CONFIG.REVALIDATE.LONG, // 1 hour
    FEATURED_PRODUCTS: CACHE_CONFIG.REVALIDATE.SHORT, // 5 minutes
    LAST_MINUTE_DEALS: CACHE_CONFIG.REVALIDATE.SHORT, // 5 minutes
    SEARCH_RESULTS: CACHE_CONFIG.REVALIDATE.SHORT, // 5 minutes
    PRODUCTS_BY_CATEGORY: CACHE_CONFIG.REVALIDATE.MEDIUM, // 30 minutes
    REVIEWS: CACHE_CONFIG.REVALIDATE.MEDIUM, // 30 minutes
    REVIEW_STATS: CACHE_CONFIG.REVALIDATE.LONG, // 1 hour
  },
} as const;

// Product cache keys
const PRODUCT_KEYS = {
  product: (id: string) => cache.keys.product(id),
  productBySlug: (slug: string) => cache.keys.productBySlug(slug),
  products: () => cache.keys.products(),
  productsByCategory: (categoryId: string) => cache.keys.productsByCategory(categoryId),
  featuredProducts: () => `${CACHE_CONFIG.PREFIXES.PRODUCTS}:featured`,
  lastMinuteDeals: () => `${CACHE_CONFIG.PREFIXES.PRODUCTS}:last-minute`,
  searchResults: (query: string) => cache.keys.search(query),
  reviews: (productId: string) => cache.keys.reviews(productId),
  reviewStats: (productId: string) => `${CACHE_CONFIG.PREFIXES.REVIEW}:stats:${productId}`,
} as const;

// Product cache tags
const PRODUCT_TAGS = {
  PRODUCT: CACHE_CONFIG.TAGS.PRODUCT,
  PRODUCTS: CACHE_CONFIG.TAGS.PRODUCTS,
  SEARCH: CACHE_CONFIG.TAGS.SEARCH,
  CATEGORY: CACHE_CONFIG.TAGS.CATEGORY,
  REVIEWS: CACHE_CONFIG.TAGS.REVIEW,
} as const;

// Product cache operations
export class ProductCache {
  // Get product by ID with hybrid caching
  static async getProduct<T>(id: string, databaseFn: () => Promise<T>): Promise<T> {
    const redisKey = PRODUCT_KEYS.product(id);
    const nextJsTag = PRODUCT_TAGS.PRODUCT;

    return cache.hybrid.get(
      redisKey,
      nextJsTag,
      databaseFn,
      PRODUCT_CACHE_CONFIG.TTL.PRODUCT,
      PRODUCT_CACHE_CONFIG.REVALIDATE.PRODUCT
    );
  }

  // Get product by slug with hybrid caching
  static async getProductBySlug<T>(slug: string, databaseFn: () => Promise<T>): Promise<T> {
    const redisKey = PRODUCT_KEYS.productBySlug(slug);
    const nextJsTag = PRODUCT_TAGS.PRODUCT;

    return cache.hybrid.get(
      redisKey,
      nextJsTag,
      databaseFn,
      PRODUCT_CACHE_CONFIG.TTL.PRODUCT_BY_SLUG,
      PRODUCT_CACHE_CONFIG.REVALIDATE.PRODUCT_BY_SLUG
    );
  }

  // Get all products with hybrid caching
  static async getProducts<T>(databaseFn: () => Promise<T>): Promise<T> {
    const redisKey = PRODUCT_KEYS.products();
    const nextJsTag = PRODUCT_TAGS.PRODUCTS;

    return cache.hybrid.get(
      redisKey,
      nextJsTag,
      databaseFn,
      PRODUCT_CACHE_CONFIG.TTL.PRODUCTS,
      PRODUCT_CACHE_CONFIG.REVALIDATE.PRODUCTS
    );
  }

  // Get products by category with hybrid caching
  static async getProductsByCategory<T>(categoryId: string, databaseFn: () => Promise<T>): Promise<T> {
    const redisKey = PRODUCT_KEYS.productsByCategory(categoryId);
    const nextJsTag = PRODUCT_TAGS.CATEGORY;

    return cache.hybrid.get(
      redisKey,
      nextJsTag,
      databaseFn,
      PRODUCT_CACHE_CONFIG.TTL.PRODUCTS_BY_CATEGORY,
      PRODUCT_CACHE_CONFIG.REVALIDATE.PRODUCTS_BY_CATEGORY
    );
  }

  // Get featured products with hybrid caching
  static async getFeaturedProducts<T>(databaseFn: () => Promise<T>): Promise<T> {
    const redisKey = PRODUCT_KEYS.featuredProducts();
    const nextJsTag = PRODUCT_TAGS.PRODUCTS;

    return cache.hybrid.get(
      redisKey,
      nextJsTag,
      databaseFn,
      PRODUCT_CACHE_CONFIG.TTL.FEATURED_PRODUCTS,
      PRODUCT_CACHE_CONFIG.REVALIDATE.FEATURED_PRODUCTS
    );
  }

  // Get last minute deals with hybrid caching
  static async getLastMinuteDeals<T>(databaseFn: () => Promise<T>): Promise<T> {
    const redisKey = PRODUCT_KEYS.lastMinuteDeals();
    const nextJsTag = PRODUCT_TAGS.PRODUCTS;

    return cache.hybrid.get(
      redisKey,
      nextJsTag,
      databaseFn,
      PRODUCT_CACHE_CONFIG.TTL.LAST_MINUTE_DEALS,
      PRODUCT_CACHE_CONFIG.REVALIDATE.LAST_MINUTE_DEALS
    );
  }

  // Get search results with hybrid caching
  static async getSearchResults<T>(query: string, databaseFn: () => Promise<T>): Promise<T> {
    const redisKey = PRODUCT_KEYS.searchResults(query);
    const nextJsTag = PRODUCT_TAGS.SEARCH;

    return cache.hybrid.get(
      redisKey,
      nextJsTag,
      databaseFn,
      PRODUCT_CACHE_CONFIG.TTL.SEARCH_RESULTS,
      PRODUCT_CACHE_CONFIG.REVALIDATE.SEARCH_RESULTS
    );
  }

  // Get product reviews with hybrid caching
  static async getProductReviews<T>(productId: string, databaseFn: () => Promise<T>): Promise<T> {
    const redisKey = PRODUCT_KEYS.reviews(productId);
    const nextJsTag = PRODUCT_TAGS.REVIEWS;

    return cache.hybrid.get(
      redisKey,
      nextJsTag,
      databaseFn,
      PRODUCT_CACHE_CONFIG.TTL.REVIEWS,
      PRODUCT_CACHE_CONFIG.REVALIDATE.REVIEWS
    );
  }

  // Get review stats with hybrid caching
  static async getReviewStats<T>(productId: string, databaseFn: () => Promise<T>): Promise<T> {
    const redisKey = PRODUCT_KEYS.reviewStats(productId);
    const nextJsTag = PRODUCT_TAGS.REVIEWS;

    return cache.hybrid.get(
      redisKey,
      nextJsTag,
      databaseFn,
      PRODUCT_CACHE_CONFIG.TTL.REVIEW_STATS,
      PRODUCT_CACHE_CONFIG.REVALIDATE.REVIEW_STATS
    );
  }

  // Invalidate product cache
  static async invalidateProduct(id: string): Promise<void> {
    const redisKey = PRODUCT_KEYS.product(id);
    const nextJsTags = [PRODUCT_TAGS.PRODUCT, PRODUCT_TAGS.PRODUCTS];

    await cache.hybrid.invalidate(redisKey, nextJsTags);
    log.info("Product cache invalidated", { id });
  }

  // Invalidate product by slug cache
  static async invalidateProductBySlug(slug: string): Promise<void> {
    const redisKey = PRODUCT_KEYS.productBySlug(slug);
    const nextJsTags = [PRODUCT_TAGS.PRODUCT, PRODUCT_TAGS.PRODUCTS];

    await cache.hybrid.invalidate(redisKey, nextJsTags);
    log.info("Product by slug cache invalidated", { slug });
  }

  // Invalidate all products cache
  static async invalidateAllProducts(): Promise<void> {
    const redisPattern = `${CACHE_CONFIG.PREFIXES.PRODUCTS}*`;
    const nextJsTags = [PRODUCT_TAGS.PRODUCTS, PRODUCT_TAGS.PRODUCT];

    await cache.hybrid.invalidatePattern(redisPattern, nextJsTags);
    log.info("All products cache invalidated");
  }

  // Invalidate products by category cache
  static async invalidateProductsByCategory(categoryId: string): Promise<void> {
    const redisKey = PRODUCT_KEYS.productsByCategory(categoryId);
    const nextJsTags = [PRODUCT_TAGS.CATEGORY, PRODUCT_TAGS.PRODUCTS];

    await cache.hybrid.invalidate(redisKey, nextJsTags);
    log.info("Products by category cache invalidated", { categoryId });
  }

  // Invalidate search cache
  static async invalidateSearchCache(): Promise<void> {
    const redisPattern = `${CACHE_CONFIG.PREFIXES.SEARCH}*`;
    const nextJsTags = [PRODUCT_TAGS.SEARCH];

    await cache.hybrid.invalidatePattern(redisPattern, nextJsTags);
    log.info("Search cache invalidated");
  }

  // Invalidate product reviews cache
  static async invalidateProductReviews(productId: string): Promise<void> {
    const redisKey = PRODUCT_KEYS.reviews(productId);
    const nextJsTags = [PRODUCT_TAGS.REVIEWS];

    await cache.hybrid.invalidate(redisKey, nextJsTags);
    log.info("Product reviews cache invalidated", { productId });
  }

  // Invalidate all product-related cache
  static async invalidateAllProductCache(): Promise<void> {
    const redisPatterns = [
      `${CACHE_CONFIG.PREFIXES.PRODUCT}*`,
      `${CACHE_CONFIG.PREFIXES.PRODUCTS}*`,
      `${CACHE_CONFIG.PREFIXES.SEARCH}*`,
      `${CACHE_CONFIG.PREFIXES.REVIEW}*`,
    ];
    const nextJsTags = [PRODUCT_TAGS.PRODUCT, PRODUCT_TAGS.PRODUCTS, PRODUCT_TAGS.SEARCH, PRODUCT_TAGS.REVIEWS];

    await Promise.all([
      ...redisPatterns.map((pattern) => cache.redis.deletePattern(pattern)),
      cache.nextjs.revalidateMultiple(nextJsTags),
    ]);

    log.info("All product-related cache invalidated");
  }

  // Set product cache directly (for manual caching)
  static async setProduct<T>(id: string, data: T): Promise<void> {
    const redisKey = PRODUCT_KEYS.product(id);
    await cache.redis.set(redisKey, data, PRODUCT_CACHE_CONFIG.TTL.PRODUCT);
  }

  // Set product by slug cache directly
  static async setProductBySlug<T>(slug: string, data: T): Promise<void> {
    const redisKey = PRODUCT_KEYS.productBySlug(slug);
    await cache.redis.set(redisKey, data, PRODUCT_CACHE_CONFIG.TTL.PRODUCT_BY_SLUG);
  }

  // Set products cache directly
  static async setProducts<T>(data: T): Promise<void> {
    const redisKey = PRODUCT_KEYS.products();
    await cache.redis.set(redisKey, data, PRODUCT_CACHE_CONFIG.TTL.PRODUCTS);
  }

  // Set search results cache directly
  static async setSearchResults<T>(query: string, data: T): Promise<void> {
    const redisKey = PRODUCT_KEYS.searchResults(query);
    await cache.redis.set(redisKey, data, PRODUCT_CACHE_CONFIG.TTL.SEARCH_RESULTS);
  }

  // Get product cache statistics
  static async getCacheStats() {
    return cache.monitor.getRedisStats();
  }

  // Get product cache performance metrics
  static async getPerformanceMetrics() {
    return cache.monitor.getPerformanceMetrics();
  }
}

// Create cached functions for Next.js built-in caching
export const createCachedProductFunction = cache.nextjs.createCachedFunction;

// Export configuration and keys for external use
export { PRODUCT_CACHE_CONFIG, PRODUCT_KEYS, PRODUCT_TAGS };
