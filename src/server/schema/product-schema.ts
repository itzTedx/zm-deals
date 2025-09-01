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

import { categories } from "./categories-schema";
import { createdAt, id, updatedAt } from "./helpers";
import { inventory } from "./inventory-schema";
import { mediaTable } from "./media-schema";
import { metaTable } from "./meta-schema";
import { reviews } from "./review-schema";

export const productStatus = pgEnum("product_status", ["draft", "published", "expired"]);

export const products = pgTable(
  "products",
  {
    id,
    title: text("title").notNull(),
    overview: text("overview"),
    description: text("description").notNull(),
    slug: text("slug").notNull().unique(),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),

    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
    deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }),
    isDeliveryFree: boolean("is_delivery_free").notNull().default(true),

    cashOnDelivery: boolean("cash_on_delivery").notNull().default(false),
    cashOnDeliveryFee: decimal("cash_on_delivery_fee", { precision: 10, scale: 2 }),

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
    // Text search indexes for better search performance
    index("products_title_search_idx").on(table.title),
    index("products_description_search_idx").on(table.description),
    index("products_overview_search_idx").on(table.overview),
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

export const comboDeals = pgTable(
  "combo_deals",
  {
    id,
    title: text("title").notNull(),
    description: text("description"),
    slug: text("slug").notNull().unique(),
    originalPrice: decimal("original_price", { precision: 10, scale: 2 }).notNull(),
    comboPrice: decimal("combo_price", { precision: 10, scale: 2 }).notNull(),
    savings: decimal("savings", { precision: 10, scale: 2 }),
    isFeatured: boolean("is_featured").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    startsAt: timestamp("starts_at", { mode: "date" }),
    endsAt: timestamp("ends_at", { mode: "date" }),
    maxQuantity: integer("max_quantity"),
    createdAt,
    updatedAt,
  },
  (table) => [
    // Indexes for better query performance
    uniqueIndex("combo_deals_slug_idx").on(table.slug),
    index("combo_deals_active_idx").on(table.isActive),
    index("combo_deals_featured_idx").on(table.isFeatured),
    index("combo_deals_price_idx").on(table.comboPrice),
    index("combo_deals_starts_at_idx").on(table.startsAt),
    index("combo_deals_ends_at_idx").on(table.endsAt),
  ]
);

export const comboDealProducts = pgTable(
  "combo_deal_products",
  {
    id,
    comboDealId: uuid("combo_deal_id").references(() => comboDeals.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    sortOrder: integer("sort_order").default(0),
    createdAt,
    updatedAt,
  },
  (table) => [
    // Indexes for better query performance
    index("combo_deal_products_combo_deal_id_idx").on(table.comboDealId),
    index("combo_deal_products_product_id_idx").on(table.productId),
    index("combo_deal_products_sort_order_idx").on(table.sortOrder),
    // Unique constraint to prevent duplicate products in same combo
    uniqueIndex("combo_deal_products_unique_idx").on(table.comboDealId, table.productId),
  ]
);

export const comboDealImages = pgTable(
  "combo_deal_images",
  {
    id,
    isFeatured: boolean("is_featured").default(false),
    sortOrder: integer("sort_order").default(0),
    comboDealId: uuid("combo_deal_id").references(() => comboDeals.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id").references(() => mediaTable.id, { onDelete: "cascade" }),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("combo_deal_images_combo_deal_id_idx").on(table.comboDealId),
    index("combo_deal_images_media_id_idx").on(table.mediaId),
    index("combo_deal_images_is_featured_idx").on(table.isFeatured),
  ]
);

// Relations
// Product relations
export const productRelation = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
    relationName: "product-category-relations",
  }),
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
  reviews: many(reviews, {
    relationName: "product-reviews-relations",
  }),
  comboDeals: many(comboDealProducts, {
    relationName: "product-combo-deal-relations",
  }),
}));

// ProductImages relations
export const productImagesRelation = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
    relationName: "product-images-relations",
  }),
  media: one(mediaTable, {
    fields: [productImages.mediaId],
    references: [mediaTable.id],
    relationName: "product-image-media-relations",
  }),
}));

// ComboDeals relations
export const comboDealsRelation = relations(comboDeals, ({ many }) => ({
  products: many(comboDealProducts, {
    relationName: "combo-deal-products-relations",
  }),
  images: many(comboDealImages, {
    relationName: "combo-deal-images-relations",
  }),
}));

// ComboDealProducts relations
export const comboDealProductsRelation = relations(comboDealProducts, ({ one }) => ({
  comboDeal: one(comboDeals, {
    fields: [comboDealProducts.comboDealId],
    references: [comboDeals.id],
    relationName: "combo-deal-products-relations",
  }),
  product: one(products, {
    fields: [comboDealProducts.productId],
    references: [products.id],
    relationName: "product-combo-deal-relations",
  }),
}));

// ComboDealImages relations
export const comboDealImagesRelation = relations(comboDealImages, ({ one }) => ({
  comboDeal: one(comboDeals, {
    fields: [comboDealImages.comboDealId],
    references: [comboDeals.id],
    relationName: "combo-deal-images-relations",
  }),
  media: one(mediaTable, {
    fields: [comboDealImages.mediaId],
    references: [mediaTable.id],
    relationName: "combo-deal-image-media-relations",
  }),
}));

// Types for better TypeScript support
export type NewProduct = typeof products.$inferInsert;
export type Product = typeof products.$inferSelect;

export type NewProductImage = typeof productImages.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;

export type NewComboDeal = typeof comboDeals.$inferInsert;
export type ComboDeal = typeof comboDeals.$inferSelect;

export type NewComboDealProduct = typeof comboDealProducts.$inferInsert;
export type ComboDealProduct = typeof comboDealProducts.$inferSelect;

export type NewComboDealImage = typeof comboDealImages.$inferInsert;
export type ComboDealImage = typeof comboDealImages.$inferSelect;
