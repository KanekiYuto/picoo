ALTER TABLE "transaction" ADD COLUMN "payment_platform" text NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "product_id" text NOT NULL;--> statement-breakpoint
CREATE INDEX "transaction_product_id_idx" ON "transaction" USING btree ("product_id");