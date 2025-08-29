ALTER TABLE "products" ADD COLUMN "cash_on_delivery" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "cash_on_delivery_fee" numeric(10, 2);