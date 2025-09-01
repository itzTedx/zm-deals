-- Migration: Add combo deal images and cart combo support
-- Date: 2024-12-19

-- Add combo deal images table
CREATE TABLE "combo_deal_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_featured" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"combo_deal_id" uuid REFERENCES "combo_deals"("id") ON DELETE CASCADE,
	"media_id" uuid REFERENCES "media"("id") ON DELETE CASCADE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add indexes for combo deal images
CREATE INDEX "combo_deal_images_combo_deal_id_idx" ON "combo_deal_images"("combo_deal_id");
CREATE INDEX "combo_deal_images_media_id_idx" ON "combo_deal_images"("media_id");
CREATE INDEX "combo_deal_images_is_featured_idx" ON "combo_deal_images"("is_featured");

-- Add combo deal type to cart items
ALTER TABLE "cart_items" ADD COLUMN "combo_deal_id" uuid REFERENCES "combo_deals"("id") ON DELETE CASCADE;
ALTER TABLE "cart_items" ADD COLUMN "item_type" text DEFAULT 'product' CHECK (item_type IN ('product', 'combo'));

-- Add indexes for cart combo support
CREATE INDEX "cart_items_combo_deal_id_idx" ON "cart_items"("combo_deal_id");
CREATE INDEX "cart_items_item_type_idx" ON "cart_items"("item_type");

-- Add constraint to ensure either product_id or combo_deal_id is set, but not both
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_or_combo_check" 
CHECK (
    (product_id IS NOT NULL AND combo_deal_id IS NULL AND item_type = 'product') OR
    (combo_deal_id IS NOT NULL AND product_id IS NULL AND item_type = 'combo')
); 