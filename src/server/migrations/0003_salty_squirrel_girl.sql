CREATE TABLE "combo_deal_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"combo_deal_id" uuid,
	"product_id" uuid,
	"quantity" integer DEFAULT 1 NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "combo_deals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"slug" text NOT NULL,
	"original_price" numeric(10, 2) NOT NULL,
	"combo_price" numeric(10, 2) NOT NULL,
	"savings" numeric(10, 2),
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"starts_at" timestamp,
	"ends_at" timestamp,
	"max_quantity" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "combo_deals_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "combo_deal_products" ADD CONSTRAINT "combo_deal_products_combo_deal_id_combo_deals_id_fk" FOREIGN KEY ("combo_deal_id") REFERENCES "public"."combo_deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "combo_deal_products" ADD CONSTRAINT "combo_deal_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "combo_deal_products_combo_deal_id_idx" ON "combo_deal_products" USING btree ("combo_deal_id");--> statement-breakpoint
CREATE INDEX "combo_deal_products_product_id_idx" ON "combo_deal_products" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "combo_deal_products_sort_order_idx" ON "combo_deal_products" USING btree ("sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "combo_deal_products_unique_idx" ON "combo_deal_products" USING btree ("combo_deal_id","product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "combo_deals_slug_idx" ON "combo_deals" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "combo_deals_active_idx" ON "combo_deals" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "combo_deals_featured_idx" ON "combo_deals" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "combo_deals_price_idx" ON "combo_deals" USING btree ("combo_price");--> statement-breakpoint
CREATE INDEX "combo_deals_starts_at_idx" ON "combo_deals" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX "combo_deals_ends_at_idx" ON "combo_deals" USING btree ("ends_at");