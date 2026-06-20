CREATE TABLE "order_delivery" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"seller_id" text NOT NULL,
	"delivery_message" text,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"revision_count" integer DEFAULT 0 NOT NULL,
	"is_last_delivery" integer DEFAULT 0 NOT NULL,
	"delivered_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_message" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"content_json" jsonb NOT NULL,
	"is_system" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_revision" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"requested_by" text NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_order" (
	"id" text PRIMARY KEY NOT NULL,
	"buyer_id" text NOT NULL,
	"seller_id" text NOT NULL,
	"listing_id" text NOT NULL,
	"package_id" text,
	"order_number" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"requirements" text,
	"is_urgent" integer DEFAULT 0 NOT NULL,
	"cancelled_by" text,
	"cancel_reason" text,
	"cancelled_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "marketplace_order_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "marketplace_transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"buyer_id" text NOT NULL,
	"seller_id" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"gateway_reference" text,
	"gateway_response" text,
	"metadata" text,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "itrader_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"from_user_id" text NOT NULL,
	"to_user_id" text NOT NULL,
	"rating" text NOT NULL,
	"comment" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seller_trust_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"seller_id" text NOT NULL,
	"positive_feedback" integer DEFAULT 0 NOT NULL,
	"neutral_feedback" integer DEFAULT 0 NOT NULL,
	"negative_feedback" integer DEFAULT 0 NOT NULL,
	"completed_orders" integer DEFAULT 0 NOT NULL,
	"disputed_orders" integer DEFAULT 0 NOT NULL,
	"cancelled_orders" integer DEFAULT 0 NOT NULL,
	"total_revenue" integer DEFAULT 0 NOT NULL,
	"refund_rate" integer DEFAULT 0 NOT NULL,
	"response_time" integer DEFAULT 0 NOT NULL,
	"repeat_buyers" integer DEFAULT 0 NOT NULL,
	"trust_score" integer DEFAULT 0 NOT NULL,
	"last_calculated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "seller_trust_profile_seller_id_unique" UNIQUE("seller_id")
);
--> statement-breakpoint
CREATE TABLE "dispute_message" (
	"id" text PRIMARY KEY NOT NULL,
	"dispute_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"content" text NOT NULL,
	"is_mod_note" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_dispute" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"buyer_id" text NOT NULL,
	"seller_id" text NOT NULL,
	"moderator_id" text,
	"reason" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"resolution" text,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "buyer_review" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"listing_id" text NOT NULL,
	"buyer_id" text NOT NULL,
	"seller_id" text NOT NULL,
	"rating" integer NOT NULL,
	"content" text NOT NULL,
	"review_images" jsonb DEFAULT '[]'::jsonb,
	"is_verified_purchase" integer DEFAULT 1 NOT NULL,
	"is_public" integer DEFAULT 1 NOT NULL,
	"is_recommended" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "buyer_review_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
ALTER TABLE "marketplace_submission" DROP CONSTRAINT "marketplace_submission_listing_id_thread_id_fk";
--> statement-breakpoint
ALTER TABLE "marketplace_audit_log" DROP CONSTRAINT "marketplace_audit_log_listing_id_thread_id_fk";
--> statement-breakpoint
ALTER TABLE "marketplace_flag" DROP CONSTRAINT "marketplace_flag_listing_id_thread_id_fk";
--> statement-breakpoint
ALTER TABLE "featured_listing" DROP CONSTRAINT "featured_listing_listing_id_thread_id_fk";
--> statement-breakpoint
ALTER TABLE "order_delivery" ADD CONSTRAINT "order_delivery_order_id_marketplace_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."marketplace_order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_delivery" ADD CONSTRAINT "order_delivery_seller_id_user_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_message" ADD CONSTRAINT "order_message_order_id_marketplace_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."marketplace_order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_message" ADD CONSTRAINT "order_message_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_revision" ADD CONSTRAINT "order_revision_order_id_marketplace_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."marketplace_order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_revision" ADD CONSTRAINT "order_revision_requested_by_user_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_order" ADD CONSTRAINT "marketplace_order_buyer_id_user_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_order" ADD CONSTRAINT "marketplace_order_seller_id_user_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_order" ADD CONSTRAINT "marketplace_order_listing_id_marketplace_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."marketplace_listing"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_order" ADD CONSTRAINT "marketplace_order_package_id_listing_package_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."listing_package"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_order" ADD CONSTRAINT "marketplace_order_cancelled_by_user_id_fk" FOREIGN KEY ("cancelled_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_transaction" ADD CONSTRAINT "marketplace_transaction_order_id_marketplace_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."marketplace_order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_transaction" ADD CONSTRAINT "marketplace_transaction_buyer_id_user_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_transaction" ADD CONSTRAINT "marketplace_transaction_seller_id_user_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itrader_feedback" ADD CONSTRAINT "itrader_feedback_order_id_marketplace_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."marketplace_order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itrader_feedback" ADD CONSTRAINT "itrader_feedback_from_user_id_user_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itrader_feedback" ADD CONSTRAINT "itrader_feedback_to_user_id_user_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seller_trust_profile" ADD CONSTRAINT "seller_trust_profile_seller_id_user_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispute_message" ADD CONSTRAINT "dispute_message_dispute_id_marketplace_dispute_id_fk" FOREIGN KEY ("dispute_id") REFERENCES "public"."marketplace_dispute"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dispute_message" ADD CONSTRAINT "dispute_message_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_dispute" ADD CONSTRAINT "marketplace_dispute_order_id_marketplace_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."marketplace_order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_dispute" ADD CONSTRAINT "marketplace_dispute_buyer_id_user_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_dispute" ADD CONSTRAINT "marketplace_dispute_seller_id_user_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_dispute" ADD CONSTRAINT "marketplace_dispute_moderator_id_user_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buyer_review" ADD CONSTRAINT "buyer_review_order_id_marketplace_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."marketplace_order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buyer_review" ADD CONSTRAINT "buyer_review_listing_id_marketplace_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."marketplace_listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buyer_review" ADD CONSTRAINT "buyer_review_buyer_id_user_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buyer_review" ADD CONSTRAINT "buyer_review_seller_id_user_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_delivery_order_id_idx" ON "order_delivery" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_delivery_seller_id_idx" ON "order_delivery" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "order_message_order_id_idx" ON "order_message" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_message_sender_id_idx" ON "order_message" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "order_message_created_idx" ON "order_message" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "order_revision_order_id_idx" ON "order_revision" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_buyer_id_idx" ON "marketplace_order" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "order_seller_id_idx" ON "marketplace_order" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "order_listing_id_idx" ON "marketplace_order" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "order_status_idx" ON "marketplace_order" USING btree ("status");--> statement-breakpoint
CREATE INDEX "order_number_idx" ON "marketplace_order" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "order_created_idx" ON "marketplace_order" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "transaction_order_id_idx" ON "marketplace_transaction" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "transaction_buyer_id_idx" ON "marketplace_transaction" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "transaction_seller_id_idx" ON "marketplace_transaction" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "transaction_type_idx" ON "marketplace_transaction" USING btree ("type");--> statement-breakpoint
CREATE INDEX "transaction_status_idx" ON "marketplace_transaction" USING btree ("status");--> statement-breakpoint
CREATE INDEX "itrader_order_id_idx" ON "itrader_feedback" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "itrader_from_user_id_idx" ON "itrader_feedback" USING btree ("from_user_id");--> statement-breakpoint
CREATE INDEX "itrader_to_user_id_idx" ON "itrader_feedback" USING btree ("to_user_id");--> statement-breakpoint
CREATE INDEX "itrader_rating_idx" ON "itrader_feedback" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "seller_trust_profile_seller_id_idx" ON "seller_trust_profile" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "seller_trust_profile_trust_score_idx" ON "seller_trust_profile" USING btree ("trust_score");--> statement-breakpoint
CREATE INDEX "seller_trust_profile_completed_orders_idx" ON "seller_trust_profile" USING btree ("completed_orders");--> statement-breakpoint
CREATE INDEX "dispute_message_dispute_id_idx" ON "dispute_message" USING btree ("dispute_id");--> statement-breakpoint
CREATE INDEX "dispute_message_sender_id_idx" ON "dispute_message" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "dispute_order_id_idx" ON "marketplace_dispute" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "dispute_buyer_id_idx" ON "marketplace_dispute" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "dispute_seller_id_idx" ON "marketplace_dispute" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "dispute_status_idx" ON "marketplace_dispute" USING btree ("status");--> statement-breakpoint
CREATE INDEX "buyer_review_order_id_idx" ON "buyer_review" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "buyer_review_listing_id_idx" ON "buyer_review" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "buyer_review_buyer_id_idx" ON "buyer_review" USING btree ("buyer_id");--> statement-breakpoint
CREATE INDEX "buyer_review_seller_id_idx" ON "buyer_review" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "buyer_review_rating_idx" ON "buyer_review" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "buyer_review_verified_idx" ON "buyer_review" USING btree ("is_verified_purchase");--> statement-breakpoint
ALTER TABLE "marketplace_submission" ADD CONSTRAINT "marketplace_submission_listing_id_marketplace_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."marketplace_listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_audit_log" ADD CONSTRAINT "marketplace_audit_log_listing_id_marketplace_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."marketplace_listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_flag" ADD CONSTRAINT "marketplace_flag_listing_id_marketplace_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."marketplace_listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "featured_listing" ADD CONSTRAINT "featured_listing_listing_id_marketplace_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."marketplace_listing"("id") ON DELETE cascade ON UPDATE no action;