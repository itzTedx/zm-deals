import { InferSelectModel } from "drizzle-orm";

import { inventory, mediaTable, metaTable, productImages, products } from "@/server/schema";

// Review and Feedback Types
export interface Review {
  id: number;
  name: string;
  rating: number;
  date: Date;
  comment: string;
}

// Image Types
export interface ProductImage {
  url: string;
}

// Product Types
export interface Product {
  title: string;
  overview: string;
  slug: string;
  price: string;
  originalPrice: string;
  featuredImage: string;
  stock: number;
  endsIn: Date;
  description: string;
  images: ProductImage[];
  reviews: Review[];
  delivery?: string | null;
}

// Deal Types (extends Product with id)
export interface Deal extends Product {
  id: number;
  combo?: boolean;
}

export type ProductType = InferSelectModel<typeof products>;
export type MetaType = InferSelectModel<typeof metaTable>;
export type InventoryType = InferSelectModel<typeof inventory>;
export type MediaType = InferSelectModel<typeof mediaTable>;
export type ProductImageType = InferSelectModel<typeof productImages>;

export type ProductQueryResult = ProductType & {
  meta: MetaType | null;
  inventory: InventoryType;
  images: (ProductImageType & {
    media: MediaType | null;
  })[];
};
