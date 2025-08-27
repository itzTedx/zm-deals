import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./auth-schema";
import { createdAt, id, updatedAt } from "./helpers";
import { products } from "./product-schema";

export const wishlists = pgTable(
  "wishlists",
  {
    id,
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    sessionId: text("session_id"), // For anonymous wishlists
    createdAt,
    updatedAt,
  },
  (table) => [
    // Indexes for better query performance
    index("wishlists_user_id_idx").on(table.userId),
    index("wishlists_session_id_idx").on(table.sessionId),
  ]
);

export const wishlistItems = pgTable(
  "wishlist_items",
  {
    id,
    wishlistId: uuid("wishlist_id")
      .references(() => wishlists.id, { onDelete: "cascade" })
      .notNull(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    addedAt: timestamp("added_at")
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt,
  },
  (table) => [
    // Indexes for better query performance
    index("wishlist_items_wishlist_id_idx").on(table.wishlistId),
    index("wishlist_items_product_id_idx").on(table.productId),
    index("wishlist_items_added_at_idx").on(table.addedAt),
  ]
);

// Relations
export const wishlistRelations = relations(wishlists, ({ one, many }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  items: many(wishlistItems),
}));

export const wishlistItemRelations = relations(wishlistItems, ({ one }) => ({
  wishlist: one(wishlists, {
    fields: [wishlistItems.wishlistId],
    references: [wishlists.id],
  }),
  product: one(products, {
    fields: [wishlistItems.productId],
    references: [products.id],
  }),
}));

// Types for better TypeScript support
export type NewWishlist = typeof wishlists.$inferInsert;
export type Wishlist = typeof wishlists.$inferSelect;
export type NewWishlistItem = typeof wishlistItems.$inferInsert;
export type WishlistItem = typeof wishlistItems.$inferSelect;
