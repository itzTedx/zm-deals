CREATE TABLE "search-histories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"query" varchar(255) NOT NULL,
	"search_count" integer DEFAULT 1 NOT NULL,
	"last_searched_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "search-histories" ADD CONSTRAINT "search-histories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "searches_user_id_idx" ON "search-histories" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "searches_query_idx" ON "search-histories" USING btree ("query");--> statement-breakpoint
CREATE INDEX "searches_search_count_idx" ON "search-histories" USING btree ("search_count");--> statement-breakpoint
CREATE INDEX "searches_last_searched_at_idx" ON "search-histories" USING btree ("last_searched_at");--> statement-breakpoint
CREATE INDEX "searches_created_at_idx" ON "search-histories" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "searches_user_last_searched_idx" ON "search-histories" USING btree ("user_id","last_searched_at");