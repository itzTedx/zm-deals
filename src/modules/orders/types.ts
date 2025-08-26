import { orderItems, orders } from "@/server/schema/orders-schema";

// Infer types from the database schema
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;

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
};

// Type for the getUserOrders query result
export type UserOrdersResult = {
  success: boolean;
  orders?: OrderWithItemsAndProducts[];
  error?: string;
};
