ALTER TABLE "products" ADD COLUMN "delivery_fee" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_delivery_free" boolean DEFAULT true NOT NULL;