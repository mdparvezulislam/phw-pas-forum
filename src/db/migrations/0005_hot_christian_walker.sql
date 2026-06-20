CREATE TABLE "seller_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"display_name" text,
	"bio" text,
	"banner_image" text,
	"avatar" text,
	"website" text,
	"telegram" text,
	"discord" text,
	"joined_marketplace_at" timestamp DEFAULT now(),
	"verification_status" text DEFAULT 'UNVERIFIED' NOT NULL,
	"total_sales" integer DEFAULT 0 NOT NULL,
	"total_reviews" integer DEFAULT 0 NOT NULL,
	"average_rating" integer DEFAULT 0 NOT NULL,
	"trust_score" integer DEFAULT 0 NOT NULL,
	"response_rate" integer DEFAULT 0 NOT NULL,
	"response_time" integer DEFAULT 0 NOT NULL,
	"completion_rate" integer DEFAULT 0 NOT NULL,
	"is_verified_seller" boolean DEFAULT false NOT NULL,
	"is_top_seller" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "seller_profile_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "marketplace_category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon" text,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "marketplace_category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "marketplace_listing" (
	"id" text PRIMARY KEY NOT NULL,
	"seller_id" text NOT NULL,
	"category_id" text NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"short_description" text NOT NULL,
	"description_json" jsonb,
	"listing_type" text NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"visibility" text DEFAULT 'PUBLIC' NOT NULL,
	"base_price" integer DEFAULT 0 NOT NULL,
	"delivery_days" integer DEFAULT 0 NOT NULL,
	"revisions" integer DEFAULT 0 NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"favorites" integer DEFAULT 0 NOT NULL,
	"sales" integer DEFAULT 0 NOT NULL,
	"rating" numeric(3, 2) DEFAULT '0' NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_media" (
	"id" text PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"attachment_id" text NOT NULL,
	"type" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_package" (
	"id" text PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" integer DEFAULT 0 NOT NULL,
	"delivery_days" integer DEFAULT 0 NOT NULL,
	"revisions" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_faq" (
	"id" text PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorite_listing" (
	"user_id" text NOT NULL,
	"listing_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "seller_profile" ADD CONSTRAINT "seller_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_listing" ADD CONSTRAINT "marketplace_listing_seller_id_seller_profile_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."seller_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_listing" ADD CONSTRAINT "marketplace_listing_category_id_marketplace_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."marketplace_category"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_media" ADD CONSTRAINT "listing_media_listing_id_marketplace_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."marketplace_listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_media" ADD CONSTRAINT "listing_media_attachment_id_attachment_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."attachment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_package" ADD CONSTRAINT "listing_package_listing_id_marketplace_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."marketplace_listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_faq" ADD CONSTRAINT "listing_faq_listing_id_marketplace_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."marketplace_listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_listing" ADD CONSTRAINT "favorite_listing_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_listing" ADD CONSTRAINT "favorite_listing_listing_id_marketplace_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."marketplace_listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "seller_profile_user_id_idx" ON "seller_profile" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "seller_profile_trust_score_idx" ON "seller_profile" USING btree ("trust_score");--> statement-breakpoint
CREATE INDEX "seller_profile_verification_status_idx" ON "seller_profile" USING btree ("verification_status");--> statement-breakpoint
CREATE INDEX "seller_profile_top_seller_idx" ON "seller_profile" USING btree ("is_top_seller");--> statement-breakpoint
CREATE INDEX "marketplace_category_position_idx" ON "marketplace_category" USING btree ("position");--> statement-breakpoint
CREATE UNIQUE INDEX "marketplace_listing_slug_unique" ON "marketplace_listing" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "marketplace_listing_seller_id_idx" ON "marketplace_listing" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "marketplace_listing_category_id_idx" ON "marketplace_listing" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "marketplace_listing_status_idx" ON "marketplace_listing" USING btree ("status");--> statement-breakpoint
CREATE INDEX "marketplace_listing_type_idx" ON "marketplace_listing" USING btree ("listing_type");--> statement-breakpoint
CREATE INDEX "marketplace_listing_visibility_idx" ON "marketplace_listing" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "marketplace_listing_featured_idx" ON "marketplace_listing" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "marketplace_listing_rating_idx" ON "marketplace_listing" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "marketplace_listing_created_idx" ON "marketplace_listing" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "listing_media_listing_id_idx" ON "listing_media" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "listing_media_attachment_id_idx" ON "listing_media" USING btree ("attachment_id");--> statement-breakpoint
CREATE INDEX "listing_media_type_idx" ON "listing_media" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "listing_media_listing_attachment_unique" ON "listing_media" USING btree ("listing_id","attachment_id");--> statement-breakpoint
CREATE INDEX "listing_package_listing_id_idx" ON "listing_package" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "listing_package_price_idx" ON "listing_package" USING btree ("price");--> statement-breakpoint
CREATE INDEX "listing_faq_listing_id_idx" ON "listing_faq" USING btree ("listing_id");--> statement-breakpoint
CREATE UNIQUE INDEX "favorite_listing_unique" ON "favorite_listing" USING btree ("user_id","listing_id");--> statement-breakpoint
CREATE INDEX "favorite_listing_user_id_idx" ON "favorite_listing" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "favorite_listing_listing_id_idx" ON "favorite_listing" USING btree ("listing_id");