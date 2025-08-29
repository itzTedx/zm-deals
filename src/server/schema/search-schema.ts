import { relations } from "drizzle-orm";
import { index, integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { users } from "./auth-schema";
import { createdAt, id } from "./helpers";

export const searches = pgTable(
  "search-histories",
  {
    id,
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }), // nullable for guest searches
    query: varchar("query", { length: 255 }).notNull().unique(),

    // tracking popularity
    searchCount: integer("search_count").default(1).notNull(),

    // timeline
    lastSearchedAt: timestamp("last_searched_at").defaultNow().notNull(),
    createdAt,
  },
  (table) => [
    // Indexes for better query performance
    index("searches_user_id_idx").on(table.userId),
    index("searches_query_idx").on(table.query),
    index("searches_search_count_idx").on(table.searchCount),
    index("searches_last_searched_at_idx").on(table.lastSearchedAt),
    index("searches_created_at_idx").on(table.createdAt),
    // Composite index for user-based queries with date sorting
    index("searches_user_last_searched_idx").on(table.userId, table.lastSearchedAt),
  ]
);

// Relations
export const searchRelations = relations(searches, ({ one }) => ({
  user: one(users, {
    fields: [searches.userId],
    references: [users.id],
    relationName: "user-search-relations",
  }),
}));

// Types for better TypeScript support
export type NewSearch = typeof searches.$inferInsert;
export type Search = typeof searches.$inferSelect;
