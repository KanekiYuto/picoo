CREATE TABLE "media_generation_task" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"share_id" text NOT NULL,
	"user_id" text NOT NULL,
	"task_type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_request_id" text,
	"model" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"parameters" jsonb NOT NULL,
	"results" jsonb,
	"consume_transaction_id" uuid NOT NULL,
	"refund_transaction_id" uuid,
	"error_message" jsonb,
	"started_at" timestamp NOT NULL,
	"completed_at" timestamp,
	"duration_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"is_private" boolean DEFAULT false NOT NULL,
	"is_nsfw" boolean DEFAULT false NOT NULL,
	"nsfw_details" jsonb,
	CONSTRAINT "media_generation_task_task_id_unique" UNIQUE("task_id"),
	CONSTRAINT "media_generation_task_share_id_unique" UNIQUE("share_id")
);
--> statement-breakpoint
ALTER TABLE "media_generation_task" ADD CONSTRAINT "media_generation_task_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_generation_task" ADD CONSTRAINT "media_generation_task_consume_transaction_id_credit_transaction_id_fk" FOREIGN KEY ("consume_transaction_id") REFERENCES "public"."credit_transaction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_generation_task" ADD CONSTRAINT "media_generation_task_refund_transaction_id_credit_transaction_id_fk" FOREIGN KEY ("refund_transaction_id") REFERENCES "public"."credit_transaction"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "media_generation_task_user_id_idx" ON "media_generation_task" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "media_generation_task_user_id_status_idx" ON "media_generation_task" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "media_generation_task_status_idx" ON "media_generation_task" USING btree ("status");--> statement-breakpoint
CREATE INDEX "media_generation_task_is_private_deleted_at_idx" ON "media_generation_task" USING btree ("is_private","deleted_at");--> statement-breakpoint
CREATE INDEX "media_generation_task_is_nsfw_deleted_at_idx" ON "media_generation_task" USING btree ("is_nsfw","deleted_at");--> statement-breakpoint
CREATE INDEX "media_generation_task_deleted_at_idx" ON "media_generation_task" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "media_generation_task_created_at_idx" ON "media_generation_task" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "media_generation_task_task_type_idx" ON "media_generation_task" USING btree ("task_type");--> statement-breakpoint
CREATE INDEX "media_generation_task_provider_request_id_idx" ON "media_generation_task" USING btree ("provider_request_id");