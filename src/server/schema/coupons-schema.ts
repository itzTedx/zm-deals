import { relations } from "drizzle-orm";
import { boolean, decimal, index, integer, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { createdAt, id, updatedAt } from "./helpers";
import { orders } from "./orders-schema";

// Discount type enum
export const discountType = pgEnum("discount_type", ["percentage", "fixed"]);

// Main coupons table
export const coupons = pgTable(
  "coupons",
  {
    id,
    code: text("code").notNull().unique(),
    discountType: discountType("discount_type").notNull(),
    discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
    minOrderAmount: decimal("min_order_amount", { precision: 10, scale: 2 }),
    maxDiscount: decimal("max_discount", { precision: 10, scale: 2 }),
    startDate: timestamp("start_date", { mode: "date" }).notNull(),
    endDate: timestamp("end_date", { mode: "date" }).notNull(),
    usageLimit: integer("usage_limit"),
    usedCount: integer("used_count").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    description: text("description"),
    stripeCouponId: text("stripe_coupon_id"),
    createdAt,
    updatedAt,
  },
  (table) => [
    // Indexes for better query performance
    uniqueIndex("coupons_code_idx").on(table.code),
    index("coupons_is_active_idx").on(table.isActive),
    index("coupons_start_date_idx").on(table.startDate),
    index("coupons_end_date_idx").on(table.endDate),
    index("coupons_created_at_idx").on(table.createdAt),
  ]
);

// Relations
export const couponRelations = relations(coupons, ({ many }) => ({
  orders: many(orders, {
    relationName: "coupon-orders-relations",
  }),
}));

// Types for better TypeScript support
export type NewCoupon = typeof coupons.$inferInsert;
export type Coupon = typeof coupons.$inferSelect;
