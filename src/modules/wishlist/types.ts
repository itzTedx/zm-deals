import { InferSelectModel } from "drizzle-orm";

import { wishlistItems } from "@/server/schema";

import { ProductQueryResult } from "../product/types";

export interface WishlistActionResponse {
  success: boolean;
  error?: string;
  anonymous?: boolean;
  added?: boolean;
}

// Use Drizzle's type inference for wishlist items
export type WishlistItem = InferSelectModel<typeof wishlistItems> & {
  product: ProductQueryResult;
};

export interface WishlistData {
  items: WishlistItem[];
  itemCount: number;
}
