import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./auth-schema";
import { createdAt, id, updatedAt } from "./helpers";
import { products } from "./product-schema";

export const recentlyViewed = pgTable(
  "recently_viewed",
  {
    id,
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    sessionId: text("session_id"), // For anonymous users
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    viewedAt: timestamp("viewed_at")
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [
    // Indexes for better query performance
    index("recently_viewed_user_id_idx").on(table.userId),
    index("recently_viewed_session_id_idx").on(table.sessionId),
    index("recently_viewed_product_id_idx").on(table.productId),
    index("recently_viewed_viewed_at_idx").on(table.viewedAt),
    // Composite index for efficient user-based queries
    index("recently_viewed_user_viewed_at_idx").on(table.userId, table.viewedAt),
    // Composite index for session-based queries
    index("recently_viewed_session_viewed_at_idx").on(table.sessionId, table.viewedAt),
  ]
);

// Relations
export const recentlyViewedRelations = relations(recentlyViewed, ({ one }) => ({
  user: one(users, {
    fields: [recentlyViewed.userId],
    references: [users.id],
    relationName: "user-recently-viewed-relations",
  }),
  product: one(products, {
    fields: [recentlyViewed.productId],
    references: [products.id],
    relationName: "product-recently-viewed-relations",
  }),
}));

// Types
export type NewRecentlyViewed = typeof recentlyViewed.$inferInsert;
export type RecentlyViewed = typeof recentlyViewed.$inferSelect;
