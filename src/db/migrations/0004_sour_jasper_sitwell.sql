CREATE TABLE "marketplace_submission" (
	"id" text PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"seller_id" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"price" integer DEFAULT 0 NOT NULL,
	"payment_details" text,
	"assigned_moderator_id" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "marketplace_review" (
	"id" text PRIMARY KEY NOT NULL,
	"submission_id" text NOT NULL,
	"moderator_id" text,
	"decision" text NOT NULL,
	"notes" text NOT NULL,
	"word_count" integer DEFAULT 0 NOT NULL,
	"media_count" integer DEFAULT 0 NOT NULL,
	"link_count" integer DEFAULT 0 NOT NULL,
	"external_url_count" integer DEFAULT 0 NOT NULL,
	"plagiarism_score" integer DEFAULT 0 NOT NULL,
	"risk_score" integer DEFAULT 0 NOT NULL,
	"compliance_score" integer DEFAULT 0 NOT NULL,
	"reviewed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seller_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"seller_id" text NOT NULL,
	"status" text DEFAULT 'UNVERIFIED' NOT NULL,
	"verification_level" text DEFAULT 'LEVEL_1' NOT NULL,
	"notes" text,
	"verified_by" text,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"moderator_id" text,
	"action" text NOT NULL,
	"previous_state" jsonb,
	"new_state" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_flag" (
	"id" text PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"user_id" text NOT NULL,
	"reason" text NOT NULL,
	"notes" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"resolved_by" text,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "featured_listing" (
	"listing_id" text PRIMARY KEY NOT NULL,
	"featured_until" timestamp NOT NULL,
	"featured_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "marketplace_submission" ADD CONSTRAINT "marketplace_submission_listing_id_thread_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."thread"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_submission" ADD CONSTRAINT "marketplace_submission_seller_id_user_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_submission" ADD CONSTRAINT "marketplace_submission_assigned_moderator_id_user_id_fk" FOREIGN KEY ("assigned_moderator_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_review" ADD CONSTRAINT "marketplace_review_submission_id_marketplace_submission_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."marketplace_submission"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_review" ADD CONSTRAINT "marketplace_review_moderator_id_user_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seller_verification" ADD CONSTRAINT "seller_verification_seller_id_user_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seller_verification" ADD CONSTRAINT "seller_verification_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_audit_log" ADD CONSTRAINT "marketplace_audit_log_listing_id_thread_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."thread"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_audit_log" ADD CONSTRAINT "marketplace_audit_log_moderator_id_user_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_flag" ADD CONSTRAINT "marketplace_flag_listing_id_thread_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."thread"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_flag" ADD CONSTRAINT "marketplace_flag_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_flag" ADD CONSTRAINT "marketplace_flag_resolved_by_user_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "featured_listing" ADD CONSTRAINT "featured_listing_listing_id_thread_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."thread"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "featured_listing" ADD CONSTRAINT "featured_listing_featured_by_user_id_fk" FOREIGN KEY ("featured_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;