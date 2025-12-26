ALTER TABLE "user" ADD COLUMN "type" text DEFAULT 'free' NOT NULL;--> statement-breakpoint
CREATE INDEX "user_type_idx" ON "user" USING btree ("type");