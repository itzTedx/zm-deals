import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./auth-schema";
import { createdAt, id, updatedAt } from "./helpers";
import { products } from "./product-schema";

// Order status enum
export const orderStatus = pgEnum("order_status", [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
  "failed",
]);

// Payment status enum
export const paymentStatus = pgEnum("payment_status", ["pending", "paid", "failed", "refunded", "partially_refunded"]);

// Payment method enum
export const paymentMethod = pgEnum("payment_method", ["stripe", "bank_transfer", "cash_on_delivery"]);

// Main orders table
export const orders = pgTable(
  "orders",
  {
    id,
    orderNumber: text("order_number").notNull().unique(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),

    // Order status and payment
    status: orderStatus("status").notNull().default("pending"),
    paymentStatus: paymentStatus("payment_status").notNull().default("pending"),
    paymentMethod: paymentMethod("payment_method"),
    paymentIntentId: text("payment_intent_id"),

    // Pricing
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull().default("0"),
    shippingAmount: decimal("shipping_amount", { precision: 10, scale: 2 }).notNull().default("0"),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),

    // Shipping information
    shippingAddress: jsonb("shipping_address").$type<{
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
    }>(),

    // Billing information
    billingAddress: jsonb("billing_address").$type<{
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
    }>(),

    // Customer information
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone"),
    customerNote: text("customer_note"),

    // Tracking and delivery
    trackingNumber: text("tracking_number"),
    trackingUrl: text("tracking_url"),
    deliveredAt: timestamp("delivered_at", { mode: "date" }),

    // Timestamps
    confirmedAt: timestamp("confirmed_at", { mode: "date" }),
    shippedAt: timestamp("shipped_at", { mode: "date" }),
    cancelledAt: timestamp("cancelled_at", { mode: "date" }),
    refundedAt: timestamp("refunded_at", { mode: "date" }),

    createdAt,
    updatedAt,
  },
  (table) => [
    // Indexes for better query performance
    uniqueIndex("orders_order_number_idx").on(table.orderNumber),
    index("orders_user_id_idx").on(table.userId),
    index("orders_status_idx").on(table.status),
    index("orders_payment_status_idx").on(table.paymentStatus),
    index("orders_customer_email_idx").on(table.customerEmail),
    index("orders_created_at_idx").on(table.createdAt),
  ]
);

// Order items table
export const orderItems = pgTable(
  "order_items",
  {
    id,
    orderId: uuid("order_id")
      .references(() => orders.id, { onDelete: "cascade" })
      .notNull(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "restrict" })
      .notNull(),

    // Product details at time of purchase
    productTitle: text("product_title").notNull(),
    productSlug: text("product_slug").notNull(),
    productImage: text("product_image"),

    // Pricing
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    quantity: integer("quantity").notNull().default(1),
    totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),

    createdAt,
    updatedAt,
  },
  (table) => [
    index("order_items_order_id_idx").on(table.orderId),
    index("order_items_product_id_idx").on(table.productId),
  ]
);

// Order history/audit log
export const orderHistory = pgTable(
  "order_history",
  {
    id,
    orderId: uuid("order_id")
      .references(() => orders.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),

    // Change details
    previousStatus: orderStatus("previous_status"),
    newStatus: orderStatus("new_status").notNull(),
    previousPaymentStatus: paymentStatus("previous_payment_status"),
    newPaymentStatus: paymentStatus("new_payment_status"),

    // Change metadata
    changeReason: text("change_reason"),
    changeNote: text("change_note"),
    metadata: jsonb("metadata").$type<Record<string, string | number | boolean>>(),

    createdAt,
  },
  (table) => [
    index("order_history_order_id_idx").on(table.orderId),
    index("order_history_user_id_idx").on(table.userId),
    index("order_history_created_at_idx").on(table.createdAt),
  ]
);

// Refunds table
export const refunds = pgTable(
  "refunds",
  {
    id,
    orderId: uuid("order_id")
      .references(() => orders.id, { onDelete: "cascade" })
      .notNull(),
    orderItemId: uuid("order_item_id").references(() => orderItems.id, { onDelete: "cascade" }),

    // Refund details
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    reason: text("reason").notNull(),
    refundMethod: paymentMethod("refund_method"),
    refundTransactionId: text("refund_transaction_id"),

    // Refund status
    isProcessed: boolean("is_processed").notNull().default(false),
    processedAt: timestamp("processed_at", { mode: "date" }),

    // Admin notes
    adminNote: text("admin_note"),

    createdAt,
    updatedAt,
  },
  (table) => [
    index("refunds_order_id_idx").on(table.orderId),
    index("refunds_order_item_id_idx").on(table.orderItemId),
    index("refunds_is_processed_idx").on(table.isProcessed),
  ]
);

// Relations

// Order relations
export const orderRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
    relationName: "order-user-relations",
  }),
  items: many(orderItems, {
    relationName: "order-items-relations",
  }),
  history: many(orderHistory, {
    relationName: "order-history-relations",
  }),
  refunds: many(refunds, {
    relationName: "order-refunds-relations",
  }),
}));

// OrderItem relations
export const orderItemRelations = relations(orderItems, ({ one, many }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
    relationName: "order-items-relations",
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
    relationName: "order-item-product-relations",
  }),
  refunds: many(refunds, {
    relationName: "order-item-refunds-relations",
  }),
}));

// OrderHistory relations
export const orderHistoryRelations = relations(orderHistory, ({ one }) => ({
  order: one(orders, {
    fields: [orderHistory.orderId],
    references: [orders.id],
    relationName: "order-history-relations",
  }),
  user: one(users, {
    fields: [orderHistory.userId],
    references: [users.id],
    relationName: "order-history-user-relations",
  }),
}));

// Refund relations
export const refundRelations = relations(refunds, ({ one }) => ({
  order: one(orders, {
    fields: [refunds.orderId],
    references: [orders.id],
    relationName: "order-refunds-relations",
  }),
  orderItem: one(orderItems, {
    fields: [refunds.orderItemId],
    references: [orderItems.id],
    relationName: "order-item-refunds-relations",
  }),
}));

// Types for better TypeScript support
export type NewOrder = typeof orders.$inferInsert;
export type Order = typeof orders.$inferSelect;

export type NewOrderItem = typeof orderItems.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;

export type NewOrderHistory = typeof orderHistory.$inferInsert;
export type OrderHistory = typeof orderHistory.$inferSelect;

export type NewRefund = typeof refunds.$inferInsert;
export type Refund = typeof refunds.$inferSelect;
