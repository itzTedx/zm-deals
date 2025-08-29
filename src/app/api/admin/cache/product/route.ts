import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth/server";
import {
  getProductCacheStats,
  invalidateAllProductRelatedCache,
  invalidateAllSearchCache,
  invalidateCacheByPattern,
  invalidateCacheByType,
  invalidateCategoryRelatedCache,
  invalidateProductRelatedCache,
} from "@/lib/cache/cache-invalidator";
import { advancedSearchProducts, getProduct, getProductBySlug, searchProducts } from "@/modules/product/actions/query";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    // Check if user is authenticated and has admin privileges
    if (!session?.user || !session.user.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "stats": {
        const stats = await getProductCacheStats();
        return NextResponse.json(stats);
      }

      default: {
        // Return general cache stats by default
        const defaultStats = await getProductCacheStats();
        return NextResponse.json(defaultStats);
      }
    }
  } catch (error) {
    console.error("Product cache management error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    // Check if user is authenticated and has admin privileges
    if (!session?.user || !session.user.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case "invalidate-product": {
        const { productId, productSlug } = params;

        if (!productId) {
          return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        await invalidateProductRelatedCache(productId, productSlug);

        return NextResponse.json({
          success: true,
          message: "Product cache invalidated successfully",
          productId,
          productSlug,
        });
      }

      case "invalidate-category": {
        const { categoryId, categorySlug } = params;

        if (!categoryId) {
          return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
        }

        await invalidateCategoryRelatedCache(categoryId, categorySlug);

        return NextResponse.json({
          success: true,
          message: "Category cache invalidated successfully",
          categoryId,
          categorySlug,
        });
      }

      case "clear-search": {
        await invalidateAllSearchCache();

        return NextResponse.json({
          success: true,
          message: "Search cache cleared successfully",
        });
      }

      case "clear-products": {
        await invalidateAllProductRelatedCache();

        return NextResponse.json({
          success: true,
          message: "Product cache cleared successfully",
        });
      }

      case "clear-by-pattern": {
        const { pattern } = params;

        if (!pattern) {
          return NextResponse.json({ error: "Pattern is required" }, { status: 400 });
        }

        await invalidateCacheByPattern(pattern);

        return NextResponse.json({
          success: true,
          message: "Cache cleared by pattern successfully",
          pattern,
        });
      }

      case "clear-by-type": {
        const { type } = params;

        if (!type) {
          return NextResponse.json({ error: "Type is required" }, { status: 400 });
        }

        await invalidateCacheByType(type);

        return NextResponse.json({
          success: true,
          message: "Cache cleared by type successfully",
          type,
        });
      }

      case "warmup": {
        const { productIds } = params;

        if (!productIds || !Array.isArray(productIds)) {
          return NextResponse.json({ error: "Product IDs array is required" }, { status: 400 });
        }

        const warmupResults = [];

        // Warm up cache for each product
        for (const productId of productIds) {
          try {
            // Try to get product by ID first
            let product = await getProduct(productId);

            if (product) {
              warmupResults.push({
                productId,
                success: true,
                type: "id",
              });
            } else {
              // Try to get product by slug if ID doesn't work
              product = await getProductBySlug(productId);

              if (product) {
                warmupResults.push({
                  productId,
                  success: true,
                  type: "slug",
                });
              } else {
                warmupResults.push({
                  productId,
                  success: false,
                  error: "Product not found",
                });
              }
            }
          } catch (error) {
            warmupResults.push({
              productId,
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }

        const successCount = warmupResults.filter((r) => r.success).length;
        const failureCount = warmupResults.length - successCount;

        return NextResponse.json({
          success: true,
          message: `Cache warmup completed: ${successCount} successful, ${failureCount} failed`,
          results: warmupResults,
          summary: {
            total: warmupResults.length,
            successful: successCount,
            failed: failureCount,
          },
        });
      }

      case "preload-search": {
        const { queries } = params;

        if (!queries || !Array.isArray(queries)) {
          return NextResponse.json({ error: "Queries array is required" }, { status: 400 });
        }

        const preloadResults = [];

        // Preload search results for each query
        for (const query of queries) {
          try {
            const results = await searchProducts(query, 20);
            preloadResults.push({
              query,
              success: true,
              resultCount: results.length,
            });
          } catch (error) {
            preloadResults.push({
              query,
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }

        const successCount = preloadResults.filter((r) => r.success).length;
        const failureCount = preloadResults.length - successCount;

        return NextResponse.json({
          success: true,
          message: `Search preload completed: ${successCount} successful, ${failureCount} failed`,
          results: preloadResults,
          summary: {
            total: preloadResults.length,
            successful: successCount,
            failed: failureCount,
          },
        });
      }

      case "preload-advanced-search": {
        const { searches } = params;

        if (!searches || !Array.isArray(searches)) {
          return NextResponse.json({ error: "Searches array is required" }, { status: 400 });
        }

        const preloadResults = [];

        // Preload advanced search results
        for (const searchParams of searches) {
          try {
            const results = await advancedSearchProducts(searchParams);
            preloadResults.push({
              searchParams,
              success: true,
              resultCount: results.length,
            });
          } catch (error) {
            preloadResults.push({
              searchParams,
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }

        const successCount = preloadResults.filter((r) => r.success).length;
        const failureCount = preloadResults.length - successCount;

        return NextResponse.json({
          success: true,
          message: `Advanced search preload completed: ${successCount} successful, ${failureCount} failed`,
          results: preloadResults,
          summary: {
            total: preloadResults.length,
            successful: successCount,
            failed: failureCount,
          },
        });
      }

      default: {
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
      }
    }
  } catch (error) {
    console.error("Product cache management error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
