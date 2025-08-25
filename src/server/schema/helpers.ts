import { timestamp, uuid } from "drizzle-orm/pg-core";

export const id = uuid("id").primaryKey().defaultRandom().notNull();

export const createdAt = timestamp("created_at", { mode: "date" }).defaultNow().notNull();

export const deletedAt = timestamp("deleted_at", { mode: "date" });

export const updatedAt = timestamp("updated_at", { mode: "date" })
  .defaultNow()
  .$onUpdate(() => new Date())
  .notNull();
