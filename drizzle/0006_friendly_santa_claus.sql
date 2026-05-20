CREATE TABLE "task_record" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"consume_transaction_id" uuid NOT NULL,
	"refund_transaction_id" uuid,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"status" text DEFAULT 'IN_QUEUE' NOT NULL,
	"parameters" jsonb NOT NULL,
	"metadata" jsonb,
	"result" jsonb,
	"error_message" text,
	"completed_at" timestamp,
	"duration_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "article" CASCADE;--> statement-breakpoint
ALTER TABLE "task_record" ADD CONSTRAINT "task_record_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_record" ADD CONSTRAINT "task_record_consume_transaction_id_credit_transaction_id_fk" FOREIGN KEY ("consume_transaction_id") REFERENCES "public"."credit_transaction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_record" ADD CONSTRAINT "task_record_refund_transaction_id_credit_transaction_id_fk" FOREIGN KEY ("refund_transaction_id") REFERENCES "public"."credit_transaction"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "task_record_user_id_idx" ON "task_record" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "task_record_user_id_status_idx" ON "task_record" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "task_record_status_idx" ON "task_record" USING btree ("status");--> statement-breakpoint
CREATE INDEX "task_record_created_at_idx" ON "task_record" USING btree ("created_at");