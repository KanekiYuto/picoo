CREATE TABLE "asset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"filename" text NOT NULL,
	"original_filename" text NOT NULL,
	"url" text NOT NULL,
	"type" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"width" integer,
	"height" integer,
	"duration" integer,
	"thumbnail_url" text,
	"tags" text[],
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "asset" ADD CONSTRAINT "asset_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "asset_user_id_idx" ON "asset" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "asset_user_id_created_at_idx" ON "asset" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "asset_user_id_type_idx" ON "asset" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "asset_type_idx" ON "asset" USING btree ("type");