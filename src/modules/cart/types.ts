import { Inventory, Product } from "@/server/schema";

import { ProductImage } from "../product/types";

// Cart Item interface for client-side state
export interface CartItem {
  id: string; // Cart item ID for updates
  product: Product & {
    inventory: Inventory;
    images: ProductImage[];
  };
  quantity: number;
}

// Server response types
export interface CartActionResponse {
  success: boolean;
  error?: string;
  anonymous?: boolean;
}

// Cart query result type
export interface CartQueryResult {
  product: Product;
  quantity: number;
}

// Cart summary type
export interface CartSummary {
  itemCount: number;
  total: number;
  items: CartItem[];
}
