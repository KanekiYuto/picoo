CREATE TABLE "article" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"cover_storage_id" uuid,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "article" ADD CONSTRAINT "article_cover_storage_id_storage_id_fk" FOREIGN KEY ("cover_storage_id") REFERENCES "public"."storage"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "article_cover_storage_id_idx" ON "article" USING btree ("cover_storage_id");--> statement-breakpoint
CREATE INDEX "article_deleted_at_idx" ON "article" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "article_created_at_idx" ON "article" USING btree ("created_at" DESC NULLS LAST);