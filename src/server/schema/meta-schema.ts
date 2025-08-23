import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const metaTable = pgTable("seo_meta", {
  id: uuid("id").primaryKey().defaultRandom(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),

  createdAt: timestamp("created_at").$defaultFn(() => /* @__PURE__ */ new Date()),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
