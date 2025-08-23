import { index, integer, pgTable, text } from "drizzle-orm/pg-core";

import { createdAt, id, updatedAt } from "./helpers";

export const mediaTable = pgTable(
  "media",
  {
    id,
    url: text("url").notNull(),
    alt: text("alt"),
    fileName: text("file_name"),
    width: integer("width"),
    height: integer("height"),
    fileSize: integer("file_size"),
    blurData: text("blur_data"),
    key: text("key"),
    createdAt,
    updatedAt,
  },
  (table) => [index("media_url_idx").on(table.url), index("media_key_idx").on(table.key)]
);
