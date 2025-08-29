"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { getFeaturedProducts, getLastMinuteDeals, getProducts } from "@/modules/product/actions/query";
import type { ProductQueryResult } from "@/modules/product/types";

interface CachedProductListProps {
  type: "all" | "featured" | "last-minute";
  title: string;
  description?: string;
  limit?: number;
}

export function CachedProductList({ type, title, description, limit }: CachedProductListProps) {
  const [products, setProducts] = useState<ProductQueryResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true);
        setError(null);

        let productData: ProductQueryResult[] = [];

        switch (type) {
          case "all":
            productData = await getProducts();
            break;
          case "featured":
            productData = await getFeaturedProducts();
            break;
          case "last-minute":
            productData = await getLastMinuteDeals();
            break;
        }

        // Apply limit if specified
        if (limit && productData.length > limit) {
          productData = productData.slice(0, limit);
        }

        setProducts(productData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load products");
        console.error("Error loading products:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, [type, limit]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          {description && <Skeleton className="h-4 w-96" />}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: limit || 8 }).map((_, i) => (
            <Card className="overflow-hidden" key={i}>
              <Skeleton className="h-48 w-full" />
              <CardHeader className="p-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="mb-4 text-red-600">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-600">No products found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="font-bold text-2xl">{title}</h2>
        {description && <p className="text-gray-600">{description}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: ProductQueryResult }) {
  const reviews = product.reviews || [];
  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  const isOutOfStock = product.inventory?.isOutOfStock || false;
  const isLowStock = product.inventory && product.inventory.stock < 10 && product.inventory.stock > 0;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative">
        <img
          alt={product.title}
          className="h-48 w-full object-cover"
          src={product.image || "/placeholder-product.jpg"}
        />
        {product.isFeatured && <Badge className="absolute top-2 left-2 bg-yellow-500">Featured</Badge>}
        {isOutOfStock && <Badge className="absolute top-2 right-2 bg-red-500">Out of Stock</Badge>}
        {isLowStock && <Badge className="absolute top-2 right-2 bg-orange-500">Low Stock</Badge>}
      </div>

      <CardHeader className="p-4">
        <CardTitle className="line-clamp-2 text-lg">{product.title}</CardTitle>
        <CardDescription className="line-clamp-2">{product.overview || product.description}</CardDescription>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <span className="font-bold text-2xl">${Number.parseFloat(product.price).toFixed(2)}</span>
            {product.compareAtPrice && Number.parseFloat(product.compareAtPrice) > Number.parseFloat(product.price) && (
              <span className="text-gray-500 text-sm line-through">
                ${Number.parseFloat(product.compareAtPrice).toFixed(2)}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-gray-600 text-sm">★</span>
            <span className="text-sm">{averageRating.toFixed(1)}</span>
            <span className="text-gray-500 text-sm">({reviews.length})</span>
          </div>
        </div>

        <Button className="w-full" disabled={isOutOfStock}>
          {isOutOfStock ? "Out of Stock" : "View Details"}
        </Button>
      </CardContent>
    </Card>
  );
}

// Example usage components
export function AllProductsList() {
  return (
    <CachedProductList
      description="Browse our complete collection of amazing deals"
      limit={12}
      title="All Products"
      type="all"
    />
  );
}

export function FeaturedProductsList() {
  return (
    <CachedProductList
      description="Handpicked deals you don't want to miss"
      limit={8}
      title="Featured Products"
      type="featured"
    />
  );
}

export function LastMinuteDealsList() {
  return (
    <CachedProductList
      description="Hurry! These deals are ending soon"
      limit={6}
      title="Last Minute Deals"
      type="last-minute"
    />
  );
}
