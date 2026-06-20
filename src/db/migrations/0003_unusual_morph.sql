CREATE TABLE "search_index_job" (
	"id" text PRIMARY KEY NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"action" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "search_history" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"query" text NOT NULL,
	"searched_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_query" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"query" text NOT NULL,
	"filters" jsonb,
	"result_count" integer DEFAULT 0 NOT NULL,
	"searched_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "search_history" ADD CONSTRAINT "search_history_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_query" ADD CONSTRAINT "search_query_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "search_index_job_status_idx" ON "search_index_job" USING btree ("status");--> statement-breakpoint
CREATE INDEX "search_index_job_entity_idx" ON "search_index_job" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "search_history_user_idx" ON "search_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "search_history_searched_at_idx" ON "search_history" USING btree ("searched_at");--> statement-breakpoint
CREATE INDEX "search_query_text_idx" ON "search_query" USING btree ("query");--> statement-breakpoint
CREATE INDEX "search_query_searched_at_idx" ON "search_query" USING btree ("searched_at");