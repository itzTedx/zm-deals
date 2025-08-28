ALTER TABLE "products" ADD COLUMN "embedding" vector(1536);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "fingerprint" text;--> statement-breakpoint
CREATE INDEX "products_embedding_cosine_idx" ON "products" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "products_embedding_l2_idx" ON "products" USING hnsw ("embedding" vector_l2_ops);--> statement-breakpoint
CREATE INDEX "products_fingerprint_trgm_idx" ON "products" USING gin ("fingerprint" gin_trgm_ops);