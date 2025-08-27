import { orderItems, orders } from "@/server/schema/orders-schema";

// Infer types from the database schema
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;

// Address type matching the database schema
export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

// Import types from schema (Zod-inferred)
export type { CreateOrderData, OrderItemInput, RawAddress } from "./schema";

// Order creation response interface
export interface CreateOrderResponse {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  error?: string;
  alreadyExists?: boolean;
}

// Type for orders with items relation
export type OrderWithItems = Order & {
  items: OrderItem[];
};

// Type for orders with items and product details
export type OrderWithItemsAndProducts = Order & {
  items: (OrderItem & {
    product: {
      id: string;
      title: string;
      slug: string;
      image: string;
    };
  })[];
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
};

// Type for the getUserOrders query result
export type UserOrdersResult = {
  success: boolean;
  orders?: OrderWithItemsAndProducts[];
  error?: string;
};
