import { SectionHeader } from "@/components/layout/section-header";

import {
  getPersonalizedRecommendations,
  getRecommendedProducts,
  getTrendingProducts,
} from "../actions/recommendations";
import { ProductCard } from "./product-card";

interface ProductRecommendationsProps {
  currentProductId?: string;
  cartProductIds?: string[];
  title?: string;
  description?: string;
  limit?: number;
  strategy?: "hybrid" | "category" | "price" | "rating" | "featured" | "personalized" | "trending";
  showHeader?: boolean;
  className?: string;
  variant?: "default" | "compact" | "horizontal";
}

export async function ProductRecommendations({
  currentProductId,
  cartProductIds = [],
  title = "You Might Also Like",
  description = "Discover more amazing deals",
  limit = 4,
  strategy = "hybrid",
  showHeader = true,
  className = "",
  variant = "default",
}: ProductRecommendationsProps) {
  // Combine current product ID with cart product IDs for exclusion
  const excludeProductIds = currentProductId ? [currentProductId, ...cartProductIds] : cartProductIds;

  let products;

  // Choose recommendation strategy
  switch (strategy) {
    case "personalized":
      products = await getPersonalizedRecommendations({ limit, excludeProductIds });
      break;
    case "trending":
      products = await getTrendingProducts({ limit, excludeProductIds });
      break;
    default:
      products = await getRecommendedProducts(cartProductIds, {
        limit,
        strategy,
        excludeProductIds,
      });
      break;
  }

  if (products.length === 0) {
    return null;
  }

  const gridClasses = {
    default: "grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    compact: "grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4",
    horizontal: "grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  const containerClasses = {
    default: "grid grid-cols-4 gap-6 pb-12",
    compact: "grid grid-cols-4 gap-4 pb-8",
    horizontal: "grid grid-cols-4 gap-6 pb-12",
  };

  return (
    <section className={`${containerClasses[variant]} ${className}`} id="product-recommendations">
      {showHeader && (
        <SectionHeader
          className="col-span-full"
          description={description}
          hasButton={false}
          title={title}
          titleClassName="text-lg md:text-xl leading-none"
        />
      )}

      <div className={`col-span-full grid ${gridClasses[variant]}`}>
        {products.map((product) => (
          <ProductCard data={product} key={product.id} />
        ))}
      </div>
    </section>
  );
}
