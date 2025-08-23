import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { createdAt, id, updatedAt } from "./helpers";
import { inventory } from "./inventory-schema";
import { mediaTable } from "./media-schema";
import { metaTable } from "./meta-schema";

export const productStatus = pgEnum("product_status", ["draft", "published", "expired"]);

export const products = pgTable(
  "products",
  {
    id,
    title: text("title").notNull(),
    overview: text("overview"),
    description: text("description").notNull(),
    slug: text("slug").notNull().unique(),

    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
    image: text("image").notNull(),

    isFeatured: boolean("is_featured").notNull().default(false),
    endsIn: timestamp("ends_in", { mode: "date" }),
    schedule: timestamp("schedule", { mode: "date" }),

    status: productStatus("status").notNull().default("draft"),

    metaId: uuid("meta_id").references(() => metaTable.id),

    createdAt,
    updatedAt,
  },
  (table) => [
    // Indexes for better query performance
    uniqueIndex("products_slug_idx").on(table.slug),
    index("products_status_idx").on(table.status),
    index("products_featured_idx").on(table.isFeatured),
    index("products_price_idx").on(table.price),
    index("products_ends_in_idx").on(table.endsIn),
    index("products_meta_id_idx").on(table.metaId),
  ]
);

export const productImages = pgTable(
  "product_images",
  {
    id,
    isFeatured: boolean("is_featured").default(false),
    sortOrder: integer("sort_order").default(0),

    productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id").references(() => mediaTable.id, { onDelete: "cascade" }),

    createdAt,
    updatedAt,
  },
  (table) => [
    index("product_images_product_id_idx").on(table.productId),
    index("product_images_media_id_idx").on(table.mediaId),
    index("product_images_is_featured_idx").on(table.isFeatured),
  ]
);

// Relations
export const productRelation = relations(products, ({ one, many }) => ({
  meta: one(metaTable, {
    fields: [products.metaId],
    references: [metaTable.id],
    relationName: "product-meta-relations",
  }),
  inventory: one(inventory, {
    fields: [products.id],
    references: [inventory.productId],
    relationName: "product-inventory-relations",
  }),
  images: many(productImages, {
    relationName: "product-images-relations",
  }),
}));

// Types for better TypeScript support
export type NewProduct = typeof products.$inferInsert;
export type Product = typeof products.$inferSelect;
