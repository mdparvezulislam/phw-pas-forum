CREATE TABLE "feature_flag" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"enabled" boolean DEFAULT false NOT NULL,
	"is_kill_switch" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "feature_flag_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "moderator_note" (
	"id" text PRIMARY KEY NOT NULL,
	"target_user_id" text NOT NULL,
	"moderator_id" text NOT NULL,
	"note" text NOT NULL,
	"visibility" text DEFAULT 'STAFF_ONLY' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff_action_log" (
	"id" text PRIMARY KEY NOT NULL,
	"staff_id" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"metadata" jsonb,
	"ip_address" text,
	"is_automated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_setting" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"is_encrypted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "system_setting_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "user_ban" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"reason" text NOT NULL,
	"banned_by" text NOT NULL,
	"is_permanent" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"lifted_by" text,
	"lifted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_ban_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_warning" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"moderator_id" text NOT NULL,
	"reason" text NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp,
	"is_active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"description" text NOT NULL,
	"metadata" jsonb,
	"user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_cost_limit" (
	"id" text PRIMARY KEY NOT NULL,
	"target_type" text NOT NULL,
	"daily_limit_microcents" bigint NOT NULL,
	"monthly_limit_microcents" bigint NOT NULL,
	"current_daily_usage_microcents" bigint DEFAULT 0 NOT NULL,
	"current_monthly_usage_microcents" bigint DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ai_cost_limit_target_type_unique" UNIQUE("target_type")
);
--> statement-breakpoint
CREATE TABLE "ai_moderation_result" (
	"id" text PRIMARY KEY NOT NULL,
	"target_id" text NOT NULL,
	"target_type" text NOT NULL,
	"spam_score" integer NOT NULL,
	"scam_score" integer NOT NULL,
	"fraud_score" integer NOT NULL,
	"toxicity_score" integer NOT NULL,
	"trust_risk_score" integer NOT NULL,
	"marketplace_risk_score" integer NOT NULL,
	"decision" text NOT NULL,
	"explanation" text,
	"is_overridden" boolean DEFAULT false NOT NULL,
	"overridden_by" text,
	"overridden_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_prompt_template" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"system_prompt" text NOT NULL,
	"user_prompt_template" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"model_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ai_prompt_template_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "ai_usage_log" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"action_type" text NOT NULL,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"input_tokens" integer NOT NULL,
	"output_tokens" integer NOT NULL,
	"cost_microcents" bigint NOT NULL,
	"latency_ms" integer NOT NULL,
	"success" boolean NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "moderator_note" ADD CONSTRAINT "moderator_note_target_user_id_user_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderator_note" ADD CONSTRAINT "moderator_note_moderator_id_user_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_action_log" ADD CONSTRAINT "staff_action_log_staff_id_user_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_ban" ADD CONSTRAINT "user_ban_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_ban" ADD CONSTRAINT "user_ban_banned_by_user_id_fk" FOREIGN KEY ("banned_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_ban" ADD CONSTRAINT "user_ban_lifted_by_user_id_fk" FOREIGN KEY ("lifted_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_warning" ADD CONSTRAINT "user_warning_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_warning" ADD CONSTRAINT "user_warning_moderator_id_user_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_audit_log" ADD CONSTRAINT "ai_audit_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_moderation_result" ADD CONSTRAINT "ai_moderation_result_overridden_by_user_id_fk" FOREIGN KEY ("overridden_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage_log" ADD CONSTRAINT "ai_usage_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "feature_flag_key_idx" ON "feature_flag" USING btree ("key");--> statement-breakpoint
CREATE INDEX "feature_flag_enabled_idx" ON "feature_flag" USING btree ("enabled");--> statement-breakpoint
CREATE INDEX "mod_note_target_idx" ON "moderator_note" USING btree ("target_user_id");--> statement-breakpoint
CREATE INDEX "mod_note_moderator_idx" ON "moderator_note" USING btree ("moderator_id");--> statement-breakpoint
CREATE INDEX "staff_log_staff_idx" ON "staff_action_log" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "staff_log_action_idx" ON "staff_action_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "staff_log_entity_idx" ON "staff_action_log" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "staff_log_created_idx" ON "staff_action_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "setting_key_idx" ON "system_setting" USING btree ("key");--> statement-breakpoint
CREATE INDEX "setting_category_idx" ON "system_setting" USING btree ("category");--> statement-breakpoint
CREATE INDEX "user_ban_user_idx" ON "user_ban" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_ban_active_idx" ON "user_ban" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "user_warning_user_idx" ON "user_warning" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_warning_active_idx" ON "user_warning" USING btree ("is_active");