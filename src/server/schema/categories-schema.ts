import { relations } from "drizzle-orm";
import { index, pgEnum, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { createdAt, id, updatedAt } from "./helpers";
import { mediaTable } from "./media-schema";

export const categories = pgTable(
  "categories",
  {
    id,
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    createdAt,
    updatedAt,
  },
  (table) => [uniqueIndex("categories_slug_idx").on(table.slug)]
);

export const categoryImageTypes = pgEnum("category_image_types", ["thumbnail", "banner"]);

export const categoryImages = pgTable(
  "category_images",
  {
    id,
    type: categoryImageTypes("type").notNull(),

    //relations
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id").references(() => mediaTable.id, { onDelete: "cascade" }),

    createdAt,
    updatedAt,
  },
  (table) => [
    index("category_images_category_id_idx").on(table.categoryId),
    index("category_images_media_id_idx").on(table.mediaId),
    index("category_images_type_idx").on(table.type),
  ]
);

export const categoryRelation = relations(categories, ({ one }) => ({
  images: one(categoryImages, {
    fields: [categories.id],
    references: [categoryImages.categoryId],
    relationName: "category-images-relations",
  }),
}));

export const categoryImagesRelation = relations(categoryImages, ({ one }) => ({
  category: one(categories, {
    fields: [categoryImages.categoryId],
    references: [categories.id],
    relationName: "category-images-relations",
  }),
  media: one(mediaTable, {
    fields: [categoryImages.mediaId],
    references: [mediaTable.id],
    relationName: "category-image-media-relations",
  }),
}));
