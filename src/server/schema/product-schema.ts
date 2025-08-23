import { relations } from "drizzle-orm";
import { boolean, decimal, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { metaTable } from "./meta-schema";

export const productStatus = pgEnum("product_status", ["draft", "published", "expired"]);

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  title: text("title").notNull(),
  overview: text("overview"),
  description: text("description").notNull(),
  slug: text("slug").notNull().unique(),

  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
  inventory: integer("inventory").notNull().default(0),
  image: text("image").notNull(),

  isFeatured: boolean("is_featured").notNull().default(false),
  endsIn: timestamp("ends_in"),
  schedule: timestamp("schedule"),

  status: productStatus("status").notNull().default("draft"),

  metaId: uuid("meta_id").references(() => metaTable.id),

  createdAt: timestamp("created_at").$defaultFn(() => /* @__PURE__ */ new Date()),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const productMetaRelation = relations(products, ({ one }) => ({
  meta: one(metaTable, {
    fields: [products.metaId],
    references: [metaTable.id],
  }),
}));
