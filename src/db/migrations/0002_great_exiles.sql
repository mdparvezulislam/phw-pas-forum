CREATE TABLE "conversation" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text,
	"type" text DEFAULT 'PRIVATE' NOT NULL,
	"created_by" text NOT NULL,
	"participant_count" integer DEFAULT 0 NOT NULL,
	"last_message_id" text,
	"last_activity_at" timestamp DEFAULT now() NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation_participant" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"user_id" text NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"last_read_message_id" text,
	"is_muted" boolean DEFAULT false NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"is_left" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation_message" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"content_json" jsonb NOT NULL,
	"has_attachments" boolean DEFAULT false NOT NULL,
	"is_edited" boolean DEFAULT false NOT NULL,
	"edited_at" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation_message_edit_history" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"previous_content_json" jsonb NOT NULL,
	"edited_by" text NOT NULL,
	"edited_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation_attachment" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"attachment_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_read_receipt" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"user_id" text NOT NULL,
	"read_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participant" ADD CONSTRAINT "conversation_participant_conversation_id_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participant" ADD CONSTRAINT "conversation_participant_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_message" ADD CONSTRAINT "conversation_message_conversation_id_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_message" ADD CONSTRAINT "conversation_message_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_message_edit_history" ADD CONSTRAINT "conversation_message_edit_history_message_id_conversation_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."conversation_message"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_message_edit_history" ADD CONSTRAINT "conversation_message_edit_history_edited_by_user_id_fk" FOREIGN KEY ("edited_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_attachment" ADD CONSTRAINT "conversation_attachment_message_id_conversation_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."conversation_message"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_attachment" ADD CONSTRAINT "conversation_attachment_attachment_id_attachment_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."attachment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_read_receipt" ADD CONSTRAINT "message_read_receipt_message_id_conversation_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."conversation_message"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_read_receipt" ADD CONSTRAINT "message_read_receipt_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "conversation_last_activity_idx" ON "conversation" USING btree ("last_activity_at");--> statement-breakpoint
CREATE INDEX "conversation_created_by_idx" ON "conversation" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "participant_conversation_idx" ON "conversation_participant" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "participant_user_idx" ON "conversation_participant" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "participant_user_archive_idx" ON "conversation_participant" USING btree ("user_id","is_archived");--> statement-breakpoint
CREATE INDEX "message_conversation_idx" ON "conversation_message" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "message_sender_idx" ON "conversation_message" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "message_created_at_idx" ON "conversation_message" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "msg_edit_message_idx" ON "conversation_message_edit_history" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "msg_edit_editor_idx" ON "conversation_message_edit_history" USING btree ("edited_by");--> statement-breakpoint
CREATE INDEX "conv_att_message_idx" ON "conversation_attachment" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "conv_att_attachment_idx" ON "conversation_attachment" USING btree ("attachment_id");--> statement-breakpoint
CREATE INDEX "read_receipt_message_idx" ON "message_read_receipt" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "read_receipt_user_idx" ON "message_read_receipt" USING btree ("user_id");