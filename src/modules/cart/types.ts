import { ProductType } from "@/modules/product/types";

// Cart Item interface for client-side state
export interface CartItem {
  product: ProductType;
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
  product: ProductType;
  quantity: number;
}

// Cart summary type
export interface CartSummary {
  itemCount: number;
  total: number;
  items: CartItem[];
}
