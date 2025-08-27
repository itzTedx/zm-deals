import { Product } from "@/server/schema";

// Cart Item interface for client-side state
export interface CartItem {
  product: Product;
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
