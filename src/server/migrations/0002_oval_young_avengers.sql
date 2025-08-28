CREATE TABLE "recently_viewed" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"session_id" text,
	"product_id" uuid NOT NULL,
	"viewed_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recently_viewed" ADD CONSTRAINT "recently_viewed_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "recently_viewed" ADD CONSTRAINT "recently_viewed_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "recently_viewed_user_id_idx" ON "recently_viewed" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "recently_viewed_session_id_idx" ON "recently_viewed" USING btree ("session_id");
--> statement-breakpoint
CREATE INDEX "recently_viewed_product_id_idx" ON "recently_viewed" USING btree ("product_id");
--> statement-breakpoint
CREATE INDEX "recently_viewed_viewed_at_idx" ON "recently_viewed" USING btree ("viewed_at");
--> statement-breakpoint
CREATE INDEX "recently_viewed_user_viewed_at_idx" ON "recently_viewed" USING btree ("user_id","viewed_at");
--> statement-breakpoint
CREATE INDEX "recently_viewed_session_viewed_at_idx" ON "recently_viewed" USING btree ("session_id","viewed_at");