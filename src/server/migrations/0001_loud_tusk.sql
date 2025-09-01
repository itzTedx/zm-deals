CREATE TABLE "combo_deal_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_featured" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"combo_deal_id" uuid,
	"media_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cart_items" ALTER COLUMN "product_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "cart_items" ADD COLUMN "combo_deal_id" uuid;--> statement-breakpoint
ALTER TABLE "cart_items" ADD COLUMN "item_type" text DEFAULT 'product' NOT NULL;--> statement-breakpoint
ALTER TABLE "combo_deal_images" ADD CONSTRAINT "combo_deal_images_combo_deal_id_combo_deals_id_fk" FOREIGN KEY ("combo_deal_id") REFERENCES "public"."combo_deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "combo_deal_images" ADD CONSTRAINT "combo_deal_images_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "combo_deal_images_combo_deal_id_idx" ON "combo_deal_images" USING btree ("combo_deal_id");--> statement-breakpoint
CREATE INDEX "combo_deal_images_media_id_idx" ON "combo_deal_images" USING btree ("media_id");--> statement-breakpoint
CREATE INDEX "combo_deal_images_is_featured_idx" ON "combo_deal_images" USING btree ("is_featured");--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_combo_deal_id_combo_deals_id_fk" FOREIGN KEY ("combo_deal_id") REFERENCES "public"."combo_deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cart_items_combo_deal_id_idx" ON "cart_items" USING btree ("combo_deal_id");--> statement-breakpoint
CREATE INDEX "cart_items_item_type_idx" ON "cart_items" USING btree ("item_type");