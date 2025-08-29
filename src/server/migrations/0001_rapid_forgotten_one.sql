CREATE INDEX "products_title_search_idx" ON "products" USING btree ("title");--> statement-breakpoint
CREATE INDEX "products_description_search_idx" ON "products" USING btree ("description");--> statement-breakpoint
CREATE INDEX "products_overview_search_idx" ON "products" USING btree ("overview");