ALTER TABLE "carts" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "session_id" text;