import { relations, sql } from "drizzle-orm";
import { boolean, index, integer, pgTable, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { createdAt, id, updatedAt } from "./helpers";
import { products } from "./product-schema";

export const inventory = pgTable(
  "inventory",
  {
    id,
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),

    stock: integer("stock").notNull().default(0),
    initialStock: integer("initial_stock").notNull().default(0),
    isOutOfStock: boolean("is_out_of_stock").notNull().default(false),

    createdAt,
    updatedAt,
  },
  (table) => [
    // Indexes for better query performance
    index("inventory_product_id_idx").on(table.productId),
    index("inventory_stock_idx").on(table.stock),
    index("inventory_out_of_stock_idx").on(table.isOutOfStock),

    // Unique constraint to ensure one inventory per product
    uniqueIndex("inventory_product_id_unique").on(table.productId),
  ]
);

// Relations
export const inventoryProductRelation = relations(inventory, ({ one }) => ({
  product: one(products, {
    fields: [inventory.productId],
    references: [products.id],
    relationName: "inventory-product-relation",
  }),
}));

// Helper function to check if product is in stock
export const isInStock = sql<boolean>`
  CASE 
    WHEN ${inventory.stock} > 0 AND ${inventory.isOutOfStock} = false THEN true
    ELSE false
  END
`;

// Helper function to get low stock products (less than 10 items)
export const lowStockProducts = sql<boolean>`
  ${inventory.stock} < 10 AND ${inventory.stock} > 0
`;

// Type for inventory insertions
export type NewInventory = typeof inventory.$inferInsert;

// Type for inventory selections
export type Inventory = typeof inventory.$inferSelect;
