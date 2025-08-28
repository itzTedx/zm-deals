import { SectionHeader } from "@/components/layout/section-header";

import {
  getPersonalizedRecommendations,
  getRecommendedProducts,
  getTrendingProducts,
} from "../actions/recommendations";
import { ProductCard } from "./product-card";

interface RecommendedProductsProps {
  cartProductIds?: string[];
  title?: string;
  description?: string;
  limit?: number;
  strategy?: "hybrid" | "category" | "price" | "rating" | "featured" | "personalized" | "trending";
  showHeader?: boolean;
  className?: string;
}

export async function RecommendedProducts({
  cartProductIds = [],
  title = "Recommended Products",
  description = "You might also like these products",
  limit = 8,
  strategy = "hybrid",
  showHeader = true,
  className = "",
}: RecommendedProductsProps) {
  let products;

  // Choose recommendation strategy
  switch (strategy) {
    case "personalized":
      products = await getPersonalizedRecommendations({ limit });
      break;
    case "trending":
      products = await getTrendingProducts({ limit });
      break;
    default:
      products = await getRecommendedProducts(cartProductIds, {
        limit,
        strategy,
      });
      break;
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className={`grid grid-cols-4 gap-6 pb-12 ${className}`} id="recommended-products">
      {showHeader && (
        <SectionHeader
          className="col-span-full"
          description={description}
          hasButton={false}
          title={title}
          titleClassName="text-lg md:text-xl leading-none"
        />
      )}

      <div className="col-span-full grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard data={product} key={product.id} />
        ))}
      </div>
    </section>
  );
}
