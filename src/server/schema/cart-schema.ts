import { relations } from "drizzle-orm";
import { boolean, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./auth-schema";
import { createdAt, id, updatedAt } from "./helpers";
import { comboDeals, products } from "./product-schema";

export const carts = pgTable(
  "carts",
  {
    id,
    isActive: boolean("is_active").notNull().default(true),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    sessionId: text("session_id"), // For anonymous carts
    createdAt,
    updatedAt,
  },
  (table) => [
    // Indexes for better query performance
    index("carts_user_id_idx").on(table.userId),
    index("carts_session_id_idx").on(table.sessionId),
    index("carts_is_active_idx").on(table.isActive),
  ]
);

export const cartItems = pgTable(
  "cart_items",
  {
    id,
    cartId: uuid("cart_id")
      .references(() => carts.id, { onDelete: "cascade" })
      .notNull(),
    quantity: integer("quantity").notNull().default(1),
    productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }),
    comboDealId: uuid("combo_deal_id").references(() => comboDeals.id, { onDelete: "cascade" }),
    itemType: text("item_type").notNull().default("product"),
    addedAt: timestamp("added_at")
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt,
  },
  (table) => [
    // Indexes for better query performance
    index("cart_items_cart_id_idx").on(table.cartId),
    index("cart_items_product_id_idx").on(table.productId),
    index("cart_items_combo_deal_id_idx").on(table.comboDealId),
    index("cart_items_item_type_idx").on(table.itemType),
    index("cart_items_added_at_idx").on(table.addedAt),
  ]
);

// Relations
export const cartRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  items: many(cartItems),
}));

export const cartItemRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
  comboDeal: one(comboDeals, {
    fields: [cartItems.comboDealId],
    references: [comboDeals.id],
  }),
}));
