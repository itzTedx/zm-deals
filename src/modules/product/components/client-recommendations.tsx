"use client";

import { Skeleton } from "@/components/ui/skeleton";

import { useRecommendations } from "../hooks/use-recommendations";
import { ProductCard } from "./product-card";

interface ClientRecommendationsProps {
  cartProductIds?: string[];
  currentProductId?: string;
  title?: string;
  description?: string;
  limit?: number;
  strategy?: "hybrid" | "category" | "price" | "rating" | "featured" | "personalized" | "trending";
  showHeader?: boolean;
  className?: string;
  variant?: "default" | "compact" | "horizontal";
}

export function ClientRecommendations({
  cartProductIds = [],
  currentProductId,
  title = "Recommended Products",
  description = "You might also like these products",
  limit = 8,
  strategy = "hybrid",
  showHeader = true,
  className = "",
  variant = "default",
}: ClientRecommendationsProps) {
  const { products, isLoading, error } = useRecommendations({
    cartProductIds,
    currentProductId,
    limit,
    strategy,
  });

  if (error) {
    return (
      <section className={`grid grid-cols-4 gap-6 pb-12 ${className}`}>
        {showHeader && (
          <div className="col-span-full">
            <h2 className="font-semibold text-lg md:text-xl">{title}</h2>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
        )}
        <div className="col-span-full py-8 text-center">
          <p className="text-muted-foreground">Unable to load recommendations</p>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className={`grid grid-cols-4 gap-6 pb-12 ${className}`}>
        {showHeader && (
          <div className="col-span-full">
            <Skeleton className="mb-2 h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        )}
        <div className="col-span-full grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div className="space-y-3" key={i}>
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  const gridClasses = {
    default: "grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    compact: "grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4",
    horizontal: "grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <section className={`grid grid-cols-4 gap-6 pb-12 ${className}`}>
      {showHeader && (
        <div className="col-span-full">
          <h2 className="font-semibold text-lg md:text-xl">{title}</h2>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      )}

      <div className={`col-span-full grid ${gridClasses[variant]}`}>
        {products.map((product) => (
          <ProductCard data={product} key={product.id} />
        ))}
      </div>
    </section>
  );
}
