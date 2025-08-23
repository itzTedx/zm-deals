ALTER TABLE "media" ALTER COLUMN "url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "media" DROP COLUMN "file_name";--> statement-breakpoint
ALTER TABLE "media" DROP COLUMN "file_size";