CREATE TABLE "credit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"transaction_id" uuid,
	"type" text NOT NULL,
	"amount" integer DEFAULT 0 NOT NULL,
	"consumed" integer DEFAULT 0 NOT NULL,
	"issued_at" timestamp NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_transaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"credit_id" uuid NOT NULL,
	"type" text NOT NULL,
	"amount" integer NOT NULL,
	"balance_before" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"related_transaction_id" uuid,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"payment_platform" text NOT NULL,
	"payment_subscription_id" text NOT NULL,
	"payment_customer_id" text,
	"plan_type" text NOT NULL,
	"next_plan_type" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"started_at" timestamp,
	"expires_at" timestamp,
	"next_billing_at" timestamp,
	"canceled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_payment_subscription_id_unique" UNIQUE("payment_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "transaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"subscription_id" uuid,
	"payment_transaction_id" text NOT NULL,
	"type" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transaction_payment_transaction_id_unique" UNIQUE("payment_transaction_id")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "credit" ADD CONSTRAINT "credit_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit" ADD CONSTRAINT "credit_transaction_id_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transaction" ADD CONSTRAINT "credit_transaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transaction" ADD CONSTRAINT "credit_transaction_credit_id_credit_id_fk" FOREIGN KEY ("credit_id") REFERENCES "public"."credit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_subscription_id_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscription"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "credit_user_id_idx" ON "credit" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "credit_user_id_expires_at_idx" ON "credit" USING btree ("user_id","expires_at");--> statement-breakpoint
CREATE INDEX "credit_user_id_type_idx" ON "credit" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "credit_type_idx" ON "credit" USING btree ("type");--> statement-breakpoint
CREATE INDEX "credit_transaction_id_idx" ON "credit" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "credit_transaction_user_id_idx" ON "credit_transaction" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "credit_transaction_user_id_created_at_idx" ON "credit_transaction" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "credit_transaction_user_id_type_idx" ON "credit_transaction" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "credit_transaction_credit_id_idx" ON "credit_transaction" USING btree ("credit_id");--> statement-breakpoint
CREATE INDEX "credit_transaction_type_idx" ON "credit_transaction" USING btree ("type");--> statement-breakpoint
CREATE INDEX "credit_transaction_related_transaction_id_idx" ON "credit_transaction" USING btree ("related_transaction_id");--> statement-breakpoint
CREATE INDEX "subscription_user_id_idx" ON "subscription" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscription_user_id_status_idx" ON "subscription" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "subscription_user_id_plan_type_idx" ON "subscription" USING btree ("user_id","plan_type");--> statement-breakpoint
CREATE INDEX "subscription_payment_customer_id_idx" ON "subscription" USING btree ("payment_customer_id");--> statement-breakpoint
CREATE INDEX "subscription_next_billing_at_idx" ON "subscription" USING btree ("next_billing_at");--> statement-breakpoint
CREATE INDEX "subscription_status_next_billing_at_idx" ON "subscription" USING btree ("status","next_billing_at");--> statement-breakpoint
CREATE INDEX "subscription_status_idx" ON "subscription" USING btree ("status");--> statement-breakpoint
CREATE INDEX "subscription_expires_at_idx" ON "subscription" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "transaction_user_id_idx" ON "transaction" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transaction_user_id_created_at_idx" ON "transaction" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "transaction_user_id_type_idx" ON "transaction" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "transaction_subscription_id_idx" ON "transaction" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "transaction_type_idx" ON "transaction" USING btree ("type");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_created_at_idx" ON "user" USING btree ("created_at");