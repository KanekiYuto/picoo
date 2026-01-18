ALTER TABLE "subscription" ADD COLUMN "product_id" text NOT NULL;--> statement-breakpoint
CREATE INDEX "subscription_product_id_idx" ON "subscription" USING btree ("product_id");