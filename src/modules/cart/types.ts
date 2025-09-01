import { Inventory, Product } from "@/server/schema";

import { ComboDealWithProducts } from "../combo-deals/types";
import { ProductImage } from "../product/types";

// Database response type for cart items
export interface CartItemDatabaseResponse {
  id: string;
  product:
    | (Product & {
        inventory: Inventory;
        images: ProductImage[];
      })
    | null;
  comboDeal: {
    id: string;
    title: string;
    description: string | null;
    slug: string;
    isFeatured: boolean;
    isActive: boolean;
    originalPrice: string;
    comboPrice: string;
    savings: string | null;
    startsAt: Date | null;
    endsAt: Date | null;
    maxQuantity: number | null;
    createdAt: Date;
    updatedAt: Date;
    products: Array<{
      id: string;
      comboDealId: string;
      productId: string;
      quantity: number;
      sortOrder: number | null;
      createdAt: Date;
      updatedAt: Date;
      product: {
        id: string;
        title: string;
        image: string;
        price: string;
        inventory: {
          id: string;
          stock: number;
          isOutOfStock: boolean;
        } | null;
        images: Array<{
          id: string;
          media: {
            url: string | null;
            key: string | null;
          } | null;
        }>;
      } | null;
    }>;
    images: Array<{
      id: string;
      isFeatured: boolean | null;
      sortOrder: number | null;
      media: {
        url: string | null;
        key: string | null;
      } | null;
    }>;
  } | null;
  quantity: number;
  itemType: "product" | "combo";
}

// Cart Item interface for client-side state
export interface CartItem {
  id: string; // Cart item ID for updates
  product?: Product & {
    inventory: Inventory;
    images: ProductImage[];
  };
  comboDeal?: ComboDealWithProducts;
  quantity: number;
  itemType: "product" | "combo";
}

// Server response types
export interface CartActionResponse {
  success: boolean;
  error?: string;
  anonymous?: boolean;
}

// Cart query result type
export interface CartQueryResult {
  product?: Product;
  comboDeal?: ComboDealWithProducts;
  quantity: number;
  itemType: "product" | "combo";
}

// Cart summary type
export interface CartSummary {
  itemCount: number;
  total: number;
  items: CartItem[];
}
