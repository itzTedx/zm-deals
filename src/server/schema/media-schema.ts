import { index, integer, pgTable, text } from "drizzle-orm/pg-core";

import { createdAt, id, updatedAt } from "./helpers";

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
