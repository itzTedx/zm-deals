import { relations } from "drizzle-orm";
import { index, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { User, users } from "./auth-schema";
import { createdAt, deletedAt, id, updatedAt } from "./helpers";
import { products } from "./product-schema";

export const reviews = pgTable(
  "reviews",
  {
    id,
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt,
    updatedAt,
    deletedAt,
  },
  (table) => [
    // Indexes for better query performance
    index("reviews_product_id_idx").on(table.productId),
    index("reviews_user_id_idx").on(table.userId),
    index("reviews_rating_idx").on(table.rating),
    index("reviews_created_at_idx").on(table.createdAt),
  ]
);

// Relations
export const reviewRelation = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
    relationName: "product-reviews-relations",
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
    relationName: "user-reviews-relations",
  }),
}));

// Types for better TypeScript support
export type NewReview = typeof reviews.$inferInsert;
export type Review = typeof reviews.$inferSelect & {
  user: User;
};
