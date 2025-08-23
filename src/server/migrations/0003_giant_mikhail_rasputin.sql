CREATE INDEX "inventory_product_id_idx" ON "inventory" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "inventory_stock_idx" ON "inventory" USING btree ("stock");--> statement-breakpoint
CREATE INDEX "inventory_out_of_stock_idx" ON "inventory" USING btree ("is_out_of_stock");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_product_id_unique" ON "inventory" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "products_status_idx" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "products_featured_idx" ON "products" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "products_price_idx" ON "products" USING btree ("price");--> statement-breakpoint
CREATE INDEX "products_ends_in_idx" ON "products" USING btree ("ends_in");--> statement-breakpoint
CREATE INDEX "products_meta_id_idx" ON "products" USING btree ("meta_id");