import { InferSelectModel } from "drizzle-orm";

import { Category, inventory, mediaTable, metaTable, productImages, products, Review, reviews } from "@/server/schema";

// Database Review Type
export type DatabaseReview = InferSelectModel<typeof reviews>;

// Component Review Type (for backward compatibility with existing components)

// Image Types

// Product Types
export type Product = InferSelectModel<typeof products>;
export type Inventory = InferSelectModel<typeof inventory>;
export type Media = InferSelectModel<typeof mediaTable>;
export type Meta = InferSelectModel<typeof metaTable>;
export type ProductImage = InferSelectModel<typeof productImages> & { media: Media | null };

export type ProductQueryResult = InferSelectModel<typeof products> & {
  reviews?: Review[];
  images: ProductImage[];
  meta?: Meta | null;
  inventory: Inventory;
  category: Category | null;
};

export type ProductCardDate = InferSelectModel<typeof products> & {
  reviews?: Review[];
  images: ProductImage[];
  inventory: Inventory;
};

// Deal Type (for backward compatibility)
export interface Deal {
  id: number;
  title: string;
  description: string;
  overview: string;
  price: string;
  compareAtPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  endsIn?: Date;
  schedule?: Date;
}

// Review Stats Type
export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
