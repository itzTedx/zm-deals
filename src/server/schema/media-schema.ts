import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { index, integer, pgTable, text } from "drizzle-orm/pg-core";

import { createdAt, id, updatedAt } from "./helpers";
import { productImages } from "./product-schema";

export const mediaTable = pgTable(
  "media",
  {
    id,
    url: text("url"),
    alt: text("alt"),
    width: integer("width"),
    height: integer("height"),
    blurData: text("blur_data"),
    key: text("key"),
    createdAt,
    updatedAt,
  },
  (table) => [index("media_url_idx").on(table.url), index("media_key_idx").on(table.key)]
);

export const mediaRelation = relations(mediaTable, ({ many }) => ({
  productImages: many(productImages, {
    relationName: "product-image-media-relations",
  }),
}));

export type InsertMedia = InferInsertModel<typeof mediaTable>;
export type Media = InferSelectModel<typeof mediaTable>;
